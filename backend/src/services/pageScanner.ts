import { chromium, Browser, Page, ElementHandle } from 'playwright';
import { gifGenerator } from './gifGenerator';
import NodeCache from 'node-cache';

interface ClickableElement {
  id: string;
  selector: string;
  text: string;
  tagName: string;
  href?: string;
  onclick?: string;
  type?: string;
  className: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  targetUrl?: string;
  actionType: 'link' | 'button' | 'form' | 'custom';
}

interface ScanResult {
  pageUrl: string;
  elements: ClickableElement[];
  timestamp: number;
  totalElements: number;
}

class PageScanner {
  private cache: NodeCache;
  private browser: Browser | null = null;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // 1 hour cache
  }

  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
      });
    }
    return this.browser;
  }

  async scanPage(url: string): Promise<ScanResult> {
    const cacheKey = `scan_${url}`;
    const cached = this.cache.get<ScanResult>(cacheKey);
    if (cached) {
      console.log(`Using cached scan result for ${url}`);
      return cached;
    }

    console.log(`Scanning page: ${url}`);
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    
    try {
      // Set viewport and wait for page load
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Extract all clickable elements
      const elements = await page.evaluate(() => {
        const clickableSelectors = [
          'a[href]',
          'button',
          'input[type="button"]',
          'input[type="submit"]',
          'input[type="reset"]',
          '[onclick]',
          '[role="button"]',
          '[role="link"]',
          '[role="menuitem"]',
          '[role="tab"]',
          '[tabindex]:not([tabindex="-1"])',
          'summary', // details/summary elements
          '[data-testid*="button"]',
          '[data-testid*="link"]',
          '[aria-label]',
          '.btn',
          '.button',
          '.link',
          '[class*="btn"]',
          '[class*="button"]',
          '[class*="link"]'
        ];

        const elements: any[] = [];
        const processedSelectors = new Set<string>();

        clickableSelectors.forEach(selector => {
          const found = document.querySelectorAll(selector);
          found.forEach((el, index) => {
            const rect = el.getBoundingClientRect();
            const selectorId = `${selector}_${index}`;
            
            // Skip if already processed or not visible
            if (processedSelectors.has(selectorId) || rect.width === 0 || rect.height === 0) {
              return;
            }

            const element: ClickableElement = {
              id: selectorId,
              selector: this.generateSelector(el),
              text: el.textContent?.trim() || '',
              tagName: el.tagName.toLowerCase(),
              href: el.getAttribute('href') || undefined,
              onclick: el.getAttribute('onclick') || undefined,
              type: el.getAttribute('type') || undefined,
              className: el.className,
              position: {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
              },
              actionType: this.determineActionType(el),
              targetUrl: this.getTargetUrl(el, window.location.href)
            };
            
            elements.push(element);
            processedSelectors.add(selectorId);
          });
        });

        return elements;
      });

      // Generate previews for each element
      const elementsWithPreviews = await Promise.all(
        elements.map(async (element) => {
          if (element.targetUrl) {
            try {
              const previewId = await this.generateElementPreview(page, element);
              return { ...element, previewId };
            } catch (error) {
              console.warn(`Failed to generate preview for ${element.selector}:`, error);
              return element;
            }
          }
          return element;
        })
      );

      const result: ScanResult = {
        pageUrl: url,
        elements: elementsWithPreviews,
        timestamp: Date.now(),
        totalElements: elementsWithPreviews.length
      };

      // Cache the result
      this.cache.set(cacheKey, result);
      
      console.log(`Found ${result.totalElements} clickable elements on ${url}`);
      return result;

    } finally {
      await page.close();
    }
  }

  private async generateElementPreview(page: Page, element: ClickableElement): Promise<string> {
    const { gifGenerator } = await import('./gifGenerator');
    
    try {
      // Navigate to the target URL
      await page.goto(element.targetUrl!, { waitUntil: 'networkidle', timeout: 15000 });
      
      // Take screenshots at different intervals to create a GIF
      const screenshots: Buffer[] = [];
      const intervals = [0, 1000, 2000]; // 0s, 1s, 2s
      
      for (const interval of intervals) {
        if (interval > 0) {
          await page.waitForTimeout(interval);
        }
        
        const screenshot = await page.screenshot({
          fullPage: false,
          clip: { x: 0, y: 0, width: 1920, height: 1080 }
        });
        screenshots.push(screenshot);
      }

      // Generate GIF from first and last screenshots
      if (screenshots.length < 2) {
        throw new Error('Need at least 2 screenshots to generate GIF');
      }
      const gifBuffer = await gifGenerator.generateGif(screenshots[0], screenshots[screenshots.length - 1]);
      
      // Save GIF to file and return filename
      const filename = `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.gif`;
      const previewId = await gifGenerator.saveGif(gifBuffer, filename);
      return previewId;

    } catch (error) {
      console.warn(`Preview generation failed for ${element.selector}:`, error);
      throw error;
    }
  }

  private generateSelector(element: Element): string {
    // Generate a unique selector for the element
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.length > 0);
      if (classes.length > 0) {
        return `.${classes.join('.')}`;
      }
    }

    // Fallback to tag name with nth-child
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
  }

  private determineActionType(element: Element): ClickableElement['actionType'] {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'a') return 'link';
    if (tagName === 'button' || tagName === 'input') return 'button';
    if (tagName === 'form') return 'form';
    
    return 'custom';
  }

  private getTargetUrl(element: Element, currentUrl: string): string | undefined {
    const tagName = element.tagName.toLowerCase();
    
    // Handle links
    if (tagName === 'a') {
      const href = element.getAttribute('href');
      if (href) {
        try {
          return new URL(href, currentUrl).href;
        } catch {
          return undefined;
        }
      }
    }
    
    // Handle forms
    if (tagName === 'form') {
      const action = element.getAttribute('action');
      if (action) {
        try {
          return new URL(action, currentUrl).href;
        } catch {
          return undefined;
        }
      }
    }
    
    // Handle buttons with data attributes
    const dataUrl = element.getAttribute('data-url') || 
                   element.getAttribute('data-href') ||
                   element.getAttribute('data-target');
    
    if (dataUrl) {
      try {
        return new URL(dataUrl, currentUrl).href;
      } catch {
        return undefined;
      }
    }
    
    // Handle onclick handlers that navigate
    const onclick = element.getAttribute('onclick');
    if (onclick) {
      const urlMatch = onclick.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
      if (urlMatch) {
        try {
          return new URL(urlMatch[1], currentUrl).href;
        } catch {
          return undefined;
        }
      }
    }
    
    return undefined;
  }

  async getScanResult(url: string): Promise<ScanResult | null> {
    const cacheKey = `scan_${url}`;
    return this.cache.get<ScanResult>(cacheKey) || null;
  }

  async clearCache(): Promise<void> {
    this.cache.flushAll();
    console.log('Page scanner cache cleared');
  }

  getCacheStats() {
    return {
      keys: this.cache.keys().length,
      hits: this.cache.getStats().hits,
      misses: this.cache.getStats().misses,
      ksize: this.cache.getStats().ksize,
      vsize: this.cache.getStats().vsize
    };
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const pageScanner = new PageScanner();
