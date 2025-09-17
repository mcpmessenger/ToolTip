// Mock crawler for testing without Playwright
import { analyzePageContent, PageAnalysis } from './openai'
import { supabase, CrawledPage } from './supabase-mock'

export interface CrawlResult {
  url: string
  title: string
  content: string
  metadata: {
    description?: string
    keywords?: string[]
    author?: string
    published_date?: string
    image_url?: string
    word_count: number
    reading_time: number
  }
  analysis: PageAnalysis
}

export class WebCrawler {
  private isInitialized = false

  async initialize() {
    this.isInitialized = true
    console.log('Mock crawler initialized')
  }

  async close() {
    this.isInitialized = false
    console.log('Mock crawler closed')
  }

  async crawlPage(url: string): Promise<CrawlResult | null> {
    if (!this.isInitialized) {
      throw new Error('Crawler not initialized')
    }

    // Mock page content based on URL
    const mockContent = this.generateMockContent(url)
    
    try {
      // Analyze content with OpenAI
      const analysis = await analyzePageContent(mockContent.content, url)

      return {
        url,
        title: mockContent.title,
        content: mockContent.content,
        metadata: mockContent.metadata,
        analysis
      }
    } catch (error) {
      console.error(`Error analyzing ${url}:`, error)
      return null
    }
  }

  async crawlMultiplePages(urls: string[]): Promise<CrawlResult[]> {
    const results: CrawlResult[] = []
    
    for (const url of urls) {
      const result = await this.crawlPage(url)
      if (result) {
        results.push(result)
      }
    }
    
    return results
  }

  async searchAndCrawl(query: string, maxPages: number = 3): Promise<CrawlResult[]> {
    if (!this.isInitialized) {
      throw new Error('Crawler not initialized')
    }

    // Generate mock search results based on query
    const mockUrls = this.generateMockSearchResults(query, maxPages)
    return await this.crawlMultiplePages(mockUrls)
  }

  async saveCrawlResults(results: CrawlResult[]): Promise<CrawledPage[]> {
    const savedPages: CrawledPage[] = []

    for (const result of results) {
      try {
        const { data, error } = await supabase
          .from('crawled_pages')
          .insert({
            url: result.url,
            title: result.title,
            content: result.content,
            summary: result.analysis.summary,
            metadata: result.metadata
          })
          .select()
          .single()

        if (error) {
          console.error('Error saving page:', error)
        } else {
          savedPages.push(data)
        }
      } catch (error) {
        console.error('Error saving page to database:', error)
      }
    }

    return savedPages
  }

  private generateMockContent(url: string) {
    const domain = new URL(url).hostname
    const topics = {
      'wikipedia.org': {
        title: 'Sample Wikipedia Article',
        content: 'This is a comprehensive article about the topic you searched for. It contains detailed information, historical context, and current developments. The content is well-researched and provides multiple perspectives on the subject matter.',
        description: 'A comprehensive overview of the topic',
        keywords: ['information', 'research', 'overview', 'detailed']
      },
      'github.com': {
        title: 'GitHub Repository',
        content: 'This is a software repository containing code, documentation, and project information. It includes README files, source code, issue tracking, and collaboration features for developers.',
        description: 'Software development repository',
        keywords: ['code', 'software', 'development', 'repository']
      },
      'stackoverflow.com': {
        title: 'Stack Overflow Question',
        content: 'This is a technical question and answer thread about programming and software development. It contains detailed explanations, code examples, and solutions to common programming problems.',
        description: 'Programming Q&A thread',
        keywords: ['programming', 'question', 'answer', 'technical']
      }
    }

    const topic = topics[domain as keyof typeof topics] || {
      title: 'Web Page Content',
      content: `This is sample content from ${domain}. It contains information related to your search query and provides useful insights on the topic. The content is well-structured and informative.`,
      description: 'Web page content',
      keywords: ['web', 'content', 'information', 'article']
    }

    const wordCount = topic.content.split(' ').length
    const readingTime = Math.ceil(wordCount / 200)

    return {
      title: topic.title,
      content: topic.content,
      metadata: {
        description: topic.description,
        keywords: topic.keywords,
        author: 'Sample Author',
        published_date: new Date().toISOString(),
        image_url: 'https://via.placeholder.com/300x200',
        word_count: wordCount,
        reading_time: readingTime
      }
    }
  }

  private generateMockSearchResults(query: string, maxPages: number): string[] {
    const baseUrls = [
      'https://en.wikipedia.org/wiki/' + encodeURIComponent(query),
      'https://github.com/search?q=' + encodeURIComponent(query),
      'https://stackoverflow.com/questions/tagged/' + encodeURIComponent(query),
      'https://example.com/article/' + encodeURIComponent(query),
      'https://blog.example.com/' + encodeURIComponent(query)
    ]

    return baseUrls.slice(0, maxPages)
  }
}
