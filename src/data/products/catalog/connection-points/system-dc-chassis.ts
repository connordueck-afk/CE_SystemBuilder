import type { Product } from '../../../../types/system';

const product: Product = {
  id: "system-dc-chassis",
  manufacturer: "System",
  name: "DC Chassis",
  productType: "connection_point",
  category: "Connection Points",
  description: "DC negative / chassis bonding reference point.",
  isVirtual: true,
  isBOMItem: false,
  msrpUsd: 0,
  width: 60,
  height: 60,
  terminalGroups: [
    {
      id: "chassis_gnd",
      portId: "ground",
      label: "DC Chassis Ground",
      groupType: "ground_reference",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "chassis",
      terminalGroupId: "chassis_gnd",
      label: "DC Chassis",
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
