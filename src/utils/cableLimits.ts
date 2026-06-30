import type { EffectiveTerminal, Product, SystemComponent } from '../types/system';
import { CABLE_TABLE, cableByAwg, voltageDropV } from '../data/cableAmpacity';

export interface CableSizeConstraint {
  minCableAwg?: string;
  maxCableAwg?: string;
  recommendedCableAwg?: string;
}

export interface CombinedCableSizeConstraint extends CableSizeConstraint {
  conflict?: string;
}

function cableTableIndex(awg: string | undefined): number | undefined {
  if (!awg) return undefined;
  const index = CABLE_TABLE.findIndex((cable) => cable.awg === awg);
  return index >= 0 ? index : undefined;
}

function largerMinCableAwg(...awgs: Array<string | undefined>): string | undefined {
  const indexes = awgs
    .map(cableTableIndex)
    .filter((index): index is number => index != null);
  if (indexes.length === 0) return undefined;
  return CABLE_TABLE[Math.max(...indexes)].awg;
}

function smallerMaxCableAwg(...awgs: Array<string | undefined>): string | undefined {
  const indexes = awgs
    .map(cableTableIndex)
    .filter((index): index is number => index != null);
  if (indexes.length === 0) return undefined;
  return CABLE_TABLE[Math.min(...indexes)].awg;
}

export function endpointCableSizeConstraint(
  _product: Product,
  component: SystemComponent,
  terminal: EffectiveTerminal
): CableSizeConstraint {
  return {
    minCableAwg: terminal.minCableAwg,
    maxCableAwg: component.maxCableAwg ?? terminal.maxCableAwg,
    recommendedCableAwg: terminal.recommendedCableAwg,
  };
}

export function combineCableSizeConstraints(
  from: CableSizeConstraint,
  to: CableSizeConstraint
): CombinedCableSizeConstraint {
  const minCableAwg = largerMinCableAwg(from.minCableAwg, to.minCableAwg);
  const maxCableAwg = smallerMaxCableAwg(from.maxCableAwg, to.maxCableAwg);
  const minIndex = cableTableIndex(minCableAwg);
  const maxIndex = cableTableIndex(maxCableAwg);

  const firstRecommended = [from.recommendedCableAwg, to.recommendedCableAwg]
    .filter((awg): awg is string => awg != null && cableTableIndex(awg) != null)
    .sort((a, b) => (cableTableIndex(b) ?? 0) - (cableTableIndex(a) ?? 0))[0];

  return {
    minCableAwg,
    maxCableAwg,
    recommendedCableAwg: firstRecommended,
    conflict: minIndex != null && maxIndex != null && minIndex > maxIndex
      ? `Endpoint cable limits conflict: minimum ${minCableAwg} AWG is larger than maximum ${maxCableAwg} AWG`
      : undefined,
  };
}

export function cableAwgSatisfiesConstraint(awg: string | undefined, constraint: CableSizeConstraint): boolean {
  const index = cableTableIndex(awg);
  if (index == null) return false;
  const minIndex = cableTableIndex(constraint.minCableAwg);
  const maxIndex = cableTableIndex(constraint.maxCableAwg);
  if (minIndex != null && index < minIndex) return false;
  if (maxIndex != null && index > maxIndex) return false;
  return true;
}

export function cableAwgSatisfiesElectrical(
  awg: string | undefined,
  ampacityCurrentA: number,
  voltageDropCurrentA: number,
  lengthFt: number,
  voltageV: number,
  maxDropPercent: number
): boolean {
  const cable = awg ? cableByAwg(awg) : undefined;
  if (!cable || cable.ampacity < ampacityCurrentA) return false;
  const dropPercent = voltageV > 0 ? (voltageDropV(voltageDropCurrentA, lengthFt, awg!) / voltageV) * 100 : 0;
  return dropPercent <= maxDropPercent;
}
