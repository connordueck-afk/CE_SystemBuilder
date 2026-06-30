import type {
  Product,
  SolarPanelRatings,
  SolarWiringMode,
  SystemComponent,
  SystemConnection,
} from '../types/system';
import { terminalKind } from './portSpecs';

export interface SolarArrayConfiguration {
  panelCount: number;
  seriesCount: number;
  parallelCount: number;
  wiringMode: SolarWiringMode;
}

export interface SolarArrayStats extends SolarPanelRatings {
  panelCount: number;
  seriesCount: number;
  parallelCount: number;
  coldVocV?: number;
  isCustomAggregate?: boolean;
}

export interface SolarStringStats extends SolarArrayStats {
  componentId: string;
  label: string;
}

export interface SolarParallelMismatch {
  leftLabel: string;
  leftVocV: number;
  rightLabel: string;
  rightVocV: number;
}

export interface SolarArrayAggregation {
  stats?: SolarArrayStats;
  strings: SolarStringStats[];
  mismatches: SolarParallelMismatch[];
}

function positiveInteger(value: number | undefined): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  return Math.max(1, Math.floor(value));
}

export function getSolarWiringMode(component: SystemComponent): SolarWiringMode {
  void component;
  return 'series';
}

export function getSolarPanelCount(product: Product): number {
  return product.productType === 'solar_array' ? 1 : 0;
}

export function getSolarArrayConfiguration(
  component: SystemComponent,
  product: Product
): SolarArrayConfiguration {
  const panelCount = getSolarPanelCount(product);
  return {
    panelCount,
    seriesCount: product.productType === 'solar_array' ? 1 : 0,
    parallelCount: product.productType === 'solar_array' ? 1 : 0,
    wiringMode: getSolarWiringMode(component),
  };
}

export function getSolarPanelUnitRatings(product: Product): SolarPanelRatings | undefined {
  const ratings = product.solarPanelRatings;
  return product.productType === 'solar_array' ? ratings : undefined;
}

function computedCustomPowerW(component: SystemComponent): number | undefined {
  const ratings = component.customSolarArrayRatings;
  if (!ratings) return undefined;
  if (ratings.powerW != null && Number.isFinite(ratings.powerW) && ratings.powerW > 0) return ratings.powerW;
  if (
    ratings.vmpV != null &&
    ratings.impA != null &&
    Number.isFinite(ratings.vmpV) &&
    Number.isFinite(ratings.impA) &&
    ratings.vmpV > 0 &&
    ratings.impA > 0
  ) {
    return ratings.vmpV * ratings.impA;
  }
  return undefined;
}

export function calculateCustomSolarArrayStats(component: SystemComponent): SolarStringStats | undefined {
  const ratings = component.customSolarArrayRatings;
  if (!ratings) return undefined;
  const powerW = computedCustomPowerW(component);
  if (ratings.vocV == null || powerW == null) return undefined;

  return {
    vocV: ratings.vocV,
    vmpV: ratings.vmpV,
    iscA: ratings.iscA,
    impA: ratings.impA,
    powerW,
    coldVocV: ratings.coldVocV,
    panelCount: 0,
    seriesCount: 1,
    parallelCount: 1,
    isCustomAggregate: true,
    componentId: component.id,
    label: component.label ?? 'Custom Solar Array',
  };
}

export function calculateSolarArrayStats(
  component: SystemComponent,
  product: Product
): SolarArrayStats | undefined {
  const unit = getSolarPanelUnitRatings(product);
  if (!unit || product.productType !== 'solar_array') return undefined;

  return {
    ...unit,
    panelCount: 1,
    seriesCount: 1,
    parallelCount: 1,
  };
}

