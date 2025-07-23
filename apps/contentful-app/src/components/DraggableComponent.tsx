import React from 'react';
import { useDrag } from 'react-dnd';
import { ComponentType } from '@contentful-landing-page-builder/shared';
import { DragItemTypes, DraggedComponent } from '../types/dragDrop';

interface DraggableComponentProps {
  type: ComponentType;
  label: string;
  description: string;
  icon: string;
}

/**
 * Individual draggable component in the sidebar
 * Represents a component type that can be dragged to the canvas
 */
export const DraggableComponent: React.FC<DraggableComponentProps> = ({
  type,
  label,
  description,
  icon,
}) => {
  const [{ isDragging }, drag] = useDrag<DraggedComponent, void, { isDragging: boolean }>({
    type: DragItemTypes.COMPONENT,
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`draggable-component ${isDragging ? 'dragging' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`Drag ${label} component to canvas`}
    >
      <div className="component-icon">{icon}</div>
      <div className="component-info">
        <h4 className="component-label">{label}</h4>
        <p className="component-description">{description}</p>
      </div>
    </div>
  );
};