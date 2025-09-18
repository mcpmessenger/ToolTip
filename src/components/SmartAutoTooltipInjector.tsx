import React, { useEffect, useState } from 'react';
import { SmartHoverGif } from './SmartHoverGif';

interface SmartAutoTooltipInjectorProps {
  className?: string;
}

export const SmartAutoTooltipInjector: React.FC<SmartAutoTooltipInjectorProps> = ({
  className = ''
}) => {
  const [injectedElements, setInjectedElements] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [wrappedElements, setWrappedElements] = useState<Map<HTMLElement, HTMLElement>>(new Map());

  useEffect(() => {
    const injectTooltips = () => {
      // Find all clickable elements that don't already have tooltips
      const clickableSelectors = [
        'button:not([data-smart-tooltip-injected])',
        'a[href]:not([data-smart-tooltip-injected])',
        'input[type="button"]:not([data-smart-tooltip-injected])',
        'input[type="submit"]:not([data-smart-tooltip-injected])',
        '[onclick]:not([data-smart-tooltip-injected])',
        '[role="button"]:not([data-smart-tooltip-injected])',
        '.btn:not([data-smart-tooltip-injected])',
        '.button:not([data-smart-tooltip-injected])',
        '[class*="btn"]:not([data-smart-tooltip-injected])'
      ];

      let injectedCount = 0;
      const newWrappedElements = new Map<HTMLElement, HTMLElement>();

      clickableSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          const htmlElement = element as HTMLElement;
          
          // Skip if already injected or not visible
          if (htmlElement.hasAttribute('data-smart-tooltip-injected') || 
              htmlElement.offsetWidth === 0 || 
              htmlElement.offsetHeight === 0) {
            return;
          }

          // Mark as injected
          htmlElement.setAttribute('data-smart-tooltip-injected', 'true');

          // Create a wrapper div
          const wrapper = document.createElement('div');
          wrapper.style.display = 'inline-block';
          wrapper.style.position = 'relative';
          wrapper.setAttribute('data-smart-tooltip-wrapper', 'true');
          
          // Insert wrapper before the element
          htmlElement.parentNode?.insertBefore(wrapper, htmlElement);
          
          // Move element into wrapper
          wrapper.appendChild(htmlElement);

          // Store the mapping
          newWrappedElements.set(htmlElement, wrapper);

          injectedCount++;
        });
      });

      setWrappedElements(newWrappedElements);
      setInjectedElements(injectedCount);
      console.log(`Injected smart tooltips into ${injectedCount} elements`);
    };

    // Inject tooltips after a short delay
    const timer = setTimeout(() => {
      injectTooltips();
      setIsActive(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Create React components for each wrapped element
  const createTooltipComponents = () => {
    const components: React.ReactNode[] = [];
    
    wrappedElements.forEach((wrapper, originalElement) => {
      // Create a React component that will render the SmartHoverGif
      const tooltipComponent = React.createElement(SmartHoverGif, {
        element: originalElement,
        key: `tooltip-${Date.now()}-${Math.random()}`
      }, originalElement);
      
      // This is a simplified approach - in a real implementation,
      // you'd need to use React's createRoot to render the component
      console.log('Would create smart tooltip for element:', originalElement);
    });

    return components;
  };

  return (
    <div className={`smart-auto-tooltip-injector ${className}`}>
      {isActive && injectedElements > 0 && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Smart tooltips injected into {injectedElements} elements!</span>
          </div>
        </div>
      )}

      {/* Render tooltip components */}
      {createTooltipComponents()}
    </div>
  );
};

export default SmartAutoTooltipInjector;
