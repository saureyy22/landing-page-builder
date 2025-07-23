import { createAction } from '@reduxjs/toolkit';
import { undo, redo } from '../slices/historySlice';
import { setComponents } from '../slices/layoutSlice';
import { AppDispatch, RootState } from '../index';

// Thunk action for undo that also updates layout
export const undoAction = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  
  // Check if undo is possible
  if (state.history.past.length > 0) {
    // Dispatch undo action
    dispatch(undo());
    
    // Get the new state after undo
    const newState = getState();
    
    // Update layout components to match the new present state
    dispatch(setComponents(newState.history.present.components));
  }
};

// Thunk action for redo that also updates layout
export const redoAction = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  
  // Check if redo is possible
  if (state.history.future.length > 0) {
    // Dispatch redo action
    dispatch(redo());
    
    // Get the new state after redo
    const newState = getState();
    
    // Update layout components to match the new present state
    dispatch(setComponents(newState.history.present.components));
  }
};

// Action to check if undo is available
export const canUndo = (state: RootState): boolean => {
  return state.history.past.length > 0;
};

// Action to check if redo is available
export const canRedo = (state: RootState): boolean => {
  return state.history.future.length > 0;
};