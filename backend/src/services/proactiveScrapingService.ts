import { chromium, Browser, Page } from 'playwright';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { gifGenerator } from './gifGenerator';

export interface ClickableElement {
  id: string;
  tag: string;
  text: string;
  selector: string;
  allSelectors?: string[];
  coordinates: [number, number];
  visible: boolean;
  previewId?: string;
  previewUrl?: string;
  attributes?: {
    title?: string | null;
    'aria-label'?: string | null;
    'data-testid'?: string | null;
    'data-cy'?: string | null;
    href?: string | null;
    className?: string;
  };
}

export interface ProactiveScrapeResult {
  url: string;
  elements: ClickableElement[];
  scrapedAt: string;
  totalElements: number;
  successfulPreviews: number;
}

export class ProactiveScrapingService {
  private browser: Browser | null = null;
  private outputDir: string;
  private cache: Map<string, ProactiveScrapeResult> = new Map();

  constructor() {
    this.outputDir = join(process.cwd(), 'proactive-previews');
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

  async scrapePageProactively(url: string): Promise<ProactiveScrapeResult> {
    try {
      // Check cache first
      const cached = this.cache.get(url);
      if (cached) {
        console.log(`Using cached proactive scrape for ${url}`);
        return cached;
      }

      await this.initializeBrowser();
      if (!this.browser) throw new Error('Browser not initialized');

      const page = await this.browser.newPage();
      
      try {
        // Navigate to the page
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        
        // Get all clickable elements
        const elements = await this.getClickableElements(page);
        console.log(`Found ${elements.length} clickable elements on ${url}`);

        // Process each element to generate previews
        const processedElements = await this.processElementsForPreviews(page, elements, url);
        
        const result: ProactiveScrapeResult = {
          url,
          elements: processedElements,
          scrapedAt: new Date().toISOString(),
          totalElements: elements.length,
          successfulPreviews: processedElements.filter(e => e.previewId).length
        };

        // Cache the result
        this.cache.set(url, result);
        
        console.log(`Proactive scrape completed for ${url}: ${result.successfulPreviews}/${result.totalElements} previews generated`);
        return result;

      } finally {
        await page.close();
      }

    } catch (error) {
      console.error(`Error in proactive scraping for ${url}:`, error);
      throw error;
    }
  }

  private async getClickableElements(page: Page): Promise<ClickableElement[]> {
    const elements = await page.evaluate(() => {
      // More comprehensive element detection
      const clickableElements = document.querySelectorAll(
        'button, a, input[type="button"], input[type="submit"], input[type="reset"], ' +
        '[onclick], [role="button"], [data-action], .clickable, .btn, .button, ' +
        '[title], [aria-label], [data-testid], [data-cy], [data-test], ' +
        'input[type="checkbox"], input[type="radio"], select, textarea, ' +
        '[tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
      );
      
      return Array.from(clickableElements).map((el, index) => {
        const rect = el.getBoundingClientRect();
        const id = el.id || `element-${index}`;
        
        // Generate multiple selector strategies
        const selectors = [];
        
        // ID selector
        if (el.id) selectors.push(`#${el.id}`);
        
        // Class selectors
        if (el.className) {
          const classes = el.className.split(' ').filter(c => c.trim());
          classes.forEach(cls => selectors.push(`.${cls}`));
        }
        
        // Attribute selectors
        if (el.getAttribute('title')) selectors.push(`[title="${el.getAttribute('title')}"]`);
        if (el.getAttribute('aria-label')) selectors.push(`[aria-label="${el.getAttribute('aria-label')}"]`);
        if (el.getAttribute('data-testid')) selectors.push(`[data-testid="${el.getAttribute('data-testid')}"]`);
        if (el.getAttribute('data-cy')) selectors.push(`[data-cy="${el.getAttribute('data-cy')}"]`);
        if (el.getAttribute('href')) selectors.push(`[href="${el.getAttribute('href')}"]`);
        
        // Tag + nth-child selector
        selectors.push(`${el.tagName.toLowerCase()}:nth-child(${index + 1})`);
        
        // Use the most specific selector available
        const bestSelector = selectors[0] || `${el.tagName.toLowerCase()}:nth-child(${index + 1})`;
        
        return {
          id,
          tag: el.tagName.toLowerCase(),
          text: el.textContent?.trim().substring(0, 50) || '',
          selector: bestSelector,
          allSelectors: selectors, // Store all possible selectors
          coordinates: [Math.round(rect.left + rect.width / 2), Math.round(rect.top + rect.height / 2)],
          visible: rect.width > 0 && rect.height > 0 && rect.top >= 0,
          attributes: {
            title: el.getAttribute('title'),
            'aria-label': el.getAttribute('aria-label'),
            'data-testid': el.getAttribute('data-testid'),
            'data-cy': el.getAttribute('data-cy'),
            href: el.getAttribute('href'),
            className: el.className
          }
        };
      }).filter(el => el.visible && (el.text.length > 0 || el.attributes.title || el.attributes['aria-label']));
    });

    // Convert coordinates to proper tuple type
    return elements.map(el => ({
      ...el,
      coordinates: [el.coordinates[0], el.coordinates[1]] as [number, number]
    }));
  }

  private async processElementsForPreviews(
    page: Page, 
    elements: ClickableElement[], 
    baseUrl: string
  ): Promise<ClickableElement[]> {
    const processedElements: ClickableElement[] = [];
    
    for (const element of elements) {
      try {
        console.log(`Processing element: ${element.text} (${element.selector})`);
        
        // Take screenshot before click (full page to capture any existing panels)
        const beforeScreenshot = await page.screenshot({ fullPage: true });
        
        // Try to click the element
        let clickSuccessful = false;
        try {
          // Scroll element into view
          await page.evaluate((selector) => {
            const el = document.querySelector(selector);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, element.selector);
          
          await page.waitForTimeout(500); // Wait for scroll
          
          // Try multiple click methods
          const clickMethods = [
            () => page.click(element.selector),
            () => page.locator(element.selector).click(),
            () => page.evaluate((sel) => {
              const el = document.querySelector(sel) as HTMLElement;
              if (el) el.click();
            }, element.selector),
            () => page.mouse.click(element.coordinates[0], element.coordinates[1])
          ];
          
          for (const clickMethod of clickMethods) {
            try {
              await clickMethod();
              clickSuccessful = true;
              break;
            } catch (e) {
              console.warn(`Click method failed for ${element.selector}:`, e);
            }
          }
          
        } catch (error) {
          console.warn(`Failed to click element ${element.selector}:`, error);
        }
        
        if (clickSuccessful) {
          // Wait for page to respond and any animations/transitions
          await page.waitForTimeout(2000);
          
          // Try to wait for specific UI elements that might appear (panels, modals, etc.)
          try {
            await page.waitForSelector('.fixed, .absolute, [role="dialog"], .z-50, .z-40', { 
              timeout: 2000 
            }).catch(() => {
              // No specific elements appeared, that's okay
            });
          } catch (e) {
            // Continue anyway
          }
          
          // Wait a bit more for animations to complete
          await page.waitForTimeout(1000);
          
          // Take screenshot after click (full page to capture panels that opened)
          const afterScreenshot = await page.screenshot({ fullPage: true });
          
          // Check if something actually changed
          if (!this.screenshotsAreIdentical(beforeScreenshot, afterScreenshot)) {
            // Generate preview
            const previewId = uuidv4();
            const previewPath = await this.generateElementPreview(
              beforeScreenshot, 
              afterScreenshot, 
              previewId,
              element
            );
            
            processedElements.push({
              ...element,
              previewId,
              previewUrl: `/api/element-preview/${previewId}`
            });
            
            console.log(`Generated preview for ${element.text}: ${previewId}`);
          } else {
            // For internal buttons that don't change the page, try to detect UI changes
            console.log(`No page change detected for ${element.text}, checking for UI changes...`);
            
            // Check if any modals, panels, or overlays appeared
            const hasUIChanges = await page.evaluate(() => {
              // Look for common UI change indicators
              const modals = document.querySelectorAll('[role="dialog"], .modal, .overlay, .panel, .fixed, .absolute');
              const visibleModals = Array.from(modals).filter(el => 
                el instanceof HTMLElement && 
                el.offsetParent !== null && 
                getComputedStyle(el).display !== 'none' &&
                getComputedStyle(el).opacity !== '0'
              );
              
              // Check for new content that appeared (including React components)
              const newContent = document.querySelectorAll('.animate-in, .fade-in, .slide-in, [data-state="open"], .z-50, .z-40');
              const visibleNewContent = Array.from(newContent).filter(el => 
                el instanceof HTMLElement && 
                el.offsetParent !== null &&
                getComputedStyle(el).opacity !== '0'
              );
              
              // Check for any elements with high z-index that might be overlays
              const overlays = document.querySelectorAll('[style*="z-index: 50"], [style*="z-index: 40"], [class*="z-50"], [class*="z-40"]');
              const visibleOverlays = Array.from(overlays).filter(el => 
                el instanceof HTMLElement && 
                el.offsetParent !== null &&
                getComputedStyle(el).opacity !== '0'
              );
              
              return visibleModals.length > 0 || visibleNewContent.length > 0 || visibleOverlays.length > 0;
            });
            
            if (hasUIChanges) {
              // Generate preview even for UI changes
              const previewId = uuidv4();
              const previewPath = await this.generateElementPreview(
                beforeScreenshot, 
                afterScreenshot, 
                previewId,
                element
              );
              
              processedElements.push({
                ...element,
                previewId,
                previewUrl: `/api/element-preview/${previewId}`
              });
              
              console.log(`Generated preview for UI change in ${element.text}: ${previewId}`);
            } else {
              console.log(`No visual change detected for ${element.text}`);
              processedElements.push(element);
            }
          }
        } else {
          console.log(`Could not click ${element.text}, skipping preview`);
          processedElements.push(element);
        }
        
        // Navigate back to original page if needed
        if (clickSuccessful) {
          try {
            await page.goBack();
            await page.waitForLoadState('networkidle');
          } catch (e) {
            // If we can't go back, reload the page
            await page.goto(baseUrl, { waitUntil: 'networkidle' });
          }
        }
        
      } catch (error) {
        console.error(`Error processing element ${element.text}:`, error);
        processedElements.push(element);
      }
    }
    
    return processedElements;
  }

  private screenshotsAreIdentical(a: Buffer, b: Buffer): boolean {
    if (!a || !b || a.length !== b.length) return false;
    
    // Simple byte comparison - could be optimized with image diffing
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  private async generateElementPreview(
    beforeScreenshot: Buffer,
    afterScreenshot: Buffer,
    previewId: string,
    element: ClickableElement
  ): Promise<string> {
    try {
      // Generate GIF showing the transition
      const gifBuffer = await gifGenerator.generateGif(beforeScreenshot, afterScreenshot, {
        width: 800,
        height: 600,
        quality: 80,
        delay: 1000
      });
      
      // Save preview
      const filename = `${previewId}.gif`;
      const previewPath = join(this.outputDir, filename);
      writeFileSync(previewPath, gifBuffer);
      
      return previewPath;
    } catch (error) {
      console.error(`Error generating preview for ${element.text}:`, error);
      throw error;
    }
  }

  getElementPreview(previewId: string): string | null {
    const previewPath = join(this.outputDir, `${previewId}.gif`);
    return existsSync(previewPath) ? previewPath : null;
  }

  getCachedResult(url: string): ProactiveScrapeResult | null {
    return this.cache.get(url) || null;
  }

  clearCache(): void {
    this.cache.clear();
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const proactiveScrapingService = new ProactiveScrapingService();
