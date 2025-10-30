// Background script for ToolTip Companion Extension
class ToolTipBackground {
  constructor() {
    this.apiBaseUrl = 'http://localhost:3001';
    this.setupMessageHandlers();
  }

  setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'analyzeElement':
          const analysis = await this.analyzeElement(request.data);
          sendResponse({ success: true, data: analysis });
          break;
        
        case 'getSettings':
          const settings = await this.getSettings();
          sendResponse({ success: true, data: settings });
          break;
        
        case 'updateSettings':
          await this.updateSettings(request.data);
          sendResponse({ success: true });
          break;
        
        case 'checkBackendHealth':
          const health = await this.checkBackendHealth();
          sendResponse({ success: true, data: health });
          break;
        
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async analyzeElement(elementData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/analyze-element`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          element: elementData,
          url: elementData.url,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Element analysis failed:', error);
      // Return fallback analysis
      return {
        tooltip: this.generateFallbackTooltip(elementData),
        confidence: 0.3,
        source: 'fallback'
      };
    }
  }

  generateFallbackTooltip(elementData) {
    const { tag, text, attributes } = elementData;
    
    // Basic fallback tooltip generation
    if (attributes?.title) {
      return attributes.title;
    }
    
    if (attributes?.['aria-label']) {
      return attributes['aria-label'];
    }
    
    if (text && text.trim()) {
      return `This ${tag} element: "${text.trim()}"`;
    }
    
    return `Interactive ${tag} element`;
  }

  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({
        enabled: true,
        triggerEvent: 'hover',
        showPreviews: true,
        apiBaseUrl: 'http://localhost:3001',
        proactiveMode: false
      }, resolve);
    });
  }

  async updateSettings(settings) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(settings, resolve);
    });
  }

  async checkBackendHealth() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        return { status: 'healthy', data };
      } else {
        return { status: 'unhealthy', error: `HTTP ${response.status}` };
      }
    } catch (error) {
      return { status: 'unreachable', error: error.message };
    }
  }
}

// Initialize background script
new ToolTipBackground();
