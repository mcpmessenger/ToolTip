import { chromium, Browser, Page } from 'playwright';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { gifGenerator } from './gifGenerator';

export interface CrawlRequest {
  url: string;
  element_selector?: string;
  element_text?: string;
  coordinates?: [number, number];
  wait_time?: number;
}

export interface CrawlStatus {
  crawl_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  gif_available?: boolean;
  gif_url?: string;
  loading_gif_url?: string;
  error?: string;
  progress?: number;
}

export class GifService {
  private browser: Browser | null = null;
  private activeCrawls: Map<string, CrawlStatus> = new Map();
  private outputDir: string;

  constructor() {
    this.outputDir = join(process.cwd(), 'gifs');
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async initializeBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async startCrawl(request: CrawlRequest): Promise<string> {
    const crawlId = uuidv4();
    
    // Initialize crawl status
    this.activeCrawls.set(crawlId, {
      crawl_id: crawlId,
      status: 'pending',
      gif_available: false,
      progress: 0
    });

    // Start processing asynchronously
    this.processCrawl(crawlId, request).catch(error => {
      console.error(`Crawl ${crawlId} failed:`, error);
      this.activeCrawls.set(crawlId, {
        crawl_id: crawlId,
        status: 'failed',
        error: error.message,
        gif_available: false
      });
    });

    return crawlId;
  }

  private async processCrawl(crawlId: string, request: CrawlRequest): Promise<void> {
    try {
      // Update status to processing
      this.activeCrawls.set(crawlId, {
        ...this.activeCrawls.get(crawlId)!,
        status: 'processing',
        progress: 10
      });

      await this.initializeBrowser();
      if (!this.browser) throw new Error('Browser not initialized');

      const page = await this.browser.newPage();
      
      try {
        // Navigate to the page
        await page.goto(request.url, { waitUntil: 'networkidle', timeout: 30000 });
        
        this.activeCrawls.set(crawlId, {
          ...this.activeCrawls.get(crawlId)!,
          progress: 30
        });

        // Take initial screenshot
        const beforeScreenshot = await page.screenshot({ fullPage: false });
        
        this.activeCrawls.set(crawlId, {
          ...this.activeCrawls.get(crawlId)!,
          progress: 50
        });

        // Find and interact with the target element using a robust sequence
        let element = null;
        let elementFound = false;

        // Try to find element by selector first
        if (request.element_selector) {
          try {
            element = await page.$(request.element_selector);
            if (element) {
              console.log(`Crawl ${crawlId}: Found element by selector: ${request.element_selector}`);
              elementFound = true;
            }
          } catch (e) {
            console.warn(`Crawl ${crawlId}: Failed to find element by selector:`, e);
          }
        }

        // Try to find element by text if selector didn't work
        if (!elementFound && request.element_text) {
          try {
            const textElements = await page.$$('*');
            for (const el of textElements) {
              const text = await el.textContent();
              if (text && text.trim().includes(request.element_text.trim())) {
                element = el;
                console.log(`Crawl ${crawlId}: Found element by text: "${request.element_text}"`);
                elementFound = true;
                break;
              }
            }
          } catch (e) {
            console.warn(`Crawl ${crawlId}: Failed to find element by text:`, e);
          }
        }

        // If we found an element, interact with it
        if (element && elementFound) {
          try {
            // Scroll into view and focus
            await element.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500); // Wait for scroll to complete
            
            // Get bounding box and click at center
            const box = await element.boundingBox();
            if (box) {
              const cx = box.x + box.width / 2;
              const cy = box.y + box.height / 2;
              
              console.log(`Crawl ${crawlId}: Clicking element at coordinates: ${cx}, ${cy}`);
              
              // Move mouse to element and click
              await page.mouse.move(cx, cy, { steps: 10 });
              await page.waitForTimeout(200);
              await page.mouse.down();
              await page.waitForTimeout(100);
              await page.mouse.up();
              
              // Also try synthetic click events
              await page.evaluate((el) => {
                if (el) {
                  // Create and dispatch click event
                  const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    clientX: el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2,
                    clientY: el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2
                  });
                  el.dispatchEvent(clickEvent);
                }
              }, element);
            }
          } catch (e) {
            console.warn(`Crawl ${crawlId}: Element interaction failed:`, e);
          }
        } else if (request.coordinates) {
          // Fallback to coordinate clicking
          console.log(`Crawl ${crawlId}: Clicking at coordinates: ${request.coordinates[0]}, ${request.coordinates[1]}`);
          await page.mouse.move(request.coordinates[0], request.coordinates[1]);
          await page.waitForTimeout(200);
          await page.mouse.down();
          await page.waitForTimeout(100);
          await page.mouse.up();
        } else {
          console.warn(`Crawl ${crawlId}: No element found and no coordinates provided`);
        }

        // Wait for the page to respond
        const waitTime = request.wait_time || 2.0;
        await page.waitForTimeout(waitTime * 1000);

        this.activeCrawls.set(crawlId, {
          ...this.activeCrawls.get(crawlId)!,
          progress: 70
        });

        // Take after screenshot
        let afterScreenshot = await page.screenshot({ fullPage: false });

        // If after screenshot is identical or nearly identical to before, try synthetic event and retry
        const buffersEqual = (a: Buffer, b: Buffer) => {
          if (!a || !b) return false;
          if (a.length !== b.length) return false;
          // simple byte equality – cheap check
          for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
          }
          return true;
        };

