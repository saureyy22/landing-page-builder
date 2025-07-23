import React from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setSelectedComponent } from '../store/slices/uiSlice';
import { HeroBlockEditor } from './HeroBlockEditor';
import { TwoColumnRowEditor } from './TwoColumnRowEditor';
import { ImageGrid2x2Editor } from './ImageGrid2x2Editor';
import './ComponentEditor.css';

/**
 * Component editor panel that displays the appropriate editor
 * based on the currently selected component type
 */
export const ComponentEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedComponent } = useAppSelector((state) => state.ui);
  const component = useAppSelector((state) => 
    selectedComponent ? state.layout.components.find(c => c.id === selectedComponent) : null
  );

  const handleClose = () => {
    dispatch(setSelectedComponent(null));
  };

  if (!selectedComponent || !component) {
    return (
      <div className="component-editor-empty">
        <div className="empty-state">
          <div className="empty-icon">✏️</div>
          <h3>No Component Selected</h3>
          <p>Select a component from the canvas to edit its properties</p>
        </div>
      </div>
    );
  }

  const renderEditor = () => {
    switch (component.type) {
      case 'hero-block':
        return <HeroBlockEditor componentId={selectedComponent} />;
      
      case 'two-column-row':
        return <TwoColumnRowEditor componentId={selectedComponent} />;
      
      case 'image-grid-2x2':
        return <ImageGrid2x2Editor componentId={selectedComponent} />;
      
      default:
        return (
          <div className="editor-error">
            <h3>Unknown Component Type</h3>
            <p>Cannot edit component of type: {component.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="component-editor">
      <div className="editor-header">
        <div className="editor-title">
          <span className="component-type-indicator">
            {component.type === 'hero-block' && '🎯'}
            {component.type === 'two-column-row' && '📄'}
            {component.type === 'image-grid-2x2' && '🖼️'}
          </span>
          <span>Editing: {component.type.replace('-', ' ')}</span>
        </div>
        <button 
          className="close-editor-button"
          onClick={handleClose}
          aria-label="Close editor"
          title="Close editor"
        >
          ✕
        </button>
      </div>
      
      <div className="editor-content">
        {renderEditor()}
      </div>
    </div>
  );
};