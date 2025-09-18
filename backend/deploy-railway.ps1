# Railway Deployment Script
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Green

# Check if Railway CLI is installed
$railwayVersion = railway --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "📦 Installing Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

# Login to Railway
Write-Host "🔐 Logging into Railway..." -ForegroundColor Yellow
railway login

# Initialize Railway project
Write-Host "🚂 Initializing Railway project..." -ForegroundColor Yellow
railway init

# Set environment variables
Write-Host "🔧 Setting environment variables..." -ForegroundColor Yellow
railway variables set NODE_ENV=production
railway variables set PORT=3001

Write-Host "📝 Please set these environment variables in Railway dashboard:" -ForegroundColor Yellow
Write-Host "   - SUPABASE_URL" -ForegroundColor Cyan
Write-Host "   - SUPABASE_ANON_KEY" -ForegroundColor Cyan
Write-Host "   - OPENAI_API_KEY" -ForegroundColor Cyan

# Deploy
Write-Host "🌐 Deploying to Railway..." -ForegroundColor Yellow
railway up

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully deployed to Railway!" -ForegroundColor Green
    Write-Host "🔗 Your API URL will be shown above" -ForegroundColor Cyan
} else {
    Write-Host "❌ Railway deployment failed" -ForegroundColor Red
}
