import type { TerminalSide } from '../types/system';

const DEG = Math.PI / 180;

/** Side → base direction angle in SVG space (y-down, 0° = right). */
const SIDE_ANGLE: Record<TerminalSide, number> = {
  right: 0,
  bottom: 90,
  left: 180,
  top: 270,
};

/** Cardinal angle → nearest side. */
function angleToSide(angleDeg: number): TerminalSide {
  const norm = ((angleDeg % 360) + 360) % 360;
  if (norm < 45 || norm >= 315) return 'right';
  if (norm >= 45 && norm < 135) return 'bottom';
  if (norm >= 135 && norm < 225) return 'left';
  return 'top';
}

/**
 * True when the component is closer to a vertical orientation (90° / 270°)
 * than horizontal (0° / 180°), i.e. |sin| > |cos|.
 */
export function isVerticalOrientation(rotationDeg = 0): boolean {
  const rad = rotationDeg * DEG;
  return Math.abs(Math.sin(rad)) > Math.abs(Math.cos(rad));
}

/**
 * SVG group transform that rotates the component symbol around its local origin.
 * Uses native `rotate(deg)` so any angle works.
 */
export function orientationTransform(rotationDeg = 0): string {
  const norm = ((rotationDeg % 360) + 360) % 360;
  return norm === 0 ? '' : `rotate(${norm})`;
}

/**
 * Inverse of orientationTransform. Wrap upright-content (e.g. hover labels) in a
 * group with this transform so it cancels the parent orientation and renders
 * screen-upright regardless of how the component is rotated.
 */
export function inverseOrientationTransform(rotationDeg = 0): string {
  const norm = ((rotationDeg % 360) + 360) % 360;
  return norm === 0 ? '' : `rotate(${-norm})`;
}

/**
 * Rotate a local offset (relative to component origin) by the component's
 * rotation angle. Uses standard 2D rotation.
 */
export function transformOrientationOffset(
  rotationDeg: number | undefined,
  offsetX: number,
  offsetY: number,
): { x: number; y: number } {
  const deg = rotationDeg ?? 0;
  if (deg === 0) return { x: offsetX, y: offsetY };
  const rad = deg * DEG;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: offsetX * cos - offsetY * sin,
    y: offsetX * sin + offsetY * cos,
  };
}

/**
 * Given a terminal side in local (unrotated) space, return the side that most
 * closely matches after the component has been rotated.
 */
export function transformOrientationSide(
  rotationDeg: number | undefined,
  side: TerminalSide,
): TerminalSide {
  const deg = rotationDeg ?? 0;
  if (deg === 0) return side;
  const baseAngle = SIDE_ANGLE[side];
  const rotated = baseAngle + deg;
  return angleToSide(rotated);
}
