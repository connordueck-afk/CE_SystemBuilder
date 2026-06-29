import type { Product } from '../../../../types/system';

const product: Product = {
  id: "generic-generator-source",
  manufacturer: "Generic",
  name: "Generator Source",
  productType: "shorePowerInlet",
  category: "AC Equipment",
  continuousPowerW: 3000,
  msrpUsd: 0,
  description: "Generic AC generator source placeholder",
  source: "User",
  dataQuality: "placeholder",
  width: 90,
  height: 64,
  terminalGroups: [
    {
      id: "ac_out_l",
      portId: "ac_out",
      label: "AC Output Line",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false
    },
    {
      id: "ac_out_n",
      portId: "ac_out",
      label: "AC Output Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "ac_l",
      terminalGroupId: "ac_out_l",
      label: "L",
      side: "right",
      offsetX: 45,
      offsetY: -10
    },
    {
      id: "ac_n",
      terminalGroupId: "ac_out_n",
      label: "N",
      side: "right",
      offsetX: 45,
      offsetY: 10
    }
  ],
  ports: [
    {
      id: "ac_out",
      kind: "ac",
      topology: "two_pole",
      label: "AC Output",
      voltageClass: "ac_120v",
      nominalVoltageV: 120,
      maxPowerW: 3000,
      role: "source",
      direction: "output"
    }
  ]
};

export default product;
