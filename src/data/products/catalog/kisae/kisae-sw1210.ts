import type { Product } from '../../../../types/system';

const product: Product = {
  id: "kisae-sw1210",
  manufacturer: "KISAE",
  name: "SW 12V 1000W Sine Wave Inverter",
  productType: "inverter_charger",
  category: "Inverters",
  nominalVoltage: [12, 24],
  continuousPowerW: 1000,
  maxCurrentA: 85,
  msrpUsd: 0,
  capabilities: ["inverter"],
  description: "KISAE 12V pure sine wave inverter, 1000W.",
  partNumber: "SW1210",
  productUrl: "https://www.cdnrg.com/products/sw1210",
  source: "Canadian Energy product index",
  dataQuality: "partial",
  inverterChargerRatings: {
    dcVoltageV: 12,
    maxDcCurrentA: 85,
    continuousInverterW: 1000,
    acOutputVoltageV: 120,
    acOutputCurrentA: 9
  },
  imageUrl: "/product-images/kisae-inverter.svg",
  width: 140,
  height: 90,
  terminalGroups: [
    {
      id: "dc_pos",
      portId: "dc",
      label: "DC Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 85,
      requiresOvercurrentProtection: true
    },
    {
      id: "dc_neg",
      portId: "dc",
      label: "DC Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 85
    },
    {
      id: "ac_out_l",
      portId: "ac_out",
      label: "AC Output Line",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false,
      maxCurrentA: 9
    },
    {
      id: "ac_out_n",
      portId: "ac_out",
      label: "AC Output Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false,
      maxCurrentA: 9
    },
    {
      id: "ve_bus_iface",
      portId: "ve_bus",
      label: "VE.Bus Interface",
      groupType: "communication_interface",
      internallyCommon: false
    }
  ],
  terminals: [
    {
      id: "dc_pos",
      terminalGroupId: "dc_pos",
      label: "DC+",
      side: "left",
      offsetX: -70,
      offsetY: -18,
      maxCurrentA: 85,
      connector: {
        kind: "stud",
        holeSize: "M8"
      }
    },
    {
      id: "dc_neg",
      terminalGroupId: "dc_neg",
      label: "DC-",
      side: "left",
      offsetX: -70,
      offsetY: 18,
      maxCurrentA: 85,
      connector: {
        kind: "stud",
        holeSize: "M8"
      }
    },
    {
      id: "ac_out_l",
      terminalGroupId: "ac_out_l",
      label: "AC Out L",
      side: "right",
      offsetX: 70,
      offsetY: -10,
      maxCurrentA: 9,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "ac_out_n",
      terminalGroupId: "ac_out_n",
      label: "AC Out N",
      side: "right",
      offsetX: 70,
      offsetY: 10,
      maxCurrentA: 9,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "ve_bus",
      terminalGroupId: "ve_bus_iface",
      label: "VE.Bus",
      side: "top",
      offsetX: 0,
      offsetY: -50,
      connector: {
        kind: "comm"
      }
    }
  ],
  ports: [
    {
      id: "dc",
      kind: "dc",
      topology: "two_pole",
      label: "DC",
      voltageClass: "dc_low_voltage",
      nominalVoltageV: 12,
      maxCurrentA: 85,
      role: "sink",
      direction: "input"
    },
    {
      id: "ac_out",
      kind: "ac",
      topology: "two_pole",
      label: "AC Output",
      voltageClass: "ac_120v",
      nominalVoltageV: 120,
      maxCurrentA: 9,
      role: "source",
      direction: "output"
    },
    {
      id: "ve_bus",
      kind: "comm",
      label: "VE.Bus",
      topology: "two_pole",
      role: "bidirectional",
      direction: "bidirectional",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Bus"],
      configuredProtocol: "VE.Bus"
    }
  ],
  communicationPorts: [
    {
      id: "ve_bus",
      name: "VE.Bus",
      connectorType: "RJ45",
      supportedProtocols: ["VE.Bus"],
      configuredProtocol: "VE.Bus"
    }
  ]
};

export default product;
