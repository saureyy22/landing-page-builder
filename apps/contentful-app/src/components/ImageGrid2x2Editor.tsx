import React, { useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateComponent } from '../store/slices/layoutSlice';
import { ImageGrid2x2Data, ContentfulAsset } from '@contentful-landing-page-builder/shared';
import './ImageGrid2x2Editor.css';

interface ImageGrid2x2EditorProps {
  componentId: string;
}

interface DraggedImage {
  index: number;
  asset: ContentfulAsset;
}

const IMAGE_DRAG_TYPE = 'grid-image';

/**
 * Individual draggable image component within the grid editor
 */
const DraggableGridImage: React.FC<{
  asset: ContentfulAsset;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onSelect: (index: number) => void;
}> = ({ asset, index, onMove, onSelect }) => {
  const [{ isDragging }, drag] = useDrag({
    type: IMAGE_DRAG_TYPE,
    item: { index, asset },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: IMAGE_DRAG_TYPE,
    hover: (item: DraggedImage) => {
      if (item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`grid-image-item ${isDragging ? 'dragging' : ''} ${isOver ? 'drop-target' : ''}`}
      onClick={() => onSelect(index)}
    >
      <img
        src={asset.fields.file.url}
        alt={asset.fields.title}
        className="grid-image"
      />
      <div className="image-overlay">
        <div className="image-actions">
          <button
            type="button"
            className="change-image-button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(index);
            }}
            title="Change image"
          >
            📁
          </button>
          <div className="drag-handle" title="Drag to reorder">
            ⋮⋮
          </div>
        </div>
        <div className="image-info">
          <span className="image-title">{asset.fields.title}</span>
          <span className="image-position">Position {index + 1}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Editor interface for 2x2 Image Grid components
 * Provides interface for selecting 4 images and drag-and-drop reordering
 * Shows image preview thumbnails in editor
 */
export const ImageGrid2x2Editor: React.FC<ImageGrid2x2EditorProps> = ({ componentId }) => {
  const dispatch = useAppDispatch();
  const component = useAppSelector((state) => 
    state.layout.components.find(c => c.id === componentId)
  );

  const [localData, setLocalData] = useState<ImageGrid2x2Data | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Initialize local state when component loads
  useEffect(() => {
    if (component && component.type === 'image-grid-2x2') {
      setLocalData(component.data as ImageGrid2x2Data);
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

  const handleImageMove = (dragIndex: number, hoverIndex: number) => {
    if (!localData) return;

    const draggedImage = localData.images[dragIndex];
    const newImages = [...localData.images];
    
    // Remove the dragged image and insert it at the new position
    newImages.splice(dragIndex, 1);
    newImages.splice(hoverIndex, 0, draggedImage);

    setLocalData({
      ...localData,
      images: newImages as [ContentfulAsset, ContentfulAsset, ContentfulAsset, ContentfulAsset],
    });
  };

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
    
    // For now, we'll use a simple prompt to get image URL
    // In a real implementation, this would open Contentful's asset picker
    const imageUrl = prompt(`Enter image URL for position ${index + 1} (in a real app, this would open Contentful asset picker):`);
    if (imageUrl && localData) {
      const newAsset: ContentfulAsset = {
        sys: { id: `custom-grid-${Date.now()}-${index}` },
        fields: {
          title: `Grid Image ${index + 1}`,
          file: {
            url: imageUrl,
            details: { size: 0, image: { width: 300, height: 300 } },
            fileName: `grid-image-${index + 1}.jpg`,
            contentType: 'image/jpeg',
          },
        },
      };
      
      const newImages = [...localData.images];
      newImages[index] = newAsset;
      
      setLocalData({
        ...localData,
        images: newImages as [ContentfulAsset, ContentfulAsset, ContentfulAsset, ContentfulAsset],
      });
    }
    
    setSelectedImageIndex(null);
  };

  const handleSelectAllImages = () => {
    if (!localData) return;
    
    const imageUrls: (string | null)[] = [];
    for (let i = 0; i < 4; i++) {
      const url = prompt(`Enter image URL for position ${i + 1} (or leave empty to keep current):`);
      if (url) {
        imageUrls.push(url);
      } else {
        imageUrls.push(null);
      }
    }
    
    const newImages = localData.images.map((currentImage, index) => {
      if (imageUrls[index]) {
        return {
          sys: { id: `custom-grid-${Date.now()}-${index}` },
          fields: {
            title: `Grid Image ${index + 1}`,
            file: {
              url: imageUrls[index]!,
              details: { size: 0, image: { width: 300, height: 300 } },
              fileName: `grid-image-${index + 1}.jpg`,
              contentType: 'image/jpeg',
            },
          },
        };
      }
      return currentImage;
    });
    
    setLocalData({
      ...localData,
      images: newImages as [ContentfulAsset, ContentfulAsset, ContentfulAsset, ContentfulAsset],
    });
  };

  if (!localData) {
    return <div className="editor-loading">Loading editor...</div>;
  }

  return (
    <div className="image-grid-2x2-editor">
      <div className="editor-header">
        <h3>🖼️ 2x2 Image Grid Editor</h3>
        <button
          type="button"
          onClick={handleSelectAllImages}
          className="select-all-button"
        >
          📁 Select All Images
        </button>
      </div>

      <div className="editor-form">
        <div className="form-group">
          <label>Grid Images</label>
          <p className="help-text">
            Click on any image to replace it, or drag images to reorder them within the grid.
          </p>
          
          <div className="image-grid-editor">
            {localData.images.map((asset, index) => (
              <DraggableGridImage
                key={`${asset.sys.id}-${index}`}
                asset={asset}
                index={index}
                onMove={handleImageMove}
                onSelect={handleImageSelect}
              />
            ))}
          </div>
        </div>

        <div className="grid-info">
          <h4>Grid Layout</h4>
          <div className="layout-diagram">
            <div className="layout-grid">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`layout-cell ${selectedImageIndex === index ? 'selected' : ''}`}
                >
                  <span className="position-number">{index + 1}</span>
                  <span className="image-name">{localData.images[index].fields.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="editor-preview">
        <h4>Preview</h4>
        <div className="grid-preview-container">
          <div className="preview-grid">
            {localData.images.map((asset, index) => (
              <div key={`preview-${asset.sys.id}-${index}`} className="preview-grid-item">
                <img
                  src={asset.fields.file.url}
                  alt={asset.fields.title}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};