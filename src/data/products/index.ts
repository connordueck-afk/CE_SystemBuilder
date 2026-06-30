// ============================================================
// src/data/products/index.ts — Catalog entry point
// ============================================================
// Products are one file per product under catalog/<category>/.
// import.meta.glob discovers them automatically — drop a file
// in the right subdirectory and it appears in the catalog.
//
// Usage:
//   import { ALL_PRODUCTS, getProduct } from '../data/products';
//   import { getProductsByCategory } from '../data/products/helpers/catalogUtils';
// ============================================================

import type {
  ConnectionRole,
  Product,
  ProductCommunicationPort,
  ProductPort,
  TerminalConnector,
  TerminalDefinition,
  TerminalDirection,
  TerminalGroupDefinition,
} from '../../types/system';

// Auto-discover all per-product files
const modules = import.meta.glob<{ default: Product }>(
  './catalog/**/*.ts',
  { eager: true }
);

// --- Schema definitions ---
export * from './categories';
export * from './productTypes';
export * from './productSchemas';

// --- Helpers ---
export * from './helpers/catalogUtils';
export * from './helpers/validation';

// --- Cable assemblies (separate type, not Product[]) ---
export * from './cableAssemblies';

function directionForRole(role: ConnectionRole): TerminalDirection {
  if (role === 'source') return 'output';
  if (role === 'sink') return 'input';
  return 'bidirectional';
}

function productNominalVoltages(product: Product): number[] {
  if (Array.isArray(product.nominalVoltage)) return product.nominalVoltage;
  if (product.nominalVoltage != null) return [product.nominalVoltage];
  return [];
}

function effectiveVariantCurrent(product: Product): number | undefined {
  return product.protectionRatings?.currentRatingA || product.maxCurrentA;
}

function defaultVoltageForCurrent(port: ProductPort, nominalVoltages: number[]): number | undefined {
  if (port.nominalVoltageV != null) return port.nominalVoltageV;
  if (port.voltageMinV != null) return port.voltageMinV;
  if (nominalVoltages.length > 0) return Math.min(...nominalVoltages);
  if (port.voltageClass === 'ac_120v') return 120;
  if (port.voltageClass === 'ac_240v') return 240;
  if (port.voltageClass === 'dc_low_voltage') return 12;
  return undefined;
}

function derivedPortCurrentA(product: Product, port: ProductPort, nominalVoltages: number[]): number | undefined {
  if (port.maxCurrentA != null) return port.maxCurrentA;
  if (
    product.dataQuality === 'placeholder' &&
    product.manufacturer === 'Generic' &&
    ['dc_load', 'ac_load', 'shorePowerInlet'].includes(product.productType)
  ) {
    return effectiveVariantCurrent(product) ?? 1000;
  }
  if (product.dataQuality === 'placeholder' || product.productType === 'dc_load' || product.productType === 'ac_load') {
    return effectiveVariantCurrent(product);
  }
  const voltage = defaultVoltageForCurrent(port, nominalVoltages);
  if (port.maxPowerW != null && voltage != null && voltage > 0) {
    return Math.ceil(port.maxPowerW / voltage);
  }
  return effectiveVariantCurrent(product);
}

function defaultStudSizeForCurrent(currentA: number | undefined): string {
  if (currentA == null) return 'M8';
  if (currentA <= 100) return 'M6';
  if (currentA <= 300) return 'M8';
  return 'M10';
}

function defaultConnector(product: Product, port: ProductPort | undefined, group: TerminalGroupDefinition | undefined, currentA: number | undefined): TerminalConnector | undefined {
  if (port?.kind === 'comm') {
    return port.connectorType ? { kind: 'comm', holeSize: port.connectorType } : { kind: 'comm' };
  }
  if (group?.groupType !== 'power_conductor' && group?.groupType !== 'ground_reference') return undefined;
  if (port?.kind === 'pv' && (product.productType === 'solar_array' || product.productType === 'custom_solar_array')) {
    return { kind: 'mc4', gender: group.polarity === 'negative' ? 'female' : 'male' };
  }
  if (['battery', 'busbar', 'dc_distribution', 'monitor'].includes(product.productType)) {
    return { kind: 'stud', holeSize: defaultStudSizeForCurrent(currentA) };
  }
  return { kind: 'screw_terminal' };
}

function estimatedMaxCableAwg(connector: TerminalConnector | undefined, currentA: number | undefined): string | undefined {
  if (!connector) return undefined;
  if (connector.kind === 'mc4') return '10';
  if (connector.kind === 'helios_orng' || connector.kind === 'helios_blk') return '4/0';
  if (connector.kind === 'comm') return undefined;
  if (connector.kind === 'stud' || connector.kind === 'lug') {
    const holeSize = connector.holeSize?.toUpperCase();
    if (holeSize === 'M5' || holeSize === '1/4') return '2';
    if (holeSize === 'M6' || holeSize === '5/16') return '2/0';
    return '4/0';
  }
  if (connector.kind === 'screw_terminal' || connector.kind === 'ferrule') {
    return '4/0';
  }
  return undefined;
}

