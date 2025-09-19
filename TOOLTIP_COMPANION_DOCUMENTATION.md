# 🎯 ToolTip Companion - Complete Documentation

## 📋 **Overview**

The ToolTip Companion is a powerful, self-contained React component that provides **proactive scraping capabilities** for any web application. It automatically detects clickable elements, pre-scrapes what happens when they're clicked, and provides intelligent tooltips with real previews.

## 🚀 **Key Features**

### **🔍 Proactive Scraping**
- **Universal Element Detection**: Automatically finds ALL clickable elements
- **Smart Preview Generation**: Pre-scrapes what happens when each element is clicked
- **Real-time Tooltips**: Shows actual click results, not current page screenshots
- **Intelligent Caching**: Instant hover responses with cached previews

### **🎨 Rich UI Components**
- **Draggable Interface**: Move the companion anywhere on screen
- **Settings Panel**: Customize scraping behavior
- **Progress Tracking**: Real-time scraping progress
- **Error Handling**: Comprehensive error states and recovery

### **⚡ Performance Optimized**
- **Lazy Loading**: Previews loaded on demand
- **Memory Management**: Automatic cleanup of resources
- **Caching System**: Efficient preview storage
- **Background Processing**: Non-blocking scraping operations

## 📦 **Installation**

### **NPM Package (Coming Soon)**
```bash
npm install @tooltip-companion/react
```

### **Manual Installation**
```bash
# Copy the component files
cp src/components/ToolTipCompanion.tsx your-project/src/components/
cp src/hooks/useToolTipCompanion.ts your-project/src/hooks/
```

### **Dependencies**
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "framer-motion": "^10.0.0",
    "lucide-react": "^0.290.0"
  }
}
```

## 🎯 **Basic Usage**

### **Simple Implementation**
```tsx
import React from 'react';
import { ToolTipCompanion } from './components/ToolTipCompanion';

function App() {
  return (
    <div>
      <h1>My App</h1>
      <button>Click me!</button>
      <a href="/about">About</a>
      
      {/* ToolTip Companion */}
      <ToolTipCompanion
        targetUrl={window.location.href}
        enableProactiveMode={true}
        apiBaseUrl="http://localhost:3001"
      />
    </div>
  );
}
```

### **Advanced Configuration**
```tsx
import React from 'react';
import { ToolTipCompanion } from './components/ToolTipCompanion';

function App() {
  const handleScrapingStart = (url: string) => {
    console.log('Scraping started for:', url);
  };

  const handleScrapingComplete = (results: ScrapingResults) => {
    console.log('Scraping completed:', results);
  };

  const handleError = (error: string) => {
    console.error('Scraping error:', error);
  };

  return (
    <div>
      <h1>My App</h1>
      
      <ToolTipCompanion
        targetUrl="https://example.com"
        enableProactiveMode={true}
        apiBaseUrl="http://localhost:3001"
        position="bottom-right"
        size="large"
        defaultOpen={true}
        onScrapingStart={handleScrapingStart}
        onScrapingComplete={handleScrapingComplete}
        onError={handleError}
      />
    </div>
  );
}
```

## 🎣 **Using the Hook**

### **Basic Hook Usage**
```tsx
import React from 'react';
import { useToolTipCompanion } from './hooks/useToolTipCompanion';

function MyComponent() {
  const {
    isOpen,
    isProactiveMode,
    status,
    results,
    startScraping,
    stopScraping,
    toggleCompanion,
    getElementPreview,
    findElement
  } = useToolTipCompanion({
    targetUrl: window.location.href,
    enableProactiveMode: true,
    autoStart: true,
    onScrapingComplete: (results) => {
      console.log('Found', results.totalElements, 'elements');
    }
  });

  return (
    <div>
      <button onClick={startScraping}>Start Scraping</button>
      <button onClick={stopScraping}>Stop Scraping</button>
      <button onClick={toggleCompanion}>
        {isOpen ? 'Hide' : 'Show'} Companion
      </button>
      
      {results && (
        <div>
          <h3>Scraping Results</h3>
          <p>Elements found: {results.totalElements}</p>
          <p>Previews generated: {results.successfulPreviews}</p>
        </div>
      )}
    </div>
  );
}
```

### **Advanced Hook Usage**
```tsx
import React, { useEffect } from 'react';
import { useToolTipCompanion } from './hooks/useToolTipCompanion';

