import type { Product } from '../../../../types/system';

const product: Product = {
  id: "victron-lithium-ng-51-100",
  manufacturer: "Victron",
  name: "Lithium Battery NG 51.2V/100Ah",
  productType: "battery",
  category: "Batteries",
  nominalVoltage: 48,
  capacityWh: 5120,
  maxCurrentA: 200,
  msrpUsd: 4200,
  description: "Lithium NG battery 51.2V/100Ah — next-generation Victron lithium with VE.Bus BMS NG / Lynx Smart BMS NG integration",
  partNumber: "BAT548110610",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 128,
  height: 98,
  terminals: [
    {
      id: "dc_pos",
      label: "+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "top",
      offsetX: 35,
      offsetY: -45,
      domain: "dc",
      maxCurrentA: 200,
      requiresOvercurrentProtection: true,
      notes: "DC positive terminal. Requires overcurrent protection (fuse/breaker) on the positive conductor."
    },
    {
      id: "dc_neg",
      label: "-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "top",
      offsetX: -41,
      offsetY: -45,
      domain: "dc",
      maxCurrentA: 200,
      notes: "DC negative terminal."
    },
    {
      id: "bms_can",
      label: "BMS-Can",
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side: "top",
      offsetX: 0,
      offsetY: -49
    }
  ],
  batteryRatings: {
    nominalVoltageV: 51.2,
    capacityAh: 100,
    capacityWh: 5120,
    capacityKwh: 5.12,
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
