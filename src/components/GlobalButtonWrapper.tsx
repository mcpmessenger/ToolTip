import React, { useState, useRef, useEffect } from 'react';
import { WaterBubbleLoader } from './WaterBubbleLoader';
import { useScraping } from '../contexts/ScrapingContext';

interface GlobalButtonWrapperProps {
  children: React.ReactElement;
  elementId?: string;
  className?: string;
}

export const GlobalButtonWrapper: React.FC<GlobalButtonWrapperProps> = ({ 
  children, 
  elementId,
  className = '' 
}) => {
  const { isElementScraping, setElementScraping } = useScraping();
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Get element ID from the child element if not provided
  const actualElementId = elementId || children.props.id || children.props['data-element-id'];

  const isButtonLoading = actualElementId ? isElementScraping(actualElementId) : isLocalLoading;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = async (e: React.MouseEvent) => {
    if (actualElementId) {
      // Set element as scraping
      setElementScraping(actualElementId, true);
      
      // Auto-clear after 10 seconds to prevent stuck states
      timeoutRef.current = setTimeout(() => {
        setElementScraping(actualElementId, false);
      }, 10000);
    } else {
      // Fallback to local loading state
      setIsLocalLoading(true);
      timeoutRef.current = setTimeout(() => {
        setIsLocalLoading(false);
      }, 3000);
    }

    // Call original onClick if it exists
    if (children.props.onClick) {
      await children.props.onClick(e);
    }
  };

  // Clone the child element and add loading state
  const enhancedChild = React.cloneElement(children, {
    onClick: handleClick,
    className: `${children.props.className || ''} ${isButtonLoading ? 'relative' : ''} ${className}`,
    style: {
      ...children.props.style,
      position: 'relative',
      overflow: 'hidden'
    }
  });

  return (
    <div className="relative inline-block">
      {enhancedChild}
      
      {/* Water bubble loader overlay */}
      {isButtonLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-inherit">
          <WaterBubbleLoader 
            isLoading={true} 
            size="md"
            className="z-10"
          />
        </div>
      )}
      
      {/* Subtle pulsing border when loading */}
      {isButtonLoading && (
        <div 
          className="absolute inset-0 border-2 border-blue-400 rounded-inherit animate-pulse"
          style={{
            animation: 'pulse 1.5s ease-in-out infinite'
          }}
        />
      )}
    </div>
  );
};
