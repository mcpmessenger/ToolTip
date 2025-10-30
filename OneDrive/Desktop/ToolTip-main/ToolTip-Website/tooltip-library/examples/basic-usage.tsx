import React from 'react';
import { TooltipProvider, TooltipContent, GlassTooltip } from '../src';

// Basic tooltip usage
export const BasicExample = () => {
  return (
    <TooltipProvider>
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>Tooltip Library Examples</h1>
        
        {/* Basic Tooltip */}
        <TooltipContent
          content="This is a basic tooltip"
          placement="top"
          trigger="hover"
        >
          <button style={{ margin: '20px', padding: '10px 20px' }}>
            Hover me (Basic)
          </button>
        </TooltipContent>

        {/* Glass Tooltip */}
        <GlassTooltip
          content="This is a glass tooltip with 3D effects"
          placement="bottom"
          trigger="hover"
          glassEffect={true}
          animation3D={true}
        >
          <button style={{ margin: '20px', padding: '10px 20px' }}>
            Hover me (Glass)
          </button>
        </GlassTooltip>

        {/* Interactive Tooltip */}
        <TooltipContent
          content={
            <div>
              <h3>Interactive Content</h3>
              <p>This tooltip contains interactive elements</p>
              <button onClick={() => alert('Clicked!')}>
                Click me
              </button>
            </div>
          }
          placement="right"
          trigger="click"
          interactive={true}
        >
          <button style={{ margin: '20px', padding: '10px 20px' }}>
            Click me (Interactive)
          </button>
        </TooltipContent>

        {/* Custom Theme Tooltip */}
        <TooltipContent
          content="Custom themed tooltip"
          placement="left"
          trigger="hover"
          theme="dark"
        >
          <button style={{ margin: '20px', padding: '10px 20px' }}>
            Hover me (Dark Theme)
          </button>
        </TooltipContent>
      </div>
    </TooltipProvider>
  );
};

// Advanced glass tooltip with custom configuration
export const AdvancedGlassExample = () => {
  return (
    <TooltipProvider defaultConfig={{ theme: 'glass' }}>
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <GlassTooltip
          content="Advanced glass tooltip with custom effects"
          placement="top"
          trigger="hover"
          glassEffect={true}
          animation3D={true}
          glassOpacity={0.8}
          blurIntensity={16}
          shadowIntensity={0.4}
          hoverTransform="rotate3d(1,1,0,20deg) scale(1.05)"
          delay={{ show: 300, hide: 100 }}
        >
          <div
            style={{
              width: '200px',
              height: '100px',
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              margin: '20px auto',
            }}
          >
            Advanced Glass Card
          </div>
        </GlassTooltip>
      </div>
    </TooltipProvider>
  );
};
