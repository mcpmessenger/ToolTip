# ToolTip Companion Browser Extension

A powerful browser extension that provides AI-powered tooltips for any button or interactive element on any webpage. Built with the same beautiful 3D glass morphism design as the main ToolTip Companion application.

## ✨ Features

- **Universal Coverage**: Works on any website without requiring modifications
- **AI-Powered Analysis**: Uses OpenAI to generate contextual tooltip content
- **3D Glass Morphism Design**: Beautiful, modern UI that stands out
- **Smart Element Detection**: Automatically finds buttons, links, and interactive elements
- **Multiple Trigger Events**: Hover, click, or focus activation
- **Shadow DOM Isolation**: Prevents conflicts with host page styles
- **Real-time Backend Integration**: Connects to ToolTip Companion backend API
- **Configurable Settings**: Customize behavior through popup interface

## 🚀 Quick Start

### Prerequisites

1. **Backend Server**: The ToolTip Companion backend must be running
2. **Chrome/Edge Browser**: Extension supports Manifest V3
3. **Node.js**: For building the extension

### Installation

1. **Build the Extension**:
   ```bash
   cd browser-extension
   npm install
   npm run build
   ```

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `browser-extension/dist/` folder

3. **Start the Backend**:
   ```bash
   cd ../backend
   npm run dev
   ```

4. **Test the Extension**:
   - Visit any website
   - Hover over buttons or interactive elements
   - See AI-powered tooltips appear!

## 🛠️ Development

### Project Structure

```
browser-extension/
├── manifest.json           # Extension configuration
├── background.js           # Service worker for API communication
├── content.js             # Content script for DOM interaction
├── injected-tooltip.js    # Tooltip component (injected into pages)
├── injected-tooltip.css   # Tooltip styles
├── popup.html             # Extension popup interface
├── popup.js               # Popup functionality
├── build.js               # Build script
└── dist/                  # Built extension files
```

### Key Components

#### 1. Content Script (`content.js`)
- Observes DOM for interactive elements
- Attaches event listeners (hover, click, focus)
- Extracts element data and context
- Communicates with background script

#### 2. Background Script (`background.js`)
- Handles API communication with backend
- Manages extension settings
- Provides fallback tooltip generation
- Monitors backend health

#### 3. Injected Tooltip (`injected-tooltip.js`)
- Renders tooltip UI using Shadow DOM
- Handles positioning and animations
- Manages tooltip lifecycle
- Provides glass morphism styling

#### 4. Popup Interface (`popup.html` + `popup.js`)
- Extension settings management
- Backend connection status
- Test functionality
- User preferences

### Building

```bash
# Install dependencies
npm install

# Build extension
npm run build

# Clean build directory
npm run clean
```

## ⚙️ Configuration

### Extension Settings

Access settings through the extension popup:

- **Enable Extension**: Toggle extension on/off
- **Trigger Event**: Choose hover, click, or focus
- **Show Previews**: Enable/disable preview features
- **Proactive Mode**: Advanced scraping mode
- **API Base URL**: Backend server URL

### Backend Integration

The extension requires the ToolTip Companion backend to be running:

```bash
# Start backend server
cd backend
npm run dev
```

The backend provides:
- `/api/analyze-element` - AI-powered element analysis
- `/health` - Health check endpoint

## 🎨 Customization

### Styling

The tooltip uses CSS custom properties for easy theming:

```css
.tooltip-companion {
  --tooltip-bg: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  --tooltip-border: rgba(255, 255, 255, 0.2);
  --tooltip-text: #ffffff;
  --tooltip-radius: 12px;
}
```

### Element Detection

Customize which elements trigger tooltips by modifying selectors in `content.js`:

```javascript
getInteractiveSelectors() {
  return [
    'button',
    'a[href]',
    '[role="button"]',
    '[tabindex]:not([tabindex="-1"])',
    // Add your custom selectors here
  ].join(', ');
}
```

## 🔧 API Reference

### Content Script API

```javascript
// Element data structure
{
  tag: 'button',
  text: 'Click me',
  attributes: {
    title: 'Submit form',
    'aria-label': 'Submit button',
    type: 'submit'
  },
  coordinates: [100, 200],
  url: 'https://example.com',
  selector: '#submit-btn'
}
```

### Background Script Messages

```javascript
// Analyze element
chrome.runtime.sendMessage({
  action: 'analyzeElement',
  data: elementData
});

// Get settings
chrome.runtime.sendMessage({
  action: 'getSettings'
});

// Update settings
chrome.runtime.sendMessage({
  action: 'updateSettings',
  data: newSettings
});
```

## 🐛 Troubleshooting

### Common Issues

1. **Tooltips not appearing**:
   - Check if extension is enabled in popup
   - Verify backend server is running
   - Check browser console for errors

2. **Backend connection failed**:
   - Ensure backend is running on correct port
   - Check CORS settings in backend
   - Verify API Base URL in extension settings

3. **Styling conflicts**:
   - Extension uses Shadow DOM to prevent conflicts
   - Check if host page has restrictive CSP policies

4. **Performance issues**:
   - Disable proactive mode for better performance
   - Reduce number of observed elements
   - Check backend response times

### Debug Mode

Enable debug logging by opening browser DevTools and checking the console for detailed logs.

## 📦 Distribution

### Chrome Web Store

1. Build the extension: `npm run build`
2. Create a ZIP file of the `dist/` folder
3. Upload to Chrome Web Store Developer Dashboard
4. Follow Chrome's review process

### Firefox Add-ons

1. Modify `manifest.json` for Firefox compatibility
2. Build and test in Firefox
3. Submit to Firefox Add-ons store

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join GitHub Discussions for questions
- **Documentation**: Check the main ToolTip Companion docs

---

**Made with ❤️ by the ToolTip Companion Team**
