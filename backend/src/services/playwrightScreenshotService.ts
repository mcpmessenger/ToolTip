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
        // Click the element and take screenshot — handle cases where click navigates
        const element = await page.$(options.selector);
        if (!element) {
          throw new Error(`Element not found: ${options.selector}`);
        }

        // Record URL before click so we can detect navigation (works for full navigation and SPA route changes)
        const beforeUrl = page.url();

        try {
          // Perform the click. If it triggers navigation, the URL will change; otherwise page will stay the same.
          await element.click({ timeout: 3000 }).catch(() => {});
        } catch (e) {
          // ignore click errors
        }

        // Wait briefly for any navigation or UI updates
        await page.waitForTimeout(options.waitTime || 2000);

        const afterUrl = page.url();
        const navigated = beforeUrl !== afterUrl;

        if (navigated) {
          // The click caused navigation or SPA route change — capture the resulting page
          try {
            // Wait a short while for the new page to settle
            await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
          } catch (e) {
            // ignore
          }

          screenshotData = await page.screenshot({
            type: 'png',
            quality: 90,
            fullPage: true
          });
        } else {
          // Try to screenshot the element (re-select in case it was re-rendered)
          const elementAfter = await page.$(options.selector);
          if (elementAfter) {
            try {
              screenshotData = await elementAfter.screenshot({
                type: 'png',
                quality: 90
              });
            } catch (e) {
              // Element screenshot failed (maybe detached) — fallback to a viewport screenshot
              screenshotData = await page.screenshot({ type: 'png', quality: 90, fullPage: false });
            }
          } else {
            // Element not found after click — just capture the viewport
            screenshotData = await page.screenshot({ type: 'png', quality: 90, fullPage: false });
          }
        }
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
