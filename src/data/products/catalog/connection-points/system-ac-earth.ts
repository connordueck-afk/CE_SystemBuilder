import type { Product } from '../../../../types/system';

const product: Product = {
  id: "system-ac-earth",
  manufacturer: "System",
  name: "AC Earth",
  productType: "connection_point",
  category: "Connection Points",
  description: "AC protective earth / grounding connection point.",
  isVirtual: true,
  isBOMItem: false,
  msrpUsd: 0,
  width: 60,
  height: 60,
  terminalGroups: [
    {
      id: "earth_gnd",
      portId: "ground",
      label: "AC Earth Ground",
      groupType: "ground_reference",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "earth",
      terminalGroupId: "earth_gnd",
      label: "AC Earth",
      side: "top",
      offsetX: 0,
      offsetY: -30
    }
  ],
  ports: [
    {
      id: "ground",
      kind: "ground",
      topology: "two_pole",
      label: "Ground",
      role: "bus",
      direction: "bidirectional"
    }
  ]
};

export default product;
