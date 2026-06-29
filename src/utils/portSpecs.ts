// portSpecs.ts — Accessor layer for the port-centric product model.
//
// Electrical boundary specs live on ports. Terminals are physical jacks, and
// terminal groups assign those jacks to conductor/interface groups on a port.

import type {
  CommunicationConnectorType,
  CommunicationProtocol,
  ConnectionPointKind,
  ConnectionPolarity,
  ConnectionRole,
  Product,
  ProductPort,
  PortKind,
  PortTopology,
  TerminalDefinition,
  TerminalDirection,
  VoltageClass,
} from '../types/system';

/** Map a port kind to the terminal `kind` its connectors report. */
const PORT_KIND_TO_TERMINAL_KIND: Record<PortKind, ConnectionPointKind> = {
  dc: 'dc_power',
  ac: 'ac_power',
  pv: 'pv_power',
  comm: 'network',
  ground: 'chassis_ground',
  signal: 'signal',
  generic: 'generic',
};

/** Terminal `kind` implied by a port `kind` (e.g. a `dc` port's terminals are `dc_power`). */
export function portKindToTerminalKind(portKind: PortKind): ConnectionPointKind {
  return PORT_KIND_TO_TERMINAL_KIND[portKind];
}

/** Look up a product's port by id. */
export function getPort(product: Product, portId: string | undefined): ProductPort | undefined {
  if (!portId) return undefined;
  return product.ports?.find((port) => port.id === portId);
}

/**
 * Resolve the port id for a terminal.
 *
 * Port assignment is group-owned: a terminal belongs to a terminal group, and
 * the group belongs to a port.
 */
export function getTerminalPortId(product: Product, terminal: TerminalDefinition): string | undefined {
  const group = terminal.terminalGroupId
    ? product.terminalGroups?.find((candidate) => candidate.id === terminal.terminalGroupId)
    : undefined;
  return group?.portId;
}

/** Resolve the port for a terminal. */
export function getTerminalPort(product: Product, terminal: TerminalDefinition): ProductPort | undefined {
  return getPort(product, getTerminalPortId(product, terminal));
}

/** All terminals belonging to a port through their terminal group. */
export function portTerminals(product: Product, portId: string): TerminalDefinition[] {
  return product.terminals.filter((t) => getTerminalPortId(product, t) === portId);
}

/** Resolved kind of a port. */
export function portKindOf(_product: Product, port: ProductPort): PortKind {
  return port.kind;
}

/** Resolved connection kind for a terminal from its port. */
export function terminalKind(product: Product, terminal: TerminalDefinition): ConnectionPointKind {
  const port = getTerminalPort(product, terminal);
  return port?.kind ? PORT_KIND_TO_TERMINAL_KIND[port.kind] : 'generic';
}

/** Resolved power-flow role for a terminal from its port. */
export function terminalRole(product: Product, terminal: TerminalDefinition): ConnectionRole {
  const port = getTerminalPort(product, terminal);
  return port?.role ?? 'bidirectional';
}

function directionFromRole(role: ConnectionRole | undefined): TerminalDirection | undefined {
  if (role === 'source') return 'output';
  if (role === 'sink' || role === 'sense') return 'input';
  if (role === 'bidirectional' || role === 'bus' || role === 'control') return 'bidirectional';
  return undefined;
}

/** Resolved power-flow direction for a terminal from its port. */
export function terminalDirection(
  product: Product,
  terminal: TerminalDefinition
): TerminalDirection | undefined {
  const port = getTerminalPort(product, terminal);
  return port?.direction ?? directionFromRole(port?.role);
}

/** Internal busbar / circuit current rating for a port. */
export function portMaxCurrentA(port: ProductPort): number | undefined {
  return port.maxCurrentA;
}

function positiveRating(value: number | undefined): number | undefined {
  return value != null && value > 0 ? value : undefined;
}

/**
 * Resolved current rating for a terminal contact.
 *
 * Current limits are layered from most specific to broadest:
 *   1. terminal maxCurrentA, when it is a positive rating
 *   2. terminal group maxCurrentA, for the internal common node / pole
 *   3. port maxCurrentA, for the whole circuit boundary
 *
 * A value of 0 means "unset / not rated here" in catalog source data, so it
 * deliberately falls through to the next layer.
 */
