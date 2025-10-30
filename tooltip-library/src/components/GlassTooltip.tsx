import React, { useRef, useEffect, useState } from 'react';
import { TooltipContentProps, GlassTooltipConfig } from '../types';
import { PositioningEngine } from '../utils/positioning';
import { applyTheme } from '../styles/themes';

interface GlassTooltipState {
  isVisible: boolean;
  position: { x: number; y: number };
  placement: 'top' | 'bottom' | 'left' | 'right';
  isHovered: boolean;
}

export const GlassTooltip: React.FC<TooltipContentProps & GlassTooltipConfig> = ({
  content,
  children,
  trigger = 'hover',
  placement = 'top',
  delay = 0,
  offset = { x: 0, y: 0 },
  arrow = false,
  interactive = false,
  disabled = false,
  theme = 'glass',
  glassEffect = true,
  animation3D = true,
  glassOpacity = 0.9,
  blurIntensity = 12,
  shadowIntensity = 0.3,
  hoverTransform = 'rotate3d(1,1,0,15deg)',
  className = '',
  style = {},
  onShow,
  onHide,
}) => {
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [state, setState] = useState<GlassTooltipState>({
    isVisible: false,
    position: { x: 0, y: 0 },
    placement,
    isHovered: false,
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

        setState(prev => ({
          ...prev,
          isVisible: true,
          position: { x: position.x, y: position.y },
          placement: position.placement,
        }));

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

  const handleTooltipMouseEnter = () => {
    if (interactive) {
      setState(prev => ({ ...prev, isHovered: true }));
    }
  };

  const handleTooltipMouseLeave = () => {
    if (interactive) {
      setState(prev => ({ ...prev, isHovered: false }));
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

  const getGlassStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      left: `${state.position.x}px`,
      top: `${state.position.y}px`,
      zIndex: 9999,
      perspective: '1000px',
      transformStyle: 'preserve-3d',
      ...style,
    };

    if (glassEffect) {
      return {
        ...baseStyles,
        transform: state.isHovered && animation3D ? hoverTransform : 'translate3d(0, 0, 0)',
        transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
      };
    }

    return baseStyles;
  };

  const getInnerStyles = () => {
    const baseStyles = {
      position: 'relative' as const,
      borderRadius: '50px',
      background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)',
      backdropFilter: `blur(${blurIntensity}px)`,
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: `rgba(0,0,0,${shadowIntensity}) 30px 50px 25px -40px, rgba(0,0,0,0.1) 0px 25px 30px 0px`,
      transform: 'translate3d(0, 0, 25px)',
      transformStyle: 'preserve-3d' as const,
      opacity: glassOpacity,
      transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
    };

    if (state.isHovered && animation3D) {
      return {
        ...baseStyles,
        transform: 'translate3d(0, 0, 35px)',
        boxShadow: `rgba(0,0,0,${shadowIntensity + 0.1}) 40px 60px 30px -40px, rgba(0,0,0,0.15) 0px 30px 40px 0px`,
      };
    }

    return baseStyles;
  };

  const renderGlassLayers = () => {
    if (!glassEffect) return null;

    return (
      <>
        {/* Glass layer */}
        <div
          className="glass-layer"
          style={{
            position: 'absolute',
            inset: '2px',
            borderRadius: '55px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))',
            backdropFilter: 'blur(8px)',
            transform: 'translate3d(0, 0, 25px)',
            transformStyle: 'preserve-3d',
          }}
        />
        
        {/* Decorative circles */}
        <div
          className="decorative-circles"
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            transformStyle: 'preserve-3d',
          }}
        >
          {[
            { size: '170px', pos: '8px', z: '20px', delay: '0s' },
            { size: '140px', pos: '10px', z: '40px', delay: '0.4s' },
            { size: '110px', pos: '17px', z: '60px', delay: '0.8s' },
            { size: '80px', pos: '23px', z: '80px', delay: '1.2s' },
          ].map((circle, index) => (
            <div
              key={index}
              className="decorative-circle"
              style={{
                position: 'absolute',
                width: circle.size,
                height: circle.size,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                boxShadow: 'rgba(100,100,111,0.2) -10px 10px 20px 0px',
                top: circle.pos,
                right: circle.pos,
                transform: `translate3d(0, 0, ${circle.z})`,
                transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: circle.delay,
              }}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <>
      {React.cloneElement(children as React.ReactElement, {
        ref: triggerRef,
      })}
      {state.isVisible && (
        <div
          ref={tooltipRef}
          className={`glass-tooltip ${className}`}
          style={getGlassStyles()}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div
            className="glass-tooltip-inner"
            style={getInnerStyles()}
          >
            {renderGlassLayers()}
            
            {/* Content */}
            <div
              className="glass-tooltip-content"
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '16px 24px',
                color: 'white',
                fontSize: '14px',
                fontFamily: 'system-ui, sans-serif',
                transform: 'translate3d(0, 0, 26px)',
                transformStyle: 'preserve-3d',
              }}
            >
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
