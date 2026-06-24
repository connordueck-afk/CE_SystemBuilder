import type {
  ConnectionPointKind,
  ConnectionPolarity,
  ConnectionRole,
  Product,
  ProductCommunicationPort,
  SystemComponent,
  SystemConnection,
  TerminalDefinition,
} from '../types/system';
import { getEffectiveTerminal, isDynamicSingleConductorProduct } from './effectiveTerminals';
import { canProvidePower, canReceivePower, terminalDirectionLabel } from './terminalDirection';
import { getDcBusNominalVoltage, isDcBusTerminal } from './dcBusVoltage';

export interface TerminalRef {
  component: SystemComponent;
  product: Product;
  terminal: TerminalDefinition;
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

function directionCompatible(a: TerminalDefinition, b: TerminalDefinition): boolean {
  return (canProvidePower(a) && canReceivePower(b)) || (canProvidePower(b) && canReceivePower(a));
}

function commPortFor(ref: TerminalRef): ProductCommunicationPort | undefined {
  return ref.product.communicationPorts?.find((p) => p.id === ref.terminal.id);
}

/**
 * Two communication ports can only be wired together if they can carry a common
 * protocol. A port locked to a single protocol (e.g. VE.Bus) cannot join a
 * different network (e.g. VE.Can / BMS-Can). Configurable ports overlap as long
 * as their supported protocol sets intersect.
 */
function communicationConflict(from: TerminalRef, to: TerminalRef): ConnectionValidationResult | null {
  if (from.terminal.kind !== 'network' || to.terminal.kind !== 'network') return null;

  const fromPort = commPortFor(from);
  const toPort = commPortFor(to);
  if (!fromPort || !toPort) return null;

  const shared = fromPort.supportedProtocols.some((p) => toPort.supportedProtocols.includes(p));
  if (shared) return null;

  return {
    valid: false,
    message: `${terminalName(from)} (${fromPort.supportedProtocols.join('/')}) and ${terminalName(to)} (${toPort.supportedProtocols.join('/')}) are different communication networks and cannot be connected.`,
  };
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
): { kind: ConnectionPointKind; polarity: ConnectionPolarity; voltageClass: TerminalDefinition['voltageClass'] } | undefined {
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

export function validateConnectionPair(from: TerminalRef, to: TerminalRef): ConnectionValidationResult {
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

  return { valid: true };
}

export function validateSystemConnection(
  conn: Pick<SystemConnection, 'fromComponentId' | 'fromTerminalId' | 'toComponentId' | 'toTerminalId'>,
  components: SystemComponent[],
  products: Map<string, Product>
): ConnectionValidationResult {
  const from = getTerminalRef(components, products, conn.fromComponentId, conn.fromTerminalId);
  const to = getTerminalRef(components, products, conn.toComponentId, conn.toTerminalId);

  if (!from || !to) {
    return { valid: false, message: 'Connection references a missing component or terminal.' };
  }

  return validateConnectionPair(from, to);
}
