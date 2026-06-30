import type {
  ConnectionPointKind,
  ConnectionPolarity,
  ConnectionRole,
  Product,
  ProductCommunicationPort,
  ProductPort,
  SystemComponent,
  SystemConnection,
  EffectiveTerminal,
} from '../types/system';
import { getEffectiveTerminal, isDynamicSingleConductorProduct } from './effectiveTerminals';
import { canProvidePower, canReceivePower, terminalDirectionLabel } from './terminalDirection';
import { getDcBusNominalVoltage, isDcBusTerminal } from './dcBusVoltage';
import { effectiveMaxConnections, countTerminalConnections } from './connectorLimits';

export interface TerminalRef {
  component: SystemComponent;
  product: Product;
  terminal: EffectiveTerminal;
}

export interface ConnectionValidationResult {
  valid: boolean;
  message?: string;
}

const POWER_KINDS: ConnectionPointKind[] = ['dc_power', 'pv_power', 'ac_power'];

function terminalName(ref: TerminalRef): string {
  return `${ref.product.name} ${ref.terminal.label}`;
}

function roleCompatible(a: ConnectionRole, b: ConnectionRole): boolean {
  if (a === 'bus' || b === 'bus') return true;
  if (a === 'bidirectional' || b === 'bidirectional') return true;
  if (a === 'pass_through' || b === 'pass_through') return true;
  if ((a === 'source' && b === 'sink') || (a === 'sink' && b === 'source')) return true;
  if ((a === 'sense' && b === 'source') || (a === 'source' && b === 'sense')) return true;
  if ((a === 'control' && b === 'sink') || (a === 'sink' && b === 'control')) return true;
  return false;
}

function directionCompatible(a: EffectiveTerminal, b: EffectiveTerminal): boolean {
  return (canProvidePower(a) && canReceivePower(b)) || (canProvidePower(b) && canReceivePower(a));
}

function commPortFor(ref: TerminalRef): ProductCommunicationPort | ProductPort | undefined {
  const portId = ref.terminal.portId ?? ref.terminal.id;
  return ref.product.ports?.find((p) => p.id === portId && p.kind === 'comm') ??
    ref.product.communicationPorts?.find((p) => p.id === portId) ??
    ref.product.communicationPorts?.find((p) => p.id === ref.terminal.id);
}

/**
 * Resolves the protocol this terminal will actually carry on a wire.
 * Priority: per-instance configuredProtocols → product configuredProtocol →
 * implicit single-protocol → 'unconfigured' (multi-protocol port that needs
 * explicit selection before it can join a network).
 */
function effectiveProtocol(ref: TerminalRef): string | 'unconfigured' | undefined {
  const port = commPortFor(ref);
  if (!port) return undefined;
  const supportedProtocols = port.supportedProtocols ?? [];
  // Per-instance override (set by the user in the inspector)
  const instanceProto = ref.component.configuredProtocols?.[port.id];
  if (instanceProto) return instanceProto;
  // Product-level default
  if (port.configuredProtocol) return port.configuredProtocol;
  // Single-protocol port — no ambiguity
  if (supportedProtocols.length === 1) return supportedProtocols[0];
  // Multi-protocol configurable port — user must pick one before connecting
  if (port.isConfigurable) return 'unconfigured';
  // Multi-protocol non-configurable (e.g. passive bus) — use first entry
  return supportedProtocols[0];
}

/**
 * Blocks connections between communication ports whose protocols don't match.
 * Ports with multiple protocols that haven't been configured yet are also
 * blocked — the user must select a protocol before wiring.
 */
function communicationConflict(from: TerminalRef, to: TerminalRef): ConnectionValidationResult | null {
  if (from.terminal.kind !== 'network' || to.terminal.kind !== 'network') return null;
  if (!commPortFor(from) || !commPortFor(to)) return null;

  const fromProto = effectiveProtocol(from);
  const toProto = effectiveProtocol(to);

  if (fromProto === 'unconfigured') {
    return { valid: false, message: `${terminalName(from)} supports multiple protocols — select one in the inspector before connecting.` };
  }
  if (toProto === 'unconfigured') {
    return { valid: false, message: `${terminalName(to)} supports multiple protocols — select one in the inspector before connecting.` };
  }

  if (fromProto && toProto && fromProto !== toProto) {
    return {
      valid: false,
      message: `${terminalName(from)} (${fromProto}) cannot connect to ${terminalName(to)} (${toProto}) — protocols don't match.`,
    };
  }

  return null;
}

