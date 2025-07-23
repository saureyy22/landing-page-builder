import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateComponent } from '../store/slices/layoutSlice';
import { TwoColumnRowData, ContentfulAsset } from '@contentful-landing-page-builder/shared';
import './TwoColumnRowEditor.css';

interface TwoColumnRowEditorProps {
  componentId: string;
}

/**
 * Editor interface for Two Column Row components
 * Provides form fields for left column content and right column image
 * Includes validation for required fields
 */
export const TwoColumnRowEditor: React.FC<TwoColumnRowEditorProps> = ({ componentId }) => {
  const dispatch = useAppDispatch();
  const component = useAppSelector((state) => 
    state.layout.components.find(c => c.id === componentId)
  );

  const [localData, setLocalData] = useState<TwoColumnRowData | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Initialize local state when component loads
  useEffect(() => {
    if (component && component.type === 'two-column-row') {
      setLocalData(component.data as TwoColumnRowData);
    }
  }, [component]);

  // Validate form data
  const validateData = (data: TwoColumnRowData): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!data.leftColumn.heading.trim()) {
      errors.heading = 'Heading is required';
    }
    
    if (!data.leftColumn.subtitle.trim()) {
      errors.subtitle = 'Subtitle is required';
    }
    
    if (!data.leftColumn.cta.text.trim()) {
      errors.ctaText = 'CTA text is required';
    }
    
    if (!data.leftColumn.cta.url.trim()) {
      errors.ctaUrl = 'CTA URL is required';
    } else if (!isValidUrl(data.leftColumn.cta.url)) {
      errors.ctaUrl = 'Please enter a valid URL';
    }
    
    return errors;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith('#') || url.startsWith('/');
    }
  };

  // Update component in store when local data changes
  useEffect(() => {
    if (localData && component) {
      const errors = validateData(localData);
      setValidationErrors(errors);
      
      const updatedComponent = {
        ...component,
        data: localData,
      };
      dispatch(updateComponent(updatedComponent));
    }
  }, [localData, component, dispatch]);

  const handleLeftColumnChange = (field: keyof TwoColumnRowData['leftColumn'], value: any) => {
    if (!localData) return;
    
    setLocalData({
      ...localData,
      leftColumn: {
        ...localData.leftColumn,
        [field]: value,
      },
    });
  };

  const handleCTAChange = (field: 'text' | 'url', value: string) => {
    if (!localData) return;
    
    setLocalData({
      ...localData,
      leftColumn: {
        ...localData.leftColumn,
        cta: {
          ...localData.leftColumn.cta,
          [field]: value,
        },
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
          title: 'Custom Column Image',
          file: {
            url: imageUrl,
            details: { size: 0, image: { width: 600, height: 400 } },
            fileName: 'column-image.jpg',
            contentType: 'image/jpeg',
          },
        },
      };
      
      setLocalData({
        ...localData,
        rightColumn: {
          image: newAsset,
        },
      });
    }
  };

  if (!localData) {
    return <div className="editor-loading">Loading editor...</div>;
  }

  const hasErrors = Object.keys(validationErrors).length > 0;

  return (
    <div className="two-column-row-editor">
      <div className="editor-header">
        <h3>📄 Two Column Row Editor</h3>
        {hasErrors && (
          <div className="validation-summary">
            <span className="error-icon">⚠️</span>
            <span>Please fix validation errors</span>
          </div>
        )}
      </div>

      <div className="editor-form">
        <div className="section-header">
          <h4>Left Column Content</h4>
        </div>

        <div className="form-group">
          <label htmlFor="left-heading">Heading *</label>
          <input
            id="left-heading"
            type="text"
            value={localData.leftColumn.heading}
            onChange={(e) => handleLeftColumnChange('heading', e.target.value)}
            placeholder="Enter column heading"
            className={`form-input ${validationErrors.heading ? 'error' : ''}`}
          />
          {validationErrors.heading && (
            <span className="error-message">{validationErrors.heading}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="left-subtitle">Subtitle *</label>
          <textarea
            id="left-subtitle"
            value={localData.leftColumn.subtitle}
            onChange={(e) => handleLeftColumnChange('subtitle', e.target.value)}
            placeholder="Enter column subtitle"
            className={`form-textarea ${validationErrors.subtitle ? 'error' : ''}`}
            rows={3}
          />
          {validationErrors.subtitle && (
            <span className="error-message">{validationErrors.subtitle}</span>
          )}
        </div>

        <div className="form-group">
          <label>Call to Action *</label>
          <div className="cta-fields">
            <div className="cta-field">
              <label htmlFor="cta-text">Button Text *</label>
              <input
                id="cta-text"
                type="text"
                value={localData.leftColumn.cta.text}
                onChange={(e) => handleCTAChange('text', e.target.value)}
                placeholder="Button text"
                className={`form-input ${validationErrors.ctaText ? 'error' : ''}`}
              />
              {validationErrors.ctaText && (
                <span className="error-message">{validationErrors.ctaText}</span>
              )}
            </div>
            <div className="cta-field">
              <label htmlFor="cta-url">Button URL *</label>
              <input
                id="cta-url"
                type="url"
                value={localData.leftColumn.cta.url}
                onChange={(e) => handleCTAChange('url', e.target.value)}
                placeholder="https://example.com"
                className={`form-input ${validationErrors.ctaUrl ? 'error' : ''}`}
              />
              {validationErrors.ctaUrl && (
                <span className="error-message">{validationErrors.ctaUrl}</span>
              )}
            </div>
          </div>
        </div>

        <div className="section-header">
          <h4>Right Column Image</h4>
        </div>

        <div className="form-group">
          <label>Column Image</label>
          <div className="image-selector">
            <div className="current-image">
              <img 
                src={localData.rightColumn.image.fields.file.url} 
                alt={localData.rightColumn.image.fields.title}
                className="image-preview"
              />
              <div className="image-info">
                <span className="image-title">{localData.rightColumn.image.fields.title}</span>
                <span className="image-dimensions">
                  {localData.rightColumn.image.fields.file.details.image?.width} × {localData.rightColumn.image.fields.file.details.image?.height}
                </span>
              </div>
            </div>
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
        <div className="two-column-preview-container">
          <div className="preview-left-column">
            <h3>{localData.leftColumn.heading}</h3>
            <p>{localData.leftColumn.subtitle}</p>
            <button className="preview-cta-button">{localData.leftColumn.cta.text}</button>
          </div>
          <div className="preview-right-column">
            <img 
              src={localData.rightColumn.image.fields.file.url} 
              alt={localData.rightColumn.image.fields.title}
            />
          </div>
        </div>
      </div>
    </div>
  );
};