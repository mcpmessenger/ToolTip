import React, { useEffect, useState } from 'react';
import { HoverGif } from './HoverGif';

interface AutoTooltipInjectorProps {
  targetUrl?: string;
  className?: string;
}

export const AutoTooltipInjector: React.FC<AutoTooltipInjectorProps> = ({
  targetUrl,
  className = ''
}) => {
  const [injectedElements, setInjectedElements] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  // Get current page URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    const injectTooltips = () => {
      const url = targetUrl || currentUrl;
      if (!url) return;

      // Find all clickable elements that don't already have tooltips
      const clickableSelectors = [
        'button:not([data-tooltip-injected])',
        'a[href]:not([data-tooltip-injected])',
        'input[type="button"]:not([data-tooltip-injected])',
        'input[type="submit"]:not([data-tooltip-injected])',
        '[onclick]:not([data-tooltip-injected])',
        '[role="button"]:not([data-tooltip-injected])',
        '.btn:not([data-tooltip-injected])',
        '.button:not([data-tooltip-injected])',
        '[class*="btn"]:not([data-tooltip-injected])'
      ];

      let injectedCount = 0;

      clickableSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          const htmlElement = element as HTMLElement;
          
          // Skip if already injected or not visible
          if (htmlElement.hasAttribute('data-tooltip-injected') || 
              htmlElement.offsetWidth === 0 || 
              htmlElement.offsetHeight === 0) {
            return;
          }

          // Mark as injected
          htmlElement.setAttribute('data-tooltip-injected', 'true');

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
          wrapper.setAttribute('data-tooltip-wrapper', 'true');
          
          // Insert wrapper before the element
          htmlElement.parentNode?.insertBefore(wrapper, htmlElement);
          
          // Move element into wrapper
          wrapper.appendChild(htmlElement);

          // Add tooltip data attributes
          wrapper.setAttribute('data-tooltip-url', url);
          wrapper.setAttribute('data-tooltip-selector', elementSelector);
          wrapper.setAttribute('data-tooltip-text', elementText);
          wrapper.setAttribute('data-tooltip-coordinates', coordinates.join(','));

          injectedCount++;
        });
      });

      setInjectedElements(injectedCount);
      console.log(`Injected tooltips into ${injectedCount} elements`);
    };

    // Inject tooltips after a short delay
    const timer = setTimeout(() => {
      injectTooltips();
      setIsActive(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [targetUrl, currentUrl]);

  // Add CSS for tooltip functionality
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      [data-tooltip-wrapper]:hover::after {
        content: 'Hover to see preview';
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 1000;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
    <div className={`auto-tooltip-injector ${className}`}>
      {isActive && injectedElements > 0 && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Auto-injected tooltips into {injectedElements} elements!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoTooltipInjector;
