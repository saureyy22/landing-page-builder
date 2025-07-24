// Preview service for handling preview URL generation and deployment connectivity

export interface PreviewConfig {
  baseUrl: string;
  isProduction: boolean;
  deploymentStatus: 'available' | 'unavailable' | 'unknown';
}

export interface PreviewOptions {
  slug: string;
  hasUnsavedChanges: boolean;
  entryId?: string;
}

export class PreviewService {
  private config: PreviewConfig;

  constructor() {
    // Use import.meta.env for Vite-based apps
    const previewUrl = import.meta.env.REACT_APP_PREVIEW_URL || 
                      process.env.REACT_APP_PREVIEW_URL || 
                      'https://landing-page-builder-landing-pages.vercel.app';
    
    const nodeEnv = import.meta.env.NODE_ENV || 
                   process.env.NODE_ENV || 
                   'development';

    this.config = {
      baseUrl: previewUrl,
      isProduction: nodeEnv === 'production',
      deploymentStatus: 'unknown',
    };
    
    console.log('Preview service initialized with URL:', this.config.baseUrl);
  }

  // Check if the preview deployment is available
  async checkDeploymentStatus(): Promise<'available' | 'unavailable' | 'unknown'> {
    try {
      // Check the root URL since there's no health endpoint
      const rootUrl = this.config.baseUrl;

      const response = await fetch(rootUrl, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      this.config.deploymentStatus = 'available';
      return 'available';
    } catch (error) {
      console.warn('Failed to check deployment status:', error);
      this.config.deploymentStatus = 'unavailable';
      return 'unavailable';
    }
  }

  // Generate preview URL with appropriate parameters
  generatePreviewUrl(options: PreviewOptions): string {
    const { slug, hasUnsavedChanges, entryId } = options;
    const previewUrl = `${this.config.baseUrl}/landing/${slug}`;

    // Build query parameters
    const params = new URLSearchParams();

    // Cache busting timestamp
    params.set('t', Date.now().toString());

    // Preview mode indicators
    if (hasUnsavedChanges) {
      params.set('preview', 'unsaved');
    }

    // Development mode indicator
    if (!this.config.isProduction) {
      params.set('dev', 'true');
    }

    // Entry ID for debugging
    if (entryId) {
      params.set('entryId', entryId);
    }

    // Deployment status for debugging
    params.set('deploymentStatus', this.config.deploymentStatus);

    return `${previewUrl}?${params.toString()}`;
  }

  // Get user-friendly deployment status message
  getDeploymentStatusMessage(): string {
    switch (this.config.deploymentStatus) {
      case 'available':
        return 'Preview deployment is available';
      case 'unavailable':
        return 'Preview deployment is not available. Please check your deployment status.';
      case 'unknown':
      default:
        return 'Preview deployment status is unknown';
    }
  }

  // Get preview configuration
  getConfig(): PreviewConfig {
    return { ...this.config };
  }

  // Update base URL (useful for switching between environments)
  updateBaseUrl(newBaseUrl: string): void {
    this.config.baseUrl = newBaseUrl;
    this.config.deploymentStatus = 'unknown'; // Reset status when URL changes
  }
}

// Singleton instance
export const previewService = new PreviewService();

// Helper function to open preview with proper error handling
export const openPreviewWindow = (url: string): Window | null => {
  try {
    // Try to open the window
    const previewWindow = window.open(
      url,
      'contentful_preview',
      'noopener,noreferrer,width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no'
    );

    // Check if window was blocked
    if (!previewWindow || previewWindow.closed || typeof previewWindow.closed === 'undefined') {
      throw new Error('Preview window was blocked by popup blocker');
    }

    // Focus the new window
    previewWindow.focus();

    return previewWindow;
  } catch (error) {
    console.error('Failed to open preview window:', error);
    throw error;
  }
};

// Helper function to validate preview URL
export const validatePreviewUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (error) {
    return false;
  }
};