        if (buffersEqual(beforeScreenshot, afterScreenshot)) {
          // Try a synthetic click event dispatch as some sites rely on event delegation
          try {
            const attempts = 2;
            for (let attempt = 0; attempt < attempts; attempt++) {
              // Dispatch synthetic click or coordinate click
              console.log(`Crawl ${crawlId}: synthetic click attempt ${attempt + 1}/${attempts}`);
              if (request.element_selector) {
                await page.evaluate((sel) => {
                  const el = document.querySelector(sel) as HTMLElement | null;
                  if (el) {
                    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                  }
                }, request.element_selector).catch(() => {});
              } else if (request.element_text) {
                await page.evaluate((text) => {
                  const el = Array.from(document.querySelectorAll('*')).find(n => n.textContent && n.textContent.trim().includes(text)) as HTMLElement | undefined;
                  if (el) el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                }, request.element_text).catch(() => {});
              } else if (request.coordinates) {
                await page.mouse.click(request.coordinates[0], request.coordinates[1]).catch(() => {});
              }

              // Wait longer on each attempt
              const waitSeconds = (request.wait_time || 2.0) * (attempt + 1);
              await page.waitForTimeout(waitSeconds * 1000);

              // Retry screenshot
              afterScreenshot = await page.screenshot({ fullPage: false });

              if (!buffersEqual(beforeScreenshot, afterScreenshot)) {
                console.log(`Crawl ${crawlId}: afterScreenshot changed on attempt ${attempt + 1}`);
                break;
              }
            }
          } catch (e) {
            console.warn('Synthetic click attempt failed:', e);
          }
        }
        if (buffersEqual(beforeScreenshot, afterScreenshot)) {
          console.log(`Crawl ${crawlId}: afterScreenshot still identical to before after synthetic attempts`);
          try {
            const debugBefore = join(this.outputDir, `${crawlId}_debug_before.png`);
            const debugAfter = join(this.outputDir, `${crawlId}_debug_after.png`);
            writeFileSync(debugBefore, beforeScreenshot);
            writeFileSync(debugAfter, afterScreenshot);
            console.log(`Crawl ${crawlId}: wrote debug images to ${debugBefore} and ${debugAfter}`);
          } catch (e) {
            console.warn('Failed to write debug images:', e);
          }
        }
        
        this.activeCrawls.set(crawlId, {
          ...this.activeCrawls.get(crawlId)!,
          progress: 90
        });

        // Generate GIF
        const gifPath = await this.generateGif(beforeScreenshot, afterScreenshot, crawlId);
        const loadingGifPath = await this.generateLoadingGif(crawlId);

        // Update status to completed
        this.activeCrawls.set(crawlId, {
          crawl_id: crawlId,
          status: 'completed',
          gif_available: true,
          gif_url: `/api/gif/${crawlId}`,
          loading_gif_url: `/api/loading-gif/${crawlId}`,
          progress: 100
        });

      } finally {
        await page.close();
      }

    } catch (error) {
      console.error(`Error processing crawl ${crawlId}:`, error);
      this.activeCrawls.set(crawlId, {
        crawl_id: crawlId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        gif_available: false
      });
    }
  }

  private async generateGif(beforeScreenshot: Buffer, afterScreenshot: Buffer, crawlId: string): Promise<string> {
    try {
      // Generate actual GIF using the gifGenerator
      const gifBuffer = await gifGenerator.generateGif(beforeScreenshot, afterScreenshot, {
        width: 800,
        height: 600,
        quality: 80,
        delay: 1000
      });
      
      // Save GIF to file
      const filename = `${crawlId}.gif`;
      const imagePath = await gifGenerator.saveGif(gifBuffer, filename);
      
      return imagePath;
    } catch (error) {
      console.error('Error generating GIF:', error);
      throw error;
    }
  }

  private async generateLoadingGif(crawlId: string): Promise<string> {
    try {
      // Generate animated loading GIF
      const gifBuffer = await gifGenerator.generateLoadingGif({
        width: 200,
        height: 200,
        quality: 70,
        delay: 150
      });
      
      // Save loading GIF to file
      const filename = `${crawlId}_loading.gif`;
      const imagePath = await gifGenerator.saveGif(gifBuffer, filename);
      
      return imagePath;
    } catch (error) {
      console.error('Error generating loading GIF:', error);
      throw error;
    }
  }

  getCrawlStatus(crawlId: string): CrawlStatus | null {
    return this.activeCrawls.get(crawlId) || null;
  }

  getGifPath(crawlId: string): string | null {
    const gifPath = join(this.outputDir, `${crawlId}.gif`);
    return existsSync(gifPath) ? gifPath : null;
  }

  getLoadingGifPath(crawlId: string): string | null {
    const loadingPath = join(this.outputDir, `${crawlId}_loading.gif`);
    return existsSync(loadingPath) ? loadingPath : null;
  }

  async getPageElements(url: string): Promise<any[]> {
    try {
      await this.initializeBrowser();
      if (!this.browser) throw new Error('Browser not initialized');

      const page = await this.browser.newPage();
      
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        
        // Extract clickable elements
        const elements = await page.evaluate(() => {
          const clickableElements = document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [onclick], [role="button"]');
          
          return Array.from(clickableElements).map((el, index) => {
            const rect = el.getBoundingClientRect();
            return {
              index,
              tag: el.tagName.toLowerCase(),
              text: el.textContent?.trim().substring(0, 50) || '',
              selector: el.id ? `#${el.id}` : 
                       el.className ? `.${el.className.split(' ')[0]}` : 
                       `${el.tagName.toLowerCase()}:nth-child(${index + 1})`,
              coordinates: [Math.round(rect.left + rect.width / 2), Math.round(rect.top + rect.height / 2)],
              visible: rect.width > 0 && rect.height > 0
            };
          }).filter(el => el.visible);
        });

        return elements;
      } finally {
        await page.close();
      }
    } catch (error) {
      console.error('Error getting page elements:', error);
      return [];
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const gifService = new GifService();
