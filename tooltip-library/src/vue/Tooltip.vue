<template>
  <div ref="triggerRef">
    <slot />
    <div
      v-if="isVisible"
      ref="tooltipRef"
      :class="tooltipClasses"
      :style="tooltipStyles"
      @mouseenter="handleTooltipMouseEnter"
      @mouseleave="handleTooltipMouseLeave"
    >
      <div :class="innerClasses" :style="innerStyles">
        <slot name="content" :content="content">
          {{ content }}
        </slot>
        <div
          v-if="arrow"
          :class="arrowClasses"
          :style="arrowStyles"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { TooltipConfig, TooltipPlacement } from '../types';
import { PositioningEngine } from '../utils/positioning';
import { applyTheme, themePresets } from '../styles/themes';

interface Props extends TooltipConfig {
  content: string | (() => string);
  trigger?: 'hover' | 'click' | 'focus' | 'manual';
  placement?: TooltipPlacement;
  delay?: number | { show: number; hide: number };
  offset?: number | { x: number; y: number };
  arrow?: boolean;
  interactive?: boolean;
  disabled?: boolean;
  theme?: 'default' | 'glass' | 'material' | 'minimal' | 'dark';
  glassEffect?: boolean;
  animation3D?: boolean;
  glassOpacity?: number;
  blurIntensity?: number;
  shadowIntensity?: number;
  hoverTransform?: string;
}

const props = withDefaults(defineProps<Props>(), {
  trigger: 'hover',
  placement: 'top',
  delay: 0,
  offset: () => ({ x: 0, y: 0 }),
  arrow: false,
  interactive: false,
  disabled: false,
  theme: 'default',
  glassEffect: false,
  animation3D: false,
  glassOpacity: 0.9,
  blurIntensity: 12,
  shadowIntensity: 0.3,
  hoverTransform: 'rotate3d(1,1,0,15deg)',
});

const emit = defineEmits<{
  show: [];
  hide: [];
}>();

const triggerRef = ref<HTMLElement>();
const tooltipRef = ref<HTMLElement>();
const isVisible = ref(false);
const position = ref({ x: 0, y: 0 });
const currentPlacement = ref<TooltipPlacement>(props.placement);
const isHovered = ref(false);

let positioningEngine: PositioningEngine;
let timeoutId: NodeJS.Timeout | null = null;

const tooltipClasses = computed(() => [
  'tooltip-vue',
  props.theme === 'glass' ? 'glass-tooltip-vue' : '',
  props.glassEffect ? 'glass-effect' : '',
]);

const tooltipStyles = computed(() => {
  const baseStyles = {
    position: 'fixed',
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
    zIndex: 9999,
    pointerEvents: isVisible.value ? 'auto' : 'none',
    opacity: isVisible.value ? 1 : 0,
    transition: 'opacity 200ms ease-in-out',
  };

  if (props.theme === 'glass' && props.glassEffect) {
    return {
      ...baseStyles,
      perspective: '1000px',
      transformStyle: 'preserve-3d',
      transform: isHovered.value && props.animation3D ? props.hoverTransform : 'translate3d(0, 0, 0)',
      transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
    };
  }

  return baseStyles;
});

const innerClasses = computed(() => [
  'tooltip-inner',
  props.theme === 'glass' ? 'glass-tooltip-inner' : '',
]);

const innerStyles = computed(() => {
  if (props.theme === 'glass' && props.glassEffect) {
    return {
      position: 'relative',
      borderRadius: '50px',
      background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)',
      backdropFilter: `blur(${props.blurIntensity}px)`,
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: `rgba(0,0,0,${props.shadowIntensity}) 30px 50px 25px -40px, rgba(0,0,0,0.1) 0px 25px 30px 0px`,
      transform: 'translate3d(0, 0, 25px)',
      transformStyle: 'preserve-3d',
      opacity: props.glassOpacity,
      transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
    };
  }

  return {
    backgroundColor: 'var(--tooltip-bg-color, rgba(0, 0, 0, 0.9))',
    color: 'var(--tooltip-text-color, white)',
    borderRadius: 'var(--tooltip-border-radius, 8px)',
    padding: 'var(--tooltip-padding, 12px 16px)',
    fontSize: 'var(--tooltip-font-size, 14px)',
    fontFamily: 'var(--tooltip-font-family, system-ui, sans-serif)',
    boxShadow: 'var(--tooltip-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1))',
    border: 'var(--tooltip-border, 1px solid rgba(255, 255, 255, 0.1))',
  };
});

