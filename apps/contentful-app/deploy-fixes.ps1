#!/usr/bin/env pwsh

# Deployment script for Contentful App fixes
# This script deploys the fixes for the reported issues

Write-Host "🚀 Deploying Contentful App fixes..." -ForegroundColor Green

# Check if we're in the correct directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the apps/contentful-app directory" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Build the application
Write-Host "🔨 Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Deploy to Vercel
Write-Host "🌐 Deploying to Vercel..." -ForegroundColor Yellow
npx vercel --prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Fixes applied:" -ForegroundColor Cyan
Write-Host "  • Fixed CSP to allow fastly.picsum.photos images" -ForegroundColor White
Write-Host "  • Added entry creation for missing Contentful entries" -ForegroundColor White
Write-Host "  • Improved error handling in HeroBlockEditor" -ForegroundColor White
Write-Host "  • Enhanced popup blocker handling with clipboard fallback" -ForegroundColor White
Write-Host "  • Updated image placeholder services for better reliability" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "  • Test the preview functionality" -ForegroundColor White
Write-Host "  • Verify image loading works correctly" -ForegroundColor White
Write-Host "  • Check that missing entries are created automatically" -ForegroundColor White