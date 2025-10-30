import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ScrapingContextType {
  isScraping: boolean;
  scrapingUrl: string | null;
  setScraping: (isScraping: boolean, url?: string) => void;
  isElementScraping: (elementId: string) => boolean;
  setElementScraping: (elementId: string, isScraping: boolean) => void;
}

const ScrapingContext = createContext<ScrapingContextType | undefined>(undefined);

export const useScraping = () => {
  const context = useContext(ScrapingContext);
  if (!context) {
    throw new Error('useScraping must be used within a ScrapingProvider');
  }
  return context;
};

interface ScrapingProviderProps {
  children: ReactNode;
}

export const ScrapingProvider: React.FC<ScrapingProviderProps> = ({ children }) => {
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingUrl, setScrapingUrl] = useState<string | null>(null);
  const [scrapingElements, setScrapingElements] = useState<Set<string>>(new Set());

  const setScraping = (scraping: boolean, url?: string) => {
    setIsScraping(scraping);
    setScrapingUrl(scraping ? (url || null) : null);
  };

  const isElementScraping = (elementId: string) => {
    return scrapingElements.has(elementId);
  };

  const setElementScraping = (elementId: string, scraping: boolean) => {
    setScrapingElements(prev => {
      const newSet = new Set(prev);
      if (scraping) {
        newSet.add(elementId);
      } else {
        newSet.delete(elementId);
      }
      return newSet;
    });
  };

  return (
    <ScrapingContext.Provider value={{
      isScraping,
      scrapingUrl,
      setScraping,
      isElementScraping,
      setElementScraping
    }}>
      {children}
    </ScrapingContext.Provider>
  );
};
