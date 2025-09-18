#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting build process..."

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
cp -r backend/package.json dist/backend/
cp -r backend/node_modules dist/backend/ 2>/dev/null || echo "Backend node_modules not found, will be installed at runtime"

# Create a simple server.js for the backend
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

// API routes
app.use('/api', require('./backend/index.js'));

// Catch all handler: send back React's index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
EOF

echo "✅ Build completed successfully!"
