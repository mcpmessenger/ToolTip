// Frontend API client for web crawling
// Connects to the backend API

export interface CrawlRequest {
  query: string;
  numPages?: number;
}

export interface CrawlCurrentPageRequest {
  url: string;
}

export interface CrawlResult {
  url: string;
  title: string;
  content: string;
  summary?: string;
  keywords?: string[];
}

// New interfaces for GIF crawling
export interface GifCrawlRequest {
  url: string;
  element_selector?: string;
  element_text?: string;
  coordinates?: [number, number];
  wait_time?: number;
}

export interface GifCrawlStatus {
  crawl_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  gif_available?: boolean;
  gif_url?: string;
  loading_gif_url?: string;
  error?: string;
  progress?: number;
}

export interface PageElement {
  index: number;
  tag: string;
  text: string;
  selector: string;
  coordinates: [number, number];
  visible: boolean;
}

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.com' 
  : 'http://localhost:3001';

export async function crawlWeb(query: string, numPages: number = 2): Promise<CrawlResult[]> {
  try {
    console.log(`Crawling web for: "${query}"`);
    
    const response = await fetch(`${API_BASE_URL}/api/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        numPages
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Crawl API error:', error);
    
    // Fallback to mock data if backend is not available
    console.log('Falling back to mock data...');
    return [
      {
        url: `https://example.com/search?q=${encodeURIComponent(query)}`,
        title: `Mock Result 1 for "${query}"`,
        content: `This is mock content for the search query "${query}". The backend service is not available, so this is a fallback response.`,
        summary: `Mock summary about ${query} - backend service unavailable.`,
        keywords: query.split(' ').concat(['tutorial', 'guide', 'example'])
      },
      {
        url: `https://example2.com/search?q=${encodeURIComponent(query)}`,
        title: `Mock Result 2 for "${query}"`,
        content: `Additional mock content for "${query}". This is a fallback response when the backend is not available.`,
        summary: `Another mock summary - backend service unavailable.`,
        keywords: query.split(' ').concat(['resource', 'learning', 'development'])
      }
    ];
  }
}

export async function crawlCurrentPage(url: string): Promise<{ results: CrawlResult[] }> {
  try {
    console.log(`Crawling current page: "${url}"`);
    
    const response = await fetch(`${API_BASE_URL}/api/crawl/current-page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { results: data.results || [] };
  } catch (error) {
    console.error('Crawl current page API error:', error);
    
    // Fallback to mock data if backend is not available
    console.log('Falling back to mock data for current page crawl...');
    return {
      results: [
        {
          url: url,
          title: `Mock Analysis of ${new URL(url).hostname}`,
          content: `This is mock content analysis for the current page "${url}". The backend service is not available, so this is a fallback response.`,
          summary: `Mock summary of the current page - backend service unavailable.`,
          keywords: ['current', 'page', 'analysis', 'mock']
        }
      ]
    };
  }
}

// New GIF crawling functions
export async function startGifCrawl(request: GifCrawlRequest): Promise<string | null> {
  try {
    console.log(`Starting GIF crawl for: "${request.url}"`);
    
    const response = await fetch(`${API_BASE_URL}/api/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.crawl_id;
  } catch (error) {
    console.error('GIF crawl start error:', error);
    throw error;
  }
}

export async function getGifCrawlStatus(crawlId: string): Promise<GifCrawlStatus | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/status/${crawlId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('GIF crawl status error:', error);
    throw error;
  }
}

export async function getPageElements(url: string): Promise<PageElement[]> {
  try {
    console.log(`Getting page elements for: "${url}"`);
    
    const response = await fetch(`${API_BASE_URL}/api/elements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.elements || [];
  } catch (error) {
    console.error('Get page elements error:', error);
    throw error;
  }
}

export function getGifUrl(crawlId: string): string {
  return `${API_BASE_URL}/api/gif/${crawlId}`;
}

export function getLoadingGifUrl(crawlId: string): string {
  return `${API_BASE_URL}/api/loading-gif/${crawlId}`;
}
