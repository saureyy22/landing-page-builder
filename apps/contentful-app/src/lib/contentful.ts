import { createClient, Environment, Space } from 'contentful-management';
import { LayoutConfig } from '@contentful-landing-page-builder/shared';

// Custom error types for better error handling
export class ContentfulConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentfulConfigError';
  }
}

export class ContentfulAPIError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'ContentfulAPIError';
  }
}

export class ContentfulAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentfulAuthError';
  }
}

// Environment variables validation
const requiredEnvVars = {
  spaceId: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_MANAGEMENT_TOKEN,
  environment: import.meta.env.VITE_CONTENTFUL_ENVIRONMENT || 'master',
};

// Validate required environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new ContentfulConfigError(
      `Missing required environment variable: VITE_CONTENTFUL_${key.toUpperCase()}`
    );
  }
});

// Create Contentful Management API client
export const contentfulManagementClient = createClient({
  accessToken: requiredEnvVars.accessToken!,
});

// Configuration object for easy access
export const contentfulConfig = {
  spaceId: requiredEnvVars.spaceId!,
  environment: requiredEnvVars.environment!,
};

// Cache for space and environment to avoid repeated API calls
let cachedSpaceEnvironment: { space: Space; environment: Environment } | null = null;

// Helper function to get space and environment with caching
export const getSpaceEnvironment = async (): Promise<{ space: Space; environment: Environment }> => {
  if (cachedSpaceEnvironment) {
    return cachedSpaceEnvironment;
  }

  try {
    const space = await contentfulManagementClient.getSpace(contentfulConfig.spaceId);
    const environment = await space.getEnvironment(contentfulConfig.environment);

    cachedSpaceEnvironment = { space, environment };
    return cachedSpaceEnvironment;
  } catch (error: any) {
    if (error.status === 401) {
      throw new ContentfulAuthError('Invalid Contentful Management API token');
    }
    if (error.status === 404) {
      throw new ContentfulAPIError(`Space or environment not found: ${contentfulConfig.spaceId}/${contentfulConfig.environment}`);
    }
    throw new ContentfulAPIError('Failed to connect to Contentful', error);
  }
};

// Helper function to validate authentication
export const validateAuthentication = async (): Promise<boolean> => {
  try {
    await getSpaceEnvironment();
    return true;
  } catch (error) {
    console.error('Authentication validation failed:', error);
    return false;
  }
};

// Helper function to update landing page entry with enhanced error handling
export const updateLandingPageEntry = async (
  entryId: string,
  layoutConfig: LayoutConfig
): Promise<any> => {
  try {
    const { environment } = await getSpaceEnvironment();

    // Get the entry
    const entry = await environment.getEntry(entryId);

    // Update the layoutConfig field
    entry.fields.layoutConfig = {
      'en-US': {
        ...layoutConfig,
        lastModified: new Date().toISOString(),
      }
    };

    // Update the entry
    const updatedEntry = await entry.update();

    // Publish the entry
    const publishedEntry = await updatedEntry.publish();

    return publishedEntry;
  } catch (error: any) {
    console.error('Error updating landing page entry:', error);

    if (error.status === 404) {
      throw new ContentfulAPIError(`Landing page entry not found: ${entryId}`);
    }
    if (error.status === 422) {
      throw new ContentfulAPIError('Invalid data provided for landing page update');
    }
    if (error.status === 409) {
      throw new ContentfulAPIError('Entry version conflict - entry was modified by another user');
    }

    throw new ContentfulAPIError('Failed to update landing page entry', error);
  }
};

// Helper function to get landing page entry with enhanced error handling
export const getLandingPageEntry = async (entryId: string): Promise<any> => {
  try {
    const { environment } = await getSpaceEnvironment();
    const entry = await environment.getEntry(entryId);
    return entry;
  } catch (error: any) {
    console.error('Error fetching landing page entry:', error);

    if (error.status === 404) {
      throw new ContentfulAPIError(`Landing page entry not found: ${entryId}`);
    }

    throw new ContentfulAPIError('Failed to fetch landing page entry', error);
  }
};

// Helper function to retry operations with exponential backoff
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Don't retry on authentication or client errors
      if (error instanceof ContentfulAuthError ||
        error instanceof ContentfulConfigError ||
        error.status === 400 ||
        error.status === 401 ||
        error.status === 403 ||
        error.status === 404) {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// Enhanced update function with retry logic
export const updateLandingPageEntryWithRetry = async (
  entryId: string,
  layoutConfig: LayoutConfig
): Promise<any> => {
  return retryOperation(() => updateLandingPageEntry(entryId, layoutConfig));
};

// Helper function to check if entry exists
export const entryExists = async (entryId: string): Promise<boolean> => {
  try {
    await getLandingPageEntry(entryId);
    return true;
  } catch (error) {
    if (error instanceof ContentfulAPIError && error.message.includes('not found')) {
      return false;
    }
    throw error;
  }
};

// Helper function to get current entry version (for conflict detection)
export const getEntryVersion = async (entryId: string): Promise<number> => {
  try {
    const entry = await getLandingPageEntry(entryId);
    return entry.sys.version;
  } catch (error) {
    throw new ContentfulAPIError('Failed to get entry version', error);
  }
};