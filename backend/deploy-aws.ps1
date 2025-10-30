# AWS Lambda Deployment Script
Write-Host "🚀 Deploying to AWS Lambda..." -ForegroundColor Green

# Check if AWS CLI is configured
Write-Host "Checking AWS CLI configuration..." -ForegroundColor Yellow
$awsIdentity = aws sts get-caller-identity 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ AWS CLI not configured. Please run 'aws configure' first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ AWS CLI configured" -ForegroundColor Green

# Check if Serverless Framework is installed
Write-Host "Checking Serverless Framework..." -ForegroundColor Yellow
$slsVersion = serverless --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Serverless Framework not installed. Installing..." -ForegroundColor Red
    npm install -g serverless
}

Write-Host "✅ Serverless Framework ready" -ForegroundColor Green

# Build the project
Write-Host "🔨 Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Deploy to AWS
Write-Host "🌐 Deploying to AWS..." -ForegroundColor Yellow
serverless deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully deployed to AWS Lambda!" -ForegroundColor Green
    Write-Host "🔗 Your API endpoint will be shown above" -ForegroundColor Cyan
    Write-Host "📊 Check AWS Console for logs and monitoring" -ForegroundColor Cyan
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}
