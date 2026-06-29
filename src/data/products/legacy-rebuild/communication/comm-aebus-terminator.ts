import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-aebus-terminator",
  manufacturer: "Generic",
  name: "AEbus Terminator",
  productType: "commAccessory",
  category: "Communication",
  description: "Terminator for AEbus network end points.",
  commAccessoryBehavior: "terminator",
  width: 60,
  height: 40,
  terminalGroups: [
    { id: "port-a", portId: "port-a", label: "Port", groupType: "communication_interface", internallyCommon: false },
  ],
  communicationPorts: [
    {
      id: "port-a",
      name: "Port",
      connectorType: "RJ45",
      supportedProtocols: ["AEbus"],
      configuredProtocol: "AEbus",
      isConfigurable: false,
    },
  ],
  terminals: [
    {
      id: "port-a",
      label: "Port",
      role: "bidirectional",
      side: "bottom",
      offsetX: 0,
      offsetY: 20,
      portId: "port-a",
      terminalGroupId: "port-a",
    },
  ],
  ports: [
    { id: "port-a", kind: "comm", label: "Port", topology: "two_pole" },
  ],
};

export default product;
