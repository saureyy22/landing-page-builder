import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addComponent, removeComponent } from '../store/slices/layoutSlice';
import { triggerManualSave } from '../store/middleware/autoSaveMiddleware';
import { ComponentInstance } from '@contentful-landing-page-builder/shared';
import './TestControls.css';

const TestControls: React.FC = () => {
  const dispatch = useAppDispatch();
  const components = useAppSelector((state) => state.layout.components);
  const { saveStatus, saveError } = useAppSelector((state) => state.ui);
  const [autoAddCount, setAutoAddCount] = useState(0);

  const addTestComponent = () => {
    const newComponent: ComponentInstance = {
      id: `test-${Date.now()}`,
      type: 'hero-block',
      data: {
        heading: `Test Component ${components.length + 1}`,
        subtitle: 'This is a test component',
        cta: {
          text: 'Click me',
          url: '#',
        },
        backgroundImage: {
          sys: { id: 'test-image' },
          fields: {
            title: 'Test Image',
            file: {
              url: 'https://via.placeholder.com/800x400',
              details: { size: 0, image: { width: 800, height: 400 } },
              fileName: 'test.jpg',
              contentType: 'image/jpeg',
            },
          },
        },
      },
      order: components.length,
    };

    dispatch(addComponent(newComponent));
  };

  const removeLastComponent = () => {
    if (components.length > 0) {
      const lastComponent = components[components.length - 1];
      dispatch(removeComponent(lastComponent.id));
    }
  };

  const testAutoSave = () => {
    // Add multiple components quickly to test auto-save debouncing
    const count = autoAddCount + 1;
    setAutoAddCount(count);
    
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const newComponent: ComponentInstance = {
          id: `auto-test-${count}-${i}-${Date.now()}`,
          type: 'two-column-row',
          data: {
            leftColumn: {
              heading: `Auto Test ${count}-${i + 1}`,
              subtitle: 'Testing auto-save functionality',
              cta: { text: 'Test CTA', url: '#' },
            },
            rightColumn: {
              image: {
                sys: { id: 'test-image' },
                fields: {
                  title: 'Test Image',
                  file: {
                    url: 'https://via.placeholder.com/400x300',
                    details: { size: 0, image: { width: 400, height: 300 } },
                    fileName: 'test.jpg',
                    contentType: 'image/jpeg',
                  },
                },
              },
            },
          },
          order: components.length + i,
        };
        dispatch(addComponent(newComponent));
      }, i * 200); // Stagger the additions
    }
  };

  const triggerManualSaveTest = () => {
    dispatch(triggerManualSave());
  };

  return (
    <div className="test-controls">
      <h3>Test Controls</h3>
      <div className="control-buttons">
        <button className="test-button add" onClick={addTestComponent}>
          Add Component
        </button>
        <button 
          className="test-button remove" 
          onClick={removeLastComponent}
          disabled={components.length === 0}
        >
          Remove Last Component
        </button>
        <button className="test-button auto-save" onClick={testAutoSave}>
          Test Auto-Save (Add 3)
        </button>
        <button className="test-button manual-save" onClick={triggerManualSaveTest}>
          Trigger Manual Save
        </button>
      </div>
      <div className="save-status-info">
        <p><strong>Save Status:</strong> {saveStatus}</p>
        {saveError && <p className="error"><strong>Error:</strong> {saveError}</p>}
      </div>
    </div>
  );
};

export default TestControls;