import React, { useEffect, useState, useCallback } from 'react';
import { HoverGif } from './HoverGif';

interface ClickableElement {
  id: string;
  selector: string;
  text: string;
  tagName: string;
  href?: string;
  targetUrl?: string;
  actionType: 'link' | 'button' | 'form' | 'custom';
  previewId?: string;
}

interface ScanResult {
  pageUrl: string;
  elements: ClickableElement[];
  timestamp: number;
  totalElements: number;
}

interface UniversalHoverWrapperProps {
  children: React.ReactNode;
  autoScan?: boolean;
  onScanComplete?: (result: ScanResult) => void;
  onScanError?: (error: string) => void;
}

export const UniversalHoverWrapper: React.FC<UniversalHoverWrapperProps> = ({
  children,
  autoScan = true,
  onScanComplete,
  onScanError
}) => {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const scanCurrentPage = useCallback(async () => {
    if (isScanning) return;

    setIsScanning(true);
    setScanError(null);

    try {
      const currentUrl = window.location.href;
      console.log('Starting page scan for:', currentUrl);

      // Check if we already have cached results
      const cachedResponse = await fetch(`/api/scan-results/${encodeURIComponent(currentUrl)}`);
      
      if (cachedResponse.ok) {
        const cached = await cachedResponse.json();
        setScanResult(cached.data);
        onScanComplete?.(cached.data);
        setIsScanning(false);
        return;
      }

      // Start new scan
      const response = await fetch('/api/scan-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: currentUrl })
      });

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.statusText}`);
      }

      const result = await response.json();
      setScanResult(result.data);
      onScanComplete?.(result.data);
      
      console.log(`Page scan completed: ${result.data.totalElements} elements found`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Page scan error:', errorMessage);
      setScanError(errorMessage);
      onScanError?.(errorMessage);
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, onScanComplete, onScanError]);

  // Auto-scan on mount if enabled
  useEffect(() => {
    if (autoScan && !scanResult && !isScanning) {
      scanCurrentPage();
    }
  }, [autoScan, scanResult, isScanning, scanCurrentPage]);

  // Create a map of selectors to elements for quick lookup
  const elementMap = React.useMemo(() => {
    if (!scanResult) return new Map();
    
    const map = new Map<string, ClickableElement>();
    scanResult.elements.forEach(element => {
      map.set(element.selector, element);
    });
    return map;
  }, [scanResult]);

  // Wrap clickable elements with HoverGif
  const wrapChildren = useCallback((children: React.ReactNode): React.ReactNode => {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;

      const element = child as React.ReactElement;
      const props = element.props;

      // Check if this element matches any of our scanned elements
      let matchingElement: ClickableElement | undefined;
      
      // Try to match by className, id, or other attributes
      if (props.className) {
        const classNameMatch = Array.from(elementMap.keys()).find(selector => 
          selector.includes(props.className.split(' ')[0])
        );
        if (classNameMatch) {
          matchingElement = elementMap.get(classNameMatch);
        }
      }

      if (props.id) {
        const idMatch = Array.from(elementMap.keys()).find(selector => 
          selector.includes(props.id)
        );
        if (idMatch) {
          matchingElement = elementMap.get(idMatch);
        }
      }

      // If we found a matching element with a preview, wrap it
      if (matchingElement && matchingElement.previewId && matchingElement.targetUrl) {
        return (
          <HoverGif
            key={matchingElement.id}
            targetUrl={matchingElement.targetUrl}
            elementSelector="body"
            waitTime={1.0}
            previewId={matchingElement.previewId}
          >
            {element}
          </HoverGif>
        );
      }

      // Recursively wrap children
      if (props.children) {
        return React.cloneElement(element, {
          ...props,
          children: wrapChildren(props.children)
        });
      }

      return element;
    });
  }, [elementMap]);

  // Show scanning status
  if (isScanning) {
    return (
      <div className="relative">
        {children}
        <div className="fixed top-4 left-4 z-50 bg-blue-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Scanning page for clickable elements...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show scan error
  if (scanError) {
    return (
      <div className="relative">
        {children}
        <div className="fixed top-4 left-4 z-50 bg-red-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <span>⚠️ Scan failed: {scanError}</span>
            <button 
              onClick={scanCurrentPage}
              className="ml-2 px-2 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show scan results summary
  if (scanResult) {
    return (
      <div className="relative">
        {wrapChildren(children)}
        <div className="fixed bottom-4 left-4 z-50 bg-green-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <span>✅ Found {scanResult.totalElements} clickable elements</span>
            <button 
              onClick={scanCurrentPage}
              className="ml-2 px-2 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
            >
              Rescan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Hook for manual control
export const usePageScanner = () => {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanPage = useCallback(async (url?: string) => {
    const targetUrl = url || window.location.href;
    setIsScanning(true);
    setError(null);

    try {
      const response = await fetch('/api/scan-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.statusText}`);
      }

      const result = await response.json();
      setScanResult(result.data);
      return result.data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsScanning(false);
    }
  }, []);

  const clearCache = useCallback(async () => {
    try {
      await fetch('/api/scan-cache', { method: 'DELETE' });
      setScanResult(null);
      setError(null);
    } catch (err) {
      console.error('Failed to clear cache:', err);
    }
  }, []);

  return {
    scanResult,
    isScanning,
    error,
    scanPage,
    clearCache
  };
};
