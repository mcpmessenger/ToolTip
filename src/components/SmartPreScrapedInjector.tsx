import React, { useEffect, useState } from 'react';
import { usePreScrapedCache } from '../hooks/usePreScrapedCache';
import { PreScrapedHoverGif } from './PreScrapedHoverGif';

interface SmartPreScrapedInjectorProps {
  targetUrl?: string;
  className?: string;
}

export const SmartPreScrapedInjector: React.FC<SmartPreScrapedInjectorProps> = ({
  targetUrl,
  className = ''
}) => {
  const {
    elements,
    isLoaded,
    totalElements,
    processedElements,
    getElementById,
    scanAndCache
  } = usePreScrapedCache();

  const [injectedElements, setInjectedElements] = useState<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const injectTooltips = () => {
      // Find all clickable elements that don't already have tooltips
      const clickableSelectors = [
        'button:not([data-prescraped-tooltip-injected])',
        'a[href]:not([data-prescraped-tooltip-injected])',
        'input[type="button"]:not([data-prescraped-tooltip-injected])',
        'input[type="submit"]:not([data-prescraped-tooltip-injected])',
        '[onclick]:not([data-prescraped-tooltip-injected])',
        '[role="button"]:not([data-prescraped-tooltip-injected])',
        '.btn:not([data-prescraped-tooltip-injected])',
        '.button:not([data-prescraped-tooltip-injected])',
        '[class*="btn"]:not([data-prescraped-tooltip-injected])'
      ];

      const newInjectedElements = new Map<string, HTMLElement>();

      clickableSelectors.forEach(selector => {
        const domElements = document.querySelectorAll(selector);
        domElements.forEach((element) => {
          const htmlElement = element as HTMLElement;
          
          // Skip if already injected or not visible
          if (htmlElement.hasAttribute('data-prescraped-tooltip-injected') || 
              htmlElement.offsetWidth === 0 || 
              htmlElement.offsetHeight === 0) {
            return;
          }

          // Mark as injected
          htmlElement.setAttribute('data-prescraped-tooltip-injected', 'true');

          // Find matching scraped element
          const scrapedElement = elements.find(el => 
            el.selector === generateSelector(htmlElement) ||
            el.text === htmlElement.textContent?.trim()
          );

          if (scrapedElement) {
            newInjectedElements.set(scrapedElement.id, htmlElement);
          }
        });
      });

      setInjectedElements(newInjectedElements);
      console.log(`Injected pre-scraped tooltips into ${newInjectedElements.size} elements`);
    };

    // Inject tooltips when cache is loaded
    if (isLoaded && elements.length > 0) {
      const timer = setTimeout(injectTooltips, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, elements]);

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

  // Create tooltip components for each injected element
  const createTooltipComponents = () => {
    const components: React.ReactNode[] = [];
    
    injectedElements.forEach((htmlElement, elementId) => {
      const scrapedElement = elements.find(el => el.id === elementId);
      if (scrapedElement) {
        const tooltipComponent = React.createElement(PreScrapedHoverGif, {
          key: elementId,
          elementId: scrapedElement.id,
          selector: scrapedElement.selector,
          text: scrapedElement.text,
          gifUrl: scrapedElement.gifUrl,
          isProcessed: scrapedElement.isProcessed
        }, htmlElement);
        
        components.push(tooltipComponent);
      }
    });

    return components;
  };

  return (
    <div className={`smart-prescraped-injector ${className}`}>
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

      {/* Render tooltip components */}
      {createTooltipComponents()}
    </div>
  );
};

export default SmartPreScrapedInjector;
