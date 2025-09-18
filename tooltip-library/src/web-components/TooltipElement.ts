import { TooltipContent } from '../components/TooltipContent';
import { TooltipConfig } from '../types';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';

export class TooltipElement extends HTMLElement {
  private root: Root | null = null;
  private config: TooltipConfig = {};
  private content: string = '';
  private triggerElement: HTMLElement | null = null;

  static get observedAttributes() {
    return [
      'content',
      'trigger',
      'placement',
      'delay',
      'offset',
      'arrow',
      'interactive',
      'disabled',
      'theme'
    ];
  }

  connectedCallback() {
    this.initializeComponent();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.updateConfig(name, newValue);
      this.render();
    }
  }

  private initializeComponent() {
    // Create shadow DOM
    this.attachShadow({ mode: 'open' });
    
    // Find the trigger element (first child)
    this.triggerElement = this.firstElementChild as HTMLElement;
    
    if (!this.triggerElement) {
      console.warn('TooltipElement: No trigger element found');
      return;
    }

    // Move trigger element to shadow DOM
    this.shadowRoot!.appendChild(this.triggerElement);
    
    // Initialize config from attributes
    this.initializeConfig();
    
    // Render the tooltip
    this.render();
  }

  private initializeConfig() {
    this.config = {
      content: this.getAttribute('content') || '',
      trigger: (this.getAttribute('trigger') as any) || 'hover',
      placement: (this.getAttribute('placement') as any) || 'top',
      delay: this.parseDelay(this.getAttribute('delay')),
      offset: this.parseOffset(this.getAttribute('offset')),
      arrow: this.getAttribute('arrow') === 'true',
      interactive: this.getAttribute('interactive') === 'true',
      disabled: this.getAttribute('disabled') === 'true',
      theme: (this.getAttribute('theme') as any) || 'default',
    };
  }

  private updateConfig(name: string, value: string) {
    switch (name) {
      case 'content':
        this.config.content = value;
        break;
      case 'trigger':
        this.config.trigger = value as any;
        break;
      case 'placement':
        this.config.placement = value as any;
        break;
      case 'delay':
        this.config.delay = this.parseDelay(value);
        break;
      case 'offset':
        this.config.offset = this.parseOffset(value);
        break;
      case 'arrow':
        this.config.arrow = value === 'true';
        break;
      case 'interactive':
        this.config.interactive = value === 'true';
        break;
      case 'disabled':
        this.config.disabled = value === 'true';
        break;
      case 'theme':
        this.config.theme = value as any;
        break;
    }
  }

  private parseDelay(value: string | null): number | { show: number; hide: number } {
    if (!value) return 0;
    
    if (value.includes(',')) {
      const [show, hide] = value.split(',').map(v => parseInt(v.trim()));
      return { show, hide };
    }
    
    return parseInt(value);
  }

  private parseOffset(value: string | null): { x: number; y: number } {
    if (!value) return { x: 0, y: 0 };
    
    if (value.includes(',')) {
      const [x, y] = value.split(',').map(v => parseInt(v.trim()));
      return { x, y };
    }
    
    const offset = parseInt(value);
    return { x: offset, y: offset };
  }

  private render() {
    if (!this.triggerElement) return;

    // Clean up previous render
    this.cleanup();

    // Create container for React component
    const container = document.createElement('div');
    container.style.position = 'relative';
    this.shadowRoot!.appendChild(container);

    // Create React root and render
    this.root = createRoot(container);
    
    this.root.render(
      React.createElement(TooltipContent, {
        ...this.config,
        children: this.triggerElement,
      })
    );
  }

  private cleanup() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  // Public API methods
  show() {
    this.config.disabled = false;
    this.render();
  }

  hide() {
    this.config.disabled = true;
    this.render();
  }

  updateContent(content: string) {
    this.setAttribute('content', content);
  }

  updateConfig(newConfig: Partial<TooltipConfig>) {
    Object.assign(this.config, newConfig);
    this.render();
  }
}

// Register the custom element
if (!customElements.get('tooltip-element')) {
  customElements.define('tooltip-element', TooltipElement);
}
