import type { Product, ProductPort, SystemDesign } from '../types/system';
import type {
  BusType,
  ElectricalNet,
  ElectricalNetlist,
  TerminalNodeRef,
  VoltageDomainIssue,
} from './electricalNetlist';
import { getTerminalPort } from './portSpecs';

const PASSIVE_VOLTAGE_TYPES = new Set([
  'busbar',
  'dc_distribution',
  'fuse_holder',
  'solar_combiner',
  'pvCombinerBox',
  'fuse',
  'breaker',
  'dcDisconnect',
  'acDisconnect',
  'relay',
  'contactor',
  'transferSwitch',
]);

const STANDARD_VOLTAGES = [12, 24, 48] as const;

interface VoltageEvidence {
  voltageV: number;
  kind: ProductPort['kind'];
  componentId: string;
  terminalKey: string;
  label: string;
}

interface PortConstraint {
  componentId: string;
  terminalKey: string;
  portId: string;
  label: string;
  kind: ProductPort['kind'];
  minV?: number;
  maxV?: number;
  nominalV?: number;
  allowedNominalV?: number[];
}

class DisjointSet {
  private readonly parent = new Map<string, string>();

  add(value: string) {
    if (!this.parent.has(value)) this.parent.set(value, value);
  }

  find(value: string): string {
    const parent = this.parent.get(value);
    if (!parent || parent === value) return value;
    const root = this.find(parent);
    this.parent.set(value, root);
    return root;
  }

  union(a: string, b: string) {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) this.parent.set(rootB, rootA);
  }
}

function positiveNumber(value: number | undefined): number | undefined {
  return value != null && Number.isFinite(value) && value > 0 ? value : undefined;
}

export function voltageClassForNominal(voltageV: number): number {
  if (voltageV >= 10 && voltageV <= 16) return 12;
  if (voltageV >= 20 && voltageV <= 32) return 24;
  if (voltageV >= 40 && voltageV <= 64) return 48;
  return Math.round(voltageV * 10) / 10;
}

function acVoltageClass(voltageV: number): number {
  if (voltageV >= 108 && voltageV <= 132) return 120;
  if (voltageV >= 198 && voltageV <= 218) return 208;
  if (voltageV >= 220 && voltageV <= 253) return 240;
  if (voltageV >= 260 && voltageV <= 290) return 277;
  return Math.round(voltageV * 10) / 10;
}

function voltageClassForKind(kind: ProductPort['kind'], voltageV: number): number {
  return kind === 'ac' ? acVoltageClass(voltageV) : voltageClassForNominal(voltageV);
}

function sameVoltageClass(kind: ProductPort['kind'], a: number, b: number): boolean {
  if (kind === 'ac') return acVoltageClass(a) === acVoltageClass(b);
  return voltageClassForNominal(a) === voltageClassForNominal(b);
}

function isDcBus(busType: BusType): boolean {
  return busType === 'dc_pos' || busType === 'dc_neg';
}

type VoltageDomainMedium = 'ac' | 'dc' | 'pv';

function voltageDomainMedium(nets: ElectricalNet[]): VoltageDomainMedium | undefined {
  if (nets.some((net) => net.busType.startsWith('ac_'))) return 'ac';
  if (nets.some((net) => net.busType === 'pv_pos' || net.busType === 'pv_neg')) return 'pv';
  if (nets.some((net) => isDcBus(net.busType))) return 'dc';
  return undefined;
}

function passiveVoltageLimitV(ref: TerminalNodeRef): number | undefined {
  if (!isPassive(ref.product) || ref.product.productType === 'breaker') return undefined;
  const port = portFor(ref);
  const values = [
    ref.product.protectionRatings?.voltageRatingV,
    ref.product.busbarRatings?.voltageRatingV,
    ref.terminal.integratedProtection?.voltageRatingV,
    ref.terminal.voltageMaxV,
    port?.voltageMaxV,
  ].map(positiveNumber).filter((value): value is number => value != null);
  return values.length > 0 ? Math.min(...values) : undefined;
}

