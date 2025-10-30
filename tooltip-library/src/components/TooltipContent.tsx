import React, { useRef, useEffect, useState } from 'react';
import { TooltipContentProps, TooltipConfig, TooltipPlacement } from '../types';
import { PositioningEngine } from '../utils/positioning';
import { applyTheme } from '../styles/themes';

interface TooltipContentState {
  isVisible: boolean;
  position: { x: number; y: number };
  placement: TooltipPlacement;
}

export const TooltipContent: React.FC<TooltipContentProps & TooltipConfig> = ({
  content,
  children,
  trigger = 'hover',
  placement = 'top',
  delay = 0,
  offset = { x: 0, y: 0 },
  arrow = false,
  interactive = false,
  disabled = false,
  theme = 'default',
  className = '',
  style = {},
  onShow,
  onHide,
}) => {
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [state, setState] = useState<TooltipContentState>({
    isVisible: false,
    position: { x: 0, y: 0 },
    placement,
  });

  const positioningEngine = new PositioningEngine();

  const showTooltip = () => {
    if (disabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const delayMs = typeof delay === 'number' ? delay : delay.show;
    
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current && tooltipRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        
        const position = positioningEngine.calculatePosition(
          triggerRect,
          tooltipRect,
          placement,
          offset
        );

        setState({
          isVisible: true,
          position: { x: position.x, y: position.y },
          placement: position.placement,
        });

        onShow?.();
      }
    }, delayMs);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const delayMs = typeof delay === 'number' ? delay : delay.hide;
    
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, isVisible: false }));
      onHide?.();
    }, delayMs);
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      showTooltip();
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover' && !interactive) {
      hideTooltip();
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      if (state.isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') {
      showTooltip();
    }
  };

  const handleBlur = () => {
    if (trigger === 'focus') {
      hideTooltip();
    }
  };

  useEffect(() => {
    const triggerElement = triggerRef.current;
    if (!triggerElement) return;

    // Add event listeners based on trigger type
    if (trigger === 'hover') {
      triggerElement.addEventListener('mouseenter', handleMouseEnter);
      triggerElement.addEventListener('mouseleave', handleMouseLeave);
    } else if (trigger === 'click') {
      triggerElement.addEventListener('click', handleClick);
    } else if (trigger === 'focus') {
      triggerElement.addEventListener('focus', handleFocus);
      triggerElement.addEventListener('blur', handleBlur);
    }

    return () => {
      triggerElement.removeEventListener('mouseenter', handleMouseEnter);
      triggerElement.removeEventListener('mouseleave', handleMouseLeave);
      triggerElement.removeEventListener('click', handleClick);
      triggerElement.removeEventListener('focus', handleFocus);
      triggerElement.removeEventListener('blur', handleBlur);
    };
  }, [trigger, state.isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      positioningEngine.destroy();
    };
  }, []);

  const renderContent = () => {
    if (typeof content === 'function') {
      return content();
    }
    return content;
  };

  const getArrowStyles = () => {
    if (!arrow || !triggerRef.current || !tooltipRef.current) return {};

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const arrowPos = positioningEngine.getArrowPosition(
      triggerRect,
      tooltipRect,
      state.placement
    );

    return {
      position: 'absolute' as const,
      left: `${arrowPos.x}px`,
      top: `${arrowPos.y}px`,
      transform: `rotate(${arrowPos.rotation}deg)`,
    };
  };

  return (
    <>
      {React.cloneElement(children as React.ReactElement, {
        ref: triggerRef,
      })}
      {state.isVisible && (
        <div
          ref={tooltipRef}
          className={`tooltip-content ${className}`}
          style={{
            position: 'fixed',
            left: `${state.position.x}px`,
            top: `${state.position.y}px`,
            zIndex: 9999,
            ...style,
          }}
          onMouseEnter={interactive ? showTooltip : undefined}
          onMouseLeave={interactive ? hideTooltip : undefined}
        >
          <div
            className="tooltip-inner"
            style={{
              backgroundColor: 'var(--tooltip-bg-color)',
              color: 'var(--tooltip-text-color)',
              borderRadius: 'var(--tooltip-border-radius)',
              padding: 'var(--tooltip-padding)',
              fontSize: 'var(--tooltip-font-size)',
              fontFamily: 'var(--tooltip-font-family)',
              boxShadow: 'var(--tooltip-shadow)',
              border: 'var(--tooltip-border)',
              backdropFilter: theme === 'glass' ? 'var(--glass-tooltip-backdrop-blur)' : 'none',
              transform: theme === 'glass' ? 'translate3d(0, 0, 0)' : 'none',
              transition: `all var(--tooltip-animation-duration) var(--tooltip-animation-easing)`,
            }}
          >
            {renderContent()}
            {arrow && (
              <div
                className="tooltip-arrow"
                style={{
                  ...getArrowStyles(),
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'var(--tooltip-bg-color)',
                  border: 'var(--tooltip-border)',
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};
