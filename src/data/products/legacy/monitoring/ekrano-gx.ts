import type { Product } from '../../../../types/system';

const product: Product = {
  id: "ekrano-gx",
  manufacturer: "Victron",
  name: "Ekrano GX",
  productType: "monitor",
  category: "Monitoring",
  msrpUsd: 690,
  description: "Victron Ekrano GX â€” combined system controller and 7-inch touchscreen display. VE.Bus / VE.Direct / VE.Can / Ethernet.",
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
      role: "control",
      voltageClass: "signal_low_voltage",
      side: "left",
      offsetX: -40,
      offsetY: 0,
      notes: "VE.Bus / VE.Can / VE.Direct system communications.",
      portId: "main"
    },
    {
      id: "can_bus",
      label: "BMS-Can / VE.Can",
      role: "bidirectional",
      side: "top",
      offsetX: -40,
      offsetY: -30,
      portId: "can_bus"
    },
    {
      id: "ve_bus",
      label: "VE.Bus",
      role: "bidirectional",
      side: "top",
      offsetX: 0,
      offsetY: -30,
      portId: "ve_bus"
    },
    {
      id: "ethernet",
      label: "Ethernet",
      role: "bidirectional",
      side: "top",
      offsetX: 40,
      offsetY: -30,
      portId: "ethernet"
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
  ],
  ports: [
    {
      id: "main",
      kind: "signal",
      topology: "two_pole",
      label: "Main"
    },
    {
      id: "can_bus",
      kind: "comm",
      label: "BMS-Can / VE.Can",
      topology: "two_pole"
    },
    {
      id: "ve_bus",
      kind: "comm",
      label: "VE.Bus",
      topology: "two_pole"
    },
    {
      id: "ethernet",
      kind: "comm",
      label: "Ethernet",
      topology: "two_pole"
    }
  ]
};

export default product;
