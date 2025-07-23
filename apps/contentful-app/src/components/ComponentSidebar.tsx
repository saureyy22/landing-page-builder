import React from 'react';
import { DraggableComponent } from './DraggableComponent';
import './ComponentSidebar.css';

/**
 * Sidebar containing draggable component types
 * Users can drag components from here to the canvas
 */
export const ComponentSidebar: React.FC = () => {
  const componentTypes = [
    {
      type: 'hero-block' as const,
      label: 'Hero Block',
      description: 'Full-width hero section with heading, subtitle, CTA, and background image',
      icon: '🎯',
    },
    {
      type: 'two-column-row' as const,
      label: 'Two Column Row',
      description: 'Left column with text content and right column with image',
      icon: '📄',
    },
    {
      type: 'image-grid-2x2' as const,
      label: '2x2 Image Grid',
      description: 'Grid layout displaying 4 images in a 2x2 arrangement',
      icon: '🖼️',
    },
  ];

  return (
    <aside className="component-sidebar">
      <div className="sidebar-header">
        <h3>Components</h3>
        <p>Drag components to the canvas to build your page</p>
      </div>
      <div className="sidebar-content">
        {componentTypes.map((component) => (
          <DraggableComponent
            key={component.type}
            type={component.type}
            label={component.label}
            description={component.description}
            icon={component.icon}
          />
        ))}
      </div>
    </aside>
  );
};