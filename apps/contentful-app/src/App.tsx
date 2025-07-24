import React, { useEffect, useState } from 'react';
import { useAppSelector } from './store/hooks';
import UndoRedoControls from './components/UndoRedoControls';
import TestControls from './components/TestControls';
import SaveStatusIndicator from './components/SaveStatusIndicator';
import ManualSaveButton from './components/ManualSaveButton';
import SaveConflictDialog from './components/SaveConflictDialog';
import PreviewButton from './components/PreviewButton';
import { ComponentSidebar } from './components/ComponentSidebar';
import { BuilderCanvas } from './components/BuilderCanvas';
import { ComponentEditor } from './components/ComponentEditor';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import { useContentfulService, useContentfulAppContext } from './hooks/useContentfulService';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import './App.css';

const App: React.FC = () => {
  const { components, isDirty, lastSaved } = useAppSelector((state) => state.layout);
  const { past, future } = useAppSelector((state) => state.history);
  const { selectedComponent, saveStatus, saveError } = useAppSelector((state) => state.ui);

  // State for conflict dialog
  const [showConflictDialog, setShowConflictDialog] = useState(false);

  // Get entry ID from Contentful App context
  const { entryId, isLoading: contextLoading } = useContentfulAppContext();

  // Initialize Contentful service
  const { status: serviceStatus, manualSave } = useContentfulService({
    entryId: entryId || undefined,
    autoInitialize: !contextLoading && !!entryId,
  });

  // Monitor network status for auto-retry functionality
  const networkStatus = useNetworkStatus();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Handle manual save shortcut (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        if (serviceStatus.isReady && isDirty) {
          manualSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [serviceStatus.isReady, isDirty, manualSave]);

  // Show conflict dialog when there's a conflict error
  useEffect(() => {
    const isConflictError = saveError && (
      saveError.includes('conflict') ||
      saveError.includes('version') ||
      saveError.includes('modified by another user')
    );

    setShowConflictDialog(!!isConflictError);
  }, [saveError]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Contentful Landing Page Builder</h1>
        <div className="header-controls">
          <UndoRedoControls />
          <PreviewButton />
          <ManualSaveButton />
          <SaveStatusIndicator />
        </div>
      </header>
      <main className="app-main">
        <div className="builder-container">
          <ComponentSidebar />
          <div className="builder-canvas-area">
            <BuilderCanvas />
            <div className="debug-panel">
              <TestControls />
              <div className="debug-info">
                <p>Components: {components.length}</p>
                <p>Can undo: {past.length > 0 ? 'Yes' : 'No'}</p>
                <p>Can redo: {future.length > 0 ? 'Yes' : 'No'}</p>
                <p>Selected: {selectedComponent || 'None'}</p>
                <p>Entry ID: {entryId || 'Not set'}</p>
              </div>
            </div>
          </div>
          <ComponentEditor />
        </div>
      </main>

      {/* Save Conflict Dialog */}
      <SaveConflictDialog
        isOpen={showConflictDialog}
        onClose={() => setShowConflictDialog(false)}
      />
    </div>
  );
};

export default App;