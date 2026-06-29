import type { Product } from '../../../../types/system';

const product: Product = {
  id: "smartshunt-1000",
  manufacturer: "Victron",
  name: "SmartShunt 1000A/50mV",
  productType: "monitor",
  category: "Monitoring",
  msrpUsd: 203,
  description: "Victron SmartShunt 1000A â€” Bluetooth battery monitor with integrated 1000A/50mV shunt",
  partNumber: "SHU050210050",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 100,
  height: 50,
  terminals: [
    {
      id: "shunt_pos",
      label: "Shunt+",
      polarity: "positive",
      role: "sense",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -42,
      offsetY: 13,
      notes: "Battery negative sense terminal (current shunt measures flow across this terminal).",
      portId: "main"
    },
    {
      id: "shunt_neg",
      label: "Shunt-",
      polarity: "negative",
      role: "sense",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 42,
      offsetY: 13,
      notes: "Battery negative bus side of shunt.",
      portId: "main"
    },
    {
      id: "ve_direct",
      label: "VE.Direct",
      role: "bidirectional",
      side: "top",
      offsetX: 0,
      offsetY: -25,
      portId: "ve_direct"
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
  ],
  ports: [
    {
      id: "main",
      kind: "dc",
      topology: "pass_through",
      label: "Main"
    },
    {
      id: "ve_direct",
      kind: "comm",
      label: "VE.Direct",
      topology: "pass_through"
    }
  ]
};

export default product;
