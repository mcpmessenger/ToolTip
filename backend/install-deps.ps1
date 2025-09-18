# Install backend dependencies for GIF crawling
Write-Host "Installing backend dependencies for GIF crawling..." -ForegroundColor Green

# Install Node.js dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
npm install

# Install Playwright browsers
Write-Host "Installing Playwright browsers..." -ForegroundColor Yellow
npx playwright install chromium

# Create gifs directory
Write-Host "Creating gifs directory..." -ForegroundColor Yellow
if (!(Test-Path "gifs")) {
    New-Item -ItemType Directory -Path "gifs"
}

Write-Host "Backend dependencies installed successfully!" -ForegroundColor Green
Write-Host "New features:" -ForegroundColor Cyan
Write-Host "  - Actual GIF generation with animation" -ForegroundColor White
Write-Host "  - Smart caching for performance" -ForegroundColor White
Write-Host "  - Cache management endpoints" -ForegroundColor White
Write-Host "  - No Supabase dependency required" -ForegroundColor White
Write-Host "You can now start the backend with: npm run dev" -ForegroundColor Cyan
