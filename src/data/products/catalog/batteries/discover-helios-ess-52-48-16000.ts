import type { Product } from '../../../../types/system';

const product: Product = {
  "id": "discover-helios-ess-52-48-16000",
  "manufacturer": "Discover Battery",
  "name": "HELIOS ESS 52-48-16000",
  "productType": "battery",
  "category": "Batteries",
  "nominalVoltage": 48,
  "capacityWh": 16080,
  "continuousPowerW": 10240,
  "peakPowerW": 19000,
  "maxCurrentA": 200,
  "msrpUsd": 3355,
  "productUrl": "https://www.cdnrg.com/products/renewable-energy/renewable-energy-batteries/helios",
  "description": "Discover HELIOS ESS DC-coupled lithium energy storage system for residential and light commercial applications, 51.2V/314Ah with 16.08 kWh usable capacity.",
  "partNumber": "52-48-16000",
  "sku": "900-0077",
  "source": "Discover HELIOS ESS datasheet 808-0046 Rev G",
  "dataQuality": "partial",
  "notes": "Datasheet lists quick-connect plug and pull terminals, 200A breaker, 10.24 kW continuous discharge, 19 kW peak power for 10 seconds, IP65 enclosure, and closed-loop CAN communication. Four DC+ / four DC- terminals are internally common (400A internal bus); each physical terminal is rated 250A.",
  "width": 76,
  "height": 144,
  "terminals": [
    {
      "id": "dc_pos_1",
      "label": "+",
      "side": "right",
      "offsetX": 38,
      "offsetY": -62,
      "maxCurrentA": 250,
      "terminalGroupId": "main_pos",
      "connector": {
        "kind": "helios_orng"
      },
      "notes": "DC positive output"
    },
    {
      "id": "dc_pos_2",
      "label": "+",
      "side": "right",
      "offsetX": 38,
      "offsetY": -55,
      "maxCurrentA": 250,
      "terminalGroupId": "main_pos",
      "connector": {
        "kind": "helios_orng"
      },
      "notes": "DC positive output"
    },
    {
      "id": "dc_pos_3",
      "label": "+",
      "side": "right",
      "offsetX": 38,
      "offsetY": -48,
      "maxCurrentA": 250,
      "terminalGroupId": "main_pos",
      "connector": {
        "kind": "helios_orng"
      },
      "notes": "DC positive output"
    },
    {
      "id": "dc_pos_4",
      "label": "+",
      "side": "right",
      "offsetX": 38,
      "offsetY": -41,
      "maxCurrentA": 250,
      "terminalGroupId": "main_pos",
      "connector": {
        "kind": "helios_orng"
      },
      "notes": "DC positive output"
    },
    {
      "id": "dc_neg_1",
      "label": "-",
      "side": "left",
      "offsetX": -38,
      "offsetY": -62,
      "maxCurrentA": 250,
      "terminalGroupId": "main_neg",
      "connector": {
        "kind": "helios_blk"
      },
      "notes": "DC negative output"
    },
    {
      "id": "dc_neg_2",
      "label": "-",
      "side": "left",
      "offsetX": -38,
      "offsetY": -55,
      "maxCurrentA": 250,
      "terminalGroupId": "main_neg",
      "connector": {
        "kind": "helios_blk"
      },
      "notes": "DC negative output"
    },
    {
      "id": "dc_neg_3",
      "label": "-",
      "side": "left",
      "offsetX": -38,
      "offsetY": -48,
      "maxCurrentA": 250,
      "terminalGroupId": "main_neg",
      "connector": {
        "kind": "helios_blk"
      },
      "notes": "DC negative output"
    },
    {
      "id": "dc_neg_4",
      "label": "-",
      "side": "left",
      "offsetX": -38,
      "offsetY": -41,
      "maxCurrentA": 250,
      "terminalGroupId": "main_neg",
      "connector": {
        "kind": "helios_blk"
      },
      "notes": "DC negative output"
    },
    {
      "id": "can_out",
      "label": "CAN",
      "side": "top",
      "offsetX": 3,
      "offsetY": -70,
      "terminalGroupId": "can_iface",
      "connector": {
        "kind": "comm"
      },
      "connectorType": "RJ45",
      "gender": "female"
    },
    {
      "id": "port_lynk_1",
      "label": "LYNK",
      "side": "top",
      "offsetX": 13,
      "offsetY": -70,
      "terminalGroupId": "lynk_iface",
      "connector": {
        "kind": "comm"
      },
      "connectorType": "RJ45",
      "gender": "female"
    },
    {
      "id": "port_lynk_2",
      "label": "LYNK",
      "side": "top",
      "offsetX": 23,
      "offsetY": -70,
      "terminalGroupId": "lynk_iface",
      "connector": {
        "kind": "comm"
      },
      "connectorType": "RJ45",
      "gender": "female"
    }
  ],
  "ports": [
    {
      "id": "main",
      "label": "Battery",
      "kind": "dc",
      "topology": "two_pole",
      "nominalVoltageV": 51.2,
      "voltageClass": "dc_low_voltage",
      "maxCurrentA": 400,
      "role": "bidirectional",
      "direction": "bidirectional"
    },
    {
      "id": "can_out",
      "kind": "comm",
      "label": "CAN Output",
      "topology": "two_pole",
      "role": "bidirectional",
      "direction": "bidirectional",
      "supportedProtocols": [
        "CANopen",
        "J1939",
        "VE.Can",
        "AEbus",
        "Pylon LV"
      ],
      "configuredProtocol": "CANopen",
      "isConfigurable": true
    },
    {
      "id": "port_lynk",
      "kind": "comm",
      "label": "LYNK",
      "topology": "two_pole",
      "role": "bidirectional",
      "direction": "bidirectional",
      "supportedProtocols": [
        "AEbus"
      ],
      "configuredProtocol": "AEbus"
    }
  ],
  "terminalGroups": [
    {
      "id": "main_pos",
      "portId": "main",
      "label": "DC Positive Common",
      "groupType": "power_conductor",
      "polarity": "positive",
      "internallyCommon": true,
      "maxCurrentA": 400,
      "integratedProtection": {
        "protectionType": "breaker",
        "currentRatingA": 200,
        "label": "Integrated 200A DC breaker",
        "notes": "One internal breaker feeds the shared DC+ terminal group."
      },
      "notes": "Four DC+ posts share one internal busbar rated 400A and are fed by one integrated 200A breaker; each post is rated 250A."
    },
    {
      "id": "main_neg",
      "portId": "main",
      "label": "DC Negative Common",
      "groupType": "power_conductor",
      "polarity": "negative",
      "internallyCommon": true,
      "maxCurrentA": 400,
      "notes": "Four DC- posts share one internal busbar rated 400A; each post is rated 250A."
    },
    {
      "id": "can_iface",
      "portId": "can_out",
      "label": "CAN Interface",
      "groupType": "communication_interface",
      "internallyCommon": true
    },
    {
      "id": "lynk_iface",
      "portId": "port_lynk",
      "label": "LYNK Interface",
      "groupType": "communication_interface",
      "internallyCommon": true
    }
  ],
  "batteryRatings": {
    "nominalVoltageV": 51.2,
    "capacityAh": 314,
    "capacityWh": 16080,
    "capacityKwh": 16.08,
    "maxChargeCurrentA": 200,
    "maxDischargeCurrentA": 200,
    "peakDischargeCurrentA": 300,
    "chargeVoltageV": 56.8,
    "cutoffVoltageV": 48,
    "chemistry": "LiFePO4",
    "communicationInterfaces": [
      "CAN"
    ],
    "hasInternalBms": true,
    "seriesAllowed": false,
    "parallelAllowed": true
  }
};

export default product;
