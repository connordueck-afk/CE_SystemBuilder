import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-vecan-terminator",
  manufacturer: "Victron Energy",
  name: "VE.Can Terminator",
  productType: "commAccessory",
  category: "Communication",
  msrpUsd: 0,
  description: "RJ45 120 Ohm terminator for VE.Can / BMS-Can bus ends.",
  dataQuality: "placeholder",
  commAccessoryBehavior: "terminator",
  width: 60,
  height: 40,
  communicationPorts: [
    {
      id: "port-a",
      name: "Port",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Can", "BMS-Can"],
      isConfigurable: false
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
      supportedProtocols: ["VE.Can", "BMS-Can"],
      isConfigurable: false
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
