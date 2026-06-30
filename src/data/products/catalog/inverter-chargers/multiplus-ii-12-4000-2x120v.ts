import type { Product } from '../../../../types/system';

const product: Product = {
  id: "multiplus-ii-12-4000-2x120v",
  manufacturer: "Victron",
  name: "MultiPlus-II 12/4000/160-50 2x120V",
  productType: "inverter_charger",
  category: "Inverters",
  nominalVoltage: 12,
  continuousPowerW: 4000,
  maxCurrentA: 334,
  msrpUsd: 1419,
  capabilities: ["inverter-charger", "battery-charger"],
  description: "MultiPlus-II 12/4000/160-50 2x120V inverter/charger.",
  partNumber: "PMP122405200",
  productUrl: "https://www.victronenergy.com/inverters-chargers/multiplus-ii",
  source: "Victron 2025",
  dataQuality: "partial",
  width: 90,
  height: 130,
  inverterChargerRatings: {
    dcVoltageV: 12,
    maxDcCurrentA: 334,
    continuousInverterW: 4000,
    chargerCurrentA: 160,
    acInputVoltageV: 240,
    acOutputVoltageV: 240,
    acOutputCurrentA: 17
  },
  terminalGroups: [
    {
      id: "dc_pos",
      portId: "dc",
      label: "DC Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 334,
      requiresOvercurrentProtection: true
    },
    {
      id: "dc_neg",
      portId: "dc",
      label: "DC Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 334
    },
    {
      id: "ac_in_l",
      portId: "ac_in",
      label: "AC Input Line",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false
    },
    {
      id: "ac_in_n",
      portId: "ac_in",
      label: "AC Input Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false
    },
    {
      id: "ac_out_l",
      portId: "ac_out",
      label: "AC Output Line",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false,
      maxCurrentA: 17
    },
    {
      id: "ac_out_n",
      portId: "ac_out",
      label: "AC Output Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false,
      maxCurrentA: 17
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
      side: "bottom",
      offsetX: -20,
      offsetY: 48,
      maxCurrentA: 334,
      connector: {
        kind: "stud",
        holeSize: "M10"
      }
    },
    {
      id: "dc_neg",
      terminalGroupId: "dc_neg",
      label: "DC-",
      side: "bottom",
      offsetX: -12,
      offsetY: 48,
      maxCurrentA: 334,
      connector: {
        kind: "stud",
        holeSize: "M10"
      }
    },
    {
      id: "ac_in_l",
      terminalGroupId: "ac_in_l",
      label: "AC In L",
      side: "bottom",
      offsetX: 2,
      offsetY: 48,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "ac_in_n",
      terminalGroupId: "ac_in_n",
      label: "AC In N",
      side: "bottom",
      offsetX: 9,
      offsetY: 48,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "ac_out_l",
      terminalGroupId: "ac_out_l",
      label: "AC Out L",
      side: "bottom",
      offsetX: 16,
      offsetY: 48,
      maxCurrentA: 17,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "ac_out_n",
      terminalGroupId: "ac_out_n",
      label: "AC Out N",
      side: "bottom",
      offsetX: 23,
      offsetY: 48,
      maxCurrentA: 17,
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
      offsetY: -65,
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
      maxCurrentA: 334,
      role: "bidirectional",
      direction: "bidirectional"
    },
    {
      id: "ac_in",
      kind: "ac",
      topology: "two_pole",
      label: "AC Input",
      voltageClass: "ac_240v",
      nominalVoltageV: 240,
      role: "sink",
      direction: "input"
    },
    {
      id: "ac_out",
      kind: "ac",
      topology: "two_pole",
      label: "AC Output",
      voltageClass: "ac_240v",
      nominalVoltageV: 240,
      maxCurrentA: 17,
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