function isPassive(product: Product): boolean {
  return PASSIVE_VOLTAGE_TYPES.has(product.productType) || Boolean(product.distributionTopology);
}

function powerPorts(product: Product): ProductPort[] {
  return (product.ports ?? []).filter((port) => port.kind === 'dc' || port.kind === 'pv' || port.kind === 'ac');
}

function portFor(ref: TerminalNodeRef): ProductPort | undefined {
  return getTerminalPort(ref.product, ref.terminal);
}

function inferredAcConfiguration(ref: TerminalNodeRef, port: ProductPort) {
  if (port.acService?.configuration) return port.acService.configuration;
  const groupPolarities = new Set(
    (ref.product.terminalGroups ?? [])
      .filter((group) => group.portId === port.id)
      .map((group) => group.polarity)
      .filter(Boolean)
  );
  const phases = port.phases ?? ref.terminal.phases;
  if (phases === 3 || groupPolarities.has('line3')) return 'three_phase_wye' as const;
  if (phases === 2 || groupPolarities.has('line2')) return 'split_phase' as const;
  return 'single_phase_line_neutral' as const;
}

function acServiceVoltages(ref: TerminalNodeRef, port: ProductPort) {
  const configuration = inferredAcConfiguration(ref, port);
  const instanceVoltageV = positiveNumber(ref.component.instanceVoltageV);
  const nominalVoltageV = instanceVoltageV ?? positiveNumber(port.nominalVoltageV);
  const explicit = port.acService;
  let lineToNeutralVoltageV = positiveNumber(explicit?.lineToNeutralVoltageV);
  let lineToLineVoltageV = positiveNumber(explicit?.lineToLineVoltageV);

  if (configuration === 'single_phase_line_neutral') {
    lineToNeutralVoltageV = instanceVoltageV ?? lineToNeutralVoltageV ?? nominalVoltageV;
    lineToLineVoltageV = lineToLineVoltageV ?? lineToNeutralVoltageV;
  } else if (configuration === 'split_phase') {
    lineToLineVoltageV = instanceVoltageV ?? lineToLineVoltageV ?? nominalVoltageV;
    lineToNeutralVoltageV = instanceVoltageV != null
      ? instanceVoltageV / 2
      : lineToNeutralVoltageV ?? (lineToLineVoltageV != null ? lineToLineVoltageV / 2 : undefined);
  } else if (configuration === 'three_phase_wye') {
    lineToLineVoltageV = instanceVoltageV ?? lineToLineVoltageV ?? nominalVoltageV;
    lineToNeutralVoltageV = instanceVoltageV != null
      ? instanceVoltageV / Math.sqrt(3)
      : lineToNeutralVoltageV ?? (lineToLineVoltageV != null ? lineToLineVoltageV / Math.sqrt(3) : undefined);
  } else {
    lineToLineVoltageV = instanceVoltageV ?? lineToLineVoltageV ?? nominalVoltageV;
  }

  return { configuration, lineToNeutralVoltageV, lineToLineVoltageV };
}

function acConductorVoltageV(ref: TerminalNodeRef, port: ProductPort): number | undefined {
  const service = acServiceVoltages(ref, port);
  if (service.configuration === 'three_phase_delta') return service.lineToLineVoltageV;
  return service.lineToNeutralVoltageV ?? service.lineToLineVoltageV;
}

