import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/types';
import { setComponents } from '../store/slices/layoutSlice';
import { clearSaveError } from '../store/slices/uiSlice';
import { contentfulService } from '../lib/contentfulService';
import './SaveConflictDialog.css';

interface SaveConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SaveConflictDialog: React.FC<SaveConflictDialogProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { saveError } = useSelector((state: RootState) => state.ui);
  const { components } = useSelector((state: RootState) => state.layout);
  
  const [isLoading, setIsLoading] = useState(false);
  const [resolution, setResolution] = useState<'overwrite' | 'reload' | null>(null);

  const isConflictError = saveError?.includes('conflict') || saveError?.includes('version');

  const handleOverwrite = async () => {
    setIsLoading(true);
    try {
      // Force save by creating a new layout config
      const layoutConfig = {
        components,
        version: '1.0.0',
        lastModified: new Date().toISOString(),
      };
      
      const result = await contentfulService.saveLayoutConfig(layoutConfig);
      
      if (result.success) {
        dispatch(clearSaveError());
        onClose();
      } else {
        // If still failing, show the error
        console.error('Force save failed:', result.error);
      }
    } catch (error) {
      console.error('Error during force save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReload = async () => {
    setIsLoading(true);
    try {
      // Load the latest version from Contentful
      const latestConfig = await contentfulService.loadLayoutConfig();
      
      if (latestConfig) {
        dispatch(setComponents(latestConfig.components));
        dispatch(clearSaveError());
        onClose();
      }
    } catch (error) {
      console.error('Error reloading layout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    dispatch(clearSaveError());
    onClose();
  };

  if (!isOpen || !isConflictError) {
    return null;
  }

  return (
    <div className="save-conflict-dialog-overlay">
      <div className="save-conflict-dialog">
        <div className="save-conflict-dialog__header">
          <h3>Save Conflict Detected</h3>
        </div>
        
        <div className="save-conflict-dialog__content">
          <p>
            The landing page has been modified by another user since you started editing. 
            You need to choose how to resolve this conflict:
          </p>
          
          <div className="save-conflict-dialog__options">
            <label className="save-conflict-dialog__option">
              <input
                type="radio"
                name="resolution"
                value="overwrite"
                checked={resolution === 'overwrite'}
                onChange={() => setResolution('overwrite')}
              />
              <div className="save-conflict-dialog__option-content">
                <strong>Overwrite with my changes</strong>
                <p>Replace the current version with your changes. This will discard any changes made by others.</p>
              </div>
            </label>
            
            <label className="save-conflict-dialog__option">
              <input
                type="radio"
                name="resolution"
                value="reload"
                checked={resolution === 'reload'}
                onChange={() => setResolution('reload')}
              />
              <div className="save-conflict-dialog__option-content">
                <strong>Load the latest version</strong>
                <p>Discard your changes and load the latest version from Contentful.</p>
              </div>
            </label>
          </div>
        </div>
        
        <div className="save-conflict-dialog__actions">
          <button
            className="save-conflict-dialog__button save-conflict-dialog__button--secondary"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          
          <button
            className="save-conflict-dialog__button save-conflict-dialog__button--primary"
            onClick={resolution === 'overwrite' ? handleOverwrite : handleReload}
            disabled={!resolution || isLoading}
          >
            {isLoading ? 'Processing...' : resolution === 'overwrite' ? 'Overwrite' : 'Reload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveConflictDialog;