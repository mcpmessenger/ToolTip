export const themePresets = {
  default: {
    '--tooltip-bg-color': 'rgba(0, 0, 0, 0.9)',
    '--tooltip-text-color': 'white',
    '--tooltip-border-radius': '8px',
    '--tooltip-padding': '12px 16px',
    '--tooltip-font-size': '14px',
    '--tooltip-font-family': 'system-ui, sans-serif',
    '--tooltip-z-index': '9999',
    '--tooltip-animation-duration': '200ms',
    '--tooltip-animation-easing': 'cubic-bezier(0.4, 0, 0.2, 1)',
    '--tooltip-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '--tooltip-border': '1px solid rgba(255, 255, 255, 0.1)',
  },
  glass: {
    '--tooltip-bg-color': 'rgba(0, 0, 0, 0.7)',
    '--tooltip-text-color': 'white',
    '--tooltip-border-radius': '50px',
    '--tooltip-padding': '16px 24px',
    '--tooltip-font-size': '14px',
    '--tooltip-font-family': 'system-ui, sans-serif',
    '--tooltip-z-index': '9999',
    '--tooltip-animation-duration': '500ms',
    '--tooltip-animation-easing': 'cubic-bezier(0.4, 0, 0.2, 1)',
    '--tooltip-shadow': 'rgba(0,0,0,0.3) 30px 50px 25px -40px, rgba(0,0,0,0.1) 0px 25px 30px 0px',
    '--tooltip-border': '1px solid rgba(255, 255, 255, 0.2)',
    '--glass-tooltip-backdrop-blur': '12px',
    '--glass-tooltip-opacity': '0.9',
    '--glass-tooltip-border-opacity': '0.2',
    '--glass-tooltip-shadow-color': 'rgba(0, 0, 0, 0.3)',
    '--glass-tooltip-3d-perspective': '1000px',
    '--glass-tooltip-3d-rotation': '15deg',
  },
  material: {
    '--tooltip-bg-color': 'rgba(33, 33, 33, 0.9)',
    '--tooltip-text-color': 'white',
    '--tooltip-border-radius': '4px',
    '--tooltip-padding': '8px 12px',
    '--tooltip-font-size': '12px',
    '--tooltip-font-family': 'Roboto, sans-serif',
    '--tooltip-z-index': '9999',
    '--tooltip-animation-duration': '150ms',
    '--tooltip-animation-easing': 'cubic-bezier(0.4, 0, 0.2, 1)',
    '--tooltip-shadow': '0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12)',
    '--tooltip-border': 'none',
  },
  minimal: {
    '--tooltip-bg-color': 'rgba(0, 0, 0, 0.8)',
    '--tooltip-text-color': 'white',
    '--tooltip-border-radius': '4px',
    '--tooltip-padding': '8px 12px',
    '--tooltip-font-size': '13px',
    '--tooltip-font-family': 'system-ui, sans-serif',
    '--tooltip-z-index': '9999',
    '--tooltip-animation-duration': '100ms',
    '--tooltip-animation-easing': 'ease-out',
    '--tooltip-shadow': '0 1px 3px rgba(0, 0, 0, 0.2)',
    '--tooltip-border': 'none',
  },
  dark: {
    '--tooltip-bg-color': 'rgba(17, 24, 39, 0.95)',
    '--tooltip-text-color': 'rgb(243, 244, 246)',
    '--tooltip-border-radius': '8px',
    '--tooltip-padding': '12px 16px',
    '--tooltip-font-size': '14px',
    '--tooltip-font-family': 'system-ui, sans-serif',
    '--tooltip-z-index': '9999',
    '--tooltip-animation-duration': '200ms',
    '--tooltip-animation-easing': 'cubic-bezier(0.4, 0, 0.2, 1)',
    '--tooltip-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '--tooltip-border': '1px solid rgba(75, 85, 99, 0.3)',
  },
};

export const applyTheme = (element: HTMLElement, theme: keyof typeof themePresets) => {
  const themeVars = themePresets[theme];
  Object.entries(themeVars).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
};

export const createCustomTheme = (overrides: Partial<typeof themePresets.default>) => {
  return {
    ...themePresets.default,
    ...overrides,
  };
};
