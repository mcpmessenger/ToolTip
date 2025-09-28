import React, { useState, useCallback, useEffect } from 'react';
import GlassCard, { Message } from '../components/ui/glass-card';
import { AuroraHero } from '../components/ui/futurastic-hero-section';
import { Button } from '../components/ui/button';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// import { AutoInstantTooltip } from '../components/AutoInstantTooltip'; // DISABLED - causing conflicts
// import { InstantTooltip } from '../components/InstantTooltip'; // DISABLED - causing conflicts
import { SimplePreviewTooltip } from '../components/SimplePreviewTooltip';
import { SpiderVideoLoader } from '../components/SpiderVideoLoader';
import { ScrapingProvider, useScraping } from '../contexts/ScrapingContext';
import { GlobalButtonWrapper } from '../components/GlobalButtonWrapper';
// import { UniversalProactiveScraper } from '../components/UniversalProactiveScraper'; // DISABLED - using simpleAfterCapture instead

const DashboardContent: React.FC = () => {
  const [showCompanion, setShowCompanion] = useState(false); // Hidden by default, show on Get Started
  const [useProactiveMode, setUseProactiveMode] = useState(true); // Enable by default for Chrome extension
  
  // Simplified companion state
  const [companionPosition, setCompanionPosition] = useState({ 
    x: typeof window !== 'undefined' ? 50 : 50, 
    y: typeof window !== 'undefined' ? window.innerHeight - 400 : 100 
  });
  const [companionSize, setCompanionSize] = useState({ width: 350, height: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Ready! Hover over buttons to see previews.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const { setScraping, isScraping } = useScraping();

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
          body: JSON.stringify({ url: window.location.href })
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
            console.log('📊 Results summary:', {
              total: data.data.results.length,
              successful: data.data.results.filter((r: any) => r.success).length,
              withScreenshots: data.data.results.filter((r: any) => r.afterScreenshot).length,
              elementIds: data.data.results.map((r: any) => r.elementId)
            });
            // Show success message
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              type: 'ai',
              content: `🎉 Proactive scraping completed! Found ${data.data.results.length} clickable elements with screenshots (processing up to 20 elements for better external link coverage). Hover over buttons and links to see previews!`,
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


  const handleCompanionMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - companionPosition.x,
        y: e.clientY - companionPosition.y
      });
      e.preventDefault();
    }
  };

  const handleCompanionMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setCompanionPosition({ x: newX, y: newY });
    }
  }, [isDragging, dragStart]);

  const handleCompanionMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleCompanionMouseMove);
      document.addEventListener('mouseup', handleCompanionMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleCompanionMouseMove);
        document.removeEventListener('mouseup', handleCompanionMouseUp);
      };
    }
  }, [isDragging, handleCompanionMouseMove, handleCompanionMouseUp]);

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
        hideText={false} 
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
          className={`p-2 rounded-full transition-all duration-300 ${
            useProactiveMode 
              ? 'bg-green-500/20 hover:bg-green-500/30' 
              : 'hover:bg-white/10'
          }`}
          title={useProactiveMode ? 'Proactive Mode ON' : 'Proactive Mode OFF'}
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-900/90 border border-gray-700">
            <SpiderVideoLoader 
              size={32} 
              text="" 
              showText={false}
            />
          </div>
        </button>
        </SimplePreviewTooltip>
        
        
      </motion.div>




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
                onClose={() => setShowCompanion(false)}
                className="w-full h-full"
              />
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
