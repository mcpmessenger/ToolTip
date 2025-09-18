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
import { SimplePageScanner } from '../components/SimplePageScanner';

const Dashboard: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showGifDemo, setShowGifDemo] = useState(false);
  const [showSimpleDemo, setShowSimpleDemo] = useState(false);
  const [showPageScanner, setShowPageScanner] = useState(false);
  const [showCompanion, setShowCompanion] = useState(true); // Always open by default
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
      <AuroraHero hideText={showSettings} onGetStarted={() => setShowCompanion(!showCompanion)} />
      
      {/* Settings and Demo Icons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="fixed top-6 right-6 z-50 flex space-x-2"
      >
        <HoverGif
          targetUrl="https://github.com/mcpmessenger/ToolTip"
          elementSelector=".repository-content"
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
        
        <HoverGif
          targetUrl="https://github.com/mcpmessenger/ToolTip"
          elementSelector=".repository-content"
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
        
        <HoverGif
          targetUrl="https://github.com/mcpmessenger/ToolTip"
          elementSelector=".repository-content"
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
        
        <HoverGif
          targetUrl="https://github.com/mcpmessenger/ToolTip"
          elementSelector=".repository-content"
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
                  targetUrl="https://github.com/mcpmessenger/ToolTip"
                  elementSelector=".repository-content"
                  waitTime={2.0}
                >
                  <Button
                    onClick={() => setShowSettings(false)}
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/10"
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
                  targetUrl="https://github.com/mcpmessenger/ToolTip"
                  elementSelector=".repository-content"
                  waitTime={2.0}
                >
                  <Button
                    onClick={() => setShowGifDemo(false)}
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/10"
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
                  targetUrl="https://github.com/mcpmessenger/ToolTip"
                  elementSelector=".repository-content"
                  waitTime={2.0}
                >
                  <Button
                    onClick={() => setShowSimpleDemo(false)}
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/10"
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
                targetUrl="https://github.com/mcpmessenger/ToolTip"
                elementSelector=".repository-content"
                waitTime={2.0}
              >
                <Button
                  onClick={() => setShowPageScanner(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white hover:bg-white/10"
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
