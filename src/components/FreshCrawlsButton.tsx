import React, { useState } from 'react';
import { Button } from './ui/button';
import { RefreshCw, Zap, CheckCircle, XCircle } from 'lucide-react';

interface PreCrawlResult {
  elementId: string;
  selector: string;
  text: string;
  gifUrl: string;
  status: 'success' | 'error';
  error?: string;
}

interface FreshCrawlsButtonProps {
  onCrawlComplete?: (results: PreCrawlResult[]) => void;
  className?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const FreshCrawlsButton: React.FC<FreshCrawlsButtonProps> = ({ 
  onCrawlComplete, 
  className 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PreCrawlResult[]>([]);
  const [lastCrawlTime, setLastCrawlTime] = useState<Date | null>(null);

  const handleFreshCrawl = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/pre-crawl/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: window.location.href
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start fresh crawl');
      }
      
      setResults(data.results || []);
      setLastCrawlTime(new Date());
      
      if (onCrawlComplete) {
        onCrawlComplete(data.results || []);
      }
      
    } catch (error) {
      console.error('Error starting fresh crawl:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const successfulCrawls = results.filter(r => r.status === 'success').length;
  const totalCrawls = results.length;

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <Button
        onClick={handleFreshCrawl}
        disabled={isLoading}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {isLoading ? (
          <>
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            Crawling...
          </>
        ) : (
          <>
            <Zap className="h-5 w-5 mr-2" />
            Fresh Crawls
          </>
        )}
      </Button>
      
      {lastCrawlTime && (
        <div className="text-sm text-gray-500">
          Last crawl: {lastCrawlTime.toLocaleTimeString()}
        </div>
      )}
      
      {results.length > 0 && (
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>{successfulCrawls} successful</span>
          </div>
          {totalCrawls - successfulCrawls > 0 && (
            <div className="flex items-center space-x-1 text-red-600">
              <XCircle className="h-4 w-4" />
              <span>{totalCrawls - successfulCrawls} failed</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
