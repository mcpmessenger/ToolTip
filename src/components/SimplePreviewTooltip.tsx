import React, { useState, useEffect, useRef } from 'react';

interface SimplePreviewTooltipProps {
  children: React.ReactNode;
  targetUrl: string;
  elementId: string;
  className?: string;
  apiBaseUrl?: string;
}

// Cache cleanup function to prevent localStorage overflow
const cleanupOldCache = () => {
  const maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours
  const maxCacheSize = 50; // Maximum number of cache entries
  
  const cacheKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('preview_')) {
      cacheKeys.push(key);
    }
  }
  
  // Remove old entries
  cacheKeys.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      const age = Date.now() - new Date(data.timestamp || 0).getTime();
      if (age > maxCacheAge) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      // Remove invalid entries
      localStorage.removeItem(key);
    }
  });
  
  // If still too many entries, remove oldest ones
  if (cacheKeys.length > maxCacheSize) {
    const entries = cacheKeys.map(key => ({
      key,
      timestamp: new Date(JSON.parse(localStorage.getItem(key) || '{}').timestamp || 0).getTime()
    })).sort((a, b) => a.timestamp - b.timestamp);
    
    // Remove oldest entries
    const toRemove = entries.slice(0, entries.length - maxCacheSize);
    toRemove.forEach(entry => localStorage.removeItem(entry.key));
  }
};

