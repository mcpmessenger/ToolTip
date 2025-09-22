# Media Assets Integration Guide

## Asset Organization and Management

The media assets integration for the enhanced ToolTip Companion requires careful organization and optimization to support the professional presentation standards necessary for investor attraction and enterprise customer acquisition. The asset management strategy ensures consistent branding, optimal performance, and seamless integration with the existing glassmorphism design language.

The provided assets include high-quality logos for all integrated AI services, a demonstration video showcasing browser automation capabilities, and external resources that reinforce the technical sophistication of the platform. These assets serve dual purposes: functional integration within the user interface and marketing presentation elements that support the ambitious valuation goals outlined in the business analysis.

## Logo Assets Integration

### Service Logo Configuration

The service logos represent the core AI integrations that differentiate ToolTip Companion from traditional browser extensions and justify the premium subscription pricing structure. Each logo requires careful integration with appropriate sizing, hover effects, and status indicators that communicate service availability and connection status.

```jsx
// Logo configuration with theme variants and sizing
const logoConfig = {
  openai: {
    light: '/assets/logos/OpenAI-black-wordmark.svg',
    dark: '/assets/logos/OpenAI-white-wordmark.svg',
    dimensions: { width: 120, height: 40 },
    description: 'Advanced language models and GPT integration',
    tier_requirement: 'free'
  },
  gemini: {
    light: '/assets/logos/Google_Gemini_logo.svg',
    dark: '/assets/logos/Google_Gemini_logo.svg', // Same for both themes
    dimensions: { width: 100, height: 35 },
    description: 'Multimodal AI with advanced reasoning capabilities',
    tier_requirement: 'pro'
  },
  anthropic: {
    // Note: Anthropic logo would need to be sourced separately
    light: '/assets/logos/anthropic-logo.svg',
    dark: '/assets/logos/anthropic-logo-white.svg',
    dimensions: { width: 110, height: 38 },
    description: 'Ethical AI with sophisticated analytical capabilities',
    tier_requirement: 'pro'
  },
  elevenlabs: {
    light: '/assets/logos/elevenlabs-logo-black.svg',
    dark: '/assets/logos/elevenlabs-logo-white.svg',
    dimensions: { width: 130, height: 42 },
    description: 'Advanced voice synthesis and audio processing',
    tier_requirement: 'pro'
  },
  playwright: {
    light: '/assets/logos/Playwright_Logo.svg',
    dark: '/assets/logos/Playwright_Logo.svg', // Same for both themes
    dimensions: { width: 105, height: 36 },
    description: 'Browser automation and web scraping capabilities',
    tier_requirement: 'free'
  },
  chromium: {
    light: '/assets/logos/Chromium_Logo.svg',
    dark: '/assets/logos/Chromium_Logo.svg', // Same for both themes
    dimensions: { width: 95, height: 35 },
    description: 'Chromium-based browser foundation',
    tier_requirement: 'free'
  }
};

// Dynamic logo component with theme support
const ServiceLogo = ({ 
  service, 
  theme = 'light', 
  size = 'medium',
  showTooltip = true,
  isConnected = false,
  onClick 
}) => {
  const config = logoConfig[service];
  if (!config) return null;

  const sizeMultipliers = {
    small: 0.7,
    medium: 1.0,
    large: 1.3
  };

  const multiplier = sizeMultipliers[size];
  const logoSrc = config[theme] || config.light;

  return (
    <div 
      className={`service-logo-container ${isConnected ? 'connected' : 'disconnected'}`}
      onClick={onClick}
      style={{
        width: config.dimensions.width * multiplier,
        height: config.dimensions.height * multiplier,
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <img
        src={logoSrc}
        alt={`${service} logo`}
        className="service-logo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: isConnected ? 'none' : 'grayscale(100%) opacity(0.5)'
        }}
      />
      
      {/* Connection status indicator */}
      <div 
        className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}
        style={{
          position: 'absolute',
          top: -2,
          right: -2,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: isConnected ? '#00ff88' : '#ff4444',
          border: '2px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)'
        }}
      />

      {/* Tooltip with service information */}
      {showTooltip && (
        <div className="service-tooltip">
          <h4>{service.charAt(0).toUpperCase() + service.slice(1)}</h4>
          <p>{config.description}</p>
          <span className="tier-badge">{config.tier_requirement}</span>
        </div>
      )}
    </div>
  );
};
```

