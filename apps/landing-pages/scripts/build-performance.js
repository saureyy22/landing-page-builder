#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PERFORMANCE_BUDGET = {
  // Bundle sizes in bytes
  maxBundleSize: 250 * 1024, // 250KB
  maxChunkSize: 150 * 1024,  // 150KB
  maxAssetSize: 100 * 1024,  // 100KB
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBuildOutput() {
  const buildOutputPath = path.join(process.cwd(), '.next');
  
  if (!fs.existsSync(buildOutputPath)) {
    console.error('Build output not found. Please run "npm run build" first.');
    process.exit(1);
  }

  console.log('🔍 Analyzing build performance...\n');

  // Analyze static chunks
  const staticPath = path.join(buildOutputPath, 'static', 'chunks');
  const violations = [];
  let totalSize = 0;

  if (fs.existsSync(staticPath)) {
    const chunks = fs.readdirSync(staticPath);
    
    console.log('📦 JavaScript Chunks:');
    console.log('─'.repeat(60));
    
    chunks.forEach(chunk => {
      if (chunk.endsWith('.js')) {
        const chunkPath = path.join(staticPath, chunk);
        const stats = fs.statSync(chunkPath);
        const size = stats.size;
        totalSize += size;
        
        const status = size > PERFORMANCE_BUDGET.maxChunkSize ? '❌' : '✅';
        console.log(`${status} ${chunk}: ${formatBytes(size)}`);
        
        if (size > PERFORMANCE_BUDGET.maxChunkSize) {
          violations.push(`Chunk ${chunk} (${formatBytes(size)}) exceeds budget (${formatBytes(PERFORMANCE_BUDGET.maxChunkSize)})`);
        }
      }
    });
  }

  // Analyze pages
  const pagesPath = path.join(buildOutputPath, 'static', 'chunks', 'pages');
  if (fs.existsSync(pagesPath)) {
    const pages = fs.readdirSync(pagesPath);
    
    console.log('\n📄 Page Chunks:');
    console.log('─'.repeat(60));
    
    pages.forEach(page => {
      if (page.endsWith('.js')) {
        const pagePath = path.join(pagesPath, page);
        const stats = fs.statSync(pagePath);
        const size = stats.size;
        totalSize += size;
        
        const status = size > PERFORMANCE_BUDGET.maxAssetSize ? '❌' : '✅';
        console.log(`${status} ${page}: ${formatBytes(size)}`);
        
        if (size > PERFORMANCE_BUDGET.maxAssetSize) {
          violations.push(`Page ${page} (${formatBytes(size)}) exceeds budget (${formatBytes(PERFORMANCE_BUDGET.maxAssetSize)})`);
        }
      }
    });
  }

  console.log('\n📊 Build Summary:');
  console.log('─'.repeat(60));
  console.log(`Total JavaScript size: ${formatBytes(totalSize)}`);
  
  const budgetStatus = totalSize > PERFORMANCE_BUDGET.maxBundleSize ? '❌' : '✅';
  console.log(`${budgetStatus} Bundle size budget: ${formatBytes(PERFORMANCE_BUDGET.maxBundleSize)}`);
  
  if (totalSize > PERFORMANCE_BUDGET.maxBundleSize) {
    violations.push(`Total bundle size (${formatBytes(totalSize)}) exceeds budget (${formatBytes(PERFORMANCE_BUDGET.maxBundleSize)})`);
  }

  // Report violations
  if (violations.length > 0) {
    console.log('\n🚨 Performance Budget Violations:');
    console.log('─'.repeat(60));
    violations.forEach(violation => {
      console.log(`❌ ${violation}`);
    });
    
    console.log('\n💡 Suggestions:');
    console.log('• Run "npm run analyze" to see detailed bundle analysis');
    console.log('• Consider code splitting for large components');
    console.log('• Review and optimize large dependencies');
    console.log('• Use dynamic imports for non-critical code');
    
    if (process.env.CI) {
      process.exit(1);
    }
  } else {
    console.log('\n✅ All performance budgets are within limits!');
  }

  // Generate performance report
  const report = {
    timestamp: new Date().toISOString(),
    totalSize,
    violations,
    budgets: PERFORMANCE_BUDGET,
    passed: violations.length === 0,
  };

  fs.writeFileSync(
    path.join(process.cwd(), 'performance-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('\n📋 Performance report saved to performance-report.json');
}

function main() {
  try {
    analyzeBuildOutput();
  } catch (error) {
    console.error('Error analyzing build performance:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeBuildOutput };