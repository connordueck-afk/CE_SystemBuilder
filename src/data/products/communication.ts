// ============================================================
// communication.ts — Communication accessories and gateways
// ============================================================
// Passive accessories merge network branches.
// Active gateways bridge or isolate protocols.
// ============================================================

import type {
  Product,
  ProductCommunicationPort,
  CommunicationConnectorType,
  CommunicationProtocol,
  TerminalDefinition,
  TerminalSide,
} from '../../types/system';

function commPort(
  id: string,
  name: string,
  connector: CommunicationConnectorType,
  protocols: CommunicationProtocol[],
  configurable = false
): ProductCommunicationPort {
  // A single-protocol port is locked to that protocol. A configurable port
  // defaults to its first protocol but can be changed on the component panel.
  // A passive multi-protocol port (a pass-through accessory) has no protocol of
  // its own — it simply adopts whatever protocol the attached devices use.
  const locked = protocols.length === 1;
  return {
    id,
    name,
    connectorType: connector,
    supportedProtocols: protocols,
    configuredProtocol: locked || configurable ? protocols[0] : undefined,
    isConfigurable: configurable && !locked,
  };
}

/**
 * Converts an array of communication ports to TerminalDefinitions so they appear
 * as connectable squares on the canvas.
 */
function commPortsToTerminals(ports: ProductCommunicationPort[], w: number, h: number): TerminalDefinition[] {
  const count = ports.length;
  return ports.map((port, i) => {
    // Distribute ports across the bottom edge
    const fraction = count === 1 ? 0.5 : i / (count - 1);
    const offsetX = -w / 2 + fraction * w;
    const side: TerminalSide = 'bottom';
    return {
      id: port.id,
      label: port.name,
      kind: 'network' as const,
      role: 'bidirectional' as const,
      domain: 'communication' as const,
      side,
      offsetX,
      offsetY: h / 2,
    };
  });
}

const CAN_PROTOCOLS: CommunicationProtocol[] = ['VE.Can', 'BMS-Can', 'CANopen', 'J1939'];
const ALL_PROTOCOLS: CommunicationProtocol[] = ['VE.Can', 'BMS-Can', 'VE.Bus', 'AEbus', 'CANopen', 'J1939', 'Ethernet'];

// ---- Helper to build a product with terminals auto-derived from commPorts ----
function commProduct(
  partial: Omit<Product, 'terminals'> & { communicationPorts: ProductCommunicationPort[] }
): Product {
  const { communicationPorts, width, height, ...rest } = partial;
  return {
    ...rest,
    width,
    height,
    communicationPorts,
    terminals: commPortsToTerminals(communicationPorts, width, height),
  };
}

