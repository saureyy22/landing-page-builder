import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

export function initPerformanceMonitoring() {
  // Core Web Vitals
  getCLS(onPerfEntry);
  getFID(onPerfEntry);
  getFCP(onPerfEntry);
  getLCP(onPerfEntry);
  getTTFB(onPerfEntry);
}

function onPerfEntry(metric: any) {
  const perfMetric: PerformanceMetric = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    timestamp: Date.now(),
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Performance Metric:', perfMetric);
  }

  // Send to analytics service in production
  if (process.env.NODE_ENV === 'production') {
    sendToAnalytics(perfMetric);
  }
}

function sendToAnalytics(metric: PerformanceMetric) {
  // Implement your analytics service integration here
  // Example: Google Analytics, DataDog, etc.
  console.log('Sending to analytics:', metric);
}

export function reportWebVitals(metric: any) {
  onPerfEntry(metric);
}