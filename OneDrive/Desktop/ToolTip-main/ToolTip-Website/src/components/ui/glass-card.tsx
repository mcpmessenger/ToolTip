import * as React from "react";
import { 
  Instagram, 
  Twitter, 
  Github, 
  ChevronDown, 
  Send, 
  Search, 
  Play, 
  Zap, 
  Eye, 
  EyeOff, 
  Globe, 
  RefreshCw, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Image,
  Camera,
  MousePointer,
  X
} from "lucide-react";
const spiderImage = "/glippy.png";

const ULogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 29.667 31.69"
    {...props}
  >
    <path d="M12.827,1.628A1.561,1.561,0,0,1,14.31,0h2.964a1.561,1.561,0,0,1,1.483,1.628v11.9a9.252,9.252,0,0,1-2.432,6.852q-2.432,2.409-6.963,2.409T2.4,20.452Q0,18.094,0,13.669V1.628A1.561,1.561,0,0,1,1.483,0h2.98A1.561,1.561,0,0,1,5.947,1.628V13.191a5.635,5.635,0,0,0,.85,3.451,3.153,3.153,0,0,0,2.632,1.094,3.032,3.032,0,0,0,2.582-1.076,5.836,5.836,0,0,0,.816-3.486Z" />
    <path d="M75.207,20.857a1.561,1.561,0,0,1-1.483,1.628h-2.98a1.561,1.561,0,0,1-1.483-1.628V1.628A1.561,1.561,0,0,1,70.743,0h2.98a1.561,1.561,0,0,1,1.483,1.628Z" transform="translate(-45.91 0)" />
    <path d="M0,80.018A1.561,1.561,0,0,1,1.483,78.39h26.7a1.561,1.561,0,0,1,1.483,1.628v2.006a1.561,1.561,0,0,1-1.483,1.628H1.483A1.561,1.561,0,0,1,0,82.025Z" transform="translate(0 -51.963)" />
  </svg>
);

export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface ScrapingResults {
  url: string;
  elements: ScrapedElement[];
  totalElements: number;
  successfulPreviews: number;
  scrapedAt: string;
}

export interface ScrapedElement {
  id: string;
  tag: string;
  text: string;
  selector: string;
  allSelectors?: string[];
  coordinates: [number, number];
  visible: boolean;
  previewId?: string;
  previewUrl?: string;
  attributes?: {
    title?: string | null;
    'aria-label'?: string | null;
    'data-testid'?: string | null;
    href?: string | null;
    className?: string;
  };
}

