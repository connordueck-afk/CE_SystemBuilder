// ============================================================
// communicationNetworks.ts — Communication network graph traversal
// ============================================================
// Detects communication networks by traversing connected
// communication wires and ports, then validates protocol
// compatibility on passive (non-gateway) networks.
// ============================================================

import type {
  SystemDesign,
  SystemConnection,
  Product,
  ProductCommunicationPort,
  ProductPort,
  CommunicationConnectorType,
  CommunicationProtocol,
  CommunicationNetwork,
  CommunicationNetworkError,
  CommunicationNetworkWarning,
} from '../types/system';
import { getEffectiveTerminal } from './effectiveTerminals';
import { genId } from './ids';

interface PortRef {
  componentId: string;
  portId: string;
}

interface CommPortMetadata {
  id: string;
  name: string;
  connectorType?: CommunicationConnectorType;
  supportedProtocols: CommunicationProtocol[];
  configuredProtocol?: CommunicationProtocol;
  isConfigurable?: boolean;
  topology?: ProductCommunicationPort['topology'];
}

export interface ResolvedCommEndpoint {
  component: SystemDesign['components'][number];
  product: Product;
  terminalId: string;
  portId: string;
  port: CommPortMetadata;
  configuredProtocol?: CommunicationProtocol;
}

function portKey(ref: PortRef): string {
  return `${ref.componentId}:${ref.portId}`;
}

function legacyPort(product: Product, portId: string | undefined, terminalId?: string): ProductCommunicationPort | undefined {
  return product.communicationPorts?.find((port) => port.id === portId) ??
    product.communicationPorts?.find((port) => port.id === terminalId);
}

function metadataFromProductPort(port: ProductPort, legacy?: ProductCommunicationPort): CommPortMetadata {
  return {
    id: port.id,
    name: port.label ?? legacy?.name ?? port.id,
    connectorType: port.connectorType ?? legacy?.connectorType,
    supportedProtocols: port.supportedProtocols ?? legacy?.supportedProtocols ?? [],
    configuredProtocol: port.configuredProtocol ?? legacy?.configuredProtocol,
    isConfigurable: port.isConfigurable ?? legacy?.isConfigurable,
    topology: port.commTopology ?? legacy?.topology,
  };
}

function metadataFromLegacyPort(port: ProductCommunicationPort): CommPortMetadata {
  return {
    id: port.id,
    name: port.name,
    connectorType: port.connectorType,
    supportedProtocols: port.supportedProtocols,
    configuredProtocol: port.configuredProtocol,
    isConfigurable: port.isConfigurable,
    topology: port.topology,
  };
}

function resolveCommPortByPortId(
  componentId: string,
  portId: string,
  products: Map<string, Product>,
  components: SystemDesign['components']
) {
  const comp = components.find((c) => c.id === componentId);
  if (!comp) return undefined;
  const product = products.get(comp.productId);
  if (!product) return undefined;
  const productPort = product.ports?.find((p) => p.id === portId && p.kind === 'comm');
  const legacy = legacyPort(product, portId);
  const port = productPort
    ? metadataFromProductPort(productPort, legacy)
    : legacy
      ? metadataFromLegacyPort(legacy)
      : undefined;
  if (!port) return undefined;
  const configuredProtocol = comp.configuredProtocols?.[port.id] ?? port.configuredProtocol;
  return { port, product, comp, configuredProtocol };
}

/** Resolve communication metadata from a connection terminal ID to its owning ProductPort. */
export function resolveCommEndpoint(
  componentId: string,
  terminalId: string,
  products: Map<string, Product>,
  components: SystemDesign['components']
): ResolvedCommEndpoint | undefined {
  const component = components.find((c) => c.id === componentId);
  if (!component) return undefined;
  const product = products.get(component.productId);
  if (!product) return undefined;

  const terminal = getEffectiveTerminal(product, terminalId, component);
  if (!terminal || terminal.kind !== 'network') return undefined;

  const portId = terminal.portId ?? terminal.id;
  const productPort = product.ports?.find((p) => p.id === portId && p.kind === 'comm');
  const legacy = legacyPort(product, portId, terminal.id);
  const port = productPort
    ? metadataFromProductPort(productPort, legacy)
    : legacy
      ? metadataFromLegacyPort(legacy)
      : undefined;
  if (!port) return undefined;

  const configuredProtocol = component.configuredProtocols?.[port.id] ?? port.configuredProtocol;
  return { component, product, terminalId, portId: port.id, port, configuredProtocol };
}

