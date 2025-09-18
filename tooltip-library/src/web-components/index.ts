// Web Components
export { GlassTooltipElement } from './GlassTooltipElement';
export { TooltipElement } from './TooltipElement';

// Auto-register components
import './GlassTooltipElement';
import './TooltipElement';

// Re-export core types for Web Components usage
export type {
  TooltipConfig,
  GlassTooltipConfig,
  TooltipTrigger,
  TooltipPlacement,
  TooltipTheme,
} from '../types';
