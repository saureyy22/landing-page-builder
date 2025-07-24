import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    generateComponentId,
    createDefaultLayoutConfig,
    validateLayoutConfig,
    sortComponentsByOrder,
} from '../utils';
import { ComponentInstance, LayoutConfig, HeroBlockData, TwoColumnRowData, ImageGrid2x2Data, ContentfulAsset } from '../types';

// Mock data helpers
const createMockAsset = (): ContentfulAsset => ({
    sys: { id: 'mock-asset-id' },
    fields: {
        title: 'Mock Image',
        file: {
            url: 'https://example.com/image.jpg',
            details: { size: 1024, image: { width: 800, height: 600 } },
            fileName: 'image.jpg',
            contentType: 'image/jpeg'
        }
    }
});

const createMockHeroData = (): HeroBlockData => ({
    heading: 'Mock Heading',
    subtitle: 'Mock Subtitle',
    cta: { text: 'Click Me', url: '/mock' },
    backgroundImage: createMockAsset()
});

const createMockTwoColumnData = (): TwoColumnRowData => ({
    leftColumn: {
        heading: 'Left Heading',
        subtitle: 'Left Subtitle',
        cta: { text: 'Left CTA', url: '/left' }
    },
    rightColumn: { image: createMockAsset() }
});

const createMockImageGridData = (): ImageGrid2x2Data => ({
    images: [createMockAsset(), createMockAsset(), createMockAsset(), createMockAsset()]
});

describe('utils', () => {
    describe('generateComponentId', () => {
        it('should generate a unique ID with correct format', () => {
            const id1 = generateComponentId();
            const id2 = generateComponentId();

            expect(id1).toMatch(/^component-\d+-[a-z0-9]{9}$/);
            expect(id2).toMatch(/^component-\d+-[a-z0-9]{9}$/);
            expect(id1).not.toBe(id2);
        });

        it('should generate different IDs on subsequent calls', () => {
            const ids = Array.from({ length: 10 }, () => generateComponentId());
            const uniqueIds = new Set(ids);

            expect(uniqueIds.size).toBe(10);
        });
    });

    describe('createDefaultLayoutConfig', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should create a default layout config with correct structure', () => {
            const config = createDefaultLayoutConfig();

            expect(config).toEqual({
                components: [],
                version: '1.0.0',
                lastModified: '2024-01-01T00:00:00.000Z',
            });
        });

        it('should create empty components array', () => {
            const config = createDefaultLayoutConfig();

            expect(Array.isArray(config.components)).toBe(true);
            expect(config.components).toHaveLength(0);
        });
    });

    describe('validateLayoutConfig', () => {
        it('should return true for valid layout config', () => {
            const validConfig: LayoutConfig = {
                components: [],
                version: '1.0.0',
                lastModified: '2024-01-01T00:00:00.000Z',
            };

            expect(validateLayoutConfig(validConfig)).toBe(true);
        });

        it('should return false for null or undefined', () => {
            expect(validateLayoutConfig(null)).toBe(false);
            expect(validateLayoutConfig(undefined)).toBe(false);
        });

        it('should return false for non-object values', () => {
            expect(validateLayoutConfig('string')).toBe(false);
            expect(validateLayoutConfig(123)).toBe(false);
            expect(validateLayoutConfig(true)).toBe(false);
        });

        it('should return false when components is not an array', () => {
            const invalidConfig = {
                components: 'not-an-array',
                version: '1.0.0',
                lastModified: '2024-01-01T00:00:00.000Z',
            };

            expect(validateLayoutConfig(invalidConfig)).toBe(false);
        });

        it('should return false when version is not a string', () => {
            const invalidConfig = {
                components: [],
                version: 123,
                lastModified: '2024-01-01T00:00:00.000Z',
            };

            expect(validateLayoutConfig(invalidConfig)).toBe(false);
        });

        it('should return false when lastModified is not a string', () => {
            const invalidConfig = {
                components: [],
                version: '1.0.0',
                lastModified: new Date(),
            };

            expect(validateLayoutConfig(invalidConfig)).toBe(false);
        });

        it('should return false when required properties are missing', () => {
            expect(validateLayoutConfig({})).toBe(false);
            expect(validateLayoutConfig({ components: [] })).toBe(false);
            expect(validateLayoutConfig({ version: '1.0.0' })).toBe(false);
        });
    });

    describe('sortComponentsByOrder', () => {
        it('should sort components by order property in ascending order', () => {
            const components: ComponentInstance[] = [
                {
                    id: 'comp-3',
                    type: 'hero-block',
                    data: createMockHeroData(),
                    order: 3,
                },
                {
                    id: 'comp-1',
                    type: 'two-column-row',
                    data: createMockTwoColumnData(),
                    order: 1,
                },
                {
                    id: 'comp-2',
                    type: 'image-grid-2x2',
                    data: createMockImageGridData(),
                    order: 2,
                },
            ];

            const sorted = sortComponentsByOrder(components);

            expect(sorted.map(c => c.order)).toEqual([1, 2, 3]);
            expect(sorted.map(c => c.id)).toEqual(['comp-1', 'comp-2', 'comp-3']);
        });

        it('should not mutate the original array', () => {
            const components: ComponentInstance[] = [
                {
                    id: 'comp-2',
                    type: 'hero-block',
                    data: createMockHeroData(),
                    order: 2,
                },
                {
                    id: 'comp-1',
                    type: 'two-column-row',
                    data: createMockTwoColumnData(),
                    order: 1,
                },
            ];

            const originalOrder = components.map(c => c.order);
            sortComponentsByOrder(components);

            expect(components.map(c => c.order)).toEqual(originalOrder);
        });

        it('should handle empty array', () => {
            const result = sortComponentsByOrder([]);

            expect(result).toEqual([]);
        });

        it('should handle single component', () => {
            const components: ComponentInstance[] = [
                {
                    id: 'comp-1',
                    type: 'hero-block',
                    data: createMockHeroData(),
                    order: 1,
                },
            ];

            const sorted = sortComponentsByOrder(components);

            expect(sorted).toEqual(components);
            expect(sorted).not.toBe(components); // Should be a new array
        });

        it('should handle components with same order', () => {
            const components: ComponentInstance[] = [
                {
                    id: 'comp-1',
                    type: 'hero-block',
                    data: createMockHeroData(),
                    order: 1,
                },
                {
                    id: 'comp-2',
                    type: 'two-column-row',
                    data: createMockTwoColumnData(),
                    order: 1,
                },
            ];

            const sorted = sortComponentsByOrder(components);

            expect(sorted).toHaveLength(2);
            expect(sorted.every(c => c.order === 1)).toBe(true);
        });
    });
});