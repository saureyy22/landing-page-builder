import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { undoAction, redoAction } from '../store/actions/historyActions';

export const useKeyboardShortcuts = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Z (Undo)
      if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        dispatch(undoAction());
      }
      
      // Check for Ctrl+Y or Ctrl+Shift+Z (Redo)
      if ((event.ctrlKey && event.key === 'y') || 
          (event.ctrlKey && event.shiftKey && event.key === 'Z')) {
        event.preventDefault();
        dispatch(redoAction());
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch]);
};

export default useKeyboardShortcuts;