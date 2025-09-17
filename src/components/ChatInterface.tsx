import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Globe, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { WebCrawler } from '@/lib/crawler'
import { generateChatResponse, generateSearchQuery } from '@/lib/openai'
import { supabase, CrawledPage, ChatMessage } from '@/lib/supabase'

interface Message {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  contextUrl?: string
  isLoading?: boolean
}

interface ChatInterfaceProps {
  className?: string
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome! I can help you browse the web intelligently. Ask me to search for information, crawl specific websites, or ask questions about web content.',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [crawledPages, setCrawledPages] = useState<CrawledPage[]>([])
  const [crawler, setCrawler] = useState<WebCrawler | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initCrawler = async () => {
      const newCrawler = new WebCrawler()
      await newCrawler.initialize()
      setCrawler(newCrawler)
    }
    initCrawler()

    return () => {
      if (crawler) {
        crawler.close()
      }
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !crawler) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setIsLoading(true)

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])

    try {
      // Check if OpenAI API key is configured
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY
      if (!apiKey || apiKey === 'your_openai_api_key_here') {
        // Fallback response without OpenAI
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: `I received your message: "${userMessage}". However, I need an OpenAI API key to provide intelligent responses. Please add your OpenAI API key to the .env file and restart the server.`,
            timestamp: new Date()
          }
        ])
        return
      }

      // Generate search query
      const searchQuery = await generateSearchQuery(userMessage)
      
      // Add loading message
      const loadingMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Searching the web and analyzing content...',
        timestamp: new Date(),
        isLoading: true
      }
      setMessages(prev => [...prev, loadingMsg])

      // Search and crawl
      const crawlResults = await crawler.searchAndCrawl(searchQuery, 3)
      
      if (crawlResults.length > 0) {
        // Save results to database
        const savedPages = await crawler.saveCrawlResults(crawlResults)
        setCrawledPages(prev => [...prev, ...savedPages])

        // Generate AI response
        const aiResponse = await generateChatResponse(userMessage, savedPages, [])
        
        // Remove loading message and add AI response
        setMessages(prev => [
          ...prev.filter(msg => msg.id !== loadingMsg.id),
          {
            id: (Date.now() + 2).toString(),
            type: 'ai',
            content: aiResponse,
            timestamp: new Date(),
            contextUrl: savedPages[0]?.url
          }
        ])
      } else {
        // Remove loading message and add error response
        setMessages(prev => [
          ...prev.filter(msg => msg.id !== loadingMsg.id),
          {
            id: (Date.now() + 2).toString(),
            type: 'ai',
            content: 'I apologize, but I couldn\'t find relevant information for your query. Please try rephrasing your question or asking about a different topic.',
            timestamp: new Date()
          }
        ])
      }
    } catch (error) {
      console.error('Error processing message:', error)
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== loadingMsg.id),
        {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: 'I encountered an error while processing your request. Please try again.',
          timestamp: new Date()
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`flex flex-col h-[600px] w-full max-w-4xl mx-auto animate-scale-in ${className}`}>
      <Card className="flex-1 flex flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-t-lg animate-slide-up">
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
            <div className="p-2 bg-blue-500 rounded-full animate-float">
              <Bot className="h-5 w-5 text-white" />
            </div>
            Smart Web Crawler
            <Badge variant="secondary" className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 animate-pulse">
              {crawledPages.length} pages analyzed
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-3 animate-fade-in ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {message.type !== 'user' && (
                    <div className="flex-shrink-0">
                      {message.type === 'ai' ? (
                        <Bot className="h-6 w-6 text-blue-500" />
                      ) : (
                        <Globe className="h-6 w-6 text-gray-500" />
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                        : message.type === 'ai'
                        ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                        : 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800 hover:border-yellow-300 dark:hover:border-yellow-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">
                        {message.type === 'user' ? 'You' : message.type === 'ai' ? 'AI Assistant' : 'System'}
                      </p>
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.isLoading && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.contextUrl && (
                      <a
                        href={message.contextUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-1 block"
                      >
                        View source: {new URL(message.contextUrl).hostname}
                      </a>
                    )}
                  </div>
                  {message.type === 'user' && (
                    <div className="flex-shrink-0">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/50">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me to search for information or crawl a website..."
                disabled={isLoading}
                className="flex-1 bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                size="icon"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChatInterface
