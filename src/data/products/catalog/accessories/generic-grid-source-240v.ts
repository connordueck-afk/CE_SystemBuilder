import type { Product } from '../../../../types/system';

const product: Product = {
  id: "generic-grid-source-240v",
  manufacturer: "Generic",
  name: "AC Source 240V Split-Phase",
  productType: "shorePowerInlet",
  category: "AC Equipment",
  continuousPowerW: 14400,
  maxCurrentA: 60,
  msrpUsd: 0,
  description: "Generic 240V split-phase AC source placeholder.",
  source: "User",
  dataQuality: "placeholder",
  width: 100,
  height: 72,
  terminalGroups: [
    {
      id: "ac_out_l1",
      portId: "ac_out",
      label: "AC Output L1",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false,
      maxCurrentA: 60
    },
    {
      id: "ac_out_l2",
      portId: "ac_out",
      label: "AC Output L2",
      groupType: "power_conductor",
      polarity: "line2",
      internallyCommon: false,
      maxCurrentA: 60
    },
    {
      id: "ac_out_n",
      portId: "ac_out",
      label: "AC Output Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false,
      maxCurrentA: 60
    }
  ],
  terminals: [
    {
      id: "ac_l1",
      terminalGroupId: "ac_out_l1",
      label: "L1",
      side: "right",
      offsetX: 50,
      offsetY: -16,
      maxCurrentA: 60,
      connector: { kind: "screw_terminal" }
    },
    {
      id: "ac_l2",
      terminalGroupId: "ac_out_l2",
      label: "L2",
      side: "right",
      offsetX: 50,
      offsetY: 0,
      maxCurrentA: 60,
      connector: { kind: "screw_terminal" }
    },
    {
      id: "ac_n",
      terminalGroupId: "ac_out_n",
      label: "N",
      side: "right",
      offsetX: 50,
      offsetY: 16,
      maxCurrentA: 60,
      connector: { kind: "screw_terminal" }
    }
  ],
  ports: [
    {
      id: "ac_out",
      kind: "ac",
      topology: "two_pole",
      label: "AC Output",
      voltageClass: "ac_240v",
      nominalVoltageV: 240,
      maxCurrentA: 60,
      maxPowerW: 14400,
      phases: 2,
      role: "source",
      direction: "output"
    }
  ]
};

export default product;
