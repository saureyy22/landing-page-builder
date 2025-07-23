import { LayoutConfig } from '@contentful-landing-page-builder/shared';
import ClientComponentRenderer from './ClientComponentRenderer';
import styles from './LandingPageRenderer.module.css';

interface LandingPageRendererProps {
  layoutConfig: LayoutConfig;
}

export default function LandingPageRenderer({ layoutConfig }: LandingPageRendererProps) {
  if (!layoutConfig || !layoutConfig.components) {
    return (
      <div className={styles.empty}>
        <p>No content available for this landing page.</p>
      </div>
    );
  }

  // Sort components by order
  const sortedComponents = [...layoutConfig.components].sort((a, b) => a.order - b.order);

  return (
    <div className={styles.container}>
      {sortedComponents.map((component) => (
        <ClientComponentRenderer
          key={component.id}
          component={component}
        />
      ))}
    </div>
  );
}