/**
 * Determines the network type (protocol) of a communication link from the two
 * ports it connects. Prefers an explicitly configured protocol that both ends
 * support, then falls back to the shared supported protocol.
 */
export function deriveCommProtocol(
  fromPort: CommPortMetadata | ProductCommunicationPort | undefined,
  fromConfigured: CommunicationProtocol | undefined,
  toPort: CommPortMetadata | ProductCommunicationPort | undefined,
  toConfigured: CommunicationProtocol | undefined
): CommunicationProtocol | undefined {
  const fromSupports = fromPort?.supportedProtocols ?? [];
  const toSupports = toPort?.supportedProtocols ?? [];

  // Prefer a configured protocol that both ends can carry.
  for (const proto of [fromConfigured, toConfigured]) {
    if (!proto) continue;
    const okFrom = !fromPort || fromSupports.includes(proto);
    const okTo = !toPort || toSupports.includes(proto);
    if (okFrom && okTo) return proto;
  }

  // Otherwise use the first protocol both ports support.
  if (fromSupports.length && toSupports.length) {
    const shared = fromSupports.find((p) => toSupports.includes(p));
    if (shared) return shared;
  }

  // Fall back to whatever a single side declares.
  return fromConfigured ?? toConfigured ?? fromSupports[0] ?? toSupports[0];
}

/** Resolves the derived network type for a communication connection. */
export function deriveConnectionProtocol(
  connection: SystemConnection,
  products: Map<string, Product>,
  components: SystemDesign['components']
): CommunicationProtocol | undefined {
  const from = resolveCommEndpoint(connection.fromComponentId, connection.fromTerminalId, products, components);
  const to = resolveCommEndpoint(connection.toComponentId, connection.toTerminalId, products, components);
  return deriveCommProtocol(from?.port, from?.configuredProtocol, to?.port, to?.configuredProtocol);
}

/** Union-Find (DSU) for grouping connected comm ports into networks. */
class UnionFind {
  private parent = new Map<string, string>();

  add(key: string) {
    if (!this.parent.has(key)) this.parent.set(key, key);
  }

  find(key: string): string {
    let root = key;
    while (this.parent.get(root) !== root) {
      root = this.parent.get(root) ?? root;
    }
    // Path compression
    let current = key;
    while (current !== root) {
      const next = this.parent.get(current) ?? current;
      this.parent.set(current, root);
      current = next;
    }
    return root;
  }

  union(a: string, b: string) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }

  groups(): Map<string, string[]> {
    const groups = new Map<string, string[]>();
    for (const key of this.parent.keys()) {
      const root = this.find(key);
      const members = groups.get(root) ?? [];
      members.push(key);
      groups.set(root, members);
    }
    return groups;
  }
}

function communicationPortRefs(product: Product, componentId: string): PortRef[] {
  const refs = new Map<string, PortRef>();
  for (const port of product.ports ?? []) {
    if (port.kind === 'comm') refs.set(port.id, { componentId, portId: port.id });
  }
  for (const port of product.communicationPorts ?? []) {
    if (!refs.has(port.id)) refs.set(port.id, { componentId, portId: port.id });
  }
  return [...refs.values()];
}

function validateNetwork(
  portRefs: PortRef[],
  wireIds: string[],
  products: Map<string, Product>,
  components: SystemDesign['components']
): { errors: CommunicationNetworkError[]; warnings: CommunicationNetworkWarning[] } {
  const errors: CommunicationNetworkError[] = [];
  const warnings: CommunicationNetworkWarning[] = [];

  // Collect all configured protocols and whether any gateway separates them
  const protocolsByPort: CommunicationProtocol[] = [];
  let hasActiveGateway = false;

  for (const ref of portRefs) {
    const resolved = resolveCommPortByPortId(ref.componentId, ref.portId, products, components);
    if (!resolved) continue;

    const comp = components.find((c) => c.id === ref.componentId);
    const product = resolved.product;

    if (product.commAccessoryBehavior === 'active-gateway' || product.commAccessoryBehavior === 'active-interface') {
      hasActiveGateway = true;
      continue;
    }

    if (!resolved.configuredProtocol) {
      if (resolved.port.isConfigurable) {
        warnings.push({
          code: 'COMM_PORT_UNCONFIGURED',
          message: `Communication port "${resolved.port.name}" on "${comp?.label ?? product.name}" has no protocol configured.`,
        });
      }
      continue;
    }

    protocolsByPort.push(resolved.configuredProtocol);
  }

  // If an active gateway is in the network it may bridge protocols — skip protocol conflict check
  if (!hasActiveGateway) {
    const unique = [...new Set(protocolsByPort)];
    if (unique.length > 1) {
      errors.push({
        code: 'COMM_PROTOCOL_CONFLICT',
        message: `Communication network contains incompatible protocols: ${unique.join(', ')}.`,
      });
    }
  }

  return { errors, warnings };
}

