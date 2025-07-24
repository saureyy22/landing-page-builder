import React from 'react';
import { useDrop } from 'react-dnd';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { addComponent, reorderComponents } from '../store/slices/layoutSlice';
import { DragItemTypes, DraggedComponent, DraggedComponentInstance } from '../types/dragDrop';
import { ComponentType, ComponentData, ComponentInstance } from '@contentful-landing-page-builder/shared';
import { CanvasComponent } from './CanvasComponent';
import './BuilderCanvas.css';

/**
 * Main canvas area where components can be dropped and arranged
 * Handles both new component drops from sidebar and reordering of existing components
 */
export const BuilderCanvas: React.FC = () => {
  const dispatch = useAppDispatch();
  const { components } = useAppSelector((state) => state.layout);

  // Create default data for new components
  const createDefaultComponentData = (type: ComponentType): ComponentData => {
    switch (type) {
      case 'hero-block':
        return {
          heading: 'New Hero Heading',
          subtitle: 'Add your hero subtitle here',
          cta: { text: 'Call to Action', url: '#' },
          backgroundImage: {
            sys: { id: 'placeholder' },
            fields: {
              title: 'Placeholder Image',
              file: {
                url: 'https://placehold.co/1200x600/3b82f6/ffffff?text=Hero+Background',
                details: { size: 0, image: { width: 1200, height: 600 } },
                fileName: 'placeholder.jpg',
                contentType: 'image/jpeg',
              },
            },
          },
        };
      case 'two-column-row':
        return {
          leftColumn: {
            heading: 'Column Heading',
            subtitle: 'Add your column content here',
            cta: { text: 'Learn More', url: '#' },
          },
          rightColumn: {
            image: {
              sys: { id: 'placeholder' },
              fields: {
                title: 'Placeholder Image',
                file: {
                  url: 'https://placehold.co/600x400/6366f1/ffffff?text=Column+Image',
                  details: { size: 0, image: { width: 600, height: 400 } },
                  fileName: 'placeholder.jpg',
                  contentType: 'image/jpeg',
                },
              },
            },
          },
        };
      case 'image-grid-2x2':
        return {
          images: [
            {
              sys: { id: 'placeholder-1' },
              fields: {
                title: 'Grid Image 1',
                file: {
                  url: 'https://placehold.co/300x300/3b82f6/ffffff?text=Grid+1',
                  details: { size: 0, image: { width: 300, height: 300 } },
                  fileName: 'placeholder-1.jpg',
                  contentType: 'image/jpeg',
                },
              },
            },
            {
              sys: { id: 'placeholder-2' },
              fields: {
                title: 'Grid Image 2',
                file: {
                  url: 'https://placehold.co/300x300/6366f1/ffffff?text=Grid+2',
                  details: { size: 0, image: { width: 300, height: 300 } },
                  fileName: 'placeholder-2.jpg',
                  contentType: 'image/jpeg',
                },
              },
            },
            {
              sys: { id: 'placeholder-3' },
              fields: {
                title: 'Grid Image 3',
                file: {
                  url: 'https://placehold.co/300x300/8b5cf6/ffffff?text=Grid+3',
                  details: { size: 0, image: { width: 300, height: 300 } },
                  fileName: 'placeholder-3.jpg',
                  contentType: 'image/jpeg',
                },
              },
            },
            {
              sys: { id: 'placeholder-4' },
              fields: {
                title: 'Grid Image 4',
                file: {
                  url: 'https://placehold.co/300x300/06b6d4/ffffff?text=Grid+4',
                  details: { size: 0, image: { width: 300, height: 300 } },
                  fileName: 'placeholder-4.jpg',
                  contentType: 'image/jpeg',
                },
              },
            },
          ] as const,
        };
      default:
        throw new Error(`Unknown component type: ${type}`);
    }
  };

  // Handle dropping new components from sidebar
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [DragItemTypes.COMPONENT, DragItemTypes.COMPONENT_INSTANCE],
    drop: (item: DraggedComponent | DraggedComponentInstance, monitor) => {
      if (monitor.getItemType() === DragItemTypes.COMPONENT) {
        const draggedComponent = item as DraggedComponent;
        const newComponent: ComponentInstance = {
          id: `${draggedComponent.type}-${Date.now()}`,
          type: draggedComponent.type,
          data: createDefaultComponentData(draggedComponent.type),
          order: components.length,
        };
        dispatch(addComponent(newComponent));
      } else if (monitor.getItemType() === DragItemTypes.COMPONENT_INSTANCE) {
        const draggedInstance = item as DraggedComponentInstance;
        // Handle reordering - for now, just keep it in the same position
        // This will be enhanced when we add drop zones between components
        console.log('Reordering component:', draggedInstance);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isEmpty = components.length === 0;

  return (
    <div
      ref={drop}
      className={`builder-canvas ${isOver ? 'drag-over' : ''} ${canDrop ? 'can-drop' : ''} ${isEmpty ? 'empty' : ''}`}
    >
      {isEmpty ? (
        <div className="canvas-empty-state">
          <div className="empty-state-icon">📱</div>
          <h3>Start building your landing page</h3>
          <p>Drag components from the sidebar to begin creating your page layout</p>
        </div>
      ) : (
        <div className="canvas-components">
          {[...components]
            .sort((a, b) => a.order - b.order)
            .map((component, index) => (
              <CanvasComponent
                key={component.id}
                component={component}
                index={index}
              />
            ))}
        </div>
      )}
      
      {isOver && canDrop && (
        <div className="drop-indicator">
          <div className="drop-indicator-line" />
          <span className="drop-indicator-text">Drop component here</span>
        </div>
      )}
    </div>
  );
};