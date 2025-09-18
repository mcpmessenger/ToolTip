import { chromium, Browser, Page } from 'playwright';
import OpenAI from 'openai';
import { supabase } from '../config/supabase';

// Initialize OpenAI only if API key is available
const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here'
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

export interface CrawlResult {
  url: string;
  title: string;
  content: string;
  summary?: string;
  keywords?: string[];
}

export class CrawlService {
  private browser: Browser | null = null;

  async searchAndCrawl(query: string, numPages: number = 2): Promise<CrawlResult[]> {
    try {
      await this.initializeBrowser();
      if (!this.browser) throw new Error('Browser not initialized');

      const results: CrawlResult[] = [];
      const page = await this.browser.newPage();
      
      try {
        // Search on Google
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
        await page.waitForLoadState('networkidle');
        
        // Extract search result links
        const searchLinks = await page.$$eval('a[href^="http"]', links => 
          links
            .map(link => link.getAttribute('href'))
            .filter(href => href && !href.includes('google.com'))
            .slice(0, numPages)
        );

        // Crawl each search result
        for (const url of searchLinks) {
          if (url) {
            try {
              const crawlResult = await this.crawlPage(url);
              if (crawlResult) {
                results.push(crawlResult);
              }
            } catch (error) {
              console.error(`Error crawling ${url}:`, error);
            }
          }
        }
      } finally {
        await page.close();
      }

      // Save crawl results to database
      await this.saveCrawlResults(results, query);

      return results;
    } catch (error) {
      console.error('Crawl service error:', error);
      throw error;
    }
  }

  private async initializeBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  private async crawlPage(url: string): Promise<CrawlResult | null> {
    if (!this.browser) return null;

    const page = await this.browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
      
      // Extract page content
      const title = await page.title();
      const content = await page.evaluate(() => {
        // Remove script and style elements
        const scripts = document.querySelectorAll('script, style, nav, header, footer');
        scripts.forEach((el: Element) => el.remove());
        
        // Get main content
        const main = document.querySelector('main') || 
                    document.querySelector('article') || 
                    document.querySelector('.content') ||
                    document.body;
        return main?.innerText || '';
      });

      // Generate summary and keywords using OpenAI
      const analysis = await this.analyzeContent(content);
      
      return {
        url,
        title,
        content: content.substring(0, 5000), // Limit content length
        summary: analysis.summary,
        keywords: analysis.keywords
      };
    } catch (error) {
      console.error(`Error crawling page ${url}:`, error);
      return null;
    } finally {
      await page.close();
    }
  }

  private async analyzeContent(content: string): Promise<{ summary: string; keywords: string[] }> {
    try {
      if (!openai) {
        console.log('OpenAI not configured, using mock analysis');
        return {
          summary: `Mock summary for content analysis. Add OpenAI API key for real AI analysis.`,
          keywords: ['mock', 'analysis', 'demo']
        };
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Analyze the following web content and provide a brief summary (2-3 sentences) and 5-10 relevant keywords. Return your response as JSON with "summary" and "keywords" fields.'
          },
          {
            role: 'user',
            content: content.substring(0, 2000) // Limit content for analysis
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      });

      const response = completion.choices[0]?.message?.content || '{}';
      const analysis = JSON.parse(response);
      
      return {
        summary: analysis.summary || 'No summary available',
        keywords: analysis.keywords || []
      };
    } catch (error) {
      console.error('Content analysis error:', error);
      return {
        summary: 'Content analysis failed',
        keywords: []
      };
    }
  }

  private async saveCrawlResults(results: CrawlResult[], query: string): Promise<void> {
    try {
      if (!supabase) {
        console.log('Supabase not configured, skipping crawl results save');
        return;
      }

      const crawlData = results.map(result => ({
        url: result.url,
        title: result.title,
        content: result.content,
        summary: result.summary,
        keywords: result.keywords,
        search_query: query,
        crawled_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('crawled_pages')
        .insert(crawlData);

      if (error) {
        console.error('Error saving crawl results:', error);
      }
    } catch (error) {
      console.error('Error saving crawl results:', error);
    }
  }

  async crawlSpecificPage(url: string): Promise<CrawlResult[]> {
    try {
      await this.initializeBrowser();
      if (!this.browser) throw new Error('Browser not initialized');

      const result = await this.crawlPage(url);
      
      if (result) {
        // Save crawl result to database
        await this.saveCrawlResults([result], `Current page: ${url}`);
        return [result];
      }
      
      return [];
    } catch (error) {
      console.error('Crawl specific page error:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const crawlService = new CrawlService();
