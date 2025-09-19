// Injected Tooltip Component for ToolTip Companion Extension
class InjectedTooltip {
  constructor(options = {}) {
    this.options = {
      apiBaseUrl: 'http://localhost:3001',
      triggerEvent: 'hover',
      showPreviews: true,
      ...options
    };
    
    this.tooltipElement = null;
    this.currentTarget = null;
    this.isVisible = false;
    this.animationFrame = null;
    
    this.createTooltipElement();
    this.setupGlobalStyles();
  }

  createTooltipElement() {
    // Create shadow DOM root
    const shadowHost = document.createElement('div');
    shadowHost.id = 'tooltip-companion-host';
    shadowHost.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    document.body.appendChild(shadowHost);
    
    const shadowRoot = shadowHost.attachShadow({ mode: 'closed' });
    
    // Create tooltip element
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'tooltip-companion';
    this.tooltipElement.style.cssText = `
      position: absolute;
      opacity: 0;
      transform: translateY(10px) scale(0.95);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
      max-width: 300px;
      min-width: 120px;
    `;
    
    shadowRoot.appendChild(this.tooltipElement);
    this.shadowRoot = shadowRoot;
  }

  setupGlobalStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .tooltip-companion {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 12px 16px;
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.1),
          0 2px 8px rgba(0, 0, 0, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        color: #ffffff;
        font-size: 14px;
        line-height: 1.4;
        word-wrap: break-word;
        position: relative;
        overflow: hidden;
      }
      
