import type { Product } from '../../../../types/system';

const product: Product = {
  id: "dist-generic-busbar-7pt",
  manufacturer: "Generic",
  name: "Generic Busbar 7-point",
  productType: "busbar",
  category: "7 connection points",
  nominalVoltage: [
    12,
    24,
    48
  ],
  maxCurrentA: 600,
  msrpUsd: 85,
  oemPriceUsd: 59,
  description: "Single-conductor DC busbar with 7 connection points. Set the bus assignment on the placed component.",
  source: "Estimate",
  dataQuality: "placeholder",
  width: 154,
  height: 80,
  terminals: [
    {
      id: "terminal_1",
      label: "T1",
      role: "bus",
      side: "bottom",
      offsetX: -59,
      offsetY: 30,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Bus connection point. Polarity determined by component busPolarity assignment.",
      portId: "main"
    },
    {
      id: "terminal_2",
      label: "T2",
      role: "bus",
      side: "bottom",
      offsetX: -39.33333333333333,
      offsetY: 30,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Bus connection point. Polarity determined by component busPolarity assignment.",
      portId: "main"
    },
    {
      id: "terminal_3",
      label: "T3",
      role: "bus",
      side: "bottom",
      offsetX: -19.666666666666664,
      offsetY: 30,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Bus connection point. Polarity determined by component busPolarity assignment.",
      portId: "main"
    },
    {
      id: "terminal_4",
      label: "T4",
      role: "bus",
      side: "bottom",
      offsetX: 0,
      offsetY: 30,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Bus connection point. Polarity determined by component busPolarity assignment.",
      portId: "main"
    },
    {
      id: "terminal_5",
      label: "T5",
      role: "bus",
      side: "bottom",
      offsetX: 19.66666666666667,
      offsetY: 30,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Bus connection point. Polarity determined by component busPolarity assignment.",
      portId: "main"
    },
    {
      id: "terminal_6",
      label: "T6",
      role: "bus",
      side: "bottom",
      offsetX: 39.33333333333334,
      offsetY: 30,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Bus connection point. Polarity determined by component busPolarity assignment.",
      portId: "main"
    },
    {
      id: "terminal_7",
      label: "T7",
      role: "bus",
      side: "bottom",
      offsetX: 59,
      offsetY: 30,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Bus connection point. Polarity determined by component busPolarity assignment.",
      portId: "main"
    }
  ],
  busbarRatings: {
    currentRatingA: 600,
    connectionCount: 7
  },
  ports: [
    {
      id: "main",
      kind: "generic",
      topology: "bus",
      label: "Main",
      nominalVoltageV: 12,
      maxCurrentA: 600
    }
  ]
};

export default product;
