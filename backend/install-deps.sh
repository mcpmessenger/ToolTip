#!/bin/bash

# Install backend dependencies for GIF crawling
echo "Installing backend dependencies for GIF crawling..."

# Install Node.js dependencies
npm install

# Install Playwright browsers
echo "Installing Playwright browsers..."
npx playwright install chromium

# Create gifs directory
mkdir -p gifs

echo "Backend dependencies installed successfully!"
echo "You can now start the backend with: npm run dev"
