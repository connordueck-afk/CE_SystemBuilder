import type { BomRow, PriceSummary } from '../types/system';

export function buildPriceSummary(rows: BomRow[]): PriceSummary {
  let totalMsrp = 0;
  let totalOem = 0;
  const bySection: Record<string, { msrp: number; oem: number }> = {};
  const byManufacturer: Record<string, { msrp: number; oem: number }> = {};

  for (const row of rows) {
    const msrp = row.extendedMsrpUsd ?? 0;
    const oem = row.extendedOemUsd ?? 0;
    totalMsrp += msrp;
    totalOem += oem;

    if (!bySection[row.section]) bySection[row.section] = { msrp: 0, oem: 0 };
    bySection[row.section].msrp += msrp;
    bySection[row.section].oem += oem;

    if (!byManufacturer[row.manufacturer]) byManufacturer[row.manufacturer] = { msrp: 0, oem: 0 };
    byManufacturer[row.manufacturer].msrp += msrp;
    byManufacturer[row.manufacturer].oem += oem;
  }

  return {
    totalMsrp,
    totalOem,
    savings: totalMsrp - totalOem,
    bySection,
    byManufacturer,
  };
}

export function fmt(value: number | null): string {
  if (value == null) return '—';
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
