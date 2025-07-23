import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface DragDropProviderProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that provides React DnD context with HTML5 backend
 * This enables drag and drop functionality throughout the application
 */
export const DragDropProvider: React.FC<DragDropProviderProps> = ({ children }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
    </DndProvider>
  );
};