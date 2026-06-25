import type { Product } from '../../../../types/system';

const product: Product = {
  id: "acc-ac-load-generic",
  manufacturer: "Generic",
  name: "AC Load (generic)",
  productType: "ac_load",
  category: "Loads",
  continuousPowerW: 1000,
  msrpUsd: 0,
  description: "Generic AC load placeholder",
  source: "User",
  dataQuality: "placeholder",
  width: 80,
  height: 60,
  terminals: [
    {
      id: "ac_l",
      label: "AC L",
      kind: "ac_power",
      polarity: "line",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: -10,
      phases: 1,
      notes: "AC Line conductor input."
    },
    {
      id: "ac_n",
      label: "AC N",
      kind: "ac_power",
      polarity: "neutral",
      role: "sink",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: 10,
      notes: "AC Neutral conductor input."
    }
  ],
  loadRatings: {
    powerW: 1000
  }
};

export default product;
