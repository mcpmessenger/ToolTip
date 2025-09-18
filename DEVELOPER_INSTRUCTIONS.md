# ToolTip Crawling Integration - Developer Instructions

## Overview

This document provides step-by-step instructions for integrating Playwright-based crawling capability into the ToolTip project. The implementation allows users to hover over buttons or elements and see animated GIFs showing what would happen if they clicked those elements.

## Architecture

The solution consists of:
- **Backend Service**: Flask API with Playwright for web crawling and GIF generation
- **Frontend Integration**: React components for hover detection and GIF display
- **GIF Generation**: Automated screenshot capture and animation creation

## Backend Implementation

### 1. Flask Crawler Service

The backend service (`tooltip-crawler/`) provides the following endpoints:

```
POST /api/crawl          - Start a new crawl request
GET  /api/status/{id}    - Get crawl status
GET  /api/gif/{id}       - Download generated GIF
GET  /api/loading-gif/{id} - Download loading GIF
POST /api/elements       - Get page elements for analysis
GET  /api/health         - Health check
```

### 2. Key Components

#### Playwright Crawler (`src/crawler/playwright_crawler.py`)
- Automates browser interactions using Playwright
- Captures before/after screenshots
- Handles element detection by selector, text, or coordinates
- Manages browser lifecycle

#### GIF Generator (`src/crawler/gif_generator.py`)
- Converts screenshots to animated GIFs
- Adds click indicators to show interaction points
- Creates loading animations
- Optimizes file sizes for web delivery

#### API Routes (`src/routes/crawler.py`)
- Handles HTTP requests
- Manages async crawling operations
- Provides file serving for GIFs
- Implements error handling

### 3. Installation & Setup

```bash
# Navigate to the ToolTip project
cd ToolTip

# The crawler service is already created in tooltip-crawler/
cd tooltip-crawler

# Activate virtual environment
source venv/bin/activate

# Dependencies are already installed:
# - playwright
# - pillow
# - flask-cors

# Install Playwright browsers (if not done)
playwright install chromium

# Start the service
python src/main.py
```

The service will run on `http://localhost:5000`

## Frontend Integration

### 1. Create Hover GIF Component

Create `src/components/HoverGif.tsx`:

