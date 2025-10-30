// Angular integration
export { TooltipDirective } from './tooltip.directive';

// Re-export types for Angular usage
export type {
  TooltipConfig,
  GlassTooltipConfig,
  TooltipTrigger,
  TooltipPlacement,
  TooltipTheme,
  TooltipDelay,
  TooltipOffset,
} from '../types';

// Re-export utilities
export { themePresets, applyTheme, createCustomTheme } from '../styles/themes';
export { PositioningEngine } from '../utils/positioning';