export function calculateSolarStringStats(
  component: SystemComponent,
  product: Product
): SolarStringStats | undefined {
  if (product.productType === 'custom_solar_array') return calculateCustomSolarArrayStats(component);

  const unit = getSolarPanelUnitRatings(product);
  if (!unit || product.productType !== 'solar_array') return undefined;

  return {
    ...unit,
    vocV: unit.vocV,
    vmpV: unit.vmpV,
    iscA: unit.iscA,
    impA: unit.impA,
    powerW: unit.powerW,
    panelCount: 1,
    seriesCount: 1,
    parallelCount: 1,
    componentId: component.id,
    label: component.label ?? product.name,
  };
}

export function getEffectiveSolarRatings(
  product: Product,
  wiringMode: SolarWiringMode
): SolarPanelRatings | undefined {
  void wiringMode;
  return product.productType === 'solar_array' ? product.solarPanelRatings : undefined;
}

export function getEffectiveProductForComponent(
  component: SystemComponent,
  product: Product | undefined
): Product | undefined {
  if (!product) return product;

  if (product.productType === 'custom_solar_array') {
    const stats = calculateCustomSolarArrayStats(component);
    if (!stats) return product;
    return {
      ...product,
      continuousPowerW: stats.powerW,
      maxPvVoltageV: stats.coldVocV ?? stats.vocV,
      maxPvCurrentA: stats.iscA ?? stats.impA,
      ports: product.ports?.map((port) => port.kind === 'pv'
        ? {
            ...port,
            voltageMaxV: stats.coldVocV ?? stats.vocV,
            maxCurrentA: stats.iscA ?? stats.impA ?? port.maxCurrentA,
            maxPowerW: stats.powerW,
          }
        : port
      ),
      terminalGroups: product.terminalGroups?.map((group) => group.groupType === 'power_conductor'
        ? { ...group, maxCurrentA: stats.iscA ?? stats.impA ?? group.maxCurrentA }
        : group
      ),
    };
  }

  if (product.productType !== 'solar_array') return product;

  const stats = calculateSolarStringStats(component, product);
  if (!stats) return product;

  return {
    ...product,
    continuousPowerW: stats.powerW,
    maxPvVoltageV: stats.vocV,
    maxPvCurrentA: stats.iscA ?? stats.impA ?? product.maxPvCurrentA,
    solarPanelRatings: stats,
  };
}

export function aggregateParallelSolarStats(stats: SolarArrayStats[]): SolarArrayStats | undefined {
  if (stats.length === 0) return undefined;

  const first = stats[0];
  return {
    vocV: Math.max(...stats.map((s) => s.vocV)),
    vmpV: stats.some((s) => s.vmpV != null) ? Math.max(...stats.map((s) => s.vmpV ?? 0)) : undefined,
    iscA: stats.some((s) => s.iscA != null) ? stats.reduce((sum, s) => sum + (s.iscA ?? 0), 0) : undefined,
    impA: stats.some((s) => s.impA != null) ? stats.reduce((sum, s) => sum + (s.impA ?? 0), 0) : undefined,
    powerW: stats.reduce((sum, s) => sum + s.powerW, 0),
    panelCount: stats.reduce((sum, s) => sum + s.panelCount, 0),
    seriesCount: first.seriesCount,
    parallelCount: stats.reduce((sum, s) => sum + s.parallelCount, 0),
  };
}

function detectParallelVoltageMismatches(strings: SolarStringStats[]): SolarParallelMismatch[] {
  if (strings.length <= 1) return [];

  const reference = strings[0];
  return strings.slice(1).flatMap((string) => {
    const delta = Math.abs(string.vocV - reference.vocV);
    const tolerance = Math.max(0.5, reference.vocV * 0.01);
    if (delta <= tolerance) return [];

    return [{
      leftLabel: reference.label,
      leftVocV: reference.vocV,
      rightLabel: string.label,
      rightVocV: string.vocV,
    }];
  });
}

function aggregateSolarStrings(strings: SolarStringStats[]): SolarArrayAggregation {
  const stats = aggregateParallelSolarStats(strings);
  return {
    stats,
    strings,
    mismatches: detectParallelVoltageMismatches(strings),
  };
}

