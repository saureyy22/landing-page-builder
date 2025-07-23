import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { undoAction, redoAction, canUndo, canRedo } from '../store/actions/historyActions';
import './UndoRedoControls.css';

const UndoRedoControls: React.FC = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state);
  
  const canUndoAction = canUndo(state);
  const canRedoAction = canRedo(state);
  const historyPosition = state.history.past.length;
  const totalHistoryLength = state.history.past.length + 1 + state.history.future.length;

  const handleUndo = () => {
    if (canUndoAction) {
      dispatch(undoAction());
    }
  };

  const handleRedo = () => {
    if (canRedoAction) {
      dispatch(redoAction());
    }
  };

  return (
    <div className="undo-redo-controls">
      <div className="undo-redo-buttons">
        <button
          className="undo-button"
          onClick={handleUndo}
          disabled={!canUndoAction}
          title={`Undo (Ctrl+Z) - ${historyPosition} actions available`}
          aria-label={`Undo last action. ${historyPosition} undo actions available.`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3.5 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.5-.5z"/>
            <path fillRule="evenodd" d="M7.646 2.646a.5.5 0 0 1 .708.708L4.707 7H14a.5.5 0 0 1 0 1H4.707l3.647 3.646a.5.5 0 0 1-.708.708l-4.5-4.5a.5.5 0 0 1 0-.708l4.5-4.5z"/>
          </svg>
          Undo
        </button>
        
        <button
          className="redo-button"
          onClick={handleRedo}
          disabled={!canRedoAction}
          title={`Redo (Ctrl+Y) - ${state.history.future.length} actions available`}
          aria-label={`Redo next action. ${state.history.future.length} redo actions available.`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.5 8a.5.5 0 0 0-.5-.5H3a.5.5 0 0 0 0 1h9a.5.5 0 0 0 .5-.5z"/>
            <path fillRule="evenodd" d="M8.354 2.646a.5.5 0 0 0-.708.708L11.293 7H2a.5.5 0 0 0 0 1h9.293l-3.647 3.646a.5.5 0 0 0 .708.708l4.5-4.5a.5.5 0 0 0 0-.708l-4.5-4.5z"/>
          </svg>
          Redo
        </button>
      </div>
      
      {totalHistoryLength > 1 && (
        <div className="history-indicator">
          <span className="history-position">
            {historyPosition + 1} / {totalHistoryLength}
          </span>
        </div>
      )}
    </div>
  );
};

export default UndoRedoControls;