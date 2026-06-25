import type { Product } from '../../../../types/system';

const product: Product = {
  id: "dist-generic-busbar",
  manufacturer: "Generic",
  name: "Generic Busbar 4-point",
  productType: "busbar",
  category: "4 connection points",
  nominalVoltage: [
    12,
    24,
    48
  ],
  maxCurrentA: 400,
  msrpUsd: 61,
  oemPriceUsd: 43,
  description: "Single-conductor DC busbar with 4 connection points. Set the bus assignment on the placed component.",
  source: "Estimate",
  dataQuality: "placeholder",
  width: 140,
  height: 80,
  terminals: [
    {
      id: "terminal_1",
      label: "T1",
      kind: "generic",
      role: "bus",
      side: "bottom",
      offsetX: -52,
      offsetY: 30,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "Bus connection point. Polarity determined by component busPolarity assignment."
    },
    {
      id: "terminal_2",
      label: "T2",
      kind: "generic",
      role: "bus",
      side: "bottom",
      offsetX: -17.333333333333336,
      offsetY: 30,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "Bus connection point. Polarity determined by component busPolarity assignment."
    },
    {
      id: "terminal_3",
      label: "T3",
      kind: "generic",
      role: "bus",
      side: "bottom",
      offsetX: 17.33333333333333,
      offsetY: 30,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "Bus connection point. Polarity determined by component busPolarity assignment."
    },
    {
      id: "terminal_4",
      label: "T4",
      kind: "generic",
      role: "bus",
      side: "bottom",
      offsetX: 52,
      offsetY: 30,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "Bus connection point. Polarity determined by component busPolarity assignment."
    }
  ],
  busbarRatings: {
    currentRatingA: 400,
    connectionCount: 4
  }
};

export default product;
