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
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -76,
      offsetY: -26,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Main positive bus connection (battery side). Bidirectional.",
      portId: "main"
    },
    {
      id: "main_neg",
      label: "Bat-",
      busLinkStandard: "victron-lynx",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -76,
      offsetY: 24,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Main negative bus connection (battery side). Bidirectional.",
      portId: "main"
    },
    {
      id: "pass_pos",
      label: "Bus+",
      busLinkStandard: "victron-lynx",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 78,
      offsetY: -24,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Unfused positive pass-through to the next Lynx module. Bidirectional.",
      portId: "main"
    },
    {
      id: "pass_neg",
      label: "Bus-",
      busLinkStandard: "victron-lynx",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 76,
      offsetY: 19,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Unfused negative pass-through to the next Lynx module. Bidirectional.",
      portId: "main"
    },
    {
      id: "out_pos_1",
      label: "F1+",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -28,
      offsetY: 36,
      requiresOvercurrentProtection: true,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Fused tap 1 (+), MEGA fuse holder. Source or load depending on topology.",
      portId: "main"
    },
    {
      id: "out_neg_1",
      label: "F1-",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -19,
      offsetY: 36,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Fused tap 1 (-), paired negative return.",
      portId: "main"
    },
    {
      id: "out_pos_2",
      label: "F2+",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -9,
      offsetY: 36,
      requiresOvercurrentProtection: true,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Fused tap 2 (+), MEGA fuse holder. Source or load depending on topology.",
      portId: "main"
    },
    {
      id: "out_neg_2",
      label: "F2-",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 1,
      offsetY: 36,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Fused tap 2 (-), paired negative return.",
      portId: "main"
    },
    {
      id: "out_pos_3",
      label: "F3+",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 24,
      offsetY: 38,
      requiresOvercurrentProtection: true,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Fused tap 3 (+), MEGA fuse holder. Source or load depending on topology.",
      portId: "main"
    },
    {
      id: "out_neg_3",
      label: "F3-",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 34,
      offsetY: 39,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Fused tap 3 (-), paired negative return.",
      portId: "main"
    },
    {
      id: "out_pos_4",
      label: "F4+",
      polarity: "positive",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 44,
      offsetY: 39,
      requiresOvercurrentProtection: true,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Fused tap 4 (+), MEGA fuse holder. Source or load depending on topology.",
      portId: "main"
    },
    {
      id: "out_neg_4",
      label: "F4-",
      polarity: "negative",
      role: "bus",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 54,
      offsetY: 40,
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Fused tap 4 (-), paired negative return.",
      portId: "main"
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
  },
  imageUrl: "/product-images/victron_lynx_distributor.svg",
  ports: [
    {
      id: "main",
      kind: "dc",
      topology: "bus",
      label: "Main",
      nominalVoltageV: 12,
      maxCurrentA: 1000
    }
  ]
};

export default product;
