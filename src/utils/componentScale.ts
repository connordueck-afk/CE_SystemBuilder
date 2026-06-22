import type { Product, SystemComponent } from '../types/system';

export const COMPONENT_SCALE_MIN = 0.5;
export const COMPONENT_SCALE_MAX = 2;
export const COMPONENT_SCALE_STEP = 0.05;

export function clampComponentScale(value: number | undefined): number {
  if (value == null || !Number.isFinite(value)) return 1;
  return Math.min(COMPONENT_SCALE_MAX, Math.max(COMPONENT_SCALE_MIN, value));
}

export function componentScale(component: Pick<SystemComponent, 'imageScale'>): number {
  return clampComponentScale(component.imageScale);
}

export function scaledProductSize(product: Product, scale: number): { width: number; height: number } {
  const boundedScale = clampComponentScale(scale);
  return {
    width: product.width * boundedScale,
    height: product.height * boundedScale,
  };
}

export function scaledTerminalOffset(
  component: Pick<SystemComponent, 'imageScale'>,
  terminal: { offsetX: number; offsetY: number }
): { offsetX: number; offsetY: number } {
  const scale = componentScale(component);
  return {
    offsetX: terminal.offsetX * scale,
    offsetY: terminal.offsetY * scale,
  };
}
