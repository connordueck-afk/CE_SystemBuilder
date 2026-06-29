// ============================================================
// Terminal group normalization
// ============================================================
// Resolves the internal common nodes / logical interfaces behind a placed
// component's terminals. Active products declare explicit terminal groups; a
// defensive derived group is created only so malformed data can still be reported
// without crashing analysis.
// ============================================================

import type {
  ConnectionPointKind,
  Product,
  SystemComponent,
  TerminalGroupType,
} from '../../types/system';
import { getEffectiveTerminals } from '../effectiveTerminals';
import { getTerminalPortId } from '../portSpecs';
import type { ResolvedTerminalGroup } from './types';

function groupTypeForKind(kind: ConnectionPointKind | undefined): TerminalGroupType {
  if (kind === 'network') return 'communication_interface';
  if (kind === 'signal') return 'signal_interface';
  if (kind === 'chassis_ground') return 'ground_reference';
  return 'power_conductor';
}

function positiveRating(value: number | undefined): number | undefined {
  return value != null && value > 0 ? value : undefined;
}

export interface ResolvedTerminalGroups {
  /** groupKey (`componentId:groupId`) -> resolved group */
  groups: Map<string, ResolvedTerminalGroup>;
  /** terminalId -> groupKey */
  terminalGroupKeyByTerminalId: Map<string, string>;
}

export function resolveTerminalGroups(
  product: Product,
  component: SystemComponent
): ResolvedTerminalGroups {
  const terminals = getEffectiveTerminals(product, component);
  const explicitById = new Map((product.terminalGroups ?? []).map((g) => [g.id, g]));
  const portsById = new Map((product.ports ?? []).map((p) => [p.id, p]));

  const groups = new Map<string, ResolvedTerminalGroup>();
  const terminalGroupKeyByTerminalId = new Map<string, string>();

  for (const terminal of terminals) {
    const explicit =
      terminal.terminalGroupId != null ? explicitById.get(terminal.terminalGroupId) : undefined;
    const resolvedPortId = getTerminalPortId(product, terminal);
    const port = resolvedPortId != null ? portsById.get(resolvedPortId) : undefined;

    let groupId: string;
    if (explicit) {
      groupId = explicit.id;
    } else if (port?.topology === 'pass_through') {
      groupId = `derived:${resolvedPortId ?? 'port'}:${terminal.id}`;
    } else {
      groupId = `derived:${resolvedPortId ?? 'noport'}:${terminal.kind ?? 'nokind'}:${
        terminal.polarity ?? 'nopol'
      }`;
    }

    const key = `${component.id}:${groupId}`;
    let group = groups.get(key);
    if (!group) {
      const kind = terminal.kind;
      const internallyCommon = explicit
        ? explicit.internallyCommon
        : port?.topology !== 'pass_through';
      group = {
        key,
        componentId: component.id,
        groupId,
        portId: explicit?.portId ?? resolvedPortId,
        label: explicit?.label ?? terminal.label ?? groupId,
        groupType: explicit?.groupType ?? groupTypeForKind(kind),
        kind,
        polarity: explicit?.polarity ?? terminal.polarity,
        internallyCommon,
        maxCurrentA: positiveRating(explicit?.maxCurrentA) ?? positiveRating(port?.maxCurrentA),
        maxVoltageV: explicit?.maxVoltageV ?? port?.voltageMaxV,
        terminalIds: [],
        derived: !explicit,
      };
      groups.set(key, group);
    }
    group.terminalIds.push(terminal.id);
    terminalGroupKeyByTerminalId.set(terminal.id, key);
  }

  return { groups, terminalGroupKeyByTerminalId };
}
