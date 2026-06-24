import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-vecan-terminator",
  manufacturer: "Victron Energy",
  name: "VE.Can Terminator",
  productType: "commAccessory",
  category: "Communication",
  description: "RJ45 120 Ohm terminator for VE.Can / BMS-Can bus ends.",
  commAccessoryBehavior: "terminator",
  width: 60,
  height: 40,
  communicationPorts: [
    {
      id: "port-a",
      name: "Port",
      connectorType: "RJ45",
      supportedProtocols: [
        "VE.Can",
        "BMS-Can"
      ],
      isConfigurable: false
    }
  ],
  terminals: [
    {
      id: "port-a",
      label: "Port",
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side: "bottom",
      offsetX: 0,
      offsetY: 20
    }
  ]
};

export default product;
