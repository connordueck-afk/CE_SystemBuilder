// ============================================================
// connectionPoints.ts — Virtual grounding / bonding symbols
// ============================================================
// These are schematic reference symbols, not purchasable products.
// isVirtual: true and isBOMItem: false exclude them from pricing.
// ============================================================

import type { Product } from '../../types/system';

export const connectionPoints: Product[] = [
  {
    id: 'system-ac-earth',
    manufacturer: 'System',
    name: 'AC Earth',
    productType: 'connection_point',
    category: 'Connection Points',
    description: 'AC protective earth / grounding connection point.',
    isVirtual: true,
    isBOMItem: false,
    width: 60,
    height: 60,
    terminals: [
      {
        id: 'earth',
        label: 'AC Earth',
        kind: 'chassis_ground',
        role: 'bus',
        side: 'top',
        offsetX: 0,
        offsetY: -30,
        domain: 'earthGround',
      },
    ],
  },
  {
    id: 'system-dc-chassis',
    manufacturer: 'System',
    name: 'DC Chassis',
    productType: 'connection_point',
    category: 'Connection Points',
    description: 'DC negative / chassis bonding reference point.',
    isVirtual: true,
    isBOMItem: false,
    width: 60,
    height: 60,
    terminals: [
      {
        id: 'chassis',
        label: 'DC Chassis',
        kind: 'chassis_ground',
        role: 'bus',
        side: 'top',
        offsetX: 0,
        offsetY: -30,
        domain: 'chassisGround',
      },
    ],
  },
];
