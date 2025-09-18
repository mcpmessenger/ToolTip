import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { HoverGif } from './HoverGif';

interface SimplePageScannerProps {
  onScanComplete?: (result: any) => void;
}

export const SimplePageScanner: React.FC<SimplePageScannerProps> = ({ onScanComplete }) => {
  const [url, setUrl] = useState('https://github.com/mcpmessenger/ToolTip');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const scanPage = async () => {
    if (!url.trim()) return;

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      console.log('Scanning page:', url);
      
      // For now, we'll simulate scanning with some common elements
      // In a real implementation, this would call the backend API
      const mockResult = {
        pageUrl: url,
        elements: [
          {
            id: 'repo-link',
            selector: '.repository-content',
            text: 'Repository Content',
            tagName: 'div',
            targetUrl: url,
            actionType: 'link' as const
          },
          {
            id: 'readme-link',
            selector: '[data-testid="readme-tab"]',
            text: 'README',
            tagName: 'a',
            targetUrl: `${url}#readme`,
            actionType: 'link' as const
          },
          {
            id: 'issues-link',
            selector: '[data-testid="issues-tab"]',
            text: 'Issues',
            tagName: 'a',
            targetUrl: `${url}/issues`,
            actionType: 'link' as const
          }
        ],
        timestamp: Date.now(),
        totalElements: 3
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setScanResult(mockResult);
      onScanComplete?.(mockResult);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Page scan error:', errorMessage);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Page Scanner Demo</CardTitle>
          <CardDescription>
            Enter a URL to scan for clickable elements and generate hover previews.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL to scan..."
              className="flex-1"
            />
            <Button 
              onClick={scanPage} 
              disabled={isScanning || !url.trim()}
              className="px-6"
            >
              {isScanning ? 'Scanning...' : 'Scan Page'}
            </Button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error: {error}
            </div>
          )}

          {isScanning && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                Scanning page for clickable elements...
              </div>
            </div>
          )}

          {scanResult && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              ✅ Found {scanResult.totalElements} clickable elements on {scanResult.pageUrl}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo Elements */}
      {scanResult && (
        <Card>
          <CardHeader>
            <CardTitle>🎬 Hover Demo</CardTitle>
            <CardDescription>
              Hover over these buttons to see previews of what happens when clicked:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scanResult.elements.map((element: any) => (
                <HoverGif
                  key={element.id}
                  targetUrl={element.targetUrl}
                  elementSelector="body"
                  waitTime={1.0}
                >
                  <Button 
                    variant="outline" 
                    className="w-full h-20 flex flex-col items-center justify-center gap-2"
                  >
                    <span className="font-semibold">{element.text}</span>
                    <span className="text-xs text-muted-foreground">{element.tagName}</span>
                  </Button>
                </HoverGif>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Scan Results:</h4>
              <pre className="text-xs overflow-auto max-h-40">
                {JSON.stringify(scanResult, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
