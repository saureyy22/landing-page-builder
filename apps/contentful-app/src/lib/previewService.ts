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
    this.config = {
      baseUrl: process.env.REACT_APP_PREVIEW_URL || 'http://localhost:3001',
      isProduction: process.env.NODE_ENV === 'production',
      deploymentStatus: 'unknown',
    };
  }

  // Check if the preview deployment is available
  async checkDeploymentStatus(): Promise<'available' | 'unavailable' | 'unknown'> {
    try {
      // Try to fetch the health check endpoint or root page
      const healthCheckUrl = `${this.config.baseUrl}/api/health`;
      const rootUrl = this.config.baseUrl;

      // First try health check endpoint
      try {
        const response = await fetch(healthCheckUrl, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });
        this.config.deploymentStatus = 'available';
        return 'available';
      } catch (healthError) {
        // If health check fails, try root URL
        try {
          const response = await fetch(rootUrl, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: AbortSignal.timeout(5000),
          });
          this.config.deploymentStatus = 'available';
          return 'available';
        } catch (rootError) {
          this.config.deploymentStatus = 'unavailable';
          return 'unavailable';
        }
      }
    } catch (error) {
      console.warn('Failed to check deployment status:', error);
      this.config.deploymentStatus = 'unknown';
      return 'unknown';
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
    const previewWindow = window.open(
      url,
      '_blank',
      'noopener,noreferrer,width=1200,height=800,scrollbars=yes,resizable=yes'
    );
    
    if (!previewWindow) {
      throw new Error('Preview window was blocked by popup blocker');
    }
    
    return previewWindow;
  } catch (error) {
    console.error('Failed to open preview window:', error);
    return null;
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