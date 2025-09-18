import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TooltipConfig, TooltipPlacement } from '../types';
import { PositioningEngine } from '../utils/positioning';
import { applyTheme } from '../styles/themes';
import { useTooltipKeyboardControls } from '../hooks/useKeyboardControls';

interface InteractiveTooltipProps extends TooltipConfig {
  content: React.ReactNode | string | (() => React.ReactNode);
  children: React.ReactElement;
  draggable?: boolean;
  resizable?: boolean;
  keyboardControls?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizeHandles?: ('n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw')[];
  onDragStart?: (position: { x: number; y: number }) => void;
  onDrag?: (position: { x: number; y: number }) => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
  onResize?: (size: { width: number; height: number }) => void;
  onKeyboardAction?: (action: string, data?: any) => void;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
}

interface ResizeState {
  isResizing: boolean;
  handle: string;
  startX: number;
  startY: number;
  initialWidth: number;
  initialHeight: number;
  initialX: number;
  initialY: number;
}

export const InteractiveTooltip: React.FC<InteractiveTooltipProps> = ({
  content,
  children,
  trigger = 'hover',
  placement = 'top',
  delay = 0,
  offset = { x: 0, y: 0 },
  arrow = false,
  interactive = true,
  disabled = false,
  theme = 'default',
  draggable = true,
  resizable = true,
  keyboardControls = true,
  minWidth = 200,
  minHeight = 100,
  maxWidth = 600,
  maxHeight = 400,
  resizeHandles = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'],
  onDragStart,
  onDrag,
  onDragEnd,
  onResize,
  onKeyboardAction,
  onShow,
  onHide,
  ...props
}) => {
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const positioningEngine = useRef<PositioningEngine | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 300, height: 150 });
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    handle: '',
    startX: 0,
    startY: 0,
    initialWidth: 0,
    initialHeight: 0,
    initialX: 0,
    initialY: 0,
  });

  // Initialize positioning engine
  useEffect(() => {
    positioningEngine.current = new PositioningEngine();
    return () => {
      positioningEngine.current?.destroy();
    };
  }, []);

  const showTooltip = useCallback(() => {
    if (disabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const delayMs = typeof delay === 'number' ? delay : delay.show;
    
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current && tooltipRef.current && positioningEngine.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        
        const pos = positioningEngine.current!.calculatePosition(
          triggerRect,
          tooltipRect,
          placement,
          offset
        );

        setPosition({ x: pos.x, y: pos.y });
        setIsVisible(true);
        onShow?.();
        onKeyboardAction?.('show');
      }
    }, delayMs);
  }, [disabled, delay, placement, offset, onShow, onKeyboardAction]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const delayMs = typeof delay === 'number' ? delay : delay.hide;
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      onHide?.();
      onKeyboardAction?.('hide');
    }, delayMs);
  }, [delay, onHide, onKeyboardAction]);

  const toggleTooltip = useCallback(() => {
    if (isVisible) {
      hideTooltip();
    } else {
      showTooltip();
    }
  }, [isVisible, showTooltip, hideTooltip]);

  // Enhanced keyboard controls with movement and resizing
  const moveTooltip = useCallback((direction: 'up' | 'down' | 'left' | 'right', distance: number = 10) => {
    if (!isVisible) return;

    setPosition(prev => {
      const newPos = { ...prev };
      switch (direction) {
        case 'up':
          newPos.y = Math.max(0, prev.y - distance);
          break;
        case 'down':
          newPos.y = Math.min(window.innerHeight - size.height, prev.y + distance);
          break;
        case 'left':
          newPos.x = Math.max(0, prev.x - distance);
          break;
        case 'right':
          newPos.x = Math.min(window.innerWidth - size.width, prev.x + distance);
          break;
      }
      onKeyboardAction?.('move', { direction, distance, position: newPos });
      return newPos;
    });
  }, [isVisible, size, onKeyboardAction]);

  const resizeTooltip = useCallback((direction: 'increase' | 'decrease', amount: number = 20) => {
    if (!isVisible) return;

    setSize(prev => {
      const newSize = { ...prev };
      if (direction === 'increase') {
        newSize.width = Math.min(maxWidth, prev.width + amount);
        newSize.height = Math.min(maxHeight, prev.height + amount);
      } else {
        newSize.width = Math.max(minWidth, prev.width - amount);
        newSize.height = Math.max(minHeight, prev.height - amount);
      }
      onKeyboardAction?.('resize', { direction, amount, size: newSize });
      return newSize;
    });
  }, [isVisible, maxWidth, maxHeight, minWidth, minHeight, onKeyboardAction]);

  // Custom keyboard controls
  const customControls = [
    {
      key: '/',
      ctrlKey: true,
      action: showTooltip,
      description: 'Show tooltip (Ctrl + /)',
    },
    {
      key: '-',
      ctrlKey: true,
      action: hideTooltip,
      description: 'Hide tooltip (Ctrl + -)',
    },
    {
      key: 't',
      ctrlKey: true,
      action: toggleTooltip,
      description: 'Toggle tooltip (Ctrl + T)',
    },
    {
      key: 'Escape',
      action: isVisible ? hideTooltip : () => {},
      description: 'Hide tooltip (Escape)',
    },
    {
      key: 'ArrowUp',
      ctrlKey: true,
      action: () => moveTooltip('up'),
      description: 'Move tooltip up (Ctrl + ↑)',
    },
    {
      key: 'ArrowDown',
      ctrlKey: true,
      action: () => moveTooltip('down'),
      description: 'Move tooltip down (Ctrl + ↓)',
    },
    {
      key: 'ArrowLeft',
      ctrlKey: true,
      action: () => moveTooltip('left'),
      description: 'Move tooltip left (Ctrl + ←)',
    },
    {
      key: 'ArrowRight',
      ctrlKey: true,
      action: () => moveTooltip('right'),
      description: 'Move tooltip right (Ctrl + →)',
    },
    {
      key: '+',
      ctrlKey: true,
      action: () => resizeTooltip('increase'),
      description: 'Increase tooltip size (Ctrl + +)',
    },
    {
      key: '=',
      ctrlKey: true,
      action: () => resizeTooltip('increase'),
      description: 'Increase tooltip size (Ctrl + =)',
    },
    {
      key: '-',
      ctrlKey: true,
      action: () => resizeTooltip('decrease'),
      description: 'Decrease tooltip size (Ctrl + -)',
    },
  ];

  // Apply keyboard controls
  useTooltipKeyboardControls(
    showTooltip,
    hideTooltip,
    toggleTooltip,
    isVisible,
    { enabled: keyboardControls }
  );

  // Mouse event handlers
  const handleMouseEnter = useCallback(() => {
    if (trigger === 'hover') {
      showTooltip();
    }
  }, [trigger, showTooltip]);

  const handleMouseLeave = useCallback(() => {
    if (trigger === 'hover' && !interactive) {
      hideTooltip();
    }
  }, [trigger, interactive, hideTooltip]);

  const handleClick = useCallback(() => {
    if (trigger === 'click') {
      toggleTooltip();
    }
  }, [trigger, toggleTooltip]);

  const handleFocus = useCallback(() => {
    if (trigger === 'focus') {
      showTooltip();
    }
  }, [trigger, showTooltip]);

  const handleBlur = useCallback(() => {
    if (trigger === 'focus') {
      hideTooltip();
    }
  }, [trigger, hideTooltip]);

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!draggable || !tooltipRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = tooltipRef.current.getBoundingClientRect();
    setDragState({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    });

    onDragStart?.({ x: position.x, y: position.y });
    onKeyboardAction?.('dragStart', { x: position.x, y: position.y });
  }, [draggable, position, onDragStart, onKeyboardAction]);

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging) return;

    const deltaX = e.clientX - dragState.startX;
    const deltaY = e.clientY - dragState.startY;
    const newX = Math.max(0, Math.min(window.innerWidth - size.width, dragState.initialX + deltaX));
    const newY = Math.max(0, Math.min(window.innerHeight - size.height, dragState.initialY + deltaY));

    setPosition({ x: newX, y: newY });
    onDrag?.({ x: newX, y: newY });
  }, [dragState, size, onDrag]);

  const handleDragEnd = useCallback(() => {
    if (!dragState.isDragging) return;

    setDragState(prev => ({ ...prev, isDragging: false }));
    onDragEnd?.(position);
    onKeyboardAction?.('dragEnd', position);
  }, [dragState.isDragging, position, onDragEnd, onKeyboardAction]);

  // Resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
    if (!resizable || !tooltipRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = tooltipRef.current.getBoundingClientRect();
    setResizeState({
      isResizing: true,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: size.width,
      initialHeight: size.height,
      initialX: position.x,
      initialY: position.y,
    });

    onKeyboardAction?.('resizeStart', { handle, size, position });
  }, [resizable, size, position, onKeyboardAction]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizeState.isResizing) return;

    const deltaX = e.clientX - resizeState.startX;
    const deltaY = e.clientY - resizeState.startY;
    let newWidth = resizeState.initialWidth;
    let newHeight = resizeState.initialHeight;
    let newX = resizeState.initialX;
    let newY = resizeState.initialY;

    // Calculate new dimensions based on handle
    if (resizeState.handle.includes('e')) {
      newWidth = Math.max(minWidth, Math.min(maxWidth, resizeState.initialWidth + deltaX));
    }
    if (resizeState.handle.includes('w')) {
      newWidth = Math.max(minWidth, Math.min(maxWidth, resizeState.initialWidth - deltaX));
      newX = Math.max(0, resizeState.initialX + deltaX);
    }
    if (resizeState.handle.includes('s')) {
      newHeight = Math.max(minHeight, Math.min(maxHeight, resizeState.initialHeight + deltaY));
    }
    if (resizeState.handle.includes('n')) {
      newHeight = Math.max(minHeight, Math.min(maxHeight, resizeState.initialHeight - deltaY));
      newY = Math.max(0, resizeState.initialY + deltaY);
    }

    setSize({ width: newWidth, height: newHeight });
    setPosition({ x: newX, y: newY });
    onResize?.({ width: newWidth, height: newHeight });
  }, [resizeState, minWidth, maxWidth, minHeight, maxHeight, onResize]);

  const handleResizeEnd = useCallback(() => {
    if (!resizeState.isResizing) return;

    setResizeState(prev => ({ ...prev, isResizing: false }));
    onKeyboardAction?.('resizeEnd', { size, position });
  }, [resizeState.isResizing, size, position, onKeyboardAction]);

  // Global mouse event listeners
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [dragState.isDragging, handleDragMove, handleDragEnd]);

  useEffect(() => {
    if (resizeState.isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizeState.isResizing, handleResizeMove, handleResizeEnd]);

  // Trigger event binding
  useEffect(() => {
    const triggerElement = triggerRef.current;
    if (!triggerElement) return;

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
  }, [trigger, handleMouseEnter, handleMouseLeave, handleClick, handleFocus, handleBlur]);

  const renderContent = () => {
    if (typeof content === 'function') {
      return content();
    }
    return content;
  };

  const getTooltipStyles = () => {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `${size.width}px`,
      height: `${size.height}px`,
      zIndex: 9999,
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 200ms ease-in-out',
      pointerEvents: isVisible ? 'auto' : 'none',
    };

    if (theme === 'glass') {
      return {
        ...baseStyles,
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        transform: 'translate3d(0, 0, 0)',
        transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
      };
    }

    return baseStyles;
  };

  const getInnerStyles = () => {
    const baseStyles: React.CSSProperties = {
      width: '100%',
      height: '100%',
      overflow: 'auto',
      position: 'relative',
    };

    if (theme === 'glass') {
      return {
        ...baseStyles,
        borderRadius: '50px',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: 'rgba(0,0,0,0.3) 30px 50px 25px -40px, rgba(0,0,0,0.1) 0px 25px 30px 0px',
        transform: 'translate3d(0, 0, 25px)',
        transformStyle: 'preserve-3d',
      };
    }

    return {
      ...baseStyles,
      backgroundColor: 'var(--tooltip-bg-color, rgba(0, 0, 0, 0.9))',
      color: 'var(--tooltip-text-color, white)',
      borderRadius: 'var(--tooltip-border-radius, 8px)',
      padding: 'var(--tooltip-padding, 12px 16px)',
      fontSize: 'var(--tooltip-font-size, 14px)',
      fontFamily: 'var(--tooltip-font-family, system-ui, sans-serif)',
      boxShadow: 'var(--tooltip-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1))',
      border: 'var(--tooltip-border, 1px solid rgba(255, 255, 255, 0.1))',
    };
  };

  const renderResizeHandles = () => {
    if (!resizable) return null;

    return resizeHandles.map(handle => (
      <div
        key={handle}
        className={`resize-handle resize-${handle}`}
        onMouseDown={(e) => handleResizeStart(e, handle)}
        style={{
          position: 'absolute',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '2px',
          cursor: getResizeCursor(handle),
          zIndex: 10,
          ...getResizeHandleStyles(handle),
        }}
      />
    ));
  };

  const getResizeCursor = (handle: string) => {
    const cursors: { [key: string]: string } = {
      'n': 'n-resize',
      's': 's-resize',
      'e': 'e-resize',
      'w': 'w-resize',
      'ne': 'ne-resize',
      'nw': 'nw-resize',
      'se': 'se-resize',
      'sw': 'sw-resize',
    };
    return cursors[handle] || 'default';
  };

  const getResizeHandleStyles = (handle: string) => {
    const styles: { [key: string]: React.CSSProperties } = {
      'n': { top: -4, left: '50%', transform: 'translateX(-50%)', width: 20, height: 8 },
      's': { bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 20, height: 8 },
      'e': { right: -4, top: '50%', transform: 'translateY(-50%)', width: 8, height: 20 },
      'w': { left: -4, top: '50%', transform: 'translateY(-50%)', width: 8, height: 20 },
      'ne': { top: -4, right: -4, width: 12, height: 12 },
      'nw': { top: -4, left: -4, width: 12, height: 12 },
      'se': { bottom: -4, right: -4, width: 12, height: 12 },
      'sw': { bottom: -4, left: -4, width: 12, height: 12 },
    };
    return styles[handle] || {};
  };

  return (
    <>
      {React.cloneElement(children, {
        ref: triggerRef,
      })}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`interactive-tooltip ${theme === 'glass' ? 'glass-interactive-tooltip' : ''}`}
          style={getTooltipStyles()}
          onMouseEnter={interactive ? showTooltip : undefined}
          onMouseLeave={interactive ? hideTooltip : undefined}
        >
          <div
            ref={dragHandleRef}
            className="tooltip-drag-handle"
            onMouseDown={handleDragStart}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '30px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: draggable ? 'move' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 5,
              borderRadius: theme === 'glass' ? '50px 50px 0 0' : '8px 8px 0 0',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '2px',
                margin: '0 4px',
              }}
            />
            <div
              style={{
                width: '20px',
                height: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '2px',
                margin: '0 4px',
              }}
            />
            <div
              style={{
                width: '20px',
                height: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '2px',
                margin: '0 4px',
              }}
            />
          </div>
          
          <div
            className="tooltip-content"
            style={{
              ...getInnerStyles(),
              paddingTop: '40px', // Space for drag handle
            }}
          >
            {renderContent()}
          </div>

          {renderResizeHandles()}
        </div>
      )}
    </>
  );
};
