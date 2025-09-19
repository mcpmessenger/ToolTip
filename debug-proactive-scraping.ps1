# 🐛 Proactive Scraping Debug Script
# This script helps debug the proactive scraping system

Write-Host "🎯 Proactive Scraping Debug Script" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if backend is running
Write-Host "`n1. Checking Backend Status..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "✅ Backend is running on port 3001" -ForegroundColor Green
        $healthData = $healthResponse.Content | ConvertFrom-Json
        Write-Host "   Service: $($healthData.service)" -ForegroundColor Cyan
        Write-Host "   Timestamp: $($healthData.timestamp)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Backend health check failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Backend is not running or not accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test proactive scraping API
Write-Host "`n2. Testing Proactive Scraping API..." -ForegroundColor Yellow
try {
    $testUrl = "http://localhost:8082"
    $body = @{
        url = $testUrl
    } | ConvertTo-Json
    
    Write-Host "   Testing with URL: $testUrl" -ForegroundColor Cyan
    
    # Set timeout to 30 seconds
    $timeout = 30000
    $request = [System.Net.WebRequest]::Create("http://localhost:3001/api/proactive-scrape")
    $request.Method = "POST"
    $request.ContentType = "application/json"
    $request.Timeout = $timeout
    
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
    $request.ContentLength = $bodyBytes.Length
    
    $requestStream = $request.GetRequestStream()
    $requestStream.Write($bodyBytes, 0, $bodyBytes.Length)
    $requestStream.Close()
    
    $response = $request.GetResponse()
    $responseStream = $response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($responseStream)
    $responseContent = $reader.ReadToEnd()
    $reader.Close()
    $responseStream.Close()
    $response.Close()
    
    Write-Host "✅ Proactive scraping API responded" -ForegroundColor Green
    $responseData = $responseContent | ConvertFrom-Json
    Write-Host "   Success: $($responseData.success)" -ForegroundColor Cyan
    Write-Host "   Message: $($responseData.message)" -ForegroundColor Cyan
    
    if ($responseData.data) {
        Write-Host "   Total Elements: $($responseData.data.totalElements)" -ForegroundColor Cyan
        Write-Host "   Successful Previews: $($responseData.data.successfulPreviews)" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "❌ Proactive scraping API failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   This might be expected if the API is still processing..." -ForegroundColor Yellow
}

# Check if frontend is running
Write-Host "`n3. Checking Frontend Status..." -ForegroundColor Yellow
$frontendPorts = @(8082, 8083, 8084, 8085, 8086, 8087)
$runningFrontend = $false

foreach ($port in $frontendPorts) {
    try {
        $frontendResponse = Invoke-WebRequest -Uri "http://localhost:$port" -Method GET -TimeoutSec 5
        if ($frontendResponse.StatusCode -eq 200) {
            Write-Host "✅ Frontend is running on port $port" -ForegroundColor Green
            $runningFrontend = $true
            break
        }
    } catch {
        # Port not running, continue checking
    }
}

if (-not $runningFrontend) {
    Write-Host "❌ No frontend found on ports 8082-8087" -ForegroundColor Red
    Write-Host "   Please start the frontend with: npm run dev" -ForegroundColor Yellow
}

# Check for generated previews
Write-Host "`n4. Checking Generated Previews..." -ForegroundColor Yellow
$previewDir = "backend/proactive-previews"
if (Test-Path $previewDir) {
    $previewFiles = Get-ChildItem $previewDir -Filter "*.gif" | Measure-Object
    Write-Host "✅ Preview directory exists" -ForegroundColor Green
    Write-Host "   Generated previews: $($previewFiles.Count)" -ForegroundColor Cyan
} else {
    Write-Host "❌ Preview directory not found" -ForegroundColor Red
    Write-Host "   Directory: $previewDir" -ForegroundColor Yellow
}

# Summary
Write-Host "`n📊 Debug Summary" -ForegroundColor Green
Write-Host "===============" -ForegroundColor Green
Write-Host "Backend Status: $(if ($healthResponse.StatusCode -eq 200) { '✅ Running' } else { '❌ Not Running' })" -ForegroundColor $(if ($healthResponse.StatusCode -eq 200) { 'Green' } else { 'Red' })
Write-Host "API Status: $(if ($responseContent) { '✅ Responding' } else { '❌ Not Responding' })" -ForegroundColor $(if ($responseContent) { 'Green' } else { 'Red' })
Write-Host "Frontend Status: $(if ($runningFrontend) { '✅ Running' } else { '❌ Not Running' })" -ForegroundColor $(if ($runningFrontend) { 'Green' } else { 'Red' })
Write-Host "Previews Generated: $(if (Test-Path $previewDir) { '✅ Yes' } else { '❌ No' })" -ForegroundColor $(if (Test-Path $previewDir) { 'Green' } else { 'Red' })

Write-Host "`n🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "1. If backend is not running: cd backend; npm run dev" -ForegroundColor White
Write-Host "2. If frontend is not running: npm run dev" -ForegroundColor White
Write-Host "3. Open browser to http://localhost:8082" -ForegroundColor White
Write-Host "4. Look for green/gray toggle button next to settings" -ForegroundColor White
Write-Host "5. Enable 'Proactive Mode' and hover over buttons" -ForegroundColor White

Write-Host "`n🔍 For more debugging info, check:" -ForegroundColor Yellow
Write-Host "- Backend logs in terminal" -ForegroundColor White
Write-Host "- Browser console (F12)" -ForegroundColor White
Write-Host "- Network tab for API requests" -ForegroundColor White
Write-Host "- PROACTIVE_SCRAPING_DEBUG.md for detailed info" -ForegroundColor White
