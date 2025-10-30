import React, { createContext, useContext, useRef, useEffect } from 'react';
import { TooltipProviderProps, TooltipConfig } from '../types';
import { PositioningEngine } from '../utils/positioning';

interface TooltipContextValue {
  config: Partial<TooltipConfig>;
  positioningEngine: PositioningEngine;
  zIndex: number;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

export const TooltipProvider: React.FC<TooltipProviderProps> = ({
  children,
  defaultConfig = {},
  zIndex = 9999,
}) => {
  const positioningEngineRef = useRef<PositioningEngine | null>(null);

  useEffect(() => {
    positioningEngineRef.current = new PositioningEngine();
    return () => {
      positioningEngineRef.current?.destroy();
    };
  }, []);

  const contextValue: TooltipContextValue = {
    config: defaultConfig,
    positioningEngine: positioningEngineRef.current!,
    zIndex,
  };

  return (
    <TooltipContext.Provider value={contextValue}>
      {children}
    </TooltipContext.Provider>
  );
};

export const useTooltipContext = (): TooltipContextValue => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltipContext must be used within a TooltipProvider');
  }
  return context;
};
