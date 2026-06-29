// portLinks.ts — Internal terminal linking and port lookup.
//
// Terminals on the same device that share a `portId` AND polarity/kind model one
// electrical node exposed as several physical jacks (e.g. a battery's 4 parallel
// DC+ posts on a shared internal busbar). This module is the single source of
// truth for that grouping so both analysis engines (circuitAnalysis,
// electricalNetlist) and the validators agree on what is bonded.

import type { Product, ProductPort, SystemComponent, TerminalDefinition } from '../types/system';
import { getEffectiveTerminals } from './effectiveTerminals';
import { getTerminalPortId, terminalKind, portTerminalsBond } from './portSpecs';

export function getProductPort(product: Product, portId: string | undefined): ProductPort | undefined {
  if (!portId) return undefined;
  return product.ports?.find((port) => port.id === portId);
}

/**
 * Link-group key for a terminal, or null when it is not part of an internal link
 * group. Same port + same kind + same polarity ⇒ one bonded node. Kind/polarity
 * keep a port's positive and negative sides (and any AC poles) separate.
 *
 * Kind resolves port-first (see portSpecs.terminalKind): once a product carries a
 * typed port, the port's kind drives grouping; until then it falls back to the
 * terminal's own `kind`, so behaviour is identical during migration.
 *
 * A `pass_through` port (series element — fuse, breaker, shunt) never bonds: its
 * terminals are distinct nodes with the device between them. `bus`/`two_pole` and
 * untyped (mid-migration) ports bond same-polarity jacks.
 */
export function linkGroupKey(product: Product, terminal: TerminalDefinition): string | null {
  const portId = getTerminalPortId(product, terminal);
  if (!portId) return null;
  if (!portTerminalsBond(getProductPort(product, portId))) return null;
  const group = terminal.terminalGroupId
    ? product.terminalGroups?.find((candidate) => candidate.id === terminal.terminalGroupId)
    : undefined;
  return `${portId}::${terminalKind(product, terminal)}::${group?.polarity ?? ''}`;
}

/** Group a device's terminals by internal link group (only terminals with a portId). */
export function portLinkGroups(product: Product, component: SystemComponent): Map<string, TerminalDefinition[]> {
  const groups = new Map<string, TerminalDefinition[]>();
  for (const terminal of getEffectiveTerminals(product, component)) {
    const key = linkGroupKey(product, terminal);
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), terminal]);
  }
  return groups;
}

/**
 * Map of terminalId → number of jacks in its link group (1 when unlinked). A
 * device's per-terminal current is divided by this so that summing across the
 * bonded jacks reconstructs the device's total — the fix for multi-jack devices
 * otherwise multiplying their rating.
 */
export function linkGroupSizes(product: Product, component: SystemComponent): Map<string, number> {
  const sizes = new Map<string, number>();
  for (const group of portLinkGroups(product, component).values()) {
    for (const terminal of group) sizes.set(terminal.id, group.length);
  }
  return sizes;
}

/**
 * Zero-impedance internal bonds between linked jacks, as first→other pairs so a
 * group of N jacks yields N-1 edges (enough to connect the group).
 */
export function portLinkPairs(
  product: Product,
  component: SystemComponent
): Array<{ fromTerminalId: string; toTerminalId: string }> {
  const pairs: Array<{ fromTerminalId: string; toTerminalId: string }> = [];
  for (const group of portLinkGroups(product, component).values()) {
    if (group.length < 2) continue;
    for (let i = 1; i < group.length; i += 1) {
      pairs.push({ fromTerminalId: group[0].id, toTerminalId: group[i].id });
    }
  }
  return pairs;
}
