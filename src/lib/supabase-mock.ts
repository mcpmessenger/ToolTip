// Mock Supabase implementation for testing without database
export interface CrawledPage {
  id: string
  url: string
  title: string
  content: string
  summary: string
  metadata: {
    description?: string
    keywords?: string[]
    author?: string
    published_date?: string
    image_url?: string
    word_count: number
    reading_time: number
  }
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  page_id?: string
  user_message: string
  ai_response: string
  context_url?: string
  created_at: string
}

export interface CrawlSession {
  id: string
  user_query: string
  pages_crawled: string[]
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  created_at: string
  completed_at?: string
}

// Mock Supabase client
export const supabase = {
  from: (table: string) => ({
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: { id: Date.now().toString(), ...data }, error: null })
      })
    }),
    select: () => ({
      eq: () => Promise.resolve({ data: [], error: null })
    })
  })
}
