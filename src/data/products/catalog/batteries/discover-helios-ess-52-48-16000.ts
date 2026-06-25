import type { Product } from '../../../../types/system';

const product: Product = {
  id: "discover-helios-ess-52-48-16000",
  manufacturer: "Discover Battery",
  name: "HELIOS ESS 52-48-16000",
  productType: "battery",
  category: "Batteries",
  nominalVoltage: 48,
  capacityWh: 16080,
  continuousPowerW: 10240,
  peakPowerW: 19000,
  maxCurrentA: 200,
  msrpUsd: 3355,
  productUrl: "https://www.cdnrg.com/products/renewable-energy/renewable-energy-batteries/helios",
  description: "Discover HELIOS ESS DC-coupled lithium energy storage system for residential and light commercial applications, 51.2V/314Ah with 16.08 kWh usable capacity.",
  partNumber: "52-48-16000",
  sku: "900-0077",
  source: "Discover HELIOS ESS datasheet 808-0046 Rev G",
  dataQuality: "partial",
  notes: "Datasheet lists quick-connect plug and pull terminals, 200A breaker, 10.24 kW continuous discharge, 19 kW peak power for 10 seconds, IP65 enclosure, and closed-loop CAN communication. Confirm inverter compatibility and installation requirements.",
  width: 76,
  height: 144,
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
      side: "right",
      offsetX: 38,
      offsetY: -55,
      domain: "dc",
      maxCurrentA: 200,
      requiresOvercurrentProtection: true,
      notes: "DC positive output. Confirm actual Helios field terminal location and protection requirements."
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
      side: "left",
      offsetX: -38,
      offsetY: -55,
      domain: "dc",
      maxCurrentA: 200,
      notes: "DC negative output. Confirm actual Helios field terminal location."
    },
    {
      id: "can_out",
      label: "CAN",
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side: "top",
      offsetX: 0,
      offsetY: -72
    }
  ],
  batteryRatings: {
    nominalVoltageV: 51.2,
    capacityAh: 314,
    capacityWh: 16080,
    capacityKwh: 16.08,
    maxChargeCurrentA: 200,
    maxDischargeCurrentA: 200,
    peakDischargeCurrentA: 300,
    chargeVoltageV: 56.8,
    cutoffVoltageV: 48,
    chemistry: "LiFePO4",
    communicationInterfaces: [
      "CAN"
    ],
    hasInternalBms: true,
    seriesAllowed: false,
    parallelAllowed: true
  },
  communicationPorts: [
    {
      id: "can_out",
      name: "CAN Output",
      connectorType: "RJ45",
      supportedProtocols: [
        "CANopen",
        "J1939",
        "VE.Can",
        "AEbus"
      ],
      configuredProtocol: "CANopen",
      isConfigurable: true,
      notes: "Closed-loop CAN; protocol selectable for inverter compatibility (CANopen or J1939)."
    }
  ]
};

export default product;