### Logo Grid Layout Component

The logo grid layout provides an organized, visually appealing presentation of all integrated services with sophisticated hover animations and responsive design that adapts to different screen sizes and subscription tiers.

```jsx
const ServiceLogoGrid = ({ 
  userTier = 'free', 
  connectedServices = [], 
  onServiceClick,
  theme = 'light' 
}) => {
  const [hoveredService, setHoveredService] = useState(null);

  // Filter services based on user tier
  const availableServices = Object.keys(logoConfig).filter(service => {
    const config = logoConfig[service];
    if (config.tier_requirement === 'free') return true;
    if (config.tier_requirement === 'pro' && userTier !== 'free') return true;
    if (config.tier_requirement === 'enterprise' && userTier === 'enterprise') return true;
    return false;
  });

  const unavailableServices = Object.keys(logoConfig).filter(service => 
    !availableServices.includes(service)
  );

  return (
    <div className="service-logo-grid">
      {/* Available services */}
      <div className="available-services">
        <h3>Integrated AI Services</h3>
        <div className="logo-grid">
          {availableServices.map(service => (
            <motion.div
              key={service}
              className="logo-item"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setHoveredService(service)}
              onHoverEnd={() => setHoveredService(null)}
            >
              <ServiceLogo
                service={service}
                theme={theme}
                isConnected={connectedServices.includes(service)}
                onClick={() => onServiceClick(service)}
                showTooltip={hoveredService === service}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Upgrade prompt for unavailable services */}
      {unavailableServices.length > 0 && (
        <div className="upgrade-services">
          <h4>Unlock Premium Services</h4>
          <div className="locked-logo-grid">
            {unavailableServices.map(service => (
              <div key={service} className="locked-logo-item">
                <ServiceLogo
                  service={service}
                  theme={theme}
                  isConnected={false}
                  showTooltip={false}
                />
                <div className="upgrade-overlay">
                  <Lock size={16} />
                  <span>{logoConfig[service].tier_requirement}</span>
                </div>
              </div>
            ))}
          </div>
          <UpgradeButton userTier={userTier} />
        </div>
      )}
    </div>
  );
};
```

## Video Asset Integration

### Crawler Demonstration Video

The crawler.mp4 video serves as a powerful demonstration of the browser automation capabilities that form the core value proposition of ToolTip Companion. The video integration requires sophisticated playback controls, responsive sizing, and strategic placement within the marketing presentation flow.

