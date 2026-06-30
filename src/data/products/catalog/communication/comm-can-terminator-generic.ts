import type { Product } from '../../../../types/system';

const product: Product = {
  id: "comm-can-terminator-generic",
  manufacturer: "Generic",
  name: "CAN Terminator",
  productType: "commAccessory",
  category: "Communication",
  msrpUsd: 0,
  description: "Generic 120 Ohm terminator for CAN bus ends.",
  dataQuality: "placeholder",
  commAccessoryBehavior: "terminator",
  width: 60,
  height: 40,
  communicationPorts: [
    {
      id: "port-a",
      name: "Port",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Can", "BMS-Can", "CANopen", "J1939"],
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
      supportedProtocols: ["VE.Can", "BMS-Can", "CANopen", "J1939"],
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
