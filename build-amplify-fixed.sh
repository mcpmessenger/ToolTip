#!/bin/bash

# Enhanced build script for AWS Amplify with canvas dependency fixes
set -e

echo "🚀 Starting enhanced build process for ToolTip Companion v1.1"

# Install system dependencies for canvas
echo "📦 Installing system dependencies for canvas..."
sudo yum update -y
sudo yum install -y giflib-devel libjpeg-turbo-devel libpng-devel cairo-devel pango-devel

# Install frontend dependencies (using Amplify-specific package.json)
echo "📦 Installing frontend dependencies..."
cp package-amplify.json package.json
npm ci

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm ci
cd ..

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Build backend
echo "🏗️ Building backend..."
cd backend
npm run build
cd ..

# Create deployment structure
echo "📁 Creating deployment structure..."
mkdir -p dist/backend

# Copy backend files
echo "📋 Copying backend files..."
cp -r backend/dist/* dist/backend/
cp backend/package.json dist/backend/

# Copy backend node_modules (if they exist)
if [ -d "backend/node_modules" ]; then
    echo "📋 Copying backend node_modules..."
    cp -r backend/node_modules dist/backend/
else
    echo "⚠️ Backend node_modules not found, will be installed at runtime"
fi

# Ensure server.js exists
if [ ! -f "dist/server.js" ]; then
    echo "📋 Creating server.js..."
    cat > dist/server.js << 'EOF'
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname)));

// API routes
app.use('/api', require('./backend'));

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
EOF
fi

echo "✅ Build completed successfully!"
echo "📊 Build summary:"
echo "   - Frontend: Built and optimized"
echo "   - Backend: Built and packaged"
echo "   - Dependencies: Installed and configured"
echo "   - Canvas: System dependencies installed"