```jsx
const CrawlerDemoVideo = ({ 
  autoplay = false, 
  showControls = true,
  onPlayStateChange,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoaded(true);
    }
  };

  const handleSeek = (newTime) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className={`crawler-demo-container ${className}`}>
      <div className="video-wrapper">
        <video
          ref={videoRef}
          className="crawler-video"
          onPlay={() => {
            setIsPlaying(true);
            onPlayStateChange?.(true);
          }}
          onPause={() => {
            setIsPlaying(false);
            onPlayStateChange?.(false);
          }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            setIsPlaying(false);
            onPlayStateChange?.(false);
          }}
          poster="/assets/video-thumbnails/crawler-thumbnail.jpg"
          preload="metadata"
        >
          <source src="/assets/videos/crawler.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Custom video overlay */}
        <div className="video-overlay">
          {!isPlaying && (
            <motion.button
              className="play-button"
              onClick={handlePlayPause}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Play size={48} />
            </motion.button>
          )}

          {/* Loading indicator */}
          {!isLoaded && (
            <div className="loading-indicator">
              <Loader className="animate-spin" size={32} />
            </div>
          )}
        </div>

        {/* Custom controls */}
        {showControls && isLoaded && (
          <div className="custom-controls">
            <button
              className="control-button"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <div className="progress-container">
              <div 
                className="progress-bar"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newTime = (clickX / rect.width) * duration;
                  handleSeek(newTime);
                }}
              >
                <div 
                  className="progress-fill"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <span className="time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <button className="control-button">
              <Volume2 size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Video description and call-to-action */}
      <div className="video-description">
        <h3>Advanced Browser Automation in Action</h3>
        <p>
          Watch ToolTip Companion's Playwright-powered engine automatically 
          navigate websites, capture screenshots, and generate intelligent 
          tooltips in real-time. This demonstration showcases the core 
          technology that powers our browser automation capabilities.
        </p>
        <div className="video-cta">
          <button className="primary-button">
            Try the Extension
          </button>
          <button className="secondary-button">
            View Technical Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Utility function for time formatting
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

### Video Integration in Marketing Sections

The video integration within the marketing presentation requires strategic placement that maximizes impact for investor presentations while maintaining user engagement and technical credibility.

```jsx
const MarketingVideoSection = ({ userTier, onUpgradeClick }) => {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [sectionInView, setSectionInView] = useState(false);

  return (
    <section className="marketing-video-section" ref={sectionRef}>
      <div className="section-content">
        <div className="video-column">
          <CrawlerDemoVideo
            autoplay={sectionInView && userTier !== 'free'}
            onPlayStateChange={setVideoPlaying}
            className="marketing-video"
          />
        </div>

        <div className="content-column">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={sectionInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2>Revolutionary Browser Automation Technology</h2>
            <p>
              ToolTip Companion represents the next evolution in web browsing, 
              combining advanced AI with sophisticated browser automation to 
              create an intelligent, predictive user experience that anticipates 
              your needs before you click.
            </p>

            <div className="feature-highlights">
              <FeatureHighlight
                icon={<Zap />}
                title="Real-time Screenshot Capture"
                description="Playwright-powered automation captures page states instantly"
              />
              <FeatureHighlight
                icon={<Brain />}
                title="AI-Powered Analysis"
                description="Multiple AI models analyze content and predict outcomes"
              />
              <FeatureHighlight
                icon={<Target />}
                title="Proactive Intelligence"
                description="Know what happens before you click any element"
              />
            </div>

            <div className="investor-metrics">
              <MetricCard
                value="$1M - $30M+"
                label="Projected Valuation Range"
                trend="up"
              />
              <MetricCard
                value="500K+"
                label="Target User Base"
                trend="up"
              />
              <MetricCard
                value="$15/seat"
                label="Enterprise Pricing"
                trend="stable"
              />
            </div>

            <div className="cta-buttons">
              <button className="primary-cta">
                Request Investor Demo
              </button>
              {userTier === 'free' && (
                <button 
                  className="secondary-cta"
                  onClick={onUpgradeClick}
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FeatureHighlight = ({ icon, title, description }) => (
  <div className="feature-highlight">
    <div className="feature-icon">{icon}</div>
    <div className="feature-content">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  </div>
);

const MetricCard = ({ value, label, trend }) => (
  <div className="metric-card">
    <div className="metric-value">
      {value}
      {trend === 'up' && <TrendingUp className="trend-icon up" />}
    </div>
    <div className="metric-label">{label}</div>
  </div>
);
```

## Asset Optimization and Performance

### Image Optimization Strategy

The asset optimization strategy ensures fast loading times and optimal user experiences across all device types and network conditions, supporting the broad user base anticipated in the monetization projections.

```jsx
// Optimized image loading component with lazy loading and WebP support
const OptimizedLogo = ({ 
  service, 
  theme, 
  size = 'medium',
  priority = false 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const config = logoConfig[service];

  if (!config) return null;

  const generateSrcSet = (basePath) => {
    // Generate different sizes for responsive loading
    const sizes = {
      small: 0.7,
      medium: 1.0,
      large: 1.3,
      xlarge: 1.6
    };

    return Object.entries(sizes)
      .map(([sizeName, multiplier]) => {
        const width = Math.round(config.dimensions.width * multiplier);
        return `${basePath}?w=${width} ${width}w`;
      })
      .join(', ');
  };

  const logoSrc = config[theme] || config.light;

  return (
    <div className="optimized-logo-container">
      {!imageLoaded && !imageError && (
        <div className="logo-skeleton" style={{
          width: config.dimensions.width,
          height: config.dimensions.height,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
      )}

      <img
        src={logoSrc}
        srcSet={generateSrcSet(logoSrc)}
        sizes={`
          (max-width: 768px) ${config.dimensions.width * 0.7}px,
          (max-width: 1024px) ${config.dimensions.width}px,
          ${config.dimensions.width * 1.3}px
        `}
        alt={`${service} logo`}
        className={`optimized-logo ${imageLoaded ? 'loaded' : 'loading'}`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        loading={priority ? 'eager' : 'lazy'}
        style={{
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />

      {imageError && (
        <div className="logo-fallback">
          <span>{service.charAt(0).toUpperCase()}</span>
        </div>
      )}
    </div>
  );
};
```

### Video Optimization and Streaming

The video optimization ensures smooth playback across different devices and network conditions while maintaining the professional quality necessary for investor presentations.

```jsx
// Adaptive video component with multiple quality options
const AdaptiveVideo = ({ 
  videoSources, 
  poster,
  className = '',
  onQualityChange 
}) => {
  const [selectedQuality, setSelectedQuality] = useState('auto');
  const [availableQualities, setAvailableQualities] = useState([]);
  const videoRef = useRef(null);

  const qualityOptions = {
    '1080p': { width: 1920, height: 1080, bitrate: '5000k' },
    '720p': { width: 1280, height: 720, bitrate: '2500k' },
    '480p': { width: 854, height: 480, bitrate: '1000k' },
    '360p': { width: 640, height: 360, bitrate: '500k' }
  };

  useEffect(() => {
    // Detect available qualities based on network and device capabilities
    const detectOptimalQuality = () => {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const devicePixelRatio = window.devicePixelRatio || 1;
      const screenWidth = window.screen.width * devicePixelRatio;

      if (connection) {
        if (connection.effectiveType === '4g' && screenWidth >= 1920) {
          return '1080p';
        } else if (connection.effectiveType === '3g' || screenWidth >= 1280) {
          return '720p';
        } else {
          return '480p';
        }
      }

      return screenWidth >= 1280 ? '720p' : '480p';
    };

    if (selectedQuality === 'auto') {
      const optimal = detectOptimalQuality();
      setSelectedQuality(optimal);
    }
  }, [selectedQuality]);

  return (
    <div className={`adaptive-video-container ${className}`}>
      <video
        ref={videoRef}
        className="adaptive-video"
        poster={poster}
        preload="metadata"
        controls
      >
        {Object.entries(videoSources).map(([quality, src]) => (
          <source
            key={quality}
            src={src}
            type="video/mp4"
            media={`(min-width: ${qualityOptions[quality]?.width || 640}px)`}
          />
        ))}
        Your browser does not support the video tag.
      </video>

      {/* Quality selector */}
      <div className="quality-selector">
        <select
          value={selectedQuality}
          onChange={(e) => {
            setSelectedQuality(e.target.value);
            onQualityChange?.(e.target.value);
          }}
        >
          <option value="auto">Auto</option>
          {Object.keys(qualityOptions).map(quality => (
            <option key={quality} value={quality}>
              {quality}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
```

This comprehensive media assets integration guide provides the technical foundation necessary to present ToolTip Companion with the professional quality and sophisticated branding required to support the ambitious monetization goals and investor attraction objectives outlined in the business analysis.