function AdvancedComponent() {
  const {
    status,
    results,
    previewCache,
    startScraping,
    findElement,
    getElementPreview,
    handleElementHover,
    handleElementClick
  } = useToolTipCompanion({
    targetUrl: window.location.href,
    enableProactiveMode: true,
    autoStart: true,
    interval: 30000, // Re-scrape every 30 seconds
    maxRetries: 3,
    onScrapingStart: (url) => {
      console.log('Starting scrape for:', url);
    },
    onScrapingComplete: (results) => {
      console.log('Scrape complete:', results);
    },
    onElementHover: (element) => {
      console.log('Hovered element:', element);
    },
    onElementClick: (element) => {
      console.log('Clicked element:', element);
    }
  });

  // Auto-start scraping when component mounts
  useEffect(() => {
    if (status.isReady && !results) {
      startScraping();
    }
  }, [status.isReady, results, startScraping]);

  return (
    <div>
      {status.isScraping && (
        <div className="scraping-indicator">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${status.progress}%` }}
            />
          </div>
          <p>Scraping... {status.completedElements}/{status.totalElements}</p>
        </div>
      )}

      {results && (
        <div className="results">
          <h3>Detected Elements</h3>
          {results.elements.map((element) => (
            <div 
              key={element.id}
              className="element-item"
              onMouseEnter={() => handleElementHover(element)}
              onClick={() => handleElementClick(element)}
            >
              <span>{element.text || element.attributes?.title}</span>
              {element.previewId && (
                <img 
                  src={getElementPreview(element.id) || ''} 
                  alt="Preview" 
                  className="preview-thumbnail"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## ⚙️ **Configuration Options**

### **ToolTipCompanion Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `targetUrl` | `string` | `window.location.href` | URL to scrape |
| `enableProactiveMode` | `boolean` | `true` | Enable proactive scraping |
| `apiBaseUrl` | `string` | `'http://localhost:3001'` | Backend API URL |
| `className` | `string` | `''` | Custom CSS classes |
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | Companion position |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Companion size |
| `defaultOpen` | `boolean` | `true` | Whether to show by default |
| `onScrapingStart` | `(url: string) => void` | `undefined` | Scraping start callback |
| `onScrapingComplete` | `(results: ScrapingResults) => void` | `undefined` | Scraping complete callback |
| `onError` | `(error: string) => void` | `undefined` | Error callback |

### **useToolTipCompanion Config**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `targetUrl` | `string` | `window.location.href` | URL to scrape |
| `apiBaseUrl` | `string` | `'http://localhost:3001'` | Backend API URL |
| `enableProactiveMode` | `boolean` | `true` | Enable proactive mode |
| `autoStart` | `boolean` | `true` | Auto-start scraping |
| `interval` | `number` | `0` | Scraping interval (ms) |
| `maxRetries` | `number` | `3` | Max retry attempts |
| `onScrapingStart` | `(url: string) => void` | `undefined` | Scraping start callback |
| `onScrapingComplete` | `(results: ScrapingResults) => void` | `undefined` | Scraping complete callback |
| `onError` | `(error: string) => void` | `undefined` | Error callback |
| `onElementHover` | `(element: ScrapedElement) => void` | `undefined` | Element hover callback |
| `onElementClick` | `(element: ScrapedElement) => void` | `undefined` | Element click callback |

## 🎨 **Styling & Customization**

### **CSS Custom Properties**
```css
:root {
  --tooltip-companion-bg: rgba(255, 255, 255, 0.1);
  --tooltip-companion-border: rgba(255, 255, 255, 0.2);
  --tooltip-companion-text: #ffffff;
  --tooltip-companion-accent: #3b82f6;
  --tooltip-companion-success: #10b981;
  --tooltip-companion-error: #ef4444;
}
```

### **Custom Styling**
```tsx
<ToolTipCompanion
  className="my-custom-companion"
  style={{
    '--tooltip-companion-bg': 'rgba(0, 0, 0, 0.8)',
    '--tooltip-companion-accent': '#ff6b6b'
  }}
/>
```

### **CSS Classes**
```css
.my-custom-companion {
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.my-custom-companion .companion-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.my-custom-companion .companion-content {
  padding: 24px;
}
```

## 🔧 **API Integration**

### **Backend Requirements**
The ToolTip Companion requires a backend API with the following endpoints:

#### **POST /api/proactive-scrape**
Start proactive scraping for a URL.

**Request:**
```json
{
  "url": "https://example.com",
  "settings": {
    "waitTime": 2.0,
    "maxElements": 50,
    "quality": 80
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "elements": [...],
    "totalElements": 5,
    "successfulPreviews": 3
  }
}
```

#### **GET /api/proactive-scrape/element-preview/{id}**
Get element preview image.

**Response:** GIF image file

#### **GET /health**
Health check endpoint.

**Response:**
```json
{
  "service": "ToolTip Backend API",
  "status": "healthy",
  "timestamp": "2025-09-19T02:30:19.403Z"
}
```

## 🧪 **Testing**

### **Unit Tests**
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolTipCompanion } from './ToolTipCompanion';

test('renders ToolTip Companion', () => {
  render(<ToolTipCompanion />);
  expect(screen.getByText('ToolTip Companion')).toBeInTheDocument();
});

test('toggles proactive mode', () => {
  render(<ToolTipCompanion />);
  const toggle = screen.getByRole('button', { name: /proactive mode/i });
  fireEvent.click(toggle);
  // Assert toggle state changed
});
```

### **Integration Tests**
```tsx
import { render, waitFor } from '@testing-library/react';
import { useToolTipCompanion } from './useToolTipCompanion';

test('scraping completes successfully', async () => {
  const TestComponent = () => {
    const { startScraping, results, status } = useToolTipCompanion({
      targetUrl: 'https://example.com',
      autoStart: true
    });

    return (
      <div>
        <button onClick={startScraping}>Start</button>
        {status.isScraping && <div>Scraping...</div>}
        {results && <div>Results: {results.totalElements}</div>}
      </div>
    );
  };

  render(<TestComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Results: 5')).toBeInTheDocument();
  });
});
```

## 🚀 **Deployment**

### **Build Configuration**
```json
{
  "scripts": {
    "build": "tsc && vite build",
    "build:companion": "tsc src/components/ToolTipCompanion.tsx --outDir dist",
    "preview": "vite preview"
  }
}
```

### **Environment Variables**
```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_ENABLE_PROACTIVE_MODE=true
VITE_DEFAULT_POSITION=bottom-right
VITE_DEFAULT_SIZE=medium
```

### **CDN Usage**
```html
<script src="https://unpkg.com/@tooltip-companion/react@1.1.0/dist/index.js"></script>
<script>
  const { ToolTipCompanion } = window.ToolTipCompanion;
  // Use the component
</script>
```

## 🔒 **Security Considerations**

### **Input Validation**
- URL validation before scraping
- Selector sanitization
- XSS protection for user inputs

### **Resource Limits**
- Maximum elements per page
- Memory usage limits
- Timeout controls

### **CORS Configuration**
```typescript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-domain.com'
  ],
  credentials: true
};
```

## 📊 **Performance Monitoring**

### **Key Metrics**
- **Scraping Time**: Time to complete scraping
- **Preview Generation**: Time to generate previews
- **Memory Usage**: Memory consumption
- **Cache Hit Rate**: Cache effectiveness

### **Monitoring Setup**
```typescript
const { startScraping, status } = useToolTipCompanion({
  onScrapingStart: (url) => {
    performance.mark('scraping-start');
  },
  onScrapingComplete: (results) => {
    performance.mark('scraping-end');
    performance.measure('scraping-duration', 'scraping-start', 'scraping-end');
  }
});
```

## 🐛 **Troubleshooting**

### **Common Issues**

#### **"No proactive preview found"**
- **Cause**: Element not detected during scraping
- **Solution**: Check element selector and text matching
- **Debug**: Use browser console to see scraping results

#### **"Preview Failed"**
- **Cause**: Screenshot generation failed
- **Solution**: Check backend logs for errors
- **Debug**: Verify Playwright installation and permissions

#### **"Scraping stuck"**
- **Cause**: API timeout or network issue
- **Solution**: Check backend health and restart if needed
- **Debug**: Use network tab to monitor API requests

### **Debug Tools**
```typescript
const { status, results, findElement } = useToolTipCompanion({
  onScrapingComplete: (results) => {
    console.log('Scraping results:', results);
    console.log('Elements found:', results.elements);
  }
});

// Find specific element
const element = findElement('button[title="My Button"]', 'My Button');
console.log('Found element:', element);
```

## 📚 **Examples**

### **E-commerce Product Page**
```tsx
function ProductPage() {
  return (
    <div>
      <h1>Product Name</h1>
      <img src="product.jpg" alt="Product" />
      <button>Add to Cart</button>
      <button>Buy Now</button>
      <a href="/reviews">View Reviews</a>
      
      <ToolTipCompanion
        targetUrl={window.location.href}
        position="bottom-left"
        size="large"
        onElementHover={(element) => {
          if (element.text.includes('Add to Cart')) {
            // Show cart preview
          }
        }}
      />
    </div>
  );
}
```

### **Dashboard with Multiple Actions**
```tsx
function Dashboard() {
  const { results, getElementPreview } = useToolTipCompanion({
    targetUrl: window.location.href,
    autoStart: true
  });

  return (
    <div>
      <nav>
        <button>Dashboard</button>
        <button>Analytics</button>
        <button>Settings</button>
      </nav>
      
      <main>
        {results?.elements.map((element) => (
          <div key={element.id} className="action-item">
            <span>{element.text}</span>
            {element.previewId && (
              <img 
                src={getElementPreview(element.id) || ''} 
                alt="Action preview"
                className="action-preview"
              />
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
```

## 🤝 **Contributing**

### **Development Setup**
```bash
git clone https://github.com/your-username/tooltip-companion.git
cd tooltip-companion
npm install
npm run dev
```

### **Code Style**
- Use TypeScript for type safety
- Follow React best practices
- Add comprehensive error handling
- Include JSDoc comments

### **Pull Request Process**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Playwright** for advanced web scraping
- **React** for the component system
- **Framer Motion** for animations
- **Lucide React** for icons

---

**Version**: v1.1.0  
**Last Updated**: September 19, 2025  
**Next Release**: v1.2 (Q4 2025)
