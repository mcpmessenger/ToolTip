import React, { useState, useEffect, useRef } from 'react';

interface ProactiveHoverGifProps {
  children: React.ReactNode;
  targetUrl: string;
  elementSelector?: string;
  elementText?: string;
  className?: string;
  waitTime?: number;
}

interface ProactiveElement {
  id: string;
  tag: string;
  text: string;
  selector: string;
  allSelectors?: string[];
  coordinates: [number, number];
  visible: boolean;
  previewId?: string;
  previewUrl?: string;
  attributes?: {
    title?: string | null;
    'aria-label'?: string | null;
    'data-testid'?: string | null;
    'data-cy'?: string | null;
    href?: string | null;
    className?: string;
  };
}

interface ProactiveScrapeResult {
  url: string;
  elements: ProactiveElement[];
  scrapedAt: string;
  totalElements: number;
  successfulPreviews: number;
}

export const ProactiveHoverGif: React.FC<ProactiveHoverGifProps> = ({
  children,
  targetUrl,
  elementSelector,
  elementText,
  className = '',
  waitTime = 2.0
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapeData, setScrapeData] = useState<ProactiveScrapeResult | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  const API_BASE_URL = 'http://localhost:3001';

  // Find matching element in scrape data with improved matching logic
  const findMatchingElement = (): ProactiveElement | null => {
    if (!scrapeData) return null;
    
    return scrapeData.elements.find(element => {
      // Strategy 1: Exact selector match
      if (elementSelector && element.selector === elementSelector) return true;
      
      // Strategy 2: All selectors match (check all possible selectors)
      if (elementSelector && element.allSelectors) {
        if (element.allSelectors.includes(elementSelector)) return true;
      }
      
      // Strategy 3: Text content match (normalized)
      if (elementText) {
        const normalizedElementText = element.text.toLowerCase().replace(/[^\w\s]/g, '').trim();
        const normalizedTargetText = elementText.toLowerCase().replace(/[^\w\s]/g, '').trim();
        if (normalizedElementText.includes(normalizedTargetText) || 
            normalizedTargetText.includes(normalizedElementText)) return true;
      }
      
      // Strategy 4: Attribute matching
      if (element.attributes) {
        // Title attribute match
        if (elementText && element.attributes.title && 
            element.attributes.title.toLowerCase().includes(elementText.toLowerCase())) return true;
        
        // Aria-label attribute match
        if (elementText && element.attributes['aria-label'] && 
            element.attributes['aria-label'].toLowerCase().includes(elementText.toLowerCase())) return true;
        
        // Href attribute match (for links)
        if (elementSelector && element.attributes.href && 
            elementSelector.includes(element.attributes.href)) return true;
      }
      
      // Strategy 5: Partial selector match (for complex selectors)
      if (elementSelector && element.selector) {
        const elementParts = element.selector.split(' ');
        const targetParts = elementSelector.split(' ');
        if (elementParts.some(part => targetParts.includes(part))) return true;
      }
      
      // Strategy 6: Tag + text combination
      if (elementText && element.tag) {
        const tagMatch = elementSelector?.includes(element.tag);
        const textMatch = element.text.toLowerCase().includes(elementText.toLowerCase());
        if (tagMatch && textMatch) return true;
      }
      
      return false;
    }) || null;
  };

  // Load proactive scrape data
  const loadProactiveData = async () => {
    if (scrapeData) return; // Already loaded
    
    try {
      setIsLoading(true);
      
      // First try to get cached results
      const cachedResponse = await fetch(`${API_BASE_URL}/api/proactive-scrape/${encodeURIComponent(targetUrl)}`);
      
      if (cachedResponse.ok) {
        const cachedData = await cachedResponse.json();
        setScrapeData(cachedData.data);
        console.log('Loaded cached proactive scrape data');
      } else {
        // If no cached data, trigger proactive scraping
        console.log('No cached data found, starting proactive scrape...');
        const scrapeResponse = await fetch(`${API_BASE_URL}/api/proactive-scrape`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: targetUrl })
        });
        
        if (scrapeResponse.ok) {
          const scrapeData = await scrapeResponse.json();
          setScrapeData(scrapeData.data);
          console.log('Proactive scraping completed:', scrapeData);
        } else {
          const errorData = await scrapeResponse.json();
          throw new Error(errorData.message || 'Failed to start proactive scraping');
        }
      }
    } catch (error) {
      console.error('Error loading proactive data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load preview data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseEnter = () => {
    setShowPreview(true);
    
    // Start loading proactive data after a short delay
    hoverTimeoutRef.current = setTimeout(() => {
      if (!scrapeData && !isLoading) {
        loadProactiveData();
      } else if (scrapeData) {
        // Data already loaded, find matching element
        const matchingElement = findMatchingElement();
        if (matchingElement?.previewId) {
          setPreviewUrl(`${API_BASE_URL}/api/proactive-scrape/element-preview/${matchingElement.previewId}`);
        }
      }
    }, 300);
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  // Update preview URL when scrape data changes
  useEffect(() => {
    if (scrapeData) {
      const matchingElement = findMatchingElement();
      if (matchingElement?.previewId) {
        setPreviewUrl(`${API_BASE_URL}/api/proactive-scrape/element-preview/${matchingElement.previewId}`);
      }
    }
  }, [scrapeData, elementSelector, elementText]);

  const handleRetry = () => {
    setError(null);
    setScrapeData(null);
    setPreviewUrl(null);
    loadProactiveData();
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
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
      
      {showPreview && (
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
              <span className="text-sm text-gray-600">Scanning page for clickable elements...</span>
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
          
          {/* Success State - Show actual click preview */}
          {previewUrl && !isLoading && !error && (
            <div className="flex flex-col items-center space-y-2">
              <img 
                src={previewUrl}
                alt="Click preview" 
                className="max-w-full max-h-48 rounded border"
                style={{ maxWidth: '350px', maxHeight: '200px' }}
                onError={() => setError('Failed to load preview')}
              />
              <div className="text-center">
                <p className="text-xs text-gray-500 font-medium">
                  Click preview ready
                </p>
                <p className="text-xs text-gray-400">
                  {targetUrl}
                </p>
                <div className="flex items-center justify-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600">Live Preview</span>
                </div>
                {scrapeData && (
                  <p className="text-xs text-gray-400 mt-1">
                    {scrapeData.successfulPreviews}/{scrapeData.totalElements} elements scanned
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Initial State */}
          {!isLoading && !previewUrl && !error && (
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