export interface ScrapingStatus {
  isScraping: boolean;
  progress: number;
  currentElement: string;
  totalElements: number;
  completedElements: number;
  error: string | null;
}

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  onSendMessage?: (message: string) => void;
  messages?: Message[];
  isLoading?: boolean;
  onFileUpload?: (file: File) => void;
  onSearchClick?: () => void;
  onClose?: () => void;
  // Proactive scraping props
  targetUrl?: string;
  enableProactiveMode?: boolean;
  apiBaseUrl?: string;
  onScrapingStart?: (url: string) => void;
  onScrapingComplete?: (results: ScrapingResults) => void;
  onScrapingError?: (error: string) => void;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    className, 
    onSendMessage, 
    messages = [], 
    isLoading = false, 
    onFileUpload, 
    onSearchClick,
    onClose,
    targetUrl = window.location.href,
    enableProactiveMode = true,
    apiBaseUrl = 'http://localhost:3001',
    onScrapingStart,
    onScrapingComplete,
    onScrapingError,
    ...props 
  }, ref) => {
    const [inputValue, setInputValue] = React.useState('');
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const chatContainerRef = React.useRef<HTMLDivElement>(null);
    const clippyIconRef = React.useRef<HTMLDivElement>(null);
    
    // Drag state for chat window
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragPosition, setDragPosition] = React.useState({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
    
    // Proactive scraping state
    const [isProactiveMode, setIsProactiveMode] = React.useState(enableProactiveMode);
    const [scrapingStatus, setScrapingStatus] = React.useState<ScrapingStatus>({
      isScraping: false,
      progress: 0,
      currentElement: '',
      totalElements: 0,
      completedElements: 0,
      error: null
    });
    const [scrapingResults, setScrapingResults] = React.useState<ScrapingResults | null>(null);
    const [previewCache, setPreviewCache] = React.useState<Map<string, string>>(new Map());
    const [showScrapingPanel, setShowScrapingPanel] = React.useState(false);

    React.useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Proactive scraping functions
    const startProactiveScraping = React.useCallback(async () => {
      if (scrapingStatus.isScraping) return;

      setScrapingStatus(prev => ({
        ...prev,
        isScraping: true,
        progress: 0,
        currentElement: '',
        totalElements: 0,
        completedElements: 0,
        error: null
      }));

      try {
        onScrapingStart?.(targetUrl);

        // DISABLED - using simpleAfterCapture instead
        // const response = await fetch(`${apiBaseUrl}/api/proactive-scrape`, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({ url: targetUrl })
        // });

        // DISABLED - using simpleAfterCapture instead
        // if (!response.ok) {
        //   const errorData = await response.json();
        //   throw new Error(errorData.message || 'Failed to start proactive scraping');
        // }

        // DISABLED - using simpleAfterCapture instead
        // const data = await response.json();
        // setScrapingResults(data.data);
        // onScrapingComplete?.(data.data);

        // DISABLED - using simpleAfterCapture instead
        // Preload preview images
        // if (data.data.elements) {
        //   const previewPromises = data.data.elements
        //     .filter(el => el.previewId)
        //     .map(async (el) => {
        //       try {
        //         const previewResponse = await fetch(`${apiBaseUrl}/api/proactive-scrape/element-preview/${el.previewId}`);
        //         if (previewResponse.ok) {
        //           const blob = await previewResponse.blob();
        //           const previewUrl = URL.createObjectURL(blob);
        //           setPreviewCache(prev => new Map(prev).set(el.id, previewUrl));
        //         }
        //       } catch (err) {
        //         console.warn(`Failed to load preview for element ${el.id}:`, err);
        //       }
        //     });

        //   await Promise.all(previewPromises);
        // }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setScrapingStatus(prev => ({
          ...prev,
          isScraping: false,
          error: errorMessage
        }));
        onScrapingError?.(errorMessage);
      } finally {
        setScrapingStatus(prev => ({ ...prev, isScraping: false }));
      }
    }, [targetUrl, apiBaseUrl, scrapingStatus.isScraping, onScrapingStart, onScrapingComplete, onScrapingError]);

    const getElementPreview = React.useCallback((elementId: string): string | null => {
      return previewCache.get(elementId) || null;
    }, [previewCache]);

    const findElement = React.useCallback((selector?: string, text?: string): ScrapedElement | null => {
      if (!scrapingResults) return null;

      return scrapingResults.elements.find(element => {
        // Strategy 1: Exact selector match
        if (selector && element.selector === selector) return true;
        
        // Strategy 2: All selectors match
        if (selector && element.allSelectors?.includes(selector)) return true;
        
        // Strategy 3: Text content match (normalized)
        if (text) {
          const normalizedElementText = element.text.toLowerCase().replace(/[^\w\s]/g, '').trim();
          const normalizedTargetText = text.toLowerCase().replace(/[^\w\s]/g, '').trim();
          if (normalizedElementText.includes(normalizedTargetText) || 
              normalizedTargetText.includes(normalizedElementText)) return true;
        }
        
        // Strategy 4: Attribute matching
        if (element.attributes) {
          if (text && element.attributes.title?.toLowerCase().includes(text.toLowerCase())) return true;
          if (text && element.attributes['aria-label']?.toLowerCase().includes(text.toLowerCase())) return true;
          if (selector && element.attributes.href && selector.includes(element.attributes.href)) return true;
        }
        
        return false;
      }) || null;
    }, [scrapingResults]);

    // Auto-start scraping when proactive mode is enabled
    React.useEffect(() => {
      if (isProactiveMode && !scrapingResults && !scrapingStatus.isScraping) {
        startProactiveScraping();
      }
    }, [isProactiveMode, scrapingResults, scrapingStatus.isScraping, startProactiveScraping]);

    const handleSendMessage = () => {
      if (inputValue.trim() && onSendMessage) {
        onSendMessage(inputValue.trim());
        setInputValue('');
      }
    };

    const handleFreshCrawl = async () => {
      if (!inputValue.trim()) return;
      
      const url = inputValue.trim();
        // setIsLoading(true); // DISABLED
      
      try {
        // Add message to show we're starting fresh crawl
        const freshCrawlMessage: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: `🔄 Starting fresh crawl of ${url}...`,
          timestamp: new Date()
        };
        // setMessages(prev => [...prev, freshCrawlMessage]); // DISABLED
        
        // DISABLED - using simpleAfterCapture instead
        // Trigger proactive scraping for the URL
        // const response = await fetch('http://localhost:3001/api/proactive-scrape', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({ url }),
        // });

        // DISABLED - using simpleAfterCapture instead
        // if (!response.ok) {
        //   throw new Error(`Failed to start fresh crawl: ${response.statusText}`);
        // }

        // DISABLED - using simpleAfterCapture instead
        // const data = await response.json();
        // 
        // if (data.success) {
        //   const successMessage: Message = {
        //     id: (Date.now() + 1).toString(),
        //     type: 'ai',
        //     content: `✅ Fresh crawl completed! Found ${data.data.successfulPreviews}/${data.data.totalElements} clickable elements. Hover over any element to see instant previews!`,
        //     timestamp: new Date()
        //   };
        //   setMessages(prev => [...prev, successMessage]);
        // } else {
        //   throw new Error(data.message || 'Fresh crawl failed');
        // }
        
      } catch (error) {
        console.error('Fresh crawl error:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `❌ Fresh crawl failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date()
        };
        // setMessages(prev => [...prev, errorMessage]); // DISABLED
      } finally {
        // setIsLoading(false); // DISABLED
        setInputValue('');
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && onFileUpload) {
        onFileUpload(file);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files[0];
      if (file && onFileUpload) {
        onFileUpload(file);
      }
    };

    // Screenshot capture function - captures page behind chat window
    const handleScreenshot = React.useCallback(async () => {
      if (!onFileUpload) return;

      try {
        // Hide the chat window completely for clean screenshot of page behind
        const chatElement = chatContainerRef.current;
        const chatParent = chatElement?.parentElement;
        const originalDisplay = chatElement?.style.display || '';
        const originalVisibility = chatElement?.style.visibility || '';
        const originalOpacity = chatElement?.style.opacity || '';
        
        // Completely hide the chat window
        if (chatElement) {
          chatElement.style.display = 'none';
          chatElement.style.visibility = 'hidden';
          chatElement.style.opacity = '0';
        }

        // Small delay to ensure DOM is updated
        await new Promise(resolve => setTimeout(resolve, 100));

        // Try html2canvas to capture the page behind the window
        const html2canvas = (window as any).html2canvas;
        if (html2canvas && typeof html2canvas === 'function') {
          try {
            // Capture the entire document, excluding the chat window
            const canvas = await html2canvas(document.body || document.documentElement, {
              ignoreElements: (element: HTMLElement) => {
                // Ignore the entire chat container and its parent
                return chatElement?.contains(element) || chatParent?.contains(element) || element === chatElement || element === chatParent;
              },
              backgroundColor: null, // Transparent background to capture actual page
              scale: 1,
              useCORS: true,
              logging: false,
              windowWidth: window.innerWidth,
              windowHeight: window.innerHeight,
              allowTaint: true,
              removeContainer: false
            });

            canvas.toBlob((blob: Blob | null) => {
              // Restore chat window
              if (chatElement) {
                chatElement.style.display = originalDisplay || '';
                chatElement.style.visibility = originalVisibility || '';
                chatElement.style.opacity = originalOpacity || '';
              }

              if (blob) {
                const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
                onFileUpload(file);
              }
            }, 'image/png', 0.95);
            return;
          } catch (html2canvasError) {
            console.warn('html2canvas failed, trying alternative method:', html2canvasError);
            // Restore chat window on error
            if (chatElement) {
              chatElement.style.display = originalDisplay || '';
              chatElement.style.visibility = originalVisibility || '';
              chatElement.style.opacity = originalOpacity || '';
            }
          }
        }

        // Fallback: Use Screen Capture API if available (Chrome extension context)
        if ((window as any).chrome?.tabs?.captureVisibleTab) {
          try {
            (window as any).chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl: string) => {
              // Restore chat window
              if (chatElement) {
                chatElement.style.display = originalDisplay || '';
                chatElement.style.visibility = originalVisibility || '';
                chatElement.style.opacity = originalOpacity || '';
              }

              if (dataUrl) {
                // Convert data URL to blob
                fetch(dataUrl)
                  .then(res => res.blob())
                  .then(blob => {
                    const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
                    onFileUpload(file);
                  })
                  .catch(console.error);
              }
            });
            return;
          } catch (chromeError) {
            console.warn('Chrome captureVisibleTab failed:', chromeError);
          }
        }

        // Final fallback: Use backend service to take screenshot via Playwright
        try {
          const response = await fetch(`${apiBaseUrl}/api/screenshot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: window.location.href,
              width: window.innerWidth,
              height: window.innerHeight
            })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.imageData) {
              // Restore chat window
              if (chatElement) {
                chatElement.style.display = originalDisplay || '';
                chatElement.style.visibility = originalVisibility || '';
                chatElement.style.opacity = originalOpacity || '';
              }

              // Convert base64 data URL to blob
              const base64Data = data.imageData.split(',')[1]; // Remove data:image/png;base64, prefix
              const byteCharacters = atob(base64Data);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: 'image/png' });
              const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
              onFileUpload(file);
              return;
            }
          }
        } catch (backendError) {
          console.warn('Backend screenshot service failed:', backendError);
        }

        // Ultimate fallback: Show error
        if (chatElement) {
          chatElement.style.display = originalDisplay || '';
          chatElement.style.visibility = originalVisibility || '';
          chatElement.style.opacity = originalOpacity || '';
        }
        throw new Error('Screenshot capture failed - html2canvas library may be required');
      } catch (error) {
        console.error('Screenshot capture failed:', error);
        // Restore chat window on error
        const chatElement = chatContainerRef.current;
        if (chatElement) {
          chatElement.style.display = '';
        }
        alert('Screenshot capture failed. Please install html2canvas or use a browser extension that supports page capture.');
      }
    }, [onFileUpload, apiBaseUrl]);

    // Drag handlers for chat window
    const handleDragStart = React.useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      if (!chatContainerRef.current) return;
      
      setIsDragging(true);
      const rect = chatContainerRef.current.getBoundingClientRect();
      const currentX = dragPosition.x || rect.left;
      const currentY = dragPosition.y || rect.top;
      
      setDragOffset({
        x: e.clientX - currentX,
        y: e.clientY - currentY
      });
    }, [dragPosition]);

    const handleDragMove = React.useCallback((e: MouseEvent) => {
      if (!isDragging) return;
      
      setDragPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }, [isDragging, dragOffset]);

    const handleDragEnd = React.useCallback(() => {
      setIsDragging(false);
    }, []);

    React.useEffect(() => {
      if (isDragging) {
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);
        return () => {
          window.removeEventListener('mousemove', handleDragMove);
          window.removeEventListener('mouseup', handleDragEnd);
        };
      }
    }, [isDragging, handleDragMove, handleDragEnd]);
    return (
      <div
        ref={ref}
        className={`group h-full w-full [perspective:1000px] ${className}`}
        style={{
          ...(dragPosition.x || dragPosition.y ? {
            position: 'fixed',
            left: dragPosition.x || undefined,
            top: dragPosition.y || undefined,
          } : {}),
          ...(isDragging ? { cursor: 'grabbing', userSelect: 'none' } : {})
        }}
        {...props}
      >
        <div 
          ref={chatContainerRef}
          className="relative h-full rounded-[50px] bg-gradient-to-br from-zinc-900 to-black shadow-2xl transition-all duration-500 ease-in-out [transform-style:preserve-3d] group-hover:[box-shadow:rgba(0,0,0,0.3)_30px_50px_25px_-40px,rgba(0,0,0,0.1)_0px_25px_30px_0px] group-hover:[transform:rotate3d(1,1,0,30deg)]"
          style={{
            ...(isDragging ? { transition: 'none' } : {})
          }}
        >
          <div className="absolute inset-2 rounded-[55px] border-b border-l border-white/20 bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-sm [transform-style:preserve-3d] [transform:translate3d(0,0,25px)]"></div>
          <div className="absolute [transform:translate3d(0,0,26px)] h-full w-full flex flex-col">
            {/* Header */}
            <div className="px-7 pt-6 pb-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-white">
                      Tooltip Companion
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setShowScrapingPanel(!showScrapingPanel)}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        title="Proactive Scraping"
                      >
                        <Globe className="h-4 w-4 text-white" />
                      </button>
                      <button
                        onClick={onSearchClick}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        title="Search"
                      >
                        <Search className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-zinc-400">
                      Advanced scraping with Playwright
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Proactive Mode Toggle */}
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-zinc-400">Proactive</span>
                        <button
                          onClick={() => setIsProactiveMode(!isProactiveMode)}
                          className={`relative w-8 h-4 rounded-full transition-colors ${
                            isProactiveMode ? 'bg-green-500' : 'bg-gray-600'
                          }`}
                          title={isProactiveMode ? 'Disable Proactive Mode' : 'Enable Proactive Mode'}
                        >
                          <div
                            className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                              isProactiveMode ? 'translate-x-4' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                      
                      {/* Scraping Status Indicator */}
                      {scrapingStatus.isScraping && (
                        <div className="flex items-center gap-1 text-xs text-blue-400">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          <span>Scraping...</span>
                        </div>
                      )}
                      
                      {scrapingResults && !scrapingStatus.isScraping && (
                        <div className="flex items-center gap-1 text-xs text-green-400">
                          <CheckCircle className="h-3 w-3" />
                          <span>{scrapingResults.successfulPreviews}/{scrapingResults.totalElements}</span>
                        </div>
                      )}
                      
                      {scrapingStatus.error && (
                        <div className="flex items-center gap-1 text-xs text-red-400">
                          <AlertCircle className="h-3 w-3" />
                          <span>Error</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
            
            {/* Proactive Scraping Panel */}
            {showScrapingPanel && (
              <div className="px-7 py-2 border-b border-white/10 relative z-10">
                <div className="bg-white/5 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium text-sm">Proactive Scraping</h3>
                    <button
                      onClick={() => setShowScrapingPanel(false)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <X className="h-3 w-3 text-white/60" />
                    </button>
                  </div>
                  
                  {/* Scraping Status */}
                  {scrapingStatus.isScraping && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
                        <span className="text-white text-sm">Scraping page...</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${scrapingStatus.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-white/60">
                        {scrapingStatus.completedElements}/{scrapingStatus.totalElements} elements
                      </p>
                    </div>
                  )}

                  {/* Results Summary */}
                  {scrapingResults && !scrapingStatus.isScraping && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-white text-sm">Scraping Complete</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/5 rounded p-2">
                          <div className="text-white/60">Elements Found</div>
                          <div className="text-white font-semibold">{scrapingResults.totalElements}</div>
                        </div>
                        <div className="bg-white/5 rounded p-2">
                          <div className="text-white/60">Previews Generated</div>
                          <div className="text-white font-semibold">{scrapingResults.successfulPreviews}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {scrapingStatus.error && (
                    <div className="flex items-center gap-2 p-2 bg-red-500/20 border border-red-500/30 rounded">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <span className="text-red-200 text-xs">{scrapingStatus.error}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={startProactiveScraping}
                      disabled={scrapingStatus.isScraping}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded text-xs text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="h-3 w-3" />
                      <span>Start Scraping</span>
                    </button>
                    <button
                      onClick={() => setPreviewCache(new Map())}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded text-xs text-white transition-colors"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Clear Cache</span>
                    </button>
                  </div>

                  {/* Element List */}
                  {scrapingResults && (
                    <div className="space-y-1">
                      <h4 className="text-white font-medium text-xs">Detected Elements</h4>
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {scrapingResults.elements.slice(0, 5).map((element) => (
                          <div
                            key={element.id}
                            className="flex items-center gap-2 p-1.5 bg-white/5 rounded hover:bg-white/10 transition-colors"
                          >
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                            <span className="text-white text-xs flex-1 truncate">
                              {element.text || element.attributes?.title || element.tag}
                            </span>
                            {element.previewId && (
                              <Image className="w-3 h-3 text-green-400" />
                            )}
                          </div>
                        ))}
                        {scrapingResults.elements.length > 5 && (
                          <div className="text-xs text-white/60 text-center">
                            +{scrapingResults.elements.length - 5} more elements
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 px-7 py-2 overflow-y-auto space-y-3 relative z-10">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-xl text-sm transition-all duration-300 hover:scale-[1.02] ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-100 ml-6 border border-blue-400/20'
                      : 'bg-gradient-to-r from-white/10 to-white/5 text-white mr-6 border border-white/10'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-2 text-xs opacity-70 mb-2">
                    <div className={`w-2 h-2 rounded-full ${
                      message.type === 'user' ? 'bg-blue-400' : 'bg-green-400'
                    }`}></div>
                    <span className="font-medium">
                      {message.type === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    <span>•</span>
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-white/10 to-white/5 text-white mr-6 border border-white/10 animate-pulse">
                  <div className="flex items-center gap-2 text-xs opacity-70 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="font-medium">AI Assistant</span>
                    <span>•</span>
                    <span>Thinking...</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div className="px-7 pb-6 relative z-10">
              <div 
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 hover:border-white/30 transition-colors relative z-20"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input 
                  type="text" 
                  placeholder={isProactiveMode ? "Proactive mode - Enter URL to scrape..." : "Enter URL for fresh crawl or drag & drop a file..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-zinc-300 border-none outline-none relative z-30 text-left"
                  style={{ textAlign: 'left' }}
                />
                
                {/* Camera/Screenshot Button - Always visible */}
                <button 
                  onClick={handleScreenshot}
                  disabled={isLoading}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative z-30"
                  title="Take screenshot of current page for OCR"
                >
                  <Camera className="h-4 w-4 text-white" />
                </button>
                
                {/* Fresh Crawl Button - Always visible */}
                <button 
                  onClick={handleFreshCrawl}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative z-30"
                  title="Fresh Crawl - Crawl any page for instant tooltips"
                >
                  <RefreshCw className="h-4 w-4 text-white" />
                </button>
                
                {isProactiveMode ? (
                  <button 
                    onClick={startProactiveScraping}
                    disabled={scrapingStatus.isScraping}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative z-30"
                    title="Start Proactive Scraping"
                  >
                    <Play className="h-4 w-4 text-white" />
                  </button>
                ) : (
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative z-30"
                  >
                    <Send className="h-4 w-4 text-white" />
                  </button>
                )}
              </div>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".txt,.pdf,.doc,.docx,.md,.json,.csv"
              />
              
              {/* Quick actions */}
              <div className="mt-2 flex gap-2 text-xs text-zinc-400">
                {isProactiveMode ? (
                  <>
                    <span>Proactive scraping enabled</span>
                    <span>•</span>
                    <span>Click Play to start</span>
                  </>
                ) : (
                  <>
                    <span>Press Enter to crawl</span>
                    <span>•</span>
                    <span>Drag files to upload</span>
                    <span>•</span>
                    <span>Click camera for screenshot</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 [transform-style:preserve-3d]">
            {[
              { size: "170px", pos: "8px", z: "20px", delay: "0s" },
              { size: "140px", pos: "10px", z: "40px", delay: "0.4s" },
              { size: "110px", pos: "17px", z: "60px", delay: "0.8s" },
              { size: "80px", pos: "23px", z: "80px", delay: "1.2s" },
            ].map((circle, index) => (
              <div
                key={index}
                className="absolute aspect-square rounded-full bg-white/10 shadow-[rgba(100,100,111,0.2)_-10px_10px_20px_0px] transition-all duration-500 ease-in-out"
                style={{
                  width: circle.size,
                  top: circle.pos,
                  right: circle.pos,
                  transform: `translate3d(0, 0, ${circle.z})`,
                  transitionDelay: circle.delay,
                }}
              ></div>
            ))}
            <div
              ref={clippyIconRef}
              className="absolute transition-all duration-500 ease-in-out [transform:translate3d(0,0,100px)] [transition-delay:1.6s] group-hover:[transform:translate3d(0,0,120px)] cursor-grab active:cursor-grabbing z-50"
              style={{ top: "20px", right: "20px" }}
              onMouseDown={handleDragStart}
              title="Drag from here to move chat window"
            >
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white/30 transition-colors select-none">
                <img src={spiderImage} alt="Clippy - Drag to move" className="w-12 h-12 pointer-events-none user-select-none" draggable={false} />
              </div>
            </div>
            
            {/* Close Button - Bottom Left */}
            <button
              onClick={onClose}
              className="absolute bottom-4 left-4 p-2 hover:bg-white/20 rounded-full transition-colors z-50"
              title="Close Tooltip Companion"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;