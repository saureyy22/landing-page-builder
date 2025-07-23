import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/types';
import { triggerManualSave } from '../store/middleware/autoSaveMiddleware';
import { clearSaveError } from '../store/slices/uiSlice';

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

export const useNetworkStatus = () => {
  const dispatch = useDispatch();
  const { saveError } = useSelector((state: RootState) => state.ui);
  const { isDirty } = useSelector((state: RootState) => state.layout);
  
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    wasOffline: false,
  });

  useEffect(() => {
    const handleOnline = () => {
      console.log('Network connection restored');
      
      setNetworkStatus(prev => ({
        isOnline: true,
        wasOffline: prev.wasOffline || !prev.isOnline,
      }));

      // If we were offline and have unsaved changes or network-related errors, try to save
      if (networkStatus.wasOffline && (isDirty || isNetworkError(saveError))) {
        console.log('Attempting to save after network restoration');
        dispatch(clearSaveError());
        
        // Delay the save attempt slightly to ensure connection is stable
        setTimeout(() => {
          dispatch(triggerManualSave());
        }, 1000);
      }
    };

    const handleOffline = () => {
      console.log('Network connection lost');
      
      setNetworkStatus(prev => ({
        isOnline: false,
        wasOffline: true,
      }));
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch, isDirty, saveError, networkStatus.wasOffline]);

  return networkStatus;
};

// Helper function to check if an error is network-related
const isNetworkError = (error: string | null): boolean => {
  if (!error) return false;
  
  return (
    error.includes('network') ||
    error.includes('connection') ||
    error.includes('fetch') ||
    error.includes('offline')
  );
};