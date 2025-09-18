import React, { useState, useEffect } from 'react';
import { HoverGif } from './HoverGif';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { getPageElements, PageElement } from '../api/crawler';

export const GifCrawlDemo: React.FC = () => {
  const [url, setUrl] = useState('https://example.com');
  const [elements, setElements] = useState<PageElement[]>([]);
  const [isLoadingElements, setIsLoadingElements] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);

  const handleAnalyzePage = async () => {
    if (!url) return;
    
    setIsLoadingElements(true);
    try {
      const pageElements = await getPageElements(url);
      setElements(pageElements);
    } catch (error) {
      console.error('Error analyzing page:', error);
    } finally {
      setIsLoadingElements(false);
    }
  };

  const fetchCacheStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cache/stats');
      const data = await response.json();
      setCacheStats(data);
    } catch (error) {
      console.error('Error fetching cache stats:', error);
    }
  };

  const clearCache = async () => {
    try {
      await fetch('http://localhost:3001/api/cache/clear', { method: 'POST' });
      await fetchCacheStats();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  useEffect(() => {
    fetchCacheStats();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>GIF Crawl Demo</CardTitle>
          <CardDescription>
            Hover over elements below to see animated previews of what happens when you click them.
            This uses Playwright to capture screenshots and generate GIFs showing the interaction.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL to analyze..."
              className="flex-1"
            />
            <Button 
              onClick={handleAnalyzePage}
              disabled={isLoadingElements}
            >
              {isLoadingElements ? 'Analyzing...' : 'Analyze Page'}
            </Button>
          </div>
          
          {elements.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Found {elements.length} clickable elements. Hover over the buttons below to see previews:
              </p>
              <div className="flex flex-wrap gap-2">
                {elements.slice(0, 10).map((element, index) => (
                  <HoverGif
                    key={index}
                    targetUrl={url}
                    elementSelector={element.selector}
                    elementText={element.text}
                    coordinates={element.coordinates}
                  >
                    <Button variant="outline" size="sm">
                      {element.text || `${element.tag} #${index + 1}`}
                    </Button>
                  </HoverGif>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Example Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Button with Selector</CardTitle>
            <CardDescription>
              Uses CSS selector to target element
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HoverGif
              targetUrl="https://example.com"
              elementSelector="button"
            >
              <Button>Click Me (Selector)</Button>
            </HoverGif>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Link with Text</CardTitle>
            <CardDescription>
              Uses text content to find element
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HoverGif
              targetUrl="https://example.com"
              elementText="More information"
            >
              <Button variant="link">More information</Button>
            </HoverGif>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Custom Coordinates</CardTitle>
            <CardDescription>
              Clicks at specific x,y coordinates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HoverGif
              targetUrl="https://example.com"
              coordinates={[100, 50]}
            >
              <Button variant="secondary">Click at (100, 50)</Button>
            </HoverGif>
          </CardContent>
        </Card>
      </div>

          {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Management</CardTitle>
          <CardDescription>
            Monitor and manage the GIF cache for optimal performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cacheStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {cacheStats.cache?.keys || 0}
                </div>
                <div className="text-sm text-blue-600">Cached GIFs</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {cacheStats.cache?.hits || 0}
                </div>
                <div className="text-sm text-green-600">Cache Hits</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {cacheStats.active_crawls || 0}
                </div>
                <div className="text-sm text-orange-600">Active Crawls</div>
              </div>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button onClick={fetchCacheStats} variant="outline" size="sm">
              Refresh Stats
            </Button>
            <Button onClick={clearCache} variant="destructive" size="sm">
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold">Hover Detection</h3>
              <p className="text-sm text-gray-600">
                Component detects when you hover over an element
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold">Screenshot Capture</h3>
              <p className="text-sm text-gray-600">
                Playwright captures before/after screenshots
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold">GIF Generation</h3>
              <p className="text-sm text-gray-600">
                Screenshots are combined into animated GIF
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Features:</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Element Detection</Badge>
              <Badge variant="secondary">Screenshot Capture</Badge>
              <Badge variant="secondary">Animated GIF Generation</Badge>
              <Badge variant="secondary">Smart Caching</Badge>
              <Badge variant="secondary">Loading States</Badge>
              <Badge variant="secondary">Error Handling</Badge>
              <Badge variant="secondary">Responsive Design</Badge>
              <Badge variant="secondary">Cache Management</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
