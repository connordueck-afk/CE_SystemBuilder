import type { Product, TerminalDefinition, TerminalGroupDefinition } from '../../../../types/system';

const stringCount = 6;
const stringOffsets = [-30, -18, -6, 6, 18, 30];

const terminalGroups: TerminalGroupDefinition[] = [
  { id: "positive_bus", portId: "positive_bus", label: "Positive Bus", groupType: "power_conductor", polarity: "positive", internallyCommon: true, maxCurrentA: 90, maxVoltageV: 150 },
  { id: "negative_bus", portId: "negative_bus", label: "Negative Bus", groupType: "power_conductor", polarity: "negative", internallyCommon: true, maxCurrentA: 90, maxVoltageV: 150 }
];

const stringTerminals: TerminalDefinition[] = stringOffsets.flatMap((y, index) => {
  const n = index + 1;
  return [
    { id: `string_${n}_pos`, terminalGroupId: "positive_bus", label: `S${n}+`, side: "left", offsetX: -70, offsetY: y - 3, connector: { kind: "mc4", gender: "female" }, notes: `String ${n} positive input.` },
    { id: `string_${n}_neg`, terminalGroupId: "negative_bus", label: `S${n}-`, side: "left", offsetX: -70, offsetY: y + 3, connector: { kind: "mc4", gender: "male" }, notes: `String ${n} negative input.` }
  ];
});

const product: Product = {
  id: "solar-combiner-6-string",
  manufacturer: "Generic",
  name: "Solar Combiner 6-string",
  productType: "solar_combiner",
  category: "6 strings",
  maxPvVoltageV: 150,
  maxPvCurrentA: 90,
  msrpUsd: 233,
  oemPriceUsd: 163,
  description: "PV combiner box for 6 solar strings with combined positive and negative outputs.",
  source: "Estimate",
  dataQuality: "placeholder",
  width: 140,
  height: 100,
  terminalGroups,
  terminals: [
    ...stringTerminals,
    { id: "out_pos", terminalGroupId: "positive_bus", label: "Out+", side: "right", offsetX: 70, offsetY: -10, connector: { kind: "screw_terminal" }, notes: "Combined PV positive output to MPPT." },
    { id: "out_neg", terminalGroupId: "negative_bus", label: "Out-", side: "right", offsetX: 70, offsetY: 10, connector: { kind: "screw_terminal" }, notes: "Combined PV negative output to MPPT." }
  ],
  solarCombinerRatings: {
    stringCount,
    inputCount: 12,
    outputCount: 2,
    maxVoltageV: 150,
    maxCurrentA: 90,
    includedProtection: "None (add fuses per string as needed)"
  },
  ports: [
    { id: "positive_bus", kind: "pv", topology: "bus", label: "PV Positive Bus", voltageClass: "pv_high_voltage", voltageMaxV: 150, maxCurrentA: 90, role: "bus", direction: "bidirectional" },
    { id: "negative_bus", kind: "pv", topology: "bus", label: "PV Negative Bus", voltageClass: "pv_high_voltage", voltageMaxV: 150, maxCurrentA: 90, role: "bus", direction: "bidirectional" }
  ]
};

export default product;
