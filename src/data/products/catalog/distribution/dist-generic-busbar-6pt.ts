import type { Product } from '../../../../types/system';

const product: Product = {
  id: "dist-generic-busbar-6pt",
  manufacturer: "Generic",
  name: "Generic Busbar 6-point",
  productType: "busbar",
  category: "6 connection points",
  nominalVoltage: [
    12,
    24,
    48
  ],
  maxCurrentA: 600,
  msrpUsd: 77,
  oemPriceUsd: 54,
  description: "Single-conductor DC busbar with 6 connection points. Set the bus assignment on the placed component.",
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
      offsetX: -31.2,
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
      offsetX: -10.399999999999999,
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
      offsetX: 10.400000000000006,
      offsetY: 30,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "Bus connection point. Polarity determined by component busPolarity assignment."
    },
    {
      id: "terminal_5",
      label: "T5",
      kind: "generic",
      role: "bus",
      side: "bottom",
      offsetX: 31.200000000000003,
      offsetY: 30,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "Bus connection point. Polarity determined by component busPolarity assignment."
    },
    {
      id: "terminal_6",
      label: "T6",
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
    currentRatingA: 600,
    connectionCount: 6
  }
};

export default product;
