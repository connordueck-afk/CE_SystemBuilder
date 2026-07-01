// ============================================================
// System Design Validation Engine — authoritative entry point
// ============================================================
// `analyzeSystemDesign` is the single analysis path the UI consumes. It runs the
// staged pipeline:
//
//   1. Normalize          — resolve products, effective terminals, terminal groups.
//   2. Connectivity graph — buildElectricalNetlist (nodes = terminals, nets = power domains).
//   3. Communication      — buildCommunicationNetworks (protocol-level only).
//   4. Design currents    — analyzeSystemCircuits (per-connection sizing: current, fuse, cable, Vdrop).
//   5. Validation         — terminal / terminal-group / capacity / compatibility / protection checks.
//   6. Issues + warnings  — DesignIssue[] plus the composed SystemWarning[].
//   7. Legacy adapters    — circuitAnalysis / netlist / summary / protection recommendations.
//
// The numeric sizing stages are the project's existing deterministic helpers,
// reused here as engine stages (per the refactor brief: "reuse clean, deterministic
// helpers"). This is the only orchestrator — the UI no longer calls those modules
// directly.
// ============================================================

import type { Product, SystemDesign, SystemWarning } from '../../types/system';
import { buildElectricalNetlist, type ElectricalNetlist } from '../electricalNetlist';
import { analyzeSystemCircuits, type SystemCircuitAnalysis } from '../circuitAnalysis';
import { buildCommunicationNetworks } from '../communicationNetworks';
import { buildElectricalSummary } from '../systemSummary';
import { buildProtectionRecommendations } from '../protectionRecommendations';
import { generateWarnings } from '../electricalCalculations';
import { getEffectiveTerminals } from '../effectiveTerminals';
import { effectiveMaxConnections } from '../connectorLimits';
import { analyzeBatteryTopology } from '../batteryTopology';
import { resolveTerminalGroups } from './terminalGroups';
import type {
  ComponentDesignAnalysis,
  DesignIssue,
  SystemDesignAnalysis,
  TerminalDesignAnalysis,
  TerminalGroupDesignAnalysis,
} from './types';

function terminalKey(componentId: string, terminalId: string): string {
  return `${componentId}:${terminalId}`;
}

function terminalPort(product: Product, portId: string | undefined) {
  return portId ? product.ports?.find((port) => port.id === portId) : undefined;
}

function supportsStackedLugs(maxConnections: number | undefined, connectionCount: number): boolean {
  return maxConnections == null || maxConnections >= connectionCount;
}

function terminalDesignCurrentForValidation(
  terminalCurrentSamplesA: number[],
  connectionCount: number,
  isStackableStud: boolean
): number {
  if (terminalCurrentSamplesA.length === 0) return 0;

  const rawCurrentA = Math.max(...terminalCurrentSamplesA);
  if (!isStackableStud || connectionCount < 2) return rawCurrentA;

  // A stud with stacked lugs is an external junction: cable-to-cable current can
  // transfer through the lug stack instead of through the device's internal post.
  // Keep each attached conductor visible, but validate the device terminal against
  // the shared current per stacked connection.
  return Math.max(...terminalCurrentSamplesA.map((currentA) => currentA / connectionCount));
}

function applyBranchCurrentsToNetlist(
  netlist: ElectricalNetlist,
  system: SystemDesign,
  circuit: SystemCircuitAnalysis
) {
  for (const net of netlist.nets) {
    let operatingCurrentA = 0;

    for (const connection of system.connections) {
      const fromNetId = netlist.terminalNetIds.get(terminalKey(connection.fromComponentId, connection.fromTerminalId));
      const toNetId = netlist.terminalNetIds.get(terminalKey(connection.toComponentId, connection.toTerminalId));
      if (fromNetId !== net.id && toNetId !== net.id) continue;
      operatingCurrentA = Math.max(operatingCurrentA, circuit.connections.get(connection.id)?.designCurrentA ?? 0);
    }

    net.operatingCurrentA = operatingCurrentA;
  }

  for (const [connectionId, context] of netlist.connectionContexts) {
    context.operatingCurrentA = circuit.connections.get(connectionId)?.designCurrentA ?? 0;
  }
}