export const SimplePreviewTooltip: React.FC<SimplePreviewTooltipProps> = ({
  children,
  targetUrl,
  elementId,
  className = '',
  // No API calls needed - using browser cache only
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);

  const fetchPreview = async () => {
    if (previewData || isLoading) return;

    setIsLoading(true);
    setError(null);

    const proactiveResults = localStorage.getItem('proactive_scrape_results');
    if (proactiveResults) {
      try {
        const results = JSON.parse(proactiveResults);
        const elementResult = results.find((r: any) => r.elementId === elementId);
        if (elementResult && elementResult.success) {
          console.log(`✅ Found proactive scrape result for ${elementId}:`, elementResult);
          const newPreviewData = {
            type: 'after-screenshot',
            title: elementResult.title,
            description: elementResult.isExternalNavigation
              ? `External page: ${elementResult.externalUrl}`
              : `Result after clicking ${elementResult.title}`,
            afterScreenshot: elementResult.afterScreenshot,
            isExternalNavigation: elementResult.isExternalNavigation,
            externalUrl: elementResult.externalUrl,
            timestamp: elementResult.timestamp
          };
          setPreviewData(newPreviewData);
          const cacheKey = `preview_${window.location.href}_${elementId}`;
          localStorage.setItem(cacheKey, JSON.stringify(newPreviewData));
        } else {
          setError('No preview available for this element.');
        }
      } catch (e) {
        setError('Failed to parse preview data.');
      }
    } else {
      setError('Proactive scraping results not found.');
    }

    setIsLoading(false);
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
    
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Check Local Storage immediately first
    const currentUrl = window.location.href;
    const cacheKey = `preview_${currentUrl}_${elementId}`;
    console.log(`🔍 Checking Local Storage for key: ${cacheKey}`);
    
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        console.log(`✅ Found cached data for ${elementId}:`, parsed);
        setPreviewData(parsed);
        return; // Don't show loading state if we have cached data
      } catch (e) {
        console.log(`❌ Invalid cached data for ${elementId}, removing...`);
        localStorage.removeItem(cacheKey);
      }
    }
    
    // Check global proactive scrape results
    const proactiveResults = localStorage.getItem('proactive_scrape_results');
    if (proactiveResults) {
      try {
        const results = JSON.parse(proactiveResults);
        const elementResult = results.find((r: any) => r.elementId === elementId);
        if (elementResult && elementResult.success) {
          console.log(`✅ Found proactive scrape result for ${elementId}:`, elementResult);
          const previewData = {
            type: 'after-screenshot',
            title: elementResult.title,
            description: elementResult.isExternalNavigation 
              ? `External page: ${elementResult.externalUrl}` 
              : `Result after clicking ${elementResult.title}`,
            afterScreenshot: elementResult.afterScreenshot,
            isExternalNavigation: elementResult.isExternalNavigation,
            externalUrl: elementResult.externalUrl,
            timestamp: elementResult.timestamp
          };
          setPreviewData(previewData);
          localStorage.setItem(cacheKey, JSON.stringify(previewData));
          return; // Don't show loading state if we have cached data
        }
      } catch (e) {
        console.log(`❌ Invalid proactive scrape results, removing...`);
        localStorage.removeItem('proactive_scrape_results');
      }
    }
    
    // Only show loading state if no cached data found
    hoverTimeoutRef.current = setTimeout(() => {
      if (!previewData && !isLoading) {
        fetchPreview();
      }
    }, 500);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
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
      
      {showTooltip && (
        <div 
          ref={tooltipRef}
          className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl pointer-events-none overflow-hidden"
          style={{ 
            top: '100%', 
            left: '50%', 
            transform: 'translateX(-50%)',
            marginTop: '8px',
            width: '500px',
            height: '350px',
            maxWidth: '90vw',
            maxHeight: '50vh'
          }}
        >
          {/* Loading State */}
          {isLoading && (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50">
              <div className="relative">
                {/* Hourglass Icon */}
                <svg className="w-16 h-16 text-blue-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l-4 4h8l-4-4zm0 20l4-4H8l4 4zm-4-6h8v2H8v-2zm0-2h8v2H8v-2z"/>
                </svg>
                {/* Animated sand particles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce absolute" style={{animationDelay: '0ms', top: '20%', left: '45%'}}></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce absolute" style={{animationDelay: '200ms', top: '30%', left: '50%'}}></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce absolute" style={{animationDelay: '400ms', top: '40%', left: '47%'}}></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce absolute" style={{animationDelay: '600ms', top: '50%', left: '52%'}}></div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 font-medium">Scraping in progress...</div>
              <div className="mt-2 text-xs text-gray-500">Capturing external page</div>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="h-full flex flex-col items-center justify-center bg-red-50">
              <div className="text-red-500 text-center">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}
          
          {/* Success State - Show actual result */}
          {previewData && !isLoading && !error && (
            <div className="h-full flex flex-col">
              {previewData.type === 'action_result' ? (
                // Show what happens when the button is clicked
                <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-8">
                  <div className="text-6xl mb-6">{previewData.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                    {previewData.title}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 text-center max-w-md">
                    {previewData.description}
                  </p>
                  <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 max-w-sm">
                    <p className="text-sm text-gray-700 text-center">
                      <strong>Result:</strong> {previewData.result}
                    </p>
                  </div>
                </div>
      ) : previewData.type === 'after-screenshot' ? (
        // Show after screenshot
        <div className="h-full relative">
          {previewData.afterScreenshot ? (
            <div className="h-full flex flex-col">
              <div className="text-xs text-gray-500 mb-2 text-center px-4">
                {previewData.description}
                {previewData.isExternalNavigation && (
                  <div className="mt-1 text-blue-600 font-medium">
                    🌍 External Page
                  </div>
                )}
              </div>
              <div className="flex-1 p-2">
                <img 
                  src={previewData.afterScreenshot}
                  alt={previewData.isExternalNavigation ? "External page screenshot" : "Result after clicking"}
                  className="w-full h-full object-contain rounded border shadow-lg"
                  style={{ 
                    imageRendering: 'auto',
                    objectFit: 'contain'
                  }}
                />
              </div>
              {previewData.isExternalNavigation && previewData.externalUrl && (
                <div className="text-xs text-blue-600 text-center px-2 pb-2 truncate">
                  {previewData.externalUrl}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No after screenshot available
            </div>
          )}
        </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Unknown preview type
                </div>
              )}
            </div>
          )}
          
          {/* Initial State */}
          {!isLoading && !previewData && !error && (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-blue-500 rounded-full mb-4"></div>
              </div>
              <span className="text-lg text-gray-600 font-medium">Hover to see preview</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
