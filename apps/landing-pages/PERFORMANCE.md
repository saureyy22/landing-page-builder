# Performance Optimization Guide

This document outlines the performance optimizations implemented in the Landing Pages application and how to use the monitoring tools.

## 🚀 Build Optimizations

### Next.js Configuration
- **SWC Minification**: Enabled for faster builds and smaller bundles
- **Bundle Splitting**: Optimized chunk splitting for better caching
- **Image Optimization**: WebP/AVIF formats with proper sizing
- **Compression**: Gzip compression enabled
- **Security Headers**: CSP, XSS protection, and frame options
- **Caching Headers**: Long-term caching for static assets

### Bundle Analysis
```bash
# Analyze bundle size and composition
npm run analyze

# Check performance budget compliance
npm run perf

# Full performance analysis
npm run build:performance
```

## ⚡ Core Web Vitals Monitoring

### Real-time Monitoring
The application includes automatic Core Web Vitals tracking:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms  
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FCP (First Contentful Paint)**: < 1.8s
- **TTFB (Time to First Byte)**: < 800ms

### Performance Scripts
```bash
# Monitor Core Web Vitals
npm run web-vitals

# Run all performance tests
npm run test:performance

# Generate performance dashboard
npm run dashboard
```

## 🏠 Lighthouse CI Integration

### Local Testing
```bash
# Run Lighthouse with production thresholds
npm run lighthouse:ci

# Run Lighthouse with relaxed local thresholds
npm run lighthouse:local
```

### CI/CD Integration
The GitHub Actions workflow automatically:
- Runs performance budget checks
- Executes Lighthouse audits
- Monitors Core Web Vitals
- Comments on PRs with results
- Fails builds that don't meet thresholds

### Thresholds
- **Performance Score**: ≥ 90
- **Accessibility Score**: ≥ 90
- **SEO Score**: ≥ 90
- **Best Practices Score**: ≥ 90

## 📊 Performance Budget

### Bundle Size Limits
- **Total Bundle**: 250 KB
- **Individual Chunks**: 150 KB
- **Assets**: 100 KB

### Core Web Vitals Targets
- **LCP**: ≤ 2500ms (Good), ≤ 4000ms (Needs Improvement)
- **FID**: ≤ 100ms (Good), ≤ 300ms (Needs Improvement)
- **CLS**: ≤ 0.1 (Good), ≤ 0.25 (Needs Improvement)

## 🛠️ Optimization Techniques

### Image Optimization
- Next.js Image component with automatic WebP/AVIF conversion
- Responsive image sizing with proper device breakpoints
- Lazy loading for below-the-fold images
- Contentful image transformations

### JavaScript Optimization
- Tree shaking to remove unused code
- Code splitting with dynamic imports
- Vendor chunk separation
- Minification and compression

### Caching Strategy
- Static assets: 1 year cache with immutable headers
- Pages: ISR with appropriate revalidation
- API responses: Short-term caching with proper headers

### SEO Optimizations
- Dynamic sitemap generation
- Structured data (JSON-LD)
- Meta tags and OpenGraph
- Semantic HTML structure

## 📈 Monitoring Dashboard

The performance dashboard provides a unified view of:
- Build performance metrics
- Core Web Vitals scores
- Lighthouse audit results
- Historical performance trends

Access the dashboard:
```bash
npm run dashboard
# Opens performance-dashboard.html in your browser
```

## 🚨 Troubleshooting

### Common Issues

**Bundle Size Too Large**
- Run `npm run analyze` to identify large dependencies
- Consider code splitting for non-critical features
- Review and optimize third-party libraries

**Poor Core Web Vitals**
- Check image optimization and sizing
- Review JavaScript execution timing
- Minimize layout shifts with proper CSS

**Lighthouse Failures**
- Review accessibility issues
- Check SEO metadata completeness
- Verify performance optimizations

### Performance Commands Reference

| Command | Description |
|---------|-------------|
| `npm run build:performance` | Full build analysis |
| `npm run perf` | Quick performance check |
| `npm run web-vitals` | Core Web Vitals monitoring |
| `npm run lighthouse:ci` | Production Lighthouse audit |
| `npm run lighthouse:local` | Development Lighthouse audit |
| `npm run analyze` | Bundle analysis |
| `npm run dashboard` | Performance dashboard |
| `npm run test:all` | Complete performance test suite |

## 🎯 Performance Goals

### Current Targets
- **Lighthouse Performance**: ≥ 90
- **Bundle Size**: ≤ 250 KB
- **LCP**: ≤ 2.5s
- **FID**: ≤ 100ms
- **CLS**: ≤ 0.1

### Monitoring Frequency
- **CI/CD**: Every build and PR
- **Production**: Continuous monitoring
- **Development**: On-demand testing

## 📋 Reports

Performance reports are generated in:
- `performance-report.json` - Build performance
- `web-vitals-report.json` - Core Web Vitals
- `performance-dashboard.html` - Unified dashboard
- `.lighthouseci/` - Lighthouse audit results

These reports can be integrated with monitoring services or used for performance tracking over time.