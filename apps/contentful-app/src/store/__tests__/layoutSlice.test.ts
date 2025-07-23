import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import layoutSlice, {
  addComponent,
  updateComponent,
  removeComponent,
  reorderComponents,
  setComponents,
  resetLayout,
  markSaved,
} from '../slices/layoutSlice';
import { ComponentInstance, LayoutConfig } from '@contentful-landing-page-builder/shared';
import { LayoutState } from '../types';

const createMockComponent = (id: string, order: number): ComponentInstance => ({
  id,
  type: 'hero-block',
  data: {
    heading: 'Test Heading',
    subtitle: 'Test Subtitle',
    cta: { text: 'Test CTA', url: 'https://example.com' },
    backgroundImage: {
      sys: { id: 'test-image' },
      fields: {
        title: 'Test Image',
        file: {
          url: 'https://example.com/image.jpg',
          details: { size: 1024, image: { width: 800, height: 600 } },
          fileName: 'test.jpg',
          contentType: 'image/jpeg',
        },
      },
    },
  },
  order,
});

type TestStore = ReturnType<typeof configureStore<{ layout: LayoutState }>>;

describe('layoutSlice', () => {
  let store: TestStore;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        layout: layoutSlice,
      },
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().layout;
      
      expect(state.components).toEqual([]);
      expect(state.isDirty).toBe(false);
      expect(state.lastSaved).toBeNull();
    });
  });

  describe('addComponent', () => {
    it('should add a component to the layout', () => {
      const component = createMockComponent('comp-1', 1);
      
      store.dispatch(addComponent(component));
      
      const state = store.getState().layout;
      expect(state.components).toHaveLength(1);
      expect(state.components[0]).toEqual(component);
      expect(state.isDirty).toBe(true);
    });

    it('should add multiple components', () => {
      const comp1 = createMockComponent('comp-1', 1);
      const comp2 = createMockComponent('comp-2', 2);
      
      store.dispatch(addComponent(comp1));
      store.dispatch(addComponent(comp2));
      
      const state = store.getState().layout;
      expect(state.components).toHaveLength(2);
      expect(state.components.map(c => c.id)).toEqual(['comp-1', 'comp-2']);
    });
  });

  describe('updateComponent', () => {
    it('should update an existing component', () => {
      const component = createMockComponent('comp-1', 1);
      store.dispatch(addComponent(component));
      
      const updatedComponent = {
        ...component,
        data: {
          ...component.data,
          heading: 'Updated Heading',
        },
      };
      
      store.dispatch(updateComponent(updatedComponent));
      
      const state = store.getState().layout;
      expect((state.components[0].data as any).heading).toBe('Updated Heading');
      expect(state.isDirty).toBe(true);
    });

    it('should not update non-existent component', () => {
      const component = createMockComponent('comp-1', 1);
      store.dispatch(addComponent(component));
      
      const nonExistentComponent = createMockComponent('non-existent', 1);
      store.dispatch(updateComponent(nonExistentComponent));
      
      const state = store.getState().layout;
      expect(state.components).toHaveLength(1);
      expect(state.components[0].id).toBe('comp-1');
    });
  });

  describe('removeComponent', () => {
    it('should remove a component by id', () => {
      const comp1 = createMockComponent('comp-1', 1);
      const comp2 = createMockComponent('comp-2', 2);
      
      store.dispatch(addComponent(comp1));
      store.dispatch(addComponent(comp2));
      store.dispatch(removeComponent('comp-1'));
      
      const state = store.getState().layout;
      expect(state.components).toHaveLength(1);
      expect(state.components[0].id).toBe('comp-2');
      expect(state.isDirty).toBe(true);
    });

    it('should handle removing non-existent component', () => {
      const component = createMockComponent('comp-1', 1);
      store.dispatch(addComponent(component));
      
      store.dispatch(removeComponent('non-existent'));
      
      const state = store.getState().layout;
      expect(state.components).toHaveLength(1);
      expect(state.components[0].id).toBe('comp-1');
    });
  });

  describe('reorderComponents', () => {
    it('should reorder components', () => {
      const comp1 = createMockComponent('comp-1', 1);
      const comp2 = createMockComponent('comp-2', 2);
      const comp3 = createMockComponent('comp-3', 3);
      
      store.dispatch(addComponent(comp1));
      store.dispatch(addComponent(comp2));
      store.dispatch(addComponent(comp3));
      
      // Reorder to move comp-1 to position 2
      const reorderedComponents = [comp2, comp1, comp3];
      store.dispatch(reorderComponents(reorderedComponents));
      
      const state = store.getState().layout;
      expect(state.components.map(c => c.id)).toEqual(['comp-2', 'comp-1', 'comp-3']);
      expect(state.isDirty).toBe(true);
    });

    it('should handle empty array', () => {
      const component = createMockComponent('comp-1', 1);
      store.dispatch(addComponent(component));
      
      store.dispatch(reorderComponents([]));
      
      const state = store.getState().layout;
      expect(state.components).toHaveLength(0);
      expect(state.isDirty).toBe(true);
    });
  });

  describe('setComponents', () => {
    it('should set components and mark as not dirty', () => {
      const components = [createMockComponent('comp-1', 1)];
      
      store.dispatch(setComponents(components));
      
      const state = store.getState().layout;
      expect(state.components).toEqual(components);
      expect(state.isDirty).toBe(false);
    });

    it('should replace existing components', () => {
      const comp1 = createMockComponent('comp-1', 1);
      const comp2 = createMockComponent('comp-2', 2);
      
      store.dispatch(addComponent(comp1));
      store.dispatch(setComponents([comp2]));
      
      const state = store.getState().layout;
      expect(state.components).toHaveLength(1);
      expect(state.components[0].id).toBe('comp-2');
      expect(state.isDirty).toBe(false);
    });
  });

  describe('resetLayout', () => {
    it('should reset layout to initial state', () => {
      const component = createMockComponent('comp-1', 1);
      store.dispatch(addComponent(component));
      store.dispatch(markSaved());
      
      store.dispatch(resetLayout());
      
      const state = store.getState().layout;
      expect(state.components).toEqual([]);
      expect(state.isDirty).toBe(false);
      expect(state.lastSaved).toBeNull();
    });
  });

  describe('markSaved', () => {
    it('should mark layout as saved', () => {
      const component = createMockComponent('comp-1', 1);
      store.dispatch(addComponent(component));
      
      expect(store.getState().layout.isDirty).toBe(true);
      expect(store.getState().layout.lastSaved).toBeNull();
      
      store.dispatch(markSaved());
      
      const state = store.getState().layout;
      expect(state.isDirty).toBe(false);
      expect(state.lastSaved).toBeTruthy();
      expect(typeof state.lastSaved).toBe('string');
    });
  });
});