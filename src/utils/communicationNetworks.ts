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
  CommunicationProtocol,
  CommunicationNetwork,
  CommunicationNetworkError,
  CommunicationNetworkWarning,
} from '../types/system';
import { genId } from './ids';

interface PortRef {
  componentId: string;
  portId: string;
}

function portKey(ref: PortRef): string {
  return `${ref.componentId}:${ref.portId}`;
}

/** Resolve the communication port metadata for a terminal (portId) on a component. */
function resolveCommPort(
  componentId: string,
  portId: string,
  products: Map<string, Product>,
  components: SystemDesign['components']
) {
  const comp = components.find((c) => c.id === componentId);
  if (!comp) return undefined;
  const product = products.get(comp.productId);
  if (!product?.communicationPorts) return undefined;
  const port = product.communicationPorts.find((p) => p.id === portId);
  if (!port) return undefined;
  // Use per-instance configured protocol if set, otherwise use port default
  const configuredProtocol =
    comp.configuredProtocols?.[portId] ?? port.configuredProtocol;
  return { port, product, comp, configuredProtocol };
}

/**
 * Determines the network type (protocol) of a communication link from the two
 * ports it connects. Prefers an explicitly configured protocol that both ends
 * support, then falls back to the shared supported protocol.
 */
export function deriveCommProtocol(
  fromPort: ProductCommunicationPort | undefined,
  fromConfigured: CommunicationProtocol | undefined,
  toPort: ProductCommunicationPort | undefined,
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
  const from = resolveCommPort(connection.fromComponentId, connection.fromTerminalId, products, components);
  const to = resolveCommPort(connection.toComponentId, connection.toTerminalId, products, components);
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
    const resolved = resolveCommPort(ref.componentId, ref.portId, products, components);
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
    if (!product?.communicationPorts) continue;
    for (const port of product.communicationPorts) {
      const key = portKey({ componentId: comp.id, portId: port.id });
      dsu.add(key);
    }
  }

  // Union connected ports via communication wires
  for (const conn of system.connections) {
    if (conn.wireKind !== 'communication') continue;
    const fromKey = portKey({ componentId: conn.fromComponentId, portId: conn.fromTerminalId });
    const toKey = portKey({ componentId: conn.toComponentId, portId: conn.toTerminalId });
    dsu.add(fromKey);
    dsu.add(toKey);
    dsu.union(fromKey, toKey);
    const wires = wiresByPort.get(fromKey) ?? [];
    wires.push(conn.id);
    wiresByPort.set(fromKey, wires);
  }

  // Also union all ports of passive accessories (they merge their branches into one network)
  for (const comp of system.components) {
    const product = products.get(comp.productId);
    if (!product?.communicationPorts || product.commAccessoryBehavior !== 'passive') continue;
    const portKeys = product.communicationPorts.map((p) =>
      portKey({ componentId: comp.id, portId: p.id })
    );
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

    const connectedWireIds = system.connections
      .filter(
        (conn) =>
          conn.wireKind === 'communication' &&
          members.includes(portKey({ componentId: conn.fromComponentId, portId: conn.fromTerminalId }))
      )
      .map((c) => c.id);

    if (connectedWireIds.length === 0) continue;

    // Collect protocols and connector types from all ports in this network
    const protocols = new Set<CommunicationProtocol>();
    const connectorTypes = new Set<string>();

    for (const ref of portRefs) {
      const resolved = resolveCommPort(ref.componentId, ref.portId, products, system.components);
      if (!resolved) continue;
      if (resolved.configuredProtocol) protocols.add(resolved.configuredProtocol);
      connectorTypes.add(resolved.port.connectorType);
    }

    const { errors, warnings } = validateNetwork(portRefs, connectedWireIds, products, system.components);

    networks.push({
      id: genId('comm-net'),
      portRefs,
      wireIds: connectedWireIds,
      protocols: [...protocols],
      connectorTypes: [...connectorTypes] as CommunicationNetwork['connectorTypes'],
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
