# Quick deployment script for AWS Amplify
Write-Host "🚀 Preparing for AWS Amplify deployment..." -ForegroundColor Green

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not in a git repository. Please run this from the project root." -ForegroundColor Red
    exit 1
}

# Check if there are uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "📝 Found uncommitted changes:" -ForegroundColor Yellow
    Write-Host $gitStatus -ForegroundColor Gray
    
    $response = Read-Host "Do you want to commit these changes? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "📦 Adding all changes..." -ForegroundColor Yellow
        git add .
        
        $commitMessage = Read-Host "Enter commit message (or press Enter for default)"
        if ([string]::IsNullOrWhiteSpace($commitMessage)) {
            $commitMessage = "Deploy to AWS Amplify - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        }
        
        git commit -m $commitMessage
        Write-Host "✅ Changes committed" -ForegroundColor Green
    } else {
        Write-Host "❌ Deployment cancelled" -ForegroundColor Red
        exit 1
    }
}

# Push to GitHub
Write-Host "🌐 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "🔗 AWS Amplify will automatically start building..." -ForegroundColor Cyan
    Write-Host "📊 Check your Amplify console for build progress" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    exit 1
}
