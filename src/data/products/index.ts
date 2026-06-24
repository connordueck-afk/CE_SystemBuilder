// ============================================================
// src/data/products/index.ts — Catalog entry point
// ============================================================
// This file is the single entry point for the product catalog.
// Import from here in application code and utilities.
//
// Usage:
//   import { ALL_PRODUCTS, getProduct } from '../data/products';
//   import { getProductsByCategory } from '../data/products/helpers/catalogUtils';
// ============================================================

// --- Product data files ---
export { batteries } from './batteries';
export { mppts } from './mppts';
export { inverterChargers } from './inverterChargers';
export { dcDcChargers } from './dcDcChargers';
export { acChargers } from './acChargers';
export { solarArrays } from './solar';
export { distribution } from './distribution';
export { protection } from './protection';
export { monitoring } from './monitoring';
export { accessories } from './accessories';
export { kisaeProducts } from './kisae';
export { residentialHybridInverters } from './residentialHybridInverters';
export { connectionPoints } from './connectionPoints';
export { communicationProducts } from './communication';
export * from './cableAssemblies';

// --- Schema definitions ---
export * from './categories';
export * from './productTypes';
export * from './productSchemas';

// --- Helpers ---
export * from './helpers/catalogUtils';
export * from './helpers/validation';

// --- Assembled catalog ---
import { batteries } from './batteries';
import { mppts } from './mppts';
import { inverterChargers } from './inverterChargers';
import { dcDcChargers } from './dcDcChargers';
import { acChargers } from './acChargers';
import { solarArrays } from './solar';
import { distribution } from './distribution';
import { protection } from './protection';
import { monitoring } from './monitoring';
import { accessories } from './accessories';
import { kisaeProducts } from './kisae';
import { residentialHybridInverters } from './residentialHybridInverters';
import { connectionPoints } from './connectionPoints';
import { communicationProducts } from './communication';
import type { Product, ProductCommunicationPort, TerminalDefinition } from '../../types/system';

// ---- Communication port helpers for existing products ----

function netTerminal(id: string, label: string, offsetX: number, offsetY: number): TerminalDefinition {
  return { id, label, kind: 'network', role: 'bidirectional', domain: 'communication', side: 'top', offsetX, offsetY };
}

// Ports locked to a single protocol: the device dictates the network type.
const VE_BUS_PORT: ProductCommunicationPort = {
  id: 've_bus', name: 'VE.Bus', connectorType: 'RJ45',
  supportedProtocols: ['VE.Bus'], configuredProtocol: 'VE.Bus',
};
const VE_CAN_PORT: ProductCommunicationPort = {
  id: 've_can', name: 'VE.Can', connectorType: 'RJ45',
  supportedProtocols: ['VE.Can'], configuredProtocol: 'VE.Can',
};
const VE_DIRECT_PORT: ProductCommunicationPort = {
  id: 've_direct', name: 'VE.Direct', connectorType: 'VE.Direct',
  supportedProtocols: ['VE.Direct'], configuredProtocol: 'VE.Direct',
};
const BMS_CAN_PORT: ProductCommunicationPort = {
  id: 'bms_can', name: 'BMS-Can', connectorType: 'RJ45',
  supportedProtocols: ['BMS-Can'], configuredProtocol: 'BMS-Can',
};
const ETHERNET_PORT: ProductCommunicationPort = {
  id: 'ethernet', name: 'Ethernet', connectorType: 'RJ45',
  supportedProtocols: ['Ethernet'], configuredProtocol: 'Ethernet',
};
// A GX-style CAN port whose profile (VE.Can vs BMS-Can) is selected by the user
// on the component panel.
const CAN_CONFIGURABLE_PORT: ProductCommunicationPort = {
  id: 'can_bus', name: 'BMS-Can / VE.Can', connectorType: 'RJ45',
  supportedProtocols: ['BMS-Can', 'VE.Can'], configuredProtocol: 'BMS-Can',
  isConfigurable: true,
  notes: 'CAN-bus profile is selectable (VE.Can or BMS-Can).',
};

/** Apply communicationPorts and matching top-edge network terminals to a product. */
function withCommPorts(
  product: Product,
  ports: ProductCommunicationPort[],
): Product {
  const w = product.width;
  const h = product.height;
  const count = ports.length;
  const newTerminals: TerminalDefinition[] = ports.map((port, i) => {
    const fraction = count === 1 ? 0.5 : i / (count - 1);
    const offsetX = -w / 2 + fraction * w;
    return netTerminal(port.id, port.name, offsetX, -h / 2);
  });
  return {
    ...product,
    communicationPorts: ports,
    terminals: [...product.terminals, ...newTerminals],
  };
}

const SMARTLITHIUM_IDS = new Set([
  'bat-vic-smart-12-100', 'bat-vic-smart-12-200',
  'bat-vic-smart-24-100', 'bat-vic-smart-48-100',
  'victron-lithium-ng-12-100', 'victron-lithium-ng-12-200',
  'victron-lithium-ng-25-100', 'victron-lithium-ng-51-100',
]);
const MONITORING_VE_DIRECT_IDS = new Set([
  'smartshunt-500', 'smartshunt-1000', 'smartshunt-2000',
]);

function applyCommPorts(products: Product[]): Product[] {
  return products.map((p) => {
    if (p.communicationPorts) return p; // already has ports (e.g. comm accessories)
    if (p.productType === 'inverter_charger') {
      return withCommPorts(p, [VE_BUS_PORT]);
    }
    if (p.productType === 'mppt') {
      return withCommPorts(p, [VE_CAN_PORT, VE_DIRECT_PORT]);
    }
    if (SMARTLITHIUM_IDS.has(p.id)) {
      return withCommPorts(p, [BMS_CAN_PORT]);
    }
    if (MONITORING_VE_DIRECT_IDS.has(p.id)) {
      return withCommPorts(p, [VE_DIRECT_PORT]);
    }
    if (p.id === 'ekrano-gx') {
      return withCommPorts(p, [
        CAN_CONFIGURABLE_PORT,
        VE_BUS_PORT,
        ETHERNET_PORT,
      ]);
    }
    return p;
  });
}

/**
 * The complete product catalog.
 * This is the authoritative list of all available products.
 */
export const ALL_PRODUCTS: Product[] = applyCommPorts([
  ...batteries,
  ...inverterChargers,
  ...mppts,
  ...dcDcChargers,
  ...acChargers,
  ...solarArrays,
  ...distribution,
  ...protection,
  ...monitoring,
  ...accessories,
  ...kisaeProducts,
  ...residentialHybridInverters,
  ...connectionPoints,
  ...communicationProducts,
]);

/**
 * Fast product lookup by ID.
 * Built once at module load time.
 */
export const PRODUCT_MAP: Map<string, Product> = new Map(
  ALL_PRODUCTS.map((p) => [p.id, p])
);

/**
 * Look up a product by its ID.
 * Returns undefined if the product is not found.
 */
export function getProduct(id: string): Product | undefined {
  return PRODUCT_MAP.get(id);
}
