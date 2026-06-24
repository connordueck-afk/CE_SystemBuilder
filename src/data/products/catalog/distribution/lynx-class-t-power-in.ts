import type { Product } from '../../../../types/system';

const product: Product = {
  id: "lynx-class-t-power-in",
  manufacturer: "Victron",
  name: "Lynx Class-T Power In",
  productType: "dc_distribution",
  category: "Distribution",
  nominalVoltage: [
    12,
    24,
    48
  ],
  maxCurrentA: 1000,
  msrpUsd: 172,
  description: "Victron Lynx Class-T Power In — DC busbar input module with integrated Class-T fuse holder.",
  partNumber: "LYN020102010",
  productUrl: "https://www.victronenergy.com/dc-distribution-systems/lynx-class-t-power-in",
  source: "Victron 2025",
  dataQuality: "partial",
  notes: "Placeholder pricing/specs.",
  width: 140,
  height: 100,
  terminals: [
    {
      id: "main_pos",
      label: "Bat+",
      busLinkStandard: "victron-lynx",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -70,
      offsetY: -20,
      notes: "Main positive input (battery side). Bidirectional."
    },
    {
      id: "main_neg",
      label: "Bat-",
      busLinkStandard: "victron-lynx",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -70,
      offsetY: 20,
      notes: "Main negative input (battery side). Bidirectional."
    },
    {
      id: "pass_pos",
      label: "Bus+",
      busLinkStandard: "victron-lynx",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 70,
      offsetY: -20,
      notes: "Unfused positive pass-through to the next Lynx module. Bidirectional."
    },
    {
      id: "pass_neg",
      label: "Bus-",
      busLinkStandard: "victron-lynx",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 70,
      offsetY: 20,
      notes: "Unfused negative pass-through to the next Lynx module. Bidirectional."
    },
    {
      id: "out_pos_1",
      label: "F1+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -45,
      offsetY: 50,
      requiresOvercurrentProtection: true,
      notes: "Fused tap 1 (+), Class-T fuse holder. Source or load depending on topology."
    },
    {
      id: "out_neg_1",
      label: "F1-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -15,
      offsetY: 50,
      notes: "Fused tap 1 (-), paired negative return."
    },
    {
      id: "out_pos_2",
      label: "F2+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 15,
      offsetY: 50,
      requiresOvercurrentProtection: true,
      notes: "Fused tap 2 (+), Class-T fuse holder. Source or load depending on topology."
    },
    {
      id: "out_neg_2",
      label: "F2-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 45,
      offsetY: 50,
      notes: "Fused tap 2 (-), paired negative return."
    }
  ],
  busbarRatings: {
    voltageRatingV: 58,
    currentRatingA: 1000,
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
          "pass_pos"
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
          "out_neg_2"
        ],
        maxCurrentA: 1000
      }
    ],
    fuseSlots: [
      {
        id: "slot_1",
        label: "Class-T Fuse 1",
        upstreamBusId: "positive_bus",
        downstreamTerminalId: "out_pos_1",
        pairedReturnTerminalId: "out_neg_1",
        fuseStyle: "Class T",
        protectionType: "fuse",
        defaultInstalled: false,
        maxFuseA: 600
      },
      {
        id: "slot_2",
        label: "Class-T Fuse 2",
        upstreamBusId: "positive_bus",
        downstreamTerminalId: "out_pos_2",
        pairedReturnTerminalId: "out_neg_2",
        fuseStyle: "Class T",
        protectionType: "fuse",
        defaultInstalled: false,
        maxFuseA: 600
      }
    ]
  }
};

export default product;
