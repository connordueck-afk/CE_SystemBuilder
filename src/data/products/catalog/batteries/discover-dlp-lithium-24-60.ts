import type { Product } from '../../../../types/system';

const product: Product = {
  id: "discover-dlp-lithium-24-60",
  manufacturer: "Discover Battery",
  name: "DLP-GC2 25.6V/60Ah",
  productType: "battery",
  category: "Batteries",
  nominalVoltage: 24,
  capacityWh: 1536,
  maxCurrentA: 60,
  msrpUsd: 1250,
  description: "Discover DLP-GC2 battery 25.6V/60Ah with CAN communication",
  partNumber: "DLP-GC2-24V",
  productUrl: "https://www.cdnrg.com/products/dlp-gc2-24v",
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
      maxCurrentA: 60,
      connector: {
        kind: "stud",
        holeSize: "M6"
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
      maxCurrentA: 60,
      connector: {
        kind: "stud",
        holeSize: "M6"
      },
      terminalGroupId: "dc_neg",
      notes: "DC negative terminal."
    },
    {
      id: "lynk_comm",
      label: "LYNK",
      side: "top",
      offsetX: 0,
      offsetY: -43,
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
      nominalVoltageV: 25.6,
      voltageClass: "dc_low_voltage",
      maxCurrentA: 60,
      role: "bidirectional",
      direction: "bidirectional"
    },
    {
      id: "lynk_port",
      label: "LYNK",
      kind: "comm",
      topology: "two_pole",
      role: "bidirectional",
      direction: "bidirectional",
      supportedProtocols: [
        "AEbus"
      ],
      configuredProtocol: "AEbus",
      commTopology: "bus"
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
      maxCurrentA: 60,
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
      maxCurrentA: 60,
      notes: "Battery negative conductor group."
    },
    {
      id: "lynk_group",
      portId: "lynk_port",
      groupType: "communication_interface",
      internallyCommon: false
    }
  ],
  batteryRatings: {
    nominalVoltageV: 25.6,
    capacityAh: 60,
    capacityWh: 1536,
    capacityKwh: 1.54,
    maxDischargeCurrentA: 60,
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
