import type {
  CableLengthSummaryItem,
  Product,
  SystemConnection,
  SystemDesign,
  TerminalConnector,
} from '../types/system';
import { selectLug, lugKey, type LugSpec } from '../data/lugs';
import { connectorLabel, getEffectiveConnector } from './terminalConnectors';
import { BUS_DEFAULT_COLOR, BUS_DEFAULT_TYPE } from './cableDefaults';

function effectiveCableColor(connection: SystemConnection): string {
  const explicit = connection.cableColor?.trim();
  if (explicit) return explicit;
  return (connection.busType && BUS_DEFAULT_COLOR[connection.busType]) ?? '';
}

function effectiveCableType(connection: SystemConnection): string {
  const explicit = connection.cableType?.trim();
  if (explicit) return explicit;
  return (connection.busType && BUS_DEFAULT_TYPE[connection.busType]) ?? '';
}

const INCHES_PER_FOOT = 12;

export interface FeetInchesLength {
  feet: number;
  inches: number;
}

export function feetAndInchesToFeet(feet: number, inches: number): number {
  const safeFeet = Number.isFinite(feet) ? Math.max(0, Math.trunc(feet)) : 0;
  const safeInches = Number.isFinite(inches) ? Math.max(0, Math.trunc(inches)) : 0;
  return Math.max(1 / INCHES_PER_FOOT, safeFeet + safeInches / INCHES_PER_FOOT);
}

export function feetToFeetAndInches(lengthFt: number): FeetInchesLength {
  if (!Number.isFinite(lengthFt) || lengthFt <= 0) return { feet: 0, inches: 0 };

  const totalInches = Math.max(1, Math.round(lengthFt * INCHES_PER_FOOT));
  return {
    feet: Math.floor(totalInches / INCHES_PER_FOOT),
    inches: totalInches % INCHES_PER_FOOT,
  };
}

export function formatFeetAndInches(lengthFt: number): string {
  const { feet, inches } = feetToFeetAndInches(lengthFt);
  if (feet === 0) return `${inches} in`;
  if (inches === 0) return `${feet} ft`;
  return `${feet} ft ${inches} in`;
}

export function buildCableLengthSummary(connections: SystemConnection[]): CableLengthSummaryItem[] {
  const byKey = new Map<string, CableLengthSummaryItem>();

  for (const connection of connections) {
    if (connection.busLink) continue;
    const totalLengthFt = connection.cableLengthFt;
    if (totalLengthFt <= 0) continue;

    const gauge = connection.manualCableAwg ?? connection.recommendedCableAwg ?? 'Unspecified';
    const color = effectiveCableColor(connection);
    const type = effectiveCableType(connection);
    const key = `${gauge}|${color}|${type}`;

    const existing = byKey.get(key);
    if (existing) {
      existing.totalLengthFt += totalLengthFt;
      existing.cableCount += 1;
      continue;
    }

    byKey.set(key, { gauge, color, type, totalLengthFt, cableCount: 1 });
  }

  return Array.from(byKey.values()).sort((a, b) => {
    if (a.gauge === 'Unspecified' && b.gauge !== 'Unspecified') return 1;
    if (b.gauge === 'Unspecified' && a.gauge !== 'Unspecified') return -1;
    const gaugeCompare = a.gauge.localeCompare(b.gauge, undefined, { numeric: true });
    if (gaugeCompare !== 0) return gaugeCompare;
    const colorCompare = a.color.localeCompare(b.color);
    if (colorCompare !== 0) return colorCompare;
    return a.type.localeCompare(b.type);
  });
}

// -----------------------------------------------------------
// Per-cable BOM + connector/lug aggregation
// -----------------------------------------------------------

/** Termination at one end of a physical cable. */
export interface CableEndTermination {
  /** Resolved connector at the node, when both endpoint product and terminal are known. */
  connector?: TerminalConnector;
  /** Lug part, present when the connector is a lug and the cable gauge is known. */
  lug?: LugSpec;
  /** Display label, e.g. 'Lug 3/8"', 'Screw terminal', or '—' when unknown. */
  label: string;
}

/** One row per physical cable run, with termination detail at each end. */
export interface CableBomRow {
  connectionId: string;
  fromLabel: string;
  toLabel: string;
  gauge: string;
  color: string;
  type: string;
  lengthFt: number;
  fromEnd: CableEndTermination;
  toEnd: CableEndTermination;
  /** Direct bolted bus link — no cable, no terminations, excluded from totals/connectors. */
  busLink?: boolean;
}

/** Aggregated lug/connector line item across all cable ends. */
export interface ConnectorSummaryItem {
  key: string;
  label: string;
  holeSize?: string;
  gauge?: string;
  count: number;
  /** Estimated unit price (USD), or null when not priced. */
  estUnitMsrpUsd: number | null;
  /** Estimated extended price (USD), or null when not priced. */
  estExtendedMsrpUsd: number | null;
}

