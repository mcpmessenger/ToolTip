# PowerShell script to start both frontend and backend in development mode

Write-Host "🚀 Starting ToolTip Companion Development Environment" -ForegroundColor Green
Write-Host ""

# Start backend in background
Write-Host "📡 Starting Backend API..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "🎨 Starting Frontend..." -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Both services should be running:" -ForegroundColor Green
Write-Host "   Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:8082" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both services" -ForegroundColor Red

# Start frontend in current window
npm run dev
