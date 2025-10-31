import React from 'react';
import { AuroraHero } from '../components/ui/futurastic-hero-section';
import { ScrapingProvider } from '../contexts/ScrapingContext';
import Footer from '../components/Footer';

const DashboardContent: React.FC = () => {
  return (
    <div className="min-h-screen relative">
      <AuroraHero 
        hideText={false}
      />
      <Footer />
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
