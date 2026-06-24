import type { Product } from '../../../../types/system';

const product: Product = {
  id: "ekrano-gx",
  manufacturer: "Victron",
  name: "Ekrano GX",
  productType: "monitor",
  category: "Monitoring",
  msrpUsd: 690,
  description: "Victron Ekrano GX — combined system controller and 7-inch touchscreen display. VE.Bus / VE.Direct / VE.Can / Ethernet.",
  partNumber: "BPP900480100",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 80,
  height: 60,
  terminals: [
    {
      id: "signal",
      label: "Signal",
      electricalType: "signal",
      kind: "signal",
      role: "control",
      voltageClass: "signal_low_voltage",
      side: "left",
      offsetX: -40,
      offsetY: 0,
      domain: "communication",
      notes: "VE.Bus / VE.Can / VE.Direct system communications."
    },
    {
      id: "can_bus",
      label: "BMS-Can / VE.Can",
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side: "top",
      offsetX: -40,
      offsetY: -30
    },
    {
      id: "ve_bus",
      label: "VE.Bus",
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side: "top",
      offsetX: 0,
      offsetY: -30
    },
    {
      id: "ethernet",
      label: "Ethernet",
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side: "top",
      offsetX: 40,
      offsetY: -30
    }
  ],
  communicationPorts: [
    {
      id: "can_bus",
      name: "BMS-Can / VE.Can",
      connectorType: "RJ45",
      supportedProtocols: [
        "BMS-Can",
        "VE.Can"
      ],
      configuredProtocol: "BMS-Can",
      isConfigurable: true,
      notes: "CAN-bus profile is selectable (VE.Can or BMS-Can)."
    },
    {
      id: "ve_bus",
      name: "VE.Bus",
      connectorType: "RJ45",
      supportedProtocols: [
        "VE.Bus"
      ],
      configuredProtocol: "VE.Bus"
    },
    {
      id: "ethernet",
      name: "Ethernet",
      connectorType: "RJ45",
      supportedProtocols: [
        "Ethernet"
      ],
      configuredProtocol: "Ethernet"
    }
  ]
};

export default product;