      .tooltip-companion::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, 
          rgba(255, 255, 255, 0.1) 0%, 
          rgba(255, 255, 255, 0.05) 50%, 
          rgba(255, 255, 255, 0.02) 100%);
        border-radius: inherit;
        pointer-events: none;
      }
      
      .tooltip-companion.visible {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      
      .tooltip-companion.loading {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
        border-color: rgba(59, 130, 246, 0.3);
      }
      
      .tooltip-companion.error {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
        border-color: rgba(239, 68, 68, 0.3);
      }
      
      .tooltip-content {
        position: relative;
        z-index: 1;
      }
      
      .tooltip-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 12px;
        opacity: 0.8;
      }
      
      .tooltip-confidence {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        font-size: 11px;
      }
      
      .tooltip-source {
        font-size: 11px;
        opacity: 0.6;
      }
      
      .tooltip-loading {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .tooltip-loading-spinner {
        width: 12px;
        height: 12px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid #ffffff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .tooltip-arrow {
        position: absolute;
        width: 0;
        height: 0;
        border: 6px solid transparent;
      }
      
      .tooltip-arrow.top {
        bottom: -12px;
        left: 50%;
        transform: translateX(-50%);
        border-top-color: rgba(255, 255, 255, 0.2);
      }
      
      .tooltip-arrow.bottom {
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        border-bottom-color: rgba(255, 255, 255, 0.2);
      }
      
      .tooltip-arrow.left {
        right: -12px;
        top: 50%;
        transform: translateY(-50%);
        border-left-color: rgba(255, 255, 255, 0.2);
      }
      
      .tooltip-arrow.right {
        left: -12px;
        top: 50%;
        transform: translateY(-50%);
        border-right-color: rgba(255, 255, 255, 0.2);
      }
    `;
    
    this.shadowRoot.appendChild(style);
  }

  showTooltip(targetElement, tooltipData) {
    if (!this.tooltipElement) return;

    this.currentTarget = targetElement;
    this.isVisible = true;

    // Update tooltip content
    this.updateTooltipContent(tooltipData);

    // Position tooltip
    this.positionTooltip(targetElement);

    // Show with animation
    requestAnimationFrame(() => {
      this.tooltipElement.classList.add('visible');
    });
  }

  hideTooltip() {
    if (!this.tooltipElement || !this.isVisible) return;

    this.isVisible = false;
    this.currentTarget = null;

    this.tooltipElement.classList.remove('visible');
    
    // Clean up after animation
    setTimeout(() => {
      if (!this.isVisible) {
        this.tooltipElement.style.display = 'none';
      }
    }, 200);
  }

  updateTooltipContent(data) {
    const { content, loading = false, error = false, confidence, source } = data;

    let html = '<div class="tooltip-content">';
    
    if (loading) {
      html += `
        <div class="tooltip-loading">
          <div class="tooltip-loading-spinner"></div>
          <span>${content}</span>
        </div>
      `;
    } else if (error) {
      html += `
        <div class="tooltip-header">
          <span>⚠️ Error</span>
        </div>
        <div>${content}</div>
      `;
    } else {
      if (confidence !== undefined || source) {
        html += '<div class="tooltip-header">';
        
        if (confidence !== undefined) {
          const confidencePercent = Math.round(confidence * 100);
          const confidenceColor = confidence > 0.7 ? '#10b981' : confidence > 0.4 ? '#f59e0b' : '#ef4444';
          
          html += `
            <div class="tooltip-confidence" style="color: ${confidenceColor}">
              <span>●</span>
              <span>${confidencePercent}%</span>
            </div>
          `;
        }
        
        if (source) {
          html += `<div class="tooltip-source">via ${source}</div>`;
        }
        
        html += '</div>';
      }
      
      html += `<div>${content}</div>`;
    }
    
    html += '</div>';
    
    // Add arrow
    html += '<div class="tooltip-arrow"></div>';
    
    this.tooltipElement.innerHTML = html;
    this.tooltipElement.className = `tooltip-companion ${loading ? 'loading' : ''} ${error ? 'error' : ''}`;
    this.tooltipElement.style.display = 'block';
  }

  positionTooltip(targetElement) {
    if (!this.tooltipElement || !targetElement) return;

    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Calculate optimal position
    const positions = this.calculatePositions(targetRect, tooltipRect, viewport);
    const bestPosition = this.selectBestPosition(positions, viewport);

    // Apply position
    this.tooltipElement.style.left = `${bestPosition.x}px`;
    this.tooltipElement.style.top = `${bestPosition.y}px`;
    
    // Update arrow position
    this.updateArrowPosition(bestPosition.placement, targetRect, tooltipRect);
  }

  calculatePositions(targetRect, tooltipRect, viewport) {
    const margin = 8;
    
    return {
      top: {
        x: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
        y: targetRect.top - tooltipRect.height - margin,
        placement: 'top'
      },
      bottom: {
        x: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
        y: targetRect.bottom + margin,
        placement: 'bottom'
      },
      left: {
        x: targetRect.left - tooltipRect.width - margin,
        y: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
        placement: 'left'
      },
      right: {
        x: targetRect.right + margin,
        y: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
        placement: 'right'
      }
    };
  }

  selectBestPosition(positions, viewport) {
    const validPositions = Object.entries(positions).filter(([_, pos]) => {
      return pos.x >= 0 && 
             pos.y >= 0 && 
             pos.x + 300 <= viewport.width && 
             pos.y + 100 <= viewport.height;
    });

    if (validPositions.length === 0) {
      // Fallback to bottom position with adjustments
      const bottom = positions.bottom;
      return {
        x: Math.max(0, Math.min(bottom.x, viewport.width - 300)),
        y: Math.max(0, Math.min(bottom.y, viewport.height - 100)),
        placement: 'bottom'
      };
    }

    // Prefer top, then bottom, then left, then right
    const preferences = ['top', 'bottom', 'left', 'right'];
    for (const preference of preferences) {
      const pos = validPositions.find(([key]) => key === preference);
      if (pos) return pos[1];
    }

    return validPositions[0][1];
  }

  updateArrowPosition(placement, targetRect, tooltipRect) {
    const arrow = this.tooltipElement.querySelector('.tooltip-arrow');
    if (!arrow) return;

    // Remove all placement classes
    arrow.className = 'tooltip-arrow';
    
    // Add new placement class
    arrow.classList.add(placement);
    
    // Position arrow relative to target
    const arrowOffset = 20; // Distance from edge
    
    switch (placement) {
      case 'top':
        arrow.style.left = `${Math.min(Math.max(arrowOffset, targetRect.left + targetRect.width/2 - tooltipRect.left - 6), tooltipRect.width - 12)}px`;
        break;
      case 'bottom':
        arrow.style.left = `${Math.min(Math.max(arrowOffset, targetRect.left + targetRect.width/2 - tooltipRect.left - 6), tooltipRect.width - 12)}px`;
        break;
      case 'left':
        arrow.style.top = `${Math.min(Math.max(arrowOffset, targetRect.top + targetRect.height/2 - tooltipRect.top - 6), tooltipRect.height - 12)}px`;
        break;
      case 'right':
        arrow.style.top = `${Math.min(Math.max(arrowOffset, targetRect.top + targetRect.height/2 - tooltipRect.top - 6), tooltipRect.height - 12)}px`;
        break;
    }
  }
}

// Global API for the extension
window.ToolTipCompanion = InjectedTooltip;
