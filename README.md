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

**System Status**: ✅ **WORKING** - Core functionality operational with some limitations

### ✅ **What's Working:**
- **Local Button Screenshots**: All local buttons (Get Started, Settings, etc.) capture and display correctly
- **Local Storage Caching**: Screenshots stored as base64 in browser Local Storage
- **Instant Tooltips**: Hover over buttons shows cached screenshots immediately
- **Rate Limiting Fixed**: Reduced from 2s to 0.1s between requests
- **Port Auto-Detection**: Frontend automatically finds available port (currently 8091)
- **Backend Stability**: No more infinite loops or stuck processing states

### ❌ **What's Not Working:**
- **External URL Screenshots**: GitHub documentation button doesn't capture external page screenshots
- **Target="_blank" Links**: External links with `target="_blank"` not properly detected
- **External Navigation**: Playwright doesn't navigate to external URLs correctly

### 🔧 **Recent Fixes Applied:**
- ✅ Fixed aggressive rate limiting (2000ms → 100ms)
- ✅ Added external URL detection logic for `target="_blank"` links
- ✅ Implemented direct navigation instead of clicking external links
- ✅ Added debugging logs for external URL capture
- ✅ Cleared stuck processing states and global capturing flags
- ✅ Auto port detection for frontend (no more port conflicts)

### 🎯 **Next Priority:**
- Fix external URL screenshot capture for GitHub documentation button
- Test and verify external navigation works correctly
- Clean up unused components and dead code

---

**ToolTip Companion v1.0** - Making web interactions more intuitive with proactive visual feedback.