function exactVoltageEvidence(ref: TerminalNodeRef, port: ProductPort | undefined): VoltageEvidence | undefined {
  if (!port || isPassive(ref.product)) return undefined;
  const { component, product } = ref;
  const label = `${component.label ?? product.name} ${port.label ?? port.id}`;

  if (port.kind === 'ac') {
    const voltageV = acConductorVoltageV(ref, port);
    return voltageV != null ? { voltageV, kind: port.kind, componentId: component.id, terminalKey: ref.key, label } : undefined;
  }

  const instanceVoltage = positiveNumber(component.instanceVoltageV);
  if (instanceVoltage != null && port.kind === 'dc') {
    return { voltageV: instanceVoltage, kind: port.kind, componentId: component.id, terminalKey: ref.key, label };
  }

  const busVoltage = positiveNumber(component.dcNominalVoltage);
  if (busVoltage != null && port.kind === 'dc') {
    return { voltageV: busVoltage, kind: port.kind, componentId: component.id, terminalKey: ref.key, label };
  }

  const portVoltage = positiveNumber(port.nominalVoltageV);
  if (portVoltage != null) {
    return { voltageV: portVoltage, kind: port.kind, componentId: component.id, terminalKey: ref.key, label };
  }

  if (product.productType === 'battery') {
    const batteryVoltage = positiveNumber(product.batteryRatings?.nominalVoltageV);
    if (batteryVoltage != null) {
      return { voltageV: batteryVoltage, kind: port.kind, componentId: component.id, terminalKey: ref.key, label };
    }
  }

  if (product.productType === 'custom_solar_array' && port.kind === 'pv') {
    const voltage = positiveNumber(component.customSolarArrayRatings?.vmpV);
    if (voltage != null) return { voltageV: voltage, kind: port.kind, componentId: component.id, terminalKey: ref.key, label };
  }

  if (product.productType === 'solar_array' && port.kind === 'pv') {
    const voltage = positiveNumber(product.solarPanelRatings?.vmpV);
    if (voltage != null) return { voltageV: voltage, kind: port.kind, componentId: component.id, terminalKey: ref.key, label };
  }

  return undefined;
}

function constraintFor(ref: TerminalNodeRef, port: ProductPort | undefined): PortConstraint | undefined {
  if (!port || isPassive(ref.product)) return undefined;
  const service = port.kind === 'ac' ? acServiceVoltages(ref, port) : undefined;
  const usesLineToLine = service?.configuration === 'three_phase_delta';
  const minV = positiveNumber(
    usesLineToLine ? port.acService?.lineToLineMinV : port.acService?.lineToNeutralMinV
  ) ?? positiveNumber(port.voltageMinV);
  const maxV = positiveNumber(
    usesLineToLine ? port.acService?.lineToLineMaxV : port.acService?.lineToNeutralMaxV
  ) ?? positiveNumber(port.voltageMaxV);
  const nominalV = port.kind === 'ac'
    ? acConductorVoltageV(ref, port)
    : positiveNumber(port.nominalVoltageV);
  let allowedNominalV: number[] | undefined;

  if (ref.product.productType === 'mppt' && port.kind === 'dc') {
    allowedNominalV = ref.product.mpptRatings?.batteryVoltagesV;
  } else if (powerPorts(ref.product).length === 1 && Array.isArray(ref.product.nominalVoltage)) {
    allowedNominalV = ref.product.nominalVoltage;
  }

  if (minV == null && maxV == null && nominalV == null && !allowedNominalV?.length) return undefined;
  return {
    componentId: ref.componentId,
    terminalKey: ref.key,
    portId: port.id,
    label: `${ref.component.label ?? ref.product.name} ${port.label ?? port.id}`,
    kind: port.kind,
    minV,
    maxV,
    nominalV,
    allowedNominalV,
  };
}

function constraintAccepts(constraint: PortConstraint, voltageV: number): boolean {
  if (constraint.minV != null && voltageV < constraint.minV) return false;
  if (constraint.maxV != null && voltageV > constraint.maxV) return false;
  if (constraint.nominalV != null && !sameVoltageClass(constraint.kind, constraint.nominalV, voltageV)) return false;
  if (constraint.allowedNominalV?.length && !constraint.allowedNominalV.some((value) => sameVoltageClass(constraint.kind, value, voltageV))) {
    return false;
  }
  return true;
}

