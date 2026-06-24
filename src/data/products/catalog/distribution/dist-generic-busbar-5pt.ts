import type { Product } from '../../../../types/system';

const product: Product = {
  id: "dist-generic-busbar-5pt",
  manufacturer: "Generic",
  name: "Generic Busbar 5-point",
  productType: "busbar",
  category: "5 connection points",
  nominalVoltage: [
    12,
    24,
    48
  ],
  maxCurrentA: 600,
  msrpUsd: 69,
  oemPriceUsd: 48,
  description: "Single-conductor DC busbar with 5 connection points. Set the bus assignment on the placed component.",
  source: "Estimate",
  dataQuality: "placeholder",
  width: 140,
  height: 80,
  terminals: [
    {
      id: "terminal_1",
      label: "T1",
      electricalType: "generic",
      kind: "generic",
      role: "bus",
      side: "bottom",
      offsetX: -52,
      offsetY: 30,
      notes: "Bus connection point. Polarity determined by component busPolarity assignment."
    },
    {
      id: "terminal_2",
      label: "T2",
      electricalType: "generic",
      kind: "generic",
      role: "bus",
      side: "bottom",
      offsetX: -26,
      offsetY: 30,
      notes: "Bus connection point. Polarity determined by component busPolarity assignment."
    },
    {
      id: "terminal_3",
      label: "T3",
      electricalType: "generic",
      kind: "generic",
      role: "bus",
      side: "bottom",
      offsetX: 0,
      offsetY: 30,
      notes: "Bus connection point. Polarity determined by component busPolarity assignment."
    },
    {
      id: "terminal_4",
      label: "T4",
      electricalType: "generic",
      kind: "generic",
      role: "bus",
      side: "bottom",
      offsetX: 26,
      offsetY: 30,
      notes: "Bus connection point. Polarity determined by component busPolarity assignment."
    },
    {
      id: "terminal_5",
      label: "T5",
      electricalType: "generic",
      kind: "generic",
      role: "bus",
      side: "bottom",
      offsetX: 52,
      offsetY: 30,
      notes: "Bus connection point. Polarity determined by component busPolarity assignment."
    }
  ],
  busbarRatings: {
    currentRatingA: 600,
    connectionCount: 5
  }
};

export default product;
