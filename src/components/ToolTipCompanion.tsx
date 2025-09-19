import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  X, 
  Play, 
  Zap, 
  Search, 
  Download, 
  RefreshCw,
  Eye,
  EyeOff,
  Globe,
  MousePointer,
  Image,
  Code,
  Database,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ToolTipCompanionProps {
  /** Target URL to scrape */
  targetUrl?: string;
  /** Whether to enable proactive scraping mode */
  enableProactiveMode?: boolean;
  /** API base URL for backend services */
  apiBaseUrl?: string;
  /** Custom styling */
  className?: string;
  /** Position of the companion */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Size of the companion */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show the companion by default */
  defaultOpen?: boolean;
  /** Callback when scraping starts */
  onScrapingStart?: (url: string) => void;
  /** Callback when scraping completes */
  onScrapingComplete?: (results: ScrapingResults) => void;
  /** Callback when an error occurs */
  onError?: (error: string) => void;
}

interface ScrapingResults {
  url: string;
  elements: ScrapedElement[];
  totalElements: number;
  successfulPreviews: number;
  scrapedAt: string;
}

interface ScrapedElement {
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

interface ScrapingStatus {
  isScraping: boolean;
  progress: number;
  currentElement: string;
  totalElements: number;
  completedElements: number;
}

export const ToolTipCompanion: React.FC<ToolTipCompanionProps> = ({
  targetUrl = window.location.href,
  enableProactiveMode = true,
  apiBaseUrl = 'http://localhost:3001',
  className = '',
  position = 'bottom-right',
  size = 'medium',
  defaultOpen = true,
  onScrapingStart,
  onScrapingComplete,
  onError
}) => {
  // State management
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isProactiveMode, setIsProactiveMode] = useState(enableProactiveMode);
  const [scrapingStatus, setScrapingStatus] = useState<ScrapingStatus>({
    isScraping: false,
    progress: 0,
    currentElement: '',
    totalElements: 0,
    completedElements: 0
  });
  const [scrapingResults, setScrapingResults] = useState<ScrapingResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewCache, setPreviewCache] = useState<Map<string, string>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    waitTime: 2.0,
    enableCaching: true,
    enableLogging: true,
    maxElements: 50,
    quality: 80
  });

  const companionRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Size configurations
  const sizeConfig = {
    small: { width: 320, height: 400 },
    medium: { width: 400, height: 500 },
    large: { width: 500, height: 600 }
  };

  // Position configurations
  const positionConfig = {
    'bottom-right': { right: 20, bottom: 20 },
    'bottom-left': { left: 20, bottom: 20 },
    'top-right': { right: 20, top: 20 },
    'top-left': { left: 20, top: 20 }
  };

  // Start proactive scraping
  const startProactiveScraping = useCallback(async () => {
    if (scrapingStatus.isScraping) return;

    setScrapingStatus({
      isScraping: true,
      progress: 0,
      currentElement: '',
      totalElements: 0,
      completedElements: 0
    });
    setError(null);

    try {
      onScrapingStart?.(targetUrl);

      const response = await fetch(`${apiBaseUrl}/api/proactive-scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: targetUrl,
          settings: {
            waitTime: settings.waitTime,
            maxElements: settings.maxElements,
            quality: settings.quality
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start proactive scraping');
      }

      const data = await response.json();
      setScrapingResults(data.data);
      onScrapingComplete?.(data.data);

      // Preload preview images
      if (data.data.elements) {
        const previewPromises = data.data.elements
          .filter(el => el.previewId)
          .map(async (el) => {
            try {
              const previewResponse = await fetch(`${apiBaseUrl}/api/proactive-scrape/element-preview/${el.previewId}`);
              if (previewResponse.ok) {
                const blob = await previewResponse.blob();
                const previewUrl = URL.createObjectURL(blob);
                setPreviewCache(prev => new Map(prev).set(el.id, previewUrl));
              }
            } catch (err) {
              console.warn(`Failed to load preview for element ${el.id}:`, err);
            }
          });

        await Promise.all(previewPromises);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setScrapingStatus(prev => ({ ...prev, isScraping: false }));
    }
  }, [targetUrl, apiBaseUrl, settings, onScrapingStart, onScrapingComplete, onError]);

  // Get element preview
  const getElementPreview = useCallback((elementId: string): string | null => {
    return previewCache.get(elementId) || null;
  }, [previewCache]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (e.target !== dragRef.current) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position]);

  // Handle drag move
  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Set up drag event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Auto-start scraping when proactive mode is enabled
  useEffect(() => {
    if (isProactiveMode && !scrapingResults && !scrapingStatus.isScraping) {
      startProactiveScraping();
    }
  }, [isProactiveMode, scrapingResults, scrapingStatus.isScraping, startProactiveScraping]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewCache.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewCache]);

  return (
    <>
      {/* Main Companion */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={companionRef}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`fixed z-50 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl ${className}`}
            style={{
              width: sizeConfig[size].width,
              height: sizeConfig[size].height,
              ...positionConfig[position],
              left: position.x || positionConfig[position].left,
              top: position.y || positionConfig[position].top,
              right: position.x ? 'auto' : positionConfig[position].right,
              bottom: position.y ? 'auto' : positionConfig[position].bottom,
            }}
          >
            {/* Header */}
            <div
              ref={dragRef}
              className="flex items-center justify-between p-4 border-b border-white/10 cursor-move"
              onMouseDown={handleDragStart}
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="text-white font-semibold">ToolTip Companion</h3>
                <span className="text-xs text-white/60">v1.1</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="w-4 h-4 text-white/80" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4 text-white/80" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {/* Proactive Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-white/80" />
                  <span className="text-white font-medium">Proactive Mode</span>
                </div>
                <button
                  onClick={() => setIsProactiveMode(!isProactiveMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isProactiveMode ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      isProactiveMode ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Scraping Status */}
              {scrapingStatus.isScraping && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-white text-sm">Scraping page...</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${scrapingStatus.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/60">
                    {scrapingStatus.completedElements}/{scrapingStatus.totalElements} elements
                  </p>
                </div>
              )}

              {/* Results Summary */}
              {scrapingResults && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">Scraping Complete</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-white/60">Elements Found</div>
                      <div className="text-white font-semibold">{scrapingResults.totalElements}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-white/60">Previews Generated</div>
                      <div className="text-white font-semibold">{scrapingResults.successfulPreviews}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-200 text-sm">{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={startProactiveScraping}
                  disabled={scrapingStatus.isScraping}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Scraping</span>
                </button>

                <button
                  onClick={() => setPreviewCache(new Map())}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Clear Cache</span>
                </button>
              </div>

              {/* Element List */}
              {scrapingResults && (
                <div className="space-y-2">
                  <h4 className="text-white font-medium text-sm">Detected Elements</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {scrapingResults.elements.map((element) => (
                      <div
                        key={element.id}
                        className="flex items-center space-x-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-white text-xs flex-1 truncate">
                          {element.text || element.attributes?.title || element.tag}
                        </span>
                        {element.previewId && (
                          <Image className="w-3 h-3 text-green-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white/80" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Wait Time (seconds)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={settings.waitTime}
                    onChange={(e) => setSettings(prev => ({ ...prev, waitTime: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Max Elements
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.maxElements}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxElements: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Quality (%)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={settings.quality}
                    onChange={(e) => setSettings(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enableCaching"
                    checked={settings.enableCaching}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableCaching: e.target.checked }))}
                    className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="enableCaching" className="text-white text-sm">
                    Enable Caching
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enableLogging"
                    checked={settings.enableLogging}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableLogging: e.target.checked }))}
                    className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="enableLogging" className="text-white text-sm">
                    Enable Logging
                  </label>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={() => setIsOpen(true)}
          className="fixed z-50 w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg flex items-center justify-center transition-colors"
          style={{
            ...positionConfig[position],
            right: positionConfig[position].right,
            bottom: positionConfig[position].bottom,
            left: positionConfig[position].left,
            top: positionConfig[position].top,
          }}
          title="Open ToolTip Companion"
        >
          <MousePointer className="w-6 h-6 text-white" />
        </motion.button>
      )}
    </>
  );
};

// Export the component and types
export default ToolTipCompanion;
export type { ToolTipCompanionProps, ScrapingResults, ScrapedElement, ScrapingStatus };
