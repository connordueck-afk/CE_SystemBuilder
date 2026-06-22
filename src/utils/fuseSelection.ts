// ============================================================
// fuseSelection.ts — Single source of truth for choosing a fuse
// or breaker PRODUCT from the catalog given the engine's sizing.
// ============================================================
// The circuit engine (circuitAnalysis.ts) computes an ampacity-capped
// recommendedFuseA. When we turn that number into a concrete catalog
// part, we must preserve the safety invariant:
//
//   a fuse must NEVER exceed the ampacity of the conductor it protects,
//   otherwise the cable can fail before the fuse opens.
//
// Older code rounded the recommendation up to the next available product
// rating without re-checking ampacity, which could place (e.g.) a 100 A
// fuse on a 73 A (8 AWG) cable. This helper makes that impossible.
// ============================================================

import type { Product } from '../types/system';
import { cableByAwg } from '../data/cableAmpacity';

const STYLE_PRIORITY = ['MIDI', 'MEGA', 'ANL', 'Class T', 'MRBF'];

export function fuseStyleRank(style: string): number {
  const index = STYLE_PRIORITY.indexOf(style);
  return index >= 0 ? index : STYLE_PRIORITY.length;
}

export function getFuseStyle(product: Product): string {
  return product.protectionRatings?.fuseStyle ??
    product.protectionRatings?.breakerStyle ??
    product.category ??
    'Fuse';
}

export function getFuseRating(product: Product): number {
  return product.protectionRatings?.currentRatingA ?? product.maxCurrentA ?? 0;
}

/** Ampacity (A) of a cable gauge, or undefined if unknown. */
export function ampacityForAwg(awg: string | undefined): number | undefined {
  if (!awg) return undefined;
  return cableByAwg(awg)?.ampacity;
}

export interface FuseSelectionConstraints {
  /**
   * Desired rating (the engine's recommendedFuseA — already >= 1.25x design
   * current and already ampacity-capped). The selection prefers the smallest
   * product at or above this value.
   */
  targetA?: number;
  /**
   * Hard ceiling: the conductor ampacity (and/or terminal max-fuse). The
   * chosen product's rating is never allowed above this. This is the safety
   * invariant — it protects the cable.
   */
  maxAmpacityA?: number;
}

function compareForSelection(a: Product, b: Product): number {
  return (
    getFuseRating(a) - getFuseRating(b) ||
    fuseStyleRank(getFuseStyle(a)) - fuseStyleRank(getFuseStyle(b)) ||
    a.name.localeCompare(b.name)
  );
}

/**
 * Choose the best-fit fuse/breaker product for a circuit.
 *
 * Rules, in order:
 *  1. Never exceed maxAmpacityA (cable protection).
 *  2. Among parts within the ampacity ceiling, pick the smallest rating
 *     that is >= targetA.
 *  3. If no part can reach targetA without exceeding the ceiling, pick the
 *     largest part still within the ceiling (best protection available — the
 *     under-sizing is then surfaced as a separate warning telling the user the
 *     conductor is too small).
 *  4. If every part exceeds the ceiling (ceiling smaller than the smallest
 *     fuse made), fall back to the smallest part so the UI still has a value.
 */
export function selectBestFuseProduct(
  products: Product[],
  { targetA, maxAmpacityA }: FuseSelectionConstraints
): Product | undefined {
  if (products.length === 0) return undefined;

  const ceiling = maxAmpacityA ?? Infinity;
  const withinAmpacity = products.filter((product) => getFuseRating(product) <= ceiling);
  const pool = withinAmpacity.length > 0 ? withinAmpacity : products;
  const sorted = [...pool].sort(compareForSelection);

  if (targetA != null) {
    const atOrAbove = sorted.filter((product) => getFuseRating(product) >= targetA);
    if (atOrAbove.length > 0) return atOrAbove[0];
    // Cannot reach target without exceeding ampacity — take the largest we can.
    return sorted[sorted.length - 1];
  }

  return sorted[0];
}