/**
 * Analyses the system diagram and returns a list of detected communication networks,
 * each with protocol/connector info and any validation errors/warnings.
 */
export function buildCommunicationNetworks(
  system: SystemDesign,
  products: Map<string, Product>
): CommunicationNetwork[] {
  const dsu = new UnionFind();
  const wiresByPort = new Map<string, string[]>(); // portKey → wireIds

  // Register every communication terminal on every placed component
  for (const comp of system.components) {
    const product = products.get(comp.productId);
    if (!product) continue;
    for (const ref of communicationPortRefs(product, comp.id)) {
      const key = portKey(ref);
      dsu.add(key);
    }
  }

  // Union connected ports via communication wires
  for (const conn of system.connections) {
    if (conn.wireKind !== 'communication') continue;
    const from = resolveCommEndpoint(conn.fromComponentId, conn.fromTerminalId, products, system.components);
    const to = resolveCommEndpoint(conn.toComponentId, conn.toTerminalId, products, system.components);
    if (!from || !to) continue;
    const fromKey = portKey({ componentId: from.component.id, portId: from.portId });
    const toKey = portKey({ componentId: to.component.id, portId: to.portId });
    dsu.add(fromKey);
    dsu.add(toKey);
    dsu.union(fromKey, toKey);
  }

  // Also union all ports of passive accessories (they merge their branches into one network)
  for (const comp of system.components) {
    const product = products.get(comp.productId);
    if (!product || product.commAccessoryBehavior !== 'passive') continue;
    const portKeys = communicationPortRefs(product, comp.id).map(portKey);
    for (let i = 1; i < portKeys.length; i++) {
      dsu.union(portKeys[0], portKeys[i]);
    }
  }

  // Build networks from DSU groups
  const groups = dsu.groups();
  const networks: CommunicationNetwork[] = [];

  for (const [, members] of groups) {
    // Only include groups that have at least one connection (skip isolated ports)
    const portRefs: PortRef[] = members.map((key) => {
      const [componentId, portId] = key.split(':');
      return { componentId, portId };
    });

    const memberSet = new Set(members);
    const connectedWireIds = system.connections
      .filter((conn) => {
        if (conn.wireKind !== 'communication') return false;
        const from = resolveCommEndpoint(conn.fromComponentId, conn.fromTerminalId, products, system.components);
        const to = resolveCommEndpoint(conn.toComponentId, conn.toTerminalId, products, system.components);
        return Boolean(
          (from && memberSet.has(portKey({ componentId: from.component.id, portId: from.portId }))) ||
          (to && memberSet.has(portKey({ componentId: to.component.id, portId: to.portId })))
        );
      })
      .map((c) => c.id);

    if (connectedWireIds.length === 0) continue;

    // Collect protocols and connector types from all ports in this network
    const protocols = new Set<CommunicationProtocol>();
    const connectorTypes = new Set<CommunicationConnectorType>();

    for (const ref of portRefs) {
      const resolved = resolveCommPortByPortId(ref.componentId, ref.portId, products, system.components);
      if (!resolved) continue;
      if (resolved.configuredProtocol) protocols.add(resolved.configuredProtocol);
      if (resolved.port.connectorType) connectorTypes.add(resolved.port.connectorType);
    }

    const { errors, warnings } = validateNetwork(portRefs, connectedWireIds, products, system.components);

    networks.push({
      id: genId('comm-net'),
      portRefs,
      wireIds: connectedWireIds,
      protocols: [...protocols],
      connectorTypes: [...connectorTypes],
      errors,
      warnings,
    });
  }

  return networks;
}

/** Extract all communication-related warnings as SystemWarning objects for the warning panel. */
export function communicationNetworkWarnings(
  networks: CommunicationNetwork[]
): Array<{ id: string; severity: 'error' | 'warning'; message: string; code: string }> {
  const result: Array<{ id: string; severity: 'error' | 'warning'; message: string; code: string }> = [];
  for (const net of networks) {
    for (const err of net.errors) {
      result.push({ id: genId('cwarn'), severity: 'error', message: err.message, code: err.code });
    }
    for (const warn of net.warnings) {
      result.push({ id: genId('cwarn'), severity: 'warning', message: warn.message, code: warn.code });
    }
  }
  return result;
}
