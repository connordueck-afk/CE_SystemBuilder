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
  description: "Victron Lynx Distributor - 4-way DC busbar with MEGA fuse holders",
  partNumber: "LYN060102000",
  productUrl: "https://www.cdnrg.com/products/velyn060102000",
  imageUrl: "/product-images/victron/lynx_distributor_new.svg",
  source: "Victron 2024",
  dataQuality: "partial",
  width: 180,
  height: 110,
  terminals: [
    {
      id: "main_pos",
      label: "Bat+",
      side: "left",
      offsetX: -82,
      offsetY: -30,
      terminalGroupId: "positive_bus",
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      busLinkStandard: "victron-lynx",
      notes: "Main positive bus connection (battery side). Bidirectional."
    },
    {
      id: "main_neg",
      label: "Bat-",
      side: "left",
      offsetX: -82,
      offsetY: 27,
      terminalGroupId: "negative_bus",
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      busLinkStandard: "victron-lynx",
      notes: "Main negative bus connection (battery side). Bidirectional."
    },
    {
      id: "pass_pos",
      label: "Bus+",
      side: "right",
      offsetX: 82,
      offsetY: -30,
      terminalGroupId: "positive_bus",
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      busLinkStandard: "victron-lynx",
      notes: "Unfused positive pass-through to the next Lynx module. Bidirectional."
    },
    {
      id: "pass_neg",
      label: "Bus-",
      side: "right",
      offsetX: 82,
      offsetY: 30,
      terminalGroupId: "negative_bus",
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      busLinkStandard: "victron-lynx",
      notes: "Unfused negative pass-through to the next Lynx module. Bidirectional."
    },
    {
      id: "out_pos_1",
      label: "F1+",
      side: "bottom",
      offsetX: -45,
      offsetY: 50,
      terminalGroupId: "slot_1_pos",
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Fused tap 1 positive, MEGA fuse holder. Source or load depending on topology."
    },
    {
      id: "out_neg_1",
      label: "F1-",
      side: "bottom",
      offsetX: -33,
      offsetY: 50,
      terminalGroupId: "negative_bus",
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Fused tap 1 negative return."
    },
    {
      id: "out_pos_2",
      label: "F2+",
      side: "bottom",
      offsetX: -15,
      offsetY: 50,
      terminalGroupId: "slot_2_pos",
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Fused tap 2 positive, MEGA fuse holder. Source or load depending on topology."
    },
    {
      id: "out_neg_2",
      label: "F2-",
      side: "bottom",
      offsetX: -3,
      offsetY: 50,
      terminalGroupId: "negative_bus",
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Fused tap 2 negative return."
    },
    {
      id: "out_pos_3",
      label: "F3+",
      side: "bottom",
      offsetX: 27,
      offsetY: 50,
      terminalGroupId: "slot_3_pos",
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Fused tap 3 positive, MEGA fuse holder. Source or load depending on topology."
    },
    {
      id: "out_neg_3",
      label: "F3-",
      side: "bottom",
      offsetX: 39,
      offsetY: 50,
      terminalGroupId: "negative_bus",
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Fused tap 3 negative return."
    },
    {
      id: "out_pos_4",
      label: "F4+",
      side: "bottom",
      offsetX: 57,
      offsetY: 50,
      terminalGroupId: "slot_4_pos",
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Fused tap 4 positive, MEGA fuse holder. Source or load depending on topology."
    },
    {
      id: "out_neg_4",
      label: "F4-",
      side: "bottom",
      offsetX: 69,
      offsetY: 50,
      terminalGroupId: "negative_bus",
      connector: {
        kind: "stud",
        holeSize: "M8"
      },
      notes: "Fused tap 4 negative return."
    }
  ],
  terminalGroups: [
    {
      id: "positive_bus",
      portId: "main",
      label: "Positive Bus",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: true,
      maxCurrentA: 1000
    },
    {
      id: "negative_bus",
      portId: "main",
      label: "Negative Bus",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: true,
      maxCurrentA: 1000
    },
    {
      id: "slot_1_pos",
      portId: "slot_1",
      label: "Fuse 1 Positive Output",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      requiresOvercurrentProtection: true,
      maxFuseA: 500
    },
    {
      id: "slot_2_pos",
      portId: "slot_2",
      label: "Fuse 2 Positive Output",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      requiresOvercurrentProtection: true,
      maxFuseA: 500
    },
    {
      id: "slot_3_pos",
      portId: "slot_3",
      label: "Fuse 3 Positive Output",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      requiresOvercurrentProtection: true,
      maxFuseA: 500
    },
    {
      id: "slot_4_pos",
      portId: "slot_4",
      label: "Fuse 4 Positive Output",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      requiresOvercurrentProtection: true,
      maxFuseA: 500
    }
  ],
  ports: [
    {
      id: "main",
      kind: "dc",
      topology: "bus",
      label: "Main Bus",
      voltageClass: "dc_low_voltage",
      nominalVoltageV: 12,
      maxCurrentA: 1000,
      role: "bus",
      direction: "bidirectional"
    },
    {
      id: "slot_1",
      kind: "dc",
      topology: "bus",
      label: "Fuse 1 Output",
      voltageClass: "dc_low_voltage",
      nominalVoltageV: 12,
      maxCurrentA: 500,
      role: "bus",
      direction: "bidirectional"
    },
    {
      id: "slot_2",
      kind: "dc",
      topology: "bus",
      label: "Fuse 2 Output",
      voltageClass: "dc_low_voltage",
      nominalVoltageV: 12,
      maxCurrentA: 500,
      role: "bus",
      direction: "bidirectional"
    },
    {
      id: "slot_3",
      kind: "dc",
      topology: "bus",
      label: "Fuse 3 Output",
      voltageClass: "dc_low_voltage",
      nominalVoltageV: 12,
      maxCurrentA: 500,
      role: "bus",
      direction: "bidirectional"
    },
    {
      id: "slot_4",
      kind: "dc",
      topology: "bus",
      label: "Fuse 4 Output",
      voltageClass: "dc_low_voltage",
      nominalVoltageV: 12,
      maxCurrentA: 500,
      role: "bus",
      direction: "bidirectional"
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
