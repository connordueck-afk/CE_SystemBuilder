import type { Product } from '../../../../types/system';

const product: Product = {
  id: "bat-vic-smart-48-100",
  manufacturer: "Victron",
  name: "SmartLithium 51.2V/100Ah",
  productType: "battery",
  category: "Batteries",
  nominalVoltage: 48,
  capacityWh: 5120,
  maxCurrentA: 200,
  msrpUsd: 3499,
  oemPriceUsd: 2449,
  description: "Victron SmartLithium 51.2V 100Ah LiFePO4 battery with integrated BMS",
  partNumber: "BAT548110610",
  productUrl: "https://www.victronenergy.com/batteries/lithium-battery-51-2v",
  source: "Victron 2024",
  dataQuality: "partial",
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
    nominalVoltageV: 51.2,
    capacityAh: 100,
    capacityWh: 5120,
    capacityKwh: 5.12,
    maxChargeCurrentA: 100,
    maxDischargeCurrentA: 200,
    peakDischargeCurrentA: 400,
    chargeVoltageV: 56.8,
    cutoffVoltageV: 40,
    chemistry: "LiFePO4",
    communicationInterfaces: [
      "VE.Bus",
      "CANbus"
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
