import type { ConnectionPolarity, Product, SystemComponent, TerminalDefinition, BusPolarity } from '../types/system';
import { inferTerminalDirection } from './terminalDirection';

export function isGenericBusbar(product: Product): boolean {
  return product.productType === 'busbar' && product.manufacturer === 'Generic';
}

export function isPvBranchConnector(product: Product): boolean {
  return product.productType === 'solar_combiner' && product.category === 'Connectors';
}

export function isDynamicSingleConductorProduct(product: Product): boolean {
  if (isPvBranchConnector(product) || isGenericBusbar(product)) return true;
  if (['fuse', 'breaker', 'dcDisconnect', 'relay', 'contactor'].includes(product.productType)) {
    const powerTerminals = product.terminals.filter((terminal) => ['dc_power', 'pv_power'].includes(terminal.kind));
    if (powerTerminals.length < 2) return false;
    return new Set(powerTerminals.map((terminal) => terminal.polarity).filter(Boolean)).size <= 1;
  }

  const description = `${product.name} ${product.description ?? ''}`.toLowerCase();
  if (product.productType === 'monitor' && description.includes('shunt')) {
    const powerTerminals = product.terminals.filter((terminal) => terminal.kind === 'dc_power');
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

function electricalTypeFor(kind: TerminalDefinition['kind'] | undefined, polarity: ConnectionPolarity | undefined): TerminalDefinition['electricalType'] {
  if (kind === 'pv_power') return polarity === 'negative' ? 'pv_neg' : polarity === 'positive' ? 'pv_pos' : undefined;
  if (kind === 'dc_power') return polarity === 'negative' ? 'dc_neg' : polarity === 'positive' ? 'dc_pos' : undefined;
  if (kind === 'ac_power') return 'ac';
  return undefined;
}

export function getEffectiveTerminals(product: Product, component?: SystemComponent): TerminalDefinition[] {
  if (component && isPvBranchConnector(product)) {
    const polarity = component.inferredPolarity ?? component.busPolarity;
    const isAssigned = polarity === 'positive' || polarity === 'negative';
    const isPositive = polarity !== 'negative';
    const electricalType = isAssigned ? (isPositive ? 'pv_pos' : 'pv_neg') : undefined;
    const labelSuffix = isAssigned ? (isPositive ? '+' : '-') : '';

    return product.terminals.map((terminal) => {
      const isOutput = terminal.id === 'out';
      const index = terminal.id.match(/^in_(\d+)$/)?.[1];
      const effectiveTerminal: TerminalDefinition = {
        ...terminal,
        label: isOutput ? `Out${labelSuffix}` : `In ${index ?? ''}${labelSuffix}`,
        electricalType,
        kind: 'pv_power',
        polarity: isAssigned ? polarity : undefined,
        role: 'bus',
        direction: 'bidirectional',
        voltageClass: 'pv_high_voltage',
      };

      return withEffectiveTerminalDirection(effectiveTerminal);
    });
  }

  if (component && isDynamicSingleConductorProduct(product) && isGenericBusbar(product)) {
    const kind = component.inferredConnectionKind;
    const polarity = component.inferredPolarity;
    const isAssigned = kind != null && polarity != null;
    const suffix = polaritySuffix(polarity);

    return product.terminals.map((terminal, index) => {
      const effectiveTerminal: TerminalDefinition = {
        ...terminal,
        label: isAssigned ? `${suffix}${index + 1}` : `T${index + 1}`,
        electricalType: isAssigned ? electricalTypeFor(kind, polarity) : undefined,
        kind: isAssigned ? kind : 'dc_power',
        polarity: isAssigned ? polarity : undefined,
        role: 'bus',
        direction: 'bidirectional',
        voltageClass: isAssigned ? component.inferredVoltageClass ?? terminal.voltageClass : terminal.voltageClass,
      };

      return withEffectiveTerminalDirection(effectiveTerminal);
    });
  }

  if (component && isDynamicSingleConductorProduct(product)) {
    const kind = component.inferredConnectionKind;
    const polarity = component.inferredPolarity;
    const isAssigned = kind != null && polarity != null;
    const suffix = polaritySuffix(polarity);

    return product.terminals.map((terminal) => {
      if (!['dc_power', 'pv_power', 'ac_power'].includes(terminal.kind)) {
        return withEffectiveTerminalDirection(terminal);
      }

      const effectiveTerminal: TerminalDefinition = {
        ...terminal,
        label: isAssigned ? `${terminal.id.startsWith('out') ? 'Out' : 'In'}${suffix}` : terminal.label.replace(/[+\-]$/, ''),
        electricalType: isAssigned ? electricalTypeFor(kind, polarity) : undefined,
        kind: isAssigned ? kind : terminal.kind,
        polarity: isAssigned ? polarity : undefined,
        role: terminal.role === 'sense' ? 'sense' : 'pass_through',
        voltageClass: isAssigned ? component.inferredVoltageClass ?? terminal.voltageClass : terminal.voltageClass,
      };

      return withEffectiveTerminalDirection(effectiveTerminal);
    });
  }

  if (!component || !isGenericBusbar(product)) return product.terminals.map(withEffectiveTerminalDirection);

  const polarity = effectiveBusPolarity(component);
  const electricalType = polarity === 'positive' ? 'dc_pos' : 'dc_neg';
  const labelPrefix = polarity === 'positive' ? '+' : 'G';

  return product.terminals.map((terminal, index) => {
    const effectiveTerminal: TerminalDefinition = {
      ...terminal,
      label: `${labelPrefix}${index + 1}`,
      electricalType,
      kind: 'dc_power',
      polarity,
      role: 'bus',
      direction: 'bidirectional',
      voltageClass: 'dc_low_voltage',
    };

    return withEffectiveTerminalDirection(effectiveTerminal);
  });
}

export function getEffectiveTerminal(
  product: Product,
  terminalId: string,
  component?: SystemComponent
): TerminalDefinition | undefined {
  return getEffectiveTerminals(product, component).find((terminal) => terminal.id === terminalId);
}

export function withEffectiveTerminalDirection(terminal: TerminalDefinition): TerminalDefinition {
  return { ...terminal, direction: inferTerminalDirection(terminal) };
}
