import React, { useState, useRef } from 'react';

interface SimplePreviewTooltipProps {
  children: React.ReactNode;
  targetUrl: string;
  elementId: string;
  className?: string;
  apiBaseUrl?: string;
}


export const SimplePreviewTooltip: React.FC<SimplePreviewTooltipProps> = ({
  children,
  targetUrl,
  elementId,
  className = '',
  // No API calls needed - using browser cache only
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

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
          className="absolute z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none"
          style={{ 
            top: '100%', 
            left: '50%', 
            transform: 'translateX(-50%)',
            marginTop: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          {targetUrl.includes('github.com')
            ? 'View TeenyAI on GitHub'
            : 'Click to explore'}
        </div>
      )}
    </div>
  );
};
