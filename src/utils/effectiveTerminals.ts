import type {
  BusPolarity,
  ConnectionPointKind,
  ConnectionPolarity,
  EffectiveTerminal,
  Product,
  SystemComponent,
  TerminalDefinition,
} from '../types/system';
import { inferTerminalDirection } from './terminalDirection';
import {
  getTerminalPortId,
  getTerminalPort,
  portNominalVoltageV,
  terminalDirection as resolvedTerminalDirection,
  terminalKind,
  terminalMaxCurrentA,
  terminalRole,
  terminalVoltageClass,
} from './portSpecs';

export function isGenericBusbar(product: Product): boolean {
  return product.productType === 'busbar' && product.manufacturer === 'Generic';
}

export function isPvBranchConnector(product: Product): boolean {
  return product.productType === 'solar_combiner' && product.category === 'Connectors';
}

function terminalGroupFor(product: Product, terminal: TerminalDefinition) {
  return terminal.terminalGroupId
    ? product.terminalGroups?.find((group) => group.id === terminal.terminalGroupId)
    : undefined;
}

export function isDynamicSingleConductorProduct(product: Product): boolean {
  if (isPvBranchConnector(product) || isGenericBusbar(product)) return true;
  if (['fuse', 'breaker', 'dcDisconnect', 'relay', 'contactor'].includes(product.productType)) {
    const powerTerminals = product.terminals.filter((terminal) => ['dc_power', 'pv_power'].includes(terminalKind(product, terminal)));
    if (powerTerminals.length < 2) return false;
    return new Set(powerTerminals.map((terminal) => terminalGroupFor(product, terminal)?.polarity).filter(Boolean)).size <= 1;
  }

  const description = `${product.name} ${product.description ?? ''}`.toLowerCase();
  if (product.productType === 'monitor' && description.includes('shunt')) {
    const powerTerminals = product.terminals.filter((terminal) => terminalKind(product, terminal) === 'dc_power');
    return powerTerminals.length >= 2;
  }

  return false;
}

export function effectiveBusPolarity(component: SystemComponent): BusPolarity {
  return component.busPolarity ?? 'positive';
}

function polaritySuffix(polarity: ConnectionPolarity | undefined): string {
  if (polarity === 'positive') return '+';
  if (polarity === 'negative') return '-';
  if (polarity === 'line') return ' L';
  if (polarity === 'neutral') return ' N';
  if (polarity === 'ground') return ' G';
  return '';
}

function electricalTypeFor(kind: ConnectionPointKind | undefined, polarity: ConnectionPolarity | undefined): EffectiveTerminal['electricalType'] {
  if (kind === 'pv_power') return polarity === 'negative' ? 'pv_neg' : polarity === 'positive' ? 'pv_pos' : undefined;
  if (kind === 'dc_power') return polarity === 'negative' ? 'dc_neg' : polarity === 'positive' ? 'dc_pos' : undefined;
  if (kind === 'ac_power') return 'ac';
  return undefined;
}

function baseEffectiveTerminal(product: Product, terminal: TerminalDefinition): EffectiveTerminal {
  const group = terminalGroupFor(product, terminal);
  const portId = getTerminalPortId(product, terminal);
  const port = getTerminalPort(product, terminal);
  const role = terminalRole(product, terminal);
  return withEffectiveTerminalDirection({
    ...terminal,
    portId,
    kind: terminalKind(product, terminal),
    role,
    direction: resolvedTerminalDirection(product, terminal) ?? inferTerminalDirection({ id: terminal.id, role }),
    voltageClass: terminalVoltageClass(product, terminal),
    nominalVoltageV: port ? portNominalVoltageV(product, port) : undefined,
    voltageMinV: port?.voltageMinV,
    voltageMaxV: port?.voltageMaxV,
    maxPowerW: port?.maxPowerW,
    phases: port?.phases,
    maxCurrentA: terminalMaxCurrentA(product, terminal),
    polarity: group?.polarity,
    requiresOvercurrentProtection: group?.requiresOvercurrentProtection,
    requiresDisconnect: group?.requiresDisconnect,
    recommendedFuseA: group?.recommendedFuseA,
    maxFuseA: group?.maxFuseA,
  });
}