function componentForConnectionId(components: SystemComponent[], id: string): SystemComponent | undefined {
  return components.find((c) => c.id === id);
}

function productForComponent(
  component: SystemComponent | undefined,
  products: Map<string, Product>
): Product | undefined {
  return component ? products.get(component.productId) : undefined;
}

function isSolarComponent(componentId: string, components: SystemComponent[], products: Map<string, Product>): boolean {
  const component = componentForConnectionId(components, componentId);
  return productForComponent(component, products)?.productType === 'solar_array';
}

function isSolarSeriesConnection(
  conn: SystemConnection,
  components: SystemComponent[],
  products: Map<string, Product>
): boolean {
  if (
    !isSolarComponent(conn.fromComponentId, components, products) ||
    !isSolarComponent(conn.toComponentId, components, products)
  ) {
    return false;
  }

  const fromPositive = conn.fromTerminalId.includes('pos');
  const toPositive = conn.toTerminalId.includes('pos');
  return fromPositive !== toPositive;
}

function collectSeriesCluster(
  startComponentId: string,
  components: SystemComponent[],
  connections: SystemConnection[],
  products: Map<string, Product>
): SystemComponent[] {
  const visited = new Set<string>();
  const pending = [startComponentId];

  while (pending.length > 0) {
    const currentId = pending.pop()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    for (const conn of connections) {
      if (!isSolarSeriesConnection(conn, components, products)) continue;
      if (conn.fromComponentId !== currentId && conn.toComponentId !== currentId) continue;

      const otherId = conn.fromComponentId === currentId ? conn.toComponentId : conn.fromComponentId;
      if (!visited.has(otherId)) pending.push(otherId);
    }
  }

  return [...visited]
    .map((id) => componentForConnectionId(components, id))
    .filter(Boolean) as SystemComponent[];
}

function clusterKey(cluster: SystemComponent[]): string {
  return cluster.map((component) => component.id).sort().join('|');
}

function calculateSeriesClusterStats(
  cluster: SystemComponent[],
  products: Map<string, Product>
): SolarStringStats | undefined {
  const segments = cluster.flatMap((component) => {
    const product = products.get(component.productId);
    const stats = product ? calculateSolarStringStats(component, product) : undefined;
    return stats ? [stats] : [];
  });

  if (segments.length === 0) return undefined;

  const first = segments[0];
  return {
    ...first,
    componentId: clusterKey(cluster),
    label: segments.map((segment) => segment.label).join(' + '),
    vocV: segments.reduce((sum, segment) => sum + segment.vocV, 0),
    vmpV: segments.some((segment) => segment.vmpV != null)
      ? segments.reduce((sum, segment) => sum + (segment.vmpV ?? 0), 0)
      : undefined,
    iscA: segments.some((segment) => segment.iscA != null)
      ? Math.min(...segments.map((segment) => segment.iscA ?? Infinity))
      : undefined,
    impA: segments.some((segment) => segment.impA != null)
      ? Math.min(...segments.map((segment) => segment.impA ?? Infinity))
      : undefined,
    powerW: segments.reduce((sum, segment) => sum + segment.powerW, 0),
    panelCount: segments.reduce((sum, segment) => sum + segment.panelCount, 0),
    seriesCount: segments.reduce((sum, segment) => sum + segment.seriesCount, 0),
    parallelCount: 1,
  };
}

function isPvPassThroughProduct(product: Product): boolean {
  return (
    product.productType === 'solar_combiner' ||
    (
      product.productType === 'dcDisconnect' &&
      product.terminals.some((terminal) => terminalKind(product, terminal) === 'pv_power')
    )
  );
}

export function findSolarStatsFeedingComponent(
  componentId: string,
  components: SystemComponent[],
  connections: SystemConnection[],
  products: Map<string, Product>
): SolarArrayStats | undefined {
  return findSolarArrayFeedingComponent(componentId, components, connections, products).stats;
}

