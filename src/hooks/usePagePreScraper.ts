import { useState, useEffect, useCallback } from 'react';
import { useCrawling } from './useCrawling';

interface ScrapedElement {
  id: string;
  selector: string;
  text: string;
  tagName: string;
  coordinates: [number, number];
  targetUrl: string;
  actionType: 'click' | 'navigate' | 'form' | 'custom';
  previewId?: string;
  gifUrl?: string;
  isProcessed: boolean;
}

interface PreScrapingState {
  isScanning: boolean;
  isProcessing: boolean;
  elements: ScrapedElement[];
  processedCount: number;
  totalCount: number;
  error: string | null;
}

export const usePagePreScraper = (targetUrl?: string) => {
  const [state, setState] = useState<PreScrapingState>({
    isScanning: false,
    isProcessing: false,
    elements: [],
    processedCount: 0,
    totalCount: 0,
    error: null
  });

  const { getPageElements, startCrawl, getCrawlStatus } = useCrawling();

  // Scan page for clickable elements
  const scanPage = useCallback(async () => {
    const url = targetUrl || window.location.href;
    if (!url) return;

    setState(prev => ({ ...prev, isScanning: true, error: null }));

    try {
      // Get elements from backend
      const pageElements = await getPageElements(url);
      
      // Find corresponding elements on the current page
      const clickableElements: ScrapedElement[] = [];
      
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

      clickableSelectors.forEach(selector => {
        const found = document.querySelectorAll(selector);
        found.forEach((element, index) => {
          const htmlElement = element as HTMLElement;
          const rect = htmlElement.getBoundingClientRect();
          
          // Only include visible elements
          if (rect.width > 0 && rect.height > 0) {
            const elementData: ScrapedElement = {
              id: `element-${index}-${Date.now()}`,
              selector: generateSelector(htmlElement),
              text: htmlElement.textContent?.trim() || '',
              tagName: htmlElement.tagName.toLowerCase(),
              coordinates: [Math.round(rect.left + rect.width / 2), Math.round(rect.top + rect.height / 2)],
              targetUrl: detectTargetUrl(htmlElement, url),
              actionType: detectActionType(htmlElement),
              isProcessed: false
            };
            
            clickableElements.push(elementData);
          }
        });
      });

      setState(prev => ({
        ...prev,
        elements: clickableElements,
        totalCount: clickableElements.length,
        isScanning: false
      }));

      console.log('Found clickable elements:', clickableElements);
    } catch (error) {
      console.error('Error scanning page:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isScanning: false
      }));
    }
  }, [targetUrl, getPageElements]);

  // Process elements to generate previews
  const processElements = useCallback(async () => {
    if (state.elements.length === 0) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      // Process elements in batches to avoid overwhelming the server
      const batchSize = 3;
      const batches = [];
      
      for (let i = 0; i < state.elements.length; i += batchSize) {
        batches.push(state.elements.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const promises = batch.map(async (element) => {
          try {
            const crawlId = await startCrawl({
              url: element.targetUrl,
              element_selector: element.selector,
              element_text: element.text,
              coordinates: element.coordinates,
              wait_time: 2.0
            });

            if (crawlId) {
              // Poll for completion
              const pollForCompletion = async (): Promise<string | null> => {
                const status = await getCrawlStatus(crawlId);
                if (status?.status === 'completed' && status.gif_available) {
                  return `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/gif/${crawlId}`;
                } else if (status?.status === 'failed') {
                  throw new Error(status.error || 'Crawl failed');
                } else {
                  // Continue polling
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  return pollForCompletion();
                }
              };

              const gifUrl = await pollForCompletion();
              
              setState(prev => ({
                ...prev,
                elements: prev.elements.map(el => 
                  el.id === element.id 
                    ? { ...el, gifUrl, isProcessed: true }
                    : el
                ),
                processedCount: prev.processedCount + 1
              }));
            }
          } catch (error) {
            console.error(`Error processing element ${element.id}:`, error);
            setState(prev => ({
              ...prev,
              elements: prev.elements.map(el => 
                el.id === element.id 
                  ? { ...el, isProcessed: true }
                  : el
              ),
              processedCount: prev.processedCount + 1
            }));
          }
        });

        await Promise.all(promises);
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setState(prev => ({ ...prev, isProcessing: false }));
    } catch (error) {
      console.error('Error processing elements:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isProcessing: false
      }));
    }
  }, [state.elements, startCrawl, getCrawlStatus]);

  // Auto-scan on mount
  useEffect(() => {
    scanPage();
  }, [scanPage]);

  // Auto-process after scanning
  useEffect(() => {
    if (state.elements.length > 0 && !state.isProcessing && state.processedCount === 0) {
      processElements();
    }
  }, [state.elements.length, state.isProcessing, state.processedCount, processElements]);

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

  const detectActionType = (element: HTMLElement): ScrapedElement['actionType'] => {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'a') return 'navigate';
    if (tagName === 'form' || tagName === 'input' && element.getAttribute('type') === 'submit') return 'form';
    if (element.hasAttribute('onclick')) return 'custom';
    
    return 'click';
  };

  return {
    ...state,
    scanPage,
    processElements,
    getElementPreview: (selector: string) => 
      state.elements.find(el => el.selector === selector)?.gifUrl || null
  };
};
