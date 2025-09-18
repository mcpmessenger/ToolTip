import React, { useState } from 'react';
import { PreScrapedHoverGif } from './PreScrapedHoverGif';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { usePreScrapedCache } from '../hooks/usePreScrapedCache';

export const PreScrapedDemoPage: React.FC = () => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  // Use the pre-scraped cache hook
  const {
    elements,
    isLoaded,
    totalElements,
    processedElements,
    getElementById
  } = usePreScrapedCache();

  const handleIncrement = () => setCount(count + 1);
  const handleDecrement = () => setCount(count - 1);
  const handleReset = () => setCount(0);
  const handleShowAlert = () => setShowAlert(!showAlert);
  const handleSubmit = () => {
    alert(`Form submitted with message: ${message}`);
    setMessage('');
  };

  // Find elements by their selectors (using the hook's method)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-800">
              Pre-Scraped Tooltip Demo
            </CardTitle>
            <CardDescription className="text-lg">
              This page uses pre-scraping technology! All tooltips are generated ahead of time for instant display.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center space-x-4">
              <Badge variant="outline">
                Elements Found: {totalElements}
              </Badge>
              <Badge variant="outline">
                Previews Ready: {processedElements}
              </Badge>
              <Badge variant={isLoaded ? "default" : "secondary"}>
                {isLoaded ? "Ready" : "Loading..."}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Processing Status */}
        {!isLoaded && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <div>
                  <p className="font-medium">Loading pre-scraped cache...</p>
                  <p className="text-sm text-gray-600">
                    Preparing instant tooltips for all elements
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Counter Section */}
        <Card>
          <CardHeader>
            <CardTitle>Counter Demo</CardTitle>
            <CardDescription>
              Buttons that modify a counter value - pre-scraped for instant tooltips
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-4">Count: {count}</div>
              
              <div className="flex justify-center space-x-4">
                <PreScrapedHoverGif
                  elementId="increment-btn"
                  selector="button[data-action='increment']"
                  text="Increment"
                  gifUrl={getElementById("increment-btn")?.gifUrl}
                  isProcessed={getElementById("increment-btn")?.isProcessed || false}
                >
                  <Button 
                    onClick={handleIncrement}
                    data-action="increment"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    ➕ Increment
                  </Button>
                </PreScrapedHoverGif>

                <PreScrapedHoverGif
                  elementId="decrement-btn"
                  selector="button[data-action='decrement']"
                  text="Decrement"
                  gifUrl={getElementById("decrement-btn")?.gifUrl}
                  isProcessed={getElementById("decrement-btn")?.isProcessed || false}
                >
                  <Button 
                    onClick={handleDecrement}
                    data-action="decrement"
                    className="bg-red-500 hover:bg-red-600"
                  >
                    ➖ Decrement
                  </Button>
                </PreScrapedHoverGif>

                <PreScrapedHoverGif
                  elementId="reset-btn"
                  selector="button[data-action='reset']"
                  text="Reset"
                  gifUrl={getElementById("reset-btn")?.gifUrl}
                  isProcessed={getElementById("reset-btn")?.isProcessed || false}
                >
                  <Button 
                    onClick={handleReset}
                    data-action="reset"
                    variant="outline"
                  >
                    🔄 Reset
                  </Button>
                </PreScrapedHoverGif>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>Form Demo</CardTitle>
            <CardDescription>
              Input field and submit button with pre-generated previews
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Input
                placeholder="Enter a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              <PreScrapedHoverGif
                elementId="submit-btn"
                selector="button[data-action='submit']"
                text="Submit"
                gifUrl={getElementById("submit-btn")?.gifUrl}
                isProcessed={getElementById("submit-btn")?.isProcessed || false}
              >
                <Button 
                  onClick={handleSubmit}
                  data-action="submit"
                  disabled={!message.trim()}
                >
                  📤 Submit
                </Button>
              </PreScrapedHoverGif>
            </div>
          </CardContent>
        </Card>

        {/* Alert Section */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Demo</CardTitle>
            <CardDescription>
              Button that shows/hides an alert with instant preview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PreScrapedHoverGif
              elementId="alert-btn"
              selector="button[data-action='alert']"
              text="Toggle Alert"
              gifUrl={getElementById("alert-btn")?.gifUrl}
              isProcessed={getElementById("alert-btn")?.isProcessed || false}
            >
              <Button 
                onClick={handleShowAlert}
                data-action="alert"
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                {showAlert ? 'Hide' : 'Show'} Alert
              </Button>
            </PreScrapedHoverGif>
            
            {showAlert && (
              <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
                <div className="flex items-center">
                  <span className="text-yellow-800">⚠️ This is an alert message!</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Section */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Demo</CardTitle>
            <CardDescription>
              Links with pre-scraped previews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <PreScrapedHoverGif
                elementId="home-link"
                selector="a[href='/home']"
                text="Home"
                gifUrl={getElementById("home-link")?.gifUrl}
                isProcessed={getElementById("home-link")?.isProcessed || false}
              >
                <Button variant="link" asChild>
                  <a href="/home">🏠 Home</a>
                </Button>
              </PreScrapedHoverGif>

              <PreScrapedHoverGif
                elementId="about-link"
                selector="a[href='/about']"
                text="About"
                gifUrl={getElementById("about-link")?.gifUrl}
                isProcessed={getElementById("about-link")?.isProcessed || false}
              >
                <Button variant="link" asChild>
                  <a href="/about">ℹ️ About</a>
                </Button>
              </PreScrapedHoverGif>

              <PreScrapedHoverGif
                elementId="contact-link"
                selector="a[href='/contact']"
                text="Contact"
                gifUrl={getElementById("contact-link")?.gifUrl}
                isProcessed={getElementById("contact-link")?.isProcessed || false}
              >
                <Button variant="link" asChild>
                  <a href="/contact">📞 Contact</a>
                </Button>
              </PreScrapedHoverGif>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>How Pre-Scraping Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">1. Page Analysis</h3>
                <p className="text-sm text-gray-600">
                  The system scans the page and identifies all clickable elements, analyzing their behavior and target URLs.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">2. Batch Processing</h3>
                <p className="text-sm text-gray-600">
                  All elements are processed in parallel to generate animated previews, with smart caching for performance.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">3. Instant Display</h3>
                <p className="text-sm text-gray-600">
                  Tooltips display instantly when you hover, using pre-generated content for maximum responsiveness.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreScrapedDemoPage;