```tsx
import React, { useState, useEffect, useRef } from 'react';

interface HoverGifProps {
  children: React.ReactNode;
  targetUrl: string;
  elementSelector?: string;
  elementText?: string;
  coordinates?: [number, number];
  className?: string;
}

export const HoverGif: React.FC<HoverGifProps> = ({
  children,
  targetUrl,
  elementSelector,
  elementText,
  coordinates,
  className = ''
}) => {
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [crawlId, setCrawlId] = useState<string | null>(null);
  const [showGif, setShowGif] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const pollTimeoutRef = useRef<NodeJS.Timeout>();

  const startCrawl = async () => {
    if (isLoading || gifUrl) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: targetUrl,
          element_selector: elementSelector,
          element_text: elementText,
          coordinates: coordinates,
          wait_time: 2.0
        }),
      });

      const data = await response.json();
      
      if (data.crawl_id) {
        setCrawlId(data.crawl_id);
        pollStatus(data.crawl_id);
      }
    } catch (error) {
      console.error('Error starting crawl:', error);
      setIsLoading(false);
    }
  };

  const pollStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/status/${id}`);
      const data = await response.json();

      if (data.status === 'completed' && data.gif_available) {
        setGifUrl(`/api/gif/${id}`);
        setIsLoading(false);
      } else if (data.status === 'failed') {
        setIsLoading(false);
        console.error('Crawl failed:', data.error);
      } else {
        // Continue polling
        pollTimeoutRef.current = setTimeout(() => pollStatus(id), 1000);
      }
    } catch (error) {
      console.error('Error polling status:', error);
      setIsLoading(false);
    }
  };

  const handleMouseEnter = () => {
    setShowGif(true);
    
    // Start crawl after a short delay to avoid unnecessary requests
    hoverTimeoutRef.current = setTimeout(() => {
      if (!gifUrl && !isLoading) {
        startCrawl();
      }
    }, 500);
  };

  const handleMouseLeave = () => {
    setShowGif(false);
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {showGif && (
        <div className="absolute z-50 p-2 bg-white border border-gray-300 rounded-lg shadow-lg pointer-events-none"
             style={{ 
               top: '100%', 
               left: '50%', 
               transform: 'translateX(-50%)',
               marginTop: '8px'
             }}>
          {isLoading && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-600">Loading preview...</span>
            </div>
          )}
          
          {gifUrl && (
            <div>
              <img 
                src={gifUrl} 
                alt="Click preview" 
                className="max-w-xs max-h-48 rounded"
                style={{ maxWidth: '300px', maxHeight: '200px' }}
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                Preview of clicking this element
              </p>
            </div>
          )}
          
          {!isLoading && !gifUrl && (
            <div className="text-sm text-gray-600">
              Hover to see click preview
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

### 2. Create API Hook

Create `src/hooks/useCrawling.ts`:

```typescript
import { useState, useCallback } from 'react';

interface CrawlRequest {
  url: string;
  element_selector?: string;
  element_text?: string;
  coordinates?: [number, number];
  wait_time?: number;
}

interface CrawlResult {
  crawl_id: string;
  status: string;
  gif_available?: boolean;
  gif_url?: string;
  loading_gif_url?: string;
  error?: string;
}

export const useCrawling = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCrawl = useCallback(async (request: CrawlRequest): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start crawl');
      }

      return data.crawl_id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCrawlStatus = useCallback(async (crawlId: string): Promise<CrawlResult | null> => {
    try {
      const response = await fetch(`/api/status/${crawlId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get status');
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const getPageElements = useCallback(async (url: string) => {
    try {
      const response = await fetch('/api/elements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get elements');
      }

      return data.elements;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    }
  }, []);

  return {
    startCrawl,
    getCrawlStatus,
    getPageElements,
    isLoading,
    error,
  };
};
```

### 3. Integration Examples

#### Basic Button with Hover GIF

```tsx
import { HoverGif } from '../components/HoverGif';

function MyComponent() {
  return (
    <HoverGif 
      targetUrl="https://example.com"
      elementSelector="button.submit-btn"
    >
      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        Submit Form
      </button>
    </HoverGif>
  );
}
```

#### Link with Text-based Detection

```tsx
<HoverGif 
  targetUrl="https://example.com/products"
  elementText="Add to Cart"
>
  <a href="/products" className="text-blue-600 underline">
    View Products
  </a>
</HoverGif>
```

#### Custom Element with Coordinates

```tsx
<HoverGif 
  targetUrl="https://example.com/dashboard"
  coordinates={[150, 200]}
>
  <div className="p-4 border rounded">
    Dashboard Link
  </div>
</HoverGif>
```

## Configuration

### Environment Variables

Create `.env` file in the backend:

```env
FLASK_ENV=development
FLASK_DEBUG=True
CRAWLER_TIMEOUT=30
GIF_QUALITY=85
MAX_CONCURRENT_CRAWLS=5
```

### Frontend Configuration

Update your API base URL in the frontend if needed:

```typescript
// src/config/api.ts
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com' 
  : 'http://localhost:5000';
```

## Deployment

### Backend Deployment

```bash
# In tooltip-crawler directory
source venv/bin/activate
pip freeze > requirements.txt

# Deploy using your preferred method
# The service listens on 0.0.0.0:5000 for external access
```

### Frontend Integration

1. Add the HoverGif component to your existing ToolTip components
2. Update your build process to include the new dependencies
3. Configure API endpoints for production

## Performance Considerations

### Caching Strategy

```typescript
// Implement caching to avoid repeated crawls
const gifCache = new Map<string, string>();

const getCachedGif = (url: string, selector: string): string | null => {
  const key = `${url}:${selector}`;
  return gifCache.get(key) || null;
};

const setCachedGif = (url: string, selector: string, gifUrl: string): void => {
  const key = `${url}:${selector}`;
  gifCache.set(key, gifUrl);
};
```

### Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
const rateLimiter = new Map<string, number>();

const canMakeRequest = (identifier: string): boolean => {
  const now = Date.now();
  const lastRequest = rateLimiter.get(identifier) || 0;
  
  if (now - lastRequest < 5000) { // 5 second cooldown
    return false;
  }
  
  rateLimiter.set(identifier, now);
  return true;
};
```

## Error Handling

### Backend Error Responses

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional details"
}
```

### Frontend Error Handling

```tsx
const [error, setError] = useState<string | null>(null);

const handleError = (error: string) => {
  setError(error);
  // Show user-friendly error message
  console.error('Crawling error:', error);
};
```

## Security Considerations

1. **URL Validation**: Validate URLs to prevent SSRF attacks
2. **Rate Limiting**: Implement per-IP rate limiting
3. **Input Sanitization**: Sanitize all user inputs
4. **CORS Configuration**: Configure CORS appropriately for production
5. **Authentication**: Consider adding authentication for production use

## Testing

### Backend Testing

```bash
# Test the crawler service
curl -X POST http://localhost:5000/api/crawl \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "element_selector": "button"}'

# Check status
curl http://localhost:5000/api/status/{crawl_id}

# Download GIF
curl http://localhost:5000/api/gif/{crawl_id} -o test.gif
```

### Frontend Testing

```tsx
// Test component
import { render, fireEvent, waitFor } from '@testing-library/react';
import { HoverGif } from './HoverGif';

test('shows loading state on hover', async () => {
  const { getByText } = render(
    <HoverGif targetUrl="https://example.com" elementSelector="button">
      <button>Test Button</button>
    </HoverGif>
  );

  fireEvent.mouseEnter(getByText('Test Button'));
  
  await waitFor(() => {
    expect(getByText('Loading preview...')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Common Issues

1. **Playwright Installation**: Ensure Playwright browsers are installed
2. **CORS Errors**: Check CORS configuration in Flask app
3. **Timeout Issues**: Adjust wait times for slow-loading pages
4. **Memory Usage**: Monitor memory usage with multiple concurrent crawls
5. **File Permissions**: Ensure write permissions for screenshot/GIF directories

### Debug Mode

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Performance Monitoring

```python
import time

def monitor_crawl_performance(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"Crawl took {end_time - start_time:.2f} seconds")
        return result
    return wrapper
```

## Future Enhancements

1. **Video Generation**: Extend to generate MP4 videos instead of GIFs
2. **Mobile Support**: Add mobile device simulation
3. **Batch Processing**: Support multiple elements in one request
4. **Analytics**: Track usage patterns and performance metrics
5. **CDN Integration**: Store GIFs in CDN for better performance
6. **Real-time Updates**: Use WebSockets for real-time status updates

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Check backend logs for detailed error information
4. Ensure all dependencies are properly installed

