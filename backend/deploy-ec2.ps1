# Deploy ToolTip Backend to EC2
param(
    [string]$InstanceIP = "54.221.64.51",
    [string]$KeyPath = "C:\Users\senti\.ssh\shinemlkey.pem"
)

Write-Host "🚀 Deploying ToolTip Backend to EC2..." -ForegroundColor Green
Write-Host "Instance IP: $InstanceIP" -ForegroundColor Cyan

# Build the project
Write-Host "🔨 Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
$deployDir = "deploy"
if (Test-Path $deployDir) {
    Remove-Item -Recurse -Force $deployDir
}
New-Item -ItemType Directory -Path $deployDir

# Copy necessary files
Copy-Item "dist" -Destination "$deployDir\dist" -Recurse
Copy-Item "package.json" -Destination "$deployDir\"
Copy-Item "package-lock.json" -Destination "$deployDir\"
Copy-Item "setup-ec2.sh" -Destination "$deployDir\"

# Create a simple start script
@"
#!/bin/bash
cd /home/ec2-user/tooltip-backend
npm install --production
npx playwright install chromium
sudo systemctl restart tooltip-backend
"@ | Out-File -FilePath "$deployDir\start.sh" -Encoding UTF8

# Copy files to EC2
Write-Host "📤 Copying files to EC2..." -ForegroundColor Yellow
scp -i $KeyPath -r $deployDir/* ec2-user@$InstanceIP:/home/ec2-user/tooltip-backend/

# Run setup script on EC2
Write-Host "⚙️ Running setup on EC2..." -ForegroundColor Yellow
ssh -i $KeyPath ec2-user@$InstanceIP "chmod +x /home/ec2-user/tooltip-backend/setup-ec2.sh && sudo /home/ec2-user/tooltip-backend/setup-ec2.sh"

# Test the deployment
Write-Host "🧪 Testing deployment..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "http://$InstanceIP:3001/health" -TimeoutSec 30
if ($response.StatusCode -eq 200) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🔗 Backend URL: http://$InstanceIP:3001" -ForegroundColor Cyan
    Write-Host "📊 Health check: http://$InstanceIP:3001/health" -ForegroundColor Cyan
} else {
    Write-Host "❌ Deployment test failed" -ForegroundColor Red
}

# Cleanup
Remove-Item -Recurse -Force $deployDir

Write-Host "🎉 Deployment complete!" -ForegroundColor Green

