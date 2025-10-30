import React from 'react';
import { AuroraHero } from '../components/ui/futurastic-hero-section';
import { ScrapingProvider } from '../contexts/ScrapingContext';
// import { UniversalProactiveScraper } from '../components/UniversalProactiveScraper'; // DISABLED - using simpleAfterCapture instead

const DashboardContent: React.FC = () => {
  // Removed widget/companion functionality

  // Removed all widget/companion functionality

  return (
    <div className="min-h-screen relative">
        {/* Universal Proactive Scraper - DISABLED - using simpleAfterCapture instead */}
        {/* <UniversalProactiveScraper
          enabled={useProactiveMode}
          onScrapingComplete={(url, previews) => {
            console.log(`Universal tooltips ready for ${url}: ${previews.length} elements`);
            // Only add message to chat if companion is visible
            if (showCompanion) {
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                type: 'ai',
                content: `🚀 Universal tooltips ready for this page! ${previews.length} elements now have instant previews. Hover over any button or link to see what happens when you click it.`,
                timestamp: new Date()
              }]);
            }
          }}
          onScrapingError={(url, error) => {
            console.error('Universal tooltip error:', error);
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              type: 'ai',
              content: `❌ Universal tooltip setup failed for ${url}: ${error}`,
              timestamp: new Date()
            }]);
          }}
        /> */}
      
      <AuroraHero 
        hideText={false} 
        onGetStarted={() => {}} 
        useProactiveMode={false}
      />

    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <ScrapingProvider>
      <DashboardContent />
    </ScrapingProvider>
  );
};

export default Dashboard;
