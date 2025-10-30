// Core components
export { TooltipProvider, useTooltipContext } from './components/TooltipProvider';
export { TooltipContent } from './components/TooltipContent';
export { GlassTooltip } from './components/GlassTooltip';
export { DraggableTooltip } from './components/DraggableTooltip';
export { InteractiveTooltip } from './components/InteractiveTooltip';

// React integration
export { Tooltip, GlassTooltipReact } from './react/Tooltip';

// Web Components
export { GlassTooltipElement, TooltipElement } from './web-components';

// Vanilla JavaScript API
export {
  TooltipManager,
  getTooltipManager,
  createTooltip,
  createGlassTooltip,
  hideAllTooltips,
  destroyTooltipManager,
} from './vanilla/TooltipManager';

// Types
export type {
  TooltipTrigger,
  TooltipPlacement,
  TooltipTheme,
  TooltipDelay,
  TooltipOffset,
  TooltipConfig,
  GlassTooltipConfig,
  TooltipContentProps,
  TooltipProviderProps,
  TooltipInstance,
} from './types';

// Utilities
export { PositioningEngine } from './utils/positioning';
export { themePresets, applyTheme, createCustomTheme } from './styles/themes';

// Hooks
export { useKeyboardControls, useTooltipKeyboardControls, createTooltipKeyboardControls } from './hooks/useKeyboardControls';

// Default theme application
export const applyDefaultTheme = (element: HTMLElement, theme: keyof typeof import('./styles/themes').themePresets = 'default') => {
  const { applyTheme } = require('./styles/themes');
  applyTheme(element, theme);
};
