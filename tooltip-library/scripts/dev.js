#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Starting development mode...\n');

try {
  // Start Rollup in watch mode
  execSync('rollup -c -w', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Development mode failed:', error.message);
  process.exit(1);
}
