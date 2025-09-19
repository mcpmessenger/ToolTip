import { useState, useEffect, useCallback, useRef } from 'react';

export interface ToolTipCompanionConfig {
  /** Target URL to scrape */
  targetUrl?: string;
  /** API base URL for backend services */
  apiBaseUrl?: string;
  /** Whether to enable proactive scraping mode */
  enableProactiveMode?: boolean;
  /** Auto-start scraping on mount */
  autoStart?: boolean;
  /** Scraping interval in milliseconds */
  interval?: number;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Callback when scraping starts */
  onScrapingStart?: (url: string) => void;
  /** Callback when scraping completes */
  onScrapingComplete?: (results: ScrapingResults) => void;
  /** Callback when an error occurs */
  onError?: (error: string) => void;
  /** Callback when element is hovered */
  onElementHover?: (element: ScrapedElement) => void;
  /** Callback when element is clicked */
  onElementClick?: (element: ScrapedElement) => void;
}

export interface ScrapingResults {
  url: string;
  elements: ScrapedElement[];
  totalElements: number;
  successfulPreviews: number;
  scrapedAt: string;
}

export interface ScrapedElement {
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
    href?: string | null;
    className?: string;
  };
}

export interface ScrapingStatus {
  isScraping: boolean;
  progress: number;
  currentElement: string;
  totalElements: number;
  completedElements: number;
  error: string | null;
}

export interface ToolTipCompanionState {
  /** Current scraping status */
  status: ScrapingStatus;
  /** Scraping results */
  results: ScrapingResults | null;
  /** Preview cache */
  previewCache: Map<string, string>;
  /** Whether the companion is open */
  isOpen: boolean;
  /** Whether proactive mode is enabled */
  isProactiveMode: boolean;
}

