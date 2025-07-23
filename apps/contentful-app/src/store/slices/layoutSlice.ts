import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ComponentInstance } from '@contentful-landing-page-builder/shared';
import { LayoutState } from '../types';

const initialState: LayoutState = {
  components: [],
  isDirty: false,
  lastSaved: null,
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    addComponent: (state, action: PayloadAction<ComponentInstance>) => {
      state.components.push(action.payload);
      state.isDirty = true;
    },
    removeComponent: (state, action: PayloadAction<string>) => {
      state.components = state.components.filter(
        component => component.id !== action.payload
      );
      state.isDirty = true;
    },
    updateComponent: (state, action: PayloadAction<ComponentInstance>) => {
      const index = state.components.findIndex(
        component => component.id === action.payload.id
      );
      if (index !== -1) {
        state.components[index] = action.payload;
        state.isDirty = true;
      }
    },
    reorderComponents: (state, action: PayloadAction<ComponentInstance[]>) => {
      state.components = action.payload;
      state.isDirty = true;
    },
    setComponents: (state, action: PayloadAction<ComponentInstance[]>) => {
      state.components = action.payload;
      state.isDirty = false;
    },
    markSaved: (state) => {
      state.isDirty = false;
      state.lastSaved = new Date().toISOString();
    },
    resetLayout: (state) => {
      state.components = [];
      state.isDirty = false;
      state.lastSaved = null;
    },
  },
});

export const {
  addComponent,
  removeComponent,
  updateComponent,
  reorderComponents,
  setComponents,
  markSaved,
  resetLayout,
} = layoutSlice.actions;

export default layoutSlice.reducer;