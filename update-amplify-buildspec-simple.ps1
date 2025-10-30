# Simple script to update Amplify build settings
# Usage: .\update-amplify-buildspec-simple.ps1 -AppId "your-app-id" -BranchName "main"

param(
    [Parameter(Mandatory=$true)]
    [string]$AppId,
    
    [Parameter(Mandatory=$false)]
    [string]$BranchName = "main"
)

Write-Host "🚀 Updating Amplify build settings..." -ForegroundColor Cyan
Write-Host "App ID: $AppId" -ForegroundColor Gray
Write-Host "Branch: $BranchName" -ForegroundColor Gray

# Check if amplify.yml exists
if (-not (Test-Path "amplify.yml")) {
    Write-Host "❌ amplify.yml not found!" -ForegroundColor Red
    exit 1
}

# Read amplify.yml content
$buildSpec = Get-Content "amplify.yml" -Raw

Write-Host "📝 Reading amplify.yml..." -ForegroundColor Yellow

# Update the branch
Write-Host "⚙️  Updating Amplify branch configuration..." -ForegroundColor Yellow

try {
    $result = aws amplify update-branch `
        --app-id $AppId `
        --branch-name $BranchName `
        --build-spec $buildSpec 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ SUCCESS! Amplify branch updated!" -ForegroundColor Green
        Write-Host ""
        Write-Host "The branch '$BranchName' is now configured to use amplify.yml" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Go to: https://console.aws.amazon.com/amplify/" -ForegroundColor White
        Write-Host "  2. Select your app and trigger a new build" -ForegroundColor White
        Write-Host "  3. Or wait for the next automatic build" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Failed to update build settings" -ForegroundColor Red
        Write-Host ""
        Write-Host "Output: $result" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Possible reasons:" -ForegroundColor Yellow
        Write-Host "  • Wrong App ID or Branch Name" -ForegroundColor White
        Write-Host "  • Missing amplify:UpdateBranch permission" -ForegroundColor White
        Write-Host "  • AWS credentials not configured" -ForegroundColor White
        Write-Host ""
        Write-Host "Alternative: Update manually in Amplify Console" -ForegroundColor Cyan
        Write-Host "  App Settings > Build settings > Edit > Use amplify.yml" -ForegroundColor Gray
        exit 1
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}


