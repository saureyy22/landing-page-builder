import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LayoutConfig } from '@contentful-landing-page-builder/shared';
import { HistoryState } from '../types';

const initialLayoutConfig: LayoutConfig = {
  components: [],
  version: '1.0.0',
  lastModified: new Date().toISOString(),
};

const initialState: HistoryState = {
  past: [],
  present: initialLayoutConfig,
  future: [],
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    pushToHistory: (state, action: PayloadAction<LayoutConfig>) => {
      // Add current present to past
      state.past.push(state.present);
      // Set new present
      state.present = action.payload;
      // Clear future (new action invalidates redo history)
      state.future = [];
      
      // Limit history size to prevent memory issues
      if (state.past.length > 50) {
        state.past = state.past.slice(-50);
      }
    },
    undo: (state) => {
      if (state.past.length > 0) {
        // Move current present to future
        state.future.unshift(state.present);
        // Get last item from past as new present
        state.present = state.past.pop()!;
        
        // Limit future size
        if (state.future.length > 50) {
          state.future = state.future.slice(0, 50);
        }
      }
    },
    redo: (state) => {
      if (state.future.length > 0) {
        // Move current present to past
        state.past.push(state.present);
        // Get first item from future as new present
        state.present = state.future.shift()!;
        
        // Limit past size
        if (state.past.length > 50) {
          state.past = state.past.slice(-50);
        }
      }
    },
    setPresent: (state, action: PayloadAction<LayoutConfig>) => {
      state.present = action.payload;
    },
    clearHistory: (state) => {
      state.past = [];
      state.future = [];
      state.present = initialLayoutConfig;
    },
  },
});

export const {
  pushToHistory,
  undo,
  redo,
  setPresent,
  clearHistory,
} = historySlice.actions;

export default historySlice.reducer;