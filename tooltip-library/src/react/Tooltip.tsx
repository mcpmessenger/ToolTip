import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { TooltipContent } from '../components/TooltipContent';
import { GlassTooltip } from '../components/GlassTooltip';
import { TooltipConfig, GlassTooltipConfig, TooltipInstance } from '../types';

// Enhanced React Tooltip with ref forwarding
export const Tooltip = forwardRef<TooltipInstance, TooltipConfig & { children: React.ReactElement }>(
  (props, ref) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<TooltipInstance | null>(null);

    useImperativeHandle(ref, () => ({
      show: () => {
        // Trigger show by simulating hover
        if (tooltipRef.current) {
          const event = new MouseEvent('mouseenter', { bubbles: true });
          tooltipRef.current.dispatchEvent(event);
        }
      },
      hide: () => {
        // Trigger hide by simulating mouse leave
        if (tooltipRef.current) {
          const event = new MouseEvent('mouseleave', { bubbles: true });
          tooltipRef.current.dispatchEvent(event);
        }
      },
      updateContent: (content: React.ReactNode | string) => {
        // This would require re-rendering, so we'll update the props
        console.warn('updateContent not implemented for React component. Use state management instead.');
      },
      updateConfig: (config: Partial<TooltipConfig>) => {
        // This would require re-rendering, so we'll update the props
        console.warn('updateConfig not implemented for React component. Use state management instead.');
      },
      destroy: () => {
        // React handles cleanup automatically
      },
    }));

    return (
      <div ref={tooltipRef}>
        <TooltipContent {...props} />
      </div>
    );
  }
);

Tooltip.displayName = 'Tooltip';

// Enhanced React Glass Tooltip with ref forwarding
export const GlassTooltipReact = forwardRef<TooltipInstance, GlassTooltipConfig & { children: React.ReactElement }>(
  (props, ref) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<TooltipInstance | null>(null);

    useImperativeHandle(ref, () => ({
      show: () => {
        if (tooltipRef.current) {
          const event = new MouseEvent('mouseenter', { bubbles: true });
          tooltipRef.current.dispatchEvent(event);
        }
      },
      hide: () => {
        if (tooltipRef.current) {
          const event = new MouseEvent('mouseleave', { bubbles: true });
          tooltipRef.current.dispatchEvent(event);
        }
      },
      updateContent: (content: React.ReactNode | string) => {
        console.warn('updateContent not implemented for React component. Use state management instead.');
      },
      updateConfig: (config: Partial<GlassTooltipConfig>) => {
        console.warn('updateConfig not implemented for React component. Use state management instead.');
      },
      destroy: () => {
        // React handles cleanup automatically
      },
    }));

    return (
      <div ref={tooltipRef}>
        <GlassTooltip {...props} />
      </div>
    );
  }
);

GlassTooltipReact.displayName = 'GlassTooltipReact';

// Re-export core components
export { TooltipProvider, useTooltipContext } from '../components/TooltipProvider';
export { TooltipContent as BaseTooltipContent } from '../components/TooltipContent';
export { GlassTooltip as BaseGlassTooltip } from '../components/GlassTooltip';

// Re-export types
export type {
  TooltipConfig,
  GlassTooltipConfig,
  TooltipInstance,
  TooltipTrigger,
  TooltipPlacement,
  TooltipTheme,
  TooltipDelay,
  TooltipOffset,
  TooltipContentProps,
  TooltipProviderProps,
} from '../types';

// Re-export utilities
export { themePresets, applyTheme, createCustomTheme } from '../styles/themes';
export { PositioningEngine } from '../utils/positioning';
