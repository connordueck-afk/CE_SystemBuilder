import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-aebus-terminator",
  manufacturer: "Generic",
  name: "AEbus Terminator",
  productType: "commAccessory",
  category: "Communication",
  msrpUsd: 0,
  description: "Terminator for AEbus network end points.",
  dataQuality: "placeholder",
  commAccessoryBehavior: "terminator",
  width: 60,
  height: 40,
  communicationPorts: [
    {
      id: "port-a",
      name: "Port",
      connectorType: "RJ45",
      supportedProtocols: ["AEbus"],
      configuredProtocol: "AEbus"
    }
  ],
  ports: [
    {
      id: "port-a",
      kind: "comm",
      topology: "two_pole",
      label: "Port",
      role: "bidirectional",
      direction: "bidirectional",
      connectorType: "RJ45",
      supportedProtocols: ["AEbus"],
      configuredProtocol: "AEbus"
    }
  ],
  terminalGroups: [
    {
      id: "port-a_iface",
      portId: "port-a",
      label: "Port Interface",
      groupType: "communication_interface",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "port-a",
      terminalGroupId: "port-a_iface",
      label: "Port",
      side: "bottom",
      offsetX: 0,
      offsetY: 20,
      connector: {
        kind: "comm"
      }
    }
  ]
};

export default product;