function communicationByPortId(product: Product): Map<string, ProductCommunicationPort> {
  const byTerminalId = new Map((product.communicationPorts ?? []).map((port) => [port.id, port]));
  const groups = new Map((product.terminalGroups ?? []).map((group) => [group.id, group]));
  const byPortId = new Map<string, ProductCommunicationPort>();

  for (const commPort of product.communicationPorts ?? []) {
    byPortId.set(commPort.id, commPort);
  }
  for (const terminal of product.terminals) {
    const commPort = byTerminalId.get(terminal.id);
    const portId = terminal.terminalGroupId ? groups.get(terminal.terminalGroupId)?.portId : undefined;
    if (commPort && portId) byPortId.set(portId, commPort);
  }

  return byPortId;
}

function withCompletedCatalogFields(product: Product): Product {
  const portIds = new Map((product.ports ?? []).map((port) => [port.id, port]));
  const commByPort = communicationByPortId(product);
  const nominalVoltages = productNominalVoltages(product);

  const ports = product.ports?.map((port): ProductPort => {
    const comm = commByPort.get(port.id);
    const completed: ProductPort = {
      ...port,
      direction: port.direction ?? directionForRole(port.role),
      ...(port.kind === 'comm' && comm?.connectorType != null && port.connectorType == null
        ? { connectorType: comm.connectorType }
        : {}),
      ...(port.kind === 'comm' && comm?.supportedProtocols != null && port.supportedProtocols == null
        ? { supportedProtocols: comm.supportedProtocols }
        : {}),
      ...(port.kind === 'comm' && comm?.configuredProtocol != null && port.configuredProtocol == null
        ? { configuredProtocol: comm.configuredProtocol }
        : {}),
      ...(port.kind === 'comm' && comm?.isConfigurable != null && port.isConfigurable == null
        ? { isConfigurable: comm.isConfigurable }
        : {}),
    };

    if ((completed.kind === 'dc' || completed.kind === 'ac') && completed.nominalVoltageV == null && completed.voltageMinV == null && completed.voltageMaxV == null && nominalVoltages.length > 0) {
      if (nominalVoltages.length === 1) {
        completed.nominalVoltageV = nominalVoltages[0];
      } else {
        completed.voltageMinV = Math.min(...nominalVoltages);
        completed.voltageMaxV = Math.max(...nominalVoltages);
      }
    }
    if (completed.kind === 'dc' && completed.voltageClass === 'dc_low_voltage' && completed.nominalVoltageV == null && completed.voltageMinV == null && completed.voltageMaxV == null) {
      completed.voltageMinV = 12;
      completed.voltageMaxV = 48;
    }
    const currentA = derivedPortCurrentA(product, completed, nominalVoltages);
    if ((completed.kind === 'dc' || completed.kind === 'pv' || completed.kind === 'ac') && currentA != null) {
      completed.maxCurrentA = currentA;
    }

    return completed;
  });

  const completedPorts = new Map((ports ?? product.ports ?? []).map((port) => [port.id, port]));
  const terminalGroups = product.terminalGroups?.map((group): TerminalGroupDefinition => {
    const port = completedPorts.get(group.portId) ?? portIds.get(group.portId);
    const currentA = group.maxCurrentA ?? port?.maxCurrentA ?? effectiveVariantCurrent(product);
    return {
      ...group,
      ...(currentA != null && (group.groupType === 'power_conductor' || group.groupType === 'ground_reference') ? { maxCurrentA: currentA } : {}),
      ...(group.polarity === 'positive' && product.productType === 'battery' && group.requiresOvercurrentProtection == null
        ? { requiresOvercurrentProtection: true }
        : {}),
    };
  });

  const completedGroups = new Map((terminalGroups ?? product.terminalGroups ?? []).map((group) => [group.id, group]));
  const terminals = product.terminals.map((terminal): TerminalDefinition => {
    const group = terminal.terminalGroupId ? completedGroups.get(terminal.terminalGroupId) : undefined;
    const port = group ? completedPorts.get(group.portId) : undefined;
    const currentA = terminal.maxCurrentA ?? group?.maxCurrentA ?? port?.maxCurrentA ?? effectiveVariantCurrent(product);
    const connector = terminal.connector ?? defaultConnector(product, port, group, currentA);
    const maxCableAwg = terminal.maxCableAwg ?? estimatedMaxCableAwg(connector, currentA);

    return {
      ...terminal,
      ...(currentA != null && (group?.groupType === 'power_conductor' || group?.groupType === 'ground_reference') ? { maxCurrentA: currentA } : {}),
      ...(connector != null ? { connector } : {}),
      ...(maxCableAwg != null ? { maxCableAwg } : {}),
    };
  });

  return {
    ...product,
    terminals,
    ...(ports != null ? { ports } : {}),
    ...(terminalGroups != null ? { terminalGroups } : {}),
  };
}

