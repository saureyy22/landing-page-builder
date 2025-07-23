import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/types';
import { triggerManualSave } from '../store/middleware/autoSaveMiddleware';
import './ManualSaveButton.css';

const ManualSaveButton: React.FC = () => {
  const dispatch = useDispatch();
  const { saveStatus, saveError } = useSelector((state: RootState) => state.ui);
  const { isDirty } = useSelector((state: RootState) => state.layout);

  const handleManualSave = () => {
    dispatch(triggerManualSave());
  };

  const isDisabled = saveStatus === 'saving' || !isDirty;

  return (
    <button
      className={`manual-save-button manual-save-button--${saveStatus}`}
      onClick={handleManualSave}
      disabled={isDisabled}
      title={
        saveStatus === 'saving' 
          ? 'Saving in progress...' 
          : !isDirty 
          ? 'No changes to save' 
          : 'Save changes (Ctrl+S)'
      }
    >
      {saveStatus === 'saving' ? (
        <>
          <span className="manual-save-button__spinner" aria-hidden="true">⏳</span>
          Saving...
        </>
      ) : (
        <>
          <span className="manual-save-button__icon" aria-hidden="true">💾</span>
          Save
        </>
      )}
    </button>
  );
};

export default ManualSaveButton;