import type { Product } from '../../../../types/system';

const product: Product = {
  id: "generic-ac-panel",
  manufacturer: "Generic",
  name: "AC Panel",
  productType: "ac_distribution",
  category: "AC Equipment",
  maxCurrentA: 30,
  msrpUsd: 0,
  description: "Generic AC distribution panel placeholder.",
  source: "User",
  dataQuality: "placeholder",
  width: 110,
  height: 80,
  terminalGroups: [
    {
      id: "in_l",
      portId: "main",
      label: "Input Line",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false,
      maxCurrentA: 30
    },
    {
      id: "in_n",
      portId: "main",
      label: "Input Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false,
      maxCurrentA: 30
    },
    {
      id: "out_l",
      portId: "main",
      label: "Output Line",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false,
      maxCurrentA: 30
    },
    {
      id: "out_n",
      portId: "main",
      label: "Output Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false,
      maxCurrentA: 30
    }
  ],
  terminals: [
    {
      id: "in_l",
      terminalGroupId: "in_l",
      label: "In L",
      side: "left",
      offsetX: -55,
      offsetY: -12,
      maxCurrentA: 30,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "in_n",
      terminalGroupId: "in_n",
      label: "In N",
      side: "left",
      offsetX: -55,
      offsetY: 12,
      maxCurrentA: 30,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "out_l",
      terminalGroupId: "out_l",
      label: "Out L",
      side: "right",
      offsetX: 55,
      offsetY: -12,
      maxCurrentA: 30,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "out_n",
      terminalGroupId: "out_n",
      label: "Out N",
      side: "right",
      offsetX: 55,
      offsetY: 12,
      maxCurrentA: 30,
      connector: {
        kind: "screw_terminal"
      }
    }
  ],
  ports: [
    {
      id: "main",
      kind: "ac",
      topology: "bus",
      label: "Main",
      voltageClass: "ac_120v",
      nominalVoltageV: 120,
      maxCurrentA: 30,
      role: "bus",
      direction: "bidirectional",
      phases: 1
    }
  ]
};

export default product;
