import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../types';
import { setSaveStatus, setSaveError, setSaveSuccess } from '../slices/uiSlice';
import { markSaved } from '../slices/layoutSlice';
import { contentfulService } from '../../lib/contentfulService';
import { LayoutConfig } from '@contentful-landing-page-builder/shared';

// Debounce timeout reference
let saveTimeout: NodeJS.Timeout | null = null;

// Auto-save delay in milliseconds (1.5 seconds)
const AUTO_SAVE_DELAY = 1500;

// Actions that should trigger auto-save
const LAYOUT_ACTIONS = [
  'layout/addComponent',
  'layout/removeComponent',
  'layout/updateComponent',
  'layout/reorderComponents',
];

// Helper function to create layout config from current state
const createLayoutConfigFromState = (state: RootState): LayoutConfig => {
  return {
    components: state.layout.components,
    version: '1.0.0',
    lastModified: new Date().toISOString(),
  };
};

// Network error detection
const isNetworkError = (error: any): boolean => {
  return (
    error.code === 'NETWORK_ERROR' ||
    error.message?.includes('network') ||
    error.message?.includes('fetch') ||
    error.name === 'NetworkError' ||
    !navigator.onLine
  );
};

// Conflict error detection
const isConflictError = (error: any): boolean => {
  return (
    error.status === 409 ||
    error.message?.includes('conflict') ||
    error.message?.includes('version')
  );
};

// Helper function to perform the actual save operation with enhanced error handling
const performSave = async (dispatch: any, getState: () => RootState): Promise<void> => {
  const state = getState();
  
  // Don't save if already saving or if there are no changes
  if (state.ui.saveStatus === 'saving' || !state.layout.isDirty) {
    return;
  }

  // Check if service is ready
  if (!contentfulService.isReady()) {
    console.warn('Contentful service not ready for auto-save');
    dispatch(setSaveError('Service not ready - please check configuration'));
    return;
  }

  // Check network connectivity
  if (!navigator.onLine) {
    console.warn('No network connection - skipping auto-save');
    dispatch(setSaveError('No network connection - changes will be saved when connection is restored'));
    return;
  }

  try {
    // Set saving status
    dispatch(setSaveStatus('saving'));

    // Create layout config from current state
    const layoutConfig = createLayoutConfigFromState(state);

    // Attempt to save with retry logic for network errors
    let result;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount <= maxRetries) {
      try {
        result = await contentfulService.saveLayoutConfig(layoutConfig);
        break; // Success, exit retry loop
      } catch (error: any) {
        if (isNetworkError(error) && retryCount < maxRetries) {
          retryCount++;
          console.log(`Network error during save, retrying (${retryCount}/${maxRetries})...`);
          
          // Exponential backoff delay
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If it's not a network error or we've exhausted retries, throw the error
        throw error;
      }
    }

    if (result && result.success) {
      // Mark as saved in both UI and layout slices
      dispatch(setSaveSuccess());
      dispatch(markSaved());
      console.log('Auto-save successful at', result.timestamp);
    } else {
      // Handle save error
      const errorMessage = result?.error || 'Unknown save error';
      
      if (isConflictError({ message: errorMessage })) {
        dispatch(setSaveError(`Save conflict: ${errorMessage}`));
      } else {
        dispatch(setSaveError(errorMessage));
      }
      
      console.error('Auto-save failed:', errorMessage);
    }
  } catch (error: any) {
    // Handle unexpected errors with enhanced error categorization
    let errorMessage = 'Unexpected error during auto-save';
    
    if (isNetworkError(error)) {
      errorMessage = 'Network error - changes will be saved when connection is restored';
    } else if (isConflictError(error)) {
      errorMessage = `Save conflict: ${error.message || 'Entry was modified by another user'}`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    dispatch(setSaveError(errorMessage));
    console.error('Auto-save error:', error);
  }
};

// Auto-save middleware
const autoSaveMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  // Process the action first
  const result = next(action);

  // Check if this action should trigger auto-save
  if (LAYOUT_ACTIONS.includes(action.type)) {
    // Clear any existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set new timeout for auto-save
    saveTimeout = setTimeout(() => {
      performSave(store.dispatch, store.getState);
    }, AUTO_SAVE_DELAY);
  }

  // Handle manual save action
  if (action.type === 'ui/triggerManualSave') {
    // Clear auto-save timeout since we're saving manually
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    
    // Perform immediate save
    performSave(store.dispatch, store.getState);
  }

  return result;
};

export default autoSaveMiddleware;

// Helper function to trigger manual save (can be dispatched as action)
export const triggerManualSave = () => ({
  type: 'ui/triggerManualSave' as const,
});

// Helper function to cancel pending auto-save
export const cancelAutoSave = (): void => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
};

// Helper function to check if auto-save is pending
export const isAutoSavePending = (): boolean => {
  return saveTimeout !== null;
};