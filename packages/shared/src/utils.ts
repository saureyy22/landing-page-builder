import { ComponentInstance, LayoutConfig } from './types';

/**
 * Generates a unique ID for component instances
 */
export function generateComponentId(): string {
  return `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Creates a new layout configuration with default values
 */
export function createDefaultLayoutConfig(): LayoutConfig {
  return {
    components: [],
    version: '1.0.0',
    lastModified: new Date().toISOString(),
  };
}

/**
 * Validates a layout configuration structure
 */
export function validateLayoutConfig(config: any): config is LayoutConfig {
  return (
    config != null &&
    typeof config === 'object' &&
    Array.isArray(config.components) &&
    typeof config.version === 'string' &&
    typeof config.lastModified === 'string'
  );
}

/**
 * Sorts components by their order property
 */
export function sortComponentsByOrder(components: ComponentInstance[]): ComponentInstance[] {
  return [...components].sort((a, b) => a.order - b.order);
}