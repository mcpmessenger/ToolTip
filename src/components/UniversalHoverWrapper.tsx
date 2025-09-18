import React, { useState, useEffect, useRef } from 'react';
import { HoverGif } from './HoverGif';
import { useCrawling } from '../hooks/useCrawling';

interface UniversalHoverWrapperProps {
  children: React.ReactNode;
  className?: string;
  enableAutoDetection?: boolean;
  targetUrl?: string;
}

export const UniversalHoverWrapper: React.FC<UniversalHoverWrapperProps> = ({
  children,
  className = '',
  enableAutoDetection = true,
  targetUrl
}) => {
  const [pageElements, setPageElements] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const { getPageElements } = useCrawling();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Get current page URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  // Scan page for clickable elements
  const scanPage = async () => {
    if (!enableAutoDetection || !currentUrl) return;
    
    setIsScanning(true);
    try {
      const elements = await getPageElements(currentUrl);
      setPageElements(elements);
      console.log('Found clickable elements:', elements);
    } catch (error) {
      console.error('Error scanning page:', error);
    } finally {
      setIsScanning(false);
    }
  };

  // Auto-scan on mount
  useEffect(() => {
    if (enableAutoDetection && currentUrl) {
      scanPage();
    }
  }, [currentUrl, enableAutoDetection]);

  // Create element mapping for quick lookup
  const elementMap = new Map();
  pageElements.forEach((element, index) => {
    elementMap.set(element.selector, element);
    elementMap.set(element.text, element);
    elementMap.set(`${element.coordinates[0]},${element.coordinates[1]}`, element);
  });

  // Enhanced children with tooltip functionality
  const enhanceChildren = (children: React.ReactNode): React.ReactNode => {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) {
        return child;
      }

      // Check if this element should have a tooltip
      const shouldAddTooltip = (element: HTMLElement): boolean => {
        const tagName = element.tagName.toLowerCase();
        const isClickable = ['button', 'a', 'input', 'select', 'textarea'].includes(tagName) ||
                           element.hasAttribute('onclick') ||
                           element.hasAttribute('role') ||
                           element.classList.contains('btn') ||
                           element.classList.contains('button') ||
                           element.classList.contains('clickable');
        
        return isClickable && element.offsetWidth > 0 && element.offsetHeight > 0;
      };

      // Find matching element data
      const findElementData = (element: HTMLElement) => {
        // Try to match by text content
        const text = element.textContent?.trim();
        if (text && elementMap.has(text)) {
          return elementMap.get(text);
        }

        // Try to match by class name
        const className = element.className;
        if (className) {
          const classSelector = `.${className.split(' ')[0]}`;
          if (elementMap.has(classSelector)) {
            return elementMap.get(classSelector);
          }
        }

        // Try to match by ID
        const id = element.id;
        if (id) {
          const idSelector = `#${id}`;
          if (elementMap.has(idSelector)) {
            return elementMap.get(idSelector);
          }
        }

        // Try to match by tag name
        const tagName = element.tagName.toLowerCase();
        const tagSelector = `${tagName}:nth-child(${Array.from(element.parentElement?.children || []).indexOf(element) + 1})`;
        if (elementMap.has(tagSelector)) {
          return elementMap.get(tagSelector);
        }

        return null;
      };

      // Clone the element and add tooltip functionality
      const enhancedChild = React.cloneElement(child, {
        ...child.props,
        ref: (node: HTMLElement) => {
          if (node && shouldAddTooltip(node)) {
            const elementData = findElementData(node);
            if (elementData) {
              // We'll wrap this element with HoverGif
              return;
            }
          }
          // Call original ref if it exists
          if (typeof child.ref === 'function') {
            child.ref(node);
          } else if (child.ref) {
            (child.ref as any).current = node;
          }
        }
      });

      // If this is a clickable element, wrap it with HoverGif
      if (React.isValidElement(child) && child.type !== 'div') {
        const elementData = findElementData(child as any);
        if (elementData) {
          return (
            <HoverGif
              key={elementData.index}
              targetUrl={targetUrl || currentUrl}
              elementSelector={elementData.selector}
              elementText={elementData.text}
              coordinates={elementData.coordinates}
              waitTime={2.0}
            >
              {enhancedChild}
            </HoverGif>
          );
        }
      }

      // Recursively enhance children
      if (child.props.children) {
        return React.cloneElement(child, {
          ...child.props,
          children: enhanceChildren(child.props.children)
        });
      }

      return enhancedChild;
    });
  };

  return (
    <div ref={wrapperRef} className={`universal-hover-wrapper ${className}`}>
      {isScanning && (
        <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Scanning page for clickable elements...</span>
          </div>
        </div>
      )}
      
      {enableAutoDetection && pageElements.length > 0 && (
        <div className="fixed bottom-4 left-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Found {pageElements.length} clickable elements - hover to see previews!</span>
          </div>
        </div>
      )}

      {enhanceChildren(children)}
    </div>
  );
};

export default UniversalHoverWrapper;