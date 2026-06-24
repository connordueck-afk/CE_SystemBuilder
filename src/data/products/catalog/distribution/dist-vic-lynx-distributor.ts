import type { Product } from '../../../../types/system';

const product: Product = {
  id: "dist-vic-lynx-distributor",
  manufacturer: "Victron",
  name: "Lynx Distributor",
  productType: "dc_distribution",
  category: "Distribution",
  nominalVoltage: [
    12,
    24,
    48
  ],
  maxCurrentA: 1000,
  msrpUsd: 349,
  oemPriceUsd: 244,
  description: "Victron Lynx Distributor - 4-way DC busbar with fuse holders",
  partNumber: "LYN060102000",
  productUrl: "https://www.cdnrg.com/products/velyn060102000",
  source: "Victron 2024",
  dataQuality: "partial",
  width: 220,
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
      offsetX: -110,
      offsetY: -20,
      domain: "dc",
      notes: "Main positive bus connection (battery side). Bidirectional."
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
      offsetX: -110,
      offsetY: 20,
      domain: "dc",
      notes: "Main negative bus connection (battery side). Bidirectional."
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
      offsetX: 110,
      offsetY: -20,
      domain: "dc",
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
      offsetX: 110,
      offsetY: 20,
      domain: "dc",
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
      offsetX: -88,
      offsetY: 50,
      domain: "dc",
      requiresOvercurrentProtection: true,
      notes: "Fused tap 1 (+), MEGA fuse holder. Source or load depending on topology."
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
      offsetX: -63,
      offsetY: 50,
      domain: "dc",
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
      offsetX: -38,
      offsetY: 50,
      domain: "dc",
      requiresOvercurrentProtection: true,
      notes: "Fused tap 2 (+), MEGA fuse holder. Source or load depending on topology."
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
      offsetX: -13,
      offsetY: 50,
      domain: "dc",
      notes: "Fused tap 2 (-), paired negative return."
    },
    {
      id: "out_pos_3",
      label: "F3+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 13,
      offsetY: 50,
      domain: "dc",
      requiresOvercurrentProtection: true,
      notes: "Fused tap 3 (+), MEGA fuse holder. Source or load depending on topology."
    },
    {
      id: "out_neg_3",
      label: "F3-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 38,
      offsetY: 50,
      domain: "dc",
      notes: "Fused tap 3 (-), paired negative return."
    },
    {
      id: "out_pos_4",
      label: "F4+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 63,
      offsetY: 50,
      domain: "dc",
      requiresOvercurrentProtection: true,
      notes: "Fused tap 4 (+), MEGA fuse holder. Source or load depending on topology."
    },
    {
      id: "out_neg_4",
      label: "F4-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 88,
      offsetY: 50,
      domain: "dc",
      notes: "Fused tap 4 (-), paired negative return."
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
          "out_neg_2",
          "out_neg_3",
          "out_neg_4"
        ],
        maxCurrentA: 1000
      }
    ],
    fuseSlots: [
      {
        id: "slot_1",
        label: "Fuse 1",
        upstreamBusId: "positive_bus",
        downstreamTerminalId: "out_pos_1",
        pairedReturnTerminalId: "out_neg_1",
        fuseStyle: "MEGA",
        protectionType: "fuse",
        defaultInstalled: false,
        maxFuseA: 500
      },
      {
        id: "slot_2",
        label: "Fuse 2",
        upstreamBusId: "positive_bus",
        downstreamTerminalId: "out_pos_2",
        pairedReturnTerminalId: "out_neg_2",
        fuseStyle: "MEGA",
        protectionType: "fuse",
        defaultInstalled: false,
        maxFuseA: 500
      },
      {
        id: "slot_3",
        label: "Fuse 3",
        upstreamBusId: "positive_bus",
        downstreamTerminalId: "out_pos_3",
        pairedReturnTerminalId: "out_neg_3",
        fuseStyle: "MEGA",
        protectionType: "fuse",
        defaultInstalled: false,
        maxFuseA: 500
      },
      {
        id: "slot_4",
        label: "Fuse 4",
        upstreamBusId: "positive_bus",
        downstreamTerminalId: "out_pos_4",
        pairedReturnTerminalId: "out_neg_4",
        fuseStyle: "MEGA",
        protectionType: "fuse",
        defaultInstalled: false,
        maxFuseA: 500
      }
    ]
  }
};

export default product;
