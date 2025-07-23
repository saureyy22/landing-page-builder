import { ComponentInstance, LayoutConfig } from '@contentful-landing-page-builder/shared';

// Layout state interface
export interface LayoutState {
  components: ComponentInstance[];
  isDirty: boolean;
  lastSaved: string | null;
}

// History state interface for undo/redo functionality
export interface HistoryState {
  past: LayoutConfig[];
  present: LayoutConfig;
  future: LayoutConfig[];
}

// Save status type
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// UI state interface
export interface UIState {
  selectedComponent: string | null;
  isDragging: boolean;
  previewMode: boolean;
  saveStatus: SaveStatus;
  saveError: string | null;
  lastSaveAttempt: string | null;
}

// Root state interface
export interface RootState {
  layout: LayoutState;
  history: HistoryState;
  ui: UIState;
}