function conductorFamily(ref: TerminalNodeRef): string {
  if (ref.busType !== 'unknown') return ref.busType;
  return `${ref.terminal.kind}:${ref.terminal.polarity ?? 'unknown'}`;
}

function unionPassiveVoltagePaths(system: SystemDesign, netlist: ElectricalNetlist, dsu: DisjointSet) {
  for (const component of system.components) {
    const refs = [...netlist.terminals.values()].filter((ref) => ref.componentId === component.id);
    const product = refs[0]?.product;
    if (!product || !isPassive(product)) continue;

    const netIdsByFamily = new Map<string, string[]>();
    for (const ref of refs) {
      const netId = netlist.terminalNetIds.get(ref.key);
      if (!netId) continue;
      const family = conductorFamily(ref);
      netIdsByFamily.set(family, [...(netIdsByFamily.get(family) ?? []), netId]);
    }
    for (const netIds of netIdsByFamily.values()) {
      for (let index = 1; index < netIds.length; index += 1) dsu.union(netIds[0], netIds[index]);
    }
  }

  // Standalone fuse/breaker products split cable endpoints into separate current
  // nets. Voltage is continuous through the device, so bridge those endpoints in
  // the voltage-domain graph only.
  for (const connection of system.connections) {
    const context = netlist.connectionContexts.get(connection.id);
    if (!context?.fromNetId || !context.toNetId) continue;
    const from = netlist.terminals.get(`${connection.fromComponentId}:${connection.fromTerminalId}`);
    const to = netlist.terminals.get(`${connection.toComponentId}:${connection.toTerminalId}`);
    if ((from && isPassive(from.product)) || (to && isPassive(to.product))) {
      dsu.union(context.fromNetId, context.toNetId);
    }
  }
}

function applyAcCircuitVoltages(system: SystemDesign, netlist: ElectricalNetlist) {
  const groups = new Map<string, typeof system.connections>();
  for (const connection of system.connections) {
    const context = netlist.connectionContexts.get(connection.id);
    if (!context || !context.busType.startsWith('ac_')) continue;
    const from = netlist.terminals.get(`${connection.fromComponentId}:${connection.fromTerminalId}`);
    const to = netlist.terminals.get(`${connection.toComponentId}:${connection.toTerminalId}`);
    if (!from || !to) continue;
    const fromPort = portFor(from)?.id ?? from.terminal.portId ?? from.terminalId;
    const toPort = portFor(to)?.id ?? to.terminal.portId ?? to.terminalId;
    const endpoints = [`${from.componentId}:${fromPort}`, `${to.componentId}:${toPort}`].sort();
    const key = endpoints.join('|');
    groups.set(key, [...(groups.get(key) ?? []), connection]);
  }

  for (const connections of groups.values()) {
    const busTypes = new Set(
      connections
        .map((connection) => netlist.connectionContexts.get(connection.id)?.busType)
        .filter((busType): busType is BusType => Boolean(busType))
    );
    const usesLineToLine = busTypes.has('ac_line2') || busTypes.has('ac_line3');

    for (const connection of connections) {
      const context = netlist.connectionContexts.get(connection.id);
      if (!context) continue;
      const refs = [
        netlist.terminals.get(`${connection.fromComponentId}:${connection.fromTerminalId}`),
        netlist.terminals.get(`${connection.toComponentId}:${connection.toTerminalId}`),
      ].filter((ref): ref is TerminalNodeRef => Boolean(ref));
      const candidates = refs.flatMap((ref) => {
        const port = portFor(ref);
        if (!port || port.kind !== 'ac') return [];
        const service = acServiceVoltages(ref, port);
        const voltageV = context.busType === 'ac_neutral'
          ? service.lineToNeutralVoltageV ?? service.lineToLineVoltageV
          : usesLineToLine || service.configuration === 'three_phase_delta'
            ? service.lineToLineVoltageV ?? service.lineToNeutralVoltageV
            : service.lineToNeutralVoltageV ?? service.lineToLineVoltageV;
        return voltageV != null ? [{ voltageV, source: port.role === 'source' || port.direction === 'output' }] : [];
      });
      const source = candidates.find((candidate) => candidate.source);
      context.circuitVoltageV = source?.voltageV ?? candidates[0]?.voltageV;
    }
  }
}

