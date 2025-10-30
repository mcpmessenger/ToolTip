#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building ToolTip Library...\n');

try {
  // Clean dist directory
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }

  // Run TypeScript compilation
  console.log('📦 Compiling TypeScript...');
  execSync('tsc --noEmit', { stdio: 'inherit' });

  // Run Rollup build
  console.log('🔨 Building with Rollup...');
  execSync('rollup -c', { stdio: 'inherit' });

  // Generate type definitions
  console.log('📝 Generating type definitions...');
  execSync('rollup -c --config rollup.config.dts.js', { stdio: 'inherit' });

  // Copy additional files
  console.log('📋 Copying additional files...');
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  // Copy README to dist
  fs.copyFileSync('README.md', 'dist/README.md');

  console.log('\n✅ Build completed successfully!');
  console.log('📁 Output directory: dist/');
  console.log('📦 Main bundle: dist/index.js');
  console.log('📦 ESM bundle: dist/index.esm.js');
  console.log('📝 Type definitions: dist/index.d.ts');

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
