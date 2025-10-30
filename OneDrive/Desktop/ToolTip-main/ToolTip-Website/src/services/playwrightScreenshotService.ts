import { chromium, Browser, Page } from 'playwright';

interface ScreenshotOptions {
  url: string;
  selector?: string;
  coordinates?: [number, number];
  waitTime?: number;
  width?: number;
  height?: number;
}

interface ScreenshotResult {
  success: boolean;
  imageData?: string;
  error?: string;
}

class PlaywrightScreenshotService {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async takeScreenshot(options: ScreenshotOptions): Promise<ScreenshotResult> {
    try {
      await this.initialize();
      
      if (!this.browser) {
        throw new Error('Browser not initialized');
      }

      const page = await this.browser.newPage();
      
      // Set viewport size
      await page.setViewportSize({
        width: options.width || 1200,
        height: options.height || 800
      });

      // Navigate to the page
      await page.goto(options.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Wait for the page to load
      await page.waitForTimeout(1000);

      let screenshotData: Buffer;

      if (options.selector) {
        // Take screenshot of specific element
        const element = await page.$(options.selector);
        if (!element) {
          throw new Error(`Element not found: ${options.selector}`);
        }
        
        screenshotData = await element.screenshot({
          type: 'png',
          quality: 90
        });
      } else if (options.coordinates) {
        // Click at coordinates and take screenshot
        await page.mouse.click(options.coordinates[0], options.coordinates[1]);
        await page.waitForTimeout(options.waitTime || 2000);
        
        screenshotData = await page.screenshot({
          type: 'png',
          quality: 90,
          fullPage: false
        });
      } else {
        // Take full page screenshot
        screenshotData = await page.screenshot({
          type: 'png',
          quality: 90,
          fullPage: true
        });
      }

      await page.close();

      // Convert to base64 data URL
      const base64 = screenshotData.toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;

      return {
        success: true,
        imageData: dataUrl
      };

    } catch (error) {
      console.error('Screenshot error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async takeAfterScreenshot(options: ScreenshotOptions): Promise<ScreenshotResult> {
    try {
      await this.initialize();
      
      if (!this.browser) {
        throw new Error('Browser not initialized');
      }

      const page = await this.browser.newPage();
      
      // Set viewport size
      await page.setViewportSize({
        width: options.width || 1200,
        height: options.height || 800
      });

      // Navigate to the page
      await page.goto(options.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Wait for the page to load
      await page.waitForTimeout(1000);

      let screenshotData: Buffer;

      if (options.selector) {
        // Click the element and take screenshot
        const element = await page.$(options.selector);
        if (!element) {
          throw new Error(`Element not found: ${options.selector}`);
        }
        
        // Click the element
        await element.click();
        
        // Wait for any animations or state changes
        await page.waitForTimeout(options.waitTime || 2000);
        
        // Take screenshot of the element after click
        screenshotData = await element.screenshot({
          type: 'png',
          quality: 90
        });
      } else if (options.coordinates) {
        // Click at coordinates and take screenshot
        await page.mouse.click(options.coordinates[0], options.coordinates[1]);
        await page.waitForTimeout(options.waitTime || 2000);
        
        screenshotData = await page.screenshot({
          type: 'png',
          quality: 90,
          fullPage: false
        });
      } else {
        // Take full page screenshot
        screenshotData = await page.screenshot({
          type: 'png',
          quality: 90,
          fullPage: true
        });
      }

      await page.close();

      // Convert to base64 data URL
      const base64 = screenshotData.toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;

      return {
        success: true,
        imageData: dataUrl
      };

    } catch (error) {
      console.error('After screenshot error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const playwrightScreenshotService = new PlaywrightScreenshotService();
export default playwrightScreenshotService;
