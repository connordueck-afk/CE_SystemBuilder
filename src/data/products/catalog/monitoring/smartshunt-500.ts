import type { Product } from '../../../../types/system';

const product: Product = {
  id: "smartshunt-500",
  manufacturer: "Victron",
  name: "SmartShunt 500A/50mV",
  productType: "monitor",
  category: "Monitoring",
  msrpUsd: 123,
  description: "Victron SmartShunt 500A — Bluetooth battery monitor with integrated 500A/50mV shunt",
  partNumber: "SHU050150050",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 100,
  height: 50,
  terminals: [
    {
      id: "shunt_pos",
      label: "Shunt+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "sense",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -42,
      offsetY: 13,
      domain: "dc",
      notes: "Battery negative sense terminal (current shunt measures flow across this terminal)."
    },
    {
      id: "shunt_neg",
      label: "Shunt-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "sense",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 42,
      offsetY: 13,
      domain: "dc",
      notes: "Battery negative bus side of shunt."
    },
    {
      id: "ve_direct",
      label: "VE.Direct",
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side: "top",
      offsetX: 0,
      offsetY: -25
    }
  ],
  communicationPorts: [
    {
      id: "ve_direct",
      name: "VE.Direct",
      connectorType: "VE.Direct",
      supportedProtocols: [
        "VE.Direct"
      ],
      configuredProtocol: "VE.Direct"
    }
  ]
};

export default product;
