import { LayoutConfig } from '@contentful-landing-page-builder/shared';
import { 
  updateLandingPageEntryWithRetry, 
  getLandingPageEntry,
  getOrCreateLandingPageEntry,
  validateAuthentication,
  ContentfulAPIError,
  ContentfulAuthError,
  ContentfulConfigError
} from './contentful';

// Service status types
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface SaveResult {
  success: boolean;
  error?: string;
  timestamp: string;
}

// Service class for managing Contentful operations
export class ContentfulService {
  private currentEntryId: string | null = null;
  private isAuthenticated: boolean = false;

  constructor() {
    this.initializeService();
  }

  // Initialize the service and validate authentication
  private async initializeService(): Promise<void> {
    try {
      this.isAuthenticated = await validateAuthentication();
      if (!this.isAuthenticated) {
        console.warn('Contentful authentication failed during service initialization');
      }
    } catch (error) {
      console.error('Failed to initialize Contentful service:', error);
      this.isAuthenticated = false;
    }
  }

  // Set the current entry ID for operations
  setCurrentEntryId(entryId: string): void {
    this.currentEntryId = entryId;
  }

  // Get the current entry ID
  getCurrentEntryId(): string | null {
    return this.currentEntryId;
  }

  // Check if the service is ready for operations
  isReady(): boolean {
    return this.isAuthenticated && this.currentEntryId !== null;
  }

  // Validate authentication status
  async checkAuthentication(): Promise<boolean> {
    try {
      this.isAuthenticated = await validateAuthentication();
      return this.isAuthenticated;
    } catch (error) {
      console.error('Authentication check failed:', error);
      this.isAuthenticated = false;
      return false;
    }
  }

  // Save layout configuration to Contentful
  async saveLayoutConfig(layoutConfig: LayoutConfig): Promise<SaveResult> {
    const timestamp = new Date().toISOString();

    try {
      // Validate service readiness
      if (!this.isReady()) {
        if (!this.isAuthenticated) {
          throw new ContentfulAuthError('Not authenticated with Contentful');
        }
        if (!this.currentEntryId) {
          // For development mode, just return success without saving
          console.warn('No entry ID available - skipping save in development mode');
          return {
            success: true,
            timestamp,
          };
        }
      }

      // Ensure entry exists before attempting to save
      await getOrCreateLandingPageEntry(this.currentEntryId!, {
        title: `Landing Page ${this.currentEntryId}`,
        slug: this.currentEntryId!,
        layoutConfig: {
          components: [],
          lastModified: new Date().toISOString()
        }
      });

      // Attempt to save with retry logic
      await updateLandingPageEntryWithRetry(this.currentEntryId!, layoutConfig);

      return {
        success: true,
        timestamp,
      };
    } catch (error: any) {
      console.error('Failed to save layout config:', error);

      let errorMessage = 'Unknown error occurred while saving';

      if (error instanceof ContentfulAuthError) {
        errorMessage = 'Authentication failed - please check your API token';
      } else if (error instanceof ContentfulConfigError) {
        errorMessage = 'Configuration error - please check your setup';
      } else if (error instanceof ContentfulAPIError) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
        timestamp,
      };
    }
  }

  // Load layout configuration from Contentful
  async loadLayoutConfig(): Promise<LayoutConfig | null> {
    try {
      if (!this.isReady()) {
        throw new ContentfulConfigError('Service not ready for loading');
      }

      const entry = await getLandingPageEntry(this.currentEntryId!);
      
      // Extract layout config from entry
      const layoutConfig = entry.fields.layoutConfig?.['en-US'];
      
      if (!layoutConfig) {
        console.warn('No layout configuration found in entry');
        return null;
      }

      return layoutConfig as LayoutConfig;
    } catch (error) {
      console.error('Failed to load layout config:', error);
      throw error;
    }
  }

  // Get full entry data including slug and other fields
  async getEntryData(): Promise<any | null> {
    try {
      if (!this.isReady()) {
        throw new ContentfulConfigError('Service not ready for loading');
      }

      // Use getOrCreateLandingPageEntry to handle missing entries
      const entry = await getOrCreateLandingPageEntry(this.currentEntryId!, {
        title: `Landing Page ${this.currentEntryId}`,
        slug: this.currentEntryId!,
        layoutConfig: {
          components: [],
          lastModified: new Date().toISOString()
        }
      });
      return entry;
    } catch (error) {
      console.error('Failed to get entry data:', error);
      throw error;
    }
  }

  // Get entry metadata (for conflict detection)
  async getEntryMetadata(): Promise<{ version: number; updatedAt: string } | null> {
    try {
      if (!this.isReady()) {
        return null;
      }

      const entry = await getLandingPageEntry(this.currentEntryId!);
      
      return {
        version: entry.sys.version,
        updatedAt: entry.sys.updatedAt,
      };
    } catch (error) {
      console.error('Failed to get entry metadata:', error);
      return null;
    }
  }

  // Check if entry has been modified externally
  async hasExternalChanges(lastKnownVersion: number): Promise<boolean> {
    try {
      const metadata = await this.getEntryMetadata();
      if (!metadata) {
        return false;
      }
      
      return metadata.version > lastKnownVersion;
    } catch (error) {
      console.error('Failed to check for external changes:', error);
      return false;
    }
  }
}

// Singleton instance for use throughout the app
export const contentfulService = new ContentfulService();

// Helper function to initialize the service with entry ID
export const initializeContentfulService = (entryId: string): void => {
  contentfulService.setCurrentEntryId(entryId);
};

// Helper function to get service status
export const getServiceStatus = async (): Promise<{
  isAuthenticated: boolean;
  hasEntryId: boolean;
  isReady: boolean;
}> => {
  const isAuthenticated = await contentfulService.checkAuthentication();
  const hasEntryId = contentfulService.getCurrentEntryId() !== null;
  const isReady = contentfulService.isReady();

  return {
    isAuthenticated,
    hasEntryId,
    isReady,
  };
};