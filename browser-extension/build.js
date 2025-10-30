const fs = require('fs');
const path = require('path');

// Build script for ToolTip Companion Browser Extension
class ExtensionBuilder {
  constructor() {
    this.sourceDir = __dirname;
    this.distDir = path.join(__dirname, 'dist');
    this.filesToCopy = [
      'manifest.json',
      'background.js',
      'content.js',
      'injected-tooltip.js',
      'injected-tooltip.css',
      'popup.html',
      'popup.js'
    ];
  }

  async build() {
    console.log('🔨 Building ToolTip Companion Browser Extension...');
    
    try {
      // Create dist directory
      await this.createDistDirectory();
      
      // Copy files
      await this.copyFiles();
      
      // Create icons directory and placeholder icons
      await this.createIcons();
      
      // Validate manifest
      await this.validateManifest();
      
      console.log('✅ Extension built successfully!');
      console.log(`📦 Output directory: ${this.distDir}`);
      console.log('\n📋 Next steps:');
      console.log('1. Load the extension in Chrome:');
      console.log('   - Open chrome://extensions/');
      console.log('   - Enable "Developer mode"');
      console.log('   - Click "Load unpacked"');
      console.log('   - Select the dist/ folder');
      console.log('2. Start the backend server:');
      console.log('   - cd ../backend && npm run dev');
      console.log('3. Test the extension on any webpage!');
      
    } catch (error) {
      console.error('❌ Build failed:', error);
      process.exit(1);
    }
  }

  async createDistDirectory() {
    if (fs.existsSync(this.distDir)) {
      fs.rmSync(this.distDir, { recursive: true });
    }
    fs.mkdirSync(this.distDir, { recursive: true });
    console.log('📁 Created dist directory');
  }

  async copyFiles() {
    for (const file of this.filesToCopy) {
      const sourcePath = path.join(this.sourceDir, file);
      const destPath = path.join(this.distDir, file);
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`📄 Copied ${file}`);
      } else {
        console.warn(`⚠️  File not found: ${file}`);
      }
    }
  }

  async createIcons() {
    const iconsDir = path.join(this.distDir, 'icons');
    fs.mkdirSync(iconsDir, { recursive: true });
    
    // Create placeholder icons (you should replace these with actual icons)
    const iconSizes = [16, 32, 48, 128];
    
    for (const size of iconSizes) {
      const iconPath = path.join(iconsDir, `icon${size}.png`);
      
      // Create a simple placeholder icon
      const svgContent = this.createPlaceholderIcon(size);
      const pngData = this.svgToPng(svgContent, size);
      
      fs.writeFileSync(iconPath, pngData);
      console.log(`🎨 Created icon${size}.png`);
    }
  }

  createPlaceholderIcon(size) {
    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#3b82f6" rx="${size * 0.2}"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.6}" font-weight="bold">T</text>
    </svg>`;
  }

  svgToPng(svgContent, size) {
    // This is a simplified version - in production, you'd use a proper SVG to PNG converter
    // For now, we'll create a simple base64 encoded PNG
    const canvas = require('canvas');
    const { createCanvas } = canvas;
    
    try {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Draw background
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(0, 0, size, size);
      
      // Draw text
      ctx.fillStyle = 'white';
      ctx.font = `bold ${size * 0.6}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('T', size / 2, size / 2);
      
      return canvas.toBuffer('image/png');
    } catch (error) {
      // Fallback: create a simple colored square
      const buffer = Buffer.alloc(size * size * 4);
      for (let i = 0; i < buffer.length; i += 4) {
        buffer[i] = 59;     // R
        buffer[i + 1] = 130; // G
        buffer[i + 2] = 246; // B
        buffer[i + 3] = 255; // A
      }
      return buffer;
    }
  }

  async validateManifest() {
    const manifestPath = path.join(this.distDir, 'manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
      throw new Error('Manifest file not found');
    }
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Basic validation
    if (!manifest.name || !manifest.version || !manifest.manifest_version) {
      throw new Error('Invalid manifest: missing required fields');
    }
    
    console.log('✅ Manifest validation passed');
  }
}

// Run build
if (require.main === module) {
  new ExtensionBuilder().build();
}

module.exports = ExtensionBuilder;
