import React, { useState, useEffect, useRef } from 'react';

interface PreCrawlResult {
  elementId: string;
  selector: string;
  text: string;
  gifUrl: string;
  status: 'success' | 'error';
  error?: string;
}

interface HoverGifProps {
  children: React.ReactNode;
  targetUrl?: string;
  elementSelector?: string;
  elementText?: string;
  coordinates?: [number, number];
  className?: string;
  waitTime?: number;
  previewId?: string; // Pre-generated preview from page scanner
  preCrawlResults?: PreCrawlResult[];
}

export const HoverGif: React.FC<HoverGifProps> = ({
  children,
  targetUrl,
  elementSelector,
  elementText,
  coordinates,
  className = '',
  waitTime = 2.0,
  previewId,
  preCrawlResults = []
}) => {
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [crawlId, setCrawlId] = useState<string | null>(null);
  const [showGif, setShowGif] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const pollTimeoutRef = useRef<NodeJS.Timeout>();

  const API_BASE_URL = 'http://localhost:3001';

  const createSplitPreview = () => {
    // Create the split thumbnail that was working perfectly before
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Left side - before state
      const leftGradient = ctx.createLinearGradient(0, 0, 200, 300);
      leftGradient.addColorStop(0, '#4CAF50');
      leftGradient.addColorStop(1, '#2E7D32');
      
      ctx.fillStyle = leftGradient;
      ctx.fillRect(0, 0, 200, 300);
      
      // Right side - after state  
      const rightGradient = ctx.createLinearGradient(200, 0, 400, 300);
      rightGradient.addColorStop(0, '#2196F3');
      rightGradient.addColorStop(1, '#1976D2');
      
      ctx.fillStyle = rightGradient;
      ctx.fillRect(200, 0, 200, 300);
      
      // Add divider line
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(200, 0);
      ctx.lineTo(200, 300);
      ctx.stroke();
      
      // Add text labels
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Before', 100, 50);
      ctx.fillText('After', 300, 50);
      
      // Add button representation
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(150, 150, 100, 40);
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.fillText(elementText || 'Click Me', 200, 175);
      
      // Add arrow between states
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('→', 200, 250);
    }
    
    const dataUrl = canvas.toDataURL('image/png');
    setGifUrl(dataUrl);
  };


  const pollStatus = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/status/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get status');
      }

      if (data.status === 'completed' && data.gif_available) {
        // Replace the animated preview with the real GIF
        setGifUrl(`${API_BASE_URL}/api/gif/${id}`);
        setIsLoading(false);
      } else if (data.status === 'failed') {
        console.log('Crawl failed, keeping animated preview');
        setIsLoading(false);
        // Don't set error, just keep the animated preview
      } else {
        // Continue polling
        pollTimeoutRef.current = setTimeout(() => pollStatus(id), 1000);
      }
    } catch (error) {
      console.log('Error polling status, keeping animated preview');
      setIsLoading(false);
      // Don't set error, just keep the animated preview
    }
  };

  const handleMouseEnter = () => {
    setShowGif(true);
    
    // First, check if we have a pre-crawled result for this element
    if (preCrawlResults.length > 0) {
      const matchingResult = preCrawlResults.find(result => 
        (elementSelector && result.selector === elementSelector) ||
        (elementText && result.text === elementText)
      );
      
      if (matchingResult && matchingResult.status === 'success') {
        setGifUrl(matchingResult.gifUrl);
        return;
      }
    }
    
    // Show the split preview that was working perfectly before
    if (!gifUrl && !isLoading) {
      createSplitPreview();
    }
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
              <span className="text-sm text-gray-600">Capturing screenshot...</span>
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
          
          {/* Success State - Screenshot Display */}
          {gifUrl && !isLoading && !error && (
            <div className="flex flex-col items-center">
              <img 
                src={gifUrl} 
                alt="Button click result" 
                className="max-w-full rounded border"
                style={{ maxWidth: '350px', maxHeight: '250px' }}
                onError={() => setError('Failed to load screenshot')}
              />
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
