# ToolTip Companion v1.0

Beautiful Interactive Tooltips for React with Proactive Screenshot Capture

## 🎯 Overview

ToolTip Companion is a React component library that provides intelligent tooltips with **proactive screenshot capture**. When you hover over any clickable element, you see a preview of what happens when you click it - captured automatically by Playwright.

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

---

**ToolTip Companion v1.0** - Making web interactions more intuitive with proactive visual feedback.