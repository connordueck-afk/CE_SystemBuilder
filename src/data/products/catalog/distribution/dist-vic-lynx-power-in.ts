import type { Product } from '../../../../types/system';

const product: Product = {
  id: "dist-vic-lynx-power-in",
  manufacturer: "Victron",
  name: "Lynx Power In",
  productType: "dc_distribution",
  imageUrl: "/product-images/victron_lynx_class_t_power_in.svg",
  category: "Distribution",
  nominalVoltage: [
    12,
    24,
    48
  ],
  maxCurrentA: 1000,
  msrpUsd: 249,
  oemPriceUsd: 174,
  description: "Victron Lynx Power In - unfused DC busbar module (same housing as the Lynx Distributor, no fuses)",
  partNumber: "LYN040102000",
  productUrl: "https://www.victronenergy.com/dc-distribution-systems/lynx-power-in",
  source: "Victron 2024",
  dataQuality: "partial",
  width: 220,
  height: 100,
  terminals: [
    {
      id: "main_pos",
      label: "Bat+",
      busLinkStandard: "victron-lynx",
      kind: "dc_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -76,
      offsetY: -28,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "Main positive input (battery side). Bidirectional."
    },
    {
      id: "main_neg",
      label: "Bat-",
      busLinkStandard: "victron-lynx",
      kind: "dc_power",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -76,
      offsetY: 23,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "Main negative input (battery side). Bidirectional."
    },
    {
      id: "pass_pos",
      label: "Bus+",
      busLinkStandard: "victron-lynx",
      kind: "dc_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 70,
      offsetY: -24,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "Unfused positive pass-through to the next Lynx module. Bidirectional."
    },
    {
      id: "pass_neg",
      label: "Bus-",
      busLinkStandard: "victron-lynx",
      kind: "dc_power",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 71,
      offsetY: 20,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "Unfused negative pass-through to the next Lynx module. Bidirectional."
    },
    {
      id: "out_pos_1",
      label: "+1",
      kind: "dc_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -32,
      offsetY: 31,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "Unfused positive bus connection. Source or load depending on topology."
    },
    {
      id: "out_neg_1",
      label: "-1",
      kind: "dc_power",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 6,
      offsetY: 38,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "Unfused negative bus connection. Source or load depending on topology."
    },
    {
      id: "out_pos_2",
      label: "+2",
      kind: "dc_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -18,
      offsetY: 31,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "Unfused positive bus connection. Source or load depending on topology."
    },
    {
      id: "out_pos_3",
      label: "+3",
      kind: "dc_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 29,
      offsetY: 34,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "Unfused positive bus connection. Source or load depending on topology."
    },
    {
      id: "out_pos_4",
      label: "+4",
      kind: "dc_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 45,
      offsetY: 34,
      connector: { kind: 'stud', holeSize: 'M8' },
      notes: "Unfused positive bus connection. Source or load depending on topology."
    }
  ],
  busbarRatings: {
    voltageRatingV: 58,
    currentRatingA: 1000,
    connectionCount: 4,
    busDesignation: "combined"
  },
  distributionTopology: {
    buses: [
      {
        id: "positive_bus",
        label: "Positive Bus",
        busType: "dc_pos",
        terminalIds: [
          "main_pos",
          "pass_pos",
          "out_pos_1",
          "out_pos_2",
          "out_pos_3",
          "out_pos_4"
        ],
        maxCurrentA: 1000
      },
      {
        id: "negative_bus",
        label: "Negative Bus",
        busType: "dc_neg",
        terminalIds: [
          "main_neg",
          "pass_neg",
          "out_neg_1",
          "out_neg_2",
          "out_neg_3",
          "out_neg_4"
        ],
        maxCurrentA: 1000
      }
    ]
  }
};

export default product;
