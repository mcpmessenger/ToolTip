import React, { useState, useEffect } from 'react';
import { HoverGif } from './HoverGif';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useCrawling } from '../hooks/useCrawling';

interface UniversalTooltipDemoProps {
  targetUrl?: string;
  className?: string;
}

export const UniversalTooltipDemo: React.FC<UniversalTooltipDemoProps> = ({
  targetUrl = 'https://example.com',
  className = ''
}) => {
  const [elements, setElements] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const { getPageElements } = useCrawling();

  // Get current page URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  // Scan page for clickable elements
  const scanPage = async () => {
    const url = targetUrl || currentUrl;
    if (!url) return;

    setIsScanning(true);
    try {
      const pageElements = await getPageElements(url);
      setElements(pageElements);
      console.log('Found page elements:', pageElements);
    } catch (error) {
      console.error('Error scanning page:', error);
    } finally {
      setIsScanning(false);
    }
  };

  // Auto-scan on mount
  useEffect(() => {
    if (currentUrl) {
      scanPage();
    }
  }, [currentUrl]);

  // Demo buttons with different types
  const demoButtons = [
    { id: 'btn1', text: 'Primary Button', variant: 'default' as const, selector: 'button.primary' },
    { id: 'btn2', text: 'Secondary Button', variant: 'secondary' as const, selector: 'button.secondary' },
    { id: 'btn3', text: 'Destructive Button', variant: 'destructive' as const, selector: 'button.destructive' },
    { id: 'btn4', text: 'Outline Button', variant: 'outline' as const, selector: 'button.outline' },
    { id: 'btn5', text: 'Ghost Button', variant: 'ghost' as const, selector: 'button.ghost' },
    { id: 'btn6', text: 'Link Button', variant: 'link' as const, selector: 'button.link' }
  ];

  const demoLinks = [
    { id: 'link1', text: 'Home', href: '/', selector: 'a[href="/"]' },
    { id: 'link2', text: 'About', href: '/about', selector: 'a[href="/about"]' },
    { id: 'link3', text: 'Contact', href: '/contact', selector: 'a[href="/contact"]' },
    { id: 'link4', text: 'Documentation', href: '/docs', selector: 'a[href="/docs"]' }
  ];

  const demoInputs = [
    { id: 'input1', type: 'button', value: 'Submit Form', selector: 'input[type="button"]' },
    { id: 'input2', type: 'submit', value: 'Save Changes', selector: 'input[type="submit"]' },
    { id: 'input3', type: 'reset', value: 'Reset Form', selector: 'input[type="reset"]' }
  ];

  return (
    <div className={`universal-tooltip-demo ${className}`}>
      {/* Status Indicators */}
      {isScanning && (
        <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Scanning page for clickable elements...</span>
          </div>
        </div>
      )}
      
      {elements.length > 0 && (
        <div className="fixed bottom-4 left-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Found {elements.length} clickable elements - hover to see previews!</span>
          </div>
        </div>
      )}

      <div className="space-y-8 p-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Universal Tooltip Demo</CardTitle>
            <CardDescription>
              Hover over any button, link, or input below to see animated previews of what happens when you click them.
              All elements are automatically wrapped with tooltip functionality.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">Target URL: {targetUrl}</Badge>
              <Badge variant="outline">Elements Found: {elements.length}</Badge>
              <Button onClick={scanPage} disabled={isScanning} size="sm">
                {isScanning ? 'Scanning...' : 'Rescan Page'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Button Demos */}
        <Card>
          <CardHeader>
            <CardTitle>Button Examples</CardTitle>
            <CardDescription>
              Different types of buttons with automatic tooltip detection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {demoButtons.map((button) => (
                <HoverGif
                  key={button.id}
                  targetUrl={targetUrl}
                  elementSelector={button.selector}
                  elementText={button.text}
                  waitTime={2.0}
                >
                  <Button variant={button.variant} className={button.id === 'btn1' ? 'primary' : ''}>
                    {button.text}
                  </Button>
                </HoverGif>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Link Demos */}
        <Card>
          <CardHeader>
            <CardTitle>Link Examples</CardTitle>
            <CardDescription>
              Navigation links with hover previews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {demoLinks.map((link) => (
                <HoverGif
                  key={link.id}
                  targetUrl={targetUrl}
                  elementSelector={link.selector}
                  elementText={link.text}
                  waitTime={2.0}
                >
                  <Button variant="link" asChild>
                    <a href={link.href}>{link.text}</a>
                  </Button>
                </HoverGif>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Input Demos */}
        <Card>
          <CardHeader>
            <CardTitle>Input Examples</CardTitle>
            <CardDescription>
              Form inputs with click previews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {demoInputs.map((input) => (
                <HoverGif
                  key={input.id}
                  targetUrl={targetUrl}
                  elementSelector={input.selector}
                  elementText={input.value}
                  waitTime={2.0}
                >
                  <input
                    type={input.type}
                    value={input.value}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                    readOnly
                  />
                </HoverGif>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Clickable Elements</CardTitle>
            <CardDescription>
              Custom elements with onclick handlers and special classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <HoverGif
                targetUrl={targetUrl}
                elementSelector=".custom-btn"
                elementText="Custom Button"
                waitTime={2.0}
              >
                <div className="custom-btn px-4 py-2 bg-purple-500 text-white rounded cursor-pointer hover:bg-purple-600">
                  Custom Button
                </div>
              </HoverGif>

              <HoverGif
                targetUrl={targetUrl}
                elementSelector="[data-action='save']"
                elementText="Save Data"
                waitTime={2.0}
              >
                <div 
                  data-action="save"
                  className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600"
                >
                  Save Data
                </div>
              </HoverGif>

              <HoverGif
                targetUrl={targetUrl}
                elementSelector=".icon-button"
                elementText="Icon Button"
                waitTime={2.0}
              >
                <button className="icon-button p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600">
                  ⚙️
                </button>
              </HoverGif>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
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
                <h3 className="font-semibold">Auto-Detection</h3>
                <p className="text-sm text-gray-600">
                  Automatically detects buttons, links, and clickable elements
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold">Hover Preview</h3>
                <p className="text-sm text-gray-600">
                  Shows animated GIF preview when you hover over elements
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold">Smart Caching</h3>
                <p className="text-sm text-gray-600">
                  Caches results for better performance and faster loading
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UniversalTooltipDemo;
