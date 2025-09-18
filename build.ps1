# PowerShell build script for AWS Amplify
Write-Host "Starting build process..." -ForegroundColor Green

# Exit on any error
$ErrorActionPreference = "Stop"

try {
    # Install frontend dependencies
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm ci

    # Install backend dependencies
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm ci
    Set-Location ..

    # Build frontend
    Write-Host "Building frontend..." -ForegroundColor Yellow
    npm run build

    # Build backend
    Write-Host "Building backend..." -ForegroundColor Yellow
    Set-Location backend
    npm run build
    Set-Location ..

    # Create deployment structure
    Write-Host "Creating deployment structure..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "dist\backend" -Force | Out-Null
    Copy-Item -Path "backend\dist\*" -Destination "dist\backend\" -Recurse -Force
    Copy-Item -Path "backend\package.json" -Destination "dist\backend\" -Force
    
    # Copy backend node_modules if it exists
    if (Test-Path "backend\node_modules") {
        Copy-Item -Path "backend\node_modules" -Destination "dist\backend\" -Recurse -Force
    } else {
        Write-Host "Backend node_modules not found, will be installed at runtime" -ForegroundColor Yellow
    }

    Write-Host "Build completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}