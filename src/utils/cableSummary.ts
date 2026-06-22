import type { CableLengthSummaryItem, CableLengthUnit, SystemConnection } from '../types/system';

export function convertCableLengthToFeet(length: number, unit: CableLengthUnit | undefined): number {
  if (!Number.isFinite(length) || length <= 0) return 0;
  return unit === 'm' ? length * 3.28084 : length;
}

export function buildCableLengthSummary(connections: SystemConnection[]): CableLengthSummaryItem[] {
  const byGauge = new Map<string, CableLengthSummaryItem>();

  for (const connection of connections) {
    const totalLengthFt = convertCableLengthToFeet(connection.cableLengthFt, connection.cableLengthUnit);
    if (totalLengthFt <= 0) continue;

    const gauge = connection.manualCableAwg ?? connection.recommendedCableAwg ?? 'Unspecified';
    const existing = byGauge.get(gauge);
    if (existing) {
      existing.totalLengthFt += totalLengthFt;
      existing.cableCount += 1;
      continue;
    }

    byGauge.set(gauge, {
      gauge,
      totalLengthFt,
      cableCount: 1,
    });
  }

  return Array.from(byGauge.values()).sort((a, b) => {
    if (a.gauge === 'Unspecified') return 1;
    if (b.gauge === 'Unspecified') return -1;
    return a.gauge.localeCompare(b.gauge, undefined, { numeric: true });
  });
}