const arrowClasses = computed(() => ['tooltip-arrow']);
const arrowStyles = computed(() => ({
  position: 'absolute',
  width: '8px',
  height: '8px',
  backgroundColor: 'var(--tooltip-bg-color, rgba(0, 0, 0, 0.9))',
  border: 'var(--tooltip-border, 1px solid rgba(255, 255, 255, 0.1))',
  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
}));

const showTooltip = () => {
  if (props.disabled) return;

  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  const delay = typeof props.delay === 'number' ? props.delay : props.delay?.show || 0;
  
  timeoutId = setTimeout(async () => {
    if (triggerRef.value && tooltipRef.value) {
      await nextTick();
      updatePosition();
      isVisible.value = true;
      emit('show');
    }
  }, delay);
};

const hideTooltip = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  const delay = typeof props.delay === 'number' ? props.delay : props.delay?.hide || 0;
  
  timeoutId = setTimeout(() => {
    isVisible.value = false;
    emit('hide');
  }, delay);
};

const updatePosition = () => {
  if (!triggerRef.value || !tooltipRef.value) return;

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const tooltipRect = tooltipRef.value.getBoundingClientRect();
  
  const pos = positioningEngine.calculatePosition(
    triggerRect,
    tooltipRect,
    props.placement,
    props.offset
  );

  position.value = { x: pos.x, y: pos.y };
  currentPlacement.value = pos.placement;
};

const handleMouseEnter = () => {
  if (props.trigger === 'hover') {
    showTooltip();
  }
};

const handleMouseLeave = () => {
  if (props.trigger === 'hover' && !props.interactive) {
    hideTooltip();
  }
};

const handleClick = () => {
  if (props.trigger === 'click') {
    if (isVisible.value) {
      hideTooltip();
    } else {
      showTooltip();
    }
  }
};

const handleFocus = () => {
  if (props.trigger === 'focus') {
    showTooltip();
  }
};

const handleBlur = () => {
  if (props.trigger === 'focus') {
    hideTooltip();
  }
};

const handleTooltipMouseEnter = () => {
  if (props.interactive) {
    isHovered.value = true;
  }
};

const handleTooltipMouseLeave = () => {
  if (props.interactive) {
    isHovered.value = false;
    hideTooltip();
  }
};

// Public methods
const show = () => {
  showTooltip();
};

const hide = () => {
  hideTooltip();
};

const updateContent = (content: string) => {
  // This would require re-rendering, so we'll update the props
  console.warn('updateContent not implemented for Vue component. Use reactive props instead.');
};

const updateConfig = (config: Partial<TooltipConfig>) => {
  // This would require re-rendering, so we'll update the props
  console.warn('updateConfig not implemented for Vue component. Use reactive props instead.');
};

const destroy = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  positioningEngine.destroy();
};

// Expose methods to parent
defineExpose({
  show,
  hide,
  updateContent,
  updateConfig,
  destroy,
});

onMounted(() => {
  positioningEngine = new PositioningEngine();
  
  if (triggerRef.value) {
    // Apply theme
    if (props.theme && props.theme !== 'default') {
      applyTheme(triggerRef.value, props.theme);
    }

    // Bind events
    if (props.trigger === 'hover') {
      triggerRef.value.addEventListener('mouseenter', handleMouseEnter);
      triggerRef.value.addEventListener('mouseleave', handleMouseLeave);
    } else if (props.trigger === 'click') {
      triggerRef.value.addEventListener('click', handleClick);
    } else if (props.trigger === 'focus') {
      triggerRef.value.addEventListener('focus', handleFocus);
      triggerRef.value.addEventListener('blur', handleBlur);
    }
  }
});

onUnmounted(() => {
  if (triggerRef.value) {
    triggerRef.value.removeEventListener('mouseenter', handleMouseEnter);
    triggerRef.value.removeEventListener('mouseleave', handleMouseLeave);
    triggerRef.value.removeEventListener('click', handleClick);
    triggerRef.value.removeEventListener('focus', handleFocus);
    triggerRef.value.removeEventListener('blur', handleBlur);
  }
  
  destroy();
});

// Watch for prop changes
watch(() => props.placement, () => {
  if (isVisible.value) {
    updatePosition();
  }
});

watch(() => props.offset, () => {
  if (isVisible.value) {
    updatePosition();
  }
});
</script>

<style scoped>
.tooltip-vue {
  pointer-events: none;
}

.tooltip-vue.glass-tooltip-vue {
  perspective: 1000px;
  transform-style: preserve-3d;
}

.tooltip-inner {
  max-width: 300px;
  word-wrap: break-word;
}

.glass-tooltip-inner {
  position: relative;
  transform-style: preserve-3d;
}
</style>
