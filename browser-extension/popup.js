// Popup script for ToolTip Companion Extension
class ToolTipPopup {
  constructor() {
    this.settings = {};
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();
    this.updateUI();
    this.checkBackendHealth();
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({
        enabled: true,
        triggerEvent: 'hover',
        showPreviews: true,
        proactiveMode: false,
        apiBaseUrl: 'http://localhost:3001'
      }, (settings) => {
        this.settings = settings;
        resolve();
      });
    });
  }

  async saveSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.set(this.settings, () => {
        // Notify content script of settings change
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'settingsUpdated' });
          }
        });
        resolve();
      });
    });
  }

  setupEventListeners() {
    // Enable toggle
    document.getElementById('enableToggle').addEventListener('click', () => {
      this.settings.enabled = !this.settings.enabled;
      this.updateToggle('enableToggle', this.settings.enabled);
      this.saveSettings();
    });

    // Trigger event select
    document.getElementById('triggerSelect').addEventListener('change', (e) => {
      this.settings.triggerEvent = e.target.value;
      this.saveSettings();
    });

    // Previews toggle
    document.getElementById('previewsToggle').addEventListener('click', () => {
      this.settings.showPreviews = !this.settings.showPreviews;
      this.updateToggle('previewsToggle', this.settings.showPreviews);
      this.saveSettings();
    });

    // Proactive mode toggle
    document.getElementById('proactiveToggle').addEventListener('click', () => {
      this.settings.proactiveMode = !this.settings.proactiveMode;
      this.updateToggle('proactiveToggle', this.settings.proactiveMode);
      this.saveSettings();
    });

    // Test button
    document.getElementById('testButton').addEventListener('click', () => {
      this.testOnCurrentPage();
    });
  }

  updateUI() {
    this.updateToggle('enableToggle', this.settings.enabled);
    this.updateToggle('previewsToggle', this.settings.showPreviews);
    this.updateToggle('proactiveToggle', this.settings.proactiveMode);
    
    document.getElementById('triggerSelect').value = this.settings.triggerEvent;
  }

  updateToggle(toggleId, isActive) {
    const toggle = document.getElementById(toggleId);
    if (isActive) {
      toggle.classList.add('active');
    } else {
      toggle.classList.remove('active');
    }
  }

  async checkBackendHealth() {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const statusSubtext = document.getElementById('statusSubtext');

    try {
      const response = await chrome.runtime.sendMessage({ action: 'checkBackendHealth' });
      
      if (response.success) {
        const { status, data, error } = response.data;
        
        if (status === 'healthy') {
          statusIndicator.className = 'status-indicator';
          statusText.textContent = 'Connected to Backend';
          statusSubtext.textContent = `API: ${this.settings.apiBaseUrl}`;
        } else if (status === 'unhealthy') {
          statusIndicator.className = 'status-indicator warning';
          statusText.textContent = 'Backend Unhealthy';
          statusSubtext.textContent = error || 'Unknown error';
        } else {
          statusIndicator.className = 'status-indicator error';
          statusText.textContent = 'Backend Unreachable';
          statusSubtext.textContent = error || 'Check your connection';
        }
      } else {
        throw new Error(response.error || 'Health check failed');
      }
    } catch (error) {
      statusIndicator.className = 'status-indicator error';
      statusText.textContent = 'Connection Failed';
      statusSubtext.textContent = error.message;
    }
  }

  async testOnCurrentPage() {
    const testButton = document.getElementById('testButton');
    const originalText = testButton.textContent;
    
    testButton.textContent = 'Testing...';
    testButton.disabled = true;

    try {
      // Get current tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];

      if (!currentTab) {
        throw new Error('No active tab found');
      }

      // Inject test script
      await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        function: this.testTooltipFunction
      });

      testButton.textContent = 'Test Complete!';
      setTimeout(() => {
        testButton.textContent = originalText;
        testButton.disabled = false;
      }, 2000);

    } catch (error) {
      testButton.textContent = 'Test Failed';
      setTimeout(() => {
        testButton.textContent = originalText;
        testButton.disabled = false;
      }, 2000);
      
      console.error('Test failed:', error);
    }
  }

  testTooltipFunction() {
    // This function runs in the context of the current page
    const buttons = document.querySelectorAll('button, a[href], [role="button"]');
    
    if (buttons.length === 0) {
      alert('No interactive elements found on this page to test with.');
      return;
    }

    // Find the first visible button
    let testButton = null;
    for (const button of buttons) {
      const rect = button.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        testButton = button;
        break;
      }
    }

    if (!testButton) {
      alert('No visible interactive elements found on this page.');
      return;
    }

    // Simulate hover event
    const event = new MouseEvent('mouseenter', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    
    testButton.dispatchEvent(event);
    
    // Show success message
    setTimeout(() => {
      alert(`Test completed! Hovered over: "${testButton.textContent || testButton.getAttribute('aria-label') || 'Interactive element'}"`);
    }, 1000);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ToolTipPopup();
});
