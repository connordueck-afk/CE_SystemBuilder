import type { Product } from '../../../../types/system';

const product: Product = {
  id: "megarevo-12kw-hybrid-inverter",
  manufacturer: "Megarevo",
  name: "Megarevo 12kW Hybrid Inverter",
  productType: "inverter_charger",
  category: "Inverters",
  nominalVoltage: 48,
  continuousPowerW: 12000,
  maxCurrentA: 250,
  msrpUsd: 0,
  capabilities: [
    "hybrid-inverter",
    "inverter-charger",
    "mppt",
    "pv-input",
    "battery-charger"
  ],
  description: "Placeholder Megarevo 12kW hybrid inverter entry. Replace image and electrical limits with verified datasheet values when the SVG and final specs are imported.",
  source: "Placeholder pending Megarevo datasheet verification",
  dataQuality: "placeholder",
  width: 175,
  height: 311,
  terminalGroups: [
    {
      id: "dc_pos",
      portId: "dc",
      label: "Battery Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: true,
      maxCurrentA: 250,
      requiresOvercurrentProtection: true,
      notes: "Placeholder battery positive limit. Verify against the Megarevo datasheet before using for final cable or protection sizing.",
      recommendedFuseA: 250
    },
    {
      id: "dc_neg",
      portId: "dc",
      label: "Battery Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: true,
      maxCurrentA: 250
    },
    {
      id: "pv1_pos",
      portId: "pv1",
      label: "PV1 Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 26,
      maxVoltageV: 500
    },
    {
      id: "pv1_neg",
      portId: "pv1",
      label: "PV1 Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 26,
      maxVoltageV: 500
    },
    {
      id: "pv2_pos",
      portId: "pv2",
      label: "PV2 Positive",
      groupType: "power_conductor",
      polarity: "positive",
      internallyCommon: false,
      maxCurrentA: 26,
      maxVoltageV: 500
    },
    {
      id: "pv2_neg",
      portId: "pv2",
      label: "PV2 Negative",
      groupType: "power_conductor",
      polarity: "negative",
      internallyCommon: false,
      maxCurrentA: 26,
      maxVoltageV: 500
    },
    {
      id: "ac_grid_l1",
      portId: "ac_grid",
      label: "Grid L1",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false,
      maxCurrentA: 60
    },
    {
      id: "ac_grid_l2",
      portId: "ac_grid",
      label: "Grid L2",
      groupType: "power_conductor",
      polarity: "line2",
      internallyCommon: false,
      maxCurrentA: 60
    },
    {
      id: "ac_grid_n",
      portId: "ac_grid",
      label: "Grid Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false,
      maxCurrentA: 60
    },
    {
      id: "ac_gen_l1",
      portId: "ac_gen",
      label: "Generator L1",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false,
      maxCurrentA: 60
    },
    {
      id: "ac_gen_l2",
      portId: "ac_gen",
      label: "Generator L2",
      groupType: "power_conductor",
      polarity: "line2",
      internallyCommon: false,
      maxCurrentA: 60
    },
    {
      id: "ac_gen_n",
      portId: "ac_gen",
      label: "Generator Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false,
      maxCurrentA: 60
    },
    {
      id: "ac_out_l1",
      portId: "ac_out",
      label: "AC Output L1",
      groupType: "power_conductor",
      polarity: "line",
      internallyCommon: false,
      maxCurrentA: 50
    },
    {
      id: "ac_out_l2",
      portId: "ac_out",
      label: "AC Output L2",
      groupType: "power_conductor",
      polarity: "line2",
      internallyCommon: false,
      maxCurrentA: 50
    },
    {
      id: "ac_out_n",
      portId: "ac_out",
      label: "AC Output Neutral",
      groupType: "power_conductor",
      polarity: "neutral",
      internallyCommon: false,
      maxCurrentA: 50
    },
    {
      id: "comm_iface",
      portId: "comm",
      label: "Communication Interface",
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
      offsetX: -47,
      offsetY: 140,
      connector: {
        kind: "stud",
        holeSize: "M10"
      },
      notes: "Battery positive terminal."
    },
    {
      id: "dc_neg",
      terminalGroupId: "dc_neg",
      label: "DC-",
      side: "left",
      offsetX: -59,
      offsetY: 140,
      connector: {
        kind: "stud",
        holeSize: "M10"
      },
      notes: "Battery negative terminal."
    },
    {
      id: "pv1_pos",
      terminalGroupId: "pv1_pos",
      label: "PV1+",
      side: "top",
      offsetX: 79,
      offsetY: 34,
      maxCurrentA: 26,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "pv1_neg",
      terminalGroupId: "pv1_neg",
      label: "PV1-",
      side: "top",
      offsetX: 79,
      offsetY: 47,
      maxCurrentA: 26,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "pv2_pos",
      terminalGroupId: "pv2_pos",
      label: "PV2+",
      side: "top",
      offsetX: 79,
      offsetY: 9,
      maxCurrentA: 26,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "pv2_neg",
      terminalGroupId: "pv2_neg",
      label: "PV2-",
      side: "top",
      offsetX: 79,
      offsetY: 21,
      maxCurrentA: 26,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "comm",
      terminalGroupId: "comm_iface",
      label: "Comm",
      side: "top",
      offsetX: 20,
      offsetY: 140,
      connector: {
        kind: "comm"
      }
    },
    {
      id: "ac_grid_l1",
      terminalGroupId: "ac_grid_l1",
      label: "Grid L1",
      side: "right",
      offsetX: -32,
      offsetY: 140,
      maxCurrentA: 60,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "ac_grid_l2",
      terminalGroupId: "ac_grid_l2",
      label: "Grid L2",
      side: "right",
      offsetX: -21,
      offsetY: 140,
      maxCurrentA: 60,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "ac_grid_n",
      terminalGroupId: "ac_grid_n",
      label: "Grid N",
      side: "right",
      offsetX: -26,
      offsetY: 140,
      maxCurrentA: 60,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "ac_gen_l1",
      terminalGroupId: "ac_gen_l1",
      label: "Gen L1",
      side: "right",
      offsetX: -9,
      offsetY: 141,
      maxCurrentA: 60,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "ac_gen_l2",
      terminalGroupId: "ac_gen_l2",
      label: "Gen L2",
      side: "right",
      offsetX: 3,
      offsetY: 141,
      maxCurrentA: 60,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "ac_gen_n",
      terminalGroupId: "ac_gen_n",
      label: "Gen N",
      side: "right",
      offsetX: -3,
      offsetY: 141,
      maxCurrentA: 60,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "ac_out_l1",
      terminalGroupId: "ac_out_l1",
      label: "Out L1",
      side: "bottom",
      offsetX: 39,
      offsetY: 140,
      maxCurrentA: 50,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "ac_out_l2",
      terminalGroupId: "ac_out_l2",
      label: "Out L2",
      side: "bottom",
      offsetX: 56,
      offsetY: 140,
      maxCurrentA: 50,
      connector: {
        kind: "screw_terminal"
      }
    },
    {
      id: "ac_out_n",
      terminalGroupId: "ac_out_n",
      label: "Out N",
      side: "bottom",
      offsetX: 48,
      offsetY: 140,
      maxCurrentA: 50,
      connector: {
        kind: "screw_terminal"
      }
    }
  ],
  inverterChargerRatings: {
    dcVoltageV: 48,
    maxDcCurrentA: 250,
    continuousInverterW: 12000,
    chargerCurrentA: 200,
    acInputVoltageV: 240,
    acInputCurrentA: 60,
    acOutputVoltageV: 240,
    acOutputCurrentA: 50,
    transferSwitchA: 60,
    mpptTrackerCount: 2,
    maxPvVoltageV: 500,
    maxPvCurrentA: 26,
    maxPvPowerW: 12000
  },
  communicationPorts: [
    {
      id: "comm",
      name: "Communication",
      connectorType: "RJ45",
      supportedProtocols: [
        "Pylon LV"
      ],
      configuredProtocol: "Pylon LV",
      isConfigurable: true,
      notes: "Placeholder communication interface. Confirm supported protocols against the specific Megarevo model."
    }
  ],
  ports: [
    {
      id: "dc",
      kind: "dc",
      topology: "two_pole",
      label: "Battery DC",
      voltageClass: "dc_low_voltage",
      nominalVoltageV: 48,
      maxCurrentA: 250,
      role: "bidirectional",
      direction: "bidirectional"
    },
    {
      id: "pv1",
      kind: "pv",
      topology: "two_pole",
      label: "PV Tracker 1",
      voltageClass: "pv_high_voltage",
      voltageMaxV: 500,
      maxCurrentA: 26,
      maxPowerW: 6000,
      role: "sink",
      direction: "input"
    },
    {
      id: "pv2",
      kind: "pv",
      topology: "two_pole",
      label: "PV Tracker 2",
      voltageClass: "pv_high_voltage",
      voltageMaxV: 500,
      maxCurrentA: 26,
      maxPowerW: 6000,
      role: "sink",
      direction: "input"
    },
    {
      id: "ac_grid",
      kind: "ac",
      topology: "two_pole",
      label: "Grid AC Input",
      voltageClass: "ac_240v",
      nominalVoltageV: 240,
      maxCurrentA: 60,
      phases: 2,
      role: "sink",
      direction: "input"
    },
    {
      id: "ac_gen",
      kind: "ac",
      topology: "two_pole",
      label: "Generator AC Input",
      voltageClass: "ac_240v",
      nominalVoltageV: 240,
      maxCurrentA: 60,
      phases: 2,
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
      maxCurrentA: 50,
      phases: 2,
      role: "source",
      direction: "output"
    },
    {
      id: "comm",
      kind: "comm",
      topology: "two_pole",
      label: "Communication",
      role: "bidirectional",
      direction: "bidirectional",
      connectorType: "RJ45",
      supportedProtocols: [
        "Pylon LV",
        "BMS-Can",
        "RS485",
        "Other"
      ],
      configuredProtocol: "Pylon LV",
      isConfigurable: true
    }
  ],
  imageUrl: "/product-images/megarevo_hybrid_inverter.svg"
};

export default product;
