import { TooltipConfig, GlassTooltipConfig, TooltipInstance } from '../types';
import { PositioningEngine } from '../utils/positioning';
import { applyTheme, themePresets } from '../styles/themes';

export class TooltipManager {
  private tooltips: Map<HTMLElement, TooltipInstance> = new Map();
  private positioningEngine: PositioningEngine;
  private zIndex: number = 9999;

  constructor() {
    this.positioningEngine = new PositioningEngine();
    this.bindGlobalEvents();
  }

  private bindGlobalEvents() {
    if (typeof window !== 'undefined') {
      // Handle escape key to close tooltips
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.hideAll();
        }
      });

      // Handle scroll and resize
      window.addEventListener('scroll', () => this.updatePositions(), { passive: true });
      window.addEventListener('resize', () => this.updatePositions(), { passive: true });
    }
  }

  createTooltip(target: HTMLElement, config: TooltipConfig): TooltipInstance {
    const tooltipElement = this.createTooltipElement(config);
    const instance = this.createTooltipInstance(target, tooltipElement, config);
    
    this.tooltips.set(target, instance);
    return instance;
  }

  createGlassTooltip(target: HTMLElement, config: GlassTooltipConfig): TooltipInstance {
    const tooltipElement = this.createGlassTooltipElement(config);
    const instance = this.createTooltipInstance(target, tooltipElement, config);
    
    this.tooltips.set(target, instance);
    return instance;
  }

  private createTooltipElement(config: TooltipConfig): HTMLElement {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip-vanilla';
    tooltip.style.cssText = `
      position: fixed;
      z-index: ${this.zIndex};
      pointer-events: none;
      opacity: 0;
      transition: opacity 200ms ease-in-out;
    `;

    const content = document.createElement('div');
    content.className = 'tooltip-content';
    content.style.cssText = `
      background: var(--tooltip-bg-color, rgba(0, 0, 0, 0.9));
      color: var(--tooltip-text-color, white);
      border-radius: var(--tooltip-border-radius, 8px);
      padding: var(--tooltip-padding, 12px 16px);
      font-size: var(--tooltip-font-size, 14px);
      font-family: var(--tooltip-font-family, system-ui, sans-serif);
      box-shadow: var(--tooltip-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
      border: var(--tooltip-border, 1px solid rgba(255, 255, 255, 0.1));
      max-width: 300px;
      word-wrap: break-word;
    `;

    // Apply theme
    if (config.theme && config.theme !== 'default') {
      applyTheme(tooltip, config.theme);
    }

    // Set content
    if (typeof config.content === 'string') {
      content.textContent = config.content;
    } else if (config.content instanceof HTMLElement) {
      content.appendChild(config.content);
    } else if (typeof config.content === 'function') {
      const result = config.content();
      if (typeof result === 'string') {
        content.textContent = result;
      } else if (result instanceof HTMLElement) {
        content.appendChild(result);
      }
    }

    tooltip.appendChild(content);

    // Add arrow if requested
    if (config.arrow) {
      const arrow = document.createElement('div');
      arrow.className = 'tooltip-arrow';
      arrow.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        background: var(--tooltip-bg-color, rgba(0, 0, 0, 0.9));
        border: var(--tooltip-border, 1px solid rgba(255, 255, 255, 0.1));
        clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
      `;
      tooltip.appendChild(arrow);
    }

    document.body.appendChild(tooltip);
    return tooltip;
  }

  private createGlassTooltipElement(config: GlassTooltipConfig): HTMLElement {
    const tooltip = document.createElement('div');
    tooltip.className = 'glass-tooltip-vanilla';
    tooltip.style.cssText = `
      position: fixed;
      z-index: ${this.zIndex};
      pointer-events: none;
      opacity: 0;
      perspective: 1000px;
      transform-style: preserve-3d;
      transition: all 500ms cubic-bezier(0.4, 0, 0.2, 1);
    `;

    const inner = document.createElement('div');
    inner.className = 'glass-tooltip-inner';
    inner.style.cssText = `
      position: relative;
      border-radius: 50px;
      background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%);
      backdrop-filter: blur(${config.blurIntensity || 12}px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: rgba(0,0,0,${config.shadowIntensity || 0.3}) 30px 50px 25px -40px, rgba(0,0,0,0.1) 0px 25px 30px 0px;
      transform: translate3d(0, 0, 25px);
      transform-style: preserve-3d;
      opacity: ${config.glassOpacity || 0.9};
      transition: all 500ms cubic-bezier(0.4, 0, 0.2, 1);
    `;

    // Glass layer
    const glassLayer = document.createElement('div');
    glassLayer.style.cssText = `
      position: absolute;
      inset: 2px;
      border-radius: 55px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      border-left: 1px solid rgba(255, 255, 255, 0.2);
      background: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
      backdrop-filter: blur(8px);
      transform: translate3d(0, 0, 25px);
      transform-style: preserve-3d;
    `;

    // Content
    const content = document.createElement('div');
    content.className = 'glass-tooltip-content';
    content.style.cssText = `
      position: relative;
      z-index: 1;
      padding: 16px 24px;
      color: white;
      font-size: 14px;
      font-family: system-ui, sans-serif;
      transform: translate3d(0, 0, 26px);
      transform-style: preserve-3d;
    `;

    // Set content
    if (typeof config.content === 'string') {
      content.textContent = config.content;
    } else if (config.content instanceof HTMLElement) {
      content.appendChild(config.content);
    } else if (typeof config.content === 'function') {
      const result = config.content();
      if (typeof result === 'string') {
        content.textContent = result;
      } else if (result instanceof HTMLElement) {
        content.appendChild(result);
      }
    }

    inner.appendChild(glassLayer);
    inner.appendChild(content);
    tooltip.appendChild(inner);

    // Decorative circles
    if (config.glassEffect !== false) {
      const circlesContainer = document.createElement('div');
      circlesContainer.style.cssText = `
        position: absolute;
        top: 0;
        right: 0;
        transform-style: preserve-3d;
      `;

      const circles = [
        { size: '170px', pos: '8px', z: '20px', delay: '0s' },
        { size: '140px', pos: '10px', z: '40px', delay: '0.4s' },
        { size: '110px', pos: '17px', z: '60px', delay: '0.8s' },
        { size: '80px', pos: '23px', z: '80px', delay: '1.2s' },
      ];

      circles.forEach((circle, index) => {
        const circleEl = document.createElement('div');
        circleEl.style.cssText = `
          position: absolute;
          width: ${circle.size};
          height: ${circle.size};
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          box-shadow: rgba(100,100,111,0.2) -10px 10px 20px 0px;
          top: ${circle.pos};
          right: ${circle.pos};
          transform: translate3d(0, 0, ${circle.z});
          transition: all 500ms cubic-bezier(0.4, 0, 0.2, 1);
          transition-delay: ${circle.delay};
        `;
        circlesContainer.appendChild(circleEl);
      });

      tooltip.appendChild(circlesContainer);
    }

    document.body.appendChild(tooltip);
    return tooltip;
  }

  private createTooltipInstance(
    target: HTMLElement,
    tooltipElement: HTMLElement,
    config: TooltipConfig | GlassTooltipConfig
  ): TooltipInstance {
    let isVisible = false;
    let timeoutId: NodeJS.Timeout | null = null;

    const show = () => {
      if (config.disabled) return;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const delay = typeof config.delay === 'number' ? config.delay : config.delay?.show || 0;
      
      timeoutId = setTimeout(() => {
        isVisible = true;
        this.positionTooltip(target, tooltipElement, config);
        tooltipElement.style.opacity = '1';
        tooltipElement.style.pointerEvents = 'auto';
        config.onShow?.();
      }, delay);
    };

    const hide = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const delay = typeof config.delay === 'number' ? config.delay : config.delay?.hide || 0;
      
      timeoutId = setTimeout(() => {
        isVisible = false;
        tooltipElement.style.opacity = '0';
        tooltipElement.style.pointerEvents = 'none';
        config.onHide?.();
      }, delay);
    };

    const updateContent = (content: string | HTMLElement) => {
      const contentEl = tooltipElement.querySelector('.tooltip-content, .glass-tooltip-content');
      if (contentEl) {
        contentEl.innerHTML = '';
        if (typeof content === 'string') {
          contentEl.textContent = content;
        } else {
          contentEl.appendChild(content);
        }
      }
    };

    const updateConfig = (newConfig: Partial<TooltipConfig | GlassTooltipConfig>) => {
      Object.assign(config, newConfig);
      if (isVisible) {
        this.positionTooltip(target, tooltipElement, config);
      }
    };

    const destroy = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      tooltipElement.remove();
      this.tooltips.delete(target);
    };

    // Bind events based on trigger
    const bindEvents = () => {
      if (config.trigger === 'hover') {
        target.addEventListener('mouseenter', show);
        target.addEventListener('mouseleave', hide);
      } else if (config.trigger === 'click') {
        target.addEventListener('click', (e) => {
          e.preventDefault();
          if (isVisible) {
            hide();
          } else {
            show();
          }
        });
      } else if (config.trigger === 'focus') {
        target.addEventListener('focus', show);
        target.addEventListener('blur', hide);
      }
    };

    bindEvents();

    return {
      show,
      hide,
      updateContent,
      updateConfig,
      destroy,
    };
  }

  private positionTooltip(
    target: HTMLElement,
    tooltipElement: HTMLElement,
    config: TooltipConfig | GlassTooltipConfig
  ) {
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();
    
    const position = this.positioningEngine.calculatePosition(
      targetRect,
      tooltipRect,
      config.placement || 'top',
      config.offset || { x: 0, y: 0 }
    );

    tooltipElement.style.left = `${position.x}px`;
    tooltipElement.style.top = `${position.y}px`;

    // Update arrow position if present
    const arrow = tooltipElement.querySelector('.tooltip-arrow');
    if (arrow && config.arrow) {
      const arrowPos = this.positioningEngine.getArrowPosition(
        targetRect,
        tooltipRect,
        position.placement
      );
      
      (arrow as HTMLElement).style.left = `${arrowPos.x}px`;
      (arrow as HTMLElement).style.top = `${arrowPos.y}px`;
      (arrow as HTMLElement).style.transform = `rotate(${arrowPos.rotation}deg)`;
    }
  }

  private updatePositions() {
    this.tooltips.forEach((instance, target) => {
      // Trigger repositioning by temporarily hiding and showing
      const wasVisible = instance.show;
      if (wasVisible) {
        instance.hide();
        setTimeout(() => instance.show(), 10);
      }
    });
  }

  hideAll() {
    this.tooltips.forEach(instance => instance.hide());
  }

  destroy() {
    this.tooltips.forEach(instance => instance.destroy());
    this.tooltips.clear();
    this.positioningEngine.destroy();
  }
}

// Global instance
let globalTooltipManager: TooltipManager | null = null;

export const getTooltipManager = (): TooltipManager => {
  if (!globalTooltipManager) {
    globalTooltipManager = new TooltipManager();
  }
  return globalTooltipManager;
};

// Convenience functions
export const createTooltip = (target: HTMLElement, config: TooltipConfig): TooltipInstance => {
  return getTooltipManager().createTooltip(target, config);
};

export const createGlassTooltip = (target: HTMLElement, config: GlassTooltipConfig): TooltipInstance => {
  return getTooltipManager().createGlassTooltip(target, config);
};

export const hideAllTooltips = () => {
  getTooltipManager().hideAll();
};

export const destroyTooltipManager = () => {
  if (globalTooltipManager) {
    globalTooltipManager.destroy();
    globalTooltipManager = null;
  }
};
