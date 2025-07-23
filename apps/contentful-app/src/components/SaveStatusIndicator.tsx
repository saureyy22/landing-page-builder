import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/types';
import './SaveStatusIndicator.css';

const SaveStatusIndicator: React.FC = () => {
  const { saveStatus, saveError, lastSaveAttempt } = useSelector((state: RootState) => state.ui);
  const { isDirty, lastSaved } = useSelector((state: RootState) => state.layout);

  const getStatusText = (): string => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'All changes saved';
      case 'error':
        return 'Save failed';
      case 'idle':
      default:
        if (isDirty) {
          return 'Unsaved changes';
        }
        return lastSaved ? 'All changes saved' : 'No changes';
    }
  };

  const getStatusIcon = (): string => {
    switch (saveStatus) {
      case 'saving':
        return '⏳';
      case 'saved':
        return '✅';
      case 'error':
        return '❌';
      case 'idle':
      default:
        if (isDirty) {
          return '●';
        }
        return '✅';
    }
  };

  const getLastSavedText = (): string | null => {
    if (!lastSaved) return null;
    
    const savedDate = new Date(lastSaved);
    const now = new Date();
    const diffMs = now.getTime() - savedDate.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return savedDate.toLocaleTimeString();
    }
  };

  return (
    <div className={`save-status-indicator save-status-indicator--${saveStatus}`}>
      <div className="save-status-indicator__main">
        <span className="save-status-indicator__icon" aria-hidden="true">
          {getStatusIcon()}
        </span>
        <span className="save-status-indicator__text">
          {getStatusText()}
        </span>
      </div>
      
      {saveError && (
        <div className="save-status-indicator__error" title={saveError}>
          {saveError}
        </div>
      )}
      
      {!saveError && getLastSavedText() && (
        <div className="save-status-indicator__timestamp">
          Last saved: {getLastSavedText()}
        </div>
      )}
    </div>
  );
};

export default SaveStatusIndicator;