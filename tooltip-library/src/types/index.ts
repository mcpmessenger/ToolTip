import { ReactNode } from 'react';

export type TooltipTrigger = 'hover' | 'click' | 'focus' | 'manual';
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';
export type TooltipTheme = 'default' | 'glass' | 'material' | 'minimal' | 'dark';

export interface TooltipDelay {
  show: number;
  hide: number;
}

export interface TooltipOffset {
  x: number;
  y: number;
}

export interface TooltipConfig {
  trigger?: TooltipTrigger;
  placement?: TooltipPlacement;
  delay?: number | TooltipDelay;
  offset?: number | TooltipOffset;
  arrow?: boolean;
  interactive?: boolean;
  disabled?: boolean;
  theme?: TooltipTheme;
  className?: string;
  style?: React.CSSProperties;
  onShow?: () => void;
  onHide?: () => void;
}

export interface GlassTooltipConfig extends TooltipConfig {
  glassEffect?: boolean;
  animation3D?: boolean;
  glassOpacity?: number;
  blurIntensity?: number;
  shadowIntensity?: number;
  hoverTransform?: string;
}

export interface TooltipContentProps {
  content: ReactNode | string | (() => ReactNode);
  children: ReactNode;
}

export interface TooltipProviderProps {
  children: ReactNode;
  defaultConfig?: Partial<TooltipConfig>;
  zIndex?: number;
}

export interface PositioningOptions {
  placement: TooltipPlacement;
  offset: TooltipOffset;
  arrow: boolean;
  collisionDetection: boolean;
  flip: boolean;
  shift: boolean;
}

export interface TooltipInstance {
  show: () => void;
  hide: () => void;
  updateContent: (content: ReactNode | string) => void;
  updateConfig: (config: Partial<TooltipConfig>) => void;
  destroy: () => void;
}
