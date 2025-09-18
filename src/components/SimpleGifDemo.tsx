import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { HoverGif } from './HoverGif';

export const SimpleGifDemo: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            ToolTip Demo
          </CardTitle>
          <CardDescription className="text-gray-600">
            Hover over the Documentation button to see a preview of the GitHub repository
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          {/* Main Demo Button */}
          <div className="flex justify-center">
            <HoverGif
              targetUrl="https://github.com/mcpmessenger/ToolTip"
              elementSelector=".repository-content"
              waitTime={2.0}
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                📚 Documentation
              </Button>
            </HoverGif>
          </div>

          {/* Simple Instructions */}
          <div className="text-sm text-gray-500 space-y-2">
            <p>✨ This demonstrates the ToolTip system:</p>
            <ul className="text-left space-y-1 ml-4">
              <li>• Hover over the button above</li>
              <li>• See a live preview of the GitHub repo</li>
              <li>• Generated using Playwright automation</li>
            </ul>
          </div>

          {/* GitHub Link */}
          <div className="pt-4">
            <a 
              href="https://github.com/mcpmessenger/ToolTip"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              View on GitHub →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
