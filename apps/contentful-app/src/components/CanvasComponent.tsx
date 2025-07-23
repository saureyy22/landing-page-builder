import React from 'react';
import { useDrag } from 'react-dnd';
import { ComponentInstance } from '@contentful-landing-page-builder/shared';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { removeComponent } from '../store/slices/layoutSlice';
import { setSelectedComponent } from '../store/slices/uiSlice';
import { DragItemTypes, DraggedComponentInstance } from '../types/dragDrop';
import './CanvasComponent.css';

interface CanvasComponentProps {
  component: ComponentInstance;
  index: number;
}

/**
 * Individual component rendered in the canvas
 * Can be selected, edited, dragged for reordering, and deleted
 */
export const CanvasComponent: React.FC<CanvasComponentProps> = ({ component, index }) => {
  const dispatch = useAppDispatch();
  const { selectedComponent } = useAppSelector((state) => state.ui);
  const isSelected = selectedComponent === component.id;

  // Make component draggable for reordering
  const [{ isDragging }, drag] = useDrag<DraggedComponentInstance, void, { isDragging: boolean }>({
    type: DragItemTypes.COMPONENT_INSTANCE,
    item: { id: component.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleSelect = () => {
    dispatch(setSelectedComponent(component.id));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(removeComponent(component.id));
  };

  const renderComponentPreview = () => {
    switch (component.type) {
      case 'hero-block':
        const heroData = component.data as any;
        return (
          <div className="component-preview hero-preview">
            <div className="hero-content">
              <h2>{heroData.heading}</h2>
              <p>{heroData.subtitle}</p>
              <button className="cta-button">{heroData.cta.text}</button>
            </div>
            <div className="hero-background">
              <img src={heroData.backgroundImage.fields.file.url} alt={heroData.backgroundImage.fields.title} />
            </div>
          </div>
        );
      
      case 'two-column-row':
        const twoColData = component.data as any;
        return (
          <div className="component-preview two-column-preview">
            <div className="left-column">
              <h3>{twoColData.leftColumn.heading}</h3>
              <p>{twoColData.leftColumn.subtitle}</p>
              <button className="cta-button">{twoColData.leftColumn.cta.text}</button>
            </div>
            <div className="right-column">
              <img src={twoColData.rightColumn.image.fields.file.url} alt={twoColData.rightColumn.image.fields.title} />
            </div>
          </div>
        );
      
      case 'image-grid-2x2':
        const gridData = component.data as any;
        return (
          <div className="component-preview grid-preview">
            <div className="image-grid">
              {gridData.images.map((image: any, idx: number) => (
                <img key={idx} src={image.fields.file.url} alt={image.fields.title} />
              ))}
            </div>
          </div>
        );
      
      default:
        return <div className="component-preview">Unknown component type</div>;
    }
  };

  return (
    <div
      ref={drag}
      className={`canvas-component ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      aria-label={`${component.type} component`}
    >
      <div className="component-header">
        <div className="component-type-badge">
          {component.type === 'hero-block' && '🎯'}
          {component.type === 'two-column-row' && '📄'}
          {component.type === 'image-grid-2x2' && '🖼️'}
          <span>{component.type.replace('-', ' ')}</span>
        </div>
        <div className="component-actions">
          <button
            className="delete-button"
            onClick={handleDelete}
            aria-label="Delete component"
            title="Delete component"
          >
            🗑️
          </button>
        </div>
      </div>
      
      {renderComponentPreview()}
      
      {isSelected && (
        <div className="selection-outline" />
      )}
    </div>
  );
};