import { TooltipPlacement, TooltipOffset } from '../types';

export interface Position {
  x: number;
  y: number;
  placement: TooltipPlacement;
}

export interface BoundingRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface ViewportInfo {
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
}

export class PositioningEngine {
  private viewport: ViewportInfo;
  private collisionPadding = 8;

  constructor() {
    this.viewport = this.getViewportInfo();
    this.updateViewport = this.updateViewport.bind(this);
    this.bindEvents();
  }

  private bindEvents() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.updateViewport);
      window.addEventListener('scroll', this.updateViewport, { passive: true });
    }
  }

  private updateViewport() {
    this.viewport = this.getViewportInfo();
  }

  private getViewportInfo(): ViewportInfo {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0, scrollX: 0, scrollY: 0 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    };
  }

  calculatePosition(
    triggerRect: BoundingRect,
    tooltipRect: BoundingRect,
    placement: TooltipPlacement,
    offset: TooltipOffset = { x: 0, y: 0 }
  ): Position {
    const { x, y, placement: finalPlacement } = this.getInitialPosition(
      triggerRect,
      tooltipRect,
      placement,
      offset
    );

    const adjustedPosition = this.adjustForCollisions(
      { x, y, placement: finalPlacement },
      tooltipRect,
      triggerRect
    );

    return adjustedPosition;
  }

  private getInitialPosition(
    triggerRect: BoundingRect,
    tooltipRect: BoundingRect,
    placement: TooltipPlacement,
    offset: TooltipOffset
  ): Position {
    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const triggerCenterY = triggerRect.top + triggerRect.height / 2;

    let x: number;
    let y: number;
    let finalPlacement = placement;

    if (placement === 'auto') {
      finalPlacement = this.getAutoPlacement(triggerRect, tooltipRect);
    }

    switch (finalPlacement) {
      case 'top':
        x = triggerCenterX - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - offset.y;
        break;
      case 'bottom':
        x = triggerCenterX - tooltipRect.width / 2;
        y = triggerRect.bottom + offset.y;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - offset.x;
        y = triggerCenterY - tooltipRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + offset.x;
        y = triggerCenterY - tooltipRect.height / 2;
        break;
      default:
        x = triggerCenterX - tooltipRect.width / 2;
        y = triggerRect.bottom + offset.y;
    }

    return { x, y, placement: finalPlacement };
  }

  private getAutoPlacement(
    triggerRect: BoundingRect,
    tooltipRect: BoundingRect
  ): TooltipPlacement {
    const spaceAbove = triggerRect.top;
    const spaceBelow = this.viewport.height - triggerRect.bottom;
    const spaceLeft = triggerRect.left;
    const spaceRight = this.viewport.width - triggerRect.right;

    const canFitAbove = spaceAbove >= tooltipRect.height + this.collisionPadding;
    const canFitBelow = spaceBelow >= tooltipRect.height + this.collisionPadding;
    const canFitLeft = spaceLeft >= tooltipRect.width + this.collisionPadding;
    const canFitRight = spaceRight >= tooltipRect.width + this.collisionPadding;

    // Prefer vertical placement
    if (canFitBelow) return 'bottom';
    if (canFitAbove) return 'top';
    if (canFitRight) return 'right';
    if (canFitLeft) return 'left';

    // Fallback to bottom if nothing fits
    return 'bottom';
  }

  private adjustForCollisions(
    position: Position,
    tooltipRect: BoundingRect,
    triggerRect: BoundingRect
  ): Position {
    let { x, y, placement } = position;

    // Check viewport boundaries
    const minX = this.collisionPadding;
    const maxX = this.viewport.width - tooltipRect.width - this.collisionPadding;
    const minY = this.collisionPadding;
    const maxY = this.viewport.height - tooltipRect.height - this.collisionPadding;

    // Adjust horizontal position
    if (x < minX) {
      x = minX;
    } else if (x > maxX) {
      x = maxX;
    }

    // Adjust vertical position
    if (y < minY) {
      y = minY;
    } else if (y > maxY) {
      y = maxY;
    }

    return { x, y, placement };
  }

  getArrowPosition(
    triggerRect: BoundingRect,
    tooltipRect: BoundingRect,
    placement: TooltipPlacement
  ): { x: number; y: number; rotation: number } {
    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const triggerCenterY = triggerRect.top + triggerRect.height / 2;

    let x: number;
    let y: number;
    let rotation = 0;

    switch (placement) {
      case 'top':
        x = triggerCenterX - tooltipRect.left;
        y = tooltipRect.height;
        rotation = 0;
        break;
      case 'bottom':
        x = triggerCenterX - tooltipRect.left;
        y = -8;
        rotation = 180;
        break;
      case 'left':
        x = tooltipRect.width;
        y = triggerCenterY - tooltipRect.top;
        rotation = 270;
        break;
      case 'right':
        x = -8;
        y = triggerCenterY - tooltipRect.top;
        rotation = 90;
        break;
      default:
        x = triggerCenterX - tooltipRect.left;
        y = -8;
        rotation = 180;
    }

    return { x, y, rotation };
  }

  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.updateViewport);
      window.removeEventListener('scroll', this.updateViewport);
    }
  }
}
