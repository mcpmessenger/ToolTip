import { useState, useCallback } from 'react';

interface CrawlRequest {
  url: string;
  element_selector?: string;
  element_text?: string;
  coordinates?: [number, number];
  wait_time?: number;
}

interface CrawlResult {
  crawl_id: string;
  status: string;
  gif_available?: boolean;
  gif_url?: string;
  loading_gif_url?: string;
  error?: string;
  progress?: number;
}

interface PageElement {
  index: number;
  tag: string;
  text: string;
  selector: string;
  coordinates: [number, number];
  visible: boolean;
}

const API_BASE_URL = 'http://localhost:3001';

export const useCrawling = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCrawl = useCallback(async (request: CrawlRequest): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start crawl');
      }

      return data.crawl_id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCrawlStatus = useCallback(async (crawlId: string): Promise<CrawlResult | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/status/${crawlId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get status');
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const getPageElements = useCallback(async (url: string): Promise<PageElement[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/elements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get elements');
      }

      return data.elements || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    }
  }, []);

  const pollCrawlStatus = useCallback(async (
    crawlId: string, 
    onUpdate: (status: CrawlResult) => void,
    onComplete: (gifUrl: string) => void,
    onError: (error: string) => void
  ): Promise<void> => {
    const poll = async (): Promise<void> => {
      try {
        const status = await getCrawlStatus(crawlId);
        
        if (!status) {
          onError('Failed to get crawl status');
          return;
        }

        onUpdate(status);

        if (status.status === 'completed' && status.gif_available && status.gif_url) {
          onComplete(status.gif_url);
        } else if (status.status === 'failed') {
          onError(status.error || 'Crawl failed');
        } else {
          // Continue polling
          setTimeout(poll, 1000);
        }
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    poll();
  }, [getCrawlStatus]);

  const getGifUrl = useCallback((crawlId: string): string => {
    return `${API_BASE_URL}/api/gif/${crawlId}`;
  }, []);

  const getLoadingGifUrl = useCallback((crawlId: string): string => {
    return `${API_BASE_URL}/api/loading-gif/${crawlId}`;
  }, []);

  return {
    startCrawl,
    getCrawlStatus,
    getPageElements,
    pollCrawlStatus,
    getGifUrl,
    getLoadingGifUrl,
    isLoading,
    error,
  };
};
