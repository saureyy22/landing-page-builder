'use client';

import React from 'react';
import { ComponentInstance, ComponentType } from '@contentful-landing-page-builder/shared';
import HeroBlock from './HeroBlock';
import TwoColumnRow from './TwoColumnRow';
import ImageGrid2x2 from './ImageGrid2x2';
import styles from './ComponentRenderer.module.css';

interface ComponentRendererProps {
  component: ComponentInstance;
}

// Component registry type definition
type ComponentRegistry = {
  [K in ComponentType]: React.ComponentType<{ component: ComponentInstance }>;
};



// Component registry mapping types to implementations
const componentRegistry: ComponentRegistry = {
  'hero-block': HeroBlock,
  'two-column-row': TwoColumnRow,
  'image-grid-2x2': ImageGrid2x2,
};

// Error boundary component for individual component failures
class ComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; componentId: string; componentType: ComponentType },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; componentId: string; componentType: ComponentType }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Component error in ${this.props.componentType} (${this.props.componentId}):`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorBoundary}>
          <h3>Component Error</h3>
          <p>Failed to render {this.props.componentType} component</p>
          <p>Component ID: {this.props.componentId}</p>
          <details className={styles.errorDetails}>
            <summary>Error Details</summary>
            <pre>{this.state.error?.message}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ComponentRenderer({ component }: ComponentRendererProps) {
  // Get the component implementation from the registry
  const ComponentImplementation = componentRegistry[component.type];

  // Fallback for unknown component types
  if (!ComponentImplementation) {
    return (
      <div className={styles.container}>
        <div className={styles.unknownComponent}>
          <h2>Unknown Component</h2>
          <p>Component type: {component.type}</p>
          <p>Component ID: {component.id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ComponentErrorBoundary
        componentId={component.id}
        componentType={component.type}
      >
        <ComponentImplementation component={component} />
      </ComponentErrorBoundary>
    </div>
  );
}

// Export the component registry for use in other parts of the application
export { componentRegistry };