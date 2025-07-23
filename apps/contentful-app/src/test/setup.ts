import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Contentful Management API
vi.mock('contentful-management', () => ({
  createClient: vi.fn(() => ({
    getSpace: vi.fn(() => ({
      getEnvironment: vi.fn(() => ({
        getEntry: vi.fn(),
        createEntry: vi.fn(),
        updateEntry: vi.fn(),
      })),
    })),
  })),
}));

// Mock React DnD
vi.mock('react-dnd', () => ({
  useDrag: () => [{ isDragging: false }, vi.fn(), vi.fn()],
  useDrop: () => [{ isOver: false }, vi.fn()],
  DndProvider: ({ children }: any) => children,
}));

vi.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: {},
}));