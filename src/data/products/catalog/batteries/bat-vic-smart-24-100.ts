import type { Product } from '../../../../types/system';

const product: Product = {
  id: "bat-vic-smart-24-100",
  manufacturer: "Victron",
  name: "SmartLithium 25.6V/100Ah",
  productType: "battery",
  category: "Batteries",
  nominalVoltage: 24,
  capacityWh: 2560,
  maxCurrentA: 200,
  msrpUsd: 2399,
  oemPriceUsd: 1679,
  description: "Victron SmartLithium 25.6V 100Ah LiFePO4 battery with integrated BMS",
  partNumber: "BAT524110610",
  productUrl: "https://www.victronenergy.com/batteries/lithium-battery-25-6v",
  source: "Victron 2024",
  dataQuality: "partial",
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
    nominalVoltageV: 25.6,
    capacityAh: 100,
    capacityWh: 2560,
    capacityKwh: 2.56,
    maxChargeCurrentA: 100,
    maxDischargeCurrentA: 200,
    peakDischargeCurrentA: 400,
    chargeVoltageV: 28.4,
    cutoffVoltageV: 20,
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
