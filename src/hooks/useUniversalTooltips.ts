import { useEffect, useRef, useState } from 'react';
import { useCrawling } from './useCrawling';

interface ClickableElement {
  element: HTMLElement;
  selector: string;
  text: string;
  coordinates: [number, number];
  tagName: string;
}

export const useUniversalTooltips = (targetUrl?: string) => {
  const [elements, setElements] = useState<ClickableElement[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const { getPageElements } = useCrawling();
  const tooltipContainerRef = useRef<HTMLDivElement>(null);

  // Scan the current page for clickable elements
  const scanPage = async () => {
    if (!targetUrl) return;
    
    setIsScanning(true);
    try {
      const pageElements = await getPageElements(targetUrl);
      
      // Convert page elements to clickable elements
      const clickableElements: ClickableElement[] = [];
      
      // Find all clickable elements on the current page
      const clickableSelectors = [
        'button',
        'a[href]',
        'input[type="button"]',
        'input[type="submit"]',
        'input[type="reset"]',
        '[onclick]',
        '[role="button"]',
        '[role="link"]',
        '[role="menuitem"]',
        '[role="tab"]',
        '[tabindex]:not([tabindex="-1"])',
        '.btn',
        '.button',
        '.clickable',
        '[class*="btn"]',
        '[class*="button"]',
        '[class*="link"]'
      ];

      clickableSelectors.forEach(selector => {
        const found = document.querySelectorAll(selector);
        found.forEach((element, index) => {
          const htmlElement = element as HTMLElement;
          const rect = htmlElement.getBoundingClientRect();
          
          // Only include visible elements
          if (rect.width > 0 && rect.height > 0) {
            clickableElements.push({
              element: htmlElement,
              selector: generateSelector(htmlElement),
              text: htmlElement.textContent?.trim() || '',
              coordinates: [rect.left + rect.width / 2, rect.top + rect.height / 2],
              tagName: htmlElement.tagName.toLowerCase()
            });
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

  // Generate a unique selector for an element
  const generateSelector = (element: HTMLElement): string => {
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.length > 0);
      if (classes.length > 0) {
        return `.${classes.join('.')}`;
      }
    }

    // Fallback to tag name with nth-child
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
    if (targetUrl) {
      scanPage();
    }
  }, [targetUrl]);

  return {
    elements,
    isScanning,
    scanPage,
    tooltipContainerRef
  };
};
