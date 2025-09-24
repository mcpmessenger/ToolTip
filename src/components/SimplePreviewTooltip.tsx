import React, { useState, useEffect, useRef } from 'react';
import { SpiderVideoLoader } from './SpiderVideoLoader';

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

    try {
      const proactiveResults = localStorage.getItem('proactive_scrape_results');
      if (proactiveResults) {
        const results = JSON.parse(proactiveResults);
        const elementResult = results.find((r: any) => r.elementId === elementId);
        if (elementResult && elementResult.success && elementResult.afterScreenshot) {
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
          // No valid data found, show spider loader instead of error
          console.log(`⚠️ No valid preview data for ${elementId}, showing spider loader`);
          setPreviewData(null);
          setError(null);
        }
      } else {
        // No proactive results, show spider loader
        console.log(`⚠️ No proactive results found, showing spider loader`);
        setPreviewData(null);
        setError(null);
      }
    } catch (e) {
      console.error(`❌ Error fetching preview for ${elementId}:`, e);
      setError(null); // Don't show error, show spider loader instead
      setPreviewData(null);
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

  const clearCache = () => {
    const cacheKey = `preview_${window.location.href}_${elementId}`;
    localStorage.removeItem(cacheKey);
    setPreviewData(null);
    setError(null);
    fetchPreview();
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
            width: '600px',
            height: '400px',
            maxWidth: '90vw',
            maxHeight: '60vh'
          }}
        >
          {/* Loading State - Full Screen Spider Video Loader */}
          {isLoading && (
            <SpiderVideoLoader 
              fullScreen={true}
              text={targetUrl.includes('github.com') ? "Crawling GitHub..." : "Crawling page..."} 
              showText={true}
            />
          )}
          
          {/* Error State - Full Screen Spider Video Loader */}
          {error && (
            <div className="relative h-full">
              <SpiderVideoLoader 
                fullScreen={true}
                text="Retrying..." 
                showText={true}
              />
              <button
                onClick={clearCache}
                className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-md transition-colors"
              >
                Refresh
              </button>
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
                // Show after screenshot - PURELY VISUAL
                <div className="h-full relative">
                  {previewData.afterScreenshot ? (
                    <div className="h-full">
                      <img 
                        src={previewData.afterScreenshot}
                        alt="Preview"
                        className="w-full h-full object-contain rounded"
                        style={{ 
                          imageRendering: 'auto',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  ) : (
                    <SpiderVideoLoader 
                      fullScreen={true}
                      text="Loading screenshot..." 
                      showText={true}
                    />
                  )}
                </div>
              ) : (
                <SpiderVideoLoader 
                  fullScreen={true}
                  text="Loading preview..." 
                  showText={true}
                />
              )}
            </div>
          )}
          
          {/* Initial State - Full Screen Spider Video Loader for external links */}
          {!isLoading && !previewData && !error && (
            <SpiderVideoLoader 
              fullScreen={true}
              text={targetUrl.includes('github.com') ? "Crawling GitHub..." : "Crawling external link..."} 
              showText={true}
            />
          )}
        </div>
      )}
    </div>
  );
};
