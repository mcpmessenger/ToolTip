// Content script for ToolTip Companion Extension
class ToolTipContentScript {
  constructor() {
    this.isEnabled = false;
    this.settings = {};
    this.tooltipInstance = null;
    this.observedElements = new Set();
    this.mutationObserver = null;
    
    this.init();
  }

  async init() {
    // Load settings
    await this.loadSettings();
    
    // Only proceed if extension is enabled
    if (!this.settings.enabled) {
      return;
    }

    // Inject tooltip styles and component
    this.injectTooltipAssets();
    
    // Start observing the page
    this.startObserving();
    
    // Listen for settings changes
    this.setupSettingsListener();
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
        if (response?.success) {
          this.settings = response.data;
          this.isEnabled = this.settings.enabled;
        }
        resolve();
      });
    });
  }

  setupSettingsListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'settingsUpdated') {
        this.loadSettings().then(() => {
          if (this.isEnabled) {
            this.startObserving();
          } else {
            this.stopObserving();
            this.hideTooltip();
          }
        });
      }
    });
  }

  injectTooltipAssets() {
    // Inject CSS
    if (!document.getElementById('tooltip-companion-css')) {
      const link = document.createElement('link');
      link.id = 'tooltip-companion-css';
      link.rel = 'stylesheet';
      link.href = chrome.runtime.getURL('injected-tooltip.css');
      document.head.appendChild(link);
    }

    // Inject JavaScript component
    if (!document.getElementById('tooltip-companion-js')) {
      const script = document.createElement('script');
      script.id = 'tooltip-companion-js';
      script.src = chrome.runtime.getURL('injected-tooltip.js');
      script.onload = () => {
        this.initializeTooltipComponent();
      };
      document.head.appendChild(script);
    }
  }

  initializeTooltipComponent() {
    if (window.ToolTipCompanion) {
      this.tooltipInstance = new window.ToolTipCompanion({
        apiBaseUrl: this.settings.apiBaseUrl,
        triggerEvent: this.settings.triggerEvent,
        showPreviews: this.settings.showPreviews
      });
    }
  }

  startObserving() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    // Observe for new elements
    this.mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.processElement(node);
            // Also process child elements
            const interactiveElements = node.querySelectorAll(this.getInteractiveSelectors());
            interactiveElements.forEach(el => this.processElement(el));
          }
        });
      });
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Process existing elements
    this.processExistingElements();
  }

  stopObserving() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    
    // Remove all event listeners
    this.observedElements.forEach(element => {
      this.removeElementListeners(element);
    });
    this.observedElements.clear();
  }

  getInteractiveSelectors() {
    return [
      'button',
      'a[href]',
      '[role="button"]',
      '[tabindex]:not([tabindex="-1"])',
      'input[type="button"]',
      'input[type="submit"]',
      'input[type="reset"]',
      '[onclick]',
      '[data-testid*="button"]',
      '[data-testid*="btn"]',
      '.btn',
      '.button'
    ].join(', ');
  }

  processExistingElements() {
    const elements = document.querySelectorAll(this.getInteractiveSelectors());
    elements.forEach(element => this.processElement(element));
  }

  processElement(element) {
    if (!element || this.observedElements.has(element)) {
      return;
    }

    // Skip if element is not visible or interactive
    if (!this.isElementInteractive(element)) {
      return;
    }

    this.observedElements.add(element);
    this.addElementListeners(element);
  }

  isElementInteractive(element) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }

  addElementListeners(element) {
    const triggerEvent = this.settings.triggerEvent || 'hover';
    
    if (triggerEvent === 'hover') {
      element.addEventListener('mouseenter', (e) => this.handleElementInteraction(e));
      element.addEventListener('mouseleave', (e) => this.handleElementLeave(e));
    } else if (triggerEvent === 'click') {
      element.addEventListener('click', (e) => this.handleElementInteraction(e));
    } else if (triggerEvent === 'focus') {
      element.addEventListener('focus', (e) => this.handleElementInteraction(e));
      element.addEventListener('blur', (e) => this.handleElementLeave(e));
    }
  }

  removeElementListeners(element) {
    const events = ['mouseenter', 'mouseleave', 'click', 'focus', 'blur'];
    events.forEach(event => {
      element.removeEventListener(event, this.handleElementInteraction);
      element.removeEventListener(event, this.handleElementLeave);
    });
  }

  async handleElementInteraction(event) {
    if (!this.tooltipInstance) {
      return;
    }

    const element = event.target;
    const elementData = this.extractElementData(element);
    
    try {
      // Show loading tooltip immediately
      this.tooltipInstance.showTooltip(element, {
        content: 'Analyzing...',
        loading: true
      });

      // Get AI analysis
      const analysis = await this.analyzeElement(elementData);
      
      // Update tooltip with analysis
      this.tooltipInstance.showTooltip(element, {
        content: analysis.tooltip,
        confidence: analysis.confidence,
        source: analysis.source,
        loading: false
      });

    } catch (error) {
      console.error('Tooltip analysis failed:', error);
      this.tooltipInstance.showTooltip(element, {
        content: 'Analysis failed',
        error: true,
        loading: false
      });
    }
  }

  handleElementLeave(event) {
    if (this.tooltipInstance) {
      this.tooltipInstance.hideTooltip();
    }
  }

  extractElementData(element) {
    const rect = element.getBoundingClientRect();
    
    return {
      tag: element.tagName.toLowerCase(),
      text: element.textContent?.trim() || '',
      id: element.id || null,
      className: element.className || null,
      attributes: {
        title: element.getAttribute('title'),
        'aria-label': element.getAttribute('aria-label'),
        'data-testid': element.getAttribute('data-testid'),
        href: element.getAttribute('href'),
        type: element.getAttribute('type'),
        role: element.getAttribute('role')
      },
      coordinates: [rect.left, rect.top],
      size: [rect.width, rect.height],
      url: window.location.href,
      selector: this.generateSelector(element)
    };
  }

  generateSelector(element) {
    // Generate a unique selector for the element
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) {
        return `.${classes.join('.')}`;
      }
    }
    
    // Fallback to tag with position
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(element);
      return `${element.tagName.toLowerCase()}:nth-child(${index + 1})`;
    }
    
    return element.tagName.toLowerCase();
  }

  async analyzeElement(elementData) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'analyzeElement',
        data: elementData
      }, (response) => {
        if (response?.success) {
          resolve(response.data);
        } else {
          reject(new Error(response?.error || 'Analysis failed'));
        }
      });
    });
  }

  hideTooltip() {
    if (this.tooltipInstance) {
      this.tooltipInstance.hideTooltip();
    }
  }
}

// Initialize content script when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ToolTipContentScript();
  });
} else {
  new ToolTipContentScript();
}
