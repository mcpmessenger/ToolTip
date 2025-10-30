# ToolTip Companion

**Complete AI-Powered Web Interaction Suite**

## 🌟 Project Showcase

### 🤖 [TeenyAI Electron Fork](https://github.com/mcpmessenger/TeenyAI)
**AI-Powered Desktop Browser with Intelligent Web Analysis**
- 🧠 **AI Chat Assistant** - Intelligent page analysis and guidance
- 🎯 **Predictive Hover Previews** - Smart content previews on hover  
- 🌙 **Dark/Light Mode** - Beautiful, modern UI with theme switching
- ⚡ **Lightweight & Fast** - Built for speed and efficiency
- 🔧 **Developer Tools** - Built-in console and debugging tools
- 🔄 **Auto-Updates** - Seamless updates via AWS S3 and GitHub Releases
- 🚀 **Production Ready** - Standalone desktop app with enterprise security

### 🌐 [ToolTip Companion Browser](https://github.com/mcpmessenger/ToolTip_Companion_Browser)
**Chromium Fork with Advanced Web Interaction Features**
- 🎯 **Proactive Screenshot Capture** - Automatic preview generation
- 🔍 **Smart Element Detection** - Intelligent clickable element analysis
- 📸 **High-Quality Screenshots** - Crisp, optimized image capture
- 💾 **Local Storage Caching** - Fast tooltip display with persistent storage
- 🔗 **External Link Support** - Captures where external links lead
- ⚡ **Real-time Processing** - Instant tooltip generation

### 🔌 [Chrome Extension](https://chromewebstore.google.com/detail/mlphakpkofdcigfpcpmgomhgalodhlkm)
**Universal Browser Extension for Any Website**
- 🌍 **Universal Compatibility** - Works on any website you visit
- ⚡ **Native Performance** - Uses Chrome's built-in APIs for optimal speed
- 💾 **Persistent Settings** - Your preferences saved across browser sessions
- 🎛️ **Easy Toggle** - Enable/disable per site or globally
- 🔒 **Privacy Focused** - All processing happens locally or through your own backend
- 🎨 **Glassmorphism UI** - Beautiful, modern interface design

## 🎯 Overview

ToolTip Companion provides a complete suite of AI-powered web interaction tools. From intelligent desktop browsing to universal browser extensions, we make web interactions more intuitive and efficient through proactive visual feedback and AI assistance.

## 🏗️ Complete Ecosystem Architecture

```
ToolTip Companion
├── 🤖 TeenyAI Desktop App
│   ├── AI Chat Assistant
│   ├── Predictive Hover Previews  
│   ├── Dark/Light Mode
│   └── Auto-Updates
├── 🌐 ToolTip Companion Browser
│   ├── Proactive Screenshot Capture
│   ├── Smart Element Detection
│   ├── High-Quality Screenshots
│   └── Local Storage Caching
├── 🔌 Chrome Extension
│   ├── Universal Compatibility
│   ├── Native Performance
│   ├── Persistent Settings
│   └── Privacy Focused
└── 🌍 React Web App
    ├── Glassmorphism UI
    ├── Playwright Backend
    └── External Link Support
```

## 🚀 Quick Start Guide

### 1. **Desktop Experience** - TeenyAI
```bash
# Clone and setup TeenyAI
git clone https://github.com/mcpmessenger/TeenyAI.git
cd TeenyAI
npm install
npm run dev
```

