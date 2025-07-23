'use client';

import { useEffect } from 'react';
import { initPerformanceMonitoring } from '../lib/performance';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Initialize performance monitoring on client side
    initPerformanceMonitoring();
  }, []);

  return null; // This component doesn't render anything
}