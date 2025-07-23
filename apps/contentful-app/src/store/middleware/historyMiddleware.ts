import { Middleware } from '@reduxjs/toolkit';
import { LayoutConfig } from '@contentful-landing-page-builder/shared';
import { RootState } from '../types';
import { pushToHistory } from '../slices/historySlice';

// Actions that should trigger history tracking
const HISTORY_TRACKED_ACTIONS = [
  'layout/addComponent',
  'layout/removeComponent',
  'layout/updateComponent',
  'layout/reorderComponents',
];

// Debounce delay for history tracking (in milliseconds)
const HISTORY_DEBOUNCE_DELAY = 500;

let historyTimeout: NodeJS.Timeout | null = null;

export const historyMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  // Execute the action first
  const result = next(action);

  // Check if this action should be tracked in history
  if (HISTORY_TRACKED_ACTIONS.includes(action.type)) {
    // Clear existing timeout
    if (historyTimeout) {
      clearTimeout(historyTimeout);
    }

    // Set new timeout to debounce history updates
    historyTimeout = setTimeout(() => {
      const state = store.getState();
      const { components } = state.layout;

      // Create a new layout config from current state
      const layoutConfig: LayoutConfig = {
        components: components.map((component, index) => ({
          ...component,
          order: index, // Ensure order is up to date
        })),
        version: '1.0.0',
        lastModified: new Date().toISOString(),
      };

      // Only push to history if there are actual changes
      const currentPresent = state.history.present;
      const hasChanges = JSON.stringify(currentPresent.components) !== JSON.stringify(layoutConfig.components);

      if (hasChanges) {
        store.dispatch(pushToHistory(layoutConfig));
      }
    }, HISTORY_DEBOUNCE_DELAY);
  }

  return result;
};

export default historyMiddleware;