/** Resolve nominal voltage per connected electrical domain and validate every port against it. */
export function resolveVoltageDomains(system: SystemDesign, netlist: ElectricalNetlist): ElectricalNetlist {
  const dsu = new DisjointSet();
  for (const net of netlist.nets) dsu.add(net.id);
  unionPassiveVoltagePaths(system, netlist, dsu);

  const groups = new Map<string, ElectricalNet[]>();
  for (const net of netlist.nets) {
    const root = dsu.find(net.id);
    groups.set(root, [...(groups.get(root) ?? []), net]);
  }
  applyAcCircuitVoltages(system, netlist);

  const issues: VoltageDomainIssue[] = [];
  for (const [root, nets] of groups) {
    const refs = nets.flatMap((net) => net.terminalKeys.map((key) => netlist.terminals.get(key)).filter((ref): ref is TerminalNodeRef => Boolean(ref)));
    const evidence = refs.map((ref) => exactVoltageEvidence(ref, portFor(ref))).filter((item): item is VoltageEvidence => Boolean(item));
    const constraints = refs.map((ref) => constraintFor(ref, portFor(ref))).filter((item): item is PortConstraint => Boolean(item));
    const classes = [...new Set(evidence.map((item) => voltageClassForKind(item.kind, item.voltageV)))];
    const domainId = `voltage-${root}`;
    let nominalVoltageV: number | undefined;
    let voltageClassV: number | undefined;
    let resolution: ElectricalNet['voltageResolution'] = 'unresolved';
    const hasConflict = classes.length > 1;

    if (classes.length === 1) {
      voltageClassV = classes[0];
      nominalVoltageV = STANDARD_VOLTAGES.includes(voltageClassV as 12 | 24 | 48)
        ? voltageClassV
        : evidence[0]?.voltageV;
      resolution = 'port_evidence';
    } else if (classes.length === 0) {
      const candidates = STANDARD_VOLTAGES.filter((value) => constraints.every((constraint) => constraintAccepts(constraint, value)));
      if (candidates.length === 1) {
        nominalVoltageV = candidates[0];
        voltageClassV = candidates[0];
        resolution = 'port_evidence';
      }
    }

    for (const net of nets) {
      net.voltageDomainId = domainId;
      net.nominalVoltageV = nominalVoltageV;
      net.voltageClassV = voltageClassV;
      net.voltageResolution = resolution;
      net.hasVoltageConflict = hasConflict;
    }

    if (hasConflict) {
      const summary = classes.map((value) => `${value}V`).join(' and ');
      const affected = [...new Set(evidence.map((item) => item.componentId))];
      for (const componentId of affected) {
        issues.push({
          severity: 'error',
          code: 'NET_VOLTAGE_CONFLICT',
          message: `Incompatible voltage evidence (${summary}) shares one electrical domain.`,
          netId: nets[0]?.id,
          componentId,
        });
      }
      continue;
    }

    if (nominalVoltageV == null) continue;

    const medium = voltageDomainMedium(nets);
    const passiveByComponent = new Map<string, TerminalNodeRef[]>();
    for (const ref of refs) {
      if (!isPassive(ref.product)) continue;
      passiveByComponent.set(ref.componentId, [...(passiveByComponent.get(ref.componentId) ?? []), ref]);
    }
    for (const [componentId, componentRefs] of passiveByComponent) {
      const sample = componentRefs[0];
      const label = sample.component.label ?? sample.product.name;
      const limits = componentRefs
        .map(passiveVoltageLimitV)
        .filter((value): value is number => value != null);
      const limitV = limits.length > 0 ? Math.min(...limits) : undefined;
      const circuitVoltageV = medium === 'ac'
        ? Math.max(
          0,
          ...system.connections
            .filter((connection) => connection.fromComponentId === componentId || connection.toComponentId === componentId)
            .map((connection) => netlist.connectionContexts.get(connection.id)?.circuitVoltageV ?? 0)
        )
        : 0;
      const operatingVoltageV = Math.max(nominalVoltageV, circuitVoltageV);

      if (limitV != null && operatingVoltageV > limitV) {
        issues.push({
          severity: 'error',
          code: 'COMPONENT_VOLTAGE_RATING_EXCEEDED',
          message: `${label} is rated ${limitV}V but its connected electrical domain resolves to ${operatingVoltageV}V.`,
          netId: nets[0]?.id,
          componentId,
          terminalKey: sample.key,
        });
      } else if (sample.product.productType === 'fuse' && limitV == null) {
        issues.push({
          severity: 'warning',
          code: 'COMPONENT_VOLTAGE_RATING_UNKNOWN',
          message: `${label} has no verified voltage rating; suitability for the ${operatingVoltageV}V domain is unverified.`,
          netId: nets[0]?.id,
          componentId,
          terminalKey: sample.key,
        });
      }

    }

    const seenPorts = new Set<string>();
    for (const constraint of constraints) {
      const key = `${constraint.componentId}:${constraint.portId}`;
      if (seenPorts.has(key)) continue;
      seenPorts.add(key);
      if (constraintAccepts(constraint, nominalVoltageV)) continue;

      const range = constraint.allowedNominalV?.length
        ? `${constraint.allowedNominalV.join('/')}V`
        : constraint.minV != null || constraint.maxV != null
          ? `${constraint.minV ?? 0}-${constraint.maxV ?? 'unbounded'}V`
          : `${constraint.nominalV}V`;
      issues.push({
        severity: 'error',
        code: 'PORT_VOLTAGE_INCOMPATIBLE',
        message: `${constraint.label} accepts ${range}, but its connected electrical domain resolves to ${nominalVoltageV}V.`,
        netId: nets[0]?.id,
        componentId: constraint.componentId,
        terminalKey: constraint.terminalKey,
      });
    }
  }

  netlist.voltageIssues = issues;
  return netlist;
}

