import type { Product } from '../../../../types/system';

const product: Product = {
  id: "acc-ac-load-split-phase-240v",
  manufacturer: "Generic",
  name: "AC Load 240V Split-Phase",
  productType: "ac_load",
  category: "Loads",
  continuousPowerW: 9600,
  maxCurrentA: 40,
  msrpUsd: 0,
  description: "Generic 240V split-phase AC load placeholder.",
  source: "User",
  dataQuality: "placeholder",
  width: 100,
  height: 72,
  terminalGroups: [
    {
      id: "ac_in_l1",
      portId: "ac_in",
      label: "AC Input L1",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false,
      maxCurrentA: 40
    },
    {
      id: "ac_in_l2",
      portId: "ac_in",
      label: "AC Input L2",
      groupType: "power_conductor",
      polarity: "line2",
      internallyCommon: false,
      maxCurrentA: 40
    },
    {
      id: "ac_in_n",
      portId: "ac_in",
      label: "AC Input Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false,
      maxCurrentA: 40
    }
  ],
  terminals: [
    {
      id: "ac_l1",
      terminalGroupId: "ac_in_l1",
      label: "L1",
      side: "left",
      offsetX: -50,
      offsetY: -16,
      maxCurrentA: 40,
      connector: { kind: "screw_terminal" }
    },
    {
      id: "ac_l2",
      terminalGroupId: "ac_in_l2",
      label: "L2",
      side: "left",
      offsetX: -50,
      offsetY: 0,
      maxCurrentA: 40,
      connector: { kind: "screw_terminal" }
    },
    {
      id: "ac_n",
      terminalGroupId: "ac_in_n",
      label: "N",
      side: "left",
      offsetX: -50,
      offsetY: 16,
      maxCurrentA: 40,
      connector: { kind: "screw_terminal" }
    }
  ],
  loadRatings: {
    powerW: 9600
  },
  ports: [
    {
      id: "ac_in",
      kind: "ac",
      topology: "two_pole",
      label: "AC Input",
      voltageClass: "ac_240v",
      nominalVoltageV: 240,
      maxCurrentA: 40,
      maxPowerW: 9600,
      phases: 2,
      role: "sink",
      direction: "input"
    }
  ]
};

export default product;
