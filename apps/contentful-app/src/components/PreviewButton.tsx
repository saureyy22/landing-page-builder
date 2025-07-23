import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { useContentfulService } from '../hooks/useContentfulService';
import { LayoutConfig } from '@contentful-landing-page-builder/shared';
import { previewService, openPreviewWindow } from '../lib/previewService';
import './PreviewButton.css';

interface PreviewButtonProps {
  className?: string;
}

const PreviewButton: React.FC<PreviewButtonProps> = ({ className }) => {
  const { components, isDirty } = useAppSelector((state) => state.layout);
  const { getCurrentEntryId, getEntryData, manualSave } = useContentfulService();
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'available' | 'unavailable' | 'unknown'>('unknown');

  // Check deployment status on component mount
  useEffect(() => {
    const checkDeployment = async () => {
      const status = await previewService.checkDeploymentStatus();
      setDeploymentStatus(status);
    };
    
    checkDeployment();
  }, []);

  // Get entry data to extract slug
  const getEntrySlug = async (): Promise<string | null> => {
    try {
      const entryId = getCurrentEntryId();
      if (!entryId) {
        console.error('No entry ID available for preview');
        return null;
      }

      // Try to fetch the actual slug from Contentful
      try {
        const entryData = await getEntryData();
        const slug = entryData?.fields?.slug?.['en-US'];
        if (slug) {
          return slug;
        }
      } catch (error) {
        console.warn('Failed to fetch entry data from Contentful, using fallback:', error);
      }

      // Fallback to default slug mapping based on entry ID
      const slugMapping: Record<string, string> = {
        'default-entry-id': 'page-1',
        'page-1-entry-id': 'page-1',
        'page-2-entry-id': 'page-2',
      };

      return slugMapping[entryId] || 'page-1';
    } catch (error) {
      console.error('Failed to get entry slug:', error);
      return null;
    }
  };

  // Handle preview button click
  const handlePreview = async () => {
    try {
      setIsGeneratingPreview(true);

      // Check deployment status first
      if (deploymentStatus === 'unavailable') {
        alert('Preview deployment is not available. Please check your deployment status and try again.');
        return;
      }

      // Get the slug for the current entry
      const slug = await getEntrySlug();
      if (!slug) {
        alert('Unable to generate preview: Could not determine page slug');
        return;
      }

      const entryId = getCurrentEntryId();
      let hasUnsavedChanges = isDirty;

      // If there are unsaved changes, offer to save first
      if (isDirty) {
        const shouldSaveFirst = window.confirm(
          'You have unsaved changes. Would you like to save them first to see the most current version in the preview?\n\n' +
          'Click "OK" to save and preview, or "Cancel" to preview the last saved version.'
        );

        if (shouldSaveFirst) {
          // Trigger manual save
          try {
            await manualSave();
            // Wait a moment for the save to complete
            await new Promise(resolve => setTimeout(resolve, 1000));
            hasUnsavedChanges = false; // Changes are now saved
          } catch (error) {
            console.error('Failed to save before preview:', error);
            alert('Failed to save changes. Proceeding with preview of last saved version.');
          }
        }
      }

      // Generate preview URL using the preview service
      const previewUrl = previewService.generatePreviewUrl({
        slug,
        hasUnsavedChanges,
        entryId: entryId || undefined,
      });

      // Add a small delay to ensure any save operations have completed
      await new Promise(resolve => setTimeout(resolve, 200));

      // Open preview using the preview service helper
      const previewWindow = openPreviewWindow(previewUrl);
      
      if (!previewWindow) {
        alert('Preview blocked by popup blocker. Please allow popups for this site and try again.');
        return;
      }

      // Show informational message about preview state
      if (hasUnsavedChanges) {
        setTimeout(() => {
          alert('Preview opened with last saved version. Your current changes are not reflected in the preview.');
        }, 300);
      } else {
        console.log('Preview opened with current saved version');
      }

      // Show deployment status message if unknown
      if (deploymentStatus === 'unknown') {
        setTimeout(() => {
          console.warn(previewService.getDeploymentStatusMessage());
        }, 500);
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
      alert('Failed to generate preview. Please try again.');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Get button title based on state
  const getButtonTitle = () => {
    if (deploymentStatus === 'unavailable') {
      return 'Preview deployment is not available';
    }
    if (deploymentStatus === 'unknown') {
      return 'Preview deployment status unknown';
    }
    if (isDirty) {
      return 'Preview (unsaved changes)';
    }
    return 'Preview current page';
  };

  // Get button class based on deployment status
  const getButtonClass = () => {
    let classes = `preview-button ${className || ''}`;
    if (deploymentStatus === 'unavailable') {
      classes += ' preview-button-unavailable';
    } else if (deploymentStatus === 'unknown') {
      classes += ' preview-button-unknown';
    }
    return classes;
  };

  return (
    <button
      className={getButtonClass()}
      onClick={handlePreview}
      disabled={isGeneratingPreview || deploymentStatus === 'unavailable'}
      title={getButtonTitle()}
    >
      {isGeneratingPreview ? (
        <>
          <span className="preview-button-spinner"></span>
          Generating...
        </>
      ) : (
        <>
          <span className="preview-button-icon">👁</span>
          Preview
          {isDirty && <span className="preview-button-badge">*</span>}
          {deploymentStatus === 'unavailable' && (
            <span className="preview-button-status-indicator" title="Deployment unavailable">⚠</span>
          )}
          {deploymentStatus === 'unknown' && (
            <span className="preview-button-status-indicator" title="Deployment status unknown">?</span>
          )}
        </>
      )}
    </button>
  );
};

export default PreviewButton;