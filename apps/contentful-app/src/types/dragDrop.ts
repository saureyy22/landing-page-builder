import { ComponentType } from '@contentful-landing-page-builder/shared';

/**
 * Drag and drop item types
 */
export const DragItemTypes = {
  COMPONENT: 'component',
  COMPONENT_INSTANCE: 'component-instance',
} as const;

/**
 * Draggable component from sidebar
 */
export interface DraggedComponent {
  type: ComponentType;
}

/**
 * Draggable component instance from canvas
 */
export interface DraggedComponentInstance {
  id: string;
  index: number;
}

/**
 * Drop result for component placement
 */
export interface DropResult {
  dropIndex?: number;
  dropZone: 'canvas' | 'sidebar';
}