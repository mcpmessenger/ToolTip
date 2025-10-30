// Vue.js integration
export { default as Tooltip } from './Tooltip.vue';

// Re-export types for Vue usage
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
