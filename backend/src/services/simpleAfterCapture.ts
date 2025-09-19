import { chromium, Browser, Page } from 'playwright';
import sharp from 'sharp';

export interface ClickableElement {
  id: string;
  tag: string;
  text: string;
  selector: string;
}

export interface ElementResult {
  elementId: string;
  afterScreenshot: string; // base64 data URL - only after screenshots
  title: string;
  success: boolean;
  error?: string;
  timestamp: string;
  isExternalNavigation?: boolean; // true if clicked element navigated to external URL
  externalUrl?: string; // the external URL that was navigated to
}

export interface CaptureResult {
  url: string;
  totalElements: number;
  successfulResults: number;
  failedResults: number;
  results: ElementResult[];
  captureTime: number;
  success: boolean;
  error?: string;
  timestamp: string;
}

export class SimpleAfterCapture {
  private browser: Browser | null = null;
  private isCapturing = false;
  private processingUrls = new Set<string>();
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 100; // 0.1 seconds between requests
  private static globalCapturing = false; // Global flag to prevent multiple captures

  async initialize(): Promise<void> {
    if (!this.browser || !this.browser.isConnected()) {
      if (this.browser) {
        try {
          await this.browser.close();
        } catch (e) {
          console.log('Browser already closed');
        }
      }
      console.log('🚀 Launching new browser instance...');
      this.browser = await chromium.launch({ 
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox', 
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
      console.log('✅ Browser launched successfully');
    }
  }

  async capturePage(url: string): Promise<CaptureResult> {
    const startTime = Date.now();
    
    // Global check to prevent multiple captures
    if (SimpleAfterCapture.globalCapturing) {
      console.log(`⚠️ Global capture in progress, skipping ${url}`);
      return {
        url,
        totalElements: 0,
        successfulResults: 0,
        failedResults: 0,
        results: [],
        captureTime: 0,
        success: false,
        error: 'Global capture in progress',
        timestamp: new Date().toISOString()
      };
    }

    // Set a global timeout for the entire capture process (30 seconds)
    const globalTimeout = setTimeout(() => {
      console.log(`⏰ Global capture timeout reached for ${url}`);
      SimpleAfterCapture.globalCapturing = false;
    }, 30000);
    
    // Rate limiting - prevent too many requests
    const now = Date.now();
    if (now - this.lastRequestTime < this.MIN_REQUEST_INTERVAL) {
      console.log(`⚠️ Rate limited: Too many requests, skipping ${url}`);
      return {
        url,
        totalElements: 0,
        successfulResults: 0,
        failedResults: 0,
        results: [],
        captureTime: 0,
        success: false,
        error: 'Rate limited - too many requests',
        timestamp: new Date().toISOString()
      };
    }
    this.lastRequestTime = now;
    
    if (this.isCapturing) {
      return {
        url,
        totalElements: 0,
        successfulResults: 0,
        failedResults: 0,
        results: [],
        captureTime: 0,
        success: false,
        error: 'Another capture is already in progress',
        timestamp: new Date().toISOString()
      };
    }

    // Check if this URL is already being processed
    if (this.processingUrls.has(url)) {
      console.log(`⚠️ URL ${url} is already being processed, skipping...`);
      return {
        url,
        totalElements: 0,
        successfulResults: 0,
        failedResults: 0,
        results: [],
        captureTime: 0,
        success: false,
        error: 'URL is already being processed',
        timestamp: new Date().toISOString()
      };
    }

    SimpleAfterCapture.globalCapturing = true;
    this.isCapturing = true;
    this.processingUrls.add(url);
    console.log(`🚀 Starting proactive capture for: ${url}`);
    console.log(`📝 NOTE: All images will be stored as base64 in Local Storage (NO backend files)`);

    let page: any = null;
    try {
      await this.initialize();
      
      if (!this.browser) {
        throw new Error('Failed to initialize browser');
      }

      // Create a new page with a safe retry if the browser was closed
      try {
        page = await this.browser.newPage();
        console.log('✅ New page created successfully');
      } catch (e) {
        console.log('❌ Browser not available, reinitializing...', e);
        await this.initialize();
        if (!this.browser) {
          throw new Error('Failed to initialize browser');
        }
        page = await this.browser.newPage();
        console.log('✅ New page created after reinitialization');
      }
      
      // Set viewport for full screen capture
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Navigate to the page
      console.log(`Navigating to: ${url}`);
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      
      // Wait for dynamic content
      await page.waitForTimeout(3000);
      console.log(`Page loaded successfully: ${url}`);

      // Find all clickable elements
      const clickableElements = await this.findClickableElements(page);
      
      console.log(`🔍 Found ${clickableElements.length} clickable elements on ${url}`);
      console.log(`📋 Elements found:`, clickableElements.map(el => `${el.id} (${el.tag}): "${el.text}"`));

      const results: ElementResult[] = [];
      let successfulResults = 0;
      let failedResults = 0;

      // Process each element (limit to first 8 for performance)
      const elementsToProcess = clickableElements.slice(0, 8);
      console.log(`📝 Processing ${elementsToProcess.length} elements...`);

      for (const element of elementsToProcess) {
        try {
          const result = await this.captureElementAfter(page, element, url);
          results.push(result);
          
          if (result.success) {
            successfulResults++;
          } else {
            failedResults++;
          }
          
          // Small delay between elements
          await page.waitForTimeout(1000);
          console.log(`✅ Processed element: ${element.id} (${element.tag})`);
          
        } catch (error) {
          console.error(`Error capturing element ${element.id}:`, error);
          failedResults++;
          
          results.push({
            elementId: element.id,
            afterScreenshot: '',
            title: element.text || `${element.tag} element`,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
            isExternalNavigation: false,
            externalUrl: undefined
          });
        }
      }

      const captureTime = Date.now() - startTime;

      console.log(`🎉 Proactive capture completed!`);
      console.log(`📊 Results: ${successfulResults} successful, ${failedResults} failed`);
      console.log(`⏱️ Time: ${captureTime}ms`);

      return {
        url,
        totalElements: clickableElements.length,
        successfulResults,
        failedResults,
        results,
        captureTime,
        success: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error capturing page:', error);
      return {
        url,
        totalElements: 0,
        successfulResults: 0,
        failedResults: 0,
        results: [],
        captureTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    } finally {
      clearTimeout(globalTimeout);
      // Close page but keep browser alive
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          console.log('Page already closed or error closing page:', closeError);
        }
      }
      SimpleAfterCapture.globalCapturing = false;
      this.isCapturing = false;
      this.processingUrls.delete(url);
      console.log(`✅ Completed processing for: ${url}`);
    }
  }

  private async findClickableElements(page: Page): Promise<ClickableElement[]> {
    const elements = await page.evaluate(() => {
      const clickableSelectors = [
        'button',
        'a[href]',
        'input[type="button"]',
        'input[type="submit"]',
        'input[type="reset"]',
        '[role="button"]',
        '[onclick]',
        'select',
        'input[type="checkbox"]',
        'input[type="radio"]'
      ];

      const clickableElements: any[] = [];
      const seenElements = new Set<Element>();

      clickableSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
          if (seenElements.has(element)) return;
          seenElements.add(element);

          const rect = element.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) { // Only visible elements
            const text = element.textContent?.trim() || '';
            const id = element.id || `${selector}_${index}`;
            
            // Use more specific selector for better targeting
            let specificSelector = selector;
            if (element.id) {
              specificSelector = `#${element.id}`;
            } else if (element.className) {
              specificSelector = `${element.tagName.toLowerCase()}.${element.className.split(' ')[0]}`;
            }
            
            clickableElements.push({
              id,
              tag: element.tagName.toLowerCase(),
              text: text.substring(0, 50), // Limit text length
              selector: specificSelector
            });
          }
        });
      });

