// Vanilla JavaScript API
export {
  TooltipManager,
  getTooltipManager,
  createTooltip,
  createGlassTooltip,
  hideAllTooltips,
  destroyTooltipManager,
} from './TooltipManager';

// Re-export types
export type {
  TooltipConfig,
  GlassTooltipConfig,
  TooltipInstance,
  TooltipTrigger,
  TooltipPlacement,
  TooltipTheme,
} from '../types';

// Re-export utilities
export { themePresets, applyTheme, createCustomTheme } from '../styles/themes';