export const useToolTipCompanion = (config: ToolTipCompanionConfig = {}) => {
  const {
    targetUrl = window.location.href,
    apiBaseUrl = 'http://localhost:3001',
    enableProactiveMode = true,
    autoStart = true,
    interval = 0,
    maxRetries = 3,
    onScrapingStart,
    onScrapingComplete,
    onError,
    onElementHover,
    onElementClick
  } = config;

  // State
  const [state, setState] = useState<ToolTipCompanionState>({
    status: {
      isScraping: false,
      progress: 0,
      currentElement: '',
      totalElements: 0,
      completedElements: 0,
      error: null
    },
    results: null,
    previewCache: new Map(),
    isOpen: true,
    isProactiveMode: enableProactiveMode
  });

  const retryCount = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start proactive scraping
  const startScraping = useCallback(async () => {
    if (state.status.isScraping) return;

    setState(prev => ({
      ...prev,
      status: {
        ...prev.status,
        isScraping: true,
        progress: 0,
        currentElement: '',
        totalElements: 0,
        completedElements: 0,
        error: null
      }
    }));

    try {
      onScrapingStart?.(targetUrl);

      const response = await fetch(`${apiBaseUrl}/api/proactive-scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start proactive scraping');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        results: data.data,
        status: {
          ...prev.status,
          isScraping: false,
          progress: 100,
          totalElements: data.data.totalElements,
          completedElements: data.data.successfulPreviews
        }
      }));

      onScrapingComplete?.(data.data);

      // Preload preview images
      if (data.data.elements) {
        const previewPromises = data.data.elements
          .filter(el => el.previewId)
          .map(async (el) => {
            try {
              const previewResponse = await fetch(`${apiBaseUrl}/api/proactive-scrape/element-preview/${el.previewId}`);
              if (previewResponse.ok) {
                const blob = await previewResponse.blob();
                const previewUrl = URL.createObjectURL(blob);
                setState(prev => ({
                  ...prev,
                  previewCache: new Map(prev.previewCache).set(el.id, previewUrl)
                }));
              }
            } catch (err) {
              console.warn(`Failed to load preview for element ${el.id}:`, err);
            }
          });

        await Promise.all(previewPromises);
      }

      retryCount.current = 0;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      setState(prev => ({
        ...prev,
        status: {
          ...prev.status,
          isScraping: false,
          error: errorMessage
        }
      }));

      onError?.(errorMessage);

      // Retry logic
      if (retryCount.current < maxRetries) {
        retryCount.current++;
        setTimeout(() => {
          startScraping();
        }, 1000 * retryCount.current);
      }
    }
  }, [targetUrl, apiBaseUrl, state.status.isScraping, onScrapingStart, onScrapingComplete, onError, maxRetries]);

  // Stop scraping
  const stopScraping = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: {
        ...prev.status,
        isScraping: false
      }
    }));
  }, []);

  // Clear results and cache
  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      results: null,
      previewCache: new Map(),
      status: {
        ...prev.status,
        progress: 0,
        currentElement: '',
        totalElements: 0,
        completedElements: 0,
        error: null
      }
    }));
  }, []);

  // Toggle proactive mode
  const toggleProactiveMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isProactiveMode: !prev.isProactiveMode
    }));
  }, []);

  // Toggle companion visibility
  const toggleCompanion = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: !prev.isOpen
    }));
  }, []);

  // Get element preview
  const getElementPreview = useCallback((elementId: string): string | null => {
    return state.previewCache.get(elementId) || null;
  }, [state.previewCache]);

  // Find element by selector or text
  const findElement = useCallback((selector?: string, text?: string): ScrapedElement | null => {
    if (!state.results) return null;

    return state.results.elements.find(element => {
      // Strategy 1: Exact selector match
      if (selector && element.selector === selector) return true;
      
      // Strategy 2: All selectors match
      if (selector && element.allSelectors?.includes(selector)) return true;
      
      // Strategy 3: Text content match (normalized)
      if (text) {
        const normalizedElementText = element.text.toLowerCase().replace(/[^\w\s]/g, '').trim();
        const normalizedTargetText = text.toLowerCase().replace(/[^\w\s]/g, '').trim();
        if (normalizedElementText.includes(normalizedTargetText) || 
            normalizedTargetText.includes(normalizedElementText)) return true;
      }
      
      // Strategy 4: Attribute matching
      if (element.attributes) {
        if (text && element.attributes.title?.toLowerCase().includes(text.toLowerCase())) return true;
        if (text && element.attributes['aria-label']?.toLowerCase().includes(text.toLowerCase())) return true;
        if (selector && element.attributes.href && selector.includes(element.attributes.href)) return true;
      }
      
      return false;
    }) || null;
  }, [state.results]);

  // Handle element hover
  const handleElementHover = useCallback((element: ScrapedElement) => {
    onElementHover?.(element);
  }, [onElementHover]);

  // Handle element click
  const handleElementClick = useCallback((element: ScrapedElement) => {
    onElementClick?.(element);
  }, [onElementClick]);

  // Set up interval scraping
  useEffect(() => {
    if (interval > 0 && state.isProactiveMode) {
      intervalRef.current = setInterval(() => {
        startScraping();
      }, interval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [interval, state.isProactiveMode, startScraping]);

  // Auto-start scraping
  useEffect(() => {
    if (autoStart && state.isProactiveMode && !state.results && !state.status.isScraping) {
      startScraping();
    }
  }, [autoStart, state.isProactiveMode, state.results, state.status.isScraping, startScraping]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      state.previewCache.forEach(url => URL.revokeObjectURL(url));
    };
  }, [state.previewCache]);

  return {
    // State
    ...state,
    
    // Actions
    startScraping,
    stopScraping,
    clearResults,
    toggleProactiveMode,
    toggleCompanion,
    
    // Utilities
    getElementPreview,
    findElement,
    handleElementHover,
    handleElementClick,
    
    // Computed values
    hasResults: !!state.results,
    hasError: !!state.status.error,
    isReady: !state.status.isScraping && !state.status.error,
    previewCount: state.previewCache.size,
    successRate: state.results ? 
      (state.results.successfulPreviews / state.results.totalElements) * 100 : 0
  };
};
