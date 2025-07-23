# Start both development servers
Write-Host "Starting Contentful Landing Page Builder..." -ForegroundColor Green

# Start Contentful App (Vite) in background
Write-Host "Starting Contentful App on http://localhost:3001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\saura\Desktop\landing-page-builder\apps\contentful-app'; npm run dev"

# Wait a moment
Start-Sleep -Seconds 3

# Start Landing Pages (Next.js) in background  
Write-Host "Starting Landing Pages on http://localhost:3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\saura\Desktop\landing-page-builder\apps\landing-pages'; npm run dev"

Write-Host ""
Write-Host "Both servers are starting up!" -ForegroundColor Green
Write-Host "Contentful App: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Landing Pages: http://localhost:3000" -ForegroundColor Cyan