export function findSolarArrayFeedingComponent(
  componentId: string,
  components: SystemComponent[],
  connections: SystemConnection[],
  products: Map<string, Product>
): SolarArrayAggregation {
  const strings = new Map<string, SolarStringStats>();
  const visitedPassThrough = new Set<string>();

  const addStringCluster = (componentId: string) => {
    const cluster = collectSeriesCluster(componentId, components, connections, products);
    const stats = calculateSeriesClusterStats(cluster, products);
    if (stats) strings.set(stats.componentId, stats);
  };

  const walkUpstream = (fromComponentId: string) => {
    for (const conn of connections) {
      const touchesComponent = conn.fromComponentId === fromComponentId || conn.toComponentId === fromComponentId;
      if (!touchesComponent) continue;

      const otherId = conn.fromComponentId === fromComponentId ? conn.toComponentId : conn.fromComponentId;
      if (otherId === componentId) continue;

      const otherComponent = componentForConnectionId(components, otherId);
      const otherProduct = otherComponent ? products.get(otherComponent.productId) : undefined;
      if (!otherComponent || !otherProduct) continue;

      if (otherProduct.productType === 'solar_array') {
        addStringCluster(otherComponent.id);
        continue;
      }

      if (otherProduct.productType === 'custom_solar_array') {
        const stats = calculateSolarStringStats(otherComponent, otherProduct);
        if (stats) strings.set(stats.componentId, stats);
        continue;
      }

      if (isPvPassThroughProduct(otherProduct) && !visitedPassThrough.has(otherId)) {
        visitedPassThrough.add(otherId);
        walkUpstream(otherId);
      }
    }
  };

  walkUpstream(componentId);

  return aggregateSolarStrings([...strings.values()]);
}

export function findSolarArrayFeedingPort(
  componentId: string,
  terminalIds: string[],
  components: SystemComponent[],
  connections: SystemConnection[],
  products: Map<string, Product>
): SolarArrayAggregation {
  const strings = new Map<string, SolarStringStats>();
  const visitedPassThrough = new Set<string>();
  const seedTerminals = new Set(terminalIds);

  const addStringCluster = (componentId: string) => {
    const cluster = collectSeriesCluster(componentId, components, connections, products);
    const stats = calculateSeriesClusterStats(cluster, products);
    if (stats) strings.set(stats.componentId, stats);
  };

  const walkUpstream = (fromComponentId: string, restrictToTerminals = false) => {
    for (const conn of connections) {
      const touchesComponent = conn.fromComponentId === fromComponentId || conn.toComponentId === fromComponentId;
      if (!touchesComponent) continue;

      if (restrictToTerminals) {
        const selectedTerminalId = conn.fromComponentId === fromComponentId
          ? conn.fromTerminalId
          : conn.toTerminalId;
        if (!seedTerminals.has(selectedTerminalId)) continue;
      }

      const otherId = conn.fromComponentId === fromComponentId ? conn.toComponentId : conn.fromComponentId;
      if (otherId === componentId) continue;

      const otherComponent = componentForConnectionId(components, otherId);
      const otherProduct = otherComponent ? products.get(otherComponent.productId) : undefined;
      if (!otherComponent || !otherProduct) continue;

      if (otherProduct.productType === 'solar_array') {
        addStringCluster(otherComponent.id);
        continue;
      }

      if (otherProduct.productType === 'custom_solar_array') {
        const stats = calculateSolarStringStats(otherComponent, otherProduct);
        if (stats) strings.set(stats.componentId, stats);
        continue;
      }

      if (isPvPassThroughProduct(otherProduct) && !visitedPassThrough.has(otherId)) {
        visitedPassThrough.add(otherId);
        walkUpstream(otherId);
      }
    }
  };

  walkUpstream(componentId, true);

  return aggregateSolarStrings([...strings.values()]);
}
