import type { TerminalSide } from '../types/system';

export function normalizedOrientation(rotationDeg = 0): 0 | 90 | 180 | 270 {
  const normalized = ((rotationDeg % 360) + 360) % 360;
  if (normalized === 90 || normalized === 180 || normalized === 270) return normalized;
  return 0;
}

export function isVerticalOrientation(rotationDeg = 0): boolean {
  const orientation = normalizedOrientation(rotationDeg);
  return orientation === 90 || orientation === 270;
}

export function orientationTransform(rotationDeg = 0): string {
  switch (normalizedOrientation(rotationDeg)) {
    case 90:
      return 'matrix(0 1 -1 0 0 0)';
    case 180:
      return 'matrix(-1 0 0 1 0 0)';
    case 270:
      return 'matrix(0 -1 -1 0 0 0)';
    default:
      return 'matrix(1 0 0 1 0 0)';
  }
}

export function transformOrientationOffset(rotationDeg: number | undefined, offsetX: number, offsetY: number) {
  switch (normalizedOrientation(rotationDeg)) {
    case 90:
      return { x: -offsetY, y: offsetX };
    case 180:
      return { x: -offsetX, y: offsetY };
    case 270:
      return { x: -offsetY, y: -offsetX };
    default:
      return { x: offsetX, y: offsetY };
  }
}

export function transformOrientationSide(rotationDeg: number | undefined, side: TerminalSide): TerminalSide {
  switch (normalizedOrientation(rotationDeg)) {
    case 90:
      return ({ top: 'right', right: 'bottom', bottom: 'left', left: 'top' } as const)[side];
    case 180:
      return ({ top: 'top', right: 'left', bottom: 'bottom', left: 'right' } as const)[side];
    case 270:
      return ({ top: 'right', right: 'top', bottom: 'left', left: 'bottom' } as const)[side];
    default:
      return side;
  }
}
