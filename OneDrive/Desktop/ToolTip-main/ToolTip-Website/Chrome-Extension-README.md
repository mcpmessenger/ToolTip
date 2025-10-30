# ToolTip Companion - Chrome Extension

A powerful Chrome extension that provides intelligent hover previews for web elements, showing you exactly what happens when you click buttons, links, and interactive elements before you actually click them.

## 🚀 Features

### Core Functionality
- **Smart Hover Previews** - Hover over any clickable element to see a preview of what happens when you click it
- **External Link Capture** - See where external links take you with actual page screenshots
- **Proactive Scanning** - Automatically discovers and analyzes interactive elements on any webpage
- **Visual-Only Interface** - Clean, intuitive previews without cluttered text annotations

### Chrome Extension Benefits
- **Universal Compatibility** - Works on any website you visit
- **Native Performance** - Uses Chrome's built-in APIs for optimal speed
- **Persistent Settings** - Your preferences are saved across browser sessions
- **Easy Toggle** - Enable/disable per site or globally
- **Privacy Focused** - All processing happens locally or through your own backend

## 🎯 How It Works

1. **Install the Extension** - Add to Chrome from the Web Store
2. **Navigate to Any Website** - The extension automatically scans for interactive elements
3. **Hover to Preview** - Simply hover over buttons, links, or forms to see what they do
4. **Click with Confidence** - Know exactly where links lead before clicking

## 🛠️ Technical Architecture

### Extension Components
```
Chrome Extension
├── manifest.json (v3)           # Extension configuration
├── popup.html                   # Settings and controls UI
├── content-script.js            # Page interaction and element detection
├── background.js                # Service worker for API communication
├── options.html                 # Extension settings page
└── assets/
    ├── icons/                   # Extension icons (16, 48, 128px)
    └── styles/                  # UI styling
```

### Backend Integration
- **Playwright Service** - Handles complex web scraping and screenshot capture
- **REST API** - Communicates with your backend service for external link analysis
- **Caching Layer** - Stores screenshots locally for fast access
- **Rate Limiting** - Prevents excessive API calls

## 🔧 Installation & Setup

### For Users
1. Download from Chrome Web Store (coming soon)
2. Click "Add to Chrome"
3. Grant necessary permissions
4. Start browsing with confidence!

### For Developers
1. Clone the repository
2. Set up the backend service (see Backend Setup)
3. Load the extension in Chrome Developer Mode
4. Configure API endpoints in options

## ⚙️ Configuration

### Extension Settings
- **Proactive Mode** - Automatically scan pages for interactive elements
- **Preview Size** - Adjust tooltip dimensions (small, medium, large)
- **Screenshot Quality** - Balance between quality and performance
- **Site Whitelist** - Choose which sites to scan automatically
- **Privacy Mode** - Disable external link analysis for sensitive sites

### Backend Configuration
- **API Endpoint** - Your Playwright service URL
- **Rate Limiting** - Requests per minute limits
- **Cache Duration** - How long to store screenshots
- **External Link Handling** - Enable/disable external navigation capture

## 🎨 User Interface

### Popup Interface
- **Status Indicator** - Shows if extension is active
- **Scan Button** - Manually trigger page analysis
- **Settings Gear** - Access configuration options
- **Element Counter** - Number of elements found on current page

### Hover Previews
- **Clean Design** - No text clutter, just visual previews
- **Responsive Sizing** - Adapts to content and screen size
- **Smooth Animations** - Elegant hover transitions
- **Error Handling** - Graceful fallbacks for failed captures

## 🔒 Privacy & Security

### Data Handling
- **Local Storage** - Screenshots cached locally in browser
- **No Tracking** - No user behavior analytics
- **Optional Backend** - Can work entirely offline for internal links
- **Permission Control** - Minimal required permissions

### Security Features
- **Content Security Policy** - Strict CSP for extension security
- **API Validation** - All backend communication is validated
- **Error Sanitization** - No sensitive data in error messages
- **Secure Storage** - Encrypted local storage for sensitive settings

## 🚀 Performance

### Optimization Features
- **Lazy Loading** - Only scan elements when needed
- **Smart Caching** - Reuse screenshots for identical elements
- **Background Processing** - Non-blocking page analysis
- **Memory Management** - Automatic cleanup of old screenshots

### Resource Usage
- **Minimal CPU** - Efficient element detection algorithms
- **Low Memory** - Compressed image storage
- **Network Efficient** - Batched API requests
- **Battery Friendly** - Optimized for mobile devices

## 🛡️ Permissions

### Required Permissions
- **activeTab** - Capture screenshots of current page
- **storage** - Save settings and cached data
- **scripting** - Inject content scripts for element detection

### Optional Permissions
- **host permissions** - For specific sites requiring external link analysis
- **notifications** - For scan completion alerts

## 🔄 Migration from Web App

### What's Different
- **No Server Required** - Works entirely in browser for basic functionality
- **Universal Access** - Works on any website, not just your app
- **Better Performance** - Native Chrome APIs are faster than Playwright
- **Persistent Settings** - Configuration survives browser restarts

### What's the Same
- **Core Functionality** - Same hover preview system
- **Visual Design** - Consistent UI/UX
- **Backend Integration** - Same API for external link analysis
- **Caching Strategy** - Similar local storage approach

## 🐛 Troubleshooting

### Common Issues
- **Previews Not Showing** - Check if site is whitelisted and extension is enabled
- **External Links Not Working** - Verify backend service is running and accessible
- **Performance Issues** - Try reducing preview size or disabling proactive mode
- **Permission Errors** - Reinstall extension to reset permissions

### Debug Mode
- Open Chrome DevTools
- Go to Extensions tab
- Click "Inspect views: background page"
- Check console for error messages

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- Follow Chrome Extension best practices
- Use TypeScript for type safety
- Write comprehensive tests
- Document all public APIs

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **GitHub Issues** - Report bugs and request features
- **Documentation** - Comprehensive guides in /docs
- **Community** - Join our Discord for discussions
- **Email** - Direct support at support@tooltipcompanion.com

---

**Ready to see what your links actually do before clicking them? Install ToolTip Companion today!**
