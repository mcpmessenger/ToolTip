import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Minimize2, 
  Maximize2, 
  Settings, 
  Search, 
  BarChart3, 
  HelpCircle,
  Send,
  Upload,
  FileText,
  MessageSquare,
  RefreshCw,
  Globe
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { chatWithAI } from '../api/chat';
import { crawlCurrentPage } from '../api/crawler';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface DraggableTooltipCompanionProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export const DraggableTooltipCompanion: React.FC<DraggableTooltipCompanionProps> = ({
  onClose,
  onMinimize,
  onMaximize
}) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 400, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Welcome! I can help you browse the web intelligently. Ask me to search for information, crawl specific websites, or upload files for analysis.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement) {
      if (e.target.closest('.drag-handle')) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - position.x,
          y: e.clientY - position.y
        });
        e.preventDefault();
      } else if (e.target.closest('.resize-handle')) {
        setIsResizing(true);
        setResizeStart({
          x: e.clientX,
          y: e.clientY,
          width: size.width,
          height: size.height
        });
        e.preventDefault();
      }
    }
  }, [position, size]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    } else if (isResizing) {
      const newWidth = Math.max(300, Math.min(800, resizeStart.width + (e.clientX - resizeStart.x)));
      const newHeight = Math.max(400, Math.min(900, resizeStart.height + (e.clientY - resizeStart.y)));
      setSize({ width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, dragStart, resizeStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call the real chat API
      const response = await chatWithAI(userMessage.content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error. Please make sure the backend server is running.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFreshCrawl = async () => {
    setIsLoading(true);
    
    try {
      // Get current page URL
      const currentUrl = window.location.href;
      
      // Add loading message
      const loadingMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: `Crawling current page: ${currentUrl}...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, loadingMessage]);

      // Call the crawl API
      const crawlResult = await crawlCurrentPage(currentUrl);
      
      // Add result message
      const resultMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Successfully crawled the current page! Found ${crawlResult.results?.length || 0} results. The page content has been analyzed and stored.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, resultMessage]);
      
    } catch (error) {
      console.error('Crawl error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error while crawling the current page. Please make sure the backend server is running.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    onMinimize?.();
  };

  const handleMaximize = () => {
    if (isMaximized) {
      setSize({ width: 400, height: 600 });
      setPosition({ x: 100, y: 100 });
    } else {
      setSize({ width: window.innerWidth - 40, height: window.innerHeight - 40 });
      setPosition({ x: 20, y: 20 });
    }
    setIsMaximized(!isMaximized);
    onMaximize?.();
  };

  if (isMinimized) {
    return (
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed z-50"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <div className="p-4 flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-white font-semibold">ToolTip Companion</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMinimize}
              className="text-slate-400 hover:text-white ml-auto"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-slate-400 hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed z-50"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
      onMouseDown={handleMouseDown}
    >
      <Card className="h-full bg-slate-800/90 backdrop-blur-xl border-slate-700/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="drag-handle bg-slate-700/50 backdrop-blur-md border-b border-slate-600/50 p-4 flex items-center justify-between cursor-move">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-white font-semibold">ToolTip Companion</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMinimize}
              className="text-slate-400 hover:text-white"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMaximize}
              className="text-slate-400 hover:text-white"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-slate-400 hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-b border-slate-600/50">
          <div className="flex gap-2 flex-wrap">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
              onClick={handleFreshCrawl}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Fresh Crawls
            </Button>
            <Button size="sm" variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button size="sm" variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button size="sm" variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button size="sm" variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100% - 200px)' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700/50 text-slate-200'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700/50 text-slate-200 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-600/50">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Resize Handle */}
        <div className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-slate-600/50 cursor-se-resize rounded-tl-lg"></div>
      </Card>
    </motion.div>
  );
};
