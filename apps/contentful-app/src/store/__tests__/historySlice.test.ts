import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import historySlice, {
  undo,
  redo,
  clearHistory,
} from '../slices/historySlice';
import { LayoutConfig } from '@contentful-landing-page-builder/shared';
import { HistoryState } from '../types';

const createMockLayoutConfig = (version: string): LayoutConfig => ({
  components: [],
  version,
  lastModified: new Date().toISOString(),
});

type TestStore = ReturnType<typeof configureStore<{ history: HistoryState }>>;

describe('historySlice', () => {
  let store: TestStore;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        history: historySlice,
      },
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().history;
      
      expect(state.past).toEqual([]);
      expect(state.present).toEqual({
        components: [],
        version: '1.0.0',
        lastModified: expect.any(String),
      });
      expect(state.future).toEqual([]);
    });
  });

  describe('undo', () => {
    it('should move present to future and restore from past', () => {
      const config1 = createMockLayoutConfig('1.0.0');
      const config2 = createMockLayoutConfig('1.1.0');
      
      // Manually set up history state
      const initialState = {
        past: [config1],
        present: config2,
        future: [],
      };
      
      const testStore = configureStore({
        reducer: { history: historySlice },
        preloadedState: { history: initialState },
      });
      
      testStore.dispatch(undo());
      
      const state = testStore.getState().history;
      expect(state.past).toEqual([]);
      expect(state.present).toEqual(config1);
      expect(state.future).toEqual([config2]);
    });

    it('should not change state when past is empty', () => {
      const initialState = store.getState().history;
      
      store.dispatch(undo());
      
      const state = store.getState().history;
      expect(state).toEqual(initialState);
    });
  });

  describe('redo', () => {
    it('should move present to past and restore from future', () => {
      const config1 = createMockLayoutConfig('1.0.0');
      const config2 = createMockLayoutConfig('1.1.0');
      
      // Manually set up history state
      const initialState = {
        past: [],
        present: config1,
        future: [config2],
      };
      
      const testStore = configureStore({
        reducer: { history: historySlice },
        preloadedState: { history: initialState },
      });
      
      testStore.dispatch(redo());
      
      const state = testStore.getState().history;
      expect(state.past).toEqual([config1]);
      expect(state.present).toEqual(config2);
      expect(state.future).toEqual([]);
    });

    it('should not change state when future is empty', () => {
      const initialState = store.getState().history;
      
      store.dispatch(redo());
      
      const state = store.getState().history;
      expect(state).toEqual(initialState);
    });
  });

  describe('clearHistory', () => {
    it('should clear past and future, resetting present to initial state', () => {
      const config1 = createMockLayoutConfig('1.0.0');
      const config2 = createMockLayoutConfig('1.1.0');
      const config3 = createMockLayoutConfig('1.2.0');
      
      // Manually set up history state
      const initialState = {
        past: [config1],
        present: config2,
        future: [config3],
      };
      
      const testStore = configureStore({
        reducer: { history: historySlice },
        preloadedState: { history: initialState },
      });
      
      testStore.dispatch(clearHistory());
      
      const state = testStore.getState().history;
      expect(state.past).toEqual([]);
      expect(state.present.components).toEqual([]);
      expect(state.present.version).toEqual('1.0.0');
      expect(state.future).toEqual([]);
    });
  });
});