      console.log('Found clickable elements:', clickableElements);
      return clickableElements;
    });

    return elements;
  }

  private async captureElementAfter(page: Page, element: ClickableElement, url: string): Promise<ElementResult> {
    const elementId = element.id;
    let elementTimeout: NodeJS.Timeout | null = null;
    
    try {
      console.log(`🎯 Capturing element: ${elementId} (${element.tag})`);
      
      // Set a timeout for the entire element capture process (30 seconds)
      elementTimeout = setTimeout(() => {
        throw new Error(`Element capture timeout for ${elementId}`);
      }, 30000);
      
      // Check if page is still valid
      if (page.isClosed()) {
        clearTimeout(elementTimeout);
        throw new Error('Page has been closed');
      }
      
      // Try to click the element
      const elementHandle = await page.$(element.selector);
      if (!elementHandle) {
        throw new Error(`Element not found: ${element.selector}`);
      }

      // Scroll element into view with shorter timeout
      try {
        await elementHandle.scrollIntoViewIfNeeded({ timeout: 3000 });
        await page.waitForTimeout(200);
      } catch (scrollError) {
        console.log(`⚠️ Scroll failed for ${elementId}, continuing...`);
      }

      // Click the element with shorter timeout
      console.log(`🖱️ Clicking element: ${elementId}`);
      
      // Check if this is a link with target="_blank" before clicking
      const isExternalLink = await page.evaluate((selector) => {
        const el = document.querySelector(selector) as HTMLAnchorElement;
        return el && el.tagName === 'A' && el.target === '_blank';
      }, element.selector);
      
      if (isExternalLink) {
        console.log(`🔗 External link detected, getting href...`);
        const href = await page.evaluate((selector) => {
          const el = document.querySelector(selector) as HTMLAnchorElement;
          return el ? el.href : null;
        }, element.selector);
        
        if (href) {
          console.log(`🌍 External URL: ${href}`);
          // Navigate directly to the external URL instead of clicking
          await page.goto(href, { waitUntil: 'domcontentloaded', timeout: 10000 });
          console.log(`✅ Navigated to external URL: ${href}`);
        }
      } else {
        try {
          await elementHandle.click({ timeout: 3000 });
        } catch (clickError) {
          console.log(`⚠️ Click failed for ${elementId}, trying alternative click...`);
          // Try alternative click method
          await page.evaluate((selector) => {
            const el = document.querySelector(selector) as HTMLElement;
            if (el && typeof el.click === 'function') {
              el.click();
            }
          }, element.selector);
        }
      }
      
      // Wait for navigation or state changes
      await page.waitForTimeout(1000);
      
      // Check if we navigated to a new page
      const currentUrl = page.url();
      console.log(`🔍 Current URL after click: ${currentUrl}, Original URL: ${url}`);
      
      if (currentUrl !== url) {
        console.log(`🌐 Navigation detected: ${url} → ${currentUrl}`);
        
        // Check if this is external navigation (different domain)
        const originalDomain = new URL(url).hostname;
        const currentDomain = new URL(currentUrl).hostname;
        const isExternalNavigation = originalDomain !== currentDomain;
        console.log(`🌍 Domain check: ${originalDomain} vs ${currentDomain}, External: ${isExternalNavigation}`);
        
        if (isExternalNavigation) {
          console.log(`🌍 External navigation detected: ${originalDomain} → ${currentDomain}`);
          console.log(`📸 Capturing external page: ${currentUrl}`);
          
          // Wait for external page to load with shorter timeout
          try {
            await page.waitForLoadState('domcontentloaded', { timeout: 5000 }); // 5 second timeout
            console.log(`✅ External page loaded successfully: ${currentUrl}`);
          } catch (timeoutError) {
            console.log(`⚠️ External page load timeout, continuing with current state: ${currentUrl}`);
          }
          
          // Wait a bit more for dynamic content
          await page.waitForTimeout(2000);
          
          // Scroll to top to ensure we capture the full page header
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.waitForTimeout(1000);
        } else {
          console.log(`🏠 Internal navigation detected: ${currentUrl}`);
          // Wait a bit more for the new page to load
          await page.waitForTimeout(2000);
        }
      }

      // Take full screen after screenshot with shorter timeout
      console.log(`📸 Taking screenshot for: ${elementId}`);
      let afterScreenshot: Buffer;
      try {
        afterScreenshot = await page.screenshot({ 
          type: 'png',
          fullPage: true,
          timeout: 5000
        });
      } catch (screenshotError) {
        console.log(`⚠️ Full page screenshot failed for ${elementId}, trying viewport...`);
        afterScreenshot = await page.screenshot({ 
          type: 'png',
          timeout: 3000
        });
      }

      // Create compressed base64 image for Local Storage (NO FILE SAVING)
      const afterScreenshotBase64 = await this.createAfterImage(afterScreenshot);

      // Determine if this was external navigation
      const isExternalNavigation = currentUrl !== url && new URL(url).hostname !== new URL(currentUrl).hostname;

      console.log(`✅ Successfully captured: ${elementId}${isExternalNavigation ? ' (external page)' : ''}`);

      clearTimeout(elementTimeout);
      return {
        elementId,
        afterScreenshot: afterScreenshotBase64,
        title: element.text || `${element.tag} element`,
        success: true,
        timestamp: new Date().toISOString(),
        isExternalNavigation,
        externalUrl: isExternalNavigation ? currentUrl : undefined
      };

    } catch (error) {
      console.error(`❌ Error capturing element ${elementId}:`, error);
      if (elementTimeout) {
        clearTimeout(elementTimeout);
      }
      return {
        elementId,
        afterScreenshot: '',
        title: element.text || `${element.tag} element`,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        isExternalNavigation: false,
        externalUrl: undefined
      };
    }
  }

  private async createAfterImage(screenshot: Buffer): Promise<string> {
    try {
      // Create a compressed base64 image for Local Storage ONLY (NO FILE SAVING)
      console.log(`🖼️ Creating base64 image for Local Storage...`);
      const compressed = await sharp(screenshot)
        .resize(800, 600, { 
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: 80,
          progressive: true 
        })
        .toBuffer();
      
      const base64Data = `data:image/jpeg;base64,${compressed.toString('base64')}`;
      console.log(`✅ Created base64 image (${base64Data.length} characters)`);
      return base64Data;
    } catch (error) {
      console.error('Error creating after image:', error);
      const fallbackBase64 = `data:image/png;base64,${screenshot.toString('base64')}`;
      console.log(`🔄 Using fallback base64 image (${fallbackBase64.length} characters)`);
      return fallbackBase64;
    }
  }

  // Clear stuck processing state
  clearProcessingState(): void {
    SimpleAfterCapture.globalCapturing = false;
    this.isCapturing = false;
    this.processingUrls.clear();
    this.lastRequestTime = 0; // Reset rate limiting
    console.log('🔄 Cleared stuck processing state and URL queue');
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