export function analyzeSystemDesign(
  system: SystemDesign,
  products: Map<string, Product>
): SystemDesignAnalysis {
  // --- Stages 2-4: reuse deterministic computation modules ---
  const netlist = buildElectricalNetlist(system, products);
  const circuit = analyzeSystemCircuits(system, products);
  applyBranchCurrentsToNetlist(netlist, system, circuit);
  const batteryTopology = analyzeBatteryTopology(system, products);
  const communicationNetworks = buildCommunicationNetworks(system, products);
  const electricalSummary = buildElectricalSummary(system, products, {
    batteryTopology,
    circuitAnalysis: circuit,
    netlist,
  });
  const protectionRecommendations = buildProtectionRecommendations(system, products, {
    circuitAnalysis: circuit,
  });
  const baseWarnings = generateWarnings(system, products, {
    batteryTopology,
    circuitAnalysis: circuit,
    communicationNetworks,
    netlist,
  });

  const issues: DesignIssue[] = [];

  // --- Per-terminal design current and connection count from the sized branches ---
  const terminalDesignCurrentA = new Map<string, number>();
  const terminalCurrentSamplesA = new Map<string, number[]>();
  const terminalConnectionCount = new Map<string, number>();
  for (const conn of system.connections) {
    const ca = circuit.connections.get(conn.id);
    const currentA = ca?.designCurrentA ?? 0;
    for (const endpoint of [
      terminalKey(conn.fromComponentId, conn.fromTerminalId),
      terminalKey(conn.toComponentId, conn.toTerminalId),
    ]) {
      terminalDesignCurrentA.set(endpoint, Math.max(terminalDesignCurrentA.get(endpoint) ?? 0, currentA));
      terminalCurrentSamplesA.set(endpoint, [...(terminalCurrentSamplesA.get(endpoint) ?? []), currentA]);
      terminalConnectionCount.set(endpoint, (terminalConnectionCount.get(endpoint) ?? 0) + 1);
    }
  }

  // --- Stages 1 + 5: terminal groups, terminal/group validation ---
  const terminals: Record<string, TerminalDesignAnalysis> = {};
  const terminalGroups: Record<string, TerminalGroupDesignAnalysis> = {};
  const components: Record<string, ComponentDesignAnalysis> = {};

  for (const component of system.components) {
    const product = products.get(component.productId);
    const componentIssues: DesignIssue[] = [];
    components[component.id] = {
      componentId: component.id,
      productId: component.productId,
      issues: componentIssues,
    };
    if (!product) continue;

    // Product-data check: active products are expected to declare ports.
    if (!product.ports || product.ports.length === 0) {
      const issue: DesignIssue = {
        id: `data-${component.id}-noports`,
        severity: 'info',
        category: 'product_data',
        code: 'product_missing_ports',
        message: `${product.name} has no port definitions; terminal grouping is fully derived.`,
        componentId: component.id,
      };
      issues.push(issue);
      componentIssues.push(issue);
    }

    const { groups, terminalGroupKeyByTerminalId } = resolveTerminalGroups(product, component);
    const effectiveTerminals = getEffectiveTerminals(product, component);
    const effectiveTerminalDesignCurrentA = new Map<string, number>();

    for (const terminal of effectiveTerminals) {
      const key = terminalKey(component.id, terminal.id);
      const connectionCount = terminalConnectionCount.get(key) ?? 0;
      const maxCurrentA = terminal.maxCurrentA;
      const maxConnections = effectiveMaxConnections(terminal, terminalPort(product, terminal.portId));
      const isStackableStud =
        terminal.connector?.kind === 'stud' &&
        supportsStackedLugs(maxConnections, connectionCount);
      const designCurrentA = terminalDesignCurrentForValidation(
        terminalCurrentSamplesA.get(key) ?? [],
        connectionCount,
        isStackableStud
      );
      effectiveTerminalDesignCurrentA.set(terminal.id, designCurrentA);
      const overCurrent = maxCurrentA != null && maxCurrentA > 0 && designCurrentA > maxCurrentA;
      const tooManyConnections =
        maxConnections != null && maxConnections > 0 && connectionCount > maxConnections;

      terminals[key] = {
        key,
        componentId: component.id,
        terminalId: terminal.id,
        terminalGroupKey: terminalGroupKeyByTerminalId.get(terminal.id),
        maxCurrentA,
        designCurrentA,
        connectionCount,
        maxConnections,
        overCurrent,
        tooManyConnections,
      };

      if (overCurrent) {
        const issue: DesignIssue = {
          id: `term-${key}-overcurrent`,
          severity: 'error',
          category: 'terminal',
          code: 'terminal_overcurrent',
          message: `${component.label ?? product.name} terminal ${terminal.label} carries ${Math.round(
            designCurrentA
          )} A but is rated ${maxCurrentA} A. On daisy-chain / pass-through topologies a single terminal may carry combined bank current — split the connection or add a busbar.`,
          componentId: component.id,
          terminalKey: key,
        };
        issues.push(issue);
        componentIssues.push(issue);
      }
      if (tooManyConnections) {
        const issue: DesignIssue = {
          id: `term-${key}-toomany`,
          severity: 'warning',
          category: 'terminal',
          code: 'terminal_too_many_connections',
          message: `${component.label ?? product.name} terminal ${terminal.label} has ${connectionCount} connections but accepts ${maxConnections}.`,
          componentId: component.id,
          terminalKey: key,
        };
        issues.push(issue);
        componentIssues.push(issue);
      }
    }

    for (const group of groups.values()) {
      const designCurrentA = group.terminalIds.reduce(
        (max, tid) => Math.max(max, effectiveTerminalDesignCurrentA.get(tid) ?? terminalDesignCurrentA.get(terminalKey(component.id, tid)) ?? 0),
        0
      );
      const overRated =
        group.internallyCommon &&
        group.maxCurrentA != null &&
        group.maxCurrentA > 0 &&
        designCurrentA > group.maxCurrentA;
      terminalGroups[group.key] = {
        key: group.key,
        componentId: component.id,
        groupId: group.groupId,
        internallyCommon: group.internallyCommon,
        maxCurrentA: group.maxCurrentA,
        designCurrentA,
        overRated,
      };
      if (overRated) {
        const issue: DesignIssue = {
          id: `group-${group.key}-overrated`,
          severity: 'error',
          category: 'terminal',
          code: 'terminal_group_overrated',
          message: `${component.label ?? product.name} internal ${group.label} bus carries ${Math.round(
            designCurrentA
          )} A but its internal rating is ${group.maxCurrentA} A.`,
          componentId: component.id,
          terminalGroupKey: group.key,
        };
        issues.push(issue);
        componentIssues.push(issue);
      }
    }
  }

  // --- Stage 5: compatibility conflicts surfaced by the graph builder ---
  netlist.conflicts.forEach((message, index) => {
    issues.push({
      id: `conflict-${index}`,
      severity: 'error',
      category: 'compatibility',
      code: 'domain_conflict',
      message,
    });
  });

  // --- Stage 5: communication protocol/topology issues ---
  for (const network of communicationNetworks) {
    for (const error of network.errors) {
      issues.push({
        id: `comm-${network.id}-${error.code}`,
        severity: 'error',
        category: 'communication',
        code: error.code,
        message: error.message,
      });
    }
    for (const warning of network.warnings) {
      issues.push({
        id: `comm-${network.id}-${warning.code}-w`,
        severity: 'warning',
        category: 'communication',
        code: warning.code,
        message: warning.message,
      });
    }
  }

  // --- Stage 6: warnings ---
  // The legacy warning list (over-current, capacity, communication, …) is produced
  // by the composed `generateWarnings` stage and surfaced unchanged so the UI warning
  // panel does not regress. The engine's *new* structured findings (terminal-group
  // bus ratings, daisy-chain terminal overloads, product-data gaps) are exposed via
  // `issues` for consumers that want the richer model without duplicating the list.
  const warnings: SystemWarning[] = baseWarnings;

  const connections: SystemDesignAnalysis['connections'] = {};
  for (const [id, analysis] of circuit.connections) {
    connections[id] = analysis;
  }

  return {
    graph: netlist,
    powerDomains: netlist.nets,
    communicationNetworks,
    connections,
    terminals,
    terminalGroups,
    components,
    issues,
    warnings,
    legacy: {
      circuitAnalysis: circuit,
      electricalNetlist: netlist,
      electricalSummary,
      protectionRecommendations,
    },
  };
}
