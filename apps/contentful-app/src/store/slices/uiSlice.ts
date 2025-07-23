import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState, SaveStatus } from '../types';

const initialState: UIState = {
  selectedComponent: null,
  isDragging: false,
  previewMode: false,
  saveStatus: 'idle',
  saveError: null,
  lastSaveAttempt: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedComponent: (state, action: PayloadAction<string | null>) => {
      state.selectedComponent = action.payload;
    },
    setDragging: (state, action: PayloadAction<boolean>) => {
      state.isDragging = action.payload;
    },
    setPreviewMode: (state, action: PayloadAction<boolean>) => {
      state.previewMode = action.payload;
    },
    setSaveStatus: (state, action: PayloadAction<SaveStatus>) => {
      state.saveStatus = action.payload;
      state.lastSaveAttempt = new Date().toISOString();
      
      // Clear error when starting to save
      if (action.payload === 'saving') {
        state.saveError = null;
      }
    },
    setSaveError: (state, action: PayloadAction<string | null>) => {
      state.saveError = action.payload;
      state.saveStatus = 'error';
      state.lastSaveAttempt = new Date().toISOString();
    },
    clearSaveError: (state) => {
      state.saveError = null;
      if (state.saveStatus === 'error') {
        state.saveStatus = 'idle';
      }
    },
    setSaveSuccess: (state) => {
      state.saveStatus = 'saved';
      state.saveError = null;
      state.lastSaveAttempt = new Date().toISOString();
    },
    resetUI: (state) => {
      state.selectedComponent = null;
      state.isDragging = false;
      state.previewMode = false;
      state.saveStatus = 'idle';
      state.saveError = null;
      state.lastSaveAttempt = null;
    },
  },
});

export const {
  setSelectedComponent,
  setDragging,
  setPreviewMode,
  setSaveStatus,
  setSaveError,
  clearSaveError,
  setSaveSuccess,
  resetUI,
} = uiSlice.actions;

// Alias for convenience
export const selectComponent = setSelectedComponent;

export default uiSlice.reducer;