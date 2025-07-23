import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { contentfulService, getServiceStatus } from '../lib/contentfulService';
import { setSaveError, clearSaveError } from '../store/slices/uiSlice';

interface UseContentfulServiceOptions {
  entryId?: string;
  autoInitialize?: boolean;
}

interface ContentfulServiceStatus {
  isAuthenticated: boolean;
  hasEntryId: boolean;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useContentfulService = (options: UseContentfulServiceOptions = {}) => {
  const { entryId, autoInitialize = true } = options;
  const dispatch = useDispatch();
  
  const [status, setStatus] = useState<ContentfulServiceStatus>({
    isAuthenticated: false,
    hasEntryId: false,
    isReady: false,
    isLoading: true,
    error: null,
  });

  // Initialize service
  const initializeService = async (targetEntryId?: string) => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));
      dispatch(clearSaveError());

      // Set entry ID if provided
      if (targetEntryId) {
        contentfulService.setCurrentEntryId(targetEntryId);
      }

      // Check service status
      const serviceStatus = await getServiceStatus();
      
      setStatus({
        ...serviceStatus,
        isLoading: false,
        error: null,
      });

      // Clear any previous errors if service is ready
      if (serviceStatus.isReady) {
        dispatch(clearSaveError());
      } else {
        // Set appropriate error message
        let errorMessage = 'Service not ready';
        if (!serviceStatus.isAuthenticated) {
          errorMessage = 'Authentication failed - check your API token';
        } else if (!serviceStatus.hasEntryId) {
          errorMessage = 'No entry ID configured';
        }
        
        setStatus(prev => ({ ...prev, error: errorMessage }));
        dispatch(setSaveError(errorMessage));
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to initialize Contentful service';
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      dispatch(setSaveError(errorMessage));
    }
  };

  // Check authentication status
  const checkAuthentication = async () => {
    try {
      const isAuthenticated = await contentfulService.checkAuthentication();
      setStatus(prev => ({ 
        ...prev, 
        isAuthenticated,
        isReady: isAuthenticated && prev.hasEntryId,
      }));
      return isAuthenticated;
    } catch (error: any) {
      const errorMessage = 'Authentication check failed';
      setStatus(prev => ({ ...prev, error: errorMessage }));
      dispatch(setSaveError(errorMessage));
      return false;
    }
  };

  // Set entry ID
  const setEntryId = (newEntryId: string) => {
    contentfulService.setCurrentEntryId(newEntryId);
    setStatus(prev => ({
      ...prev,
      hasEntryId: true,
      isReady: prev.isAuthenticated,
    }));
  };

  // Get current entry ID
  const getCurrentEntryId = () => {
    return contentfulService.getCurrentEntryId();
  };

  // Manual save function
  const manualSave = async () => {
    // This will be handled by the auto-save middleware
    // We just need to dispatch the trigger action
    dispatch({ type: 'ui/triggerManualSave' });
  };

  // Load layout from Contentful
  const loadLayout = async () => {
    try {
      const layoutConfig = await contentfulService.loadLayoutConfig();
      return layoutConfig;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load layout';
      dispatch(setSaveError(errorMessage));
      throw error;
    }
  };

  // Get full entry data including slug
  const getEntryData = async () => {
    try {
      const entryData = await contentfulService.getEntryData();
      return entryData;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get entry data';
      dispatch(setSaveError(errorMessage));
      throw error;
    }
  };

  // Auto-initialize on mount
  useEffect(() => {
    if (autoInitialize) {
      initializeService(entryId);
    }
  }, [entryId, autoInitialize]);

  return {
    status,
    initializeService,
    checkAuthentication,
    setEntryId,
    getCurrentEntryId,
    manualSave,
    loadLayout,
    getEntryData,
  };
};

// Hook specifically for getting entry ID from URL or Contentful App context
export const useContentfulAppContext = () => {
  const [entryId, setEntryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real Contentful App, you would get this from the Contentful App SDK
    // For now, we'll check URL parameters or use a default
    const getEntryIdFromContext = () => {
      try {
        // Check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const urlEntryId = urlParams.get('entryId');
        
        if (urlEntryId) {
          return urlEntryId;
        }

        // Check if running in Contentful App context
        // In a real app, you would use: window.contentfulExtension?.entry?.getSys().id
        
        // For development, use a default entry ID or get from localStorage
        const storedEntryId = localStorage.getItem('contentful-entry-id');
        if (storedEntryId) {
          return storedEntryId;
        }

        // For development, try to get a valid entry ID or return null
        // This will prevent 404 errors with non-existent entries
        return null;
      } catch (error) {
        console.error('Error getting entry ID from context:', error);
        return null;
      }
    };

    const contextEntryId = getEntryIdFromContext();
    setEntryId(contextEntryId);
    setIsLoading(false);

    // Store entry ID for future use
    if (contextEntryId) {
      localStorage.setItem('contentful-entry-id', contextEntryId);
    }
  }, []);

  return {
    entryId,
    isLoading,
    setEntryId: (newEntryId: string) => {
      setEntryId(newEntryId);
      localStorage.setItem('contentful-entry-id', newEntryId);
    },
  };
};