/**
 * Expand variant-based products into individual Product entries.
 * Products without variants pass through unchanged.
 * The base product (with variants) is NOT itself added to the catalog.
 */
function expandVariants(rawProducts: Product[]): Product[] {
  const expanded: Product[] = [];
  for (const product of rawProducts) {
    if (!product.variants?.length) {
      expanded.push(withCompletedCatalogFields(product));
      continue;
    }
    for (const variant of product.variants) {
      // Derive battery voltage array from variant's nominalVoltage if provided
      const batteryVoltagesV = variant.nominalVoltage != null
        ? (Array.isArray(variant.nominalVoltage) ? variant.nominalVoltage : [variant.nominalVoltage])
        : undefined;

      // Update physical terminal and port/group ratings to match the variant.
      const terminals = product.terminals.map(t => ({
        ...t,
        ...(product.protectionRatings != null || t.maxCurrentA != null ? { maxCurrentA: variant.currentRatingA } : {}),
      }));
      const ports = product.ports?.map(port => ({
        ...port,
        ...(product.protectionRatings != null
          ? { maxCurrentA: variant.currentRatingA }
          : {}),
        ...(port.maxPowerW != null && variant.continuousPowerW != null
          ? { maxPowerW: variant.continuousPowerW }
          : {}),
      }));
      const terminalGroups = product.terminalGroups?.map(group => ({
        ...group,
        ...(product.protectionRatings != null
          ? { maxCurrentA: variant.currentRatingA }
          : {}),
      }));

      expanded.push(withCompletedCatalogFields({
        ...product,
        id: variant.id,
        name: variant.name ?? `${product.name} ${variant.currentRatingA}A`,
        maxCurrentA: variant.currentRatingA,
        ...(variant.maxPvVoltageV != null ? { maxPvVoltageV: variant.maxPvVoltageV } : {}),
        ...(variant.continuousPowerW != null ? { continuousPowerW: variant.continuousPowerW } : {}),
        ...(variant.nominalVoltage != null ? { nominalVoltage: variant.nominalVoltage } : {}),
        ...(variant.imageUrl != null ? { imageUrl: variant.imageUrl } : {}),
        ...(variant.productUrl != null ? { productUrl: variant.productUrl } : {}),
        msrpUsd: variant.msrpUsd ?? product.msrpUsd,
        oemPriceUsd: variant.oemPriceUsd ?? product.oemPriceUsd,
        ...(variant.partNumber != null ? { partNumber: variant.partNumber } : {}),
        terminals,
        ...(ports != null ? { ports } : {}),
        ...(terminalGroups != null ? { terminalGroups } : {}),
        // Sync protectionRatings.currentRatingA for fuses/breakers
        ...(product.protectionRatings != null ? {
          protectionRatings: { ...product.protectionRatings, currentRatingA: variant.currentRatingA },
        } : {}),
        // Sync mpptRatings for MPPT products — derives all fields from variant
        ...(product.mpptRatings != null ? {
          mpptRatings: {
            ...product.mpptRatings,
            ...(variant.maxPvVoltageV != null ? { maxPvVoltageV: variant.maxPvVoltageV } : {}),
            maxPvCurrentA: variant.currentRatingA,
            maxOutputCurrentA: variant.currentRatingA,
            ...(variant.continuousPowerW != null ? { maxPvPowerW: variant.continuousPowerW } : {}),
            ...(batteryVoltagesV != null ? { batteryVoltagesV } : {}),
          },
        } : {}),
        variants: undefined,
      }));
    }
  }
  return expanded;
}

/**
 * The complete product catalog.
 * This is the authoritative list of all available products.
 */
export const ALL_PRODUCTS: Product[] = expandVariants(
  Object.values(modules).map(m => m.default)
);

/**
 * Fast product lookup by ID.
 * Built once at module load time.
 */
export const PRODUCT_MAP: Map<string, Product> = new Map(
  ALL_PRODUCTS.map(p => [p.id, p])
);

/**
 * Look up a product by its ID.
 * Returns undefined if the product is not found.
 */
export function getProduct(id: string): Product | undefined {
  return PRODUCT_MAP.get(id);
}