export function connectionNominalVoltageV(netlist: ElectricalNetlist, connectionId: string): number | undefined {
  const context = netlist.connectionContexts.get(connectionId);
  if (!context) return undefined;
  if (context.circuitVoltageV != null && context.circuitVoltageV > 0) return context.circuitVoltageV;
  const netById = new Map(netlist.nets.map((net) => [net.id, net]));
  const values = [context.fromNetId, context.toNetId]
    .map((netId) => netId ? netById.get(netId)?.nominalVoltageV : undefined)
    .filter((value): value is number => value != null && Number.isFinite(value) && value > 0);
  if (values.length === 0) return undefined;
  return values[0];
}

export function componentPortNominalVoltageV(
  netlist: ElectricalNetlist,
  componentId: string,
  portId: string
): number | undefined {
  for (const ref of netlist.terminals.values()) {
    if (ref.componentId !== componentId || portFor(ref)?.id !== portId) continue;
    const netId = netlist.terminalNetIds.get(ref.key);
    const voltage = netlist.nets.find((net) => net.id === netId)?.nominalVoltageV;
    if (voltage != null) return voltage;
  }
  return undefined;
}

export function resolvedDcVoltageDomains(netlist: ElectricalNetlist): number[] {
  return [...new Set(
    netlist.nets
      .filter((net) => isDcBus(net.busType) && net.nominalVoltageV != null && !net.hasVoltageConflict)
      .map((net) => net.voltageClassV ?? net.nominalVoltageV!)
  )].sort((a, b) => a - b);
}