function isSolarSeriesLink(from: TerminalRef, to: TerminalRef): boolean {
  return (
    from.product.productType === 'solar_array' &&
    to.product.productType === 'solar_array' &&
    from.terminal.kind === 'pv_power' &&
    to.terminal.kind === 'pv_power' &&
    from.terminal.polarity !== to.terminal.polarity
  );
}

function isBatterySeriesLink(from: TerminalRef, to: TerminalRef): boolean {
  return (
    from.product.productType === 'battery' &&
    to.product.productType === 'battery' &&
    from.terminal.kind === 'dc_power' &&
    to.terminal.kind === 'dc_power' &&
    from.terminal.polarity != null &&
    to.terminal.polarity != null &&
    from.terminal.polarity !== to.terminal.polarity
  );
}

function isUnassignedDynamicConductor(ref: TerminalRef): boolean {
  return isDynamicSingleConductorProduct(ref.product) &&
    ref.component.inferredConnectionKind == null &&
    ref.component.inferredPolarity == null &&
    ref.component.busPolarity == null;
}

function canInferDynamicConductor(from: TerminalRef, to: TerminalRef): boolean {
  if (!POWER_KINDS.includes(from.terminal.kind) || !POWER_KINDS.includes(to.terminal.kind)) return false;
  const fromCanInfer = isUnassignedDynamicConductor(from) && to.terminal.polarity != null;
  const toCanInfer = isUnassignedDynamicConductor(to) && from.terminal.polarity != null;
  return fromCanInfer || toCanInfer;
}

export function inferDynamicConnectionConductor(
  ref: TerminalRef,
  other: TerminalRef
): { kind: ConnectionPointKind; polarity: ConnectionPolarity; voltageClass: EffectiveTerminal['voltageClass'] } | undefined {
  if (!isUnassignedDynamicConductor(ref) || !POWER_KINDS.includes(other.terminal.kind) || !other.terminal.polarity) {
    return undefined;
  }

  return {
    kind: other.terminal.kind,
    polarity: other.terminal.polarity,
    voltageClass: other.terminal.voltageClass,
  };
}

export function getTerminalRef(
  components: SystemComponent[],
  products: Map<string, Product>,
  componentId: string,
  terminalId: string
): TerminalRef | null {
  const component = components.find((c) => c.id === componentId);
  if (!component) return null;

  const product = products.get(component.productId);
  if (!product) return null;

  const terminal = getEffectiveTerminal(product, terminalId, component);
  if (!terminal) return null;

  return { component, product, terminal };
}

