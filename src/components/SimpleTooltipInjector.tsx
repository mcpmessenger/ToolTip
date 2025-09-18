import React, { useEffect, useState } from 'react';
import { usePreScrapedCache } from '../hooks/usePreScrapedCache';

interface SimpleTooltipInjectorProps {
  className?: string;
}

export const SimpleTooltipInjector: React.FC<SimpleTooltipInjectorProps> = ({
  className = ''
}) => {
  const { elements, isLoaded, totalElements, processedElements } = usePreScrapedCache();

  return (
    <div className={`simple-tooltip-injector ${className}`}>
      {/* Status Indicators */}
      {!isLoaded && (
        <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Loading pre-scraped cache...</span>
          </div>
        </div>
      )}

      {isLoaded && elements.length > 0 && (
        <div className="fixed bottom-4 left-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>
              Pre-scraped {totalElements} elements - {processedElements} previews ready!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleTooltipInjector;
