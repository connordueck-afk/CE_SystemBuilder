import type { CableLengthSummaryItem, CableLengthUnit, SystemConnection } from '../types/system';

export function convertCableLengthToFeet(length: number, unit: CableLengthUnit | undefined): number {
  if (!Number.isFinite(length) || length <= 0) return 0;
  return unit === 'm' ? length * 3.28084 : length;
}

export function buildCableLengthSummary(connections: SystemConnection[]): CableLengthSummaryItem[] {
  const byKey = new Map<string, CableLengthSummaryItem>();

  for (const connection of connections) {
    const totalLengthFt = convertCableLengthToFeet(connection.cableLengthFt, connection.cableLengthUnit);
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
