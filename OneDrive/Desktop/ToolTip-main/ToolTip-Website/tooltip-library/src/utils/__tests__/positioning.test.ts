import { PositioningEngine } from '../positioning';

describe('PositioningEngine', () => {
  let positioningEngine: PositioningEngine;

  beforeEach(() => {
    positioningEngine = new PositioningEngine();
  });

  afterEach(() => {
    positioningEngine.destroy();
  });

  describe('calculatePosition', () => {
    const mockTriggerRect = {
      top: 100,
      left: 100,
      right: 200,
      bottom: 150,
      width: 100,
      height: 50,
    };

    const mockTooltipRect = {
      top: 0,
      left: 0,
      right: 80,
      bottom: 40,
      width: 80,
      height: 40,
    };

    it('calculates top placement correctly', () => {
      const position = positioningEngine.calculatePosition(
        mockTriggerRect,
        mockTooltipRect,
        'top',
        { x: 0, y: 10 }
      );

      expect(position.placement).toBe('top');
      expect(position.x).toBe(110); // triggerCenterX - tooltipWidth/2
      expect(position.y).toBe(50); // triggerTop - tooltipHeight - offset
    });

    it('calculates bottom placement correctly', () => {
      const position = positioningEngine.calculatePosition(
        mockTriggerRect,
        mockTooltipRect,
        'bottom',
        { x: 0, y: 10 }
      );

      expect(position.placement).toBe('bottom');
      expect(position.x).toBe(110); // triggerCenterX - tooltipWidth/2
      expect(position.y).toBe(160); // triggerBottom + offset
    });

    it('calculates left placement correctly', () => {
      const position = positioningEngine.calculatePosition(
        mockTriggerRect,
        mockTooltipRect,
        'left',
        { x: 10, y: 0 }
      );

      expect(position.placement).toBe('left');
      expect(position.x).toBe(10); // triggerLeft - tooltipWidth - offset
      expect(position.y).toBe(125); // triggerCenterY - tooltipHeight/2
    });

    it('calculates right placement correctly', () => {
      const position = positioningEngine.calculatePosition(
        mockTriggerRect,
        mockTooltipRect,
        'right',
        { x: 10, y: 0 }
      );

      expect(position.placement).toBe('right');
      expect(position.x).toBe(210); // triggerRight + offset
      expect(position.y).toBe(125); // triggerCenterY - tooltipHeight/2
    });
  });

  describe('getArrowPosition', () => {
    const mockTriggerRect = {
      top: 100,
      left: 100,
      right: 200,
      bottom: 150,
      width: 100,
      height: 50,
    };

    const mockTooltipRect = {
      top: 50,
      left: 110,
      right: 190,
      bottom: 90,
      width: 80,
      height: 40,
    };

    it('calculates arrow position for top placement', () => {
      const arrowPos = positioningEngine.getArrowPosition(
        mockTriggerRect,
        mockTooltipRect,
        'top'
      );

      expect(arrowPos.x).toBe(40); // triggerCenterX - tooltipLeft
      expect(arrowPos.y).toBe(40); // tooltipHeight
      expect(arrowPos.rotation).toBe(0);
    });

    it('calculates arrow position for bottom placement', () => {
      const arrowPos = positioningEngine.getArrowPosition(
        mockTriggerRect,
        mockTooltipRect,
        'bottom'
      );

      expect(arrowPos.x).toBe(40); // triggerCenterX - tooltipLeft
      expect(arrowPos.y).toBe(-8); // -8px
      expect(arrowPos.rotation).toBe(180);
    });
  });
});
