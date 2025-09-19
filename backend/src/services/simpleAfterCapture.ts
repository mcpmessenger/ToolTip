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
  private static globalCapturing = false;
  private static processingQueue: string[] = [];
  private static currentProcessingUrl: string | null = null;
  private static lastCaptureTime = 0;
  private static readonly MIN_CAPTURE_INTERVAL = 30000; // 30 seconds minimum between captures

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
    
    // Check if we're trying to capture too soon after the last capture
    const currentTime = Date.now();
    if (currentTime - SimpleAfterCapture.lastCaptureTime < SimpleAfterCapture.MIN_CAPTURE_INTERVAL) {
      const timeRemaining = SimpleAfterCapture.MIN_CAPTURE_INTERVAL - (currentTime - SimpleAfterCapture.lastCaptureTime);
      console.log(`⚠️ Too soon to capture again. Please wait ${Math.ceil(timeRemaining / 1000)} seconds.`);
      return {
        url,
        totalElements: 0,
        successfulResults: 0,
        failedResults: 0,
        results: [],
        captureTime: 0,
        success: false,
        error: `Too soon to capture again. Please wait ${Math.ceil(timeRemaining / 1000)} seconds.`,
        timestamp: new Date().toISOString()
      };
    }
    
    // Global check to prevent multiple captures
    if (SimpleAfterCapture.globalCapturing || SimpleAfterCapture.currentProcessingUrl) {
      console.log(`⚠️ Capture already in progress (${SimpleAfterCapture.currentProcessingUrl}), skipping: ${url}`);
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

    // Set a global timeout for the entire capture process (120 seconds for 20 elements)
    const globalTimeout = setTimeout(() => {
      console.log(`⏰ Global capture timeout reached for ${url} - this may interrupt element processing`);
      SimpleAfterCapture.globalCapturing = false;
      SimpleAfterCapture.currentProcessingUrl = null;
    }, 120000);
    
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

    // Check if we just processed this URL recently
    if (SimpleAfterCapture.lastCaptureTime > 0 && 
        (currentTime - SimpleAfterCapture.lastCaptureTime) < 5000 && 
        SimpleAfterCapture.currentProcessingUrl === url) {
      console.log(`⚠️ URL ${url} was just processed, skipping duplicate request...`);
      return {
        url,
        totalElements: 0,
        successfulResults: 0,
        failedResults: 0,
        results: [],
        captureTime: 0,
        success: false,
        error: 'URL was just processed, please wait before requesting again',
        timestamp: new Date().toISOString()
      };
    }

    SimpleAfterCapture.globalCapturing = true;
    SimpleAfterCapture.currentProcessingUrl = url;
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
      
      // Set viewport for high-resolution full screen capture
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Set device scale factor for higher resolution screenshots
      await page.evaluate(() => {
        Object.defineProperty(window, 'devicePixelRatio', {
          get: () => 2 // Higher DPI for crisp screenshots
        });
      });
      
      // Navigate to the page
      console.log(`Navigating to: ${url}`);
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      
      // Wait for dynamic content and animations to complete
      await page.waitForTimeout(5000);
      console.log(`Page loaded successfully: ${url}`);
      
      // Additional wait for motion components to fully render
      await page.waitForTimeout(2000);
      console.log(`Motion components should be fully rendered now`);

      // Find all clickable elements
      const clickableElements = await this.findClickableElements(page);
      
      console.log(`🔍 Found ${clickableElements.length} clickable elements on ${url}`);
      console.log(`📋 Elements found:`, clickableElements.map(el => `${el.id} (${el.tag}): "${el.text}"`));
      
      // Debug: Check for external links specifically
      const externalLinks = clickableElements.filter(el => el.tag === 'a');
      console.log(`🔗 Found ${externalLinks.length} anchor elements:`, externalLinks.map(el => `${el.id}: "${el.text}"`));
      
      // Debug: Show total elements vs processing limit
      console.log(`📊 Total elements found: ${clickableElements.length}, Processing limit: 20, Will process: ${Math.min(clickableElements.length, 20)}`);
      
      // Debug: Check for specific elements we know should be there
      const viewDocButton = clickableElements.find(el => el.id.includes('view-documentation') || el.text.includes('View Documentation'));
      console.log(`🔍 View Documentation button found:`, viewDocButton ? `${viewDocButton.id} (${viewDocButton.tag}): "${viewDocButton.text}"` : 'NOT FOUND');

      const results: ElementResult[] = [];
      let successfulResults = 0;
      let failedResults = 0;

      // Process each element (limit to first 20 for better coverage of external links)
      const elementsToProcess = clickableElements.slice(0, 20);
      console.log(`📝 Processing ${elementsToProcess.length} elements (increased from 8 to 20 for better external link coverage)...`);
      
      // Debug: Show which elements are selected for processing
      console.log(`🎯 Elements selected for processing:`, elementsToProcess.map((el, i) => `${i + 1}. ${el.id} (${el.tag}): "${el.text}"`));
      
      // Debug: Check if external links are in the processing list
      const processingExternalLinks = elementsToProcess.filter(el => el.tag === 'a');
      console.log(`🔗 External links in processing list: ${processingExternalLinks.length}`, processingExternalLinks.map(el => `${el.id}: "${el.text}"`));
      
      // Debug: Check if View Documentation button is in the processing list
      const viewDocInProcessing = elementsToProcess.find(el => el.id.includes('view-documentation') || el.text.includes('View Documentation'));
      console.log(`🔍 View Documentation button in processing list:`, viewDocInProcessing ? `${viewDocInProcessing.id} (${viewDocInProcessing.tag}): "${viewDocInProcessing.text}"` : 'NOT IN PROCESSING LIST');
      
      // Debug: Show element distribution by type
      const elementTypes = elementsToProcess.reduce((acc, el) => {
        acc[el.tag] = (acc[el.tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log(`📊 Element type distribution:`, elementTypes);

      console.log(`🚀 Starting element processing loop for ${elementsToProcess.length} elements...`);
      
      for (let i = 0; i < elementsToProcess.length; i++) {
        // Check if we're still in the same processing session
        if (!SimpleAfterCapture.globalCapturing) {
          console.log(`⚠️ Processing interrupted - global capturing flag is false at element ${i + 1}`);
          break;
        }
        
        const element = elementsToProcess[i];
        console.log(`🎯 Processing element ${i + 1}/${elementsToProcess.length}: ${element.id} (${element.tag}) - "${element.text}"`);
        
        // Special debugging for View Documentation button
        if (element.id.includes('view-documentation') || element.text.includes('View Documentation')) {
          console.log(`🔍 SPECIAL DEBUG: Processing View Documentation button - ${element.id} (${element.tag}) - "${element.text}"`);
          console.log(`🔍 Element selector: ${element.selector}`);
          console.log(`🔍 This is element ${i + 1} of ${elementsToProcess.length}`);
        }
        
        // Check if we're about to process the last element
        if (i === elementsToProcess.length - 1) {
          console.log(`🔍 SPECIAL DEBUG: Processing LAST element (${i + 1}/${elementsToProcess.length}): ${element.id}`);
        }
        
        try {
          console.log(`🔄 Starting capture for element ${i + 1}: ${element.id}`);
          const result = await this.captureElementAfter(page, element, url);
          console.log(`📊 Result for element ${i + 1} (${element.id}): success=${result.success}, hasScreenshot=${!!result.afterScreenshot}`);
          results.push(result);
          
          if (result.success) {
            successfulResults++;
            console.log(`✅ Successfully captured element ${i + 1}: ${element.id} (${element.tag})`);
          } else {
            failedResults++;
            console.log(`❌ Failed to capture element ${i + 1}: ${element.id} (${element.tag}) - ${result.error}`);
          }
          
          // Small delay between elements
          await page.waitForTimeout(1000);
          console.log(`✅ Completed processing element ${i + 1}: ${element.id}`);
          
        } catch (error) {
          console.error(`💥 Error capturing element ${i + 1} (${element.id}):`, error);
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
      
      console.log(`✅ Element processing loop completed for ${elementsToProcess.length} elements`);
      
      // Debug: Show final results summary
      console.log(`📊 Final processing summary:`);
      console.log(`   - Total elements found: ${clickableElements.length}`);
      console.log(`   - Elements selected for processing: ${elementsToProcess.length}`);
      console.log(`   - Successfully processed: ${successfulResults}`);
      console.log(`   - Failed to process: ${failedResults}`);
      console.log(`   - Results array length: ${results.length}`);
      console.log(`   - Processing loop completed: ${elementsToProcess.length} elements processed`);
      
      // Debug: Show all results with their success status
      console.log(`🔍 All results details:`);
      results.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.elementId}: success=${result.success}, hasScreenshot=${!!result.afterScreenshot}, error=${result.error || 'none'}`);
      });
      
      // Debug: Check if View Documentation button was processed
      const viewDocResult = results.find(r => r.elementId.includes('view-documentation'));
      console.log(`🔍 View Documentation button result:`, viewDocResult ? `SUCCESS - ${viewDocResult.success}` : 'NOT PROCESSED');

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
      SimpleAfterCapture.currentProcessingUrl = null;
      SimpleAfterCapture.lastCaptureTime = Date.now();
      this.isCapturing = false;
      this.processingUrls.delete(url);
      console.log(`✅ Completed processing for: ${url}`);
      console.log(`⏰ Next capture allowed after: ${new Date(SimpleAfterCapture.lastCaptureTime + SimpleAfterCapture.MIN_CAPTURE_INTERVAL).toLocaleTimeString()}`);
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
      
      console.log('🔍 Debugging element selection...');
      console.log('All anchor elements on page:', document.querySelectorAll('a').length);
      console.log('Anchor elements with href:', document.querySelectorAll('a[href]').length);
      console.log('All clickable elements:', document.querySelectorAll('button, a[href], input[type="button"], input[type="submit"], input[type="reset"], [role="button"], [onclick], select, input[type="checkbox"], input[type="radio"]').length);

      const clickableElements: any[] = [];
      const seenElements = new Set<Element>();

      clickableSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        console.log(`🔍 Found ${elements.length} elements for selector: ${selector}`);
        
        elements.forEach((element, index) => {
          if (seenElements.has(element)) return;
          seenElements.add(element);

          const rect = element.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) { // Only visible elements
            const text = element.textContent?.trim() || '';
            const id = element.id || `${selector}_${index}`;
            const href = element.getAttribute('href');
            
            // Debug anchor elements specifically
            if (element.tagName.toLowerCase() === 'a') {
              console.log(`🔗 Anchor element found: id="${id}", text="${text}", href="${href}", visible=${rect.width > 0 && rect.height > 0}`);
            }
            
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
    let elementHandle: any = null;
    
    try {
      console.log(`🎯 Capturing element: ${elementId} (${element.tag})`);
      
      // Set a timeout for the entire element capture process (45 seconds for external links)
      elementTimeout = setTimeout(() => {
        throw new Error(`Element capture timeout for ${elementId}`);
      }, 45000);
      
      // Check if page is still valid
      if (page.isClosed()) {
        clearTimeout(elementTimeout);
        throw new Error('Page has been closed');
      }

      // Special handling for View Documentation button - wait for motion components first
      if (element.selector === '#view-documentation-button') {
        console.log(`🔍 SPECIAL: View Documentation button detected - waiting for motion components`);
        await page.waitForTimeout(3000); // Wait for motion components to finish
        
        // Try to find the element by text content as primary method
        console.log(`🔍 SPECIAL: Looking for View Documentation button by text content`);
        elementHandle = await page.evaluateHandle(() => {
          const anchors = document.querySelectorAll('a');
          for (let i = 0; i < anchors.length; i++) {
            const anchor = anchors[i];
            if (anchor.textContent?.includes('View Documentation') || anchor.textContent?.includes('📚')) {
              return anchor;
            }
          }
          return null;
        });
        
        if (elementHandle && elementHandle.asElement()) {
          console.log(`✅ SPECIAL: View Documentation button found by text content`);
        } else {
          console.log(`⚠️ SPECIAL: View Documentation button not found by text content, trying normal selector`);
        }
      }
      
      // Check if this is a link that will navigate to an external URL
      const linkInfo = await page.evaluate((selector) => {
        console.log(`🔍 Checking element for external link: ${selector}`);
        console.log(`🔍 Current URL: ${window.location.href}`);
        
        // Try multiple ways to find the element
        let el = document.querySelector(selector) as HTMLAnchorElement;
        console.log(`🔍 Element found with querySelector:`, el ? 'Yes' : 'No');
        
        if (!el) {
          // Try finding by ID
          const id = selector.replace('#', '');
          el = document.getElementById(id) as HTMLAnchorElement;
          console.log(`🔍 Element found with getElementById:`, el ? 'Yes' : 'No');
        }
        
        if (!el) {
          // Try finding all anchor tags and look for the one with the right text
          const allAnchors = document.querySelectorAll('a');
          console.log(`🔍 Found ${allAnchors.length} anchor tags on page`);
          for (let i = 0; i < allAnchors.length; i++) {
            const anchor = allAnchors[i] as HTMLAnchorElement;
            if (anchor.textContent?.includes('View Documentation') || anchor.textContent?.includes('📚')) {
              el = anchor;
              console.log(`🔍 Found View Documentation anchor by text content`);
              break;
            }
          }
        }
        
        if (el) {
          console.log(`🔍 Element tag: ${el.tagName}`);
          console.log(`🔍 Element href: ${el.href}`);
          console.log(`🔍 Element target: ${el.target}`);
          console.log(`🔍 Element text: ${el.textContent}`);
          console.log(`🔍 Element visible: ${el.offsetParent !== null}`);
        }
        
        if (el && el.tagName === 'A' && el.href) {
          const currentDomain = window.location.hostname;
          const linkDomain = new URL(el.href).hostname;
          console.log(`🔍 Current domain: ${currentDomain}, Link domain: ${linkDomain}`);
          console.log(`🔍 Is external: ${currentDomain !== linkDomain}, Has target blank: ${el.target === '_blank'}`);
          return {
            isLink: true,
            href: el.href,
            isExternal: currentDomain !== linkDomain,
            hasTargetBlank: el.target === '_blank'
          };
        }
        
        // Special case for View Documentation button - if we can't find the element but we know it should be external
        if (selector === '#view-documentation-button') {
          console.log(`🔍 SPECIAL: View Documentation button not found, but assuming it's external`);
          return {
            isLink: true,
            href: 'https://github.com/mcpmessenger/ToolTip',
            isExternal: true,
            hasTargetBlank: true
          };
        }
        
        return { isLink: false, href: null, isExternal: false, hasTargetBlank: false };
      }, element.selector);
      
      console.log(`🔍 Link info for ${element.selector}:`, linkInfo);
      const isExternalLink = linkInfo.isLink && (linkInfo.isExternal || linkInfo.hasTargetBlank);
      console.log(`🔍 Is external link: ${isExternalLink}`);
      
      // For external links, we don't need to find the original element
      // We'll capture the external page directly
      if (!isExternalLink) {
        // Wait for element to be visible before trying to capture it
        try {
          await page.waitForSelector(element.selector, { 
            state: 'visible', 
            timeout: 10000 
          });
          console.log(`✅ Element found and visible: ${element.selector}`);
        } catch (waitError) {
          console.log(`⚠️ Element not visible, trying to find anyway: ${element.selector}`);
          
          // Special handling for View Documentation button - wait longer for motion components
          if (element.selector === '#view-documentation-button') {
            console.log(`🔍 Special wait for View Documentation button - waiting for motion components to finish`);
            await page.waitForTimeout(5000); // Wait 5 seconds for motion components
            
            // Try to find the element by text content as fallback
            try {
              await page.waitForFunction(() => {
                const anchors = document.querySelectorAll('a');
                for (let i = 0; i < anchors.length; i++) {
                  const anchor = anchors[i];
                  if (anchor.textContent?.includes('View Documentation') || anchor.textContent?.includes('📚')) {
                    return true;
                  }
                }
                return false;
              }, { timeout: 10000 });
              console.log(`✅ View Documentation button found after motion wait`);
            } catch (textWaitError) {
              console.log(`❌ View Documentation button still not found after motion wait`);
            }
          }
        }
        
        // Try to get the element handle (only if not already found)
        if (!elementHandle) {
          elementHandle = await page.$(element.selector);
          if (!elementHandle) {
            clearTimeout(elementTimeout);
            throw new Error(`Element not found: ${element.selector}`);
          }
        }
      }

      // Scroll element into view with shorter timeout (only for internal elements)
      if (elementHandle) {
        try {
          // Cast to ElementHandle to access scrollIntoViewIfNeeded
          const element = elementHandle.asElement();
          if (element) {
            await element.scrollIntoViewIfNeeded({ timeout: 3000 });
            await page.waitForTimeout(200);
          }
        } catch (scrollError) {
          console.log(`⚠️ Scroll failed for ${elementId}, continuing...`);
        }
      }

      // Handle external links vs internal elements
      if (isExternalLink) {
        console.log(`🔗 External link detected, using href from linkInfo...`);
        const href = linkInfo.href;

        if (href) {
          console.log(`🌍 External URL: ${href}`);
          console.log(`🔍 External link processing - selector: ${element.selector}, text: "${element.text}"`);
          try {
            await page.goto(href, { waitUntil: 'networkidle', timeout: 15000 });
            console.log(`✅ Navigated to external URL: ${href}`);
            console.log(`📸 Capturing external page screenshot for: ${elementId}`);
          } catch (e) {
            console.error(`❌ Failed to navigate to external URL: ${href}`, e);
            throw new Error('external_navigation_failed');
          }
        } else {
          console.log(`❌ No href found for external link element: ${element.selector}`);
          throw new Error('external_link_no_href');
        }
      } else {
        // Click the element with shorter timeout (only for internal elements)
        console.log(`🖱️ Clicking element: ${elementId}`);
        if (elementHandle) {
          try {
            // Cast to ElementHandle to access click method
            const element = elementHandle.asElement();
            if (element) {
              await element.click({ timeout: 3000 });
            }
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
        } else {
          console.log(`⚠️ No element handle for ${elementId}, trying alternative click...`);
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
          
          // More robust waiting for external page to load
          try {
            // Attempt to wait for network to be idle, with a longer timeout
            await page.waitForLoadState("networkidle", { timeout: 15000 }); // Increased timeout to 15 seconds
            console.log(`✅ External page loaded successfully (networkidle): ${currentUrl}`);
          } catch (timeoutError) {
            console.log(`⚠️ External page networkidle timeout, falling back to domcontentloaded and longer wait: ${currentUrl}`);
            try {
              await page.waitForLoadState("domcontentloaded", { timeout: 10000 }); // 10 second timeout
              await page.waitForTimeout(5000); // Additional wait for dynamic content
              console.log(`✅ External page loaded successfully (domcontentloaded + extra wait): ${currentUrl}`);
            } catch (fallbackTimeoutError) {
              console.log(`❌ External page load failed after multiple attempts, continuing with current state: ${currentUrl}`);
            }
          }
          
          // Scroll to top to ensure we capture the full page header
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.waitForTimeout(1000);
        } else {
          console.log(`🏠 Internal navigation detected: ${currentUrl}`);
          // Wait a bit more for the new page to load
          await page.waitForTimeout(2000);
        }
      }

      // Take high-quality full screen after screenshot
      console.log(`📸 Taking high-quality screenshot for: ${elementId}`);
      let afterScreenshot: Buffer;
      try {
        afterScreenshot = await page.screenshot({ 
          type: 'png',
          fullPage: true,
          timeout: 5000,
          animations: 'disabled' // Disable animations for cleaner screenshots
        });
      } catch (screenshotError) {
        console.log(`⚠️ Full page screenshot failed for ${elementId}, trying viewport...`);
        afterScreenshot = await page.screenshot({ 
          type: 'png',
          timeout: 3000,
          animations: 'disabled'
        });
      }

      // Create compressed base64 image for Local Storage (NO FILE SAVING)
      const afterScreenshotBase64 = await this.createAfterImage(afterScreenshot);

      // Determine if this was external navigation
      const isExternalNavigation = currentUrl !== url && new URL(url).hostname !== new URL(currentUrl).hostname;

      console.log(`✅ Successfully captured: ${elementId}${isExternalNavigation ? ' (external page)' : ''}`);
      if (isExternalNavigation) {
        console.log(`🌍 External navigation result: ${url} -> ${currentUrl}`);
        console.log(`📸 External screenshot captured: ${afterScreenshotBase64.length} characters`);
      }

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
      
      // Enhanced error reporting for external navigation failures
      const currentUrl = page.url();
      const isExternalNavigation = currentUrl !== url && new URL(url).hostname !== new URL(currentUrl).hostname;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Provide more specific error messages for external navigation failures
      let enhancedErrorMessage = errorMessage;
      if (isExternalNavigation) {
        if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
          enhancedErrorMessage = `external_page_timeout: External page load timeout for ${currentUrl}`;
        } else if (errorMessage.includes('navigation') || errorMessage.includes('Navigation')) {
          enhancedErrorMessage = `external_navigation_failed: Failed to navigate to external URL ${currentUrl}`;
        } else if (errorMessage.includes('external_navigation_failed')) {
          enhancedErrorMessage = `external_navigation_failed: ${currentUrl}`;
        } else {
          enhancedErrorMessage = `external_capture_failed: External page capture failed for ${currentUrl}`;
        }
      } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
        enhancedErrorMessage = `element_timeout: Element capture timeout for ${elementId}`;
      } else if (errorMessage.includes('not found') || errorMessage.includes('not found')) {
        enhancedErrorMessage = `element_not_found: Element not found: ${element.selector}`;
      } else {
        enhancedErrorMessage = `capture_failed: ${errorMessage}`;
      }
      
      return {
        elementId,
        afterScreenshot: '',
        title: element.text || `${element.tag} element`,
        success: false,
        error: enhancedErrorMessage,
        timestamp: new Date().toISOString(),
        isExternalNavigation,
        externalUrl: isExternalNavigation ? currentUrl : undefined
      };
    }
  }

  private async createAfterImage(screenshot: Buffer): Promise<string> {
    try {
      // Create a high-quality compressed base64 image for Local Storage ONLY (NO FILE SAVING)
      console.log(`🖼️ Creating high-quality base64 image for Local Storage...`);
      const compressed = await sharp(screenshot)
        .resize(1000, 750, { 
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: 90, // Good quality without being too large
          progressive: true
        })
        .toBuffer();
      
      const base64Data = `data:image/jpeg;base64,${compressed.toString('base64')}`;
      console.log(`✅ Created high-quality base64 image (${base64Data.length} characters)`);
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
    SimpleAfterCapture.currentProcessingUrl = null;
    SimpleAfterCapture.processingQueue = [];
    SimpleAfterCapture.lastCaptureTime = 0; // Reset capture timing
    this.isCapturing = false;
    this.processingUrls.clear();
    this.lastRequestTime = 0; // Reset rate limiting
    console.log('🔄 Cleared stuck processing state and URL queue');
  }

  // Get processing status for debugging
  getProcessingStatus(): { isCapturing: boolean; currentUrl: string | null; queueLength: number; queue: string[] } {
    return {
      isCapturing: SimpleAfterCapture.globalCapturing,
      currentUrl: SimpleAfterCapture.currentProcessingUrl,
      queueLength: SimpleAfterCapture.processingQueue.length,
      queue: [...SimpleAfterCapture.processingQueue]
    };
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
