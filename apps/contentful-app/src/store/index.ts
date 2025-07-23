import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import layoutReducer from './slices/layoutSlice';
import historyReducer from './slices/historySlice';
import uiReducer from './slices/uiSlice';
import historyMiddleware from './middleware/historyMiddleware';
import autoSaveMiddleware from './middleware/autoSaveMiddleware';
import { RootState } from './types';

// Redux Persist configuration
const persistConfig = {
  key: 'contentful-landing-page-builder',
  storage,
  // Only persist layout and history, not UI state
  whitelist: ['layout', 'history'],
};

// Combine reducers
const rootReducer = combineReducers({
  layout: layoutReducer,
  history: historyReducer,
  ui: uiReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(historyMiddleware, autoSaveMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type AppDispatch = typeof store.dispatch;
export type { RootState };

// Export store and persistor
export default store;