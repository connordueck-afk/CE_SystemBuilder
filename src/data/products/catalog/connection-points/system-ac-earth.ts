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
  width: 60,
  height: 60,
  terminals: [
    {
      id: "earth",
      label: "AC Earth",
      kind: "chassis_ground",
      role: "bus",
      side: "top",
      offsetX: 0,
      offsetY: -30,
    }
  ]
};

export default product;
