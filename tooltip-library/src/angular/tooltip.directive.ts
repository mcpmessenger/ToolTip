import { Directive, ElementRef, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener, Renderer2, Injector } from '@angular/core';
import { TooltipConfig, GlassTooltipConfig, TooltipInstance } from '../types';
import { PositioningEngine } from '../utils/positioning';
import { applyTheme, themePresets } from '../styles/themes';

@Directive({
  selector: '[tooltip]',
  standalone: true
})
export class TooltipDirective implements OnInit, OnDestroy {
  @Input() tooltip: string = '';
  @Input() tooltipTrigger: 'hover' | 'click' | 'focus' | 'manual' = 'hover';
  @Input() tooltipPlacement: 'top' | 'bottom' | 'left' | 'right' | 'auto' = 'top';
  @Input() tooltipDelay: number | { show: number; hide: number } = 0;
  @Input() tooltipOffset: number | { x: number; y: number } = { x: 0, y: 0 };
  @Input() tooltipArrow: boolean = false;
  @Input() tooltipInteractive: boolean = false;
  @Input() tooltipDisabled: boolean = false;
  @Input() tooltipTheme: 'default' | 'glass' | 'material' | 'minimal' | 'dark' = 'default';
  @Input() tooltipGlassEffect: boolean = false;
  @Input() tooltipAnimation3D: boolean = false;
  @Input() tooltipGlassOpacity: number = 0.9;
  @Input() tooltipBlurIntensity: number = 12;
  @Input() tooltipShadowIntensity: number = 0.3;
  @Input() tooltipHoverTransform: string = 'rotate3d(1,1,0,15deg)';

  @Output() tooltipShow = new EventEmitter<void>();
  @Output() tooltipHide = new EventEmitter<void>();

