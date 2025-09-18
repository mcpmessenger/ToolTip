#!/bin/bash

# Amplify Build Script
echo "🚀 Starting Amplify build process..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm ci

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm ci
cd ..

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Build backend
echo "🔨 Building backend..."
cd backend
npm run build
cd ..

# Create deployment structure
echo "📁 Creating deployment structure..."
mkdir -p dist/backend
cp -r backend/dist/* dist/backend/
cp backend/package.json dist/backend/

# Copy backend node_modules if it exists
if [ -d "backend/node_modules" ]; then
    cp -r backend/node_modules dist/backend/
    echo "✅ Backend node_modules copied"
else
    echo "⚠️  Backend node_modules not found, will be installed at runtime"
fi

# Create server.js
cat > dist/server.js << 'EOF'
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
  console.log('✅ Backend routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load backend routes:', error.message);
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
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
});
EOF

echo "✅ Amplify build completed successfully!"
