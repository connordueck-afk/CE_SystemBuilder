import type { Product } from '../../../../types/system';

const product: Product = {
  id: "multiplus-ii-48-8000-230v",
  manufacturer: "Victron",
  name: "MultiPlus-II 48/8000/110-100 (230V)",
  productType: "inverter_charger",
  category: "Inverters",
  nominalVoltage: 48,
  continuousPowerW: 8000,
  maxCurrentA: 175,
  msrpUsd: 1778,
  capabilities: ["inverter-charger", "battery-charger"],
  description: "MultiPlus-II 48/8000/110-100 (230V) inverter/charger.",
  partNumber: "PMP482805000",
  productUrl: "https://www.victronenergy.com/inverters-chargers/multiplus-ii",
  source: "Victron 2025",
  dataQuality: "partial",
  width: 90,
  height: 130,
  inverterChargerRatings: {
    dcVoltageV: 48,
    maxDcCurrentA: 175,
    continuousInverterW: 8000,
    chargerCurrentA: 110,
    acInputVoltageV: 230,
    acOutputVoltageV: 230,
    acOutputCurrentA: 35
  },
  terminalGroups: [
    {
      id: "dc_pos",
      portId: "dc",
      label: "DC Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 175,
      requiresOvercurrentProtection: true
    },
    {
      id: "dc_neg",
      portId: "dc",
      label: "DC Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 175
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
      maxCurrentA: 35
    },
    {
      id: "ac_out_n",
      portId: "ac_out",
      label: "AC Output Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false,
      maxCurrentA: 35
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
      maxCurrentA: 175,
      connector: {
        kind: "stud",
        holeSize: "M8"
      }
    },
    {
      id: "dc_neg",
      terminalGroupId: "dc_neg",
      label: "DC-",
      side: "bottom",
      offsetX: -12,
      offsetY: 48,
      maxCurrentA: 175,
      connector: {
        kind: "stud",
        holeSize: "M8"
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
      maxCurrentA: 35,
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
      maxCurrentA: 35,
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
      nominalVoltageV: 48,
      maxCurrentA: 175,
      role: "bidirectional",
      direction: "bidirectional"
    },
    {
      id: "ac_in",
      kind: "ac",
      topology: "two_pole",
      label: "AC Input",
      voltageClass: "ac_240v",
      nominalVoltageV: 230,
      role: "sink",
      direction: "input"
    },
    {
      id: "ac_out",
      kind: "ac",
      topology: "two_pole",
      label: "AC Output",
      voltageClass: "ac_240v",
      nominalVoltageV: 230,
      maxCurrentA: 35,
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
