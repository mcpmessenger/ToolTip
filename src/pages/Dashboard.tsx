import React, { useState, useCallback, useEffect } from 'react';
import { TooltipDashboard } from '../components/TooltipDashboard';
import { GifCrawlDemo } from '../components/GifCrawlDemo';
import { SimpleGifDemo } from '../components/SimpleGifDemo';
import GlassCard, { Message } from '../components/ui/glass-card';
import { AuroraHero } from '../components/ui/futurastic-hero-section';
import { Button } from '../components/ui/button';
import { Settings, X, Play, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HoverGif } from '../components/HoverGif';
import { ProactiveHoverGif } from '../components/ProactiveHoverGif';
import { SimplePageScanner } from '../components/SimplePageScanner';
import { UniversalTooltipDemo } from '../components/UniversalTooltipDemo';
import AutoTooltipInjector from '../components/AutoTooltipInjector';
import SimpleTooltipInjector from '../components/SimpleTooltipInjector';
import PreScrapedDemoPage from '../components/PreScrapedDemoPage';

const Dashboard: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showGifDemo, setShowGifDemo] = useState(false);
  const [showSimpleDemo, setShowSimpleDemo] = useState(false);
  const [showPageScanner, setShowPageScanner] = useState(false);
  const [showUniversalDemo, setShowUniversalDemo] = useState(false);
  const [showPreScrapedDemo, setShowPreScrapedDemo] = useState(false);
  const [showCompanion, setShowCompanion] = useState(true); // Always open by default
  const [useProactiveMode, setUseProactiveMode] = useState(false);
  
  // Removed cache hook - using original HoverGif
  const [companionPosition, setCompanionPosition] = useState({ 
    x: typeof window !== 'undefined' ? 50 : 50, 
    y: typeof window !== 'undefined' ? window.innerHeight - 550 : 100 
  });
  const [companionSize, setCompanionSize] = useState({ width: 400, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Welcome! I can help you perform fresh crawls and advanced web scraping with Playwright. Enter a URL to crawl or drag & drop files for analysis.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I understand you said: "${message}". This is a simulated response from the AI assistant. In a real implementation, this would connect to your AI service.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name);
    // Handle file upload logic here
  };

  const handleCompanionMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement) {
      if (e.target.closest('.drag-handle')) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - companionPosition.x,
          y: e.clientY - companionPosition.y
        });
        e.preventDefault();
      } else if (e.target.closest('.resize-handle')) {
        setIsResizing(true);
        setResizeStart({
          x: e.clientX,
          y: e.clientY,
          width: companionSize.width,
          height: companionSize.height
        });
        e.preventDefault();
      }
    }
  };

  const handleCompanionMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setCompanionPosition({ x: newX, y: newY });
    } else if (isResizing) {
      const newWidth = Math.max(300, Math.min(800, resizeStart.width + (e.clientX - resizeStart.x)));
      const newHeight = Math.max(400, Math.min(900, resizeStart.height + (e.clientY - resizeStart.y)));
      setCompanionSize({ width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, dragStart, resizeStart]);

  const handleCompanionMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleCompanionMouseMove);
      document.addEventListener('mouseup', handleCompanionMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleCompanionMouseMove);
        document.removeEventListener('mouseup', handleCompanionMouseUp);
      };
    }
  }, [isDragging, isResizing, handleCompanionMouseMove, handleCompanionMouseUp]);

  // Update position on window resize
  useEffect(() => {
    const handleResize = () => {
      setCompanionPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - companionSize.width),
        y: Math.min(prev.y, window.innerHeight - companionSize.height)
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [companionSize]);

  return (
    <div className="min-h-screen relative">
        {/* Using original HoverGif components */}
      
      <AuroraHero 
        hideText={showSettings} 
        onGetStarted={() => setShowCompanion(!showCompanion)} 
        useProactiveMode={useProactiveMode}
      />
      
      {/* Settings and Demo Icons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="fixed top-6 right-6 z-50 flex space-x-2"
      >
        {useProactiveMode ? (
          <ProactiveHoverGif
            targetUrl={window.location.href}
            elementSelector="button[title='Simple GIF Demo']"
            elementText="Simple GIF Demo"
            waitTime={2.0}
          >
            <button
              onClick={() => setShowSimpleDemo(!showSimpleDemo)}
              className="p-3 hover:bg-white/10 rounded-full transition-all duration-300"
              title="Simple GIF Demo"
            >
              <Zap className="h-6 w-6 text-white" />
            </button>
          </ProactiveHoverGif>
        ) : (
          <HoverGif
            targetUrl={window.location.href}
            elementSelector="button[title='Simple GIF Demo']"
            elementText="Simple GIF Demo"
            waitTime={2.0}
          >
            <button
              onClick={() => setShowSimpleDemo(!showSimpleDemo)}
              className="p-3 hover:bg-white/10 rounded-full transition-all duration-300"
              title="Simple GIF Demo"
            >
              <Zap className="h-6 w-6 text-white" />
            </button>
          </HoverGif>
        )}
        
        {useProactiveMode ? (
          <ProactiveHoverGif
            targetUrl={window.location.href}
            elementSelector="button[title='Page Scanner Demo']"
            elementText="Page Scanner Demo"
            waitTime={2.0}
          >
            <button
              onClick={() => setShowPageScanner(!showPageScanner)}
              className="p-3 hover:bg-white/10 rounded-full transition-all duration-300"
              title="Page Scanner Demo"
            >
              🔍
            </button>
          </ProactiveHoverGif>
        ) : (
          <HoverGif
            targetUrl={window.location.href}
            elementSelector="button[title='Page Scanner Demo']"
            elementText="Page Scanner Demo"
            waitTime={2.0}
          >
            <button
              onClick={() => setShowPageScanner(!showPageScanner)}
              className="p-3 hover:bg-white/10 rounded-full transition-all duration-300"
              title="Page Scanner Demo"
            >
              🔍
            </button>
          </HoverGif>
        )}
        
        {useProactiveMode ? (
          <ProactiveHoverGif
            targetUrl={window.location.href}
            elementSelector="button[title='Universal Tooltip Demo']"
            elementText="Universal Tooltip Demo"
            waitTime={2.0}
          >
            <button
              onClick={() => setShowUniversalDemo(!showUniversalDemo)}
              className="p-3 hover:bg-white/10 rounded-full transition-all duration-300"
              title="Universal Tooltip Demo"
            >
              🎯
            </button>
          </ProactiveHoverGif>
        ) : (
          <HoverGif
            targetUrl={window.location.href}
            elementSelector="button[title='Universal Tooltip Demo']"
            elementText="Universal Tooltip Demo"
            waitTime={2.0}
          >
            <button
              onClick={() => setShowUniversalDemo(!showUniversalDemo)}
              className="p-3 hover:bg-white/10 rounded-full transition-all duration-300"
              title="Universal Tooltip Demo"
            >
              🎯
            </button>
          </HoverGif>
        )}
        
        {useProactiveMode ? (
          <ProactiveHoverGif
            targetUrl={window.location.href}
            elementSelector="button[title='Pre-Scraped Demo']"
            elementText="Pre-Scraped Demo"
            waitTime={2.0}
          >
            <button
              onClick={() => setShowPreScrapedDemo(!showPreScrapedDemo)}
              className="p-3 hover:bg-white/10 rounded-full transition-all duration-300"
              title="Pre-Scraped Demo"
            >
              ⚡
            </button>
          </ProactiveHoverGif>
        ) : (
          <HoverGif
            targetUrl={window.location.href}
            elementSelector="button[title='Pre-Scraped Demo']"
            elementText="Pre-Scraped Demo"
            waitTime={2.0}
          >
            <button
              onClick={() => setShowPreScrapedDemo(!showPreScrapedDemo)}
              className="p-3 hover:bg-white/10 rounded-full transition-all duration-300"
              title="Pre-Scraped Demo"
            >
              ⚡
            </button>
          </HoverGif>
        )}
        
        {useProactiveMode ? (
          <ProactiveHoverGif
            targetUrl={window.location.href}
            elementSelector="button[title='GIF Crawl Demo']"
            elementText="GIF Crawl Demo"
            waitTime={2.0}
          >
            <button
              onClick={() => setShowGifDemo(!showGifDemo)}
              className="p-3 hover:bg-white/10 rounded-full transition-all duration-300"
              title="GIF Crawl Demo"
            >
              <Play className="h-6 w-6 text-white" />
            </button>
          </ProactiveHoverGif>
        ) : (
          <HoverGif
            targetUrl={window.location.href}
            elementSelector="button[title='GIF Crawl Demo']"
            elementText="GIF Crawl Demo"
            waitTime={2.0}
          >
            <button
              onClick={() => setShowGifDemo(!showGifDemo)}
              className="p-3 hover:bg-white/10 rounded-full transition-all duration-300"
              title="GIF Crawl Demo"
            >
              <Play className="h-6 w-6 text-white" />
            </button>
          </HoverGif>
        )}
        
        <button
          onClick={() => setUseProactiveMode(!useProactiveMode)}
          className={`p-3 rounded-full transition-all duration-300 ${
            useProactiveMode 
              ? 'bg-green-500/20 hover:bg-green-500/30' 
              : 'hover:bg-white/10'
          }`}
          title={useProactiveMode ? 'Proactive Mode ON' : 'Proactive Mode OFF'}
        >
          <div className={`w-6 h-6 rounded-full ${useProactiveMode ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        </button>
        
        {useProactiveMode ? (
          <ProactiveHoverGif
            targetUrl={window.location.href}
            elementSelector="button[title='Settings']"
            elementText="Settings"
            waitTime={2.0}
          >
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 hover:bg-white/10 rounded-full transition-all duration-300"
              title="Settings"
            >
              <Settings className="h-6 w-6 text-white" />
            </button>
          </ProactiveHoverGif>
        ) : (
          <HoverGif
            targetUrl={window.location.href}
            elementSelector="button[title='Settings']"
            elementText="Settings"
            waitTime={2.0}
          >
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 hover:bg-white/10 rounded-full transition-all duration-300"
              title="Settings"
            >
              <Settings className="h-6 w-6 text-white" />
            </button>
          </HoverGif>
        )}
      </motion.div>


      {/* Settings Panel Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setShowSettings(false)}
          >
            {/* Clean transparent overlay - No hero background */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute inset-4 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <div className="absolute top-4 right-4 z-10">
                <HoverGif
                  targetUrl={window.location.href}
                  elementSelector="button[aria-label='Close settings']"
                  elementText="Close Settings"
                  waitTime={2.0}
                >
                  <Button
                    onClick={() => setShowSettings(false)}
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/10"
                    aria-label="Close settings"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </HoverGif>
              </div>

              {/* Dashboard Content - No hero text */}
              <div className="h-full overflow-y-auto">
                <TooltipDashboard 
                  onKeyChange={(keys) => {
                    console.log('API Keys updated:', keys);
                    // Here you would typically save to your backend or state management
                  }}
                  onSettingsChange={(settings) => {
                    console.log('Settings updated:', settings);
                    // Here you would typically save to your backend or state management
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GIF Demo Panel Overlay */}
      <AnimatePresence>
        {showGifDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setShowGifDemo(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute inset-4 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <div className="absolute top-4 right-4 z-10">
                <HoverGif
                  targetUrl={window.location.href}
                  elementSelector="button[aria-label='Close demo']"
                  elementText="Close Demo"
                  waitTime={2.0}
                >
                  <Button
                    onClick={() => setShowGifDemo(false)}
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/10"
                    aria-label="Close demo"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </HoverGif>
              </div>

              {/* GIF Demo Content */}
              <div className="h-full overflow-y-auto p-6">
                <GifCrawlDemo />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simple GIF Demo Panel Overlay */}
      <AnimatePresence>
        {showSimpleDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setShowSimpleDemo(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute inset-4 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <div className="absolute top-4 right-4 z-10">
                <HoverGif
                  targetUrl={window.location.href}
                  elementSelector="button[aria-label='Close demo']"
                  elementText="Close Demo"
                  waitTime={2.0}
                >
                  <Button
                    onClick={() => setShowSimpleDemo(false)}
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/10"
                    aria-label="Close demo"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </HoverGif>
              </div>

              {/* Simple GIF Demo Content */}
              <div className="h-full overflow-y-auto">
                <SimpleGifDemo />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Scanner Panel */}
      <AnimatePresence>
        {showPageScanner && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute inset-4 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <HoverGif
                targetUrl={window.location.href}
                elementSelector="button[aria-label='Close demo']"
                elementText="Close Demo"
                waitTime={2.0}
              >
                <Button
                  onClick={() => setShowPageScanner(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white hover:bg-white/10"
                  aria-label="Close demo"
                >
                  <X className="h-4 w-4" />
                </Button>
              </HoverGif>
            </div>

            {/* Page Scanner Content */}
            <div className="h-full overflow-y-auto">
              <SimplePageScanner />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Universal Tooltip Demo Panel */}
      <AnimatePresence>
        {showUniversalDemo && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute inset-4 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <HoverGif
                targetUrl={window.location.href}
                elementSelector="button[aria-label='Close demo']"
                elementText="Close Demo"
                waitTime={2.0}
              >
                <Button
                  onClick={() => setShowUniversalDemo(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white hover:bg-white/10"
                  aria-label="Close demo"
                >
                  <X className="h-4 w-4" />
                </Button>
              </HoverGif>
            </div>

            {/* Universal Demo Content */}
            <div className="h-full overflow-y-auto">
              <UniversalTooltipDemo targetUrl={window.location.href} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pre-Scraped Demo Panel */}
      <AnimatePresence>
        {showPreScrapedDemo && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute inset-4 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <HoverGif
                targetUrl={window.location.href}
                elementSelector="button[aria-label='Close demo']"
                elementText="Close Demo"
                waitTime={2.0}
              >
                <Button
                  onClick={() => setShowPreScrapedDemo(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white hover:bg-white/10"
                  aria-label="Close demo"
                >
                  <X className="h-4 w-4" />
                </Button>
              </HoverGif>
            </div>

            {/* Pre-Scraped Demo Content */}
            <div className="h-full overflow-y-auto">
              <PreScrapedDemoPage />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Beautiful Draggable Glass Card Companion */}
      <AnimatePresence>
        {showCompanion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed z-50"
            style={{
              left: companionPosition.x,
              top: companionPosition.y,
              width: companionSize.width,
              height: companionSize.height,
            }}
            onMouseDown={handleCompanionMouseDown}
          >
            <div className="relative w-full h-full">
              <GlassCard
                onSendMessage={handleSendMessage}
                messages={messages}
                isLoading={isLoading}
                onFileUpload={handleFileUpload}
                onSearchClick={() => console.log('Search clicked')}
                className="w-full h-full"
                // Proactive scraping props
                targetUrl={window.location.href}
                enableProactiveMode={useProactiveMode}
                apiBaseUrl="http://localhost:3001"
                onScrapingStart={(url) => {
                  console.log('Proactive scraping started for:', url);
                  setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    type: 'ai',
                    content: `🚀 Starting proactive scraping for ${url}...`,
                    timestamp: new Date()
                  }]);
                }}
                onScrapingComplete={(results) => {
                  console.log('Proactive scraping completed:', results);
                  setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    type: 'ai',
                    content: `✅ Proactive scraping completed! Found ${results.totalElements} elements with ${results.successfulPreviews} previews generated.`,
                    timestamp: new Date()
                  }]);
                }}
                onScrapingError={(error) => {
                  console.error('Proactive scraping error:', error);
                  setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    type: 'ai',
                    content: `❌ Proactive scraping failed: ${error}`,
                    timestamp: new Date()
                  }]);
                }}
              />
              {/* Resize handle */}
              <div className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500/50 hover:bg-blue-500/70 cursor-se-resize rounded-tl-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white/70 rounded-full"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
