import type { Product } from '../../../../types/system';

const product: Product = {
  id: "solar-combiner-3-string",
  manufacturer: "Generic",
  name: "Solar Combiner 3-string",
  productType: "solar_combiner",
  category: "3 strings",
  maxPvVoltageV: 150,
  maxPvCurrentA: 45,
  msrpUsd: 149,
  oemPriceUsd: 104,
  description: "PV combiner box for 3 solar strings with combined positive and negative outputs",
  source: "Estimate",
  dataQuality: "placeholder",
  width: 140,
  height: 100,
  terminals: [
    {
      id: "string_1_pos",
      label: "S1+",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -70,
      offsetY: -34,
      connector: {
        kind: "mc4",
        gender: "female"
      },
      notes: "String 1 positive input.",
      portId: "main"
    },
    {
      id: "string_1_neg",
      label: "S1-",
      polarity: "negative",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -70,
      offsetY: -26,
      connector: {
        kind: "mc4",
        gender: "male"
      },
      notes: "String 1 negative input.",
      portId: "main"
    },
    {
      id: "string_2_pos",
      label: "S2+",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -70,
      offsetY: -4,
      connector: {
        kind: "mc4",
        gender: "female"
      },
      notes: "String 2 positive input.",
      portId: "main"
    },
    {
      id: "string_2_neg",
      label: "S2-",
      polarity: "negative",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -70,
      offsetY: 4,
      connector: {
        kind: "mc4",
        gender: "male"
      },
      notes: "String 2 negative input.",
      portId: "main"
    },
    {
      id: "string_3_pos",
      label: "S3+",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -70,
      offsetY: 26,
      connector: {
        kind: "mc4",
        gender: "female"
      },
      notes: "String 3 positive input.",
      portId: "main"
    },
    {
      id: "string_3_neg",
      label: "S3-",
      polarity: "negative",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -70,
      offsetY: 34,
      connector: {
        kind: "mc4",
        gender: "male"
      },
      notes: "String 3 negative input.",
      portId: "main"
    },
    {
      id: "out_pos",
      label: "Out+",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "right",
      offsetX: 70,
      offsetY: -10,
      connector: {
        kind: "screw_terminal"
      },
      notes: "Combined PV positive output to MPPT.",
      portId: "main"
    },
    {
      id: "out_neg",
      label: "Out-",
      polarity: "negative",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "right",
      offsetX: 70,
      offsetY: 10,
      connector: {
        kind: "screw_terminal"
      },
      notes: "Combined PV negative output to MPPT.",
      portId: "main"
    }
  ],
  solarCombinerRatings: {
    stringCount: 3,
    inputCount: 6,
    outputCount: 2,
    maxVoltageV: 150,
    maxCurrentA: 45,
    includedProtection: "None (add fuses per string as needed)"
  },
  ports: [
    {
      id: "main",
      kind: "pv",
      topology: "bus",
      label: "Main",
      maxCurrentA: 45
    }
  ]
};

export default product;
