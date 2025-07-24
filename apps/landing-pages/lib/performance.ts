import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

// Core Web Vitals thresholds
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  LCP: { good: 2500, poor: 4000 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function sendToAnalytics(metric: PerformanceMetric) {
  // In production, send to your analytics service
  if (process.env.NODE_ENV === 'development') {
    console.log('Performance Metric:', metric);
  }
  
  // Example: Send to Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      custom_parameter_1: metric.value,
      custom_parameter_2: metric.rating,
    });
  }
  
  // Example: Send to Vercel Analytics
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('track', 'Performance', {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
    });
  }
}

export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  getCLS((metric) => {
    const performanceMetric: PerformanceMetric = {
      name: 'CLS',
      value: metric.value,
      rating: getRating('CLS', metric.value),
      delta: metric.delta,
      id: metric.id,
    };
    sendToAnalytics(performanceMetric);
  });

  getFID((metric) => {
    const performanceMetric: PerformanceMetric = {
      name: 'FID',
      value: metric.value,
      rating: getRating('FID', metric.value),
      delta: metric.delta,
      id: metric.id,
    };
    sendToAnalytics(performanceMetric);
  });

  getFCP((metric) => {
    const performanceMetric: PerformanceMetric = {
      name: 'FCP',
      value: metric.value,
      rating: getRating('FCP', metric.value),
      delta: metric.delta,
      id: metric.id,
    };
    sendToAnalytics(performanceMetric);
  });

  getLCP((metric) => {
    const performanceMetric: PerformanceMetric = {
      name: 'LCP',
      value: metric.value,
      rating: getRating('LCP', metric.value),
      delta: metric.delta,
      id: metric.id,
    };
    sendToAnalytics(performanceMetric);
  });

  getTTFB((metric) => {
    const performanceMetric: PerformanceMetric = {
      name: 'TTFB',
      value: metric.value,
      rating: getRating('TTFB', metric.value),
      delta: metric.delta,
      id: metric.id,
    };
    sendToAnalytics(performanceMetric);
  });
}

// Performance budget checker for CI/CD
export const PERFORMANCE_BUDGET = {
  // Bundle sizes in KB
  maxBundleSize: 250,
  maxChunkSize: 150,
  maxAssetSize: 100,
  
  // Performance metrics in ms (except CLS which is unitless)
  maxLCP: 2500,
  maxFID: 100,
  maxCLS: 0.1,
  maxFCP: 1800,
  maxTTFB: 800,
};

export function checkPerformanceBudget(metrics: Record<string, number>): {
  passed: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  
  if (metrics.LCP > PERFORMANCE_BUDGET.maxLCP) {
    violations.push(`LCP (${metrics.LCP}ms) exceeds budget (${PERFORMANCE_BUDGET.maxLCP}ms)`);
  }
  
  if (metrics.FID > PERFORMANCE_BUDGET.maxFID) {
    violations.push(`FID (${metrics.FID}ms) exceeds budget (${PERFORMANCE_BUDGET.maxFID}ms)`);
  }
  
  if (metrics.CLS > PERFORMANCE_BUDGET.maxCLS) {
    violations.push(`CLS (${metrics.CLS}) exceeds budget (${PERFORMANCE_BUDGET.maxCLS})`);
  }
  
  if (metrics.FCP > PERFORMANCE_BUDGET.maxFCP) {
    violations.push(`FCP (${metrics.FCP}ms) exceeds budget (${PERFORMANCE_BUDGET.maxFCP}ms)`);
  }
  
  if (metrics.TTFB > PERFORMANCE_BUDGET.maxTTFB) {
    violations.push(`TTFB (${metrics.TTFB}ms) exceeds budget (${PERFORMANCE_BUDGET.maxTTFB}ms)`);
  }
  
  return {
    passed: violations.length === 0,
    violations,
  };
}