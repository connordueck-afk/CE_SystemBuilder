import type { Product } from '../../../../types/system';

const product: Product = {
  id: "dist-generic-busbar-8pt",
  manufacturer: "Generic",
  name: "Generic Busbar 8-point",
  productType: "busbar",
  category: "8 connection points",
  nominalVoltage: [
    12,
    24,
    48
  ],
  maxCurrentA: 600,
  msrpUsd: 93,
  oemPriceUsd: 65,
  description: "Single-conductor DC busbar with 8 connection points. Set the bus assignment on the placed component.",
  source: "Estimate",
  dataQuality: "placeholder",
  width: 172,
  height: 80,
  terminals: [
    {
      id: "terminal_1",
      label: "T1",
      electricalType: "generic",
      kind: "generic",
      role: "bus",
      side: "bottom",
      offsetX: -68,
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
      offsetX: -48.57142857142857,
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
      offsetX: -29.142857142857146,
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
      offsetX: -9.714285714285722,
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
      offsetX: 9.714285714285708,
      offsetY: 30,
      notes: "Bus connection point. Polarity determined by component busPolarity assignment."
    },
    {
      id: "terminal_6",
      label: "T6",
      electricalType: "generic",
      kind: "generic",
      role: "bus",
      side: "bottom",
      offsetX: 29.14285714285714,
      offsetY: 30,
      notes: "Bus connection point. Polarity determined by component busPolarity assignment."
    },
    {
      id: "terminal_7",
      label: "T7",
      electricalType: "generic",
      kind: "generic",
      role: "bus",
      side: "bottom",
      offsetX: 48.571428571428555,
      offsetY: 30,
      notes: "Bus connection point. Polarity determined by component busPolarity assignment."
    },
    {
      id: "terminal_8",
      label: "T8",
      electricalType: "generic",
      kind: "generic",
      role: "bus",
      side: "bottom",
      offsetX: 68,
      offsetY: 30,
      notes: "Bus connection point. Polarity determined by component busPolarity assignment."
    }
  ],
  busbarRatings: {
    currentRatingA: 600,
    connectionCount: 8
  }
};

export default product;
