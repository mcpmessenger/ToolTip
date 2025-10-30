-- ToolTip Companion Database Schema
-- Run this in your Supabase SQL editor

-- Create crawled_pages table
CREATE TABLE IF NOT EXISTS crawled_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  keywords TEXT[],
  search_query TEXT,
  crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crawled_pages_url ON crawled_pages(url);
CREATE INDEX IF NOT EXISTS idx_crawled_pages_search_query ON crawled_pages(search_query);
CREATE INDEX IF NOT EXISTS idx_crawled_pages_crawled_at ON crawled_pages(crawled_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE crawled_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access to crawled_pages" ON crawled_pages
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to crawled_pages" ON crawled_pages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to chat_messages" ON chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to chat_messages" ON chat_messages
  FOR INSERT WITH CHECK (true);
