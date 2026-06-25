import type { Product } from '../../../../types/system';

const product: Product = {
  id: "victron-lithium-ng-12-100",
  manufacturer: "Victron",
  name: "Lithium Battery NG 12.8V/100Ah",
  productType: "battery",
  category: "Batteries",
  nominalVoltage: 12,
  capacityWh: 1280,
  maxCurrentA: 200,
  msrpUsd: 1200,
  description: "Lithium NG battery 12.8V/100Ah â€” next-generation Victron lithium with VE.Bus BMS NG / Lynx Smart BMS NG integration",
  partNumber: "BAT512110610",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 128,
  height: 98,
  terminals: [
    {
      id: "dc_pos",
      label: "+",
      kind: "dc_power",
      polarity: "positive",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "top",
      offsetX: 35,
      offsetY: -45,
      maxCurrentA: 200,
      requiresOvercurrentProtection: true,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "DC positive terminal. Requires overcurrent protection (fuse/breaker) on the positive conductor."
    },
    {
      id: "dc_neg",
      label: "-",
      kind: "dc_power",
      polarity: "negative",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "top",
      offsetX: -41,
      offsetY: -45,
      maxCurrentA: 200,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "DC negative terminal."
    },
    {
      id: "bms_can",
      label: "BMS-Can",
      kind: "network",
      role: "bidirectional",
      side: "top",
      offsetX: 0,
      offsetY: -49
    }
  ],
  batteryRatings: {
    nominalVoltageV: 12.8,
    capacityAh: 100,
    capacityWh: 1280,
    capacityKwh: 1.28,
    maxDischargeCurrentA: 200,
    chemistry: "LiFePO4",
    communicationInterfaces: [
      "VE.Bus BMS NG",
      "Lynx Smart BMS NG"
    ],
    hasInternalBms: true,
    seriesAllowed: false,
    parallelAllowed: true
  },
  communicationPorts: [
    {
      id: "bms_can",
      name: "BMS-Can",
      connectorType: "RJ45",
      supportedProtocols: [
        "BMS-Can"
      ],
      configuredProtocol: "BMS-Can"
    }
  ]
};

export default product;
