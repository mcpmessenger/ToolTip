import { chromium, Browser, Page } from 'playwright';
import { gifGenerator } from './gifGenerator';
import { v4 as uuidv4 } from 'uuid';

export interface PreCrawlResult {
  elementId: string;
  selector: string;
  text: string;
  gifUrl: string;
  status: 'success' | 'error';
  error?: string;
}

export class PreCrawlService {
  private browser: Browser | null = null;
  private results: Map<string, PreCrawlResult> = new Map();

  async initializeBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async preCrawlPage(url: string): Promise<PreCrawlResult[]> {
    try {
      await this.initializeBrowser();
      if (!this.browser) throw new Error('Browser not initialized');

      const page = await this.browser.newPage();
      
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Find all clickable elements with better selectors
      const clickableElements = await page.evaluate(() => {
        const elements: Array<{
          selector: string;
          text: string;
          id: string;
        }> = [];
        
        // Look for buttons with specific titles/classes that match our UI
        const buttonSelectors = [
          'button[title="Simple GIF Demo"]',
          'button[title="Page Scanner Demo"]', 
          'button[title="GIF Crawl Demo"]',
          'button[title="Settings"]',
          'button[title="Get Started"]',
          'button[title="View Documentation"]',
          '.companion-widget',
          '[data-testid="companion-widget"]'
        ];
        
        buttonSelectors.forEach(selector => {
          const found = document.querySelectorAll(selector);
          found.forEach((el, index) => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) { // Only visible elements
              const text = el.textContent?.trim() || el.getAttribute('title') || '';
              if (text.length > 0) {
                const elementId = `button_${index}`;
                elements.push({
                  selector: selector,
                  text,
                  id: elementId
                });
              }
            }
          });
        });
        
        // Also look for general buttons as fallback
        const generalButtons = document.querySelectorAll('button');
        generalButtons.forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const text = el.textContent?.trim() || '';
            if (text.length > 0 && text.length < 50) {
              const elementId = `general_button_${index}`;
              elements.push({
                selector: `button:nth-child(${index + 1})`,
                text,
                id: elementId
              });
            }
          }
        });
        
        return elements;
      });

      console.log(`Found ${clickableElements.length} clickable elements to pre-crawl`);

      // Process each element
      const results: PreCrawlResult[] = [];
      
      for (const element of clickableElements.slice(0, 10)) { // Limit to first 10 elements
        try {
          const result = await this.crawlElement(page, element, url);
          results.push(result);
          this.results.set(element.id, result);
        } catch (error) {
          console.error(`Error crawling element ${element.id}:`, error);
          results.push({
            elementId: element.id,
            selector: element.selector,
            text: element.text,
            gifUrl: '',
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      await page.close();
      return results;
      
    } catch (error) {
      console.error('Error in pre-crawl:', error);
      throw error;
    }
  }

  private async crawlElement(page: Page, element: any, url: string): Promise<PreCrawlResult> {
    try {
      // Find and interact with the element
      let elementHandle = await page.$(element.selector);
      
      // If specific selector fails, try alternative approaches
      if (!elementHandle) {
        // Try finding by text content
        const locator = page.locator(`text=${element.text}`).first();
        elementHandle = await locator.elementHandle();
      }
      
      if (!elementHandle) {
        // Try finding by partial text
        const locator = page.locator(`text=${element.text.split(' ')[0]}`).first();
        elementHandle = await locator.elementHandle();
      }
      
      if (!elementHandle) {
        throw new Error(`Element not found: ${element.selector} (text: ${element.text})`);
      }

      // Scroll element into view
      await elementHandle.scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);

      // Click the element
      await elementHandle.click();
      
      // Wait for any animations or state changes
      await page.waitForTimeout(1000);
      
      // Take screenshot after click to show the result
      const screenshot = await page.screenshot({ 
        fullPage: true,
        type: 'png'
      });
      
      // Save screenshot
      const screenshotId = uuidv4();
      const screenshotPath = await this.saveScreenshot(screenshot, `${screenshotId}.png`);
      const screenshotUrl = `/api/screenshot/${screenshotId}`;
      
      return {
        elementId: element.id,
        selector: element.selector,
        text: element.text,
        gifUrl: screenshotUrl, // Reuse gifUrl field for screenshot URL
        status: 'success'
      };
      
    } catch (error) {
      throw new Error(`Failed to crawl element: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async saveScreenshot(screenshot: Buffer, filename: string): Promise<string> {
    const fs = require('fs-extra');
    const path = require('path');
    
    const screenshotsDir = path.join(process.cwd(), 'screenshots');
    await fs.ensureDir(screenshotsDir);
    
    const filePath = path.join(screenshotsDir, filename);
    await fs.writeFile(filePath, screenshot);
    
    return filePath;
  }

  async captureSingleElement(url: string, elementSelector: string, elementText: string): Promise<PreCrawlResult | null> {
    try {
      await this.initializeBrowser();
      if (!this.browser) throw new Error('Browser not initialized');

      const page = await this.browser.newPage();
      
      // Set viewport for consistent screenshots
      await page.setViewportSize({ width: 1280, height: 720 });
      
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Wait for page to fully load
      await page.waitForTimeout(2000);
      
      // Hide any overlays or tooltips that might interfere
      await page.evaluate(() => {
        // Hide common overlay elements
        const overlays = document.querySelectorAll('[data-testid="companion-widget"], .companion-widget, .draggable-companion, .tooltip, [role="tooltip"]');
        overlays.forEach(overlay => {
          (overlay as HTMLElement).style.display = 'none';
        });
      });
      
      // Try to find and click the element
      try {
        const element = await page.locator(elementSelector).first();
        if (await element.count() > 0) {
          // Scroll element into view
          await element.scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);
          
          // Click the element
          await element.click({ timeout: 5000 });
          
          // Wait a bit for any UI changes to happen
          await page.waitForTimeout(1500);
          
          // Take screenshot after the click
          const screenshot = await page.screenshot({ 
            fullPage: true,
            type: 'png'
          });
          
          // Save screenshot
          const screenshotId = uuidv4();
          const screenshotPath = await this.saveScreenshot(screenshot, `${screenshotId}.png`);
          const screenshotUrl = `/api/pre-crawl/screenshot/${screenshotId}`;
          
          const result: PreCrawlResult = {
            elementId: `click_${screenshotId}`,
            selector: elementSelector,
            text: elementText,
            gifUrl: screenshotUrl,
            status: 'success'
          };
          
          // Store the result
          this.results.set(result.elementId, result);
          
          await page.close();
          return result;
        }
      } catch (clickError) {
        console.log(`Could not click element ${elementSelector}, taking page screenshot instead`);
      }
      
      // Fallback: just take a page screenshot if click fails
      const screenshot = await page.screenshot({ 
        fullPage: true,
        type: 'png'
      });
      
      const screenshotId = uuidv4();
      const screenshotPath = await this.saveScreenshot(screenshot, `${screenshotId}.png`);
      const screenshotUrl = `/api/pre-crawl/screenshot/${screenshotId}`;
      
      const result: PreCrawlResult = {
        elementId: `fallback_${screenshotId}`,
        selector: elementSelector,
        text: elementText,
        gifUrl: screenshotUrl,
        status: 'success'
      };
      
      this.results.set(result.elementId, result);
      
      await page.close();
      return result;
      
    } catch (error) {
      console.error('Error capturing single element:', error);
      return null;
    }
  }

  getResult(elementId: string): PreCrawlResult | undefined {
    return this.results.get(elementId);
  }

  getAllResults(): PreCrawlResult[] {
    return Array.from(this.results.values());
  }

  clearResults(): void {
    this.results.clear();
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Export singleton instance
export const preCrawlService = new PreCrawlService();
