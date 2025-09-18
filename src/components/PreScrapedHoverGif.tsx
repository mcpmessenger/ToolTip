import React, { useState, useRef } from 'react';

interface PreScrapedHoverGifProps {
  children: React.ReactNode;
  elementId: string;
  selector: string;
  text: string;
  gifUrl?: string;
  isProcessed: boolean;
  className?: string;
}

export const PreScrapedHoverGif: React.FC<PreScrapedHoverGifProps> = ({
  children,
  elementId,
  selector,
  text,
  gifUrl,
  isProcessed,
  className = ''
}) => {
  const [showGif, setShowGif] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  // Use the provided gifUrl directly - no API calls needed!
  const displayGifUrl = gifUrl;

  const handleMouseEnter = () => {
    setShowGif(true);
  };

  const handleMouseLeave = () => {
    setShowGif(false);
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

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
          
          {/* Success State - GIF Display */}
          {displayGifUrl && (
            <div className="flex flex-col items-center space-y-2">
              <img 
                src={displayGifUrl} 
                alt="Click preview" 
                className="max-w-full max-h-48 rounded border"
                style={{ maxWidth: '350px', maxHeight: '200px' }}
                onError={() => {
                  console.error('Failed to load preview GIF for element:', elementId);
                }}
              />
              {/* Removed text to give more space for thumbnail display */}
            </div>
          )}

          {/* Fallback State - No Preview Available */}
          {!displayGifUrl && (
            <div className="flex flex-col items-center space-y-2 p-4">
              <div className="text-red-500 text-center">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm font-medium">No Preview Available</p>
                <p className="text-xs text-gray-500">Hover over a button to see what it does</p>
              </div>
            </div>
          )}
          
          {/* Initial State - Not Yet Processed */}
          {!isProcessed && (
            <div className="flex items-center space-x-2 p-4">
              <div className="animate-pulse">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              </div>
              <span className="text-sm text-gray-600">Preparing preview...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
