import React from 'react';

interface WaterBubbleLoaderProps {
  isLoading: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const WaterBubbleLoader: React.FC<WaterBubbleLoaderProps> = ({ 
  isLoading, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  if (!isLoading) return null;

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Water bubble container */}
      <div className="absolute inset-0 rounded-full border-2 border-blue-300 bg-blue-50 overflow-hidden">
        {/* Water level that fills up */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400 to-blue-300 transition-all duration-1000 ease-out"
          style={{
            height: '0%',
            animation: isLoading ? 'fillUp 2s ease-out forwards' : 'none'
          }}
        />
        
        {/* Water droplets */}
        <div className="absolute inset-0">
          <div 
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-70"
            style={{
              top: '20%',
              left: '30%',
              animation: isLoading ? 'drip 1.5s ease-in-out infinite' : 'none'
            }}
          />
          <div 
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-70"
            style={{
              top: '30%',
              left: '60%',
              animation: isLoading ? 'drip 1.8s ease-in-out infinite 0.3s' : 'none'
            }}
          />
          <div 
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-70"
            style={{
              top: '25%',
              left: '70%',
              animation: isLoading ? 'drip 1.6s ease-in-out infinite 0.6s' : 'none'
            }}
          />
        </div>
        
        {/* Ripple effect */}
        <div 
          className="absolute inset-0 rounded-full border border-blue-200"
          style={{
            animation: isLoading ? 'ripple 2s ease-out infinite' : 'none'
          }}
        />
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes fillUp {
          0% { height: 0%; }
          100% { height: 85%; }
        }
        
        @keyframes drip {
          0%, 100% { 
            transform: translateY(0) scale(1);
            opacity: 0.7;
          }
          50% { 
            transform: translateY(10px) scale(0.8);
            opacity: 0.3;
          }
        }
        
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