function effectiveGauge(connection: SystemConnection): string | undefined {
  return connection.manualCableAwg ?? connection.recommendedCableAwg ?? undefined;
}

function resolveTermination(
  product: Product | undefined,
  terminalId: string,
  component: SystemDesign['components'][number] | undefined,
  gauge: string | undefined
): CableEndTermination {
  if (!product || !component) return { label: '—' };

  const connector = getEffectiveConnector(product, terminalId, component);
  if (!connector) return { label: '—' };

  const lug = connector.kind === 'lug' ? selectLug(gauge, connector.holeSize) : undefined;
  return { connector, lug, label: connectorLabel(connector) };
}

export function buildCableBomRows(
  system: SystemDesign,
  products: Map<string, Product>
): CableBomRow[] {
  const componentsById = new Map(system.components.map((c) => [c.id, c]));

  const labelFor = (componentId: string): string => {
    const component = componentsById.get(componentId);
    if (!component) return 'Unknown';
    return component.label ?? products.get(component.productId)?.name ?? 'Unknown';
  };

  const rows: CableBomRow[] = [];

  for (const connection of system.connections) {
    // Bus links carry no cable but are listed as toggleable rows so the user can
    // convert them to a real cable from the cable summary.
    if (connection.busLink) {
      rows.push({
        connectionId: connection.id,
        fromLabel: labelFor(connection.fromComponentId),
        toLabel: labelFor(connection.toComponentId),
        gauge: 'Bus link',
        color: '',
        type: '',
        lengthFt: 0,
        fromEnd: { label: '—' },
        toEnd: { label: '—' },
        busLink: true,
      });
      continue;
    }

    if (connection.cableLengthFt <= 0) continue;

    const fromComponent = componentsById.get(connection.fromComponentId);
    const toComponent = componentsById.get(connection.toComponentId);
    const fromProduct = fromComponent ? products.get(fromComponent.productId) : undefined;
    const toProduct = toComponent ? products.get(toComponent.productId) : undefined;
    const gauge = effectiveGauge(connection);

    rows.push({
      connectionId: connection.id,
      fromLabel: labelFor(connection.fromComponentId),
      toLabel: labelFor(connection.toComponentId),
      gauge: gauge ?? 'Unspecified',
      color: effectiveCableColor(connection),
      type: effectiveCableType(connection),
      lengthFt: connection.cableLengthFt,
      fromEnd: resolveTermination(fromProduct, connection.fromTerminalId, fromComponent, gauge),
      toEnd: resolveTermination(toProduct, connection.toTerminalId, toComponent, gauge),
    });
  }

  return rows;
}

export function buildConnectorSummary(rows: CableBomRow[]): ConnectorSummaryItem[] {
  const byKey = new Map<string, ConnectorSummaryItem>();

  const addEnd = (end: CableEndTermination) => {
    if (!end.connector) return;

    let key: string;
    let label: string;
    let holeSize: string | undefined;
    let gauge: string | undefined;
    let estUnit: number | null;

    if (end.lug) {
      key = lugKey(end.lug.awg, end.lug.holeSize);
      label = end.lug.label;
      holeSize = end.lug.holeSize;
      gauge = end.lug.awg;
      estUnit = end.lug.estMsrpUsd;
    } else {
      // Aggregate other countable terminations (screw terminals, ferrules, etc.)
      key = `${end.connector.kind}|${end.connector.holeSize ?? ''}`;
      label = connectorLabel(end.connector);
      holeSize = end.connector.holeSize;
      estUnit = null;
    }

    const existing = byKey.get(key);
    if (existing) {
      existing.count += 1;
      existing.estExtendedMsrpUsd =
        existing.estUnitMsrpUsd != null ? existing.estUnitMsrpUsd * existing.count : null;
      return;
    }

    byKey.set(key, {
      key,
      label,
      holeSize,
      gauge,
      count: 1,
      estUnitMsrpUsd: estUnit,
      estExtendedMsrpUsd: estUnit != null ? estUnit : null,
    });
  };

  for (const row of rows) {
    addEnd(row.fromEnd);
    addEnd(row.toEnd);
  }

  return Array.from(byKey.values()).sort((a, b) => {
    // Lugs (priced) first, then by gauge, then label.
    const aLug = a.gauge != null;
    const bLug = b.gauge != null;
    if (aLug !== bLug) return aLug ? -1 : 1;
    if (a.gauge && b.gauge) {
      const g = a.gauge.localeCompare(b.gauge, undefined, { numeric: true });
      if (g !== 0) return g;
    }
    return a.label.localeCompare(b.label);
  });
}
