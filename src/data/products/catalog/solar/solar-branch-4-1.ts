import type { Product } from '../../../../types/system';

const product: Product = {
  id: "solar-branch-4-1",
  manufacturer: "Generic",
  name: "4-1 PV Branch Connector",
  productType: "solar_combiner",
  category: "Connectors",
  imageUrl: "/product-images/pv-branch-4-1.svg",
  maxPvVoltageV: 1000,
  maxPvCurrentA: 60,
  msrpUsd: 42,
  oemPriceUsd: 29,
  description: "4-to-1 PV branch connector for combining 4 same-polarity solar conductors. Select PV+ or PV- on the placed component.",
  source: "Estimate",
  dataQuality: "placeholder",
  width: 120,
  height: 76,
  terminalGroups: [
    { id: "bus", portId: "main", label: "PV Branch Bus", groupType: "power_conductor", polarity: "positive", internallyCommon: true, maxCurrentA: 60, maxVoltageV: 1000 }
  ],
  terminals: [
    { id: "in_1", terminalGroupId: "bus", label: "In 1+", side: "left", offsetX: -60, offsetY: -23.56, connector: { kind: "mc4", gender: "female" }, notes: "PV branch input 1. Polarity is selected on the component." },
    { id: "in_2", terminalGroupId: "bus", label: "In 2+", side: "left", offsetX: -60, offsetY: -7.85, connector: { kind: "mc4", gender: "female" }, notes: "PV branch input 2. Polarity is selected on the component." },
    { id: "in_3", terminalGroupId: "bus", label: "In 3+", side: "left", offsetX: -60, offsetY: 7.85, connector: { kind: "mc4", gender: "female" }, notes: "PV branch input 3. Polarity is selected on the component." },
    { id: "in_4", terminalGroupId: "bus", label: "In 4+", side: "left", offsetX: -60, offsetY: 23.56, connector: { kind: "mc4", gender: "female" }, notes: "PV branch input 4. Polarity is selected on the component." },
    { id: "out", terminalGroupId: "bus", label: "Out+", side: "right", offsetX: 60, offsetY: 0, connector: { kind: "mc4", gender: "male" }, notes: "Combined PV branch output. Polarity is selected on the component." }
  ],
  solarCombinerRatings: {
    stringCount: 4,
    inputCount: 4,
    outputCount: 1,
    maxVoltageV: 1000,
    maxCurrentA: 60,
    includedProtection: "None (branch connector only)"
  },
  ports: [
    { id: "main", kind: "pv", topology: "bus", label: "Main", voltageClass: "pv_high_voltage", voltageMaxV: 1000, maxCurrentA: 60, role: "bus", direction: "bidirectional" }
  ]
};

export default product;
