$body = @{url = 'http://172.24.96.1:8087'} | ConvertTo-Json
Write-Host "Testing fresh scan for View Documentation button..." -ForegroundColor Green

try {
    $response = Invoke-WebRequest -Uri 'http://127.0.0.1:3001/api/after-capture/fresh-scan' -Method POST -Headers @{'Content-Type'='application/json'} -Body $body -TimeoutSec 120
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "Success:" $data.success -ForegroundColor Green
    Write-Host "Total Elements:" $data.data.totalElements -ForegroundColor Yellow
    Write-Host "Successful Results:" $data.data.successfulResults -ForegroundColor Yellow
    Write-Host "Failed Results:" $data.data.failedResults -ForegroundColor Yellow
    Write-Host "Results Count:" $data.data.results.Count -ForegroundColor Yellow
    
    # Check for external navigation results
    $externalResults = $data.data.results | Where-Object { $_.isExternalNavigation -eq $true }
    Write-Host "External Results:" $externalResults.Count -ForegroundColor Cyan
    
    if ($externalResults.Count -gt 0) {
        Write-Host "External navigation results:" -ForegroundColor Green
        foreach ($result in $externalResults) {
            Write-Host "  - $($result.elementId): $($result.externalUrl) ($($result.success))" -ForegroundColor White
        }
    } else {
        Write-Host "No external navigation results found" -ForegroundColor Red
    }
    
    # Check for view-documentation-button specifically
    $viewDocResult = $data.data.results | Where-Object { $_.elementId -like "*view-documentation*" }
    if ($viewDocResult) {
        Write-Host "View Documentation button found:" -ForegroundColor Green
        Write-Host "  - Element ID: $($viewDocResult.elementId)" -ForegroundColor White
        Write-Host "  - Success: $($viewDocResult.success)" -ForegroundColor White
        Write-Host "  - External Navigation: $($viewDocResult.isExternalNavigation)" -ForegroundColor White
        Write-Host "  - External URL: $($viewDocResult.externalUrl)" -ForegroundColor White
    } else {
        Write-Host "View Documentation button NOT found in results" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
