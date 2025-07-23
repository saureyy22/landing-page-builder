#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function generatePerformanceDashboard() {
  console.log('🚀 Generating Performance Dashboard...\n');
  
  const reports = {
    build: null,
    webVitals: null,
    lighthouse: null,
  };
  
  // Load build performance report
  const buildReportPath = path.join(process.cwd(), 'performance-report.json');
  if (fs.existsSync(buildReportPath)) {
    reports.build = JSON.parse(fs.readFileSync(buildReportPath, 'utf8'));
    console.log('✅ Build performance report loaded');
  } else {
    console.log('⚠️ Build performance report not found');
  }
  
  // Load web vitals report
  const webVitalsReportPath = path.join(process.cwd(), 'web-vitals-report.json');
  if (fs.existsSync(webVitalsReportPath)) {
    reports.webVitals = JSON.parse(fs.readFileSync(webVitalsReportPath, 'utf8'));
    console.log('✅ Web Vitals report loaded');
  } else {
    console.log('⚠️ Web Vitals report not found');
  }
  
  // Load Lighthouse CI report
  const lhciPath = path.join(process.cwd(), '.lighthouseci');
  if (fs.existsSync(lhciPath)) {
    const manifestPath = path.join(lhciPath, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      reports.lighthouse = manifest;
      console.log('✅ Lighthouse CI report loaded');
    }
  } else {
    console.log('⚠️ Lighthouse CI report not found');
  }
  
  // Generate HTML dashboard
  const html = generateDashboardHTML(reports);
  const dashboardPath = path.join(process.cwd(), 'performance-dashboard.html');
  fs.writeFileSync(dashboardPath, html);
  
  console.log(`\n📊 Performance dashboard generated: ${dashboardPath}`);
  console.log('Open this file in your browser to view the dashboard');
  
  // Generate summary
  generateSummary(reports);
}

function generateDashboardHTML(reports) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .metric:last-child {
            border-bottom: none;
        }
        .metric-name {
            font-weight: 500;
        }
        .metric-value {
            font-weight: bold;
        }
        .good { color: #22c55e; }
        .needs-improvement { color: #f59e0b; }
        .poor { color: #ef4444; }
        .status-good { background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; }
        .status-warn { background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; }
        .status-error { background: #fecaca; color: #991b1b; padding: 4px 8px; border-radius: 4px; }
        .timestamp {
            color: #666;
            font-size: 14px;
        }
        h1, h2 {
            margin-top: 0;
        }
        .no-data {
            color: #666;
            font-style: italic;
            text-align: center;
            padding: 40px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Performance Dashboard</h1>
            <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="grid">
            ${generateBuildCard(reports.build)}
            ${generateWebVitalsCard(reports.webVitals)}
            ${generateLighthouseCard(reports.lighthouse)}
        </div>
    </div>
</body>
</html>`;
}

function generateBuildCard(buildReport) {
  if (!buildReport) {
    return `
      <div class="card">
        <h2>📦 Build Performance</h2>
        <div class="no-data">No build performance data available</div>
      </div>`;
  }
  
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const statusClass = buildReport.passed ? 'status-good' : 'status-error';
  const statusText = buildReport.passed ? 'Passed' : 'Failed';
  
  return `
    <div class="card">
      <h2>📦 Build Performance</h2>
      <div class="metric">
        <span class="metric-name">Status</span>
        <span class="metric-value ${statusClass}">${statusText}</span>
      </div>
      <div class="metric">
        <span class="metric-name">Total Bundle Size</span>
        <span class="metric-value">${formatBytes(buildReport.totalSize)}</span>
      </div>
      <div class="metric">
        <span class="metric-name">Violations</span>
        <span class="metric-value">${buildReport.violations.length}</span>
      </div>
      ${buildReport.violations.length > 0 ? `
        <h3>Violations:</h3>
        <ul>
          ${buildReport.violations.map(v => `<li>${v}</li>`).join('')}
        </ul>
      ` : ''}
    </div>`;
}

function generateWebVitalsCard(webVitalsReport) {
  if (!webVitalsReport) {
    return `
      <div class="card">
        <h2>⚡ Core Web Vitals</h2>
        <div class="no-data">No Web Vitals data available</div>
      </div>`;
  }
  
  const summary = webVitalsReport.summary;
  
  return `
    <div class="card">
      <h2>⚡ Core Web Vitals</h2>
      <div class="metric">
        <span class="metric-name">Pages Tested</span>
        <span class="metric-value">${summary.totalPages}</span>
      </div>
      <div class="metric">
        <span class="metric-name">Passed</span>
        <span class="metric-value good">${summary.passedPages}</span>
      </div>
      <div class="metric">
        <span class="metric-name">Failed</span>
        <span class="metric-value poor">${summary.failedPages}</span>
      </div>
      
      <h3>Average Scores:</h3>
      ${Object.entries(summary.averageScores).map(([metric, data]) => `
        <div class="metric">
          <span class="metric-name">${metric}</span>
          <span class="metric-value ${data.rating}">${data.formatted}</span>
        </div>
      `).join('')}
    </div>`;
}

function generateLighthouseCard(lighthouseReport) {
  if (!lighthouseReport) {
    return `
      <div class="card">
        <h2>🏠 Lighthouse Scores</h2>
        <div class="no-data">No Lighthouse data available</div>
      </div>`;
  }
  
  return `
    <div class="card">
      <h2>🏠 Lighthouse Scores</h2>
      <div class="no-data">Lighthouse data structure varies - check .lighthouseci/ folder for detailed reports</div>
    </div>`;
}

function generateSummary(reports) {
  console.log('\n📊 Performance Summary');
  console.log('═'.repeat(50));
  
  // Build Performance
  if (reports.build) {
    const status = reports.build.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`📦 Build Performance: ${status}`);
    console.log(`   Bundle Size: ${(reports.build.totalSize / 1024).toFixed(2)} KB`);
    console.log(`   Violations: ${reports.build.violations.length}`);
  }
  
  // Web Vitals
  if (reports.webVitals) {
    const { passedPages, failedPages, totalPages } = reports.webVitals.summary;
    const status = failedPages === 0 ? '✅ PASSED' : '❌ FAILED';
    console.log(`⚡ Core Web Vitals: ${status}`);
    console.log(`   Pages: ${passedPages}/${totalPages} passed`);
    
    Object.entries(reports.webVitals.summary.averageScores).forEach(([metric, data]) => {
      const icon = data.rating === 'good' ? '✅' : data.rating === 'needs-improvement' ? '⚠️' : '❌';
      console.log(`   ${metric}: ${data.formatted} ${icon}`);
    });
  }
  
  // Overall Status
  const buildPassed = !reports.build || reports.build.passed;
  const webVitalsPassed = !reports.webVitals || reports.webVitals.summary.failedPages === 0;
  const overallPassed = buildPassed && webVitalsPassed;
  
  console.log('\n🎯 Overall Status');
  console.log('─'.repeat(30));
  console.log(`${overallPassed ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED'}`);
  
  if (!overallPassed) {
    console.log('\n💡 Next Steps:');
    if (!buildPassed) {
      console.log('• Optimize bundle size and reduce unused code');
    }
    if (!webVitalsPassed) {
      console.log('• Improve Core Web Vitals scores');
    }
    console.log('• Run individual reports for detailed analysis');
  }
}

if (require.main === module) {
  generatePerformanceDashboard();
}

module.exports = { generatePerformanceDashboard };