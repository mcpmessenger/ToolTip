import { chromium, Browser, Page } from 'playwright'
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
  private browser: Browser | null = null

  async initialize() {
    this.browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  async crawlPage(url: string): Promise<CrawlResult | null> {
    if (!this.browser) {
      throw new Error('Browser not initialized')
    }

    try {
      const page = await this.browser.newPage()
      
      // Set user agent to avoid bot detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
      
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
      
      // Extract content
      const title = await page.title()
      const content = await page.evaluate(() => {
        // Remove script and style elements
        const scripts = document.querySelectorAll('script, style, nav, header, footer, aside')
        scripts.forEach(el => el.remove())
        
        // Get main content
        const main = document.querySelector('main') || document.querySelector('article') || document.body
        return main?.innerText || document.body.innerText || ''
      })

      // Extract metadata
      const metadata = await page.evaluate(() => {
        const getMetaContent = (name: string) => {
          const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
          return meta?.getAttribute('content') || ''
        }

        const description = getMetaContent('description')
        const keywords = getMetaContent('keywords').split(',').map(k => k.trim()).filter(k => k)
        const author = getMetaContent('author')
        const publishedDate = getMetaContent('article:published_time') || getMetaContent('datePublished')
        
        // Get first image
        const firstImg = document.querySelector('img[src]') as HTMLImageElement
        const imageUrl = firstImg?.src || ''

        // Calculate word count and reading time
        const text = document.body.innerText || ''
        const wordCount = text.split(/\s+/).length
        const readingTime = Math.ceil(wordCount / 200) // 200 words per minute

        return {
          description,
          keywords,
          author,
          published_date: publishedDate,
          image_url: imageUrl,
          word_count: wordCount,
          reading_time: readingTime
        }
      })

      await page.close()

      // Analyze content with OpenAI
      const analysis = await analyzePageContent(content, url)

      return {
        url,
        title,
        content,
        metadata,
        analysis
      }
    } catch (error) {
      console.error(`Error crawling ${url}:`, error)
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

  async searchAndCrawl(query: string, maxPages: number = 5): Promise<CrawlResult[]> {
    if (!this.browser) {
      throw new Error('Browser not initialized')
    }

    try {
      const page = await this.browser.newPage()
      
      // Search on Google
      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`)
      
      // Extract search results
      const searchResults = await page.evaluate(() => {
        const results: string[] = []
        const links = document.querySelectorAll('a[href^="http"]')
        
        links.forEach(link => {
          const href = link.getAttribute('href')
          if (href && !href.includes('google.com') && !href.includes('youtube.com')) {
            results.push(href)
          }
        })
        
        return results.slice(0, 10) // Get first 10 results
      })

      await page.close()

      // Crawl the found pages
      const urlsToCrawl = searchResults.slice(0, maxPages)
      return await this.crawlMultiplePages(urlsToCrawl)
    } catch (error) {
      console.error('Error searching and crawling:', error)
      return []
    }
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
}
