import type {
  DistributionFuseSlotDefinition,
  FuseSlotState,
  InternalBusType,
  Product,
  SystemComponent,
} from '../types/system';
import type { BusType } from './electricalNetlist';

export interface InternalDistributionEdge {
  id: string;
  fromTerminalId: string;
  toTerminalId: string;
  busType: BusType;
  fuseSlotId?: string;
  protectionLabel?: string;
  protectionRatingA?: number;
  protectionType?: 'fuse' | 'breaker';
}

export interface ResolvedFuseSlot {
  definition: DistributionFuseSlotDefinition;
  state: FuseSlotState;
  installed: boolean;
  ratingA?: number;
}

function toBusType(busType: InternalBusType): BusType {
  return busType;
}

function positiveNumber(value: number | undefined): number | undefined {
  return value != null && Number.isFinite(value) && value > 0 ? value : undefined;
}

export function hasDistributionTopology(product: Product): boolean {
  return Boolean(product.distributionTopology);
}

export function resolveFuseSlot(
  component: SystemComponent,
  slot: DistributionFuseSlotDefinition
): ResolvedFuseSlot {
  const state = component.fuseSlots?.[slot.id] ?? {};
  const installed = state.installed ?? slot.defaultInstalled ?? true;
  const ratingA = positiveNumber(state.ratingA) ?? positiveNumber(slot.defaultFuseA);

  return {
    definition: slot,
    state,
    installed,
    ratingA,
  };
}

export function buildInternalDistributionEdges(
  component: SystemComponent,
  product: Product
): InternalDistributionEdge[] {
  const topology = product.distributionTopology;
  if (!topology) return [];

  const edges: InternalDistributionEdge[] = [];

  for (const bus of topology.buses) {
    const terminalIds = bus.terminalIds.filter(Boolean);
    if (terminalIds.length < 2) continue;
    const firstTerminalId = terminalIds[0];

    for (const terminalId of terminalIds.slice(1)) {
      edges.push({
        id: `bus:${bus.id}:${firstTerminalId}:${terminalId}`,
        fromTerminalId: firstTerminalId,
        toTerminalId: terminalId,
        busType: toBusType(bus.busType),
      });
    }
  }

  for (const slot of topology.fuseSlots ?? []) {
    const resolved = resolveFuseSlot(component, slot);
    if (!resolved.installed) continue;

    const upstreamBus = topology.buses.find((bus) => bus.id === slot.upstreamBusId);
    const upstreamTerminalId = upstreamBus?.terminalIds[0];
    if (!upstreamBus || !upstreamTerminalId || !slot.downstreamTerminalId) continue;

    edges.push({
      id: `fuse-slot:${slot.id}:${upstreamTerminalId}:${slot.downstreamTerminalId}`,
      fromTerminalId: upstreamTerminalId,
      toTerminalId: slot.downstreamTerminalId,
      busType: toBusType(upstreamBus.busType),
      fuseSlotId: slot.id,
      protectionLabel: slot.label,
      protectionRatingA: resolved.ratingA,
      protectionType: slot.protectionType ?? 'fuse',
    });
  }

  return edges;
}

