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
  width: 60,
  height: 60,
  terminals: [
    {
      id: "chassis",
      label: "DC Chassis",
      kind: "chassis_ground",
      role: "bus",
      side: "top",
      offsetX: 0,
      offsetY: -30,
      domain: "chassisGround"
    }
  ]
};

export default product;
