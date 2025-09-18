import React, { useState } from 'react';
import { HoverGif } from './HoverGif';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

export const InteractiveDemoPage: React.FC = () => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const handleIncrement = () => setCount(count + 1);
  const handleDecrement = () => setCount(count - 1);
  const handleReset = () => setCount(0);
  const handleShowAlert = () => setShowAlert(!showAlert);
  const handleSubmit = () => {
    alert(`Form submitted with message: ${message}`);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-800">
              Interactive Demo Page
            </CardTitle>
            <CardDescription className="text-lg">
              Hover over any button below to see what happens when you click it!
              Each button shows a different preview based on its actual functionality.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Counter Section */}
        <Card>
          <CardHeader>
            <CardTitle>Counter Demo</CardTitle>
            <CardDescription>
              Buttons that modify a counter value
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-4">Count: {count}</div>
              
              <div className="flex justify-center space-x-4">
                <HoverGif
                  targetUrl={window.location.href}
                  elementSelector="button[data-action='increment']"
                  elementText="Increment"
                  waitTime={2.0}
                >
                  <Button 
                    onClick={handleIncrement}
                    data-action="increment"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    ➕ Increment
                  </Button>
                </HoverGif>

                <HoverGif
                  targetUrl={window.location.href}
                  elementSelector="button[data-action='decrement']"
                  elementText="Decrement"
                  waitTime={2.0}
                >
                  <Button 
                    onClick={handleDecrement}
                    data-action="decrement"
                    className="bg-red-500 hover:bg-red-600"
                  >
                    ➖ Decrement
                  </Button>
                </HoverGif>

                <HoverGif
                  targetUrl={window.location.href}
                  elementSelector="button[data-action='reset']"
                  elementText="Reset"
                  waitTime={2.0}
                >
                  <Button 
                    onClick={handleReset}
                    data-action="reset"
                    variant="outline"
                  >
                    🔄 Reset
                  </Button>
                </HoverGif>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>Form Demo</CardTitle>
            <CardDescription>
              Input field and submit button
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
              <HoverGif
                targetUrl={window.location.href}
                elementSelector="button[data-action='submit']"
                elementText="Submit"
                waitTime={2.0}
              >
                <Button 
                  onClick={handleSubmit}
                  data-action="submit"
                  disabled={!message.trim()}
                >
                  📤 Submit
                </Button>
              </HoverGif>
            </div>
          </CardContent>
        </Card>

        {/* Alert Section */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Demo</CardTitle>
            <CardDescription>
              Button that shows/hides an alert
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HoverGif
              targetUrl={window.location.href}
              elementSelector="button[data-action='alert']"
              elementText="Toggle Alert"
              waitTime={2.0}
            >
              <Button 
                onClick={handleShowAlert}
                data-action="alert"
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                {showAlert ? 'Hide' : 'Show'} Alert
              </Button>
            </HoverGif>
            
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
              Links that would navigate to different pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <HoverGif
                targetUrl={window.location.href}
                elementSelector="a[href='/home']"
                elementText="Home"
                waitTime={2.0}
              >
                <Button variant="link" asChild>
                  <a href="/home">🏠 Home</a>
                </Button>
              </HoverGif>

              <HoverGif
                targetUrl={window.location.href}
                elementSelector="a[href='/about']"
                elementText="About"
                waitTime={2.0}
              >
                <Button variant="link" asChild>
                  <a href="/about">ℹ️ About</a>
                </Button>
              </HoverGif>

              <HoverGif
                targetUrl={window.location.href}
                elementSelector="a[href='/contact']"
                elementText="Contact"
                waitTime={2.0}
              >
                <Button variant="link" asChild>
                  <a href="/contact">📞 Contact</a>
                </Button>
              </HoverGif>

              <HoverGif
                targetUrl={window.location.href}
                elementSelector="a[href='/settings']"
                elementText="Settings"
                waitTime={2.0}
              >
                <Button variant="link" asChild>
                  <a href="/settings">⚙️ Settings</a>
                </Button>
              </HoverGif>
            </div>
          </CardContent>
        </Card>

        {/* Custom Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Actions</CardTitle>
            <CardDescription>
              Buttons with custom data attributes and onclick handlers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <HoverGif
                targetUrl={window.location.href}
                elementSelector="button[data-action='save']"
                elementText="Save"
                waitTime={2.0}
              >
                <Button 
                  data-action="save"
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  💾 Save
                </Button>
              </HoverGif>

              <HoverGif
                targetUrl={window.location.href}
                elementSelector="button[data-action='delete']"
                elementText="Delete"
                waitTime={2.0}
              >
                <Button 
                  data-action="delete"
                  className="w-full bg-red-500 hover:bg-red-600"
                >
                  🗑️ Delete
                </Button>
              </HoverGif>

              <HoverGif
                targetUrl={window.location.href}
                elementSelector="button[data-action='edit']"
                elementText="Edit"
                waitTime={2.0}
              >
                <Button 
                  data-action="edit"
                  className="w-full bg-yellow-500 hover:bg-yellow-600"
                >
                  ✏️ Edit
                </Button>
              </HoverGif>

              <HoverGif
                targetUrl={window.location.href}
                elementSelector="button[data-action='share']"
                elementText="Share"
                waitTime={2.0}
              >
                <Button 
                  data-action="share"
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  📤 Share
                </Button>
              </HoverGif>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Smart Detection</h3>
                <p className="text-sm text-gray-600">
                  Each button is automatically detected and given a unique selector based on its attributes and content.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎬</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Live Preview</h3>
                <p className="text-sm text-gray-600">
                  Hover over any button to see an animated preview of what happens when you click it.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Real-time</h3>
                <p className="text-sm text-gray-600">
                  The previews are generated in real-time using Playwright automation to show actual behavior.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InteractiveDemoPage;
