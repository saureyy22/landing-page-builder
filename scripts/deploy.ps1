# Deployment script for Contentful Landing Page Builder
# Usage: .\scripts\deploy.ps1 [version]

param(
    [string]$Version = "1.0.0"
)

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"

Write-Host "🚀 Starting deployment process for version $Version" -ForegroundColor $Green

# Validate version format (semantic versioning)
if ($Version -notmatch "^\d+\.\d+\.\d+$") {
    Write-Host "❌ Invalid version format. Please use semantic versioning (e.g., 1.0.0)" -ForegroundColor $Red
    exit 1
}

# Check if we're on main/master branch
$CurrentBranch = git branch --show-current
if ($CurrentBranch -ne "main" -and $CurrentBranch -ne "master") {
    Write-Host "⚠️  Warning: You're not on main/master branch. Current branch: $CurrentBranch" -ForegroundColor $Yellow
    $Continue = Read-Host "Continue anyway? (y/N)"
    if ($Continue -ne "y" -and $Continue -ne "Y") {
        Write-Host "❌ Deployment cancelled" -ForegroundColor $Red
        exit 1
    }
}

# Check for uncommitted changes
$GitStatus = git status --porcelain
if ($GitStatus) {
    Write-Host "❌ You have uncommitted changes. Please commit or stash them first." -ForegroundColor $Red
    git status --short
    exit 1
}

# Run tests and build checks
Write-Host "🔍 Running pre-deployment checks..." -ForegroundColor $Green

# Type check all packages
Write-Host "Running type checks..."
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Type check failed" -ForegroundColor $Red
    exit 1
}

# Build all packages
Write-Host "Building all packages..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor $Red
    exit 1
}

# Run linting
Write-Host "Running linting..."
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Linting failed" -ForegroundColor $Red
    exit 1
}

Write-Host "✅ All pre-deployment checks passed" -ForegroundColor $Green

# Create and push git tag
Write-Host "🏷️  Creating git tag v$Version..." -ForegroundColor $Green

# Check if tag already exists
$TagExists = git rev-parse "v$Version" 2>$null
if ($TagExists) {
    Write-Host "❌ Tag v$Version already exists" -ForegroundColor $Red
    exit 1
}

# Create annotated tag
git tag -a "v$Version" -m "Release version $Version"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create tag" -ForegroundColor $Red
    exit 1
}

# Push tag to origin
git push origin "v$Version"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push tag" -ForegroundColor $Red
    exit 1
}

Write-Host "✅ Git tag v$Version created and pushed" -ForegroundColor $Green

# Display deployment instructions
Write-Host "📋 Next steps:" -ForegroundColor $Green
Write-Host "1. Deploy Landing Pages:"
Write-Host "   cd apps/landing-pages && vercel --prod"
Write-Host ""
Write-Host "2. Deploy Contentful App:"
Write-Host "   cd apps/contentful-app && vercel --prod"
Write-Host ""
Write-Host "3. Update Contentful App configuration with new URLs"
Write-Host ""
Write-Host "🎉 Deployment preparation complete!" -ForegroundColor $Green

# Optional: Open deployment URLs
$OpenDashboard = Read-Host "Open Vercel dashboard? (y/N)"
if ($OpenDashboard -eq "y" -or $OpenDashboard -eq "Y") {
    Start-Process "https://vercel.com/dashboard"
}