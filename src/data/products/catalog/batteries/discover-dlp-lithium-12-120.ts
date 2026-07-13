import type { Product } from '../../../../types/system';

const product: Product = {
  id: "discover-dlp-lithium-12-120",
  manufacturer: "Discover Battery",
  name: "DLP-GC2 12.8V/120Ah",
  productType: "battery",
  category: "Batteries",
  nominalVoltage: 12,
  capacityWh: 1536,
  maxCurrentA: 120,
  msrpUsd: 1250,
  description: "Discover DLP-GC2 battery 12.8V/120Ah with CAN communication",
  partNumber: "DLP-GC2-12V",
  productUrl: "https://www.cdnrg.com/products/dlp-gc2-12v",
  source: "Discover Battery 2025",
  notes: "Placeholder pricing/specs.",
  dataQuality: "partial",
  width: 92,
  height: 98,
  terminals: [
    {
      id: "dc_pos",
      label: "+",
      side: "top",
      offsetX: 22,
      offsetY: -45,
      maxCurrentA: 120,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      terminalGroupId: "dc_pos",
      notes: "DC positive terminal. Requires overcurrent protection (fuse/breaker) on the positive conductor."
    },
    {
      id: "dc_neg",
      label: "-",
      side: "top",
      offsetX: -26,
      offsetY: -45,
      maxCurrentA: 120,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      terminalGroupId: "dc_neg",
      notes: "DC negative terminal."
    },
    {
      id: "lynk_comm",
      label: "LYNK",
      side: "top",
      offsetX: 0,
      offsetY: -42,
      terminalGroupId: "lynk_group",
      connectorType: "M12"
    }
  ],
  ports: [
    {
      id: "dc",
      kind: "dc",
      topology: "two_pole",
      label: "DC",
      nominalVoltageV: 12.8,
      voltageClass: "dc_low_voltage",
      maxCurrentA: 120,
      role: "bidirectional",
      direction: "bidirectional"
    },
    {
      id: "port_lynk",
      label: "LYNK",
      kind: "comm",
      topology: "two_pole",
      role: "bidirectional",
      direction: "bidirectional",
      commTopology: "bus",
      supportedProtocols: [
        "AEbus"
      ],
      configuredProtocol: "AEbus"
    }
  ],
  terminalGroups: [
    {
      id: "dc_pos",
      portId: "dc",
      label: "DC Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: true,
      maxCurrentA: 120,
      requiresOvercurrentProtection: true,
      notes: "Battery positive conductor group."
    },
    {
      id: "dc_neg",
      portId: "dc",
      label: "DC Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: true,
      maxCurrentA: 120,
      notes: "Battery negative conductor group."
    },
    {
      id: "lynk_group",
      portId: "port_lynk",
      groupType: "communication_interface",
      internallyCommon: false
    }
  ],
  batteryRatings: {
    nominalVoltageV: 12.8,
    capacityAh: 120,
    capacityWh: 1536,
    capacityKwh: 1.54,
    maxDischargeCurrentA: 120,
    chemistry: "LiFePO4",
    communicationInterfaces: [
      "CAN"
    ],
    hasInternalBms: true,
    seriesAllowed: false,
    parallelAllowed: true
  }
};

export default product;