export function validateConnectionPair(
  from: TerminalRef,
  to: TerminalRef,
  existingConnections?: Pick<SystemConnection, 'fromComponentId' | 'fromTerminalId' | 'toComponentId' | 'toTerminalId'>[]
): ConnectionValidationResult {
  if (from.component.id === to.component.id) {
    return { valid: false, message: 'Cannot connect two terminals on the same component.' };
  }

  const inferredDynamicConductor = canInferDynamicConductor(from, to);

  if (from.terminal.kind !== to.terminal.kind && !inferredDynamicConductor) {
    return {
      valid: false,
      message: `${terminalName(from)} is ${from.terminal.kind}; ${terminalName(to)} is ${to.terminal.kind}.`,
    };
  }

  const solarSeriesLink = isSolarSeriesLink(from, to);
  const batterySeriesLink = isBatterySeriesLink(from, to);

  if (from.terminal.polarity !== to.terminal.polarity && !solarSeriesLink && !batterySeriesLink && !inferredDynamicConductor) {
    const left = from.terminal.polarity ?? 'unpolarized';
    const right = to.terminal.polarity ?? 'unpolarized';
    return {
      valid: false,
      message: `${terminalName(from)} is ${left}; ${terminalName(to)} is ${right}.`,
    };
  }

  if (from.terminal.kind === 'generic' || to.terminal.kind === 'generic') {
    return { valid: false, message: 'Generic terminals need a defined connection point type first.' };
  }

  const commConflict = communicationConflict(from, to);
  if (commConflict) return commConflict;

  if (POWER_KINDS.includes(from.terminal.kind) && !from.terminal.polarity && !inferredDynamicConductor) {
    return { valid: false, message: `${terminalName(from)} is missing a conductor polarity.` };
  }

  if (!solarSeriesLink && !batterySeriesLink && !roleCompatible(from.terminal.role, to.terminal.role)) {
    return {
      valid: false,
      message: `${terminalName(from)} is ${from.terminal.role}; ${terminalName(to)} is ${to.terminal.role}.`,
    };
  }

  if (POWER_KINDS.includes(from.terminal.kind) && !solarSeriesLink && !batterySeriesLink && !directionCompatible(from.terminal, to.terminal)) {
    return {
      valid: false,
      message: `${terminalName(from)} is ${terminalDirectionLabel(from.terminal).toLowerCase()}; ${terminalName(to)} is ${terminalDirectionLabel(to.terminal).toLowerCase()}.`,
    };
  }

  if (
    from.terminal.voltageClass &&
    to.terminal.voltageClass &&
    from.terminal.voltageClass !== to.terminal.voltageClass &&
    !inferredDynamicConductor
  ) {
    return {
      valid: false,
      message: `${terminalName(from)} is ${from.terminal.voltageClass}; ${terminalName(to)} is ${to.terminal.voltageClass}.`,
    };
  }

  if (isDcBusTerminal(from.product, from.terminal) && isDcBusTerminal(to.product, to.terminal)) {
    const fromVoltage = getDcBusNominalVoltage(from.component, from.product);
    const toVoltage = getDcBusNominalVoltage(to.component, to.product);
    if (fromVoltage != null && toVoltage != null && fromVoltage !== toVoltage) {
      return {
        valid: false,
        message: `Cannot directly connect ${fromVoltage} VDC bus to ${toVoltage} VDC bus. Use a DC-to-DC converter between voltage domains.`,
      };
    }
  }

  if (existingConnections) {
    const fromMax = effectiveMaxConnections(from.terminal, commPortFor(from));
    if (fromMax != null) {
      const count = countTerminalConnections(existingConnections, from.component.id, from.terminal.id);
      if (count >= fromMax) {
        return { valid: false, message: `${terminalName(from)} already has its maximum of ${fromMax} connection${fromMax !== 1 ? 's' : ''}.` };
      }
    }

    const toMax = effectiveMaxConnections(to.terminal, commPortFor(to));
    if (toMax != null) {
      const count = countTerminalConnections(existingConnections, to.component.id, to.terminal.id);
      if (count >= toMax) {
        return { valid: false, message: `${terminalName(to)} already has its maximum of ${toMax} connection${toMax !== 1 ? 's' : ''}.` };
      }
    }
  }

  return { valid: true };
}

export function validateSystemConnection(
  conn: Pick<SystemConnection, 'fromComponentId' | 'fromTerminalId' | 'toComponentId' | 'toTerminalId'>,
  components: SystemComponent[],
  products: Map<string, Product>,
  existingConnections?: Pick<SystemConnection, 'fromComponentId' | 'fromTerminalId' | 'toComponentId' | 'toTerminalId'>[]
): ConnectionValidationResult {
  const from = getTerminalRef(components, products, conn.fromComponentId, conn.fromTerminalId);
  const to = getTerminalRef(components, products, conn.toComponentId, conn.toTerminalId);

  if (!from || !to) {
    return { valid: false, message: 'Connection references a missing component or terminal.' };
  }

  return validateConnectionPair(from, to, existingConnections);
}
