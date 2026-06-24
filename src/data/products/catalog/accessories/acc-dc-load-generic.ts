import type { Product } from '../../../../types/system';

const product: Product = {
  id: "acc-dc-load-generic",
  manufacturer: "Generic",
  name: "DC Load (generic)",
  productType: "dc_load",
  category: "Loads",
  continuousPowerW: 100,
  msrpUsd: 0,
  description: "Generic DC load placeholder",
  source: "User",
  dataQuality: "placeholder",
  width: 80,
  height: 60,
  terminals: [
    {
      id: "dc_pos",
      label: "DC+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "sink",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -40,
      offsetY: -10,
      domain: "dc",
      notes: "DC positive input."
    },
    {
      id: "dc_neg",
      label: "DC-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "sink",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -40,
      offsetY: 10,
      domain: "dc",
      notes: "DC negative input."
    }
  ],
  loadRatings: {
    powerW: 100
  }
};

export default product;
