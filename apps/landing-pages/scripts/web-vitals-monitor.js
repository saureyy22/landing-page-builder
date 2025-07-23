#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Core Web Vitals thresholds (in milliseconds, except CLS which is unitless)
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

function getRating(metric, value) {
  const threshold = THRESHOLDS[metric];
  if (!threshold) return 'unknown';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function formatValue(metric, value) {
  if (metric === 'CLS') {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
}

function runLighthouse(url) {
  try {
    console.log(`🔍 Running Lighthouse audit for ${url}...`);
    
    const result = execSync(
      `npx lighthouse ${url} --output=json --quiet --chrome-flags="--headless --no-sandbox"`,
      { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 }
    );
    
    return JSON.parse(result);
  } catch (error) {
    console.error(`Error running Lighthouse for ${url}:`, error.message);
    return null;
  }
}

function extractWebVitals(lighthouseResult) {
  if (!lighthouseResult || !lighthouseResult.audits) {
    return null;
  }
  
  const audits = lighthouseResult.audits;
  
  return {
    LCP: audits['largest-contentful-paint']?.numericValue || 0,
    FID: audits['max-potential-fid']?.numericValue || 0, // Lighthouse uses max-potential-fid as FID proxy
    CLS: audits['cumulative-layout-shift']?.numericValue || 0,
    FCP: audits['first-contentful-paint']?.numericValue || 0,
    TTFB: audits['server-response-time']?.numericValue || 0,
    SI: audits['speed-index']?.numericValue || 0,
    TTI: audits['interactive']?.numericValue || 0,
  };
}

function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    results: [],
    summary: {
      totalPages: results.length,
      passedPages: 0,
      failedPages: 0,
      averageScores: {},
    },
  };
  
  const allMetrics = {};
  
  results.forEach(result => {
    if (!result.webVitals) return;
    
    const pageReport = {
      url: result.url,
      webVitals: {},
      passed: true,
    };
    
    Object.entries(result.webVitals).forEach(([metric, value]) => {
      const rating = getRating(metric, value);
      pageReport.webVitals[metric] = {
        value,
        rating,
        formatted: formatValue(metric, value),
      };
      
      if (rating === 'poor') {
        pageReport.passed = false;
      }
      
      if (!allMetrics[metric]) allMetrics[metric] = [];
      allMetrics[metric].push(value);
    });
    
    report.results.push(pageReport);
    
    if (pageReport.passed) {
      report.summary.passedPages++;
    } else {
      report.summary.failedPages++;
    }
  });
  
  // Calculate averages
  Object.entries(allMetrics).forEach(([metric, values]) => {
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    report.summary.averageScores[metric] = {
      value: average,
      rating: getRating(metric, average),
      formatted: formatValue(metric, average),
    };
  });
  
  return report;
}

function printReport(report) {
  console.log('\n📊 Core Web Vitals Report');
  console.log('═'.repeat(50));
  
  console.log(`\n📈 Summary:`);
  console.log(`Total Pages: ${report.summary.totalPages}`);
  console.log(`Passed: ${report.summary.passedPages} ✅`);
  console.log(`Failed: ${report.summary.failedPages} ❌`);
  
  console.log(`\n📊 Average Scores:`);
  Object.entries(report.summary.averageScores).forEach(([metric, data]) => {
    const icon = data.rating === 'good' ? '✅' : data.rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(`${icon} ${metric}: ${data.formatted} (${data.rating})`);
  });
  
  console.log(`\n📄 Page Results:`);
  report.results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`\n${status} ${result.url}`);
    
    Object.entries(result.webVitals).forEach(([metric, data]) => {
      const icon = data.rating === 'good' ? '✅' : data.rating === 'needs-improvement' ? '⚠️' : '❌';
      console.log(`  ${icon} ${metric}: ${data.formatted}`);
    });
  });
  
  if (report.summary.failedPages > 0) {
    console.log(`\n💡 Recommendations:`);
    console.log(`• Optimize images and use next/image`);
    console.log(`• Minimize JavaScript bundle size`);
    console.log(`• Use proper caching strategies`);
    console.log(`• Optimize server response times`);
    console.log(`• Avoid layout shifts with proper sizing`);
  }
}

async function main() {
  const urls = [
    'http://localhost:3000',
    'http://localhost:3000/landing/page-1',
    'http://localhost:3000/landing/page-2',
  ];
  
  console.log('🚀 Starting Core Web Vitals monitoring...');
  console.log(`Testing ${urls.length} URLs`);
  
  const results = [];
  
  for (const url of urls) {
    const lighthouseResult = runLighthouse(url);
    if (lighthouseResult) {
      const webVitals = extractWebVitals(lighthouseResult);
      results.push({ url, webVitals });
    }
  }
  
  if (results.length === 0) {
    console.error('❌ No results collected. Make sure the server is running.');
    process.exit(1);
  }
  
  const report = generateReport(results);
  printReport(report);
  
  // Save report to file
  const reportPath = path.join(process.cwd(), 'web-vitals-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📋 Report saved to ${reportPath}`);
  
  // Exit with error code if any pages failed
  if (report.summary.failedPages > 0) {
    console.log(`\n❌ ${report.summary.failedPages} page(s) failed Core Web Vitals thresholds`);
    if (process.env.CI) {
      process.exit(1);
    }
  } else {
    console.log(`\n✅ All pages passed Core Web Vitals thresholds!`);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Error running Web Vitals monitor:', error);
    process.exit(1);
  });
}

module.exports = { main };