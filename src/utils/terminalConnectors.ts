import type {
  ConnectorKind,
  Product,
  SystemComponent,
  TerminalConnector,
  TerminalDefinition,
} from '../types/system';
import { getEffectiveTerminal } from './effectiveTerminals';

export const CONNECTOR_LABELS: Record<ConnectorKind, string> = {
  lug: 'Lug',
  screw_terminal: 'Screw terminal',
  mc4_male: 'MC4 (male)',
  mc4_female: 'MC4 (female)',
};

/** Format a hole size for display: imperial fractions get an inch mark, metric stays as-is. */
export function formatHoleSize(holeSize: string): string {
  return /^m\d/i.test(holeSize) ? holeSize.toUpperCase() : `${holeSize}"`;
}

/** Short human label for a resolved connector, e.g. 'Lug 3/8"' or 'Screw terminal'. */
export function connectorLabel(connector: TerminalConnector): string {
  if (connector.kind === 'lug') {
    return connector.holeSize ? `Lug ${formatHoleSize(connector.holeSize)}` : 'Lug';
  }
  return CONNECTOR_LABELS[connector.kind];
}

/** Pick a sensible default lug hole size from a node's current rating. */
function defaultHoleSizeForCurrent(currentA: number | undefined): string {
  if (currentA == null) return '3/8';
  if (currentA <= 100) return '1/4';
  if (currentA <= 300) return '3/8';
  return '1/2';
}

/**
 * Infer a default connector for a node when the product terminal does not
 * declare one. Product definitions are the source of truth; this is a fallback
 * keyed off product/terminal type.
 */
function inferDefaultConnector(
  product: Product,
  terminal: TerminalDefinition
): TerminalConnector {
  // Solar panel PV leads use MC4 connectors (male on one polarity, female on the other).
  if (terminal.kind === 'pv_power' && product.productType === 'solar_array') {
    return { kind: terminal.polarity === 'negative' ? 'mc4_female' : 'mc4_male' };
  }

  const isPowerTerminal = terminal.kind === 'dc_power' || terminal.kind === 'pv_power';

  // Busbars / distribution / battery power studs are stud-and-nut → require lugs.
  if (
    isPowerTerminal &&
    (product.productType === 'busbar' ||
      product.productType === 'dc_distribution' ||
      product.productType === 'battery')
  ) {
    const currentA = terminal.maxCurrentA ?? product.maxCurrentA;
    return { kind: 'lug', holeSize: defaultHoleSizeForCurrent(currentA) };
  }

  // Everything else accepts the bare conductor in a screw terminal.
  return { kind: 'screw_terminal' };
}

/**
 * Resolve the effective connector at a node:
 * 1. product terminal default (terminal.connector)
 * 2. inferred default from product/terminal type
 */
export function getEffectiveConnector(
  product: Product,
  terminalId: string,
  component?: SystemComponent
): TerminalConnector | undefined {
  const terminal = getEffectiveTerminal(product, terminalId, component);
  if (!terminal) return undefined;

  if (terminal.connector) return terminal.connector;

  return inferDefaultConnector(product, terminal);
}
