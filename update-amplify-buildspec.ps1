# PowerShell script to update Amplify branch build settings
# Usage: .\update-amplify-buildspec.ps1 -AppId <AMPLIFY_APP_ID> -BranchName <BRANCH_NAME>

param(
    [Parameter(Mandatory=$false)]
    [string]$AppId = $env:AMPLIFY_APP_ID,
    
    [Parameter(Mandatory=$false)]
    [string]$BranchName = $env:AMPLIFY_BRANCH_NAME
)

# Check if AppId is provided
if ([string]::IsNullOrEmpty($AppId)) {
    Write-Host "❌ AMPLIFY_APP_ID is required" -ForegroundColor Red
    Write-Host "Provide it as a parameter: -AppId <your-app-id>" -ForegroundColor Yellow
    Write-Host "Or set it as environment variable: `$env:AMPLIFY_APP_ID" -ForegroundColor Yellow
    exit 1
}

# Use 'main' as default branch if not provided
if ([string]::IsNullOrEmpty($BranchName)) {
    $BranchName = "main"
    Write-Host "⚠️  No branch name provided, using 'main'" -ForegroundColor Yellow
}

Write-Host "🔧 Updating Amplify build settings..." -ForegroundColor Cyan
Write-Host "App ID: $AppId" -ForegroundColor Gray
Write-Host "Branch: $BranchName" -ForegroundColor Gray

# Check if amplify.yml exists
if (-not (Test-Path "amplify.yml")) {
    Write-Host "❌ amplify.yml file not found in current directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found amplify.yml" -ForegroundColor Green

# Read the amplify.yml content
$buildSpecContent = Get-Content "amplify.yml" -Raw

Write-Host "📝 Updating Amplify branch build specification..." -ForegroundColor Cyan

# Update the branch build specification
try {
    $result = aws amplify update-branch `
        --app-id $AppId `
        --branch-name $BranchName `
        --build-spec $buildSpecContent `
        2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully updated Amplify build settings!" -ForegroundColor Green
        Write-Host "`nThe branch '$BranchName' is now configured to use amplify.yml" -ForegroundColor Cyan
        Write-Host "`nNext steps:" -ForegroundColor Yellow
        Write-Host "1. Go to Amplify Console and trigger a new build" -ForegroundColor White
        Write-Host "2. Or wait for the next automatic build" -ForegroundColor White
        Write-Host "3. Check the build logs to verify it uses 'npm install' instead of 'npm ci'" -ForegroundColor White
    } else {
        Write-Host "❌ Failed to update build settings" -ForegroundColor Red
        Write-Host "Error: $result" -ForegroundColor Red
        Write-Host "`nCommon issues:" -ForegroundColor Yellow
        Write-Host "- Check that your AWS credentials are configured (aws configure)" -ForegroundColor White
        Write-Host "- Verify you have amplify:UpdateBranch permission" -ForegroundColor White
        Write-Host "- Ensure the App ID and Branch Name are correct" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "❌ Error occurred: $_" -ForegroundColor Red
    exit 1
}


