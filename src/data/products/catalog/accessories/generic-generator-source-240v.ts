import type { Product } from '../../../../types/system';

const product: Product = {
  id: "generic-generator-source-240v",
  manufacturer: "Generic",
  name: "Generator Source 240V Split-Phase",
  productType: "shorePowerInlet",
  category: "AC Equipment",
  continuousPowerW: 12000,
  maxCurrentA: 50,
  msrpUsd: 0,
  description: "Generic 240V split-phase generator source placeholder.",
  source: "User",
  dataQuality: "placeholder",
  width: 100,
  height: 72,
  terminalGroups: [
    {
      id: "ac_out_l1",
      portId: "ac_out",
      label: "Generator Output L1",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false,
      maxCurrentA: 50
    },
    {
      id: "ac_out_l2",
      portId: "ac_out",
      label: "Generator Output L2",
      groupType: "power_conductor",
      polarity: "line2",
      internallyCommon: false,
      maxCurrentA: 50
    },
    {
      id: "ac_out_n",
      portId: "ac_out",
      label: "Generator Output Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false,
      maxCurrentA: 50
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
      maxCurrentA: 50,
      connector: { kind: "screw_terminal" }
    },
    {
      id: "ac_l2",
      terminalGroupId: "ac_out_l2",
      label: "L2",
      side: "right",
      offsetX: 50,
      offsetY: 0,
      maxCurrentA: 50,
      connector: { kind: "screw_terminal" }
    },
    {
      id: "ac_n",
      terminalGroupId: "ac_out_n",
      label: "N",
      side: "right",
      offsetX: 50,
      offsetY: 16,
      maxCurrentA: 50,
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
      maxCurrentA: 50,
      maxPowerW: 12000,
      phases: 2,
      role: "source",
      direction: "output"
    }
  ]
};

export default product;
