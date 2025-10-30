import React, { useState } from 'react';

interface SpiderVideoLoaderProps {
  size?: number;
  className?: string;
  showText?: boolean;
  text?: string;
  fullScreen?: boolean;
}

export const SpiderVideoLoader: React.FC<SpiderVideoLoaderProps> = ({ 
  size = 80, 
  className = '',
  showText = true,
  text = 'Crawling...',
  fullScreen = false
}) => {
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleVideoError = () => {
    console.log('Spider video failed to load, using fallback');
    setVideoError(true);
    setIsLoading(false);
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  if (videoError) {
    // Fallback to CSS spider animation
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div 
          className="relative rounded-full overflow-hidden"
          style={{ width: size, height: size }}
        >
          {/* CSS Spider fallback - cropped in circle */}
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-2xl animate-bounce" style={{ transform: 'scale(1.5)' }}>🕷️</div>
          </div>
          <div className="absolute inset-0 border-2 border-transparent border-t-blue-500 border-r-blue-500 rounded-full animate-spin"></div>
        </div>
        {showText && (
          <p className="text-white text-sm mt-2 font-medium">{text}</p>
        )}
      </div>
    );
  }

  if (fullScreen) {
    // Full screen video for preview boxes
    return (
      <div className={`relative w-full h-full flex flex-col items-center justify-center ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
            <div className="text-4xl animate-pulse">🕷️</div>
          </div>
        )}
        
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ 
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
          onError={handleVideoError}
          onLoadedData={handleVideoLoad}
          onCanPlay={handleVideoLoad}
        >
          <source src="https://automationalien.s3.us-east-1.amazonaws.com/crawler.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {showText && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 rounded-lg px-4 py-2">
            <p className="text-white text-sm font-medium animate-pulse">
              {text}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className="relative rounded-full overflow-hidden"
        style={{ width: size, height: size }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl animate-pulse">🕷️</div>
          </div>
        )}
        
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover rounded-full"
          style={{ 
            maxWidth: size, 
            maxHeight: size,
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
            transform: 'scale(1.2)',
            transformOrigin: 'center'
          }}
          onError={handleVideoError}
          onLoadedData={handleVideoLoad}
          onCanPlay={handleVideoLoad}
        >
          <source src="https://automationalien.s3.us-east-1.amazonaws.com/crawler.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      {showText && (
        <p className="text-white text-sm mt-2 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};
