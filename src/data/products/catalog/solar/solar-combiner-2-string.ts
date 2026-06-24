import type { Product } from '../../../../types/system';

const product: Product = {
  id: "solar-combiner-2-string",
  manufacturer: "Generic",
  name: "Solar Combiner 2-string",
  productType: "solar_combiner",
  category: "2 strings",
  maxPvVoltageV: 150,
  maxPvCurrentA: 30,
  msrpUsd: 121,
  oemPriceUsd: 85,
  description: "PV combiner box for 2 solar strings with combined positive and negative outputs",
  source: "Estimate",
  dataQuality: "placeholder",
  width: 140,
  height: 100,
  terminals: [
    {
      id: "string_1_pos",
      label: "S1+",
      electricalType: "pv_pos",
      kind: "pv_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -70,
      offsetY: -34,
      domain: "pv",
      notes: "String 1 positive input."
    },
    {
      id: "string_1_neg",
      label: "S1-",
      electricalType: "pv_neg",
      kind: "pv_power",
      polarity: "negative",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -70,
      offsetY: -26,
      domain: "pv",
      notes: "String 1 negative input."
    },
    {
      id: "string_2_pos",
      label: "S2+",
      electricalType: "pv_pos",
      kind: "pv_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -70,
      offsetY: 26,
      domain: "pv",
      notes: "String 2 positive input."
    },
    {
      id: "string_2_neg",
      label: "S2-",
      electricalType: "pv_neg",
      kind: "pv_power",
      polarity: "negative",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -70,
      offsetY: 34,
      domain: "pv",
      notes: "String 2 negative input."
    },
    {
      id: "out_pos",
      label: "Out+",
      electricalType: "pv_pos",
      kind: "pv_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "right",
      offsetX: 70,
      offsetY: -10,
      domain: "pv",
      notes: "Combined PV positive output to MPPT."
    },
    {
      id: "out_neg",
      label: "Out-",
      electricalType: "pv_neg",
      kind: "pv_power",
      polarity: "negative",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "right",
      offsetX: 70,
      offsetY: 10,
      domain: "pv",
      notes: "Combined PV negative output to MPPT."
    }
  ],
  solarCombinerRatings: {
    stringCount: 2,
    inputCount: 4,
    outputCount: 2,
    maxVoltageV: 150,
    maxCurrentA: 30,
    includedProtection: "None (add fuses per string as needed)"
  }
};

export default product;
