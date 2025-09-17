// Frontend API client for web crawling
// Connects to the backend API

export interface CrawlRequest {
  query: string;
  numPages?: number;
}

export interface CrawlResult {
  url: string;
  title: string;
  content: string;
  summary?: string;
  keywords?: string[];
}

const API_BASE_URL = 'http://localhost:3001';

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
