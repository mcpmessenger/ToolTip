# Amplify Build Script for Windows
Write-Host "Starting Amplify build process..." -ForegroundColor Green

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm ci

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm ci
Set-Location ..

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
npm run build

# Build backend
Write-Host "Building backend..." -ForegroundColor Yellow
Set-Location backend
npm run build
Set-Location ..

# Create deployment structure
Write-Host "Creating deployment structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "dist\backend" -Force | Out-Null
Copy-Item -Path "backend\dist\*" -Destination "dist\backend\" -Recurse -Force
Copy-Item -Path "backend\package.json" -Destination "dist\backend\" -Force

# Copy backend node_modules if it exists
if (Test-Path "backend\node_modules") {
    Copy-Item -Path "backend\node_modules" -Destination "dist\backend\" -Recurse -Force
    Write-Host "Backend node_modules copied" -ForegroundColor Green
} else {
    Write-Host "Backend node_modules not found, will be installed at runtime" -ForegroundColor Yellow
}

# Create server.js
$serverJs = @'
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname)));

// API routes - try to load backend routes
try {
  const backendRoutes = require('./backend/index.js');
  app.use('/api', backendRoutes);
  console.log('Backend routes loaded successfully');
} catch (error) {
  console.error('Failed to load backend routes:', error.message);
  // Fallback API routes
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'Backend not available - using fallback',
      timestamp: new Date().toISOString()
    });
  });
  
  app.post('/api/chat', (req, res) => {
    res.json({ 
      message: 'AI chat service not available - backend not deployed',
      type: 'fallback'
    });
  });
  
  app.post('/api/crawl', (req, res) => {
    res.json({ 
      message: 'Crawl service not available - backend not deployed',
      type: 'fallback'
    });
  });
}

// Catch all handler: send back React's index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});
'@

$serverJs | Out-File -FilePath "dist\server.js" -Encoding UTF8

Write-Host "Amplify build completed successfully!" -ForegroundColor Green