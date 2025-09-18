import React, { useState, useEffect } from 'react';
import { HoverGif } from './HoverGif';
import { useCrawling } from '../hooks/useCrawling';

interface PageTooltipScannerProps {
  targetUrl?: string;
  className?: string;
}

interface ClickableElement {
  id: string;
  element: HTMLElement;
  selector: string;
  text: string;
  coordinates: [number, number];
  tagName: string;
}

export const PageTooltipScanner: React.FC<PageTooltipScannerProps> = ({
  targetUrl,
  className = ''
}) => {
  const [elements, setElements] = useState<ClickableElement[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const { getPageElements } = useCrawling();

  // Get current page URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  // Scan page for clickable elements
  const scanPage = async () => {
    const url = targetUrl || currentUrl;
    if (!url) return;

    setIsScanning(true);
    try {
      // Get elements from backend
      const pageElements = await getPageElements(url);
      
      // Find corresponding elements on the current page
      const clickableElements: ClickableElement[] = [];
      
      const clickableSelectors = [
        'button',
        'a[href]',
        'input[type="button"]',
        'input[type="submit"]',
        'input[type="reset"]',
        '[onclick]',
        '[role="button"]',
        '[role="link"]',
        '.btn',
        '.button',
        '[class*="btn"]',
        '[class*="button"]'
      ];

      clickableSelectors.forEach(selector => {
        const found = document.querySelectorAll(selector);
        found.forEach((element, index) => {
          const htmlElement = element as HTMLElement;
          const rect = htmlElement.getBoundingClientRect();
          
          // Only include visible elements
          if (rect.width > 0 && rect.height > 0) {
            const elementData: ClickableElement = {
              id: `element-${index}-${Date.now()}`,
              element: htmlElement,
              selector: generateSelector(htmlElement),
              text: htmlElement.textContent?.trim() || '',
              coordinates: [Math.round(rect.left + rect.width / 2), Math.round(rect.top + rect.height / 2)],
              tagName: htmlElement.tagName.toLowerCase()
            };
            
            clickableElements.push(elementData);
          }
        });
      });

      setElements(clickableElements);
      console.log('Found clickable elements:', clickableElements);
    } catch (error) {
      console.error('Error scanning page:', error);
    } finally {
      setIsScanning(false);
    }
  };

  // Generate selector for element
  const generateSelector = (element: HTMLElement): string => {
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

  // Auto-scan on mount
  useEffect(() => {
    if (currentUrl) {
      scanPage();
    }
  }, [currentUrl]);

  // Create tooltip components for each element
  const createTooltipComponents = () => {
    return elements.map((elementData) => {
      const { element, selector, text, coordinates } = elementData;
      
      return (
        <HoverGif
          key={elementData.id}
          targetUrl={targetUrl || currentUrl}
          elementSelector={selector}
          elementText={text}
          coordinates={coordinates}
          waitTime={2.0}
        >
          <div
            style={{
              position: 'absolute',
              top: element.offsetTop,
              left: element.offsetLeft,
              width: element.offsetWidth,
              height: element.offsetHeight,
              pointerEvents: 'none',
              zIndex: 1000
            }}
          />
        </HoverGif>
      );
    });
  };

  return (
    <div className={`page-tooltip-scanner ${className}`}>
      {isScanning && (
        <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Scanning page for clickable elements...</span>
          </div>
        </div>
      )}
      
      {elements.length > 0 && (
        <div className="fixed bottom-4 left-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Found {elements.length} clickable elements - hover to see previews!</span>
          </div>
        </div>
      )}

      {/* Render invisible tooltip overlays */}
      {createTooltipComponents()}
    </div>
  );
};

export default PageTooltipScanner;