export function getEffectiveTerminals(product: Product, component?: SystemComponent): EffectiveTerminal[] {
  if (component && isPvBranchConnector(product)) {
    const polarity = component.inferredPolarity ?? component.busPolarity;
    const isAssigned = polarity === 'positive' || polarity === 'negative';
    const isPositive = polarity !== 'negative';
    const electricalType = isAssigned ? (isPositive ? 'pv_pos' : 'pv_neg') : undefined;
    const labelSuffix = isAssigned ? (isPositive ? '+' : '-') : '';

    return product.terminals.map((terminal) => {
      const isOutput = terminal.id === 'out';
      const index = terminal.id.match(/^in_(\d+)$/)?.[1];
      return withEffectiveTerminalDirection({
        ...baseEffectiveTerminal(product, terminal),
        label: isOutput ? `Out${labelSuffix}` : `In ${index ?? ''}${labelSuffix}`,
        electricalType,
        kind: 'pv_power',
        polarity: isAssigned ? polarity : undefined,
        role: 'bus',
        direction: 'bidirectional',
        voltageClass: 'pv_high_voltage',
      });
    });
  }

  if (component && isDynamicSingleConductorProduct(product) && isGenericBusbar(product)) {
    const kind = component.inferredConnectionKind;
    const polarity = component.inferredPolarity;
    const isAssigned = kind != null && polarity != null;
    const suffix = polaritySuffix(polarity);

    return product.terminals.map((terminal, index) => (
      withEffectiveTerminalDirection({
        ...baseEffectiveTerminal(product, terminal),
        label: isAssigned ? `${suffix}${index + 1}` : `T${index + 1}`,
        electricalType: isAssigned ? electricalTypeFor(kind, polarity) : undefined,
        kind: isAssigned ? kind : 'dc_power',
        polarity: isAssigned ? polarity : undefined,
        role: 'bus',
        direction: 'bidirectional',
        voltageClass: isAssigned ? component.inferredVoltageClass ?? terminalVoltageClass(product, terminal) : terminalVoltageClass(product, terminal),
      })
    ));
  }

  if (component && isDynamicSingleConductorProduct(product)) {
    const kind = component.inferredConnectionKind;
    const polarity = component.inferredPolarity;
    const isAssigned = kind != null && polarity != null;
    const suffix = polaritySuffix(polarity);

    return product.terminals.map((terminal) => {
      const base = baseEffectiveTerminal(product, terminal);
      if (!['dc_power', 'pv_power', 'ac_power'].includes(base.kind)) return base;

      return withEffectiveTerminalDirection({
        ...base,
        label: isAssigned ? `${terminal.id.startsWith('out') ? 'Out' : 'In'}${suffix}` : terminal.label.replace(/[+\-]$/, ''),
        electricalType: isAssigned ? electricalTypeFor(kind, polarity) : undefined,
        kind: isAssigned ? kind : base.kind,
        polarity: isAssigned ? polarity : undefined,
        role: base.role === 'sense' ? 'sense' : 'pass_through',
        voltageClass: isAssigned ? component.inferredVoltageClass ?? base.voltageClass : base.voltageClass,
      });
    });
  }

  if (!component || !isGenericBusbar(product)) {
    return product.terminals.map((terminal) => baseEffectiveTerminal(product, terminal));
  }

  const polarity = effectiveBusPolarity(component);
  const electricalType = polarity === 'positive' ? 'dc_pos' : 'dc_neg';
  const labelPrefix = polarity === 'positive' ? '+' : 'G';

  return product.terminals.map((terminal, index) => (
    withEffectiveTerminalDirection({
      ...baseEffectiveTerminal(product, terminal),
      label: `${labelPrefix}${index + 1}`,
      electricalType,
      kind: 'dc_power',
      polarity,
      role: 'bus',
      direction: 'bidirectional',
      voltageClass: 'dc_low_voltage',
    })
  ));
}

export function getEffectiveTerminal(
  product: Product,
  terminalId: string,
  component?: SystemComponent
): EffectiveTerminal | undefined {
  return getEffectiveTerminals(product, component).find((terminal) => terminal.id === terminalId);
}

export function withEffectiveTerminalDirection<T extends EffectiveTerminal>(terminal: T): T {
  return { ...terminal, direction: terminal.direction ?? inferTerminalDirection(terminal) };
}
