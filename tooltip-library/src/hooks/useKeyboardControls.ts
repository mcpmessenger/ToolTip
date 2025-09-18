import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardControl {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description?: string;
  preventDefault?: boolean;
}

export interface UseKeyboardControlsOptions {
  enabled?: boolean;
  target?: HTMLElement | Document;
  preventDefault?: boolean;
}

export const useKeyboardControls = (
  controls: KeyboardControl[],
  options: UseKeyboardControlsOptions = {}
) => {
  const {
    enabled = true,
    target = document,
    preventDefault = true,
  } = options;

  const controlsRef = useRef(controls);
  controlsRef.current = controls;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const matchingControl = controlsRef.current.find(control => {
      return (
        control.key === event.key &&
        !!control.ctrlKey === event.ctrlKey &&
        !!control.shiftKey === event.shiftKey &&
        !!control.altKey === event.altKey &&
        !!control.metaKey === event.metaKey
      );
    });

    if (matchingControl) {
      if (preventDefault || matchingControl.preventDefault !== false) {
        event.preventDefault();
      }
      matchingControl.action();
    }
  }, [enabled, preventDefault]);

  useEffect(() => {
    if (!enabled) return;

    const targetElement = target === document ? document : target;
    targetElement.addEventListener('keydown', handleKeyDown);

    return () => {
      targetElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, target, handleKeyDown]);

  return {
    isEnabled: enabled,
    controls: controlsRef.current,
  };
};

// Predefined keyboard controls for tooltips
export const createTooltipKeyboardControls = (
  showTooltip: () => void,
  hideTooltip: () => void,
  toggleTooltip: () => void,
  isVisible: boolean
): KeyboardControl[] => [
  {
    key: '/',
    ctrlKey: true,
    action: showTooltip,
    description: 'Show tooltip',
  },
  {
    key: '-',
    ctrlKey: true,
    action: hideTooltip,
    description: 'Hide tooltip',
  },
  {
    key: 't',
    ctrlKey: true,
    action: toggleTooltip,
    description: 'Toggle tooltip',
  },
  {
    key: 'Escape',
    action: isVisible ? hideTooltip : () => {},
    description: 'Hide tooltip (if visible)',
  },
  {
    key: 'ArrowUp',
    ctrlKey: true,
    action: () => {
      // Move tooltip up
      console.log('Move tooltip up');
    },
    description: 'Move tooltip up',
  },
  {
    key: 'ArrowDown',
    ctrlKey: true,
    action: () => {
      // Move tooltip down
      console.log('Move tooltip down');
    },
    description: 'Move tooltip down',
  },
  {
    key: 'ArrowLeft',
    ctrlKey: true,
    action: () => {
      // Move tooltip left
      console.log('Move tooltip left');
    },
    description: 'Move tooltip left',
  },
  {
    key: 'ArrowRight',
    ctrlKey: true,
    action: () => {
      // Move tooltip right
      console.log('Move tooltip right');
    },
    description: 'Move tooltip right',
  },
  {
    key: '+',
    ctrlKey: true,
    action: () => {
      // Increase tooltip size
      console.log('Increase tooltip size');
    },
    description: 'Increase tooltip size',
  },
  {
    key: '-',
    ctrlKey: true,
    action: () => {
      // Decrease tooltip size
      console.log('Decrease tooltip size');
    },
    description: 'Decrease tooltip size',
  },
];

// Hook for tooltip-specific keyboard controls
export const useTooltipKeyboardControls = (
  showTooltip: () => void,
  hideTooltip: () => void,
  toggleTooltip: () => void,
  isVisible: boolean,
  options: UseKeyboardControlsOptions = {}
) => {
  const controls = createTooltipKeyboardControls(showTooltip, hideTooltip, toggleTooltip, isVisible);
  return useKeyboardControls(controls, options);
};
