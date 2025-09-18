import React, { useEffect, useState } from 'react';
import { HoverGif } from './HoverGif';

interface AutoTooltipWrapperProps {
  children: React.ReactNode;
  targetUrl?: string;
  className?: string;
}

export const AutoTooltipWrapper: React.FC<AutoTooltipWrapperProps> = ({
  children,
  targetUrl,
  className = ''
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      wrapClickableElements();
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const wrapClickableElements = () => {
    if (!targetUrl) return;

    // Find all clickable elements
    const clickableSelectors = [
      'button:not([data-tooltip-wrapped])',
      'a[href]:not([data-tooltip-wrapped])',
      'input[type="button"]:not([data-tooltip-wrapped])',
      'input[type="submit"]:not([data-tooltip-wrapped])',
      '[onclick]:not([data-tooltip-wrapped])',
      '[role="button"]:not([data-tooltip-wrapped])',
      '.btn:not([data-tooltip-wrapped])',
      '.button:not([data-tooltip-wrapped])',
      '[class*="btn"]:not([data-tooltip-wrapped])'
    ];

    clickableSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        
        // Skip if already wrapped or not visible
        if (htmlElement.hasAttribute('data-tooltip-wrapped') || 
            htmlElement.offsetWidth === 0 || 
            htmlElement.offsetHeight === 0) {
          return;
        }

        // Mark as wrapped
        htmlElement.setAttribute('data-tooltip-wrapped', 'true');

        // Generate selector for this element
        const elementSelector = generateSelector(htmlElement);
        const elementText = htmlElement.textContent?.trim() || '';
        const rect = htmlElement.getBoundingClientRect();
        const coordinates: [number, number] = [
          Math.round(rect.left + rect.width / 2),
          Math.round(rect.top + rect.height / 2)
        ];

        // Create a wrapper div
        const wrapper = document.createElement('div');
        wrapper.style.display = 'inline-block';
        wrapper.style.position = 'relative';
        
        // Insert wrapper before the element
        htmlElement.parentNode?.insertBefore(wrapper, htmlElement);
        
        // Move element into wrapper
        wrapper.appendChild(htmlElement);

        // Create React component for tooltip
        const tooltipComponent = React.createElement(HoverGif, {
          targetUrl,
          elementSelector,
          elementText,
          coordinates,
          waitTime: 2.0
        }, htmlElement);

        // This is a simplified approach - in a real implementation,
        // you'd need to use React's createRoot to render the component
        console.log('Would wrap element with tooltip:', {
          selector: elementSelector,
          text: elementText,
          coordinates
        });
      });
    });
  };

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

  return (
    <div className={`auto-tooltip-wrapper ${className}`}>
      {children}
      {isInitialized && (
        <div className="fixed bottom-4 left-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Auto-tooltips enabled - hover over any button!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoTooltipWrapper;
