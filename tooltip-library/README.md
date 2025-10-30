# ToolTip Library

A modern, accessible tooltip library with stunning 3D glass morphism effects. Built with React and TypeScript, this library provides a comprehensive tooltip solution that maintains the distinctive visual appeal of the original ToolTip Companion while offering excellent developer experience and broad compatibility.

## ✨ Features

- **3D Glass Morphism Effects**: Signature visual effects with backdrop blur and 3D transformations
- **Multiple Themes**: Default, Glass, Material, Minimal, and Dark themes
- **Framework Agnostic**: Works with React, Vue, Angular, and vanilla JavaScript
- **Accessibility First**: WCAG 2.1 AA compliant with keyboard navigation
- **Intelligent Positioning**: Automatic collision detection and repositioning
- **Interactive Content**: Support for forms, buttons, and complex layouts
- **TypeScript Support**: Comprehensive type definitions and IntelliSense
- **Lightweight**: Optimized bundle size with tree-shaking support

## 🚀 Quick Start

### Installation

```bash
npm install @tooltip-library/core
```

### Basic Usage

```tsx
import React from 'react';
import { TooltipProvider, TooltipContent, GlassTooltip } from '@tooltip-library/core';

function App() {
  return (
    <TooltipProvider>
      {/* Basic Tooltip */}
      <TooltipContent content="Hello World!" placement="top">
        <button>Hover me</button>
      </TooltipContent>

      {/* Glass Tooltip with 3D Effects */}
      <GlassTooltip 
        content="Amazing glass effect!" 
        placement="bottom"
        glassEffect={true}
        animation3D={true}
      >
        <button>Hover me (Glass)</button>
      </GlassTooltip>
    </TooltipProvider>
  );
}
```

## 🎨 Themes

The library includes five built-in themes:

### Default Theme
Clean, minimal design suitable for most applications.

### Glass Theme
The signature 3D glass morphism effect with backdrop blur and transparency.

### Material Theme
Material Design-inspired tooltips with elevation shadows.

### Minimal Theme
Ultra-lightweight theme with minimal styling.

### Dark Theme
Dark mode optimized colors and contrasts.

```tsx
<TooltipContent content="Themed tooltip" theme="glass">
  <button>Themed Button</button>
</TooltipContent>
```

## ⚙️ Configuration

### TooltipContent Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `ReactNode \| string \| function` | - | Tooltip content |
| `trigger` | `'hover' \| 'click' \| 'focus' \| 'manual'` | `'hover'` | Trigger event |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right' \| 'auto'` | `'top'` | Tooltip placement |
| `delay` | `number \| { show: number, hide: number }` | `0` | Show/hide delay |
| `offset` | `number \| { x: number, y: number }` | `{ x: 0, y: 0 }` | Position offset |
| `arrow` | `boolean` | `false` | Show arrow pointer |
| `interactive` | `boolean` | `false` | Allow interactive content |
| `disabled` | `boolean` | `false` | Disable tooltip |
| `theme` | `'default' \| 'glass' \| 'material' \| 'minimal' \| 'dark'` | `'default'` | Theme preset |
| `onShow` | `() => void` | - | Show callback |
| `onHide` | `() => void` | - | Hide callback |

### GlassTooltip Props

Extends `TooltipContent` with additional glass effect properties:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `glassEffect` | `boolean` | `true` | Enable glass morphism |
| `animation3D` | `boolean` | `true` | Enable 3D animations |
| `glassOpacity` | `number` | `0.9` | Glass opacity |
| `blurIntensity` | `number` | `12` | Backdrop blur intensity |
| `shadowIntensity` | `number` | `0.3` | Shadow intensity |
| `hoverTransform` | `string` | `'rotate3d(1,1,0,15deg)'` | Hover transform |

## 🎯 Advanced Usage

### Interactive Content

```tsx
<TooltipContent
  content={
    <div>
      <h3>Interactive Tooltip</h3>
      <button onClick={() => alert('Clicked!')}>
        Click me
      </button>
    </div>
  }
  interactive={true}
  trigger="click"
>
  <button>Interactive Tooltip</button>
</TooltipContent>
```

### Custom Styling

```tsx
<TooltipContent
  content="Custom styled tooltip"
  style={{
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    borderRadius: '20px',
    padding: '20px',
  }}
>
  <button>Custom Styled</button>
</TooltipContent>
```

### Global Configuration

```tsx
<TooltipProvider
  defaultConfig={{
    theme: 'glass',
    delay: { show: 300, hide: 100 },
    offset: { x: 0, y: 10 },
  }}
  zIndex={10000}
>
  {/* Your app content */}
</TooltipProvider>
```

## 🔧 Customization

### CSS Custom Properties

The library uses CSS custom properties for easy theming:

```css
:root {
  --tooltip-bg-color: rgba(0, 0, 0, 0.9);
  --tooltip-text-color: white;
  --tooltip-border-radius: 8px;
  --tooltip-padding: 12px 16px;
  --tooltip-font-size: 14px;
  --tooltip-animation-duration: 200ms;
  --tooltip-animation-easing: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Custom Themes

```tsx
import { createCustomTheme } from '@tooltip-library/core';

const customTheme = createCustomTheme({
  '--tooltip-bg-color': 'rgba(255, 0, 0, 0.9)',
  '--tooltip-text-color': 'white',
  '--tooltip-border-radius': '20px',
});
```

## 📱 Responsive Design

The library automatically adapts to different screen sizes and input methods:

- **Mobile**: Touch-optimized interactions
- **Desktop**: Hover and keyboard navigation
- **Tablet**: Hybrid interaction patterns

## ♿ Accessibility

- **Keyboard Navigation**: Full keyboard support with Tab, Enter, and Escape
- **Screen Reader Support**: Proper ARIA attributes and semantic structure
- **High Contrast**: Respects user preferences for high contrast mode
- **Reduced Motion**: Honors `prefers-reduced-motion` settings

## 🚀 Performance

- **Tree Shaking**: Only import what you use
- **Hardware Acceleration**: CSS transforms for smooth animations
- **Efficient Positioning**: Optimized collision detection
- **Memory Management**: Automatic cleanup and garbage collection

## 📦 Bundle Size

- **Core Library**: ~15KB gzipped
- **With Glass Effects**: ~25KB gzipped
- **Full Features**: ~35KB gzipped

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Inspired by the original ToolTip Companion application
- Built with modern web standards and accessibility best practices
- Community feedback and contributions

---

**Made with ❤️ by the ToolTip Library Team**
