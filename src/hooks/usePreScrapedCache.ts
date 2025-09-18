import { useState, useEffect, useCallback } from 'react';

interface CachedElement {
  id: string;
  selector: string;
  text: string;
  tagName: string;
  coordinates: [number, number];
  targetUrl: string;
  actionType: 'click' | 'navigate' | 'form' | 'custom';
  gifUrl?: string;
  isProcessed: boolean;
  timestamp: number;
}

interface CacheState {
  elements: CachedElement[];
  isLoaded: boolean;
  lastUpdated: number;
}

const CACHE_KEY = 'prescraped_tooltips_cache';
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

export const usePreScrapedCache = () => {
  const [cache, setCache] = useState<CacheState>({
    elements: [],
    isLoaded: false,
    lastUpdated: 0
  });

  // Load cache from localStorage
  const loadCache = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        const now = Date.now();
        
        // Check if cache is still valid
        if (now - parsedCache.lastUpdated < CACHE_EXPIRY) {
          setCache(parsedCache);
          console.log('Loaded pre-scraped cache with', parsedCache.elements.length, 'elements');
          return true;
        } else {
          console.log('Cache expired, clearing...');
          localStorage.removeItem(CACHE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
    return false;
  }, []);

  // Save cache to localStorage
  const saveCache = useCallback((elements: CachedElement[]) => {
    try {
      const cacheData: CacheState = {
        elements,
        isLoaded: true,
        lastUpdated: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      setCache(cacheData);
      console.log('Saved pre-scraped cache with', elements.length, 'elements');
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }, []);

  // Generate real Playwright screenshots for previews
  const generateRealPreviews = useCallback(async (elements: CachedElement[]): Promise<CachedElement[]> => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    
    const processedElements = await Promise.all(
      elements.map(async (element) => {
        try {
          // Try to get real screenshot from Playwright
          const response = await fetch(`${API_BASE_URL}/api/screenshot/after`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: element.targetUrl,
              selector: element.selector,
              coordinates: element.coordinates,
              waitTime: 2000,
              width: 300,
              height: 200
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.imageData) {
              return {
                ...element,
                gifUrl: data.imageData,
                isProcessed: true
              };
            }
          }
        } catch (error) {
          console.warn(`Failed to get real screenshot for ${element.selector}:`, error);
        }

        // Fallback to mock preview if real screenshot fails
        const safeText = (element.text || element.selector || 'Button').replace(/[^\x00-\x7F]/g, '');
        const safeActionType = element.actionType.replace(/[^\x00-\x7F]/g, '');
        
        return {
          ...element,
          gifUrl: `data:image/svg+xml;base64,${btoa(`
            <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#e3f2fd;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#bbdefb;stop-opacity:1" />
                </linearGradient>
              </defs>
              <rect width="300" height="200" fill="url(#bg)" stroke="#2196f3" stroke-width="2" rx="8"/>
              
              <!-- Success checkmark -->
              <circle cx="150" cy="80" r="25" fill="#4CAF50" opacity="0.9"/>
              <path d="M140 80 L148 88 L160 76" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              
              <!-- Action text -->
              <text x="150" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#1976d2">
                ${safeText}
              </text>
              <text x="150" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">
                Click to ${safeActionType}
              </text>
              
              <!-- Animated pulse effect -->
              <circle cx="150" cy="80" r="25" fill="none" stroke="#4CAF50" stroke-width="2" opacity="0.6">
                <animate attributeName="r" values="25;35;25" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/>
              </circle>
            </svg>
          `)}`,
          isProcessed: true
        };
      })
    );

    return processedElements;
  }, []);

  // Scan page for elements and generate cache
  const scanAndCache = useCallback(() => {
    const clickableSelectors = [
      'button',
      'a[href]',
      'input[type="button"]',
      'input[type="submit"]',
      'input[type="reset"]',
      '[onclick]',
      '[role="button"]',
      '[role="link"]',
      '.btn',
      '.button',
      '[class*="btn"]',
      '[class*="button"]'
    ];

    const elements: CachedElement[] = [];
    const currentUrl = window.location.href;

    clickableSelectors.forEach(selector => {
      const found = document.querySelectorAll(selector);
      found.forEach((element, index) => {
        const htmlElement = element as HTMLElement;
        const rect = htmlElement.getBoundingClientRect();
        
        // Only include visible elements
        if (rect.width > 0 && rect.height > 0) {
          const elementData: CachedElement = {
            id: `element-${index}-${Date.now()}`,
            selector: generateSelector(htmlElement),
            text: htmlElement.textContent?.trim() || '',
            tagName: htmlElement.tagName.toLowerCase(),
            coordinates: [Math.round(rect.left + rect.width / 2), Math.round(rect.top + rect.height / 2)],
            targetUrl: detectTargetUrl(htmlElement, currentUrl),
            actionType: detectActionType(htmlElement),
            isProcessed: false,
            timestamp: Date.now()
          };
          
          elements.push(elementData);
        }
      });
    });

    // Return elements immediately with mock previews for instant display
    const elementsWithMockPreviews = elements.map((element, index) => {
      const safeText = (element.text || element.selector || 'Button').replace(/[^\x00-\x7F]/g, '');
      const safeActionType = element.actionType.replace(/[^\x00-\x7F]/g, '');
      
      return {
        ...element,
        gifUrl: `data:image/svg+xml;base64,${btoa(`
          <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#e3f2fd;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#bbdefb;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="300" height="200" fill="url(#bg)" stroke="#2196f3" stroke-width="2" rx="8"/>
            
            <!-- Success checkmark -->
            <circle cx="150" cy="80" r="25" fill="#4CAF50" opacity="0.9"/>
            <path d="M140 80 L148 88 L160 76" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            
            <!-- Action text -->
            <text x="150" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#1976d2">
              ${safeText}
            </text>
            <text x="150" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">
              Click to ${safeActionType}
            </text>
            
            <!-- Animated pulse effect -->
            <circle cx="150" cy="80" r="25" fill="none" stroke="#4CAF50" stroke-width="2" opacity="0.6">
              <animate attributeName="r" values="25;35;25" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/>
            </circle>
          </svg>
        `)}`,
        isProcessed: true
      };
    });
    
    // Save to cache
    saveCache(elementsWithMockPreviews);
    
    return elementsWithMockPreviews;
  }, [saveCache]);

  // Helper functions
  const generateSelector = (element: HTMLElement): string => {
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.length > 0);
      if (classes.length > 0) {
        return `.${classes[0]}`;
      }
    }

    let selector = element.tagName.toLowerCase();
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(element);
      if (index > 0) {
        selector += `:nth-child(${index + 1})`;
      }
    }

    return selector;
  };

  const detectTargetUrl = (element: HTMLElement, currentUrl: string): string => {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'a') {
      const href = element.getAttribute('href');
      if (href) {
        try {
          return new URL(href, currentUrl).href;
        } catch {
          return currentUrl;
        }
      }
    }

    const dataUrl = element.getAttribute('data-url') || 
                   element.getAttribute('data-href') ||
                   element.getAttribute('data-target');
    if (dataUrl) {
      try {
        return new URL(dataUrl, currentUrl).href;
      } catch {
        return currentUrl;
      }
    }

    return currentUrl;
  };

  const detectActionType = (element: HTMLElement): CachedElement['actionType'] => {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'a') return 'navigate';
    if (tagName === 'form' || tagName === 'input' && element.getAttribute('type') === 'submit') return 'form';
    if (element.hasAttribute('onclick')) return 'custom';
    
    return 'click';
  };

  // Load cache on mount
  useEffect(() => {
    const cacheLoaded = loadCache();
    if (!cacheLoaded) {
      // If no cache, scan and create one
      setTimeout(() => {
        scanAndCache();
      }, 1000);
    }
  }, [loadCache, scanAndCache]);

  // Get element by selector
  const getElementBySelector = useCallback((selector: string) => {
    return cache.elements.find(el => el.selector === selector);
  }, [cache.elements]);

  // Get element by ID
  const getElementById = useCallback((id: string) => {
    return cache.elements.find(el => el.id === id);
  }, [cache.elements]);

  // Clear cache
  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    setCache({
      elements: [],
      isLoaded: false,
      lastUpdated: 0
    });
  }, []);

  return {
    elements: cache.elements,
    isLoaded: cache.isLoaded,
    lastUpdated: cache.lastUpdated,
    getElementBySelector,
    getElementById,
    scanAndCache,
    clearCache,
    totalElements: cache.elements.length,
    processedElements: cache.elements.filter(el => el.isProcessed).length
  };
};
