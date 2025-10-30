# Direct Lambda Deployment using AWS CLI
Write-Host "🚀 Deploying Lambda function directly..." -ForegroundColor Green

# Build the project
Write-Host "🔨 Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
$zipFile = "tooltip-backend.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile
}

# Zip the dist folder and node_modules
Compress-Archive -Path "dist\*", "node_modules\*", "package.json" -DestinationPath $zipFile

# Create Lambda function
Write-Host "🌐 Creating Lambda function..." -ForegroundColor Yellow
$functionName = "tooltip-backend-api"
$roleArn = "arn:aws:iam::396608803476:role/lambda-execution-role"

# Check if function exists
$existingFunction = aws lambda get-function --function-name $functionName 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "📝 Updating existing function..." -ForegroundColor Yellow
    aws lambda update-function-code --function-name $functionName --zip-file fileb://$zipFile
} else {
    Write-Host "🆕 Creating new function..." -ForegroundColor Yellow
    aws lambda create-function `
        --function-name $functionName `
        --runtime nodejs18.x `
        --role $roleArn `
        --handler dist/lambda.handler `
        --zip-file fileb://$zipFile `
        --timeout 29 `
        --memory-size 1024
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Lambda function deployed successfully!" -ForegroundColor Green
    Write-Host "🔗 Function ARN: arn:aws:lambda:us-east-1:396608803476:function:$functionName" -ForegroundColor Cyan
} else {
    Write-Host "❌ Lambda deployment failed" -ForegroundColor Red
    Write-Host "💡 You may need to create the IAM role first" -ForegroundColor Yellow
}

# Clean up
Remove-Item $zipFile -ErrorAction SilentlyContinue
