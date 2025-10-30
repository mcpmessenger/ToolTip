-- Smart Web Crawler Database Schema
-- Run this in your Supabase SQL editor

-- Create crawled_pages table
CREATE TABLE IF NOT EXISTS crawled_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES crawled_pages(id) ON DELETE SET NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  context_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crawl_sessions table
CREATE TABLE IF NOT EXISTS crawl_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_query TEXT NOT NULL,
  pages_crawled TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crawled_pages_url ON crawled_pages(url);
CREATE INDEX IF NOT EXISTS idx_crawled_pages_created_at ON crawled_pages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_page_id ON chat_messages(page_id);
CREATE INDEX IF NOT EXISTS idx_crawl_sessions_status ON crawl_sessions(status);
CREATE INDEX IF NOT EXISTS idx_crawl_sessions_created_at ON crawl_sessions(created_at);

-- Create full-text search index for content
CREATE INDEX IF NOT EXISTS idx_crawled_pages_content_search ON crawled_pages USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_crawled_pages_title_search ON crawled_pages USING gin(to_tsvector('english', title));

-- Enable Row Level Security (RLS)
ALTER TABLE crawled_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your needs)
CREATE POLICY "Allow public read access to crawled_pages" ON crawled_pages
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to crawled_pages" ON crawled_pages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to chat_messages" ON chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to chat_messages" ON chat_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to crawl_sessions" ON crawl_sessions
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to crawl_sessions" ON crawl_sessions
  FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_crawled_pages_updated_at
  BEFORE UPDATE ON crawled_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
