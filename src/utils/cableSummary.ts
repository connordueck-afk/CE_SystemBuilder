import type { CableLengthSummaryItem, SystemConnection } from '../types/system';

const INCHES_PER_FOOT = 12;

export interface FeetInchesLength {
  feet: number;
  inches: number;
}

export function feetAndInchesToFeet(feet: number, inches: number): number {
  const safeFeet = Number.isFinite(feet) ? Math.max(0, Math.trunc(feet)) : 0;
  const safeInches = Number.isFinite(inches) ? Math.max(0, Math.trunc(inches)) : 0;
  return Math.max(1 / INCHES_PER_FOOT, safeFeet + safeInches / INCHES_PER_FOOT);
}

export function feetToFeetAndInches(lengthFt: number): FeetInchesLength {
  if (!Number.isFinite(lengthFt) || lengthFt <= 0) return { feet: 0, inches: 0 };

  const totalInches = Math.max(1, Math.round(lengthFt * INCHES_PER_FOOT));
  return {
    feet: Math.floor(totalInches / INCHES_PER_FOOT),
    inches: totalInches % INCHES_PER_FOOT,
  };
}

export function formatFeetAndInches(lengthFt: number): string {
  const { feet, inches } = feetToFeetAndInches(lengthFt);
  if (feet === 0) return `${inches} in`;
  if (inches === 0) return `${feet} ft`;
  return `${feet} ft ${inches} in`;
}

export function buildCableLengthSummary(connections: SystemConnection[]): CableLengthSummaryItem[] {
  const byKey = new Map<string, CableLengthSummaryItem>();

  for (const connection of connections) {
    const totalLengthFt = connection.cableLengthFt;
    if (totalLengthFt <= 0) continue;

    const gauge = connection.manualCableAwg ?? connection.recommendedCableAwg ?? 'Unspecified';
    const color = connection.cableColor?.trim() || '';
    const type = connection.cableType?.trim() || '';
    const key = `${gauge}|${color}|${type}`;

    const existing = byKey.get(key);
    if (existing) {
      existing.totalLengthFt += totalLengthFt;
      existing.cableCount += 1;
      continue;
    }

    byKey.set(key, { gauge, color, type, totalLengthFt, cableCount: 1 });
  }

  return Array.from(byKey.values()).sort((a, b) => {
    if (a.gauge === 'Unspecified' && b.gauge !== 'Unspecified') return 1;
    if (b.gauge === 'Unspecified' && a.gauge !== 'Unspecified') return -1;
    const gaugeCompare = a.gauge.localeCompare(b.gauge, undefined, { numeric: true });
    if (gaugeCompare !== 0) return gaugeCompare;
    const colorCompare = a.color.localeCompare(b.color);
    if (colorCompare !== 0) return colorCompare;
    return a.type.localeCompare(b.type);
  });
}