export const communicationProducts: Product[] = [
  // ---- CAN T-connectors / splitters ----
  commProduct({
    id: 'comm-can-t-connector',
    manufacturer: 'Generic',
    name: 'CAN T-Connector',
    productType: 'commAccessory',
    category: 'Communication',
    description: 'RJ45 T-connector/splitter for CAN bus networks (VE.Can, BMS-Can).',
    commAccessoryBehavior: 'passive',
    width: 70,
    height: 50,
    communicationPorts: [
      commPort('port-a', 'Port A', 'RJ45', CAN_PROTOCOLS),
      commPort('port-b', 'Port B', 'RJ45', CAN_PROTOCOLS),
      commPort('port-c', 'Port C', 'RJ45', CAN_PROTOCOLS),
    ],
  }),
  commProduct({
    id: 'comm-can-splitter-4port',
    manufacturer: 'Generic',
    name: 'CAN 4-Port Splitter',
    productType: 'commAccessory',
    category: 'Communication',
    description: '4-port passive RJ45 CAN bus splitter.',
    commAccessoryBehavior: 'passive',
    width: 80,
    height: 50,
    communicationPorts: [
      commPort('port-a', 'Port A', 'RJ45', CAN_PROTOCOLS),
      commPort('port-b', 'Port B', 'RJ45', CAN_PROTOCOLS),
      commPort('port-c', 'Port C', 'RJ45', CAN_PROTOCOLS),
      commPort('port-d', 'Port D', 'RJ45', CAN_PROTOCOLS),
    ],
  }),

  // ---- CAN terminators ----
  commProduct({
    id: 'comm-vecan-terminator',
    manufacturer: 'Victron Energy',
    name: 'VE.Can Terminator',
    productType: 'commAccessory',
    category: 'Communication',
    description: 'RJ45 120 Ohm terminator for VE.Can / BMS-Can bus ends.',
    commAccessoryBehavior: 'terminator',
    width: 60,
    height: 40,
    communicationPorts: [
      commPort('port-a', 'Port', 'RJ45', ['VE.Can', 'BMS-Can']),
    ],
  }),
  commProduct({
    id: 'comm-can-terminator-generic',
    manufacturer: 'Generic',
    name: 'CAN Terminator',
    productType: 'commAccessory',
    category: 'Communication',
    description: 'Generic 120 Ohm terminator for CAN bus ends.',
    commAccessoryBehavior: 'terminator',
    width: 60,
    height: 40,
    communicationPorts: [
      commPort('port-a', 'Port', 'RJ45', CAN_PROTOCOLS),
    ],
  }),

  // ---- AEbus splitter / terminator ----
  commProduct({
    id: 'comm-aebus-splitter',
    manufacturer: 'Generic',
    name: 'AEbus Splitter',
    productType: 'commAccessory',
    category: 'Communication',
    description: 'Passive AEbus communication splitter for parallel battery networks.',
    commAccessoryBehavior: 'passive',
    width: 70,
    height: 50,
    communicationPorts: [
      commPort('port-a', 'Port A', 'RJ45', ['AEbus']),
      commPort('port-b', 'Port B', 'RJ45', ['AEbus']),
      commPort('port-c', 'Port C', 'RJ45', ['AEbus']),
    ],
  }),
  commProduct({
    id: 'comm-aebus-terminator',
    manufacturer: 'Generic',
    name: 'AEbus Terminator',
    productType: 'commAccessory',
    category: 'Communication',
    description: 'Terminator for AEbus network end points.',
    commAccessoryBehavior: 'terminator',
    width: 60,
    height: 40,
    communicationPorts: [
      commPort('port-a', 'Port', 'RJ45', ['AEbus']),
    ],
  }),

  // ---- RJ45 coupler ----
  commProduct({
    id: 'comm-rj45-coupler',
    manufacturer: 'Generic',
    name: 'RJ45 Coupler',
    productType: 'commAccessory',
    category: 'Communication',
    description: 'Inline RJ45 coupler for extending communication cables.',
    commAccessoryBehavior: 'passive',
    width: 60,
    height: 40,
    communicationPorts: [
      commPort('port-a', 'Port A', 'RJ45', ALL_PROTOCOLS),
      commPort('port-b', 'Port B', 'RJ45', ALL_PROTOCOLS),
    ],
  }),

  // ---- Active gateways ----
  commProduct({
    id: 'comm-vebus-ethernet-gw',
    manufacturer: 'Victron Energy',
    name: 'VE.Bus to Ethernet Interface',
    productType: 'commGateway',
    category: 'Communication',
    description: 'Active gateway bridging VE.Bus to Ethernet for remote monitoring.',
    commAccessoryBehavior: 'active-gateway',
    commProtocolBridges: [
      { fromProtocol: 'VE.Bus', toProtocol: 'Ethernet' },
    ],
    width: 90,
    height: 60,
    communicationPorts: [
      commPort('port-vebus', 'VE.Bus Port', 'RJ45', ['VE.Bus']),
      commPort('port-eth', 'Ethernet Port', 'RJ45', ['Ethernet']),
    ],
  }),
  commProduct({
    id: 'comm-can-usb-interface',
    manufacturer: 'Generic',
    name: 'CAN to USB Interface',
    productType: 'commGateway',
    category: 'Communication',
    description: 'Active CAN-to-USB adapter for diagnostics. Not for permanent installed links.',
    commAccessoryBehavior: 'active-interface',
    width: 80,
    height: 55,
    communicationPorts: [
      commPort('port-can', 'CAN Port', 'RJ45', CAN_PROTOCOLS),
    ],
  }),

  // ---- Network cables ----
  commProduct({
    id: 'comm-vebus-cable-rj45',
    manufacturer: 'Victron Energy',
    name: 'VE.Bus RJ45 Cable',
    productType: 'commAccessory',
    category: 'Communication',
    description: 'RJ45 cable for connecting VE.Bus devices (MultiPlus, Quattro, etc.).',
    commAccessoryBehavior: 'passive',
    isBOMItem: true,
    width: 60,
    height: 40,
    communicationPorts: [
      commPort('port-a', 'Port A', 'RJ45', ['VE.Bus']),
      commPort('port-b', 'Port B', 'RJ45', ['VE.Bus']),
    ],
  }),
  commProduct({
    id: 'comm-vecan-cable-rj45',
    manufacturer: 'Victron Energy',
    name: 'VE.Can RJ45 Cable',
    productType: 'commAccessory',
    category: 'Communication',
    description: 'RJ45 cable for VE.Can network connections.',
    commAccessoryBehavior: 'passive',
    isBOMItem: true,
    width: 60,
    height: 40,
    communicationPorts: [
      commPort('port-a', 'Port A', 'RJ45', ['VE.Can', 'BMS-Can']),
      commPort('port-b', 'Port B', 'RJ45', ['VE.Can', 'BMS-Can']),
    ],
  }),
];
