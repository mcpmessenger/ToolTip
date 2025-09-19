import { chromium, Browser, Page } from 'playwright';
import sharp from 'sharp';

export interface ClickableElement {
  id: string;
  tag: string;
  text: string;
  selector: string;
  xpath: string;
}

export interface ElementResult {
  elementId: string;
  beforeScreenshot: string; // base64 data URL
  afterScreenshot: string; // base64 data URL
  title: string;
  description: string;
  success: boolean;
  error?: string;
  timestamp: string;
}

export interface ScanResult {
  url: string;
  totalElements: number;
  successfulResults: number;
  failedResults: number;
  results: ElementResult[];
  scanTime: number;
  success: boolean;
  error?: string;
  timestamp: string;
}

export class SimplePageScanner {
  private browser: Browser | null = null;
  private isScanning = false;

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async scanPage(url: string): Promise<ScanResult> {
    const startTime = Date.now();
    
    if (this.isScanning) {
      return {
        url,
        totalElements: 0,
        successfulResults: 0,
        failedResults: 0,
        results: [],
        scanTime: 0,
        success: false,
        error: 'Another scan is already in progress',
        timestamp: new Date().toISOString()
      };
    }

    this.isScanning = true;

    try {
      await this.initialize();
      
      if (!this.browser) {
        throw new Error('Failed to initialize browser');
      }

      const page = await this.browser.newPage();
      
      // Set viewport for consistent screenshots
      await page.setViewportSize({ width: 1280, height: 720 });
      
      // Navigate to the page
      console.log(`Navigating to: ${url}`);
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 20000 
      });
      
      // Wait a bit for dynamic content
      await page.waitForTimeout(3000);
      console.log(`Page loaded successfully: ${url}`);

      // Find all clickable elements
      const clickableElements = await this.findClickableElements(page);
      
      console.log(`Found ${clickableElements.length} clickable elements on ${url}`);

      const results: ElementResult[] = [];
      let successfulResults = 0;
      let failedResults = 0;

      // Process each element
      for (const element of clickableElements.slice(0, 10)) { // Limit to first 10 elements
        try {
          const result = await this.processElement(page, element, url);
          results.push(result);
          
          if (result.success) {
            successfulResults++;
          } else {
            failedResults++;
          }
          
          // Small delay between elements
          await page.waitForTimeout(500);
          
        } catch (error) {
          console.error(`Error processing element ${element.id}:`, error);
          failedResults++;
          
          results.push({
            elementId: element.id,
            beforeScreenshot: '',
            afterScreenshot: '',
            title: element.text || `${element.tag} element`,
            description: 'Failed to process',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          });
        }
      }

      await page.close();

      const scanTime = Date.now() - startTime;

      return {
        url,
        totalElements: clickableElements.length,
        successfulResults,
        failedResults,
        results,
        scanTime,
        success: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error scanning page:', error);
      return {
        url,
        totalElements: 0,
        successfulResults: 0,
        failedResults: 0,
        results: [],
        scanTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    } finally {
      this.isScanning = false;
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
            
            clickableElements.push({
              id,
              tag: element.tagName.toLowerCase(),
              text: text.substring(0, 50), // Limit text length
              selector: selector,
              xpath: getXPath(element)
            });
          }
        });
      });

      return clickableElements;
    });

    return elements;
  }

  private async processElement(page: Page, element: ClickableElement, url: string): Promise<ElementResult> {
    const elementId = element.id;
    
    try {
      // Take before screenshot
      const beforeScreenshot = await page.screenshot({ 
        type: 'png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1280, height: 720 }
      });

      // Try to click the element
      const elementHandle = await page.$(element.selector);
      if (!elementHandle) {
        throw new Error(`Element not found: ${element.selector}`);
      }

      // Scroll element into view
      await elementHandle.scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);

      // Click the element
      await elementHandle.click();
      
      // Wait for any changes
      await page.waitForTimeout(1000);

      // Take after screenshot
      const afterScreenshot = await page.screenshot({ 
        type: 'png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1280, height: 720 }
      });

      // Create thumbnails
      const beforeThumbnail = await this.createThumbnail(beforeScreenshot);
      const afterThumbnail = await this.createThumbnail(afterScreenshot);

      return {
        elementId,
        beforeScreenshot: beforeThumbnail,
        afterScreenshot: afterThumbnail,
        title: element.text || `${element.tag} element`,
        description: `Result after clicking ${element.tag}`,
        success: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`Error processing element ${elementId}:`, error);
      return {
        elementId,
        beforeScreenshot: '',
        afterScreenshot: '',
        title: element.text || `${element.tag} element`,
        description: 'Failed to process',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async createThumbnail(screenshot: Buffer): Promise<string> {
    try {
      const thumbnail = await sharp(screenshot)
        .resize(300, 200, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ 
          quality: 70,
          progressive: true 
        })
        .toBuffer();
      
      return `data:image/jpeg;base64,${thumbnail.toString('base64')}`;
    } catch (error) {
      console.error('Error creating thumbnail:', error);
      return `data:image/png;base64,${screenshot.toString('base64')}`;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Helper function to get XPath
function getXPath(element: Element): string {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }
  
  if (element === document.body) {
    return '/html/body';
  }
  
  let ix = 0;
  const siblings = element.parentNode?.children;
  if (siblings) {
    for (let i = 0; i < siblings.length; i++) {
      const sibling = siblings[i];
      if (sibling === element) {
        return getXPath(element.parentNode as Element) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
      }
      if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
        ix++;
      }
    }
  }
  
  return '';
}
