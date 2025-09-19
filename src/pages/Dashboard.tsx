import React, { useState, useCallback, useEffect } from 'react';
import GlassCard, { Message } from '../components/ui/glass-card';
import { AuroraHero } from '../components/ui/futurastic-hero-section';
import { Button } from '../components/ui/button';
import { Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// import { AutoInstantTooltip } from '../components/AutoInstantTooltip'; // DISABLED - causing conflicts
// import { InstantTooltip } from '../components/InstantTooltip'; // DISABLED - causing conflicts
import { SimplePreviewTooltip } from '../components/SimplePreviewTooltip';
import { ScrapingProvider, useScraping } from '../contexts/ScrapingContext';
import { GlobalButtonWrapper } from '../components/GlobalButtonWrapper';
// import { UniversalProactiveScraper } from '../components/UniversalProactiveScraper'; // DISABLED - using simpleAfterCapture instead

const DashboardContent: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showCompanion, setShowCompanion] = useState(false); // Hidden by default, show on Get Started
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

  const { setScraping } = useScraping();

  // Trigger proactive scraping when page loads
  useEffect(() => {
    let isProcessing = false;
    let hasTriggered = false;
    
    const triggerProactiveScraping = async () => {
      if (isProcessing || hasTriggered) {
        console.log('⚠️ Proactive scraping already in progress or completed, skipping...');
        return;
      }
      
      isProcessing = true;
      hasTriggered = true;
      setScraping(true, window.location.href);
      console.log('🚀 Starting ONE-TIME proactive scraping...');
      try {
        // Clear old Local Storage data first
        console.log('🧹 Clearing old Local Storage data...');
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('preview_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log(`🗑️ Removed ${keysToRemove.length} old entries`);
        
        // First, try to clear any stuck backend state
        try {
          console.log('🔄 Clearing stuck backend state...');
          await fetch('http://127.0.0.1:3001/api/after-capture/clear', { method: 'POST' });
          console.log('✅ Backend state cleared');
        } catch (e) {
          console.log('Backend not responding, will retry...');
        }
        
        console.log('🚀 Triggering proactive scraping on page load...');
        const response = await fetch('http://127.0.0.1:3001/api/after-capture/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: window.location.origin })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Proactive scraping completed:', data);
          
          // Store ALL results in Local Storage
          if (data.success && data.data && data.data.results) {
            console.log('💾 Storing all results in Local Storage...');
            
            // Store individual results
            data.data.results.forEach((result: any) => {
              if (result.success && result.afterScreenshot) {
                const cacheKey = `preview_${window.location.href}_${result.elementId}`;
                const previewData = {
                  type: 'after-screenshot',
                  title: result.title,
                  description: result.isExternalNavigation 
                    ? `External page: ${result.externalUrl}` 
                    : `Result after clicking ${result.title}`,
                  afterScreenshot: result.afterScreenshot,
                  isExternalNavigation: result.isExternalNavigation,
                  externalUrl: result.externalUrl,
                  timestamp: result.timestamp || new Date().toISOString()
                };
                localStorage.setItem(cacheKey, JSON.stringify(previewData));
                console.log(`💾 Stored: ${result.elementId} (${result.title})`);
              }
            });
            
            // Store all results globally for tooltips to access
            localStorage.setItem('proactive_scrape_results', JSON.stringify(data.data.results));
            console.log('✅ All results stored in Local Storage!');
            // Show success message
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              type: 'ai',
              content: `🎉 Proactive scraping completed! Found ${data.data.results.length} clickable elements with screenshots. Hover over buttons to see previews!`,
              timestamp: new Date()
            }]);
          }
        } else {
          console.log('❌ Proactive scraping failed:', response.status);
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'ai',
            content: `❌ Scraping failed: ${response.status}`,
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        console.log('❌ Proactive scraping error:', error);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'ai',
          content: `❌ Scraping error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date()
        }]);
      } finally {
        isProcessing = false;
        setScraping(false);
      }
    };

    // Trigger after a delay to ensure page is fully loaded
    const timer = setTimeout(triggerProactiveScraping, 10000);
    return () => clearTimeout(timer);
  }, []);

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
        {/* Universal Proactive Scraper - DISABLED - using simpleAfterCapture instead */}
        {/* <UniversalProactiveScraper
          enabled={useProactiveMode}
          onScrapingComplete={(url, previews) => {
            console.log(`Universal tooltips ready for ${url}: ${previews.length} elements`);
            // Only add message to chat if companion is visible
            if (showCompanion) {
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                type: 'ai',
                content: `🚀 Universal tooltips ready for this page! ${previews.length} elements now have instant previews. Hover over any button or link to see what happens when you click it.`,
                timestamp: new Date()
              }]);
            }
          }}
          onScrapingError={(url, error) => {
            console.error('Universal tooltip error:', error);
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              type: 'ai',
              content: `❌ Universal tooltip setup failed for ${url}: ${error}`,
              timestamp: new Date()
            }]);
          }}
        /> */}
      
      <AuroraHero 
        hideText={showSettings} 
        onGetStarted={() => setShowCompanion(!showCompanion)} 
        useProactiveMode={useProactiveMode}
      />
      
      {/* Settings and Controls */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="fixed top-6 right-6 z-50 flex space-x-2"
      >
        <SimplePreviewTooltip
            targetUrl={window.location.href}
          elementId="proactive-mode-toggle"
        >
        <button
          id="proactive-mode-toggle"
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
        </SimplePreviewTooltip>
        
        <SimplePreviewTooltip
            targetUrl={window.location.href}
          elementId="settings-button"
          >
            <button
              id="settings-button"
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 hover:bg-white/10 rounded-full transition-all duration-300"
              title="Settings"
            >
              <Settings className="h-6 w-6 text-white" />
            </button>
        </SimplePreviewTooltip>
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
                  <Button
                    onClick={() => setShowSettings(false)}
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/10"
                    aria-label="Close settings"
                  >
                    <X className="h-4 w-4" />
                  </Button>
              </div>

              {/* Settings Content */}
              <div className="h-full overflow-y-auto p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Proactive Mode</span>
                    <button
                      onClick={() => setUseProactiveMode(!useProactiveMode)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        useProactiveMode ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        useProactiveMode ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
              </div>
                  <p className="text-gray-300 text-sm">
                    When enabled, automatically detects and wraps clickable elements with instant tooltips.
                  </p>
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Beautiful Draggable Glass Card Companion */}
      {/* Persistent Chat Component - Always rendered, visibility controlled by showCompanion */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: showCompanion ? 1 : 0, scale: showCompanion ? 1 : 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed z-50"
            style={{
              left: companionPosition.x,
              top: companionPosition.y,
              width: companionSize.width,
              height: companionSize.height,
          pointerEvents: showCompanion ? 'auto' : 'none',
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
                onClose={() => setShowCompanion(false)}
                className="w-full h-full"
              />
              {/* Resize handle */}
              <div className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500/50 hover:bg-blue-500/70 cursor-se-resize rounded-tl-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white/70 rounded-full"></div>
              </div>
            </div>
          </motion.div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <ScrapingProvider>
      <DashboardContent />
    </ScrapingProvider>
  );
};

export default Dashboard;