export function terminalMaxCurrentA(product: Product, terminal: TerminalDefinition): number | undefined {
  const terminalRating = positiveRating(terminal.maxCurrentA);
  if (terminalRating != null) return terminalRating;

  const group = terminal.terminalGroupId
    ? product.terminalGroups?.find((candidate) => candidate.id === terminal.terminalGroupId)
    : undefined;
  const groupRating = positiveRating(group?.maxCurrentA);
  if (groupRating != null) return groupRating;

  const port = getTerminalPort(product, terminal);
  return positiveRating(port?.maxCurrentA);
}

/** Circuit shape of a port. */
export function portTopology(port: ProductPort | undefined): PortTopology | undefined {
  return port?.topology;
}

/**
 * Whether terminals on this port bond into one electrical node. `pass_through`
 * (series elements like fuses) never bonds; `bus` and `two_pole` bond same
 * conductor/interface groups.
 */
export function portTerminalsBond(port: ProductPort | undefined): boolean {
  return port?.topology !== 'pass_through';
}

/**
 * Nominal voltage at a port (V). Prefers the port's own voltage; falls back to the
 * device-level `nominalVoltage` (first entry if it is an array).
 */
export function portNominalVoltageV(product: Product, port: ProductPort): number | undefined {
  if (port.nominalVoltageV != null) return port.nominalVoltageV;
  const nv = product.nominalVoltage;
  return Array.isArray(nv) ? nv[0] : nv;
}

/**
 * Voltage class / service of a port.
 */
export function portVoltageClass(product: Product, port: ProductPort): VoltageClass | undefined {
  return port.voltageClass;
}

/** Resolved voltage class for a terminal from its port. */
export function terminalVoltageClass(
  product: Product,
  terminal: TerminalDefinition
): VoltageClass | undefined {
  const port = getTerminalPort(product, terminal);
  return port?.voltageClass;
}

/**
 * Nominal voltage *between two conductors* of a single port, derived from the port's
 * voltage class (service) and the two terminals' polarities — not stored per terminal.
 *
 * This is the "derived, not stored" principle (PORT_REFACTOR_PLAN): a 120/240 split-
 * phase AC port reads 120 V line→neutral and 240 V line→line2 from one service. Returns
 * `undefined` when the class is unknown; `0` when the two polarities don't span a
 * potential difference (same conductor, or two neutrals/grounds).
 */
export function connectionNominalVoltageV(
  voltageClass: VoltageClass | undefined,
  a: ConnectionPolarity | undefined,
  b: ConnectionPolarity | undefined,
  nominalVoltageV?: number
): number | undefined {
  if (!voltageClass) return undefined;
  const set = new Set([a, b].filter(Boolean) as ConnectionPolarity[]);
  const spans = (x: ConnectionPolarity, y: ConnectionPolarity) => set.has(x) && set.has(y);

  switch (voltageClass) {
    case 'dc_low_voltage':
      return spans('positive', 'negative') ? nominalVoltageV ?? 0 : 0;
    case 'pv_high_voltage':
      return spans('positive', 'negative') ? nominalVoltageV ?? 0 : 0;
    case 'ac_120v':
      // Single line + neutral service.
      return spans('line', 'neutral') ? 120 : 0;
    case 'ac_240v':
      // Split-phase (two lines + neutral): 240 line→line2, 120 either line→neutral.
      if (spans('line', 'line2')) return 240;
      if (spans('line', 'neutral') || spans('line2', 'neutral')) return 120;
      return 0;
    case 'signal_low_voltage':
      return nominalVoltageV ?? 0;
    default:
      return undefined;
  }
}

/** True when a port carries communications. */
export function isCommPort(product: Product, port: ProductPort): boolean {
  return portKindOf(product, port) === 'comm';
}

/** Connector type for a comm port (port-first, legacy commPort fallback by shared id). */
export function commConnectorType(
  product: Product,
  port: ProductPort
): CommunicationConnectorType | undefined {
  if (port.connectorType) return port.connectorType;
  return product.communicationPorts?.find((p) => p.id === port.id)?.connectorType;
}

/** Supported protocols for a comm port (port-first, legacy commPort fallback by shared id). */
export function commSupportedProtocols(
  product: Product,
  port: ProductPort
): CommunicationProtocol[] | undefined {
  if (port.supportedProtocols) return port.supportedProtocols;
  return product.communicationPorts?.find((p) => p.id === port.id)?.supportedProtocols;
}
