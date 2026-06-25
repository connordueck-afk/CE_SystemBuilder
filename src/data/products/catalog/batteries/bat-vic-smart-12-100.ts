import type { Product } from '../../../../types/system';

const product: Product = {
  id: "bat-vic-smart-12-100",
  manufacturer: "Victron",
  name: "SmartLithium 12.8V/100Ah",
  productType: "battery",
  category: "Batteries",
  nominalVoltage: 12,
  capacityWh: 1280,
  maxCurrentA: 200,
  msrpUsd: 1199,
  oemPriceUsd: 839,
  description: "Victron SmartLithium 12.8V 100Ah LiFePO4 battery with integrated BMS",
  partNumber: "BAT512110610",
  productUrl: "https://www.victronenergy.com/batteries/lithium-battery-12-8v",
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
    nominalVoltageV: 12.8,
    capacityAh: 100,
    capacityWh: 1280,
    capacityKwh: 1.28,
    maxChargeCurrentA: 100,
    maxDischargeCurrentA: 200,
    peakDischargeCurrentA: 400,
    chargeVoltageV: 14.2,
    cutoffVoltageV: 10,
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
