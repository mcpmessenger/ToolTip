import React, { useState, useEffect, useRef } from 'react';

interface SmartHoverGifProps {
  children: React.ReactNode;
  element?: HTMLElement;
  className?: string;
  waitTime?: number;
}

export const SmartHoverGif: React.FC<SmartHoverGifProps> = ({
  children,
  element,
  className = '',
  waitTime = 2.0
}) => {
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [crawlId, setCrawlId] = useState<string | null>(null);
  const [showGif, setShowGif] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const pollTimeoutRef = useRef<NodeJS.Timeout>();

  const API_BASE_URL = 'http://localhost:3001';

  // Detect what this element does
  const detectElementAction = (element: HTMLElement) => {
    const tagName = element.tagName.toLowerCase();
    
    // For links, use the href
    if (tagName === 'a') {
      const href = element.getAttribute('href');
      if (href) {
        try {
          return new URL(href, window.location.href).href;
        } catch {
          return window.location.href;
        }
      }
    }

    // For buttons with data attributes
    const dataUrl = element.getAttribute('data-url') || 
                   element.getAttribute('data-href') ||
                   element.getAttribute('data-target');
    if (dataUrl) {
      try {
        return new URL(dataUrl, window.location.href).href;
      } catch {
        return window.location.href;
      }
    }

    // For onclick handlers that navigate
    const onclick = element.getAttribute('onclick');
    if (onclick) {
      const urlMatch = onclick.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
      if (urlMatch) {
        try {
          return new URL(urlMatch[1], window.location.href).href;
        } catch {
          return window.location.href;
        }
      }
    }

    // For form submissions
    if (tagName === 'form') {
      const action = element.getAttribute('action');
      if (action) {
        try {
          return new URL(action, window.location.href).href;
        } catch {
          return window.location.href;
        }
      }
    }

    // Default to current page
    return window.location.href;
  };

  // Generate smart selector for the element
  const generateSmartSelector = (element: HTMLElement): string => {
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.length > 0);
      if (classes.length > 0) {
        return `.${classes[0]}`;
      }
    }

    // Fallback to tag name with position
    let selector = element.tagName.toLowerCase();
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(element);
      if (index > 0) {
        selector += `:nth-child(${index + 1})`;
      }
    }

    return selector;
  };

  const startCrawl = async () => {
    if (isLoading || gifUrl || !element) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const targetUrl = detectElementAction(element);
      const elementSelector = generateSmartSelector(element);
      const elementText = element.textContent?.trim() || '';
      const rect = element.getBoundingClientRect();
      const coordinates: [number, number] = [
        Math.round(rect.left + rect.width / 2),
        Math.round(rect.top + rect.height / 2)
      ];

      console.log('Starting crawl for element:', {
        targetUrl,
        elementSelector,
        elementText,
        coordinates
      });

      const response = await fetch(`${API_BASE_URL}/api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: targetUrl,
          element_selector: elementSelector,
          element_text: elementText,
          coordinates: coordinates,
          wait_time: waitTime
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start crawl');
      }
      
      if (data.crawl_id) {
        setCrawlId(data.crawl_id);
        pollStatus(data.crawl_id);
      }
    } catch (error) {
      console.error('Error starting crawl:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setIsLoading(false);
    }
  };

  const pollStatus = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/status/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get status');
      }

      if (data.status === 'completed' && data.gif_available) {
        setGifUrl(`${API_BASE_URL}/api/gif/${id}`);
        setIsLoading(false);
      } else if (data.status === 'failed') {
        setIsLoading(false);
        setError(data.error || 'Crawl failed');
        console.error('Crawl failed:', data.error);
      } else {
        // Continue polling
        pollTimeoutRef.current = setTimeout(() => pollStatus(id), 1000);
      }
    } catch (error) {
      console.error('Error polling status:', error);
      setIsLoading(false);
      setError(error instanceof Error ? error.message : 'Unknown error');
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

  const handleRetry = () => {
    setError(null);
    setGifUrl(null);
    setCrawlId(null);
    startCrawl();
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
               marginTop: '8px',
               minWidth: '300px',
               maxWidth: '400px'
             }}>
          
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center space-y-2 p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-600">Generating click preview...</span>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center space-y-2 p-4">
              <div className="text-red-500 text-center">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm font-medium">Preview Failed</p>
                <p className="text-xs text-gray-500">{error}</p>
              </div>
              <button 
                onClick={handleRetry}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors pointer-events-auto"
              >
                Retry
              </button>
            </div>
          )}
          
          {/* Success State - GIF Display */}
          {gifUrl && !isLoading && !error && (
            <div className="flex flex-col items-center space-y-2">
              <img 
                src={gifUrl} 
                alt="Click preview" 
                className="max-w-full max-h-48 rounded border"
                style={{ maxWidth: '350px', maxHeight: '200px' }}
                onError={() => setError('Failed to load preview GIF')}
              />
              <div className="text-center">
                <p className="text-xs text-gray-500 font-medium">
                  Animated preview of clicking this element
                </p>
                <p className="text-xs text-gray-400">
                  {element ? detectElementAction(element) : 'Unknown target'}
                </p>
                <div className="flex items-center justify-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600">Live Preview</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Initial State */}
          {!isLoading && !gifUrl && !error && (
            <div className="flex items-center space-x-2 p-4">
              <div className="animate-pulse">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              </div>
              <span className="text-sm text-gray-600">Hover to see click preview</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
