import React, { useRef } from 'react';
import { TooltipProvider, Tooltip, GlassTooltipReact } from '../src/react/Tooltip';

// React integration examples
export const ReactExamples = () => {
  const tooltipRef = useRef<any>(null);
  const glassTooltipRef = useRef<any>(null);

  const handleShowTooltip = () => {
    tooltipRef.current?.show();
  };

  const handleHideTooltip = () => {
    tooltipRef.current?.hide();
  };

  const handleShowGlassTooltip = () => {
    glassTooltipRef.current?.show();
  };

  return (
    <TooltipProvider defaultConfig={{ theme: 'glass' }}>
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>ToolTip Library - React Integration</h1>
        
        {/* Basic React Tooltip */}
        <Tooltip
          ref={tooltipRef}
          content="This is a React tooltip with ref forwarding!"
          placement="top"
          trigger="hover"
          theme="default"
          arrow={true}
        >
          <button style={{ margin: '20px', padding: '10px 20px' }}>
            React Basic Tooltip
          </button>
        </Tooltip>

        {/* Glass React Tooltip */}
        <GlassTooltipReact
          ref={glassTooltipRef}
          content="Amazing React glass tooltip with 3D effects!"
          placement="bottom"
          trigger="hover"
          glassEffect={true}
          animation3D={true}
          glassOpacity={0.8}
          blurIntensity={16}
        >
          <button style={{ margin: '20px', padding: '10px 20px' }}>
            React Glass Tooltip
          </button>
        </GlassTooltipReact>

        {/* Interactive React Tooltip */}
        <Tooltip
          content={
            <div>
              <h3>Interactive React Content</h3>
              <p>This tooltip contains React components!</p>
              <button onClick={() => alert('React button clicked!')}>
                Click me
              </button>
            </div>
          }
          placement="right"
          trigger="click"
          interactive={true}
          theme="dark"
        >
          <button style={{ margin: '20px', padding: '10px 20px' }}>
            Interactive React Tooltip
          </button>
        </Tooltip>

        {/* Programmatic Control */}
        <div style={{ margin: '20px' }}>
          <button onClick={handleShowTooltip} style={{ margin: '5px' }}>
            Show Basic Tooltip
          </button>
          <button onClick={handleHideTooltip} style={{ margin: '5px' }}>
            Hide Basic Tooltip
          </button>
          <button onClick={handleShowGlassTooltip} style={{ margin: '5px' }}>
            Show Glass Tooltip
          </button>
        </div>
      </div>
    </TooltipProvider>
  );
};

// Vue.js integration example (conceptual)
export const VueExample = () => {
  return (
    <div>
      <h2>Vue.js Integration</h2>
      <p>Use the Vue component like this:</p>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
{`<template>
  <Tooltip
    content="Vue.js tooltip with 3D effects!"
    placement="top"
    trigger="hover"
    theme="glass"
    :glass-effect="true"
    :animation3d="true"
  >
    <button>Vue Button</button>
  </Tooltip>
</template>

<script setup>
import { Tooltip } from '@tooltip-library/vue';
</script>`}
      </pre>
    </div>
  );
};

// Angular integration example (conceptual)
export const AngularExample = () => {
  return (
    <div>
      <h2>Angular Integration</h2>
      <p>Use the Angular directive like this:</p>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
{`<button
  tooltip="Angular tooltip with glass effects!"
  tooltipPlacement="top"
  tooltipTrigger="hover"
  tooltipTheme="glass"
  [tooltipGlassEffect]="true"
  [tooltipAnimation3D]="true"
  (tooltipShow)="onTooltipShow()"
  (tooltipHide)="onTooltipHide()">
  Angular Button
</button>`}
      </pre>
    </div>
  );
};

export default ReactExamples;
