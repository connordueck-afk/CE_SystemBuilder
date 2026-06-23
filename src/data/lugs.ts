// ============================================================
// lugs.ts — Generic cable lug catalog (estimated pricing)
// ============================================================
// Generic, parametric ring lugs derived from cable gauge + stud
// (hole) size. Pricing is rough/estimated; a real priced catalog
// with manufacturer part numbers will replace this later.
// ============================================================

import { CABLE_TABLE } from './cableAmpacity';

export interface LugSpec {
  id: string;
  /** Human-readable label, e.g. '2/0 AWG ring lug, 3/8" stud'. */
  label: string;
  /** Stud/hole size this lug lands on, e.g. '3/8' or 'M8'. */
  holeSize: string;
  /** Cable gauge the lug is sized for, e.g. '2/0'. */
  awg: string;
  /** Estimated unit MSRP (USD). Rough placeholder pricing. */
  estMsrpUsd: number;
}

/**
 * Rough estimated lug unit price by AWG. Larger conductors use heavier
 * lugs, so price scales with gauge. Values are placeholders.
 */
const LUG_PRICE_BY_AWG: Record<string, number> = {
  '18': 0.35,
  '16': 0.35,
  '14': 0.4,
  '12': 0.45,
  '10': 0.5,
  '8': 0.75,
  '6': 1.1,
  '4': 1.6,
  '2': 2.2,
  '1': 2.8,
  '1/0': 3.4,
  '2/0': 4.2,
  '4/0': 6.5,
};

function formatHole(holeSize: string): string {
  // Imperial fractional sizes get an inch mark; metric (M6/M8) stay as-is.
  return /^m\d/i.test(holeSize) ? holeSize.toUpperCase() : `${holeSize}"`;
}

/** Stable key for deduping/aggregating identical lugs. */
export function lugKey(awg: string, holeSize: string): string {
  return `lug|${awg}|${holeSize}`;
}

/**
 * Select a generic lug for a given cable gauge and stud/hole size.
 * Returns undefined when the gauge is unknown/unspecified or no hole size is set.
 */
export function selectLug(awg: string | undefined, holeSize: string | undefined): LugSpec | undefined {
  if (!awg || !holeSize) return undefined;
  const known = CABLE_TABLE.some((c) => c.awg === awg);
  if (!known) return undefined;

  const estMsrpUsd = LUG_PRICE_BY_AWG[awg] ?? 1.0;
  return {
    id: lugKey(awg, holeSize),
    label: `${awg} AWG ring lug, ${formatHole(holeSize)} stud`,
    holeSize,
    awg,
    estMsrpUsd,
  };
}
