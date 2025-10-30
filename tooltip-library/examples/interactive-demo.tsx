import React, { useState } from 'react';
import { InteractiveTooltip } from '../src/components/InteractiveTooltip';
import { TooltipProvider } from '../src/components/TooltipProvider';

export const InteractiveDemo = () => {
  const [tooltipState, setTooltipState] = useState({
    position: { x: 0, y: 0 },
    size: { width: 300, height: 150 },
    isVisible: false,
  });

  const [keyboardLog, setKeyboardLog] = useState<string[]>([]);

  const handleKeyboardAction = (action: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${action}${data ? ` - ${JSON.stringify(data)}` : ''}`;
    setKeyboardLog(prev => [...prev.slice(-9), logEntry]);
  };

  const handleDragStart = (position: { x: number; y: number }) => {
    console.log('Drag started:', position);
  };

  const handleDrag = (position: { x: number; y: number }) => {
    setTooltipState(prev => ({ ...prev, position }));
  };

  const handleDragEnd = (position: { x: number; y: number }) => {
    console.log('Drag ended:', position);
  };

  const handleResize = (size: { width: number; height: number }) => {
    setTooltipState(prev => ({ ...prev, size }));
  };

  const clearLog = () => {
    setKeyboardLog([]);
  };

  return (
    <TooltipProvider>
      <div style={{ 
        padding: '50px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        color: 'white'
      }}>
        <h1>🎮 Interactive Tooltip Demo</h1>
        
        <div style={{ marginBottom: '30px' }}>
          <h2>Keyboard Controls</h2>
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: '20px', 
            borderRadius: '10px',
            margin: '20px 0',
            textAlign: 'left'
          }}>
            <h3>Available Shortcuts:</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>🎯 <strong>Ctrl + /</strong> - Show tooltip</li>
              <li>❌ <strong>Ctrl + -</strong> - Hide tooltip</li>
              <li>🔄 <strong>Ctrl + T</strong> - Toggle tooltip</li>
              <li>🚪 <strong>Escape</strong> - Hide tooltip</li>
              <li>⬆️ <strong>Ctrl + ↑</strong> - Move up</li>
              <li>⬇️ <strong>Ctrl + ↓</strong> - Move down</li>
              <li>⬅️ <strong>Ctrl + ←</strong> - Move left</li>
              <li>➡️ <strong>Ctrl + →</strong> - Move right</li>
              <li>➕ <strong>Ctrl + +</strong> - Increase size</li>
              <li>➖ <strong>Ctrl + -</strong> - Decrease size</li>
            </ul>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2>Interactive Tooltips</h2>
          
          {/* Basic Interactive Tooltip */}
          <InteractiveTooltip
            content={
              <div>
                <h3>🎮 Interactive Tooltip</h3>
                <p>This tooltip can be:</p>
                <ul style={{ textAlign: 'left', margin: '10px 0' }}>
                  <li>🖱️ <strong>Dragged</strong> by the top handle</li>
                  <li>📏 <strong>Resized</strong> by the corner handles</li>
                  <li>⌨️ <strong>Controlled</strong> with keyboard shortcuts</li>
                  <li>🎨 <strong>Styled</strong> with glass morphism effects</li>
                </ul>
                <p>Try the keyboard shortcuts or drag it around!</p>
              </div>
            }
            placement="top"
            trigger="click"
            theme="glass"
            draggable={true}
            resizable={true}
            keyboardControls={true}
            minWidth={250}
            minHeight={200}
            maxWidth={500}
            maxHeight={400}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onResize={handleResize}
            onKeyboardAction={handleKeyboardAction}
            onShow={() => setTooltipState(prev => ({ ...prev, isVisible: true }))}
            onHide={() => setTooltipState(prev => ({ ...prev, isVisible: false }))}
          >
            <button style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '15px 30px',
              margin: '10px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.3s ease'
            }}>
              🎮 Interactive Tooltip
            </button>
          </InteractiveTooltip>

          {/* Glass Tooltip with Custom Content */}
          <InteractiveTooltip
            content={
              <div style={{ padding: '20px' }}>
                <h3>✨ Glass Morphism Tooltip</h3>
                <p>This tooltip features the signature 3D glass effects from the original ToolTip Companion!</p>
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  padding: '10px', 
                  borderRadius: '8px',
                  margin: '10px 0'
                }}>
                  <strong>Features:</strong>
                  <ul style={{ textAlign: 'left', margin: '5px 0' }}>
                    <li>3D hover transformations</li>
                    <li>Backdrop blur effects</li>
                    <li>Decorative glass layers</li>
                    <li>Smooth animations</li>
                  </ul>
                </div>
                <button 
                  onClick={() => alert('Button clicked inside tooltip!')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Click me!
                </button>
              </div>
            }
            placement="right"
            trigger="hover"
            theme="glass"
            draggable={true}
            resizable={true}
            keyboardControls={true}
            glassEffect={true}
            animation3D={true}
            glassOpacity={0.9}
            blurIntensity={16}
            shadowIntensity={0.4}
            hoverTransform="rotate3d(1,1,0,20deg) scale(1.05)"
            minWidth={300}
            minHeight={250}
            maxWidth={600}
            maxHeight={500}
            onKeyboardAction={handleKeyboardAction}
          >
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              padding: '30px',
              margin: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}>
              <h3>✨ Glass Card</h3>
              <p>Hover me for a glass tooltip!</p>
            </div>
          </InteractiveTooltip>
        </div>

        {/* Keyboard Action Log */}
        <div style={{ marginBottom: '30px' }}>
          <h2>⌨️ Keyboard Action Log</h2>
          <button 
            onClick={clearLog}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            Clear Log
          </button>
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'left',
            maxHeight: '200px',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            {keyboardLog.length === 0 ? (
              <div style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                No keyboard actions yet. Try the shortcuts above!
              </div>
            ) : (
              keyboardLog.map((log, index) => (
                <div key={index} style={{ marginBottom: '5px' }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tooltip State Display */}
        <div style={{ marginBottom: '30px' }}>
          <h2>📊 Tooltip State</h2>
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '15px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}>
            <div><strong>Visible:</strong> {tooltipState.isVisible ? 'Yes' : 'No'}</div>
            <div><strong>Position:</strong> x: {tooltipState.position.x}, y: {tooltipState.position.y}</div>
            <div><strong>Size:</strong> {tooltipState.size.width} × {tooltipState.size.height}</div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '10px',
          margin: '20px 0'
        }}>
          <h3>🎯 How to Use</h3>
          <ol style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
            <li><strong>Click</strong> the buttons above to show tooltips</li>
            <li><strong>Drag</strong> the tooltips by their top handle to move them</li>
            <li><strong>Resize</strong> by dragging the corner handles</li>
            <li><strong>Use keyboard shortcuts</strong> to control tooltips programmatically</li>
            <li><strong>Watch the log</strong> to see keyboard actions in real-time</li>
          </ol>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default InteractiveDemo;
