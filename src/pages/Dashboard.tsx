import React from 'react';
import { AuroraHero } from '../components/ui/futurastic-hero-section';
import { ScrapingProvider } from '../contexts/ScrapingContext';
import ProjectShowcase from '../components/ProjectShowcase';
import { TooltipBotWidget } from '../components/TooltipBotWidget';

const DashboardContent: React.FC = () => {
  return (
    <div className="min-h-screen relative">
      <AuroraHero 
        hideText={false} 
        onGetStarted={() => {}} 
        useProactiveMode={false}
      />
      
      <ProjectShowcase />
      
      <TooltipBotWidget />
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