  private tooltipElement: HTMLElement | null = null;
  private positioningEngine: PositioningEngine;
  private timeoutId: NodeJS.Timeout | null = null;
  private isVisible = false;
  private isHovered = false;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private injector: Injector
  ) {
    this.positioningEngine = new PositioningEngine();
  }

  ngOnInit() {
    this.createTooltipElement();
    this.bindEvents();
  }

  ngOnDestroy() {
    this.cleanup();
  }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent) {
    if (this.tooltipTrigger === 'hover') {
      this.show();
    }
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent) {
    if (this.tooltipTrigger === 'hover' && !this.tooltipInteractive) {
      this.hide();
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    if (this.tooltipTrigger === 'click') {
      event.preventDefault();
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    }
  }

  @HostListener('focus', ['$event'])
  onFocus(event: FocusEvent) {
    if (this.tooltipTrigger === 'focus') {
      this.show();
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(event: FocusEvent) {
    if (this.tooltipTrigger === 'focus') {
      this.hide();
    }
  }

  private createTooltipElement() {
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'tooltip-angular');
    
    if (this.tooltipTheme === 'glass') {
      this.renderer.addClass(this.tooltipElement, 'glass-tooltip-angular');
    }

    const styles: { [key: string]: string } = {
      position: 'fixed',
      zIndex: '9999',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 200ms ease-in-out',
    };

    if (this.tooltipTheme === 'glass' && this.tooltipGlassEffect) {
      styles.perspective = '1000px';
      styles.transformStyle = 'preserve-3d';
      styles.transform = this.isHovered && this.tooltipAnimation3D ? this.tooltipHoverTransform : 'translate3d(0, 0, 0)';
      styles.transition = 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)';
    }

    Object.entries(styles).forEach(([property, value]) => {
      this.renderer.setStyle(this.tooltipElement, property, value);
    });

    const innerElement = this.renderer.createElement('div');
    this.renderer.addClass(innerElement, 'tooltip-inner');
    
    if (this.tooltipTheme === 'glass') {
      this.renderer.addClass(innerElement, 'glass-tooltip-inner');
    }

    const innerStyles = this.getInnerStyles();
    Object.entries(innerStyles).forEach(([property, value]) => {
      this.renderer.setStyle(innerElement, property, value);
    });

    this.renderer.appendChild(innerElement, this.renderer.createText(this.tooltip));
    this.renderer.appendChild(this.tooltipElement, innerElement);

    // Add arrow if requested
    if (this.tooltipArrow) {
      const arrowElement = this.renderer.createElement('div');
      this.renderer.addClass(arrowElement, 'tooltip-arrow');
      
      const arrowStyles = {
        position: 'absolute',
        width: '8px',
        height: '8px',
        backgroundColor: 'var(--tooltip-bg-color, rgba(0, 0, 0, 0.9))',
        border: 'var(--tooltip-border, 1px solid rgba(255, 255, 255, 0.1))',
        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
      };

      Object.entries(arrowStyles).forEach(([property, value]) => {
        this.renderer.setStyle(arrowElement, property, value);
      });

      this.renderer.appendChild(this.tooltipElement, arrowElement);
    }

    this.renderer.appendChild(document.body, this.tooltipElement);

    // Apply theme
    if (this.tooltipTheme && this.tooltipTheme !== 'default') {
      applyTheme(this.tooltipElement, this.tooltipTheme);
    }
  }

  private getInnerStyles(): { [key: string]: string } {
    if (this.tooltipTheme === 'glass' && this.tooltipGlassEffect) {
      return {
        position: 'relative',
        borderRadius: '50px',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)',
        backdropFilter: `blur(${this.tooltipBlurIntensity}px)`,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: `rgba(0,0,0,${this.tooltipShadowIntensity}) 30px 50px 25px -40px, rgba(0,0,0,0.1) 0px 25px 30px 0px`,
        transform: 'translate3d(0, 0, 25px)',
        transformStyle: 'preserve-3d',
        opacity: this.tooltipGlassOpacity.toString(),
        transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '16px 24px',
        color: 'white',
        fontSize: '14px',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '300px',
        wordWrap: 'break-word',
      };
    }

    return {
      backgroundColor: 'var(--tooltip-bg-color, rgba(0, 0, 0, 0.9))',
      color: 'var(--tooltip-text-color, white)',
      borderRadius: 'var(--tooltip-border-radius, 8px)',
      padding: 'var(--tooltip-padding, 12px 16px)',
      fontSize: 'var(--tooltip-font-size, 14px)',
      fontFamily: 'var(--tooltip-font-family, system-ui, sans-serif)',
      boxShadow: 'var(--tooltip-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1))',
      border: 'var(--tooltip-border, 1px solid rgba(255, 255, 255, 0.1))',
      maxWidth: '300px',
      wordWrap: 'break-word',
    };
  }

  private bindEvents() {
    if (this.tooltipElement) {
      this.renderer.listen(this.tooltipElement, 'mouseenter', () => {
        if (this.tooltipInteractive) {
          this.isHovered = true;
        }
      });

      this.renderer.listen(this.tooltipElement, 'mouseleave', () => {
        if (this.tooltipInteractive) {
          this.isHovered = false;
          this.hide();
        }
      });
    }
  }

  private updatePosition() {
    if (!this.tooltipElement) return;

    const triggerRect = this.elementRef.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    
    const position = this.positioningEngine.calculatePosition(
      triggerRect,
      tooltipRect,
      this.tooltipPlacement,
      this.tooltipOffset
    );

    this.renderer.setStyle(this.tooltipElement, 'left', `${position.x}px`);
    this.renderer.setStyle(this.tooltipElement, 'top', `${position.y}px`);

    // Update arrow position if present
    const arrow = this.tooltipElement.querySelector('.tooltip-arrow');
    if (arrow && this.tooltipArrow) {
      const arrowPos = this.positioningEngine.getArrowPosition(
        triggerRect,
        tooltipRect,
        position.placement
      );
      
      this.renderer.setStyle(arrow, 'left', `${arrowPos.x}px`);
      this.renderer.setStyle(arrow, 'top', `${arrowPos.y}px`);
      this.renderer.setStyle(arrow, 'transform', `rotate(${arrowPos.rotation}deg)`);
    }
  }

  show() {
    if (this.tooltipDisabled || !this.tooltipElement) return;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    const delay = typeof this.tooltipDelay === 'number' ? this.tooltipDelay : this.tooltipDelay?.show || 0;
    
    this.timeoutId = setTimeout(() => {
      this.updatePosition();
      this.renderer.setStyle(this.tooltipElement, 'opacity', '1');
      this.renderer.setStyle(this.tooltipElement, 'pointerEvents', 'auto');
      this.isVisible = true;
      this.tooltipShow.emit();
    }, delay);
  }

  hide() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    const delay = typeof this.tooltipDelay === 'number' ? this.tooltipDelay : this.tooltipDelay?.hide || 0;
    
    this.timeoutId = setTimeout(() => {
      if (this.tooltipElement) {
        this.renderer.setStyle(this.tooltipElement, 'opacity', '0');
        this.renderer.setStyle(this.tooltipElement, 'pointerEvents', 'none');
      }
      this.isVisible = false;
      this.tooltipHide.emit();
    }, delay);
  }

  updateContent(content: string) {
    this.tooltip = content;
    if (this.tooltipElement) {
      const innerElement = this.tooltipElement.querySelector('.tooltip-inner');
      if (innerElement) {
        innerElement.textContent = content;
      }
    }
  }

  updateConfig(config: Partial<TooltipConfig | GlassTooltipConfig>) {
    Object.assign(this, config);
    if (this.isVisible) {
      this.updatePosition();
    }
  }

  private cleanup() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
    }
    
    this.positioningEngine.destroy();
  }
}
