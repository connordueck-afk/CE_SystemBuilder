import type {
  ConnectorKind,
  EffectiveTerminal,
  Product,
  SystemComponent,
  TerminalConnector,
} from '../types/system';
import { getEffectiveTerminal } from './effectiveTerminals';

export const CONNECTOR_LABELS: Record<ConnectorKind, string> = {
  stud: 'Stud',
  lug: 'Lug',
  screw_terminal: 'Screw terminal',
  ferrule: 'Ferrule',
  mc4: 'MC4',
  helios_orng: 'Helios +',
  helios_blk: 'Helios -',
  comm: 'Comm',
};

/** Format a hole size for display: imperial fractions get an inch mark, metric stays as-is. */
export function formatHoleSize(holeSize: string): string {
  return /^m\d/i.test(holeSize) ? holeSize.toUpperCase() : `${holeSize}"`;
}

/** Short human label for a connector, e.g. 'Stud M8', 'Lug 3/8"', 'MC4 Male', 'Ferrule'. */
export function connectorLabel(connector: TerminalConnector): string {
  if (connector.kind === 'stud') {
    return connector.holeSize ? `Stud ${formatHoleSize(connector.holeSize)}` : 'Stud';
  }
  if (connector.kind === 'lug') {
    return connector.holeSize ? `Lug ${formatHoleSize(connector.holeSize)}` : 'Lug';
  }
  if (connector.kind === 'mc4') {
    if (connector.gender === 'male') return 'MC4 Male';
    if (connector.gender === 'female') return 'MC4 Female';
    return 'MC4';
  }
  if (connector.kind === 'comm') {
    const base = connector.holeSize ?? 'Comm';
    if (connector.gender === 'male') return `${base} Male`;
    if (connector.gender === 'female') return `${base} Female`;
    return base;
  }
  // Fallback to the raw kind so an unmapped connector never yields `undefined`
  // (a `undefined` label breaks downstream label sorting in the connector summary).
  return CONNECTOR_LABELS[connector.kind] ?? connector.kind;
}

/**
 * Given the connector kind on a device terminal, return the connector the cable
 * end must have to mate with it.
 *
 * Mating rules:
 *   stud           → lug (hole size carried through from stud diameter)
 *   screw_terminal → ferrule
 *   mc4 male       → mc4 female (and vice-versa)
 *   lug / ferrule  → returned as-is (legacy product data that already encodes cable-end kind)
 */
export function getMatingConnector(deviceConnector: TerminalConnector): TerminalConnector {
  switch (deviceConnector.kind) {
    case 'stud':
      return { kind: 'lug', holeSize: deviceConnector.holeSize };
    case 'screw_terminal':
      return { kind: 'ferrule' };
    case 'mc4':
      return {
        kind: 'mc4',
        gender: deviceConnector.gender === 'male' ? 'female'
               : deviceConnector.gender === 'female' ? 'male'
               : undefined,
      };
    default:
      return deviceConnector;
  }
}

/** Pick a sensible default stud size from a terminal's current rating. */
function defaultStudSizeForCurrent(currentA: number | undefined): string {
  if (currentA == null) return 'M8';
  if (currentA <= 100) return 'M6';
  if (currentA <= 300) return 'M8';
  return 'M10';
}

/**
 * Infer a default connector for a node when the product terminal does not
 * declare one. Product definitions are the source of truth; this is a fallback
 * keyed off product/terminal type.
 */
function inferDefaultConnector(
  product: Product,
  terminal: EffectiveTerminal
): TerminalConnector {
  // Solar panel PV leads use MC4 connectors (male on positive, female on negative).
  if (terminal.kind === 'pv_power' && product.productType === 'solar_array') {
    return { kind: 'mc4', gender: terminal.polarity === 'negative' ? 'female' : 'male' };
  }

  const isPowerTerminal = terminal.kind === 'dc_power' || terminal.kind === 'pv_power';

  // Busbars / distribution / battery power posts are threaded studs.
  if (
    isPowerTerminal &&
    (product.productType === 'busbar' ||
      product.productType === 'dc_distribution' ||
      product.productType === 'battery')
  ) {
    const currentA = terminal.maxCurrentA ?? product.maxCurrentA;
    return { kind: 'stud', holeSize: defaultStudSizeForCurrent(currentA) };
  }

  // Everything else accepts the conductor in a screw terminal.
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