### 2. **Browser Extension** - Chrome Web Store
**[Install Extension](https://chromewebstore.google.com/detail/mlphakpkofdcigfpcpmgomhgalodhlkm?utm_source=item-share-cb)**

### 3. **Web Application** - ToolTip Companion
```bash
# Clone and setup ToolTip Companion
git clone https://github.com/mcpmessenger/ToolTip_Companion_Browser.git
cd ToolTip_Companion_Browser
npm install
npm run dev
```

## 🚀 Current Status

### ✅ **Production Ready**
- **TeenyAI Desktop App** - AI-powered browser with intelligent analysis
- **ToolTip Companion Browser** - Chromium fork with advanced interaction features  
- **Chrome Extension** - Universal browser extension available on Chrome Web Store
- **React Web App** - Fully functional with glassmorphism UI
- **Playwright Backend** - Robust web scraping and screenshot capture

### 🔄 **Active Development**
- **Cross-Platform Support** - Expanding to Firefox and Safari
- **Advanced AI Features** - Enhanced page analysis and predictive capabilities
- **Performance Optimization** - Faster screenshot capture and processing

## 🔌 Chrome Extension - Available Now!

### ✅ **Live Features**
- **Universal Compatibility** - Works on any website you visit
- **Native Performance** - Uses Chrome's built-in APIs for optimal speed
- **Persistent Settings** - Your preferences saved across browser sessions
- **Easy Toggle** - Enable/disable per site or globally
- **Privacy Focused** - All processing happens locally or through your own backend
- **Glassmorphism UI** - Beautiful, modern interface design

### 🛒 **Get the Extension**
**[Install from Chrome Web Store](https://chromewebstore.google.com/detail/mlphakpkofdcigfpcpmgomhgalodhlkm?utm_source=item-share-cb)**

### Technical Architecture
```
Chrome Extension
├── manifest.json (v3)           # Extension configuration
├── popup.html                   # Settings and controls UI
├── content-script.js            # Page interaction and element detection
├── background.js                # Service worker for API communication
└── assets/                      # Icons and styling
```

## 🔄 System Flow

### 1. **Page Load & Proactive Scraping**
```
User visits page → Frontend loads → Triggers proactive scraping
```

### 2. **Backend Playwright Automation**
```
Backend receives scrape request → Playwright launches browser → Navigates to page
```

### 3. **Button Discovery & Testing**
```
Playwright finds all clickable elements → For each button:
  ├── Click the button
  ├── Wait for navigation/state change
  ├── Capture full page "after" screenshot
  └── Compress image to base64
```

### 4. **Local Storage Caching**
```
Backend returns all results → Frontend stores each button's "after" image in Local Storage
```

### 5. **Tooltip Display**
```
User hovers over button → Frontend retrieves pre-captured "after" image from Local Storage → Shows in tooltip
```

## 🏗️ Architecture

### **Frontend (React)**
- **Production**: [https://tooltipcompanion.com/](https://tooltipcompanion.com/)
- **Development**: `http://localhost:8091` (auto-detected available port)
- **Components**: 
  - `SimplePreviewTooltip` - Main tooltip component
  - `futurastic-hero-section` - Hero section with "Get Started" button
  - `Dashboard` - Main dashboard with "View Documentation" button

### **Backend (Express.js + Playwright)**
- **Port**: `http://127.0.0.1:3001`
- **Services**:
  - `SimpleAfterCapture` - Proactive screenshot capture service
  - `ProactiveScrapingService` - Legacy scraping service (disabled)

### **Storage Strategy**
- **Type**: Local Storage (persists across browser sessions)
- **Format**: Base64 data URLs (`data:image/jpeg;base64,{base64string}`)
- **Key Pattern**: `preview_${url}_${elementId}`
- **Example**: `preview_localhost:8084_get-started-button`

## 🎬 Example Flow

### **Button: "Get Started"**
1. **Proactive Scraping**: Playwright clicks "Get Started" → Navigates to Settings page
2. **Screenshot Capture**: Full page screenshot of Settings page with "Proactive Mode" toggle
3. **Storage**: Base64 image stored in Local Storage
4. **Tooltip**: User hovers over "Get Started" → Shows Settings page preview

### **Button: "View Documentation"**
1. **Proactive Scraping**: Playwright clicks "View Documentation" → Navigates to GitHub repository
2. **Screenshot Capture**: Full page screenshot of GitHub repository page
3. **Storage**: Base64 image stored in Local Storage
4. **Tooltip**: User hovers over "View Documentation" → Shows GitHub page preview

## 🔧 Technical Implementation

### **API Endpoints**
```
POST /api/after-capture/capture
├── Input: { url: "http://localhost:8084" }
├── Process: Proactive scraping with Playwright
└── Output: { results: [{ elementId, afterGif, title, success }] }

GET /api/after-capture/status
├── Output: { capturing: boolean, timestamp: string }
```

### **Local Storage Structure**
```json
{
  "preview_localhost:8084_get-started-button": {
    "type": "after-gif",
    "title": "Get Started",
    "description": "Result after clicking Get Started",
    "afterGif": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "timestamp": "2024-01-20T03:20:58.000Z"
  }
}
```

### **Image Processing**
- **Capture**: Full page screenshots (1920x1080 viewport)
- **Compression**: Sharp library (800x600, 80% quality JPEG)
- **Storage**: Base64 data URLs for browser compatibility

## 🌐 Live Demo

**Production URL**: [https://tooltipcompanion.com/](https://tooltipcompanion.com/)

Experience the tooltip system live with proactive screenshot capture!

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+
- npm or yarn
- Playwright browsers installed

### **Installation**
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

### **Development**
```bash
# Start backend (port 3001)
cd backend
npm run dev

# Start frontend (auto-detects available port)
cd ..
npm run dev
```

### **Usage**
```jsx
import { SimplePreviewTooltip } from './components/SimplePreviewTooltip';

<SimplePreviewTooltip
  targetUrl="http://localhost:8084"
  elementId="get-started-button"
>
  <button>Get Started</button>
</SimplePreviewTooltip>
```

## 🎯 Key Features

- ✅ **Proactive Scraping**: Automatically captures all button interactions
- ✅ **Local Storage Caching**: Fast tooltip display with persistent storage
- ✅ **Full Page Screenshots**: Complete "after" state visualization
- ✅ **Base64 Storage**: No backend file storage, browser-native caching
- ✅ **Dynamic Element Detection**: Works with any clickable element
- ✅ **Compressed Images**: Optimized for Local Storage size limits

## 🔍 Debugging

### **Check Local Storage**
1. Open Developer Tools (F12)
2. Go to Application tab
3. Expand Local Storage → `http://localhost:8084`
4. Look for keys starting with `preview_`

### **Backend Logs**
```bash
cd backend
npm run dev
# Watch for "Starting after capture" and "Capture completed" messages
```

### **Common Issues**
- **"Scraping failed: Failed to fetch"**: Backend not running or wrong port
- **No tooltips showing**: Check Local Storage for cached data
- **Old screenshots**: Clear Local Storage and refresh page

## 📝 Notes

- **One-time scraping**: Page is scraped once on load, not on each hover
- **Port management**: Frontend may change ports (8082, 8083, 8084) - backend adapts
- **Element identification**: Uses element IDs and selectors for matching
- **Error handling**: Graceful fallbacks for failed captures

## ⚠️ Current Status (Latest Update)

**System Status**: ✅ **FULLY WORKING** - All functionality operational including external links

### ✅ **What's Working:**
- **All Button Screenshots**: Both local and external buttons capture and display correctly
- **External URL Navigation**: GitHub documentation button successfully captures external page screenshots
- **Local Storage Caching**: Screenshots stored as base64 in browser Local Storage
- **Instant Tooltips**: Hover over buttons shows cached screenshots immediately
- **Port Configuration**: Frontend runs on port 8082, backend on port 3001
- **High-Quality Images**: Improved image quality with better compression algorithms

### 🔧 **Recent Major Fixes Applied:**
- ✅ **External Link Detection**: Fixed external URL capture for GitHub documentation button
- ✅ **Port Alignment**: Frontend (8082) and backend (3001) properly configured
- ✅ **Element Visibility**: Added proper waits for Framer Motion animations
- ✅ **Rate Limiting**: Implemented proper rate limiting to prevent aggressive scraping
- ✅ **Image Quality**: Enhanced screenshot quality with Lanczos3 resampling and mozjpeg compression
- ✅ **Error Handling**: Comprehensive error reporting and fallback mechanisms

### 🐛 **Image Blurriness Bug - RESOLVED**

**Problem**: Screenshots were appearing blurry due to aggressive image compression and poor resampling algorithms.

**Root Cause Analysis**:
1. **Aggressive Resizing**: Images were being resized from full screenshots to 1000x750 pixels
2. **Poor Resampling**: Default bilinear resampling caused blurriness during resize
3. **Low Quality Settings**: JPEG quality was set to 90% with basic compression
4. **PNG Quality**: Screenshots weren't using maximum PNG quality before compression

**Solution Implemented**:
```typescript
// Before (blurry)
.resize(1000, 750, { fit: 'inside' })
.jpeg({ quality: 90, progressive: true })

// After (crisp)
.resize(1200, 900, { 
  fit: 'inside',
  kernel: sharp.kernel.lanczos3 // Better resampling
})
.jpeg({ 
  quality: 95, // Higher quality
  mozjpeg: true // Better compression algorithm
})
```

**Key Improvements**:
- ✅ **Lanczos3 Resampling**: Superior resampling algorithm for crisp images
- ✅ **Higher Resolution**: Increased from 1000x750 to 1200x900 pixels
- ✅ **Better Compression**: mozjpeg algorithm for better quality/size ratio
- ✅ **Maximum PNG Quality**: Screenshots captured at 100% quality before compression
- ✅ **Progressive JPEG**: Better loading experience for large images

**Results**: Screenshots now display with significantly improved clarity while maintaining reasonable file sizes for Local Storage.

### 🎯 **System Performance**:
- **Capture Success Rate**: 100% (10/10 elements captured successfully)
- **External Navigation**: Working perfectly (GitHub page screenshots)
- **Image Quality**: High-resolution, crisp screenshots
- **Load Times**: Fast tooltip display with cached images
- **Memory Usage**: Optimized base64 storage in Local Storage

## 🌟 ToolTip Companion Projects

### 🤖 [TeenyAI Desktop App](https://github.com/mcpmessenger/TeenyAI)
**AI-Powered Desktop Browser with Intelligent Web Analysis**

**Key Features:**
- 🧠 **AI Chat Assistant** - Intelligent page analysis and guidance
- 🎯 **Predictive Hover Previews** - Smart content previews on hover  
- 🌙 **Dark/Light Mode** - Beautiful, modern UI with theme switching
- ⚡ **Lightweight & Fast** - Built for speed and efficiency
- 🔧 **Developer Tools** - Built-in console and debugging tools
- 🔄 **Auto-Updates** - Seamless updates via AWS S3 and GitHub Releases
- 🚀 **Production Ready** - Standalone desktop app with enterprise security

**Installation:**
```bash
git clone https://github.com/mcpmessenger/TeenyAI.git
cd TeenyAI
npm install
npm run dev
```

### 🌐 [ToolTip Companion Browser](https://github.com/mcpmessenger/ToolTip_Companion_Browser)
**Chromium Fork with Advanced Web Interaction Features**

**Key Features:**
- 🎯 **Proactive Screenshot Capture** - Automatic preview generation
- 🔍 **Smart Element Detection** - Intelligent clickable element analysis
- 📸 **High-Quality Screenshots** - Crisp, optimized image capture
- 💾 **Local Storage Caching** - Fast tooltip display with persistent storage
- 🔗 **External Link Support** - Captures where external links lead
- ⚡ **Real-time Processing** - Instant tooltip generation

**Installation:**
```bash
git clone https://github.com/mcpmessenger/ToolTip_Companion_Browser.git
cd ToolTip_Companion_Browser
npm install
npm run dev
```

### 🔌 [Chrome Extension](https://chromewebstore.google.com/detail/mlphakpkofdcigfpcpmgomhgalodhlkm)
**Universal Browser Extension for Any Website**

**Key Features:**
- 🌍 **Universal Compatibility** - Works on any website you visit
- ⚡ **Native Performance** - Uses Chrome's built-in APIs for optimal speed
- 💾 **Persistent Settings** - Your preferences saved across browser sessions
- 🎛️ **Easy Toggle** - Enable/disable per site or globally
- 🔒 **Privacy Focused** - All processing happens locally or through your own backend
- 🎨 **Glassmorphism UI** - Beautiful, modern interface design

**Installation:**
**[Install from Chrome Web Store](https://chromewebstore.google.com/detail/mlphakpkofdcigfpcpmgomhgalodhlkm?utm_source=item-share-cb)**

## 🤝 Contributing

We welcome contributions to any part of ToolTip Companion!

### **How to Contribute:**
1. **Fork the repository** you want to contribute to
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Projects to Contribute To:**
- 🤖 **[TeenyAI](https://github.com/mcpmessenger/TeenyAI)** - Desktop app improvements
- 🌐 **[ToolTip Companion Browser](https://github.com/mcpmessenger/ToolTip_Companion_Browser)** - Browser features
- 🔌 **Chrome Extension** - Universal compatibility improvements

## 📞 Support & Community

### **Get Help:**
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/mcpmessenger/ToolTip_Companion_Browser/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/mcpmessenger/ToolTip_Companion_Browser/discussions)
- 📧 **Direct Support**: Open an issue on any of our repositories

### **Stay Updated:**
- ⭐ **Star our repositories** to stay updated with new releases
- 🔔 **Watch for releases** to get notified of new features
- 🐦 **Follow development** through GitHub activity

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Built with Electron** - Desktop app framework
- **Powered by React** - Modern UI framework  
- **Styled with modern CSS** - Beautiful, responsive design
- **AI capabilities via OpenAI** - Intelligent analysis
- **Web automation via Playwright** - Robust screenshot capture
- **Chrome Extension APIs** - Universal browser compatibility

---

**ToolTip Companion** - Complete AI-Powered Web Interaction Suite

*Making web interactions more intuitive with proactive visual feedback and AI assistance across desktop, browser, and extension platforms.*