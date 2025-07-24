import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateComponent } from '../store/slices/layoutSlice';
import { HeroBlockData, ContentfulAsset } from '@contentful-landing-page-builder/shared';
import './HeroBlockEditor.css';

interface HeroBlockEditorProps {
  componentId: string;
}

/**
 * Editor interface for Hero Block components
 * Provides form fields for heading, subtitle, CTA, and background image
 * Updates component data in real-time as user types
 */
export const HeroBlockEditor: React.FC<HeroBlockEditorProps> = ({ componentId }) => {
  const dispatch = useAppDispatch();
  const component = useAppSelector((state) =>
    state.layout.components.find(c => c.id === componentId)
  );

  const [localData, setLocalData] = useState<HeroBlockData | null>(null);

  // Initialize local state when component loads
  useEffect(() => {
    if (component && component.type === 'hero-block') {
      setLocalData(component.data as HeroBlockData);
    } else if (component && component.type === 'hero-block' && !component.data) {
      // Initialize with default data if component exists but has no data
      const defaultData: HeroBlockData = {
        heading: 'Welcome to Our Landing Page',
        subtitle: 'Create amazing experiences with our platform',
        cta: {
          text: 'Get Started',
          url: '#'
        },
        backgroundImage: null
      };
      setLocalData(defaultData);
    }
  }, [component]);

  // Update component in store when local data changes
  useEffect(() => {
    if (localData && component) {
      const updatedComponent = {
        ...component,
        data: localData,
      };
      dispatch(updateComponent(updatedComponent));
    }
  }, [localData, component, dispatch]);

  const handleFieldChange = (field: keyof HeroBlockData, value: any) => {
    if (!localData) return;

    setLocalData({
      ...localData,
      [field]: value,
    });
  };

  const handleCTAChange = (field: 'text' | 'url', value: string) => {
    if (!localData) return;

    setLocalData({
      ...localData,
      cta: {
        ...localData.cta,
        [field]: value,
      },
    });
  };

  const handleImageSelect = () => {
    // For now, we'll use a simple prompt to get image URL
    // In a real implementation, this would open Contentful's asset picker
    const imageUrl = prompt('Enter image URL (in a real app, this would open Contentful asset picker):');
    if (imageUrl && localData) {
      const newAsset: ContentfulAsset = {
        sys: { id: `custom-${Date.now()}` },
        fields: {
          title: 'Custom Background Image',
          file: {
            url: imageUrl,
            details: { size: 0, image: { width: 1200, height: 600 } },
            fileName: 'background.jpg',
            contentType: 'image/jpeg',
          },
        },
      };

      handleFieldChange('backgroundImage', newAsset);
    }
  };

  if (!localData) {
    return <div className="editor-loading">Loading editor...</div>;
  }

  return (
    <div className="hero-block-editor">
      <div className="editor-header">
        <h3>🎯 Hero Block Editor</h3>
      </div>

      <div className="editor-form">
        <div className="form-group">
          <label htmlFor="hero-heading">Heading</label>
          <input
            id="hero-heading"
            type="text"
            value={localData.heading}
            onChange={(e) => handleFieldChange('heading', e.target.value)}
            placeholder="Enter hero heading"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="hero-subtitle">Subtitle</label>
          <textarea
            id="hero-subtitle"
            value={localData.subtitle}
            onChange={(e) => handleFieldChange('subtitle', e.target.value)}
            placeholder="Enter hero subtitle"
            className="form-textarea"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Call to Action</label>
          <div className="cta-fields">
            <div className="cta-field">
              <label htmlFor="cta-text">Button Text</label>
              <input
                id="cta-text"
                type="text"
                value={localData.cta.text}
                onChange={(e) => handleCTAChange('text', e.target.value)}
                placeholder="Button text"
                className="form-input"
              />
            </div>
            <div className="cta-field">
              <label htmlFor="cta-url">Button URL</label>
              <input
                id="cta-url"
                type="url"
                value={localData.cta.url}
                onChange={(e) => handleCTAChange('url', e.target.value)}
                placeholder="https://example.com"
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Background Image</label>
          <div className="image-selector">
            {localData.backgroundImage ? (
              <div className="current-image">
                <img
                  src={localData.backgroundImage.fields.file.url}
                  alt={localData.backgroundImage.fields.title}
                  className="image-preview"
                />
                <div className="image-info">
                  <span className="image-title">{localData.backgroundImage.fields.title}</span>
                  <span className="image-dimensions">
                    {localData.backgroundImage.fields.file.details.image?.width} × {localData.backgroundImage.fields.file.details.image?.height}
                  </span>
                </div>
              </div>
            ) : (
              <div className="no-image">
                <span>No background image selected</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleImageSelect}
              className="select-image-button"
            >
              📁 Select Image
            </button>
          </div>
        </div>
      </div>

      <div className="editor-preview">
        <h4>Preview</h4>
        <div className="hero-preview-container">
          <div className="hero-preview-content">
            <h2>{localData.heading}</h2>
            <p>{localData.subtitle}</p>
            <button className="preview-cta-button">{localData.cta.text}</button>
          </div>
          {localData.backgroundImage && (
            <div className="hero-preview-background">
              <img
                src={localData.backgroundImage.fields.file.url}
                alt={localData.backgroundImage.fields.title}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};