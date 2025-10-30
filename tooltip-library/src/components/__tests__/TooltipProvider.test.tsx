import React from 'react';
import { render, screen } from '@testing-library/react';
import { TooltipProvider, useTooltipContext } from '../TooltipProvider';

// Test component that uses the context
const TestComponent = () => {
  const context = useTooltipContext();
  return <div data-testid="context-value">{JSON.stringify(context.config)}</div>;
};

describe('TooltipProvider', () => {
  it('renders children correctly', () => {
    render(
      <TooltipProvider>
        <div data-testid="child">Test Child</div>
      </TooltipProvider>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('provides default configuration', () => {
    render(
      <TooltipProvider>
        <TestComponent />
      </TooltipProvider>
    );
    
    const contextValue = screen.getByTestId('context-value');
    expect(contextValue).toBeInTheDocument();
  });

  it('provides custom configuration', () => {
    const customConfig = { theme: 'glass', delay: 100 };
    
    render(
      <TooltipProvider defaultConfig={customConfig}>
        <TestComponent />
      </TooltipProvider>
    );
    
    const contextValue = screen.getByTestId('context-value');
    expect(contextValue.textContent).toContain('glass');
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTooltipContext must be used within a TooltipProvider');
    
    console.error = originalError;
  });
});
