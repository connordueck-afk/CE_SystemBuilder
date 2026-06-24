// scripts/migrate-products.ts
import fs from "node:fs";
import path from "node:path";

// src/data/products/batteries.ts
function batteryTopPostTerminals(dischargeA, negativeOffsetX, positiveOffsetX, offsetY) {
  return [
    {
      id: "dc_pos",
      label: "+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "top",
      offsetX: positiveOffsetX,
      offsetY,
      domain: "dc",
      maxCurrentA: dischargeA,
      requiresOvercurrentProtection: true,
      notes: "DC positive terminal. Requires overcurrent protection (fuse/breaker) on the positive conductor."
    },
    {
      id: "dc_neg",
      label: "-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "top",
      offsetX: negativeOffsetX,
      offsetY,
      domain: "dc",
      maxCurrentA: dischargeA,
      notes: "DC negative terminal."
    }
  ];
}
function batteryTerminals(dischargeA) {
  return batteryTopPostTerminals(dischargeA, -20, 20, -50);
}
function victronLithiumBatteryTerminals(dischargeA) {
  return batteryTopPostTerminals(dischargeA, -41, 35, -45);
}
function discoverDlpBatteryTerminals(dischargeA) {
  return batteryTopPostTerminals(dischargeA, -26, 22, -45);
}
function discoverAesBatteryTerminals(dischargeA) {
  return batteryTopPostTerminals(dischargeA, -44, 44, -47);
}
function discoverHeliosTerminals(dischargeA) {
  return [
    {
      id: "dc_pos",
      label: "+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 38,
      offsetY: -55,
      domain: "dc",
      maxCurrentA: dischargeA,
      requiresOvercurrentProtection: true,
      notes: "DC positive output. Confirm actual Helios field terminal location and protection requirements."
    },
    {
      id: "dc_neg",
      label: "-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -38,
      offsetY: -55,
      domain: "dc",
      maxCurrentA: dischargeA,
      notes: "DC negative output. Confirm actual Helios field terminal location."
    }
  ];
}
var batteries = [
  // ----------------------------------------------------------
  // Victron SmartLithium 12.8V / 100Ah
  // ----------------------------------------------------------
  {
    id: "bat-vic-smart-12-100",
    manufacturer: "Victron",
    name: "SmartLithium 12.8V/100Ah",
    productType: "battery",
    category: "Batteries",
    nominalVoltage: 12,
    capacityWh: 1280,
    maxCurrentA: 200,
    msrpUsd: 1199,
    oemPriceUsd: 839,
    description: "Victron SmartLithium 12.8V 100Ah LiFePO4 battery with integrated BMS",
    partNumber: "BAT512110610",
    productUrl: "https://www.victronenergy.com/batteries/lithium-battery-12-8v",
    source: "Victron 2024",
    dataQuality: "partial",
    width: 128,
    height: 98,
    terminals: victronLithiumBatteryTerminals(200),
    batteryRatings: {
      nominalVoltageV: 12.8,
      capacityAh: 100,
      capacityWh: 1280,
      capacityKwh: 1.28,
      maxChargeCurrentA: 100,
      maxDischargeCurrentA: 200,
      peakDischargeCurrentA: 400,
      chargeVoltageV: 14.2,
      cutoffVoltageV: 10,
      chemistry: "LiFePO4",
      communicationInterfaces: ["VE.Bus", "CANbus"],
      hasInternalBms: true,
      seriesAllowed: false,
      parallelAllowed: true
    }
  },
  // ----------------------------------------------------------
  // Victron SmartLithium 12.8V / 200Ah
  // ----------------------------------------------------------
  {
    id: "bat-vic-smart-12-200",
    manufacturer: "Victron",
    name: "SmartLithium 12.8V/200Ah",
    productType: "battery",
    category: "Batteries",
    nominalVoltage: 12,
    capacityWh: 2560,
    maxCurrentA: 300,
    msrpUsd: 2199,
    oemPriceUsd: 1539,
    description: "Victron SmartLithium 12.8V 200Ah LiFePO4 battery with integrated BMS",
    partNumber: "BAT512120410",
    productUrl: "https://www.victronenergy.com/batteries/lithium-battery-12-8v",
    source: "Victron 2024",
    dataQuality: "partial",
    width: 128,
    height: 98,
    terminals: victronLithiumBatteryTerminals(300),
    batteryRatings: {
      nominalVoltageV: 12.8,
      capacityAh: 200,
      capacityWh: 2560,
      capacityKwh: 2.56,
      maxChargeCurrentA: 200,
      maxDischargeCurrentA: 300,
      peakDischargeCurrentA: 600,
      chargeVoltageV: 14.2,
      cutoffVoltageV: 10,
      chemistry: "LiFePO4",
      communicationInterfaces: ["VE.Bus", "CANbus"],
      hasInternalBms: true,
      seriesAllowed: false,
      parallelAllowed: true
    }
  },
  // ----------------------------------------------------------
  // Victron SmartLithium 25.6V / 100Ah
  // ----------------------------------------------------------
  {
    id: "bat-vic-smart-24-100",
    manufacturer: "Victron",
    name: "SmartLithium 25.6V/100Ah",
    productType: "battery",
    category: "Batteries",
    nominalVoltage: 24,
    capacityWh: 2560,
    maxCurrentA: 200,
    msrpUsd: 2399,
    oemPriceUsd: 1679,
    description: "Victron SmartLithium 25.6V 100Ah LiFePO4 battery with integrated BMS",
    partNumber: "BAT524110610",
    productUrl: "https://www.victronenergy.com/batteries/lithium-battery-25-6v",
    source: "Victron 2024",
    dataQuality: "partial",
    width: 128,
    height: 98,
    terminals: victronLithiumBatteryTerminals(200),
    batteryRatings: {
      nominalVoltageV: 25.6,
      capacityAh: 100,
      capacityWh: 2560,
      capacityKwh: 2.56,
      maxChargeCurrentA: 100,
      maxDischargeCurrentA: 200,
      peakDischargeCurrentA: 400,
      chargeVoltageV: 28.4,
      cutoffVoltageV: 20,
      chemistry: "LiFePO4",
      communicationInterfaces: ["VE.Bus", "CANbus"],
      hasInternalBms: true,
      seriesAllowed: false,
      parallelAllowed: true
    }
  },
  // ----------------------------------------------------------
  // Victron SmartLithium 51.2V / 100Ah
  // ----------------------------------------------------------
  {
    id: "bat-vic-smart-48-100",
    manufacturer: "Victron",
    name: "SmartLithium 51.2V/100Ah",
    productType: "battery",
    category: "Batteries",
    nominalVoltage: 48,
    capacityWh: 5120,
    maxCurrentA: 200,
    msrpUsd: 3499,
    oemPriceUsd: 2449,
    description: "Victron SmartLithium 51.2V 100Ah LiFePO4 battery with integrated BMS",
    partNumber: "BAT548110610",
    productUrl: "https://www.victronenergy.com/batteries/lithium-battery-51-2v",
    source: "Victron 2024",
    dataQuality: "partial",
    width: 128,
    height: 98,
    terminals: victronLithiumBatteryTerminals(200),
    batteryRatings: {
      nominalVoltageV: 51.2,
      capacityAh: 100,
      capacityWh: 5120,
      capacityKwh: 5.12,
      maxChargeCurrentA: 100,
      maxDischargeCurrentA: 200,
      peakDischargeCurrentA: 400,
      chargeVoltageV: 56.8,
      cutoffVoltageV: 40,
      chemistry: "LiFePO4",
      communicationInterfaces: ["VE.Bus", "CANbus"],
      hasInternalBms: true,
      seriesAllowed: false,
      parallelAllowed: true
    }
  },
  // ==========================================================
  // Victron Lithium NG Series (Next Generation)
  // ==========================================================
  {
    id: "victron-lithium-ng-12-100",
    manufacturer: "Victron",
    name: "Lithium Battery NG 12.8V/100Ah",
    productType: "battery",
    category: "Batteries",
    nominalVoltage: 12,
    capacityWh: 1280,
    maxCurrentA: 200,
    msrpUsd: 1200,
    description: "Lithium NG battery 12.8V/100Ah \u2014 next-generation Victron lithium with VE.Bus BMS NG / Lynx Smart BMS NG integration",
    partNumber: "BAT512110610",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 128,
    height: 98,
    terminals: victronLithiumBatteryTerminals(200),
    batteryRatings: {
      nominalVoltageV: 12.8,
      capacityAh: 100,
      capacityWh: 1280,
      capacityKwh: 1.28,
      maxDischargeCurrentA: 200,
      chemistry: "LiFePO4",
      communicationInterfaces: ["VE.Bus BMS NG", "Lynx Smart BMS NG"],
      hasInternalBms: true,
      seriesAllowed: false,
      parallelAllowed: true
    }
  },
  {
    id: "victron-lithium-ng-12-200",
    manufacturer: "Victron",
    name: "Lithium Battery NG 12.8V/200Ah",
    productType: "battery",
    category: "Batteries",
    nominalVoltage: 12,
    capacityWh: 2560,
    maxCurrentA: 300,
    msrpUsd: 2200,
    description: "Lithium NG battery 12.8V/200Ah \u2014 next-generation Victron lithium with VE.Bus BMS NG / Lynx Smart BMS NG integration",
    partNumber: "BAT512120610",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 128,
    height: 98,
    terminals: victronLithiumBatteryTerminals(300),
    batteryRatings: {
      nominalVoltageV: 12.8,
      capacityAh: 200,
      capacityWh: 2560,
      capacityKwh: 2.56,
      maxDischargeCurrentA: 300,
      chemistry: "LiFePO4",
      communicationInterfaces: ["VE.Bus BMS NG", "Lynx Smart BMS NG"],
      hasInternalBms: true,
      seriesAllowed: false,
      parallelAllowed: true
    }
  },
  {
    id: "victron-lithium-ng-25-100",
    manufacturer: "Victron",
    name: "Lithium Battery NG 25.6V/100Ah",
    productType: "battery",
    category: "Batteries",
    nominalVoltage: 24,
    capacityWh: 2560,
    maxCurrentA: 200,
    msrpUsd: 2300,
    description: "Lithium NG battery 25.6V/100Ah \u2014 next-generation Victron lithium with VE.Bus BMS NG / Lynx Smart BMS NG integration",
    partNumber: "BAT524110610",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 128,
    height: 98,
    terminals: victronLithiumBatteryTerminals(200),
    batteryRatings: {
      nominalVoltageV: 25.6,
      capacityAh: 100,
      capacityWh: 2560,
      capacityKwh: 2.56,
      maxDischargeCurrentA: 200,
      chemistry: "LiFePO4",
      communicationInterfaces: ["VE.Bus BMS NG", "Lynx Smart BMS NG"],
      hasInternalBms: true,
      seriesAllowed: false,
      parallelAllowed: true
    }
  },
  {
    id: "victron-lithium-ng-51-100",
    manufacturer: "Victron",
    name: "Lithium Battery NG 51.2V/100Ah",
    productType: "battery",
    category: "Batteries",
    nominalVoltage: 48,
    capacityWh: 5120,
    maxCurrentA: 200,
    msrpUsd: 4200,
    description: "Lithium NG battery 51.2V/100Ah \u2014 next-generation Victron lithium with VE.Bus BMS NG / Lynx Smart BMS NG integration",
    partNumber: "BAT548110610",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 128,
    height: 98,
    terminals: victronLithiumBatteryTerminals(200),
    batteryRatings: {
      nominalVoltageV: 51.2,
      capacityAh: 100,
      capacityWh: 5120,
      capacityKwh: 5.12,
      maxDischargeCurrentA: 200,
      chemistry: "LiFePO4",
      communicationInterfaces: ["VE.Bus BMS NG", "Lynx Smart BMS NG"],
      hasInternalBms: true,
      seriesAllowed: false,
      parallelAllowed: true
    }
  },
  // ==========================================================
  // Discover Battery — AES Rackmount LiFePO4
  // ==========================================================
  {
    id: "discover-aes-rackmount-48-42-5120",
    manufacturer: "Discover Battery",
    name: "AES Rackmount 51.2V/100Ah",
    productType: "battery",
    category: "Batteries",
    nominalVoltage: 48,
    capacityWh: 5120,
    maxCurrentA: 100,
    msrpUsd: 3400,
    description: "Discover AES Rackmount LiFePO4 battery 51.2V/100Ah \u2014 CAN/RS485 communication. Confirm communication profile and closed-loop compatibility per inverter setup.",
    partNumber: "48-42-5120",
    productUrl: "https://www.cdnrg.com/products/48-48-5120-h",
    source: "Discover Battery 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs. Confirm communication profile and closed-loop compatibility per inverter setup.",
    width: 80,
    height: 100,
    terminals: batteryTerminals(100),
    batteryRatings: {
      nominalVoltageV: 51.2,
      capacityAh: 100,
      capacityWh: 5120,
      capacityKwh: 5.12,
      maxDischargeCurrentA: 100,
      chemistry: "LiFePO4",
      communicationInterfaces: ["CAN", "RS485"],
      hasInternalBms: true,
      seriesAllowed: false,
      parallelAllowed: true
    }
  },
  // ==========================================================
  // Discover Battery — Helios Energy Storage System
  // ==========================================================
  {
    id: "discover-helios-ess-52-48-16000",
    manufacturer: "Discover Battery",
    name: "HELIOS ESS 52-48-16000",
    productType: "battery",
    category: "Batteries",
    nominalVoltage: 48,
    capacityWh: 16080,
    continuousPowerW: 10240,
    peakPowerW: 19e3,
    maxCurrentA: 200,
    msrpUsd: 3355,
    productUrl: "https://www.cdnrg.com/products/renewable-energy/renewable-energy-batteries/helios",
    description: "Discover HELIOS ESS DC-coupled lithium energy storage system for residential and light commercial applications, 51.2V/314Ah with 16.08 kWh usable capacity.",
    partNumber: "52-48-16000",
    sku: "900-0077",
    source: "Discover HELIOS ESS datasheet 808-0046 Rev G",
    dataQuality: "partial",
    notes: "Datasheet lists quick-connect plug and pull terminals, 200A breaker, 10.24 kW continuous discharge, 19 kW peak power for 10 seconds, IP65 enclosure, and closed-loop CAN communication. Confirm inverter compatibility and installation requirements.",
    width: 76,
    height: 144,
    terminals: discoverHeliosTerminals(200),
    batteryRatings: {
      nominalVoltageV: 51.2,
      capacityAh: 314,
      capacityWh: 16080,
      capacityKwh: 16.08,
      maxChargeCurrentA: 200,
      maxDischargeCurrentA: 200,
      peakDischargeCurrentA: 300,
      chargeVoltageV: 56.8,
      cutoffVoltageV: 48,
      chemistry: "LiFePO4",
      communicationInterfaces: ["CAN"],
      hasInternalBms: true,
      seriesAllowed: false,
      parallelAllowed: true
    }
  },
  // ==========================================================
  // Discover Battery — AES-B LiFePO4 Series
  // ==========================================================
  {
    id: "discover-aes-lithium-12-200",
    manufacturer: "Discover Battery",
    name: "AES-B LiFePO4 12.8V/200Ah",
    productType: "battery",
    category: "Batteries",
    nominalVoltage: 12,
    capacityWh: 2560,
    maxCurrentA: 200,
    msrpUsd: 1495,
    description: "Discover AES-B LiFePO4 battery 12.8V/200Ah",
    partNumber: "AES-B-GC2-12V-H",
    productUrl: "https://www.cdnrg.com/products/aes-b-gc12-12v-h",
    source: "Discover Battery 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 112,
    height: 98,
    terminals: discoverAesBatteryTerminals(200),
    batteryRatings: {
      nominalVoltageV: 12.8,
      capacityAh: 200,
      capacityWh: 2560,
      capacityKwh: 2.56,
      maxDischargeCurrentA: 200,
      chemistry: "LiFePO4",
      hasInternalBms: true,
      seriesAllowed: false,
      parallelAllowed: true
    }
  },
  {
    id: "discover-aes-lithium-24-100",
    manufacturer: "Discover Battery",
    name: "AES-B LiFePO4 25.6V/100Ah",
    productType: "battery",
    category: "Batteries",
    nominalVoltage: 24,
    capacityWh: 2560,
    maxCurrentA: 100,
    msrpUsd: 1495,
    description: "Discover AES-B LiFePO4 battery 25.6V/100Ah",
    partNumber: "AES-B-GC2-24V",
    productUrl: "https://www.cdnrg.com/products/aes-b-gc12-24v",
    source: "Discover Battery 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 112,
    height: 98,
    terminals: discoverAesBatteryTerminals(100),
    batteryRatings: {
      nominalVoltageV: 25.6,
      capacityAh: 100,
      capacityWh: 2560,
      capacityKwh: 2.56,
      maxDischargeCurrentA: 100,
      chemistry: "LiFePO4",
      hasInternalBms: true,
      seriesAllowed: false,
      parallelAllowed: true
    }
  },
  // ==========================================================
  // Discover Battery — DLP-GC2 Series
  // ==========================================================
  {
    id: "discover-dlp-lithium-12-120",
    manufacturer: "Discover Battery",
    name: "DLP-GC2 12.8V/120Ah",
    productType: "battery",
    category: "Batteries",
    nominalVoltage: 12,
    capacityWh: 1536,
    maxCurrentA: 120,
    msrpUsd: 1250,
    description: "Discover DLP-GC2 battery 12.8V/120Ah with CAN communication",
    partNumber: "DLP-GC2-12V",
    productUrl: "https://www.cdnrg.com/products/dlp-gc2-12v",
    source: "Discover Battery 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 92,
    height: 98,
    terminals: discoverDlpBatteryTerminals(120),
    batteryRatings: {
      nominalVoltageV: 12.8,
      capacityAh: 120,
      capacityWh: 1536,
      capacityKwh: 1.54,
      maxDischargeCurrentA: 120,
      chemistry: "LiFePO4",
      communicationInterfaces: ["CAN"],
      hasInternalBms: true,
      seriesAllowed: false,
      parallelAllowed: true
    }
  },
  {
    id: "discover-dlp-lithium-24-60",
    manufacturer: "Discover Battery",
    name: "DLP-GC2 25.6V/60Ah",
    productType: "battery",
    category: "Batteries",
    nominalVoltage: 24,
    capacityWh: 1536,
    maxCurrentA: 60,
    msrpUsd: 1250,
    description: "Discover DLP-GC2 battery 25.6V/60Ah with CAN communication",
    partNumber: "DLP-GC2-24V",
    productUrl: "https://www.cdnrg.com/products/dlp-gc2-24v",
    source: "Discover Battery 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 92,
    height: 98,
    terminals: discoverDlpBatteryTerminals(60),
    batteryRatings: {
      nominalVoltageV: 25.6,
      capacityAh: 60,
      capacityWh: 1536,
      capacityKwh: 1.54,
      maxDischargeCurrentA: 60,
      chemistry: "LiFePO4",
      communicationInterfaces: ["CAN"],
      hasInternalBms: true,
      seriesAllowed: false,
      parallelAllowed: true
    }
  },
  {
    id: "discover-dlp-lithium-48-30",
    manufacturer: "Discover Battery",
    name: "DLP-GC2 51.2V/30Ah",
    productType: "battery",
    category: "Batteries",
    nominalVoltage: 48,
    capacityWh: 1536,
    maxCurrentA: 30,
    msrpUsd: 1250,
    description: "Discover DLP-GC2 battery 51.2V/30Ah with CAN communication",
    partNumber: "DLP-GC2-48V",
    productUrl: "https://www.cdnrg.com/products/dlp-gc2-48v",
    source: "Discover Battery 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 92,
    height: 98,
    terminals: discoverDlpBatteryTerminals(30),
    batteryRatings: {
      nominalVoltageV: 51.2,
      capacityAh: 30,
      capacityWh: 1536,
      capacityKwh: 1.54,
      maxDischargeCurrentA: 30,
      chemistry: "LiFePO4",
      communicationInterfaces: ["CAN"],
      hasInternalBms: true,
      seriesAllowed: false,
      parallelAllowed: true
    }
  }
];

// src/data/products/mppts.ts
function mpptTerminals(pvCurrentA, outputCurrentA, maxPvPowerW) {
  return [
    {
      id: "pv_neg",
      label: "PV-",
      electricalType: "pv_neg",
      kind: "pv_power",
      polarity: "negative",
      role: "sink",
      direction: "input",
      voltageClass: "pv_high_voltage",
      side: "bottom",
      offsetX: -28,
      offsetY: 38,
      domain: "pv",
      maxCurrentA: pvCurrentA,
      notes: "PV array negative input."
    },
    {
      id: "pv_pos",
      label: "PV+",
      electricalType: "pv_pos",
      kind: "pv_power",
      polarity: "positive",
      role: "sink",
      direction: "input",
      voltageClass: "pv_high_voltage",
      side: "bottom",
      offsetX: -9,
      offsetY: 38,
      domain: "pv",
      maxCurrentA: pvCurrentA,
      requiresOvercurrentProtection: false,
      notes: "PV array positive input. Do not connect negative PV conductor to chassis."
    },
    {
      id: "bat_pos",
      label: "BAT+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 9,
      offsetY: 38,
      domain: "dc",
      maxCurrentA: outputCurrentA,
      maxPowerW: maxPvPowerW,
      requiresOvercurrentProtection: true,
      notes: "Battery positive terminal. Requires fuse on positive conductor between MPPT and busbar."
    },
    {
      id: "bat_neg",
      label: "BAT-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 28,
      offsetY: 38,
      domain: "dc",
      maxCurrentA: outputCurrentA,
      maxPowerW: maxPvPowerW,
      notes: "Battery negative terminal."
    }
  ];
}
var mppts = [
  // ----------------------------------------------------------
  // Victron SmartSolar MPPT 100/30
  // ----------------------------------------------------------
  {
    id: "mppt-vic-100-30",
    manufacturer: "Victron",
    name: "SmartSolar MPPT 100/30",
    productType: "mppt",
    category: "Charging",
    nominalVoltage: [12, 24],
    maxCurrentA: 30,
    maxPvVoltageV: 100,
    continuousPowerW: 440,
    msrpUsd: 199,
    oemPriceUsd: 139,
    description: "Victron SmartSolar MPPT 100V 30A charge controller",
    partNumber: "SCC110030210",
    productUrl: "https://www.cdnrg.com/products/vescc110030210",
    source: "Victron 2024",
    dataQuality: "partial",
    imageUrl: "/product-images/victron-smartsolar-mppt.svg",
    width: 80,
    height: 112,
    terminals: mpptTerminals(30, 30, 440),
    mpptRatings: {
      batteryVoltagesV: [12, 24],
      maxPvVoltageV: 100,
      maxPvCurrentA: 30,
      maxOutputCurrentA: 30,
      maxPvPowerW: 440,
      efficiencyPct: 98
    }
  },
  // ----------------------------------------------------------
  // Victron SmartSolar MPPT 150/60
  // ----------------------------------------------------------
  {
    id: "mppt-vic-150-60",
    manufacturer: "Victron",
    name: "SmartSolar MPPT 150/60",
    productType: "mppt",
    category: "Charging",
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 60,
    maxPvVoltageV: 150,
    continuousPowerW: 880,
    msrpUsd: 379,
    oemPriceUsd: 265,
    description: "Victron SmartSolar MPPT 150V 60A charge controller",
    partNumber: "SCC115060210",
    productUrl: "https://www.cdnrg.com/products/vescc115060310",
    source: "Victron 2024",
    dataQuality: "partial",
    imageUrl: "/product-images/victron-smartsolar-mppt.svg",
    width: 80,
    height: 112,
    terminals: mpptTerminals(60, 60, 880),
    mpptRatings: {
      batteryVoltagesV: [12, 24, 48],
      maxPvVoltageV: 150,
      maxPvCurrentA: 60,
      maxOutputCurrentA: 60,
      maxPvPowerW: 880,
      efficiencyPct: 98
    }
  },
  // ----------------------------------------------------------
  // Victron SmartSolar MPPT 150/100
  // ----------------------------------------------------------
  {
    id: "mppt-vic-150-100",
    manufacturer: "Victron",
    name: "SmartSolar MPPT 150/100",
    productType: "mppt",
    category: "Charging",
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 100,
    maxPvVoltageV: 150,
    continuousPowerW: 1450,
    msrpUsd: 549,
    oemPriceUsd: 384,
    description: "Victron SmartSolar MPPT 150V 100A charge controller",
    partNumber: "SCC115110210",
    productUrl: "https://www.victronenergy.com/solar-charge-controllers/smartsolar-mppt-150-100",
    source: "Victron 2024",
    dataQuality: "partial",
    imageUrl: "/product-images/victron-smartsolar-mppt.svg",
    width: 80,
    height: 112,
    terminals: mpptTerminals(100, 100, 1450),
    mpptRatings: {
      batteryVoltagesV: [12, 24, 48],
      maxPvVoltageV: 150,
      maxPvCurrentA: 100,
      maxOutputCurrentA: 100,
      maxPvPowerW: 1450,
      efficiencyPct: 98
    }
  },
  // ----------------------------------------------------------
  // Victron SmartSolar MPPT 250/100
  // ----------------------------------------------------------
  {
    id: "mppt-vic-250-100",
    manufacturer: "Victron",
    name: "SmartSolar MPPT 250/100",
    productType: "mppt",
    category: "Charging",
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 100,
    maxPvVoltageV: 250,
    continuousPowerW: 1450,
    msrpUsd: 699,
    oemPriceUsd: 489,
    description: "Victron SmartSolar MPPT 250V 100A charge controller \uFFFD flagship model",
    partNumber: "SCC125110210",
    productUrl: "https://www.cdnrg.com/products/vevescc125110441",
    source: "Victron 2024",
    dataQuality: "partial",
    imageUrl: "/product-images/victron-smartsolar-mppt.svg",
    width: 80,
    height: 112,
    terminals: mpptTerminals(100, 100, 1450),
    mpptRatings: {
      batteryVoltagesV: [12, 24, 48],
      maxPvVoltageV: 250,
      maxPvCurrentA: 100,
      maxOutputCurrentA: 100,
      maxPvPowerW: 1450,
      efficiencyPct: 98
    }
  },
  // ==========================================================
  // Additional SmartSolar MPPT Models (from Victron 2025 catalog)
  // ==========================================================
  {
    id: "mppt-75-15",
    manufacturer: "Victron",
    name: "SmartSolar MPPT 75/15",
    productType: "mppt",
    category: "Charging",
    nominalVoltage: [12, 24],
    maxCurrentA: 15,
    maxPvVoltageV: 75,
    continuousPowerW: 440,
    msrpUsd: 78,
    description: "Victron SmartSolar MPPT 75V/15A charge controller with Bluetooth",
    partNumber: "SCC075015060R",
    productUrl: "https://www.cdnrg.com/products/vescc075015060r",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    imageUrl: "/product-images/victron-smartsolar-mppt.svg",
    width: 80,
    height: 112,
    terminals: mpptTerminals(15, 15, 440),
    mpptRatings: {
      batteryVoltagesV: [12, 24],
      maxPvVoltageV: 75,
      maxPvCurrentA: 15,
      maxOutputCurrentA: 15,
      maxPvPowerW: 440,
      efficiencyPct: 98
    }
  },
  {
    id: "mppt-100-20",
    manufacturer: "Victron",
    name: "SmartSolar MPPT 100/20",
    productType: "mppt",
    category: "Charging",
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 20,
    maxPvVoltageV: 100,
    continuousPowerW: 1160,
    msrpUsd: 110,
    description: "Victron SmartSolar MPPT 100V/20A charge controller with Bluetooth",
    partNumber: "SCC110020160R",
    productUrl: "https://www.cdnrg.com/products/vescc110020160r",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    imageUrl: "/product-images/victron-smartsolar-mppt.svg",
    width: 80,
    height: 112,
    terminals: mpptTerminals(20, 20, 1160),
    mpptRatings: {
      batteryVoltagesV: [12, 24, 48],
      maxPvVoltageV: 100,
      maxPvCurrentA: 20,
      maxOutputCurrentA: 20,
      maxPvPowerW: 1160,
      efficiencyPct: 98
    }
  },
  {
    id: "mppt-100-50",
    manufacturer: "Victron",
    name: "SmartSolar MPPT 100/50",
    productType: "mppt",
    category: "Charging",
    nominalVoltage: [12, 24],
    maxCurrentA: 50,
    maxPvVoltageV: 100,
    continuousPowerW: 1400,
    msrpUsd: 226,
    description: "Victron SmartSolar MPPT 100V/50A charge controller with Bluetooth",
    partNumber: "SCC110050210",
    productUrl: "https://www.cdnrg.com/products/vescc110050210",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    imageUrl: "/product-images/victron-smartsolar-mppt.svg",
    width: 80,
    height: 112,
    terminals: mpptTerminals(50, 50, 1400),
    mpptRatings: {
      batteryVoltagesV: [12, 24],
      maxPvVoltageV: 100,
      maxPvCurrentA: 50,
      maxOutputCurrentA: 50,
      maxPvPowerW: 1400,
      efficiencyPct: 98
    }
  },
  {
    id: "mppt-150-35",
    manufacturer: "Victron",
    name: "SmartSolar MPPT 150/35",
    productType: "mppt",
    category: "Charging",
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 35,
    maxPvVoltageV: 150,
    continuousPowerW: 2e3,
    msrpUsd: 226,
    description: "Victron SmartSolar MPPT 150V/35A charge controller with Bluetooth",
    partNumber: "SCC115035210",
    productUrl: "https://www.cdnrg.com/products/vescc115035210",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    imageUrl: "/product-images/victron-smartsolar-mppt.svg",
    width: 80,
    height: 112,
    terminals: mpptTerminals(35, 35, 2e3),
    mpptRatings: {
      batteryVoltagesV: [12, 24, 48],
      maxPvVoltageV: 150,
      maxPvCurrentA: 35,
      maxOutputCurrentA: 35,
      maxPvPowerW: 2e3,
      efficiencyPct: 98
    }
  },
  {
    id: "mppt-150-45",
    manufacturer: "Victron",
    name: "SmartSolar MPPT 150/45",
    productType: "mppt",
    category: "Charging",
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 45,
    maxPvVoltageV: 150,
    continuousPowerW: 2600,
    msrpUsd: 267,
    description: "Victron SmartSolar MPPT 150V/45A charge controller with VE.Direct and Bluetooth",
    partNumber: "SCC115045212",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    imageUrl: "/product-images/victron-smartsolar-mppt.svg",
    width: 80,
    height: 112,
    terminals: mpptTerminals(45, 45, 2600),
    mpptRatings: {
      batteryVoltagesV: [12, 24, 48],
      maxPvVoltageV: 150,
      maxPvCurrentA: 45,
      maxOutputCurrentA: 45,
      maxPvPowerW: 2600,
      efficiencyPct: 98
    }
  },
  {
    id: "mppt-150-70",
    manufacturer: "Victron",
    name: "SmartSolar MPPT 150/70",
    productType: "mppt",
    category: "Charging",
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 70,
    maxPvVoltageV: 150,
    continuousPowerW: 4e3,
    msrpUsd: 469,
    description: "Victron SmartSolar MPPT 150V/70A charge controller with VE.Can and Bluetooth",
    partNumber: "SCC115070211",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    imageUrl: "/product-images/victron-smartsolar-mppt.svg",
    width: 80,
    height: 112,
    terminals: mpptTerminals(70, 70, 4e3),
    mpptRatings: {
      batteryVoltagesV: [12, 24, 48],
      maxPvVoltageV: 150,
      maxPvCurrentA: 70,
      maxOutputCurrentA: 70,
      maxPvPowerW: 4e3,
      efficiencyPct: 98
    }
  },
  {
    id: "mppt-150-85",
    manufacturer: "Victron",
    name: "SmartSolar MPPT 150/85",
    productType: "mppt",
    category: "Charging",
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 85,
    maxPvVoltageV: 150,
    continuousPowerW: 4900,
    msrpUsd: 554,
    description: "Victron SmartSolar MPPT 150V/85A charge controller with VE.Can and Bluetooth",
    partNumber: "SCC115085411",
    productUrl: "https://www.cdnrg.com/products/vescc115085311",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    imageUrl: "/product-images/victron-smartsolar-mppt.svg",
    width: 80,
    height: 112,
    terminals: mpptTerminals(85, 85, 4900),
    mpptRatings: {
      batteryVoltagesV: [12, 24, 48],
      maxPvVoltageV: 150,
      maxPvCurrentA: 85,
      maxOutputCurrentA: 85,
      maxPvPowerW: 4900,
      efficiencyPct: 98
    }
  },
  {
    id: "mppt-250-70",
    manufacturer: "Victron",
    name: "SmartSolar MPPT 250/70",
    productType: "mppt",
    category: "Charging",
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 70,
    maxPvVoltageV: 250,
    continuousPowerW: 4e3,
    msrpUsd: 625,
    description: "Victron SmartSolar MPPT 250V/70A charge controller with VE.Can and Bluetooth",
    partNumber: "SCC125070421",
    productUrl: "https://www.cdnrg.com/products/vescc125070421",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    imageUrl: "/product-images/victron-smartsolar-mppt.svg",
    width: 80,
    height: 112,
    terminals: mpptTerminals(70, 70, 4e3),
    mpptRatings: {
      batteryVoltagesV: [12, 24, 48],
      maxPvVoltageV: 250,
      maxPvCurrentA: 70,
      maxOutputCurrentA: 70,
      maxPvPowerW: 4e3,
      efficiencyPct: 98
    }
  }
];

// src/data/products/inverterChargers.ts
function multiPlusTerminals(acInputCurrentA, acOutputCurrentA) {
  return [
    {
      id: "dc_pos",
      label: "DC+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -20,
      offsetY: 48,
      domain: "dc",
      requiresOvercurrentProtection: true,
      notes: "DC positive bus connection. Requires Class T or ANL fuse between battery and inverter."
    },
    {
      id: "dc_neg",
      label: "DC-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -12,
      offsetY: 48,
      domain: "dc",
      notes: "DC negative bus connection."
    },
    {
      id: "ac_in_l",
      label: "AC In L",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "sink",
      direction: "input",
      voltageClass: "ac_120v",
      side: "bottom",
      offsetX: 2,
      offsetY: 48,
      domain: "ac",
      phases: 1,
      maxCurrentA: acInputCurrentA,
      notes: "AC input Line conductor (shore power or generator)."
    },
    {
      id: "ac_in_n",
      label: "AC In N",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "neutral",
      role: "sink",
      direction: "input",
      voltageClass: "ac_120v",
      side: "bottom",
      offsetX: 9,
      offsetY: 48,
      domain: "ac",
      maxCurrentA: acInputCurrentA,
      notes: "AC input Neutral conductor."
    },
    {
      id: "ac_out_l",
      label: "AC Out L",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "source",
      direction: "output",
      voltageClass: "ac_120v",
      side: "bottom",
      offsetX: 16,
      offsetY: 48,
      domain: "ac",
      phases: 1,
      maxCurrentA: acOutputCurrentA,
      notes: "AC output Line conductor to AC distribution panel."
    },
    {
      id: "ac_out_n",
      label: "AC Out N",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "neutral",
      role: "source",
      direction: "output",
      voltageClass: "ac_120v",
      side: "bottom",
      offsetX: 23,
      offsetY: 48,
      domain: "ac",
      maxCurrentA: acOutputCurrentA,
      notes: "AC output Neutral conductor."
    }
  ];
}
function quattroTerminals(acInputCurrentA, acOutputCurrentA) {
  return [
    ...multiPlusTerminals(acInputCurrentA, acOutputCurrentA),
    {
      id: "ac_in2_l",
      label: "AC In 2 L",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "sink",
      direction: "input",
      voltageClass: "ac_120v",
      side: "top",
      offsetX: -4,
      offsetY: -48,
      domain: "ac",
      phases: 1,
      maxCurrentA: acInputCurrentA,
      notes: "AC input 2 Line conductor (generator or second grid supply)."
    },
    {
      id: "ac_in2_n",
      label: "AC In 2 N",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "neutral",
      role: "sink",
      direction: "input",
      voltageClass: "ac_120v",
      side: "top",
      offsetX: 3,
      offsetY: -48,
      domain: "ac",
      maxCurrentA: acInputCurrentA,
      notes: "AC input 2 Neutral conductor."
    }
  ];
}
var inverterChargers = [
  // ----------------------------------------------------------
  // Victron MultiPlus-II 12/3000/120-50
  // ----------------------------------------------------------
  {
    id: "inv-vic-mp2-12-3000",
    manufacturer: "Victron",
    name: "MultiPlus-II 12/3000/120-50",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 12,
    continuousPowerW: 3e3,
    peakPowerW: 6e3,
    maxCurrentA: 250,
    msrpUsd: 1699,
    oemPriceUsd: 1189,
    description: "Victron MultiPlus-II 12V 3000W inverter/charger with 120A charger",
    partNumber: "EAS010300114",
    productUrl: "https://www.victronenergy.com/inverters-chargers/multiplus-ii",
    source: "Victron 2024",
    dataQuality: "partial",
    width: 90,
    height: 130,
    terminals: multiPlusTerminals(50, 25),
    inverterChargerRatings: {
      dcVoltageV: 12,
      maxDcCurrentA: 250,
      continuousInverterW: 3e3,
      surgeW: 6e3,
      chargerCurrentA: 120,
      acInputVoltageV: 120,
      acInputCurrentA: 50,
      acOutputVoltageV: 120,
      acOutputCurrentA: 25,
      transferSwitchA: 50,
      efficiencyPct: 94
    }
  },
  // ----------------------------------------------------------
  // Victron MultiPlus-II 24/3000/70-50
  // ----------------------------------------------------------
  {
    id: "inv-vic-mp2-24-3000",
    manufacturer: "Victron",
    name: "MultiPlus-II 24/3000/70-50",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 24,
    continuousPowerW: 3e3,
    peakPowerW: 6e3,
    maxCurrentA: 130,
    msrpUsd: 1649,
    oemPriceUsd: 1154,
    description: "Victron MultiPlus-II 24V 3000W inverter/charger with 70A charger",
    partNumber: "EAS024300114",
    productUrl: "https://www.victronenergy.com/inverters-chargers/multiplus-ii",
    source: "Victron 2024",
    dataQuality: "partial",
    width: 90,
    height: 130,
    terminals: multiPlusTerminals(50, 25),
    inverterChargerRatings: {
      dcVoltageV: 24,
      maxDcCurrentA: 130,
      continuousInverterW: 3e3,
      surgeW: 6e3,
      chargerCurrentA: 70,
      acInputVoltageV: 120,
      acInputCurrentA: 50,
      acOutputVoltageV: 120,
      acOutputCurrentA: 25,
      transferSwitchA: 50,
      efficiencyPct: 94
    }
  },
  // ----------------------------------------------------------
  // Victron MultiPlus-II 48/5000/70-50
  // ----------------------------------------------------------
  {
    id: "inv-vic-mp2-48-5000",
    manufacturer: "Victron",
    name: "MultiPlus-II 48/5000/70-50",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 48,
    continuousPowerW: 5e3,
    peakPowerW: 1e4,
    maxCurrentA: 110,
    msrpUsd: 2199,
    oemPriceUsd: 1539,
    description: "Victron MultiPlus-II 48V 5000W inverter/charger with 70A charger",
    partNumber: "EAS048500114",
    productUrl: "https://www.victronenergy.com/inverters-chargers/multiplus-ii",
    source: "Victron 2024",
    dataQuality: "partial",
    width: 90,
    height: 130,
    terminals: multiPlusTerminals(50, 41),
    inverterChargerRatings: {
      dcVoltageV: 48,
      maxDcCurrentA: 110,
      continuousInverterW: 5e3,
      surgeW: 1e4,
      chargerCurrentA: 70,
      acInputVoltageV: 120,
      acInputCurrentA: 50,
      acOutputVoltageV: 120,
      acOutputCurrentA: 41,
      transferSwitchA: 50,
      efficiencyPct: 95
    }
  },
  // ----------------------------------------------------------
  // Victron Quattro 12/5000/220-100/100
  // ----------------------------------------------------------
  {
    id: "inv-vic-quattro-12-5000",
    manufacturer: "Victron",
    name: "Quattro 12/5000/220-100/100",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 12,
    continuousPowerW: 5e3,
    peakPowerW: 1e4,
    maxCurrentA: 420,
    msrpUsd: 2899,
    oemPriceUsd: 2029,
    description: "Victron Quattro 12V 5000W inverter/charger with dual AC inputs",
    partNumber: "QUA012500114",
    productUrl: "https://www.cdnrg.com/products/vequa125021100",
    source: "Victron 2024",
    dataQuality: "partial",
    width: 90,
    height: 130,
    terminals: quattroTerminals(100, 41),
    inverterChargerRatings: {
      dcVoltageV: 12,
      maxDcCurrentA: 420,
      continuousInverterW: 5e3,
      surgeW: 1e4,
      chargerCurrentA: 220,
      acInputVoltageV: 120,
      acInputCurrentA: 100,
      acOutputVoltageV: 120,
      acOutputCurrentA: 41,
      transferSwitchA: 100,
      efficiencyPct: 94
    }
  },
  // ==========================================================
  // Phoenix Inverter (inverter-only, no charger)
  // ==========================================================
  {
    id: "phoenix-inverter-12-1200",
    manufacturer: "Victron",
    name: "Phoenix Inverter Smart 12/1200",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 12,
    continuousPowerW: 1200,
    msrpUsd: 327,
    description: "Victron Phoenix Inverter Smart 12V/1200VA \uFFFD inverter only (no charger), Bluetooth/VE.Direct",
    partNumber: "PIN122122500",
    productUrl: "https://www.cdnrg.com/products/vepin122122500",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Inverter only; placeholder pricing/specs.",
    width: 90,
    height: 130,
    terminals: multiPlusTerminals(void 0, 10),
    inverterChargerRatings: {
      dcVoltageV: 12,
      continuousInverterW: 1200,
      acOutputVoltageV: 120
    }
  },
  // ==========================================================
  // MultiPlus (original series)
  // ==========================================================
  {
    id: "multiplus-12-2000",
    manufacturer: "Victron",
    name: "MultiPlus 12/2000/80-50",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 12,
    continuousPowerW: 2e3,
    maxCurrentA: 160,
    msrpUsd: 1054,
    description: "Victron MultiPlus 12V/2000VA/80A inverter/charger \uFFFD VE.Bus",
    partNumber: "PMP122200102",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 90,
    height: 130,
    terminals: multiPlusTerminals(50, 17),
    inverterChargerRatings: {
      dcVoltageV: 12,
      continuousInverterW: 2e3,
      chargerCurrentA: 80,
      acInputVoltageV: 120,
      acOutputVoltageV: 120
    }
  },
  // ==========================================================
  // MultiPlus-II 12V � 230V and split-phase variants
  // ==========================================================
  {
    id: "multiplus-ii-12-3000-230v",
    manufacturer: "Victron",
    name: "MultiPlus-II 12/3000/120-32 (230V)",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 12,
    continuousPowerW: 3e3,
    maxCurrentA: 250,
    msrpUsd: 1348,
    description: "Victron MultiPlus-II 12V/3000VA/120A charger \uFFFD 230V AC output, VE.Bus",
    partNumber: "PMP122305010",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 90,
    height: 130,
    terminals: multiPlusTerminals(32, 13),
    inverterChargerRatings: {
      dcVoltageV: 12,
      continuousInverterW: 3e3,
      chargerCurrentA: 120,
      acInputVoltageV: 230,
      acOutputVoltageV: 230
    }
  },
  {
    id: "multiplus-ii-12-4000-2x120v",
    manufacturer: "Victron",
    name: "MultiPlus-II 12/4000/160-50 2x120V",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 12,
    continuousPowerW: 4e3,
    maxCurrentA: 330,
    msrpUsd: 1419,
    description: "Victron MultiPlus-II 12V/4000VA/160A charger \uFFFD split-phase 120/240V, VE.Bus",
    partNumber: "PMP122405200",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 90,
    height: 130,
    terminals: multiPlusTerminals(50, 33),
    inverterChargerRatings: {
      dcVoltageV: 12,
      continuousInverterW: 4e3,
      chargerCurrentA: 160,
      acInputVoltageV: 120,
      acOutputVoltageV: 120
    }
  },
  // ==========================================================
  // MultiPlus-II 24V variants
  // ==========================================================
  {
    id: "multiplus-ii-24-3000-230v",
    manufacturer: "Victron",
    name: "MultiPlus-II 24/3000/70-32 (230V)",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 24,
    continuousPowerW: 3e3,
    maxCurrentA: 130,
    msrpUsd: 1025,
    description: "Victron MultiPlus-II 24V/3000VA/70A charger \uFFFD 230V AC output, VE.Bus",
    partNumber: "PMP242305010",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 90,
    height: 130,
    terminals: multiPlusTerminals(32, 13),
    inverterChargerRatings: {
      dcVoltageV: 24,
      continuousInverterW: 3e3,
      chargerCurrentA: 70,
      acInputVoltageV: 230,
      acOutputVoltageV: 230
    }
  },
  {
    id: "multiplus-ii-24-3000-2x120v",
    manufacturer: "Victron",
    name: "MultiPlus-II 24/3000/70-50 2x120V",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 24,
    continuousPowerW: 3e3,
    maxCurrentA: 130,
    msrpUsd: 1401,
    description: "Victron MultiPlus-II 24V/3000VA/70A charger \uFFFD split-phase 120/240V, VE.Bus",
    partNumber: "PMP242305132",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 90,
    height: 130,
    terminals: multiPlusTerminals(50, 25),
    inverterChargerRatings: {
      dcVoltageV: 24,
      continuousInverterW: 3e3,
      chargerCurrentA: 70,
      acInputVoltageV: 120,
      acOutputVoltageV: 120
    }
  },
  {
    id: "multiplus-ii-24-5000-230v",
    manufacturer: "Victron",
    name: "MultiPlus-II 24/5000/120-50 (230V)",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 24,
    continuousPowerW: 5e3,
    maxCurrentA: 215,
    msrpUsd: 1927,
    description: "Victron MultiPlus-II 24V/5000VA/120A charger \uFFFD 230V AC output, VE.Bus",
    partNumber: "PMP242505010",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 90,
    height: 130,
    terminals: multiPlusTerminals(50, 22),
    inverterChargerRatings: {
      dcVoltageV: 24,
      continuousInverterW: 5e3,
      chargerCurrentA: 120,
      acInputVoltageV: 230,
      acOutputVoltageV: 230
    }
  },
  // ==========================================================
  // MultiPlus-II 48V variants
  // ==========================================================
  {
    id: "multiplus-ii-48-3000",
    manufacturer: "Victron",
    name: "MultiPlus-II 48/3000/35-50 (120V)",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 48,
    continuousPowerW: 3e3,
    maxCurrentA: 65,
    msrpUsd: 1164,
    description: "Victron MultiPlus-II 48V/3000VA/35A charger \uFFFD 120V AC output, VE.Bus",
    partNumber: "PMP482305102",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 90,
    height: 130,
    terminals: multiPlusTerminals(50, 25),
    inverterChargerRatings: {
      dcVoltageV: 48,
      continuousInverterW: 3e3,
      chargerCurrentA: 35,
      acInputVoltageV: 120,
      acOutputVoltageV: 120
    }
  },
  {
    id: "multiplus-ii-48-3000-230v",
    manufacturer: "Victron",
    name: "MultiPlus-II 48/3000/35-32 (230V)",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 48,
    continuousPowerW: 3e3,
    maxCurrentA: 65,
    msrpUsd: 715,
    description: "Victron MultiPlus-II 48V/3000VA/35A charger \uFFFD 230V AC output, VE.Bus",
    partNumber: "PMP482305010",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 90,
    height: 130,
    terminals: multiPlusTerminals(32, 13),
    inverterChargerRatings: {
      dcVoltageV: 48,
      continuousInverterW: 3e3,
      chargerCurrentA: 35,
      acInputVoltageV: 230,
      acOutputVoltageV: 230
    }
  },
  {
    id: "multiplus-ii-48-8000-230v",
    manufacturer: "Victron",
    name: "MultiPlus-II 48/8000/110-100 (230V)",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 48,
    continuousPowerW: 8e3,
    maxCurrentA: 175,
    msrpUsd: 1778,
    description: "Victron MultiPlus-II 48V/8000VA/110A charger \uFFFD 230V AC output, VE.Bus",
    partNumber: "PMP482805000",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 90,
    height: 130,
    terminals: multiPlusTerminals(100, 35),
    inverterChargerRatings: {
      dcVoltageV: 48,
      continuousInverterW: 8e3,
      chargerCurrentA: 110,
      acInputVoltageV: 230,
      acOutputVoltageV: 230
    }
  },
  {
    id: "multiplus-ii-48-10000-230v",
    manufacturer: "Victron",
    name: "MultiPlus-II 48/10000/140-100 (230V)",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 48,
    continuousPowerW: 1e4,
    maxCurrentA: 215,
    msrpUsd: 2124,
    description: "Victron MultiPlus-II 48V/10000VA/140A charger \uFFFD 230V AC output, VE.Bus",
    partNumber: "PMP483105000",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 90,
    height: 130,
    terminals: multiPlusTerminals(100, 44),
    inverterChargerRatings: {
      dcVoltageV: 48,
      continuousInverterW: 1e4,
      chargerCurrentA: 140,
      acInputVoltageV: 230,
      acOutputVoltageV: 230
    }
  },
  {
    id: "multiplus-ii-48-15000-230v",
    manufacturer: "Victron",
    name: "MultiPlus-II 48/15000/200-100 (230V)",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 48,
    continuousPowerW: 15e3,
    maxCurrentA: 325,
    msrpUsd: 2963,
    description: "Victron MultiPlus-II 48V/15000VA/200A charger \uFFFD 230V AC output, VE.Bus",
    partNumber: "PMP483150000",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 90,
    height: 130,
    terminals: multiPlusTerminals(100, 65),
    inverterChargerRatings: {
      dcVoltageV: 48,
      continuousInverterW: 15e3,
      chargerCurrentA: 200,
      acInputVoltageV: 230,
      acOutputVoltageV: 230
    }
  },
  {
    id: "multiplus-ii-48-5000-120v",
    manufacturer: "Victron",
    name: "MultiPlus-II 48/5000/70-95 (120V)",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 48,
    continuousPowerW: 5e3,
    maxCurrentA: 110,
    msrpUsd: 1453,
    description: "Victron MultiPlus-II 48V/5000VA/70A charger \uFFFD 120V AC output, VE.Bus",
    partNumber: "PMP482505110",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 90,
    height: 130,
    terminals: multiPlusTerminals(95, 42),
    inverterChargerRatings: {
      dcVoltageV: 48,
      continuousInverterW: 5e3,
      chargerCurrentA: 70,
      acInputVoltageV: 120,
      acOutputVoltageV: 120
    }
  },
  // ==========================================================
  // Quattro-II and Quattro series (dual AC input)
  // ==========================================================
  {
    id: "quattro-ii-12-3000-2x120v",
    manufacturer: "Victron",
    name: "Quattro-II 12/3000/120-50/50 2x120V",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 12,
    continuousPowerW: 3e3,
    maxCurrentA: 250,
    msrpUsd: 1444,
    description: "Victron Quattro-II 12V/3000VA \uFFFD dual AC input, split-phase 120/240V, VE.Bus",
    partNumber: "QUA122305130",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 90,
    height: 130,
    terminals: quattroTerminals(50, 25),
    inverterChargerRatings: {
      dcVoltageV: 12,
      continuousInverterW: 3e3,
      chargerCurrentA: 120,
      acInputVoltageV: 120,
      acOutputVoltageV: 120,
      transferSwitchA: 50
    }
  },
  {
    id: "quattro-24-5000",
    manufacturer: "Victron",
    name: "Quattro 24/5000/120-100/100",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 24,
    continuousPowerW: 5e3,
    maxCurrentA: 220,
    msrpUsd: 2358,
    description: "Victron Quattro 24V/5000VA/120A charger \uFFFD dual AC input, 120V, VE.Bus",
    partNumber: "QUA245021010",
    productUrl: "https://www.cdnrg.com/products/vequa245023110",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 90,
    height: 130,
    terminals: quattroTerminals(100, 42),
    inverterChargerRatings: {
      dcVoltageV: 24,
      continuousInverterW: 5e3,
      chargerCurrentA: 120,
      acInputVoltageV: 120,
      acOutputVoltageV: 120,
      transferSwitchA: 100
    }
  },
  {
    id: "quattro-ii-24-3000-2x120v",
    manufacturer: "Victron",
    name: "Quattro-II 24/3000/70-50/50 2x120V",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 24,
    continuousPowerW: 3e3,
    maxCurrentA: 130,
    msrpUsd: 1372,
    description: "Victron Quattro-II 24V/3000VA \uFFFD dual AC input, split-phase 120/240V, VE.Bus",
    partNumber: "QUA242305130",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 90,
    height: 130,
    terminals: quattroTerminals(50, 25),
    inverterChargerRatings: {
      dcVoltageV: 24,
      continuousInverterW: 3e3,
      chargerCurrentA: 70,
      acInputVoltageV: 120,
      acOutputVoltageV: 120,
      transferSwitchA: 50
    }
  },
  {
    id: "quattro-ii-24-5000-230v",
    manufacturer: "Victron",
    name: "Quattro-II 24/5000/120-50/50 (230V)",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 24,
    continuousPowerW: 5e3,
    maxCurrentA: 215,
    msrpUsd: 2087,
    description: "Victron Quattro-II 24V/5000VA/120A charger \uFFFD dual AC input, 230V output, VE.Bus",
    partNumber: "QUA242505010",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 90,
    height: 130,
    terminals: quattroTerminals(50, 22),
    inverterChargerRatings: {
      dcVoltageV: 24,
      continuousInverterW: 5e3,
      chargerCurrentA: 120,
      acInputVoltageV: 230,
      acOutputVoltageV: 230,
      transferSwitchA: 50
    }
  },
  {
    id: "quattro-ii-48-5000-230v",
    manufacturer: "Victron",
    name: "Quattro-II 48/5000/70-50/50 (230V)",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 48,
    continuousPowerW: 5e3,
    maxCurrentA: 110,
    msrpUsd: 1365,
    description: "Victron Quattro-II 48V/5000VA/70A charger \uFFFD dual AC input, 230V output, VE.Bus",
    partNumber: "QUA482504010",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 90,
    height: 130,
    terminals: quattroTerminals(50, 22),
    inverterChargerRatings: {
      dcVoltageV: 48,
      continuousInverterW: 5e3,
      chargerCurrentA: 70,
      acInputVoltageV: 230,
      acOutputVoltageV: 230,
      transferSwitchA: 50
    }
  },
  {
    id: "quattro-48-10000",
    manufacturer: "Victron",
    name: "Quattro 48/10000/140-100/100",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 48,
    continuousPowerW: 1e4,
    maxCurrentA: 215,
    msrpUsd: 2733,
    description: "Victron Quattro 48V/10000VA/140A charger \uFFFD dual AC input, split-phase 120/240V, VE.Bus",
    partNumber: "QUA481030010",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 90,
    height: 130,
    terminals: quattroTerminals(100, 83),
    inverterChargerRatings: {
      dcVoltageV: 48,
      continuousInverterW: 1e4,
      chargerCurrentA: 140,
      acInputVoltageV: 120,
      acOutputVoltageV: 120,
      transferSwitchA: 100
    }
  },
  {
    id: "quattro-48-15000",
    manufacturer: "Victron",
    name: "Quattro 48/15000/200-100/100",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 48,
    continuousPowerW: 15e3,
    maxCurrentA: 325,
    msrpUsd: 3591,
    description: "Victron Quattro 48V/15000VA/200A charger \uFFFD dual AC input, split-phase 120/240V, VE.Bus",
    partNumber: "QUA483150100",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 90,
    height: 130,
    terminals: quattroTerminals(100, 125),
    inverterChargerRatings: {
      dcVoltageV: 48,
      continuousInverterW: 15e3,
      chargerCurrentA: 200,
      acInputVoltageV: 120,
      acOutputVoltageV: 120,
      transferSwitchA: 100
    }
  }
];

// src/data/products/dcDcChargers.ts
function dcDcTerminals(outputCurrentA) {
  return [
    {
      id: "in_pos",
      label: "In+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "sink",
      direction: "input",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -16,
      offsetY: 24,
      domain: "dc",
      requiresOvercurrentProtection: true,
      notes: "DC input positive. Fuse required on input positive conductor."
    },
    {
      id: "in_neg",
      label: "In-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "sink",
      direction: "input",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: -5,
      offsetY: 24,
      domain: "dc",
      notes: "DC input negative."
    },
    {
      id: "out_pos",
      label: "Out+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 5,
      offsetY: 24,
      domain: "dc",
      requiresOvercurrentProtection: true,
      maxCurrentA: outputCurrentA,
      notes: "DC output positive. Fuse required on output positive conductor."
    },
    {
      id: "out_neg",
      label: "Out-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "bottom",
      offsetX: 16,
      offsetY: 24,
      domain: "dc",
      maxCurrentA: outputCurrentA,
      notes: "DC output negative."
    }
  ];
}
var dcDcChargers = [
  // ==========================================================
  // Orion XS � high-current smart chargers
  // ==========================================================
  {
    id: "orion-xs-12-12-50",
    manufacturer: "Victron",
    name: "Orion XS 12/12-50A DC-DC Charger",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 50,
    continuousPowerW: 600,
    msrpUsd: 381,
    description: "Victron Orion XS 12V/12V-50A \uFFFD smart DC-DC charger with Bluetooth/VE.Direct",
    partNumber: "ORI121217050",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(50),
    dcDcChargerRatings: { inputVoltageMinV: 9, inputVoltageMaxV: 17, outputVoltageV: 12, outputCurrentA: 50, outputPowerW: 600, isolated: false }
  },
  {
    id: "orion-xs-24-24-50",
    manufacturer: "Victron",
    name: "Orion XS 24/24-50A DC-DC Charger",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 50,
    continuousPowerW: 1200,
    msrpUsd: 436,
    description: "Victron Orion XS 24V/24V-50A \uFFFD smart DC-DC charger with Bluetooth/VE.Direct",
    partNumber: "ORI242417040",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(50),
    dcDcChargerRatings: { inputVoltageMinV: 18, inputVoltageMaxV: 35, outputVoltageV: 24, outputCurrentA: 50, outputPowerW: 1200, isolated: false }
  },
  // ==========================================================
  // Buck-Boost � bi-directional DC-DC converters
  // ==========================================================
  {
    id: "buck-boost-25",
    manufacturer: "Victron",
    name: "Buck-Boost 25A DC-DC Converter",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: [12, 24],
    maxCurrentA: 25,
    continuousPowerW: 300,
    msrpUsd: 662,
    description: "Victron 25A Buck-Boost bi-directional DC-DC converter \uFFFD CAN-bus",
    partNumber: "ORI303025000",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(25),
    dcDcChargerRatings: { outputCurrentA: 25, outputPowerW: 300, isolated: false }
  },
  {
    id: "buck-boost-50",
    manufacturer: "Victron",
    name: "Buck-Boost 50A DC-DC Converter",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: [12, 24],
    maxCurrentA: 50,
    continuousPowerW: 600,
    msrpUsd: 823,
    description: "Victron 50A Buck-Boost bi-directional DC-DC converter \uFFFD CAN-bus",
    partNumber: "ORI303050000",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(50),
    dcDcChargerRatings: { outputCurrentA: 50, outputPowerW: 600, isolated: false }
  },
  {
    id: "buck-boost-100",
    manufacturer: "Victron",
    name: "Buck-Boost 100A DC-DC Converter",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: [12, 24],
    maxCurrentA: 100,
    continuousPowerW: 1200,
    msrpUsd: 1440,
    description: "Victron 100A Buck-Boost bi-directional DC-DC converter \uFFFD CAN-bus",
    partNumber: "ORI303100000",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(100),
    dcDcChargerRatings: { outputCurrentA: 100, outputPowerW: 1200, isolated: false }
  },
  // ==========================================================
  // Orion-Tr Smart � non-isolated (Bluetooth)
  // ==========================================================
  {
    id: "orion-tr-smart-12-12-30-non-isolated",
    manufacturer: "Victron",
    name: "Orion-Tr Smart 12/12-30A Non-Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 30,
    continuousPowerW: 360,
    msrpUsd: 264,
    description: "Victron Orion-Tr Smart 12V/12V-30A non-isolated DC-DC converter \uFFFD Bluetooth",
    partNumber: "ORI121236140",
    productUrl: "https://www.cdnrg.com/products/veori121236140",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(30),
    dcDcChargerRatings: { inputVoltageMinV: 9, inputVoltageMaxV: 17, outputVoltageV: 12, outputCurrentA: 30, outputPowerW: 360, isolated: false }
  },
  {
    id: "orion-tr-smart-24-12-30-non-isolated",
    manufacturer: "Victron",
    name: "Orion-Tr Smart 24/12-30A Non-Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 30,
    continuousPowerW: 360,
    msrpUsd: 264,
    description: "Victron Orion-Tr Smart 24V/12V-30A non-isolated DC-DC converter \uFFFD Bluetooth",
    partNumber: "ORI241236140",
    productUrl: "https://www.cdnrg.com/products/veori241236140",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(30),
    dcDcChargerRatings: { inputVoltageMinV: 18, inputVoltageMaxV: 35, outputVoltageV: 12, outputCurrentA: 30, outputPowerW: 360, isolated: false }
  },
  {
    id: "orion-tr-smart-12-24-15-non-isolated",
    manufacturer: "Victron",
    name: "Orion-Tr Smart 12/24-15A Non-Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 15,
    continuousPowerW: 360,
    msrpUsd: 264,
    description: "Victron Orion-Tr Smart 12V/24V-15A non-isolated DC-DC converter \uFFFD Bluetooth",
    partNumber: "ORI122436140",
    productUrl: "https://www.cdnrg.com/products/veori122436140",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(15),
    dcDcChargerRatings: { inputVoltageMinV: 9, inputVoltageMaxV: 17, outputVoltageV: 24, outputCurrentA: 15, outputPowerW: 360, isolated: false }
  },
  {
    id: "orion-tr-smart-24-24-17-non-isolated",
    manufacturer: "Victron",
    name: "Orion-Tr Smart 24/24-17A Non-Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 17,
    continuousPowerW: 408,
    msrpUsd: 264,
    description: "Victron Orion-Tr Smart 24V/24V-17A non-isolated DC-DC converter \uFFFD Bluetooth",
    partNumber: "ORI242440140",
    productUrl: "https://www.cdnrg.com/products/veori242440140",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(17),
    dcDcChargerRatings: { inputVoltageMinV: 18, inputVoltageMaxV: 35, outputVoltageV: 24, outputCurrentA: 17, outputPowerW: 408, isolated: false }
  },
  // ==========================================================
  // Orion-Tr Smart � isolated (Bluetooth) � 12V output
  // ==========================================================
  {
    id: "orion-tr-12-12-18-isolated",
    manufacturer: "Victron",
    name: "Orion-Tr Smart 12/12-18A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 18,
    continuousPowerW: 216,
    msrpUsd: 196,
    description: "Victron Orion-Tr Smart 12V/12V-18A isolated DC-DC charger \uFFFD Bluetooth",
    partNumber: "ORI121222120",
    productUrl: "https://www.cdnrg.com/products/veori121222120",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(18),
    dcDcChargerRatings: { outputVoltageV: 12, outputCurrentA: 18, outputPowerW: 216, isolated: true }
  },
  {
    id: "orion-tr-24-12-20",
    manufacturer: "Victron",
    name: "Orion-Tr Smart 24/12-20A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 20,
    continuousPowerW: 240,
    msrpUsd: 196,
    description: "Victron Orion-Tr Smart 24V/12V-20A isolated DC-DC charger \uFFFD Bluetooth",
    partNumber: "ORI241224120",
    productUrl: "https://www.cdnrg.com/products/veori241224120",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(20),
    dcDcChargerRatings: { inputVoltageMinV: 18, inputVoltageMaxV: 35, outputVoltageV: 12, outputCurrentA: 20, outputPowerW: 240, isolated: true }
  },
  {
    id: "orion-tr-24-12-30",
    manufacturer: "Victron",
    name: "Orion-Tr Smart 24/12-30A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 30,
    continuousPowerW: 360,
    msrpUsd: 299,
    description: "Victron Orion-Tr Smart 24V/12V-30A isolated DC-DC charger \uFFFD Bluetooth",
    partNumber: "ORI241236120",
    productUrl: "https://www.cdnrg.com/products/veori241236120",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(30),
    dcDcChargerRatings: { inputVoltageMinV: 18, inputVoltageMaxV: 35, outputVoltageV: 12, outputCurrentA: 30, outputPowerW: 360, isolated: true }
  },
  {
    id: "orion-tr-48-12-20",
    manufacturer: "Victron",
    name: "Orion-Tr Smart 48/12-20A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 20,
    continuousPowerW: 240,
    msrpUsd: 196,
    description: "Victron Orion-Tr Smart 48V/12V-20A isolated DC-DC charger \uFFFD Bluetooth",
    partNumber: "ORI481224120",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(20),
    dcDcChargerRatings: { inputVoltageMinV: 36, inputVoltageMaxV: 70, outputVoltageV: 12, outputCurrentA: 20, outputPowerW: 240, isolated: true }
  },
  {
    id: "orion-tr-48-12-30",
    manufacturer: "Victron",
    name: "Orion-Tr Smart 48/12-30A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 30,
    continuousPowerW: 360,
    msrpUsd: 299,
    description: "Victron Orion-Tr Smart 48V/12V-30A isolated DC-DC charger \uFFFD Bluetooth",
    partNumber: "ORI481238120",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(30),
    dcDcChargerRatings: { inputVoltageMinV: 36, inputVoltageMaxV: 70, outputVoltageV: 12, outputCurrentA: 30, outputPowerW: 360, isolated: true }
  },
  // ==========================================================
  // Orion-Tr Smart � isolated � 24V output
  // ==========================================================
  {
    id: "orion-tr-12-24-10",
    manufacturer: "Victron",
    name: "Orion-Tr Smart 12/24-10A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 10,
    continuousPowerW: 240,
    msrpUsd: 196,
    description: "Victron Orion-Tr Smart 12V/24V-10A isolated DC-DC charger \uFFFD Bluetooth",
    partNumber: "ORI122424120",
    productUrl: "https://www.cdnrg.com/products/veori122424120",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(10),
    dcDcChargerRatings: { outputVoltageV: 24, outputCurrentA: 10, outputPowerW: 240, isolated: true }
  },
  {
    id: "orion-tr-12-24-15",
    manufacturer: "Victron",
    name: "Orion-Tr Smart 12/24-15A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 15,
    continuousPowerW: 360,
    msrpUsd: 299,
    description: "Victron Orion-Tr Smart 12V/24V-15A isolated DC-DC charger \uFFFD Bluetooth",
    partNumber: "ORI122436120",
    productUrl: "https://www.cdnrg.com/products/veori122436120",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(15),
    dcDcChargerRatings: { outputVoltageV: 24, outputCurrentA: 15, outputPowerW: 360, isolated: true }
  },
  {
    id: "orion-tr-24-24-12",
    manufacturer: "Victron",
    name: "Orion-Tr Smart 24/24-12A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 12,
    continuousPowerW: 280,
    msrpUsd: 196,
    description: "Victron Orion-Tr Smart 24V/24V-12A isolated DC-DC charger \uFFFD Bluetooth",
    partNumber: "ORI242428120",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(12),
    dcDcChargerRatings: { inputVoltageMinV: 18, inputVoltageMaxV: 35, outputVoltageV: 24, outputCurrentA: 12, outputPowerW: 280, isolated: true }
  },
  {
    id: "orion-tr-24-24-17",
    manufacturer: "Victron",
    name: "Orion-Tr Smart 24/24-17A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 17,
    continuousPowerW: 400,
    msrpUsd: 299,
    description: "Victron Orion-Tr Smart 24V/24V-17A isolated DC-DC charger \uFFFD Bluetooth",
    partNumber: "ORI242440120",
    productUrl: "https://www.cdnrg.com/products/veori242440120",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(17),
    dcDcChargerRatings: { inputVoltageMinV: 18, inputVoltageMaxV: 35, outputVoltageV: 24, outputCurrentA: 17, outputPowerW: 400, isolated: true }
  },
  {
    id: "orion-tr-48-24-16",
    manufacturer: "Victron",
    name: "Orion-Tr Smart 48/24-16A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 16,
    continuousPowerW: 380,
    msrpUsd: 299,
    description: "Victron Orion-Tr Smart 48V/24V-16A isolated DC-DC charger \uFFFD Bluetooth",
    partNumber: "ORI482438120",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(16),
    dcDcChargerRatings: { inputVoltageMinV: 36, inputVoltageMaxV: 70, outputVoltageV: 24, outputCurrentA: 16, outputPowerW: 380, isolated: true }
  },
  // ==========================================================
  // Orion-Tr Smart � isolated � 48V output
  // ==========================================================
  {
    id: "orion-tr-12-48-8",
    manufacturer: "Victron",
    name: "Orion-Tr Smart 12/48-8A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 48,
    maxCurrentA: 8,
    continuousPowerW: 380,
    msrpUsd: 299,
    description: "Victron Orion-Tr Smart 12V/48V-8A isolated DC-DC charger \uFFFD Bluetooth",
    partNumber: "ORI124838120",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(8),
    dcDcChargerRatings: { outputVoltageV: 48, outputCurrentA: 8, outputPowerW: 380, isolated: true }
  },
  {
    id: "orion-tr-24-48-8-5",
    manufacturer: "Victron",
    name: "Orion-Tr Smart 24/48-8.5A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 48,
    maxCurrentA: 9,
    continuousPowerW: 400,
    msrpUsd: 299,
    description: "Victron Orion-Tr Smart 24V/48V-8.5A isolated DC-DC charger \uFFFD Bluetooth",
    partNumber: "ORI244840120",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(9),
    dcDcChargerRatings: { inputVoltageMinV: 18, inputVoltageMaxV: 35, outputVoltageV: 48, outputCurrentA: 9, outputPowerW: 400, isolated: true }
  },
  {
    id: "orion-tr-48-48-8",
    manufacturer: "Victron",
    name: "Orion-Tr Smart 48/48-8A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 48,
    maxCurrentA: 8,
    continuousPowerW: 380,
    msrpUsd: 299,
    description: "Victron Orion-Tr Smart 48V/48V-8A isolated DC-DC charger \uFFFD Bluetooth",
    partNumber: "ORI484838120",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(8),
    dcDcChargerRatings: { inputVoltageMinV: 36, inputVoltageMaxV: 70, outputVoltageV: 48, outputCurrentA: 8, outputPowerW: 380, isolated: true }
  },
  // ==========================================================
  // Orion-Tr (non-Smart) � isolated converters � 12V output
  // ==========================================================
  {
    id: "orion-tr-12-12-9-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 12/12-9A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 9,
    continuousPowerW: 110,
    msrpUsd: 78,
    description: "Victron Orion-Tr 12V/12V-9A isolated converter \uFFFD remote on/off",
    partNumber: "ORI121210110",
    productUrl: "https://www.cdnrg.com/products/veori121210110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(9),
    dcDcChargerRatings: { outputVoltageV: 12, outputCurrentA: 9, outputPowerW: 110, isolated: true }
  },
  {
    id: "orion-tr-12-12-18-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 12/12-18A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 18,
    continuousPowerW: 220,
    msrpUsd: 140,
    description: "Victron Orion-Tr 12V/12V-18A isolated converter \uFFFD remote on/off",
    partNumber: "ORI121222110",
    productUrl: "https://www.cdnrg.com/products/veori121222110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(18),
    dcDcChargerRatings: { outputVoltageV: 12, outputCurrentA: 18, outputPowerW: 220, isolated: true }
  },
  {
    id: "orion-tr-24-12-9-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 24/12-9A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 9,
    continuousPowerW: 110,
    msrpUsd: 78,
    description: "Victron Orion-Tr 24V/12V-9A isolated converter \uFFFD remote on/off",
    partNumber: "ORI241210110",
    productUrl: "https://www.cdnrg.com/products/veori241210110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(9),
    dcDcChargerRatings: { inputVoltageMinV: 18, inputVoltageMaxV: 35, outputVoltageV: 12, outputCurrentA: 9, outputPowerW: 110, isolated: true }
  },
  {
    id: "orion-tr-24-12-20-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 24/12-20A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 20,
    continuousPowerW: 240,
    msrpUsd: 140,
    description: "Victron Orion-Tr 24V/12V-20A isolated converter \uFFFD remote on/off",
    partNumber: "ORI241224110",
    productUrl: "https://www.cdnrg.com/products/veori241224110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(20),
    dcDcChargerRatings: { inputVoltageMinV: 18, inputVoltageMaxV: 35, outputVoltageV: 12, outputCurrentA: 20, outputPowerW: 240, isolated: true }
  },
  {
    id: "orion-tr-24-12-30-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 24/12-30A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 30,
    continuousPowerW: 360,
    msrpUsd: 246,
    description: "Victron Orion-Tr 24V/12V-30A isolated converter \uFFFD remote on/off",
    partNumber: "ORI241240110",
    productUrl: "https://www.cdnrg.com/products/veori241240110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(30),
    dcDcChargerRatings: { inputVoltageMinV: 18, inputVoltageMaxV: 35, outputVoltageV: 12, outputCurrentA: 30, outputPowerW: 360, isolated: true }
  },
  {
    id: "orion-tr-48-12-9-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 48/12-9A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 9,
    continuousPowerW: 110,
    msrpUsd: 78,
    description: "Victron Orion-Tr 48V/12V-9A isolated converter \uFFFD remote on/off",
    partNumber: "ORI481210110",
    productUrl: "https://www.cdnrg.com/products/veori481210110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(9),
    dcDcChargerRatings: { inputVoltageMinV: 36, inputVoltageMaxV: 70, outputVoltageV: 12, outputCurrentA: 9, outputPowerW: 110, isolated: true }
  },
  {
    id: "orion-tr-48-12-20-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 48/12-20A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 20,
    continuousPowerW: 240,
    msrpUsd: 140,
    description: "Victron Orion-Tr 48V/12V-20A isolated converter \uFFFD remote on/off",
    partNumber: "ORI481224110",
    productUrl: "https://www.cdnrg.com/products/veori481224110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(20),
    dcDcChargerRatings: { inputVoltageMinV: 36, inputVoltageMaxV: 70, outputVoltageV: 12, outputCurrentA: 20, outputPowerW: 240, isolated: true }
  },
  {
    id: "orion-tr-48-12-30-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 48/12-30A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 30,
    continuousPowerW: 360,
    msrpUsd: 246,
    description: "Victron Orion-Tr 48V/12V-30A isolated converter \uFFFD remote on/off",
    partNumber: "ORI481240110",
    productUrl: "https://www.cdnrg.com/products/veori481240110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(30),
    dcDcChargerRatings: { inputVoltageMinV: 36, inputVoltageMaxV: 70, outputVoltageV: 12, outputCurrentA: 30, outputPowerW: 360, isolated: true }
  },
  {
    id: "orion-110-12-30-converter",
    manufacturer: "Victron",
    name: "Orion 110/12-30A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 30,
    continuousPowerW: 360,
    msrpUsd: 447,
    description: "Victron Orion 110V/12V-30A isolated converter \uFFFD remote on/off (wide input for truck/bus)",
    partNumber: "ORI110123610",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(30),
    dcDcChargerRatings: { inputVoltageMinV: 75, inputVoltageMaxV: 145, outputVoltageV: 12, outputCurrentA: 30, outputPowerW: 360, isolated: true }
  },
  // ==========================================================
  // Orion-Tr (non-Smart) � isolated � 24V output
  // ==========================================================
  {
    id: "orion-tr-12-24-5-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 12/24-5A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 5,
    continuousPowerW: 120,
    msrpUsd: 78,
    description: "Victron Orion-Tr 12V/24V-5A isolated converter \uFFFD remote on/off",
    partNumber: "ORI122410110",
    productUrl: "https://www.cdnrg.com/products/veori122410110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(5),
    dcDcChargerRatings: { outputVoltageV: 24, outputCurrentA: 5, outputPowerW: 120, isolated: true }
  },
  {
    id: "orion-tr-12-24-10-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 12/24-10A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 10,
    continuousPowerW: 240,
    msrpUsd: 140,
    description: "Victron Orion-Tr 12V/24V-10A isolated converter \uFFFD remote on/off",
    partNumber: "ORI122424110",
    productUrl: "https://www.cdnrg.com/products/veori122424110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(10),
    dcDcChargerRatings: { outputVoltageV: 24, outputCurrentA: 10, outputPowerW: 240, isolated: true }
  },
  {
    id: "orion-tr-12-24-15-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 12/24-15A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 15,
    continuousPowerW: 360,
    msrpUsd: 246,
    description: "Victron Orion-Tr 12V/24V-15A isolated converter \uFFFD remote on/off",
    partNumber: "ORI122441110",
    productUrl: "https://www.cdnrg.com/products/veori122441110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(15),
    dcDcChargerRatings: { outputVoltageV: 24, outputCurrentA: 15, outputPowerW: 360, isolated: true }
  },
  {
    id: "orion-tr-24-24-5-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 24/24-5A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 5,
    continuousPowerW: 120,
    msrpUsd: 78,
    description: "Victron Orion-Tr 24V/24V-5A isolated converter \uFFFD remote on/off",
    partNumber: "ORI242410110",
    productUrl: "https://www.cdnrg.com/products/veori242410110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(5),
    dcDcChargerRatings: { inputVoltageMinV: 18, inputVoltageMaxV: 35, outputVoltageV: 24, outputCurrentA: 5, outputPowerW: 120, isolated: true }
  },
  {
    id: "orion-tr-24-24-12-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 24/24-12A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 12,
    continuousPowerW: 280,
    msrpUsd: 140,
    description: "Victron Orion-Tr 24V/24V-12A isolated converter \uFFFD remote on/off",
    partNumber: "ORI242428110",
    productUrl: "https://www.cdnrg.com/products/veori242428110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(12),
    dcDcChargerRatings: { inputVoltageMinV: 18, inputVoltageMaxV: 35, outputVoltageV: 24, outputCurrentA: 12, outputPowerW: 280, isolated: true }
  },
  {
    id: "orion-tr-24-24-17-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 24/24-17A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 17,
    continuousPowerW: 400,
    msrpUsd: 246,
    description: "Victron Orion-Tr 24V/24V-17A isolated converter \uFFFD remote on/off",
    partNumber: "ORI242441110",
    productUrl: "https://www.cdnrg.com/products/veori242441110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(17),
    dcDcChargerRatings: { inputVoltageMinV: 18, inputVoltageMaxV: 35, outputVoltageV: 24, outputCurrentA: 17, outputPowerW: 400, isolated: true }
  },
  {
    id: "orion-tr-48-24-5-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 48/24-5A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 5,
    continuousPowerW: 120,
    msrpUsd: 78,
    description: "Victron Orion-Tr 48V/24V-5A isolated converter \uFFFD remote on/off",
    partNumber: "ORI482410110",
    productUrl: "https://www.cdnrg.com/products/veori482410110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(5),
    dcDcChargerRatings: { inputVoltageMinV: 36, inputVoltageMaxV: 70, outputVoltageV: 24, outputCurrentA: 5, outputPowerW: 120, isolated: true }
  },
  {
    id: "orion-tr-48-24-12-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 48/24-12A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 12,
    continuousPowerW: 280,
    msrpUsd: 140,
    description: "Victron Orion-Tr 48V/24V-12A isolated converter \uFFFD remote on/off",
    partNumber: "ORI482428110",
    productUrl: "https://www.cdnrg.com/products/veori482428110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(12),
    dcDcChargerRatings: { inputVoltageMinV: 36, inputVoltageMaxV: 70, outputVoltageV: 24, outputCurrentA: 12, outputPowerW: 280, isolated: true }
  },
  {
    id: "orion-tr-48-24-16-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 48/24-16A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 16,
    continuousPowerW: 380,
    msrpUsd: 246,
    description: "Victron Orion-Tr 48V/24V-16A isolated converter \uFFFD remote on/off",
    partNumber: "ORI482441110",
    productUrl: "https://www.cdnrg.com/products/veori482441110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(16),
    dcDcChargerRatings: { inputVoltageMinV: 36, inputVoltageMaxV: 70, outputVoltageV: 24, outputCurrentA: 16, outputPowerW: 380, isolated: true }
  },
  {
    id: "orion-110-24-15-converter",
    manufacturer: "Victron",
    name: "Orion 110/24-15A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 15,
    continuousPowerW: 360,
    msrpUsd: 447,
    description: "Victron Orion 110V/24V-15A isolated converter \uFFFD remote on/off (wide input for truck/bus)",
    partNumber: "ORI110243610",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(15),
    dcDcChargerRatings: { inputVoltageMinV: 75, inputVoltageMaxV: 145, outputVoltageV: 24, outputCurrentA: 15, outputPowerW: 360, isolated: true }
  },
  // ==========================================================
  // Orion-Tr (non-Smart) � isolated � 48V output
  // ==========================================================
  {
    id: "orion-tr-12-48-8-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 12/48-8A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 48,
    maxCurrentA: 8,
    continuousPowerW: 380,
    msrpUsd: 246,
    description: "Victron Orion-Tr 12V/48V-8A isolated converter \uFFFD remote on/off",
    partNumber: "ORI124838110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(8),
    dcDcChargerRatings: { outputVoltageV: 48, outputCurrentA: 8, outputPowerW: 380, isolated: true }
  },
  {
    id: "orion-tr-24-48-2-5-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 24/48-2.5A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 48,
    maxCurrentA: 3,
    continuousPowerW: 120,
    msrpUsd: 78,
    description: "Victron Orion-Tr 24V/48V-2.5A isolated converter \uFFFD remote on/off",
    partNumber: "ORI244810110",
    productUrl: "https://www.cdnrg.com/products/veori244810110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(3),
    dcDcChargerRatings: { inputVoltageMinV: 18, inputVoltageMaxV: 35, outputVoltageV: 48, outputCurrentA: 3, outputPowerW: 120, isolated: true }
  },
  {
    id: "orion-tr-24-48-6-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 24/48-6A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 48,
    maxCurrentA: 6,
    continuousPowerW: 280,
    msrpUsd: 140,
    description: "Victron Orion-Tr 24V/48V-6A isolated converter \uFFFD remote on/off",
    partNumber: "ORI244828110",
    productUrl: "https://www.cdnrg.com/products/veori244828110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(6),
    dcDcChargerRatings: { inputVoltageMinV: 18, inputVoltageMaxV: 35, outputVoltageV: 48, outputCurrentA: 6, outputPowerW: 280, isolated: true }
  },
  {
    id: "orion-tr-24-48-8-5-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 24/48-8.5A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 48,
    maxCurrentA: 9,
    continuousPowerW: 400,
    msrpUsd: 246,
    description: "Victron Orion-Tr 24V/48V-8.5A isolated converter \uFFFD remote on/off",
    partNumber: "ORI244841110",
    productUrl: "https://www.cdnrg.com/products/veori244841110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(9),
    dcDcChargerRatings: { inputVoltageMinV: 18, inputVoltageMaxV: 35, outputVoltageV: 48, outputCurrentA: 9, outputPowerW: 400, isolated: true }
  },
  {
    id: "orion-tr-48-48-2-5-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 48/48-2.5A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 48,
    maxCurrentA: 3,
    continuousPowerW: 120,
    msrpUsd: 78,
    description: "Victron Orion-Tr 48V/48V-2.5A isolated converter \uFFFD remote on/off",
    partNumber: "ORI484810110",
    productUrl: "https://www.cdnrg.com/products/veori484810110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(3),
    dcDcChargerRatings: { inputVoltageMinV: 36, inputVoltageMaxV: 70, outputVoltageV: 48, outputCurrentA: 3, outputPowerW: 120, isolated: true }
  },
  {
    id: "orion-tr-48-48-6-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 48/48-6A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 48,
    maxCurrentA: 6,
    continuousPowerW: 280,
    msrpUsd: 140,
    description: "Victron Orion-Tr 48V/48V-6A isolated converter \uFFFD remote on/off",
    partNumber: "ORI484828110",
    productUrl: "https://www.cdnrg.com/products/veori484828110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(6),
    dcDcChargerRatings: { inputVoltageMinV: 36, inputVoltageMaxV: 70, outputVoltageV: 48, outputCurrentA: 6, outputPowerW: 280, isolated: true }
  },
  {
    id: "orion-tr-48-48-8-converter",
    manufacturer: "Victron",
    name: "Orion-Tr 48/48-8A Isolated",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 48,
    maxCurrentA: 8,
    continuousPowerW: 380,
    msrpUsd: 246,
    description: "Victron Orion-Tr 48V/48V-8A isolated converter \uFFFD remote on/off",
    partNumber: "ORI484841110",
    productUrl: "https://www.cdnrg.com/products/veori484841110",
    source: "Victron 2025",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: dcDcTerminals(8),
    dcDcChargerRatings: { inputVoltageMinV: 36, inputVoltageMaxV: 70, outputVoltageV: 48, outputCurrentA: 8, outputPowerW: 380, isolated: true }
  }
];

// src/data/products/acChargers.ts
function acChargerTerminals(outputCurrentA) {
  return [
    {
      id: "ac_l",
      label: "AC L",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "sink",
      direction: "input",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: -10,
      domain: "ac",
      notes: "AC input line conductor."
    },
    {
      id: "ac_n",
      label: "AC N",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "neutral",
      role: "sink",
      direction: "input",
      voltageClass: "ac_120v",
      side: "left",
      offsetX: -40,
      offsetY: 10,
      domain: "ac",
      notes: "AC input neutral conductor."
    },
    {
      id: "dc_pos",
      label: "DC+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 40,
      offsetY: -10,
      domain: "dc",
      requiresOvercurrentProtection: true,
      maxCurrentA: outputCurrentA,
      notes: "DC output positive. Fuse required on positive conductor."
    },
    {
      id: "dc_neg",
      label: "DC-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "source",
      direction: "output",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 40,
      offsetY: 10,
      domain: "dc",
      maxCurrentA: outputCurrentA,
      notes: "DC output negative."
    }
  ];
}
var acChargers = [
  // ==========================================================
  // Blue Smart IP22 — portable / bench chargers (120V)
  // ==========================================================
  {
    id: "blue-smart-ip22-15",
    manufacturer: "Victron",
    name: "Blue Smart IP22 Charger 12/15",
    productType: "shore_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 15,
    msrpUsd: 155,
    description: "Victron Blue Smart IP22 Charger 12V/15A \u2014 Bluetooth, 120VAC input",
    partNumber: "BPC121542002",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 80,
    height: 60,
    terminals: acChargerTerminals(15)
  },
  {
    id: "blue-smart-ip22-30",
    manufacturer: "Victron",
    name: "Blue Smart IP22 Charger 12/30",
    productType: "shore_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 30,
    msrpUsd: 202,
    description: "Victron Blue Smart IP22 Charger 12V/30A \u2014 Bluetooth, 120VAC input",
    partNumber: "BPC123047002",
    productUrl: "https://www.cdnrg.com/products/vebpc123047102",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 80,
    height: 60,
    terminals: acChargerTerminals(30)
  },
  {
    id: "blue-smart-ip22-24-16",
    manufacturer: "Victron",
    name: "Blue Smart IP22 Charger 24/16",
    productType: "shore_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 16,
    msrpUsd: 255,
    description: "Victron Blue Smart IP22 Charger 24V/16A \u2014 Bluetooth, 120VAC input",
    partNumber: "BPC241642002",
    productUrl: "https://www.cdnrg.com/products/vebpc241647102",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 80,
    height: 60,
    terminals: acChargerTerminals(16)
  },
  // ==========================================================
  // Blue Smart IP65 — weatherproof chargers
  // ==========================================================
  {
    id: "blue-smart-ip65-12-15",
    manufacturer: "Victron",
    name: "Blue Smart IP65 Charger 12/15",
    productType: "shore_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 15,
    msrpUsd: 176,
    description: "Victron Blue Smart IP65 Charger 12V/15A \u2014 Bluetooth, IP65 weatherproof, 120VAC input",
    partNumber: "BPC121531104R",
    productUrl: "https://www.cdnrg.com/products/vebpc121531104r",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 80,
    height: 60,
    terminals: acChargerTerminals(15)
  },
  // ==========================================================
  // Skylla-IP65 — heavy-duty industrial charger
  // ==========================================================
  {
    id: "skylla-ip65-24-70",
    manufacturer: "Victron",
    name: "Skylla-IP65 24/70 Charger",
    productType: "shore_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 70,
    continuousPowerW: 1680,
    msrpUsd: 1350,
    description: "Victron Skylla-IP65 24V/70A \u2014 industrial AC charger with CAN-bus, IP65, 120/240VAC input",
    partNumber: "SKI024070000",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 80,
    height: 60,
    terminals: acChargerTerminals(70)
  }
];

// src/data/products/solar.ts
function solarCombinerTerminals(strings) {
  const spacing = strings > 1 ? 60 / (strings - 1) : 0;
  const inputs = Array.from({ length: strings }, (_, index) => {
    const y = strings === 1 ? 0 : -30 + spacing * index;
    const label = index + 1;
    return [
      {
        id: `string_${label}_pos`,
        label: `S${label}+`,
        electricalType: "pv_pos",
        kind: "pv_power",
        polarity: "positive",
        role: "bus",
        voltageClass: "pv_high_voltage",
        side: "left",
        offsetX: -70,
        offsetY: y - 4,
        domain: "pv",
        notes: `String ${label} positive input.`
      },
      {
        id: `string_${label}_neg`,
        label: `S${label}-`,
        electricalType: "pv_neg",
        kind: "pv_power",
        polarity: "negative",
        role: "bus",
        voltageClass: "pv_high_voltage",
        side: "left",
        offsetX: -70,
        offsetY: y + 4,
        domain: "pv",
        notes: `String ${label} negative input.`
      }
    ];
  }).flat();
  return [
    ...inputs,
    {
      id: "out_pos",
      label: "Out+",
      electricalType: "pv_pos",
      kind: "pv_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "right",
      offsetX: 70,
      offsetY: -10,
      domain: "pv",
      notes: "Combined PV positive output to MPPT."
    },
    {
      id: "out_neg",
      label: "Out-",
      electricalType: "pv_neg",
      kind: "pv_power",
      polarity: "negative",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "right",
      offsetX: 70,
      offsetY: 10,
      domain: "pv",
      notes: "Combined PV negative output to MPPT."
    }
  ];
}
function solarBranchConnectorSize(branches) {
  if (branches === 2) return { width: 70, height: 100 };
  if (branches === 3) return { width: 52, height: 144 };
  return { width: 120, height: 76 };
}
function solarBranchConnectorTerminals(branches, width, height) {
  const usableHeight = height * 0.62;
  const spacing = branches > 1 ? usableHeight / (branches - 1) : 0;
  const inputs = Array.from({ length: branches }, (_, index) => {
    const label = index + 1;
    const y = branches === 1 ? 0 : -usableHeight / 2 + spacing * index;
    return {
      id: `in_${label}`,
      label: `In ${label}+`,
      electricalType: "pv_pos",
      kind: "pv_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "left",
      offsetX: -width / 2,
      offsetY: y,
      domain: "pv",
      notes: `PV branch input ${label}. Polarity is selected on the component.`
    };
  });
  return [
    ...inputs,
    {
      id: "out",
      label: "Out+",
      electricalType: "pv_pos",
      kind: "pv_power",
      polarity: "positive",
      role: "bus",
      voltageClass: "pv_high_voltage",
      side: "right",
      offsetX: width / 2,
      offsetY: 0,
      domain: "pv",
      notes: "Combined PV branch output. Polarity is selected on the component."
    }
  ];
}
var solarCombinerBoxes = [2, 3, 4, 6].map((strings) => ({
  id: `solar-combiner-${strings}-string`,
  manufacturer: "Generic",
  name: `Solar Combiner ${strings}-string`,
  productType: "solar_combiner",
  category: `${strings} strings`,
  maxPvVoltageV: 150,
  maxPvCurrentA: strings * 15,
  msrpUsd: 65 + strings * 28,
  oemPriceUsd: Math.round((65 + strings * 28) * 0.7),
  description: `PV combiner box for ${strings} solar strings with combined positive and negative outputs`,
  source: "Estimate",
  dataQuality: "placeholder",
  width: 140,
  height: 100,
  terminals: solarCombinerTerminals(strings),
  solarCombinerRatings: {
    stringCount: strings,
    inputCount: strings * 2,
    outputCount: 2,
    maxVoltageV: 150,
    maxCurrentA: strings * 15,
    includedProtection: "None (add fuses per string as needed)"
  }
}));
var solarBranchConnectors = [2, 3, 4].map((branches) => {
  const { width, height } = solarBranchConnectorSize(branches);
  return {
    id: `solar-branch-${branches}-1`,
    manufacturer: "Generic",
    name: `${branches}-1 PV Branch Connector`,
    productType: "solar_combiner",
    category: "Connectors",
    imageUrl: `/product-images/pv-branch-${branches}-1.svg`,
    maxPvVoltageV: 1e3,
    maxPvCurrentA: branches * 15,
    msrpUsd: 18 + branches * 6,
    oemPriceUsd: Math.round((18 + branches * 6) * 0.7),
    description: `${branches}-to-1 PV branch connector for combining ${branches} same-polarity solar conductors. Select PV+ or PV- on the placed component.`,
    source: "Estimate",
    dataQuality: "placeholder",
    width,
    height,
    terminals: solarBranchConnectorTerminals(branches, width, height),
    solarCombinerRatings: {
      stringCount: branches,
      inputCount: branches,
      outputCount: 1,
      maxVoltageV: 1e3,
      maxCurrentA: branches * 15,
      includedProtection: "None (branch connector only)"
    }
  };
});
var arrayTerminals = [
  {
    id: "pv_pos",
    label: "PV+",
    electricalType: "pv_pos",
    kind: "pv_power",
    polarity: "positive",
    role: "source",
    voltageClass: "pv_high_voltage",
    side: "bottom",
    offsetX: 25,
    offsetY: 40,
    domain: "pv",
    connector: { kind: "mc4_male" },
    notes: "PV array positive output."
  },
  {
    id: "pv_neg",
    label: "PV-",
    electricalType: "pv_neg",
    kind: "pv_power",
    polarity: "negative",
    role: "source",
    voltageClass: "pv_high_voltage",
    side: "bottom",
    offsetX: -25,
    offsetY: 40,
    domain: "pv",
    connector: { kind: "mc4_female" },
    notes: "PV array negative output."
  }
];
var solarArrays = [
  // ----------------------------------------------------------
  // Generic Solar Array 400W
  // ----------------------------------------------------------
  {
    id: "solar-array-400w",
    manufacturer: "Generic",
    name: "Solar Array 400W",
    productType: "solar_array",
    category: "Solar",
    continuousPowerW: 400,
    maxPvVoltageV: 40,
    maxPvCurrentA: 10,
    msrpUsd: 320,
    oemPriceUsd: 224,
    description: "400W solar array placeholder (1x 400W panel)",
    source: "Estimate",
    dataQuality: "placeholder",
    width: 120,
    height: 80,
    terminals: arrayTerminals,
    solarPanelRatings: {
      vocV: 40,
      vmpV: 34,
      iscA: 12,
      impA: 10,
      powerW: 400
    }
  },
  // ----------------------------------------------------------
  // Generic Solar Array 800W
  // ----------------------------------------------------------
  {
    id: "solar-array-800w",
    manufacturer: "Generic",
    name: "Solar Array 800W",
    productType: "solar_array",
    category: "Solar",
    continuousPowerW: 800,
    maxPvVoltageV: 80,
    maxPvCurrentA: 10,
    msrpUsd: 640,
    oemPriceUsd: 448,
    description: "800W solar array placeholder (2x 400W panels)",
    source: "Estimate",
    dataQuality: "placeholder",
    width: 120,
    height: 80,
    terminals: arrayTerminals,
    solarPanelRatings: {
      vocV: 80,
      vmpV: 68,
      iscA: 12,
      impA: 10,
      powerW: 800
    }
  },
  // ----------------------------------------------------------
  // Generic Solar Array 2000W
  // ----------------------------------------------------------
  {
    id: "solar-array-2000w",
    manufacturer: "Generic",
    name: "Solar Array 2000W",
    productType: "solar_array",
    category: "Solar",
    continuousPowerW: 2e3,
    maxPvVoltageV: 200,
    maxPvCurrentA: 10,
    msrpUsd: 1600,
    oemPriceUsd: 1120,
    description: "2000W solar array placeholder (5x 400W panels)",
    source: "Estimate",
    dataQuality: "placeholder",
    width: 120,
    height: 80,
    terminals: arrayTerminals,
    solarPanelRatings: {
      vocV: 200,
      vmpV: 170,
      iscA: 12,
      impA: 10,
      powerW: 2e3
    }
  },
  // Combiner boxes
  ...solarCombinerBoxes,
  ...solarBranchConnectors
];

// src/data/products/distribution.ts
function busbarTerminals(points) {
  const width = Math.max(140, 28 + points * 18);
  const inset = 18;
  const usableWidth = width - inset * 2;
  const spacing = points > 1 ? usableWidth / (points - 1) : 0;
  return Array.from({ length: points }, (_, index) => {
    const label = index + 1;
    const x = points === 1 ? 0 : -usableWidth / 2 + spacing * index;
    const terminal = {
      id: `terminal_${label}`,
      label: `T${label}`,
      electricalType: "generic",
      kind: "generic",
      role: "bus",
      side: "bottom",
      offsetX: x,
      offsetY: 30,
      // domain will be resolved at runtime via effectiveTerminals
      // (polarity is set by component.busPolarity assignment)
      notes: "Bus connection point. Polarity determined by component busPolarity assignment."
    };
    return terminal;
  });
}
var genericBusbars = [2, 4, 5, 6, 7, 8].map((points) => {
  const basePrice = 29 + points * 8;
  const width = Math.max(140, 28 + points * 18);
  const maxCurrentA = points <= 4 ? 400 : 600;
  return {
    id: points === 4 ? "dist-generic-busbar" : `dist-generic-busbar-${points}pt`,
    manufacturer: "Generic",
    name: `Generic Busbar ${points}-point`,
    productType: "busbar",
    category: `${points} connection points`,
    nominalVoltage: [12, 24, 48],
    maxCurrentA,
    msrpUsd: basePrice,
    oemPriceUsd: Math.round(basePrice * 0.7),
    description: `Single-conductor DC busbar with ${points} connection points. Set the bus assignment on the placed component.`,
    source: "Estimate",
    dataQuality: "placeholder",
    width,
    height: 80,
    terminals: busbarTerminals(points),
    busbarRatings: {
      currentRatingA: maxCurrentA,
      connectionCount: points
      // busDesignation is determined at runtime by component.busPolarity
    }
  };
});
var distribution = [
  // ----------------------------------------------------------
  // Victron Lynx Distributor
  // ----------------------------------------------------------
  {
    id: "dist-vic-lynx-distributor",
    manufacturer: "Victron",
    name: "Lynx Distributor",
    productType: "dc_distribution",
    category: "Distribution",
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 1e3,
    msrpUsd: 349,
    oemPriceUsd: 244,
    description: "Victron Lynx Distributor - 4-way DC busbar with fuse holders",
    partNumber: "LYN060102000",
    productUrl: "https://www.cdnrg.com/products/velyn060102000",
    source: "Victron 2024",
    dataQuality: "partial",
    width: 220,
    height: 100,
    terminals: [
      {
        id: "main_pos",
        label: "Bat+",
        busLinkStandard: "victron-lynx",
        electricalType: "dc_pos",
        kind: "dc_power",
        polarity: "positive",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "left",
        offsetX: -110,
        offsetY: -20,
        domain: "dc",
        notes: "Main positive bus connection (battery side). Bidirectional."
      },
      {
        id: "main_neg",
        label: "Bat-",
        busLinkStandard: "victron-lynx",
        electricalType: "dc_neg",
        kind: "dc_power",
        polarity: "negative",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "left",
        offsetX: -110,
        offsetY: 20,
        domain: "dc",
        notes: "Main negative bus connection (battery side). Bidirectional."
      },
      {
        id: "pass_pos",
        label: "Bus+",
        busLinkStandard: "victron-lynx",
        electricalType: "dc_pos",
        kind: "dc_power",
        polarity: "positive",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "right",
        offsetX: 110,
        offsetY: -20,
        domain: "dc",
        notes: "Unfused positive pass-through to the next Lynx module. Bidirectional."
      },
      {
        id: "pass_neg",
        label: "Bus-",
        busLinkStandard: "victron-lynx",
        electricalType: "dc_neg",
        kind: "dc_power",
        polarity: "negative",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "right",
        offsetX: 110,
        offsetY: 20,
        domain: "dc",
        notes: "Unfused negative pass-through to the next Lynx module. Bidirectional."
      },
      {
        id: "out_pos_1",
        label: "F1+",
        electricalType: "dc_pos",
        kind: "dc_power",
        polarity: "positive",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "bottom",
        offsetX: -88,
        offsetY: 50,
        domain: "dc",
        requiresOvercurrentProtection: true,
        notes: "Fused tap 1 (+), MEGA fuse holder. Source or load depending on topology."
      },
      {
        id: "out_neg_1",
        label: "F1-",
        electricalType: "dc_neg",
        kind: "dc_power",
        polarity: "negative",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "bottom",
        offsetX: -63,
        offsetY: 50,
        domain: "dc",
        notes: "Fused tap 1 (-), paired negative return."
      },
      {
        id: "out_pos_2",
        label: "F2+",
        electricalType: "dc_pos",
        kind: "dc_power",
        polarity: "positive",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "bottom",
        offsetX: -38,
        offsetY: 50,
        domain: "dc",
        requiresOvercurrentProtection: true,
        notes: "Fused tap 2 (+), MEGA fuse holder. Source or load depending on topology."
      },
      {
        id: "out_neg_2",
        label: "F2-",
        electricalType: "dc_neg",
        kind: "dc_power",
        polarity: "negative",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "bottom",
        offsetX: -13,
        offsetY: 50,
        domain: "dc",
        notes: "Fused tap 2 (-), paired negative return."
      },
      {
        id: "out_pos_3",
        label: "F3+",
        electricalType: "dc_pos",
        kind: "dc_power",
        polarity: "positive",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "bottom",
        offsetX: 13,
        offsetY: 50,
        domain: "dc",
        requiresOvercurrentProtection: true,
        notes: "Fused tap 3 (+), MEGA fuse holder. Source or load depending on topology."
      },
      {
        id: "out_neg_3",
        label: "F3-",
        electricalType: "dc_neg",
        kind: "dc_power",
        polarity: "negative",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "bottom",
        offsetX: 38,
        offsetY: 50,
        domain: "dc",
        notes: "Fused tap 3 (-), paired negative return."
      },
      {
        id: "out_pos_4",
        label: "F4+",
        electricalType: "dc_pos",
        kind: "dc_power",
        polarity: "positive",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "bottom",
        offsetX: 63,
        offsetY: 50,
        domain: "dc",
        requiresOvercurrentProtection: true,
        notes: "Fused tap 4 (+), MEGA fuse holder. Source or load depending on topology."
      },
      {
        id: "out_neg_4",
        label: "F4-",
        electricalType: "dc_neg",
        kind: "dc_power",
        polarity: "negative",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "bottom",
        offsetX: 88,
        offsetY: 50,
        domain: "dc",
        notes: "Fused tap 4 (-), paired negative return."
      }
    ],
    busbarRatings: {
      voltageRatingV: 58,
      currentRatingA: 1e3,
      connectionCount: 4,
      busDesignation: "combined"
    },
    distributionTopology: {
      buses: [
        { id: "positive_bus", label: "Positive Bus", busType: "dc_pos", terminalIds: ["main_pos", "pass_pos"], maxCurrentA: 1e3 },
        {
          id: "negative_bus",
          label: "Negative Bus",
          busType: "dc_neg",
          terminalIds: ["main_neg", "pass_neg", "out_neg_1", "out_neg_2", "out_neg_3", "out_neg_4"],
          maxCurrentA: 1e3
        }
      ],
      fuseSlots: [1, 2, 3, 4].map((slot) => ({
        id: `slot_${slot}`,
        label: `Fuse ${slot}`,
        upstreamBusId: "positive_bus",
        downstreamTerminalId: `out_pos_${slot}`,
        pairedReturnTerminalId: `out_neg_${slot}`,
        fuseStyle: "MEGA",
        protectionType: "fuse",
        defaultInstalled: false,
        maxFuseA: 500
      }))
    }
  },
  // ----------------------------------------------------------
  // Victron Lynx Power In
  // ----------------------------------------------------------
  {
    id: "dist-vic-lynx-power-in",
    manufacturer: "Victron",
    name: "Lynx Power In",
    productType: "dc_distribution",
    category: "Distribution",
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 1e3,
    msrpUsd: 249,
    oemPriceUsd: 174,
    description: "Victron Lynx Power In - unfused DC busbar module (same housing as the Lynx Distributor, no fuses)",
    partNumber: "LYN040102000",
    productUrl: "https://www.victronenergy.com/dc-distribution-systems/lynx-power-in",
    source: "Victron 2024",
    dataQuality: "partial",
    width: 220,
    height: 100,
    terminals: [
      {
        id: "main_pos",
        label: "Bat+",
        busLinkStandard: "victron-lynx",
        electricalType: "dc_pos",
        kind: "dc_power",
        polarity: "positive",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "left",
        offsetX: -110,
        offsetY: -20,
        domain: "dc",
        notes: "Main positive input (battery side). Bidirectional."
      },
      {
        id: "main_neg",
        label: "Bat-",
        busLinkStandard: "victron-lynx",
        electricalType: "dc_neg",
        kind: "dc_power",
        polarity: "negative",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "left",
        offsetX: -110,
        offsetY: 20,
        domain: "dc",
        notes: "Main negative input (battery side). Bidirectional."
      },
      {
        id: "pass_pos",
        label: "Bus+",
        busLinkStandard: "victron-lynx",
        electricalType: "dc_pos",
        kind: "dc_power",
        polarity: "positive",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "right",
        offsetX: 110,
        offsetY: -20,
        domain: "dc",
        notes: "Unfused positive pass-through to the next Lynx module. Bidirectional."
      },
      {
        id: "pass_neg",
        label: "Bus-",
        busLinkStandard: "victron-lynx",
        electricalType: "dc_neg",
        kind: "dc_power",
        polarity: "negative",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "right",
        offsetX: 110,
        offsetY: 20,
        domain: "dc",
        notes: "Unfused negative pass-through to the next Lynx module. Bidirectional."
      },
      {
        id: "out_pos_1",
        label: "+1",
        electricalType: "dc_pos",
        kind: "dc_power",
        polarity: "positive",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "bottom",
        offsetX: -88,
        offsetY: 50,
        domain: "dc",
        notes: "Unfused positive bus connection. Source or load depending on topology."
      },
      {
        id: "out_neg_1",
        label: "-1",
        electricalType: "dc_neg",
        kind: "dc_power",
        polarity: "negative",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "bottom",
        offsetX: -63,
        offsetY: 50,
        domain: "dc",
        notes: "Unfused negative bus connection. Source or load depending on topology."
      },
      {
        id: "out_pos_2",
        label: "+2",
        electricalType: "dc_pos",
        kind: "dc_power",
        polarity: "positive",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "bottom",
        offsetX: -38,
        offsetY: 50,
        domain: "dc",
        notes: "Unfused positive bus connection. Source or load depending on topology."
      },
      {
        id: "out_neg_2",
        label: "-2",
        electricalType: "dc_neg",
        kind: "dc_power",
        polarity: "negative",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "bottom",
        offsetX: -13,
        offsetY: 50,
        domain: "dc",
        notes: "Unfused negative bus connection. Source or load depending on topology."
      },
      {
        id: "out_pos_3",
        label: "+3",
        electricalType: "dc_pos",
        kind: "dc_power",
        polarity: "positive",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "bottom",
        offsetX: 13,
        offsetY: 50,
        domain: "dc",
        notes: "Unfused positive bus connection. Source or load depending on topology."
      },
      {
        id: "out_neg_3",
        label: "-3",
        electricalType: "dc_neg",
        kind: "dc_power",
        polarity: "negative",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "bottom",
        offsetX: 38,
        offsetY: 50,
        domain: "dc",
        notes: "Unfused negative bus connection. Source or load depending on topology."
      },
      {
        id: "out_pos_4",
        label: "+4",
        electricalType: "dc_pos",
        kind: "dc_power",
        polarity: "positive",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "bottom",
        offsetX: 63,
        offsetY: 50,
        domain: "dc",
        notes: "Unfused positive bus connection. Source or load depending on topology."
      },
      {
        id: "out_neg_4",
        label: "-4",
        electricalType: "dc_neg",
        kind: "dc_power",
        polarity: "negative",
        role: "bus",
        voltageClass: "dc_low_voltage",
        side: "bottom",
        offsetX: 88,
        offsetY: 50,
        domain: "dc",
        notes: "Unfused negative bus connection. Source or load depending on topology."
      }
    ],
    busbarRatings: {
      voltageRatingV: 58,
      currentRatingA: 1e3,
      connectionCount: 4,
      busDesignation: "combined"
    },
    // Unfused busbar: two buses join every connection point; no fuse slots.
    // Having a topology also makes it render as the schematic symbol (matching the
    // Distributor) instead of the product photo.
    distributionTopology: {
      buses: [
        {
          id: "positive_bus",
          label: "Positive Bus",
          busType: "dc_pos",
          terminalIds: ["main_pos", "pass_pos", "out_pos_1", "out_pos_2", "out_pos_3", "out_pos_4"],
          maxCurrentA: 1e3
        },
        {
          id: "negative_bus",
          label: "Negative Bus",
          busType: "dc_neg",
          terminalIds: ["main_neg", "pass_neg", "out_neg_1", "out_neg_2", "out_neg_3", "out_neg_4"],
          maxCurrentA: 1e3
        }
      ]
    }
  },
  // Generic busbars spread in at the end (same as before)
  ...genericBusbars,
  // ==========================================================
  // Lynx Smart BMS — battery management and DC distribution
  // ==========================================================
  {
    id: "lynx-smart-bms",
    manufacturer: "Victron",
    name: "Lynx Smart BMS 500",
    productType: "dc_distribution",
    category: "Distribution",
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 500,
    msrpUsd: 799,
    description: "Victron Lynx Smart BMS 500A \u2014 battery management system for Victron Lithium batteries. VE.Can / Bluetooth.",
    partNumber: "LYN034160200",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 140,
    height: 100,
    terminals: [
      { id: "bat_pos", label: "Bat+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "bus", voltageClass: "dc_low_voltage", side: "left", offsetX: -70, offsetY: -15 },
      { id: "bat_neg", label: "Bat-", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "bus", voltageClass: "dc_low_voltage", side: "left", offsetX: -70, offsetY: 15 },
      { id: "load_pos", label: "Load+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "bus", voltageClass: "dc_low_voltage", side: "right", offsetX: 70, offsetY: -15 },
      { id: "load_neg", label: "Load-", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "bus", voltageClass: "dc_low_voltage", side: "right", offsetX: 70, offsetY: 15 }
    ],
    busbarRatings: { voltageRatingV: 58, currentRatingA: 500, busDesignation: "combined" }
  },
  {
    id: "lynx-smart-bms-ng-500",
    manufacturer: "Victron",
    name: "Lynx Smart BMS NG 500",
    productType: "dc_distribution",
    category: "Distribution",
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 500,
    msrpUsd: 950,
    description: "Victron Lynx Smart BMS NG 500A \u2014 next-generation BMS for Victron Lithium NG batteries. VE.Can / Bluetooth.",
    partNumber: "Lynx Smart BMS NG 500",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs. Intended for Victron Lithium NG battery systems.",
    width: 140,
    height: 100,
    terminals: [
      { id: "bat_pos", label: "Bat+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "bus", voltageClass: "dc_low_voltage", side: "left", offsetX: -70, offsetY: -15 },
      { id: "bat_neg", label: "Bat-", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "bus", voltageClass: "dc_low_voltage", side: "left", offsetX: -70, offsetY: 15 },
      { id: "load_pos", label: "Load+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "bus", voltageClass: "dc_low_voltage", side: "right", offsetX: 70, offsetY: -15 },
      { id: "load_neg", label: "Load-", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "bus", voltageClass: "dc_low_voltage", side: "right", offsetX: 70, offsetY: 15 }
    ],
    busbarRatings: { voltageRatingV: 58, currentRatingA: 500, busDesignation: "combined" }
  },
  {
    id: "lynx-smart-bms-ng-1000",
    manufacturer: "Victron",
    name: "Lynx Smart BMS NG 1000",
    productType: "dc_distribution",
    category: "Distribution",
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 1e3,
    msrpUsd: 1300,
    description: "Victron Lynx Smart BMS NG 1000A \u2014 next-generation BMS for large Victron Lithium NG battery banks. VE.Can / Bluetooth.",
    partNumber: "Lynx Smart BMS NG 1000",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs. Intended for Victron Lithium NG battery systems.",
    width: 140,
    height: 100,
    terminals: [
      { id: "bat_pos", label: "Bat+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "bus", voltageClass: "dc_low_voltage", side: "left", offsetX: -70, offsetY: -15 },
      { id: "bat_neg", label: "Bat-", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "bus", voltageClass: "dc_low_voltage", side: "left", offsetX: -70, offsetY: 15 },
      { id: "load_pos", label: "Load+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "bus", voltageClass: "dc_low_voltage", side: "right", offsetX: 70, offsetY: -15 },
      { id: "load_neg", label: "Load-", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "bus", voltageClass: "dc_low_voltage", side: "right", offsetX: 70, offsetY: 15 }
    ],
    busbarRatings: { voltageRatingV: 58, currentRatingA: 1e3, busDesignation: "combined" }
  },
  // ==========================================================
  // VE.Bus BMS NG — for Victron Lithium NG batteries
  // ==========================================================
  {
    id: "ve-bus-bms-ng",
    manufacturer: "Victron",
    name: "VE.Bus BMS NG",
    productType: "dc_distribution",
    category: "Distribution",
    nominalVoltage: [12, 24, 48],
    msrpUsd: 260,
    description: "Victron VE.Bus BMS NG \u2014 battery management system for Victron Lithium NG batteries. VE.Bus / Bluetooth.",
    partNumber: "VE.Bus BMS NG",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs. Intended for Victron Lithium NG battery systems.",
    width: 80,
    height: 60,
    terminals: [
      { id: "bat_pos", label: "Bat+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "bus", voltageClass: "dc_low_voltage", side: "left", offsetX: -40, offsetY: 0 },
      { id: "signal", label: "VE.Bus", electricalType: "signal", kind: "signal", role: "control", voltageClass: "signal_low_voltage", side: "right", offsetX: 40, offsetY: 0 }
    ]
  },
  // ==========================================================
  // Lynx Shunt VE.Can — precision current measurement
  // ==========================================================
  {
    id: "lynx-shunt-ve-can",
    manufacturer: "Victron",
    name: "Lynx Shunt VE.Can",
    productType: "dc_distribution",
    category: "Distribution",
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 1e3,
    msrpUsd: 420,
    description: "Victron Lynx Shunt VE.Can \u2014 precision 1000A current measurement module for the Lynx system. VE.Can communication.",
    partNumber: "LYN040102100",
    productUrl: "https://www.cdnrg.com/products/velyn040102100",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 140,
    height: 100,
    terminals: [
      { id: "main_pos", label: "Main+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "bus", voltageClass: "dc_low_voltage", side: "left", offsetX: -70, offsetY: -15 },
      { id: "main_neg", label: "Main-", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "bus", voltageClass: "dc_low_voltage", side: "left", offsetX: -70, offsetY: 15 },
      { id: "out_pos", label: "Out+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "bus", voltageClass: "dc_low_voltage", side: "right", offsetX: 70, offsetY: -15 },
      { id: "out_neg", label: "Out-", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "bus", voltageClass: "dc_low_voltage", side: "right", offsetX: 70, offsetY: 15 }
    ],
    busbarRatings: { voltageRatingV: 58, currentRatingA: 1e3, busDesignation: "combined" }
  },
  // ==========================================================
  // Lynx Class-T Power In — with Class-T fuse protection
  // ==========================================================
  {
    id: "lynx-class-t-power-in",
    manufacturer: "Victron",
    name: "Lynx Class-T Power In",
    productType: "dc_distribution",
    category: "Distribution",
    nominalVoltage: [12, 24, 48],
    maxCurrentA: 1e3,
    msrpUsd: 172,
    description: "Victron Lynx Class-T Power In \u2014 DC busbar input module with integrated Class-T fuse holder.",
    partNumber: "LYN020102010",
    productUrl: "https://www.victronenergy.com/dc-distribution-systems/lynx-class-t-power-in",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 140,
    height: 100,
    terminals: [
      { id: "main_pos", label: "Bat+", busLinkStandard: "victron-lynx", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "bus", voltageClass: "dc_low_voltage", side: "left", offsetX: -70, offsetY: -20, notes: "Main positive input (battery side). Bidirectional." },
      { id: "main_neg", label: "Bat-", busLinkStandard: "victron-lynx", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "bus", voltageClass: "dc_low_voltage", side: "left", offsetX: -70, offsetY: 20, notes: "Main negative input (battery side). Bidirectional." },
      { id: "pass_pos", label: "Bus+", busLinkStandard: "victron-lynx", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "bus", voltageClass: "dc_low_voltage", side: "right", offsetX: 70, offsetY: -20, notes: "Unfused positive pass-through to the next Lynx module. Bidirectional." },
      { id: "pass_neg", label: "Bus-", busLinkStandard: "victron-lynx", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "bus", voltageClass: "dc_low_voltage", side: "right", offsetX: 70, offsetY: 20, notes: "Unfused negative pass-through to the next Lynx module. Bidirectional." },
      { id: "out_pos_1", label: "F1+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "bus", voltageClass: "dc_low_voltage", side: "bottom", offsetX: -45, offsetY: 50, requiresOvercurrentProtection: true, notes: "Fused tap 1 (+), Class-T fuse holder. Source or load depending on topology." },
      { id: "out_neg_1", label: "F1-", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "bus", voltageClass: "dc_low_voltage", side: "bottom", offsetX: -15, offsetY: 50, notes: "Fused tap 1 (-), paired negative return." },
      { id: "out_pos_2", label: "F2+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "bus", voltageClass: "dc_low_voltage", side: "bottom", offsetX: 15, offsetY: 50, requiresOvercurrentProtection: true, notes: "Fused tap 2 (+), Class-T fuse holder. Source or load depending on topology." },
      { id: "out_neg_2", label: "F2-", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "bus", voltageClass: "dc_low_voltage", side: "bottom", offsetX: 45, offsetY: 50, notes: "Fused tap 2 (-), paired negative return." }
    ],
    busbarRatings: { voltageRatingV: 58, currentRatingA: 1e3, busDesignation: "combined" },
    distributionTopology: {
      buses: [
        { id: "positive_bus", label: "Positive Bus", busType: "dc_pos", terminalIds: ["main_pos", "pass_pos"], maxCurrentA: 1e3 },
        { id: "negative_bus", label: "Negative Bus", busType: "dc_neg", terminalIds: ["main_neg", "pass_neg", "out_neg_1", "out_neg_2"], maxCurrentA: 1e3 }
      ],
      fuseSlots: [1, 2].map((slot) => ({
        id: `slot_${slot}`,
        label: `Class-T Fuse ${slot}`,
        upstreamBusId: "positive_bus",
        downstreamTerminalId: `out_pos_${slot}`,
        pairedReturnTerminalId: `out_neg_${slot}`,
        fuseStyle: "Class T",
        protectionType: "fuse",
        defaultInstalled: false,
        maxFuseA: 600
      }))
    }
  }
];

// src/data/products/protection.ts
var fuseTerminals = [
  {
    id: "in",
    label: "A",
    electricalType: "dc_pos",
    kind: "dc_power",
    polarity: "positive",
    role: "pass_through",
    direction: "bidirectional",
    voltageClass: "dc_low_voltage",
    side: "left",
    offsetX: -40,
    offsetY: 0,
    domain: "dc"
  },
  {
    id: "out",
    label: "B",
    electricalType: "dc_pos",
    kind: "dc_power",
    polarity: "positive",
    role: "pass_through",
    direction: "bidirectional",
    voltageClass: "dc_low_voltage",
    side: "right",
    offsetX: 40,
    offsetY: 0,
    domain: "dc"
  }
];
var fuseCatalog = [
  {
    type: "MIDI",
    ratings: [30, 40, 50, 60, 70, 80, 100, 125, 150, 175, 200],
    msrpBase: 10,
    source: "Catalog scrape: MIDI/AMI fuse ranges"
  },
  {
    type: "MEGA",
    ratings: [60, 80, 100, 125, 150, 175, 200, 225, 250, 300, 400, 500],
    msrpBase: 12,
    source: "Catalog scrape: MEGA fuse ranges"
  },
  {
    type: "ANL",
    ratings: [35, 40, 50, 60, 80, 100, 130, 150, 175, 200, 225, 250, 300, 325, 350, 400, 500, 600, 750],
    msrpBase: 16,
    source: "Catalog scrape: ANL fuse ranges"
  },
  {
    type: "Class T",
    ratings: [110, 125, 150, 175, 200, 225, 250, 300, 350, 400, 450, 500, 600],
    msrpBase: 38,
    source: "Catalog scrape: Class T fuse ranges"
  },
  {
    type: "MRBF",
    ratings: [30, 40, 50, 60, 75, 80, 100, 125, 150, 175, 200, 225, 250, 300],
    msrpBase: 18,
    source: "Catalog scrape: MRBF terminal fuse ranges"
  }
];
function fuseId(type, rating) {
  return `fuse-${type.toLowerCase().replace(/\s+/g, "-")}-${rating}a`;
}
function fusePrice(type, rating, base) {
  const multiplier = type === "Class T" ? 0.055 : rating >= 400 ? 0.05 : 0.025;
  return Math.round(base + rating * multiplier);
}
function fuseInterruptRating(type) {
  switch (type) {
    case "Class T":
      return 2e4;
    case "ANL":
      return 6e3;
    case "MEGA":
      return 2e3;
    case "MIDI":
      return 2e3;
    case "MRBF":
      return 2e3;
    default:
      return void 0;
  }
}
function fuseImageUrl(type) {
  return `/product-images/fuse-${type.toLowerCase().replace(/\s+/g, "-")}.svg`;
}
var fuses = fuseCatalog.flatMap(
  ({ type, ratings, msrpBase, source }) => ratings.map((rating) => {
    const msrp = fusePrice(type, rating, msrpBase);
    return {
      id: fuseId(type, rating),
      manufacturer: "Generic",
      name: `${type} Fuse ${rating}A`,
      productType: "fuse",
      category: type,
      maxCurrentA: rating,
      msrpUsd: msrp,
      oemPriceUsd: Math.round(msrp * 0.7),
      description: `${type} fuse, ${rating}A DC protection`,
      source,
      dataQuality: "placeholder",
      imageUrl: fuseImageUrl(type),
      width: 80,
      height: 34,
      terminals: fuseTerminals,
      protectionRatings: {
        currentRatingA: rating,
        voltageRatingV: 58,
        interruptRatingA: fuseInterruptRating(type),
        acDcCompatibility: "dc",
        fuseStyle: type,
        protectionType: "fuse"
      }
    };
  })
);
var breakerTerminals = fuseTerminals;
var breakerCatalog = [
  {
    type: "DC Breaker",
    ratings: [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 100, 125, 150, 175, 200, 250, 300],
    msrpBase: 20,
    voltageRatingV: 48,
    source: "Catalog estimate: DC circuit breakers"
  },
  {
    type: "Smart BatteryProtect",
    ratings: [65, 100, 220],
    msrpBase: 60,
    voltageRatingV: 34,
    source: "Victron 2025"
  }
];
function breakerId(type, rating) {
  return `breaker-${type.toLowerCase().replace(/\s+/g, "-")}-${rating}a`;
}
function breakerPrice(type, rating, base) {
  const multiplier = type === "Smart BatteryProtect" ? 0.3 : 0.25;
  return Math.round(base + rating * multiplier);
}
function breakerImageUrl(type) {
  if (type === "DC Breaker") return "/product-images/breaker-dc-breaker.svg";
  return "/product-images/generic-breaker.svg";
}
var breakers = breakerCatalog.flatMap(
  ({ type, ratings, msrpBase, voltageRatingV, source }) => ratings.map((rating) => {
    const msrp = breakerPrice(type, rating, msrpBase);
    return {
      id: breakerId(type, rating),
      manufacturer: "Generic",
      name: `${type} ${rating}A`,
      productType: "breaker",
      category: type,
      maxCurrentA: rating,
      msrpUsd: msrp,
      oemPriceUsd: Math.round(msrp * 0.7),
      description: `${type} ${rating}A DC protection`,
      source,
      dataQuality: "placeholder",
      imageUrl: breakerImageUrl(type),
      width: 80,
      height: 34,
      terminals: breakerTerminals,
      protectionRatings: {
        currentRatingA: rating,
        voltageRatingV,
        acDcCompatibility: "dc",
        breakerStyle: type,
        protectionType: "breaker"
      }
    };
  })
);
var acBreakerRatings = [6, 10, 15, 16, 20, 25, 30, 32, 40, 50, 63];
var acBreakerCatalog = [
  {
    poles: 1,
    type: "AC DIN 1P",
    msrpBase: 12,
    voltageRatingV: 277,
    imageUrl: "/product-images/breaker-ac-din-1p.svg",
    width: 48,
    height: 120
  },
  {
    poles: 2,
    type: "AC DIN 2P",
    msrpBase: 24,
    voltageRatingV: 480,
    imageUrl: "/product-images/breaker-ac-din-2p.svg",
    width: 84,
    height: 120
  },
  {
    poles: 3,
    type: "AC DIN 3P",
    msrpBase: 36,
    voltageRatingV: 480,
    imageUrl: "/product-images/breaker-ac-din-3p.svg",
    width: 120,
    height: 120
  }
];
var acBreakerSvgGeometry = {
  1: { viewBoxWidth: 160, viewBoxHeight: 360, topScrewY: 55, bottomScrewY: 306, screwCentersX: [80] },
  2: { viewBoxWidth: 260, viewBoxHeight: 360, topScrewY: 55, bottomScrewY: 306, screwCentersX: [91, 169] },
  3: { viewBoxWidth: 360, viewBoxHeight: 360, topScrewY: 58, bottomScrewY: 296, screwCentersX: [98, 180, 262] }
};
function svgPointToProductOffset(svgX, svgY, geometry, width, height) {
  return {
    offsetX: (svgX / geometry.viewBoxWidth - 0.5) * width,
    offsetY: (svgY / geometry.viewBoxHeight - 0.5) * height
  };
}
function acBreakerTerminals(poles, rating, width, height) {
  const geometry = acBreakerSvgGeometry[poles];
  const phases = poles;
  return Array.from({ length: poles }, (_, index) => {
    const poleNumber = index + 1;
    const x = geometry.screwCentersX[index];
    const topOffset = svgPointToProductOffset(x, geometry.topScrewY, geometry, width, height);
    const bottomOffset = svgPointToProductOffset(x, geometry.bottomScrewY, geometry, width, height);
    const common = {
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "pass_through",
      voltageClass: "ac_120v",
      domain: "ac",
      phases,
      conductorCount: poles,
      maxCurrentA: rating,
      connector: { kind: "screw_terminal" }
    };
    return [
      {
        id: `l${poleNumber}_in`,
        label: poles === 1 ? "Line In" : `L${poleNumber} In`,
        ...common,
        direction: "input",
        side: "top",
        offsetX: topOffset.offsetX,
        offsetY: topOffset.offsetY,
        notes: `Line-side AC pole ${poleNumber} terminal.`
      },
      {
        id: `l${poleNumber}_out`,
        label: poles === 1 ? "Line Out" : `L${poleNumber} Out`,
        ...common,
        direction: "output",
        side: "bottom",
        offsetX: bottomOffset.offsetX,
        offsetY: bottomOffset.offsetY,
        notes: `Load-side AC pole ${poleNumber} terminal.`
      }
    ];
  }).flat();
}
function acBreakerPrice(poles, rating, base) {
  return Math.round(base + rating * (0.25 + poles * 0.08));
}
var acBreakers = acBreakerCatalog.flatMap(
  ({ poles, type, msrpBase, voltageRatingV, imageUrl, width, height }) => acBreakerRatings.map((rating) => {
    const msrp = acBreakerPrice(poles, rating, msrpBase);
    return {
      id: breakerId(type, rating),
      manufacturer: "Generic",
      name: `AC DIN Breaker ${poles}P ${rating}A`,
      productType: "breaker",
      category: type,
      maxCurrentA: rating,
      msrpUsd: msrp,
      oemPriceUsd: Math.round(msrp * 0.7),
      description: `Generic ${poles}-pole AC DIN rail miniature circuit breaker, ${rating}A.`,
      source: "Catalog estimate: AC DIN rail breakers",
      dataQuality: "placeholder",
      imageUrl,
      width,
      height,
      terminals: acBreakerTerminals(poles, rating, width, height),
      protectionRatings: {
        currentRatingA: rating,
        voltageRatingV,
        interruptRatingA: 6e3,
        acDcCompatibility: "ac",
        breakerStyle: type,
        protectionType: "breaker"
      }
    };
  })
);
var protection = [
  ...fuses,
  ...breakers,
  ...acBreakers,
  // ==========================================================
  // Transfer switches and isolation transformers
  // ==========================================================
  {
    id: "filax-2",
    manufacturer: "Victron",
    name: "Filax 2 Transfer Switch",
    productType: "transferSwitch",
    category: "Protection",
    msrpUsd: 316,
    description: "Victron Filax 2 \u2014 ultra-fast (<20ms) automatic transfer switch for shore power / generator changeover.",
    partNumber: "FIL000020000",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 80,
    height: 60,
    terminals: [
      { id: "ac_in_1_l", label: "In1 L", electricalType: "ac", kind: "ac_power", polarity: "line", role: "sink", voltageClass: "ac_120v", side: "left", offsetX: -40, offsetY: -20, domain: "ac" },
      { id: "ac_in_1_n", label: "In1 N", electricalType: "ac", kind: "ac_power", polarity: "neutral", role: "sink", voltageClass: "ac_120v", side: "left", offsetX: -40, offsetY: 0, domain: "ac" },
      { id: "ac_in_2_l", label: "In2 L", electricalType: "ac", kind: "ac_power", polarity: "line", role: "sink", voltageClass: "ac_120v", side: "left", offsetX: -40, offsetY: 20, domain: "ac" },
      { id: "ac_out_l", label: "Out L", electricalType: "ac", kind: "ac_power", polarity: "line", role: "source", voltageClass: "ac_120v", side: "right", offsetX: 40, offsetY: -10, domain: "ac" },
      { id: "ac_out_n", label: "Out N", electricalType: "ac", kind: "ac_power", polarity: "neutral", role: "source", voltageClass: "ac_120v", side: "right", offsetX: 40, offsetY: 10, domain: "ac" }
    ]
  },
  {
    id: "ve-transfer-switch-5kva",
    manufacturer: "Victron",
    name: "VE Transfer Switch 5 kVA",
    productType: "transferSwitch",
    category: "Protection",
    continuousPowerW: 5e3,
    msrpUsd: 378,
    description: "Victron VE Transfer Switch 5 kVA \u2014 for use with MultiPlus/Quattro systems to add a second AC input.",
    partNumber: "VTS000005000",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 80,
    height: 60,
    terminals: [
      { id: "ac_in_l", label: "In L", electricalType: "ac", kind: "ac_power", polarity: "line", role: "sink", voltageClass: "ac_120v", side: "left", offsetX: -40, offsetY: -10, domain: "ac" },
      { id: "ac_in_n", label: "In N", electricalType: "ac", kind: "ac_power", polarity: "neutral", role: "sink", voltageClass: "ac_120v", side: "left", offsetX: -40, offsetY: 10, domain: "ac" },
      { id: "ac_out_l", label: "Out L", electricalType: "ac", kind: "ac_power", polarity: "line", role: "source", voltageClass: "ac_120v", side: "right", offsetX: 40, offsetY: -10, domain: "ac" },
      { id: "ac_out_n", label: "Out N", electricalType: "ac", kind: "ac_power", polarity: "neutral", role: "source", voltageClass: "ac_120v", side: "right", offsetX: 40, offsetY: 10, domain: "ac" }
    ]
  },
  {
    id: "isolation-transformer-3600",
    manufacturer: "Victron",
    name: "Isolation Transformer 3600W",
    productType: "transferSwitch",
    category: "Protection",
    continuousPowerW: 3600,
    msrpUsd: 731,
    description: "Victron Isolation Transformer 3600W \u2014 galvanic isolation for shore power, eliminates stray currents.",
    partNumber: "ITR000003600",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 80,
    height: 60,
    terminals: [
      { id: "ac_in_l", label: "In L", electricalType: "ac", kind: "ac_power", polarity: "line", role: "sink", voltageClass: "ac_120v", side: "left", offsetX: -40, offsetY: -10, domain: "ac" },
      { id: "ac_in_n", label: "In N", electricalType: "ac", kind: "ac_power", polarity: "neutral", role: "sink", voltageClass: "ac_120v", side: "left", offsetX: -40, offsetY: 10, domain: "ac" },
      { id: "ac_out_l", label: "Out L", electricalType: "ac", kind: "ac_power", polarity: "line", role: "source", voltageClass: "ac_120v", side: "right", offsetX: 40, offsetY: -10, domain: "ac" },
      { id: "ac_out_n", label: "Out N", electricalType: "ac", kind: "ac_power", polarity: "neutral", role: "source", voltageClass: "ac_120v", side: "right", offsetX: 40, offsetY: 10, domain: "ac" }
    ]
  }
];

// src/data/products/monitoring.ts
var shuntTerminals = [
  {
    id: "shunt_pos",
    label: "Shunt+",
    electricalType: "dc_pos",
    kind: "dc_power",
    polarity: "positive",
    role: "sense",
    voltageClass: "dc_low_voltage",
    side: "left",
    offsetX: -42,
    offsetY: 13,
    domain: "dc",
    notes: "Battery negative sense terminal (current shunt measures flow across this terminal)."
  },
  {
    id: "shunt_neg",
    label: "Shunt-",
    electricalType: "dc_neg",
    kind: "dc_power",
    polarity: "negative",
    role: "sense",
    voltageClass: "dc_low_voltage",
    side: "right",
    offsetX: 42,
    offsetY: 13,
    domain: "dc",
    notes: "Battery negative bus side of shunt."
  }
];
var signalTerminal = [
  {
    id: "signal",
    label: "Signal",
    electricalType: "signal",
    kind: "signal",
    role: "control",
    voltageClass: "signal_low_voltage",
    side: "left",
    offsetX: -40,
    offsetY: 0,
    domain: "communication",
    notes: "VE.Bus / VE.Can / VE.Direct system communications."
  }
];
var monitoring = [
  // ==========================================================
  // SmartShunt — hall-effect battery monitors
  // ==========================================================
  {
    id: "smartshunt-500",
    manufacturer: "Victron",
    name: "SmartShunt 500A/50mV",
    productType: "monitor",
    category: "Monitoring",
    msrpUsd: 123,
    description: "Victron SmartShunt 500A \u2014 Bluetooth battery monitor with integrated 500A/50mV shunt",
    partNumber: "SHU050150050",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 100,
    height: 50,
    terminals: shuntTerminals
  },
  {
    id: "smartshunt-1000",
    manufacturer: "Victron",
    name: "SmartShunt 1000A/50mV",
    productType: "monitor",
    category: "Monitoring",
    msrpUsd: 203,
    description: "Victron SmartShunt 1000A \u2014 Bluetooth battery monitor with integrated 1000A/50mV shunt",
    partNumber: "SHU050210050",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 100,
    height: 50,
    terminals: shuntTerminals
  },
  {
    id: "smartshunt-2000",
    manufacturer: "Victron",
    name: "SmartShunt 2000A/50mV",
    productType: "monitor",
    category: "Monitoring",
    msrpUsd: 276,
    description: "Victron SmartShunt 2000A \u2014 Bluetooth battery monitor with integrated 2000A/50mV shunt",
    partNumber: "SHU050220050",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 100,
    height: 50,
    terminals: shuntTerminals
  },
  // ==========================================================
  // GX System Controllers
  // ==========================================================
  {
    id: "ekrano-gx",
    manufacturer: "Victron",
    name: "Ekrano GX",
    productType: "monitor",
    category: "Monitoring",
    msrpUsd: 690,
    description: "Victron Ekrano GX \u2014 combined system controller and 7-inch touchscreen display. VE.Bus / VE.Direct / VE.Can / Ethernet.",
    partNumber: "BPP900480100",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 80,
    height: 60,
    terminals: signalTerminal
  },
  {
    id: "globallink-520",
    manufacturer: "Victron",
    name: "GlobalLink 520 Cellular Gateway",
    productType: "monitor",
    category: "Monitoring",
    msrpUsd: 265,
    description: "Victron GlobalLink 520 \u2014 LTE-M cellular gateway for remote VRM monitoring via VE.Direct",
    partNumber: "ASS030543020",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 80,
    height: 60,
    terminals: signalTerminal
  },
  // ==========================================================
  // GX Touch Displays (accessories to GX controllers)
  // ==========================================================
  {
    id: "gx-touch-50",
    manufacturer: "Victron",
    name: "GX Touch 50 Display",
    productType: "accessory",
    category: "Monitoring",
    msrpUsd: 269,
    description: "Victron GX Touch 50 \u2014 5-inch touchscreen display for Cerbo GX (HDMI/USB connection)",
    partNumber: "BPP900455050",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs. Requires Cerbo GX.",
    width: 80,
    height: 60,
    terminals: signalTerminal
  },
  {
    id: "gx-touch-70",
    manufacturer: "Victron",
    name: "GX Touch 70 Display",
    productType: "accessory",
    category: "Monitoring",
    msrpUsd: 397,
    description: "Victron GX Touch 70 \u2014 7-inch touchscreen display for Cerbo GX (HDMI/USB connection)",
    partNumber: "BPP900455070",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs. Requires Cerbo GX.",
    width: 80,
    height: 60,
    terminals: signalTerminal
  }
];

// src/data/products/accessories.ts
var accessories = [
  // ----------------------------------------------------------
  // Victron BMV-712 Battery Monitor
  // ----------------------------------------------------------
  {
    id: "mon-vic-bmv-712",
    manufacturer: "Victron",
    name: "BMV-712 Battery Monitor",
    productType: "monitor",
    category: "Monitoring",
    msrpUsd: 149,
    oemPriceUsd: 104,
    description: "Victron BMV-712 Smart battery monitor with Bluetooth",
    partNumber: "BAM010712000",
    productUrl: "https://www.victronenergy.com/battery-monitors/bmv-712-smart",
    source: "Victron 2024",
    dataQuality: "complete",
    width: 80,
    height: 60,
    terminals: [
      {
        id: "shunt_pos",
        label: "Shunt+",
        electricalType: "dc_pos",
        kind: "dc_power",
        polarity: "positive",
        role: "sense",
        voltageClass: "dc_low_voltage",
        side: "left",
        offsetX: -40,
        offsetY: 0,
        domain: "dc",
        notes: "Positive sense connection via 500A/50mV shunt (included)."
      },
      {
        id: "shunt_neg",
        label: "Shunt-",
        electricalType: "dc_neg",
        kind: "dc_power",
        polarity: "negative",
        role: "sense",
        voltageClass: "dc_low_voltage",
        side: "right",
        offsetX: 40,
        offsetY: 0,
        domain: "dc",
        notes: "Negative sense connection (load side of shunt)."
      }
    ]
  },
  // ----------------------------------------------------------
  // Victron Cerbo GX
  // ----------------------------------------------------------
  {
    id: "mon-vic-cerbo-gx",
    manufacturer: "Victron",
    name: "Cerbo GX",
    productType: "monitor",
    category: "Monitoring",
    msrpUsd: 329,
    oemPriceUsd: 230,
    description: "Victron Cerbo GX \u2014 system monitoring and control hub with VRM",
    partNumber: "BPP900450100",
    productUrl: "https://www.cdnrg.com/products/vebpp900450100",
    source: "Victron 2024",
    dataQuality: "complete",
    width: 80,
    height: 60,
    terminals: [
      {
        id: "signal",
        label: "Signal",
        electricalType: "signal",
        kind: "signal",
        role: "control",
        voltageClass: "signal_low_voltage",
        side: "left",
        offsetX: -40,
        offsetY: 0,
        domain: "communication",
        notes: "VE.Bus / VE.Can / VE.Direct / USB signal connections."
      }
    ]
  },
  // ----------------------------------------------------------
  // Generic DC Load Placeholder
  // ----------------------------------------------------------
  {
    id: "acc-dc-load-generic",
    manufacturer: "Generic",
    name: "DC Load (generic)",
    productType: "dc_load",
    category: "Loads",
    continuousPowerW: 100,
    msrpUsd: 0,
    description: "Generic DC load placeholder",
    source: "User",
    dataQuality: "placeholder",
    width: 80,
    height: 60,
    terminals: [
      {
        id: "dc_pos",
        label: "DC+",
        electricalType: "dc_pos",
        kind: "dc_power",
        polarity: "positive",
        role: "sink",
        voltageClass: "dc_low_voltage",
        side: "left",
        offsetX: -40,
        offsetY: -10,
        domain: "dc",
        notes: "DC positive input."
      },
      {
        id: "dc_neg",
        label: "DC-",
        electricalType: "dc_neg",
        kind: "dc_power",
        polarity: "negative",
        role: "sink",
        voltageClass: "dc_low_voltage",
        side: "left",
        offsetX: -40,
        offsetY: 10,
        domain: "dc",
        notes: "DC negative input."
      }
    ],
    loadRatings: {
      powerW: 100
    }
  },
  // ----------------------------------------------------------
  // Generic AC Load Placeholder
  // ----------------------------------------------------------
  {
    id: "acc-ac-load-generic",
    manufacturer: "Generic",
    name: "AC Load (generic)",
    productType: "ac_load",
    category: "Loads",
    continuousPowerW: 1e3,
    msrpUsd: 0,
    description: "Generic AC load placeholder",
    source: "User",
    dataQuality: "placeholder",
    width: 80,
    height: 60,
    terminals: [
      {
        id: "ac_l",
        label: "AC L",
        electricalType: "ac",
        kind: "ac_power",
        polarity: "line",
        role: "sink",
        voltageClass: "ac_120v",
        side: "left",
        offsetX: -40,
        offsetY: -10,
        domain: "ac",
        phases: 1,
        notes: "AC Line conductor input."
      },
      {
        id: "ac_n",
        label: "AC N",
        electricalType: "ac",
        kind: "ac_power",
        polarity: "neutral",
        role: "sink",
        voltageClass: "ac_120v",
        side: "left",
        offsetX: -40,
        offsetY: 10,
        domain: "ac",
        notes: "AC Neutral conductor input."
      }
    ],
    loadRatings: {
      powerW: 1e3
    }
  },
  // ----------------------------------------------------------
  // Generic AC / DC source and panel placeholders
  // ----------------------------------------------------------
  {
    id: "generic-grid-source",
    manufacturer: "Generic",
    name: "AC Source",
    productType: "shorePowerInlet",
    category: "AC Equipment",
    continuousPowerW: 3600,
    msrpUsd: 0,
    description: "Generic AC source placeholder",
    source: "User",
    dataQuality: "placeholder",
    width: 90,
    height: 64,
    terminals: [
      { id: "ac_l", label: "L", electricalType: "ac", kind: "ac_power", polarity: "line", role: "source", voltageClass: "ac_120v", side: "right", offsetX: 45, offsetY: -10, domain: "ac", phases: 1 },
      { id: "ac_n", label: "N", electricalType: "ac", kind: "ac_power", polarity: "neutral", role: "source", voltageClass: "ac_120v", side: "right", offsetX: 45, offsetY: 10, domain: "ac" }
    ]
  },
  {
    id: "generic-generator-source",
    manufacturer: "Generic",
    name: "Generator Source",
    productType: "shorePowerInlet",
    category: "AC Equipment",
    continuousPowerW: 3e3,
    msrpUsd: 0,
    description: "Generic AC generator source placeholder",
    source: "User",
    dataQuality: "placeholder",
    width: 90,
    height: 64,
    terminals: [
      { id: "ac_l", label: "L", electricalType: "ac", kind: "ac_power", polarity: "line", role: "source", voltageClass: "ac_120v", side: "right", offsetX: 45, offsetY: -10, domain: "ac", phases: 1 },
      { id: "ac_n", label: "N", electricalType: "ac", kind: "ac_power", polarity: "neutral", role: "source", voltageClass: "ac_120v", side: "right", offsetX: 45, offsetY: 10, domain: "ac" }
    ]
  },
  {
    id: "generic-ac-panel",
    manufacturer: "Generic",
    name: "AC Panel",
    productType: "ac_distribution",
    category: "AC Equipment",
    maxCurrentA: 30,
    msrpUsd: 0,
    description: "Generic AC distribution panel placeholder",
    source: "User",
    dataQuality: "placeholder",
    width: 110,
    height: 80,
    terminals: [
      { id: "in_l", label: "In L", electricalType: "ac", kind: "ac_power", polarity: "line", role: "sink", voltageClass: "ac_120v", side: "left", offsetX: -55, offsetY: -12, domain: "ac", phases: 1 },
      { id: "in_n", label: "In N", electricalType: "ac", kind: "ac_power", polarity: "neutral", role: "sink", voltageClass: "ac_120v", side: "left", offsetX: -55, offsetY: 12, domain: "ac" },
      { id: "out_l", label: "Out L", electricalType: "ac", kind: "ac_power", polarity: "line", role: "source", voltageClass: "ac_120v", side: "right", offsetX: 55, offsetY: -12, domain: "ac", phases: 1 },
      { id: "out_n", label: "Out N", electricalType: "ac", kind: "ac_power", polarity: "neutral", role: "source", voltageClass: "ac_120v", side: "right", offsetX: 55, offsetY: 12, domain: "ac" }
    ]
  },
  {
    id: "generic-alternator-source",
    manufacturer: "Generic",
    name: "DC Source",
    productType: "accessory",
    category: "Charging",
    nominalVoltage: [12, 24],
    maxCurrentA: 120,
    continuousPowerW: 1440,
    msrpUsd: 0,
    description: "Generic DC source placeholder",
    source: "User",
    dataQuality: "placeholder",
    width: 90,
    height: 64,
    terminals: [
      { id: "dc_pos", label: "B+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "source", direction: "output", voltageClass: "dc_low_voltage", side: "right", offsetX: 45, offsetY: -10, domain: "dc", requiresOvercurrentProtection: true, maxCurrentA: 120 },
      { id: "dc_neg", label: "B-", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "source", direction: "output", voltageClass: "dc_low_voltage", side: "right", offsetX: 45, offsetY: 10, domain: "dc", maxCurrentA: 120 }
    ]
  },
  {
    id: "generic-battery-bank",
    manufacturer: "Generic",
    name: "Generic Battery Bank",
    productType: "battery",
    category: "Batteries",
    capacityWh: 1200,
    maxCurrentA: 100,
    msrpUsd: 0,
    description: "Generic battery bank placeholder",
    source: "User",
    dataQuality: "placeholder",
    width: 90,
    height: 86,
    terminals: [
      { id: "dc_pos", label: "+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "bidirectional", direction: "bidirectional", voltageClass: "dc_low_voltage", side: "top", offsetX: 22, offsetY: -43, domain: "dc", requiresOvercurrentProtection: true, maxCurrentA: 100 },
      { id: "dc_neg", label: "-", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "bidirectional", direction: "bidirectional", voltageClass: "dc_low_voltage", side: "top", offsetX: -22, offsetY: -43, domain: "dc", maxCurrentA: 100 }
    ]
  },
  {
    id: "generic-agm-battery",
    manufacturer: "Generic",
    name: "AGM Battery",
    productType: "battery",
    category: "Batteries",
    capacityWh: 1200,
    maxCurrentA: 100,
    msrpUsd: 0,
    description: "Generic AGM battery placeholder",
    source: "User",
    dataQuality: "placeholder",
    width: 90,
    height: 86,
    terminals: [
      { id: "dc_pos", label: "+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "bidirectional", direction: "bidirectional", voltageClass: "dc_low_voltage", side: "top", offsetX: 22, offsetY: -43, domain: "dc", requiresOvercurrentProtection: true, maxCurrentA: 100 },
      { id: "dc_neg", label: "-", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "bidirectional", direction: "bidirectional", voltageClass: "dc_low_voltage", side: "top", offsetX: -22, offsetY: -43, domain: "dc", maxCurrentA: 100 }
    ],
    batteryRatings: {
      nominalVoltageV: 12,
      capacityAh: 100,
      capacityWh: 1200,
      capacityKwh: 1.2,
      chemistry: "AGM",
      hasInternalBms: false,
      seriesAllowed: true,
      maxSeriesCount: 4,
      parallelAllowed: true
    }
  },
  {
    id: "generic-bms",
    manufacturer: "Generic",
    name: "BMS",
    productType: "monitor",
    category: "Monitoring",
    msrpUsd: 0,
    description: "Generic battery management system placeholder",
    source: "User",
    dataQuality: "placeholder",
    width: 80,
    height: 60,
    terminals: [
      { id: "signal", label: "Signal", electricalType: "signal", kind: "signal", role: "control", voltageClass: "signal_low_voltage", side: "left", offsetX: -40, offsetY: 0, domain: "signal" }
    ]
  },
  {
    id: "generic-pwm-controller",
    manufacturer: "Generic",
    name: "PWM Charge Controller",
    productType: "accessory",
    category: "Solar",
    nominalVoltage: [12, 24],
    maxCurrentA: 30,
    maxPvVoltageV: 50,
    msrpUsd: 0,
    description: "Generic PWM solar charge controller placeholder",
    source: "User",
    dataQuality: "placeholder",
    width: 90,
    height: 70,
    terminals: [
      { id: "pv_pos", label: "PV+", electricalType: "pv_pos", kind: "pv_power", polarity: "positive", role: "sink", voltageClass: "pv_high_voltage", side: "left", offsetX: -45, offsetY: -18, domain: "pv" },
      { id: "pv_neg", label: "PV-", electricalType: "pv_neg", kind: "pv_power", polarity: "negative", role: "sink", voltageClass: "pv_high_voltage", side: "left", offsetX: -45, offsetY: 0, domain: "pv" },
      { id: "bat_pos", label: "Bat+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "source", voltageClass: "dc_low_voltage", side: "right", offsetX: 45, offsetY: -10, domain: "dc" },
      { id: "bat_neg", label: "Bat-", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "source", voltageClass: "dc_low_voltage", side: "right", offsetX: 45, offsetY: 10, domain: "dc" }
    ]
  },
  {
    id: "generic-mc4-connector",
    manufacturer: "Generic",
    name: "MC4 Connector Pair",
    productType: "accessory",
    category: "Solar",
    maxPvVoltageV: 1e3,
    maxPvCurrentA: 30,
    msrpUsd: 0,
    description: "Generic solar connector pair placeholder",
    source: "User",
    dataQuality: "placeholder",
    width: 70,
    height: 46,
    terminals: [
      { id: "in_pos", label: "In+", electricalType: "pv_pos", kind: "pv_power", polarity: "positive", role: "pass_through", voltageClass: "pv_high_voltage", side: "left", offsetX: -35, offsetY: -8, domain: "pv" },
      { id: "out_pos", label: "Out+", electricalType: "pv_pos", kind: "pv_power", polarity: "positive", role: "pass_through", voltageClass: "pv_high_voltage", side: "right", offsetX: 35, offsetY: -8, domain: "pv" },
      { id: "in_neg", label: "In-", electricalType: "pv_neg", kind: "pv_power", polarity: "negative", role: "pass_through", voltageClass: "pv_high_voltage", side: "left", offsetX: -35, offsetY: 8, domain: "pv" },
      { id: "out_neg", label: "Out-", electricalType: "pv_neg", kind: "pv_power", polarity: "negative", role: "pass_through", voltageClass: "pv_high_voltage", side: "right", offsetX: 35, offsetY: 8, domain: "pv" }
    ]
  },
  {
    id: "generic-pv-disconnect",
    manufacturer: "Generic",
    name: "PV Disconnect",
    productType: "dcDisconnect",
    category: "Protection",
    maxPvVoltageV: 600,
    maxPvCurrentA: 30,
    msrpUsd: 0,
    description: "Generic solar PV disconnect placeholder",
    source: "User",
    dataQuality: "placeholder",
    imageUrl: "/product-images/pv-disconnect.svg",
    width: 78,
    height: 90,
    terminals: [
      { id: "in_pos", label: "In+", electricalType: "pv_pos", kind: "pv_power", polarity: "positive", role: "pass_through", voltageClass: "pv_high_voltage", side: "bottom", offsetX: -12, offsetY: 45, domain: "pv" },
      { id: "out_pos", label: "Out+", electricalType: "pv_pos", kind: "pv_power", polarity: "positive", role: "pass_through", voltageClass: "pv_high_voltage", side: "bottom", offsetX: 4, offsetY: 45, domain: "pv" },
      { id: "in_neg", label: "In-", electricalType: "pv_neg", kind: "pv_power", polarity: "negative", role: "pass_through", voltageClass: "pv_high_voltage", side: "bottom", offsetX: -4, offsetY: 45, domain: "pv" },
      { id: "out_neg", label: "Out-", electricalType: "pv_neg", kind: "pv_power", polarity: "negative", role: "pass_through", voltageClass: "pv_high_voltage", side: "bottom", offsetX: 12, offsetY: 45, domain: "pv" }
    ]
  },
  // ----------------------------------------------------------
  // Victron Orion-Tr Smart 12/12-30A (DC-DC Charger)
  // ----------------------------------------------------------
  {
    id: "acc-vic-dc-dc-orion-12-12-30",
    manufacturer: "Victron",
    name: "Orion-Tr Smart 12/12-30A",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 30,
    continuousPowerW: 360,
    msrpUsd: 299,
    oemPriceUsd: 209,
    description: "Victron Orion-Tr Smart 12V/12V 30A isolated DC-DC charger",
    partNumber: "ORI121222120",
    productUrl: "https://www.cdnrg.com/products/veori121222120",
    source: "Victron 2024",
    dataQuality: "partial",
    width: 86,
    height: 80,
    terminals: [
      {
        id: "in_pos",
        label: "In+",
        electricalType: "dc_pos",
        kind: "dc_power",
        polarity: "positive",
        role: "sink",
        voltageClass: "dc_low_voltage",
        side: "bottom",
        offsetX: -16,
        offsetY: 24,
        domain: "dc",
        requiresOvercurrentProtection: true,
        notes: "Starter battery / alternator positive input. Requires fuse close to source."
      },
      {
        id: "in_neg",
        label: "In-",
        electricalType: "dc_neg",
        kind: "dc_power",
        polarity: "negative",
        role: "sink",
        voltageClass: "dc_low_voltage",
        side: "bottom",
        offsetX: -5,
        offsetY: 24,
        domain: "dc",
        notes: "Input negative."
      },
      {
        id: "out_pos",
        label: "Out+",
        electricalType: "dc_pos",
        kind: "dc_power",
        polarity: "positive",
        role: "source",
        direction: "output",
        voltageClass: "dc_low_voltage",
        side: "bottom",
        offsetX: 5,
        offsetY: 24,
        domain: "dc",
        maxCurrentA: 30,
        notes: "House battery positive output."
      },
      {
        id: "out_neg",
        label: "Out-",
        electricalType: "dc_neg",
        kind: "dc_power",
        polarity: "negative",
        role: "source",
        direction: "output",
        voltageClass: "dc_low_voltage",
        side: "bottom",
        offsetX: 16,
        offsetY: 24,
        domain: "dc",
        maxCurrentA: 30,
        notes: "House battery negative output."
      }
    ],
    dcDcChargerRatings: {
      inputVoltageMinV: 7,
      inputVoltageMaxV: 17,
      outputVoltageV: 12,
      outputCurrentA: 30,
      outputPowerW: 360,
      isolated: true
    }
  },
  // ==========================================================
  // Victron communication accessories
  // ==========================================================
  {
    id: "ve-bus-smart-dongle",
    manufacturer: "Victron",
    name: "VE.Bus Smart Dongle",
    productType: "accessory",
    category: "Accessories",
    msrpUsd: 115,
    description: "Victron VE.Bus Smart Dongle \u2014 adds Bluetooth monitoring to MultiPlus/Quattro inverter-chargers without a GX device.",
    partNumber: "ASS030537010",
    productUrl: "https://www.cdnrg.com/products/veass030537010",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 60,
    height: 40,
    terminals: [
      { id: "signal", label: "VE.Bus", electricalType: "signal", kind: "signal", role: "control", voltageClass: "signal_low_voltage", side: "left", offsetX: -30, offsetY: 0, domain: "communication" }
    ]
  },
  {
    id: "mk3-usb",
    manufacturer: "Victron",
    name: "MK3-USB Interface",
    productType: "accessory",
    category: "Accessories",
    msrpUsd: 84,
    description: "Victron MK3-USB \u2014 VE.Bus to USB interface for programming MultiPlus/Quattro from a PC.",
    partNumber: "ASS030140000",
    productUrl: "https://www.cdnrg.com/products/veass030140000",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 60,
    height: 40,
    terminals: [
      { id: "signal", label: "VE.Bus", electricalType: "signal", kind: "signal", role: "control", voltageClass: "signal_low_voltage", side: "left", offsetX: -30, offsetY: 0, domain: "communication" }
    ]
  },
  {
    id: "vedirect-usb",
    manufacturer: "Victron",
    name: "VE.Direct to USB Interface",
    productType: "accessory",
    category: "Accessories",
    msrpUsd: 34,
    description: "Victron VE.Direct to USB interface \u2014 connect VE.Direct devices (MPPTs, BMVs) to a computer for monitoring and configuration.",
    partNumber: "ASS030530010",
    productUrl: "https://www.cdnrg.com/products/veass030530010",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 60,
    height: 40,
    terminals: [
      { id: "signal", label: "VE.Direct", electricalType: "signal", kind: "signal", role: "control", voltageClass: "signal_low_voltage", side: "left", offsetX: -30, offsetY: 0, domain: "communication" }
    ]
  },
  {
    id: "vedirect-cable-3m",
    manufacturer: "Victron",
    name: "VE.Direct Cable 3m",
    productType: "accessory",
    category: "Accessories",
    msrpUsd: 18,
    description: "Victron VE.Direct cable 3m \u2014 connects VE.Direct devices to Cerbo GX or other VE.Direct interfaces.",
    partNumber: "ASS030531130",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 60,
    height: 40,
    terminals: [
      { id: "signal", label: "VE.Direct", electricalType: "signal", kind: "signal", role: "control", voltageClass: "signal_low_voltage", side: "left", offsetX: -30, offsetY: 0, domain: "communication" }
    ]
  },
  {
    id: "temperature-sensor-quattro",
    manufacturer: "Victron",
    name: "Temperature Sensor for MultiPlus/Quattro",
    productType: "accessory",
    category: "Accessories",
    msrpUsd: 25,
    description: "Victron battery temperature sensor for MultiPlus/Quattro \u2014 enables temperature-compensated charging.",
    partNumber: "ASS000100000",
    source: "Victron 2025",
    dataQuality: "partial",
    notes: "Placeholder pricing/specs.",
    width: 60,
    height: 40,
    terminals: [
      { id: "signal", label: "Sensor", electricalType: "signal", kind: "signal", role: "control", voltageClass: "signal_low_voltage", side: "left", offsetX: -30, offsetY: 0, domain: "signal" }
    ]
  },
  // ==========================================================
  // Cables and materials placeholder kits
  // ==========================================================
  {
    id: "cables-materials-kit",
    manufacturer: "Generic",
    name: "Cables & Materials Kit",
    productType: "accessory",
    category: "Accessories",
    msrpUsd: 850,
    oemPriceUsd: 525,
    description: "Cables and materials placeholder \u2014 includes all DC/AC wiring, lugs, heat shrink, and conduit for a typical system build.",
    source: "Victron 2025",
    dataQuality: "placeholder",
    notes: "Placeholder pricing. Actual cost depends on system size and wire runs.",
    width: 80,
    height: 60,
    terminals: []
  },
  {
    id: "high-current-fuse-kit",
    manufacturer: "Generic",
    name: "High Current Fuse Kit",
    productType: "accessory",
    category: "Accessories",
    msrpUsd: 320,
    oemPriceUsd: 210,
    description: "High current fuse kit placeholder \u2014 Class T and ANL fuses, fuse holders, and bus-bar hardware.",
    source: "Victron 2025",
    dataQuality: "placeholder",
    notes: "Placeholder pricing. Actual fuses are itemized separately in Protection.",
    width: 80,
    height: 60,
    terminals: []
  },
  {
    id: "battery-cable-kit",
    manufacturer: "Generic",
    name: "Battery Cable Kit",
    productType: "accessory",
    category: "Accessories",
    msrpUsd: 480,
    oemPriceUsd: 300,
    description: "Battery cable kit placeholder \u2014 includes 4/0 AWG battery interconnect cables, terminal lugs, and hardware.",
    source: "Victron 2025",
    dataQuality: "placeholder",
    notes: "Placeholder pricing.",
    width: 80,
    height: 60,
    terminals: []
  },
  {
    id: "ac-dc-breaker-kit",
    manufacturer: "Generic",
    name: "AC/DC Breaker Kit",
    productType: "accessory",
    category: "Accessories",
    msrpUsd: 650,
    oemPriceUsd: 400,
    description: "AC/DC breaker kit placeholder \u2014 includes AC panel, DC breakers, mounting hardware.",
    source: "Victron 2025",
    dataQuality: "placeholder",
    notes: "Placeholder pricing.",
    width: 80,
    height: 60,
    terminals: []
  }
];

// src/data/products/kisae.ts
var acChargerTerminals2 = [
  { id: "ac_l", label: "AC L", electricalType: "ac", kind: "ac_power", polarity: "line", role: "sink", voltageClass: "ac_120v", side: "left", offsetX: -40, offsetY: -10, domain: "ac" },
  { id: "ac_n", label: "AC N", electricalType: "ac", kind: "ac_power", polarity: "neutral", role: "sink", voltageClass: "ac_120v", side: "left", offsetX: -40, offsetY: 10, domain: "ac" },
  { id: "dc_pos", label: "DC+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "source", direction: "output", voltageClass: "dc_low_voltage", side: "right", offsetX: 40, offsetY: -10, domain: "dc", requiresOvercurrentProtection: true },
  { id: "dc_neg", label: "DC-", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "source", direction: "output", voltageClass: "dc_low_voltage", side: "right", offsetX: 40, offsetY: 10, domain: "dc" }
];
var inverterTerminals = [
  { id: "dc_pos", label: "DC+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "sink", direction: "input", voltageClass: "dc_low_voltage", side: "left", offsetX: -70, offsetY: -18, domain: "dc", requiresOvercurrentProtection: true },
  { id: "dc_neg", label: "DC-", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "sink", direction: "input", voltageClass: "dc_low_voltage", side: "left", offsetX: -70, offsetY: 18, domain: "dc" },
  { id: "ac_out_l", label: "AC Out L", electricalType: "ac", kind: "ac_power", polarity: "line", role: "source", direction: "output", voltageClass: "ac_120v", side: "right", offsetX: 70, offsetY: -12, domain: "ac" },
  { id: "ac_out_n", label: "AC Out N", electricalType: "ac", kind: "ac_power", polarity: "neutral", role: "source", direction: "output", voltageClass: "ac_120v", side: "right", offsetX: 70, offsetY: 12, domain: "ac" }
];
var inverterChargerTerminals = [
  { id: "dc_pos", label: "DC+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "bidirectional", direction: "bidirectional", voltageClass: "dc_low_voltage", side: "left", offsetX: -70, offsetY: -18, domain: "dc", requiresOvercurrentProtection: true },
  { id: "dc_neg", label: "DC-", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "bidirectional", direction: "bidirectional", voltageClass: "dc_low_voltage", side: "left", offsetX: -70, offsetY: 18, domain: "dc" },
  { id: "ac_in_l", label: "AC In L", electricalType: "ac", kind: "ac_power", polarity: "line", role: "sink", direction: "input", voltageClass: "ac_120v", side: "right", offsetX: 70, offsetY: -30, domain: "ac" },
  { id: "ac_in_n", label: "AC In N", electricalType: "ac", kind: "ac_power", polarity: "neutral", role: "sink", direction: "input", voltageClass: "ac_120v", side: "right", offsetX: 70, offsetY: -10, domain: "ac" },
  { id: "ac_out_l", label: "AC Out L", electricalType: "ac", kind: "ac_power", polarity: "line", role: "source", direction: "output", voltageClass: "ac_120v", side: "right", offsetX: 70, offsetY: 10, domain: "ac" },
  { id: "ac_out_n", label: "AC Out N", electricalType: "ac", kind: "ac_power", polarity: "neutral", role: "source", direction: "output", voltageClass: "ac_120v", side: "right", offsetX: 70, offsetY: 30, domain: "ac" }
];
var dcDcPvTerminals = [
  { id: "in_pos", label: "Alt+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "sink", direction: "input", voltageClass: "dc_low_voltage", side: "left", offsetX: -42, offsetY: -24, domain: "dc", requiresOvercurrentProtection: true },
  { id: "in_neg", label: "Alt-", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "sink", direction: "input", voltageClass: "dc_low_voltage", side: "left", offsetX: -42, offsetY: -6, domain: "dc" },
  { id: "pv_pos", label: "PV+", electricalType: "pv_pos", kind: "pv_power", polarity: "positive", role: "sink", direction: "input", voltageClass: "pv_high_voltage", side: "top", offsetX: -15, offsetY: -56, domain: "pv" },
  { id: "pv_neg", label: "PV-", electricalType: "pv_neg", kind: "pv_power", polarity: "negative", role: "sink", direction: "input", voltageClass: "pv_high_voltage", side: "top", offsetX: 15, offsetY: -56, domain: "pv" },
  { id: "out_pos", label: "Bat+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "source", direction: "output", voltageClass: "dc_low_voltage", side: "right", offsetX: 42, offsetY: 24, domain: "dc", requiresOvercurrentProtection: true },
  { id: "out_neg", label: "Bat-", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "source", direction: "output", voltageClass: "dc_low_voltage", side: "right", offsetX: 42, offsetY: 42, domain: "dc" }
];
var mpptTerminals2 = [
  { id: "pv_pos", label: "PV+", electricalType: "pv_pos", kind: "pv_power", polarity: "positive", role: "sink", direction: "input", voltageClass: "pv_high_voltage", side: "left", offsetX: -48, offsetY: -16, domain: "pv" },
  { id: "pv_neg", label: "PV-", electricalType: "pv_neg", kind: "pv_power", polarity: "negative", role: "sink", direction: "input", voltageClass: "pv_high_voltage", side: "left", offsetX: -48, offsetY: 16, domain: "pv" },
  { id: "bat_pos", label: "Bat+", electricalType: "dc_pos", kind: "dc_power", polarity: "positive", role: "source", direction: "output", voltageClass: "dc_low_voltage", side: "right", offsetX: 48, offsetY: -16, domain: "dc", requiresOvercurrentProtection: true },
  { id: "bat_neg", label: "Bat-", electricalType: "dc_neg", kind: "dc_power", polarity: "negative", role: "source", direction: "output", voltageClass: "dc_low_voltage", side: "right", offsetX: 48, offsetY: 16, domain: "dc" }
];
var kisaeProducts = [
  {
    id: "kisae-ac1260",
    manufacturer: "KISAE",
    name: "ABSO AC Charger 12V 60A",
    productType: "shore_charger",
    category: "Charging",
    nominalVoltage: [12, 24],
    maxCurrentA: 60,
    capabilities: ["ac-charger", "battery-charger"],
    description: "KISAE ABSO AC battery charger, 12V 60A.",
    partNumber: "AC1260",
    productUrl: "https://www.cdnrg.com/products/ac1260",
    source: "Canadian Energy product index",
    dataQuality: "partial",
    width: 90,
    height: 64,
    terminals: acChargerTerminals2,
    imageUrl: "/product-images/kisae-ac-charger.svg"
  },
  {
    id: "kisae-ac2450",
    manufacturer: "KISAE",
    name: "ABSO AC Charger 24V 50A",
    productType: "shore_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 50,
    capabilities: ["ac-charger", "battery-charger"],
    description: "KISAE ABSO AC battery charger, 24V 50A.",
    partNumber: "AC2450",
    productUrl: "https://www.cdnrg.com/products/ac2450",
    source: "Canadian Energy product index",
    dataQuality: "partial",
    width: 90,
    height: 64,
    terminals: acChargerTerminals2,
    imageUrl: "/product-images/kisae-ac-charger.svg"
  },
  {
    id: "kisae-sw1210",
    manufacturer: "KISAE",
    name: "SW 12V 1000W Sine Wave Inverter",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: [12, 24],
    continuousPowerW: 1e3,
    capabilities: ["inverter"],
    description: "KISAE 12V pure sine wave inverter, 1000W.",
    partNumber: "SW1210",
    productUrl: "https://www.cdnrg.com/products/sw1210",
    source: "Canadian Energy product index",
    dataQuality: "partial",
    width: 140,
    height: 90,
    terminals: inverterTerminals,
    inverterChargerRatings: { dcVoltageV: 12, continuousInverterW: 1e3, acOutputVoltageV: 120 },
    imageUrl: "/product-images/kisae-inverter.svg"
  },
  {
    id: "kisae-swxfr1220",
    manufacturer: "KISAE",
    name: "SWXFR 12V 2000W Sine Wave Inverter",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 12,
    continuousPowerW: 2e3,
    capabilities: ["inverter"],
    description: "KISAE SWXFR 12V sine wave inverter, 2000W.",
    partNumber: "SWXFR1220",
    productUrl: "https://www.cdnrg.com/products/swxfr1220",
    source: "Canadian Energy product index",
    dataQuality: "partial",
    width: 140,
    height: 90,
    terminals: inverterTerminals,
    inverterChargerRatings: { dcVoltageV: 12, continuousInverterW: 2e3, acOutputVoltageV: 120 },
    imageUrl: "/product-images/kisae-inverter.svg"
  },
  {
    id: "kisae-ic121040",
    manufacturer: "KISAE",
    name: "ABSO Inverter Charger 12V 1000W/40A",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 12,
    continuousPowerW: 1e3,
    maxCurrentA: 85,
    capabilities: ["inverter-charger", "battery-charger"],
    description: "KISAE ABSO sine wave inverter/charger, 12V 1000W with 40A charger.",
    partNumber: "IC121040",
    productUrl: "https://www.cdnrg.com/products/ic121040",
    source: "Canadian Energy product index",
    dataQuality: "partial",
    width: 140,
    height: 100,
    terminals: inverterChargerTerminals,
    inverterChargerRatings: { dcVoltageV: 12, continuousInverterW: 1e3, chargerCurrentA: 40, acInputVoltageV: 120, acOutputVoltageV: 120 },
    imageUrl: "/product-images/kisae-inverter-charger.svg"
  },
  {
    id: "kisae-bic1220080",
    manufacturer: "KISAE",
    name: "BIC Inverter Charger 12V 2000W/80A",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 12,
    continuousPowerW: 2e3,
    maxCurrentA: 170,
    capabilities: ["inverter-charger", "battery-charger"],
    description: "KISAE true sine inverter/charger, 12V 2000W with 80A charger.",
    partNumber: "BIC1220080",
    productUrl: "https://www.cdnrg.com/products/bic1220080",
    source: "Canadian Energy product index",
    dataQuality: "partial",
    width: 140,
    height: 100,
    terminals: inverterChargerTerminals,
    inverterChargerRatings: { dcVoltageV: 12, continuousInverterW: 2e3, chargerCurrentA: 80, acInputVoltageV: 120, acOutputVoltageV: 120 },
    imageUrl: "/product-images/kisae-inverter-charger.svg"
  },
  {
    id: "kisae-dmt-1230",
    manufacturer: "KISAE",
    name: "DMT-1230 DC-DC Charger with MPPT",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 30,
    continuousPowerW: 360,
    capabilities: ["dc-dc-converter", "battery-charger", "mppt", "pv-input"],
    description: "KISAE DMT smart DC-to-DC battery charger with PV input capability, 12V 30A.",
    partNumber: "DMT-1230",
    productUrl: "https://www.cdnrg.com/products/dmt-1230",
    source: "Canadian Energy product index",
    dataQuality: "partial",
    width: 84,
    height: 112,
    terminals: dcDcPvTerminals,
    dcDcChargerRatings: { outputVoltageV: 12, outputCurrentA: 30, outputPowerW: 360, isolated: false },
    imageUrl: "/product-images/kisae-dc-dc-mppt.svg"
  },
  {
    id: "kisae-dmt-1250",
    manufacturer: "KISAE",
    name: "DMT-1250 DC-DC Charger with MPPT",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 50,
    continuousPowerW: 600,
    capabilities: ["dc-dc-converter", "battery-charger", "mppt", "pv-input"],
    description: "KISAE DMT smart DC-to-DC battery charger with PV input capability, 12V 50A.",
    partNumber: "DMT-1250",
    productUrl: "https://www.cdnrg.com/products/dmt-1250",
    source: "Canadian Energy product index",
    dataQuality: "partial",
    width: 84,
    height: 112,
    terminals: dcDcPvTerminals,
    dcDcChargerRatings: { outputVoltageV: 12, outputCurrentA: 50, outputPowerW: 600, isolated: false },
    imageUrl: "/product-images/kisae-dc-dc-mppt.svg"
  },
  {
    id: "kisae-sc1220ld",
    manufacturer: "KISAE",
    name: "SC1220LD Solar Charge Controller",
    productType: "mppt",
    category: "Charging",
    nominalVoltage: [12, 24],
    maxCurrentA: 20,
    maxPvCurrentA: 20,
    capabilities: ["mppt", "pv-input", "battery-charger"],
    description: "KISAE solar charge controller, 20A.",
    partNumber: "SC1220LD",
    productUrl: "https://www.cdnrg.com/products/sc1220ld",
    source: "Canadian Energy product index",
    dataQuality: "partial",
    width: 96,
    height: 72,
    terminals: mpptTerminals2,
    imageUrl: "/product-images/kisae-mppt.svg",
    mpptRatings: {
      batteryVoltagesV: [12, 24],
      maxPvVoltageV: 100,
      maxPvCurrentA: 20,
      maxOutputCurrentA: 20,
      efficiencyPct: 95
    }
  },
  // ── New entries ─────────────────────────────────────────────
  {
    id: "kisae-ac1220",
    manufacturer: "KISAE",
    name: "ABSO AC Charger 12V 20A",
    productType: "shore_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 20,
    capabilities: ["ac-charger", "battery-charger"],
    description: "KISAE ABSO smart multi-stage AC battery charger, 12V 20A.",
    partNumber: "AC1220",
    productUrl: "https://www.kisaepower.com/products/ac1220/",
    source: "kisaepower.com",
    dataQuality: "partial",
    width: 90,
    height: 64,
    terminals: acChargerTerminals2,
    imageUrl: "/product-images/kisae-ac-charger.svg"
  },
  {
    id: "kisae-sw1220",
    manufacturer: "KISAE",
    name: "SW 12V 2000W Sine Wave Inverter",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 12,
    continuousPowerW: 2e3,
    capabilities: ["inverter"],
    description: "KISAE SW 12V pure sine wave inverter, 2000W.",
    partNumber: "SW1220",
    productUrl: "https://www.kisaepower.com/products/sw1220/",
    source: "kisaepower.com",
    dataQuality: "partial",
    width: 140,
    height: 90,
    terminals: inverterTerminals,
    inverterChargerRatings: { dcVoltageV: 12, continuousInverterW: 2e3, acOutputVoltageV: 120 },
    imageUrl: "/product-images/kisae-inverter.svg"
  },
  {
    id: "kisae-swxfr1230",
    manufacturer: "KISAE",
    name: "SWXFR 12V 3000W Sine Wave Inverter w/ Transfer Switch",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 12,
    continuousPowerW: 3e3,
    capabilities: ["inverter"],
    description: "KISAE SWXFR 12V pure sine wave inverter, 3000W with integrated AC transfer switch.",
    partNumber: "SWXFR1230",
    productUrl: "https://www.kisaepower.com/products/swxfr1230/",
    source: "kisaepower.com",
    dataQuality: "partial",
    width: 140,
    height: 90,
    terminals: inverterTerminals,
    inverterChargerRatings: { dcVoltageV: 12, continuousInverterW: 3e3, acOutputVoltageV: 120 },
    imageUrl: "/product-images/kisae-inverter.svg"
  },
  {
    id: "kisae-ic122055",
    manufacturer: "KISAE",
    name: "ABSO Inverter Charger 12V 2000W/55A",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 12,
    continuousPowerW: 2e3,
    maxCurrentA: 170,
    capabilities: ["inverter-charger", "battery-charger"],
    description: "KISAE ABSO high-frequency sine wave inverter/charger, 12V 2000W with 55A charger.",
    partNumber: "IC122055",
    productUrl: "https://www.kisaepower.com/products/ic122055/",
    source: "kisaepower.com",
    dataQuality: "partial",
    width: 140,
    height: 100,
    terminals: inverterChargerTerminals,
    inverterChargerRatings: { dcVoltageV: 12, continuousInverterW: 2e3, chargerCurrentA: 55, acInputVoltageV: 120, acOutputVoltageV: 120 },
    imageUrl: "/product-images/kisae-inverter-charger.svg"
  },
  {
    id: "kisae-bic123100",
    manufacturer: "KISAE",
    name: "BIC Inverter Charger 12V 3000W/100A",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 12,
    continuousPowerW: 3e3,
    maxCurrentA: 250,
    capabilities: ["inverter-charger", "battery-charger"],
    description: "KISAE BIC bidirectional true sine inverter/charger, 12V 3000W with 100A charger and CAN bus.",
    partNumber: "BIC123100",
    productUrl: "https://www.kisaepower.com/products/inverter-chargers",
    source: "kisaepower.com",
    dataQuality: "partial",
    width: 140,
    height: 100,
    terminals: inverterChargerTerminals,
    inverterChargerRatings: { dcVoltageV: 12, continuousInverterW: 3e3, chargerCurrentA: 100, acInputVoltageV: 120, acOutputVoltageV: 120 },
    imageUrl: "/product-images/kisae-inverter-charger.svg"
  },
  {
    id: "kisae-dmt12100",
    manufacturer: "KISAE",
    name: "DMT12100 DC-DC Charger with MPPT 12V 100A",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 12,
    maxCurrentA: 100,
    continuousPowerW: 1200,
    capabilities: ["dc-dc-converter", "battery-charger", "mppt", "pv-input"],
    description: "KISAE ABSO smart DC-to-DC battery charger with PV input, 12V 100A. Charges from alternator or solar.",
    partNumber: "DMT12100",
    productUrl: "https://www.kisaepower.com/products/dmt12100/",
    source: "kisaepower.com",
    dataQuality: "partial",
    width: 84,
    height: 112,
    terminals: dcDcPvTerminals,
    dcDcChargerRatings: { outputVoltageV: 12, outputCurrentA: 100, outputPowerW: 1200, isolated: false },
    imageUrl: "/product-images/kisae-dc-dc-mppt.svg"
  },
  {
    id: "kisae-dmt2430",
    manufacturer: "KISAE",
    name: "DMT2430 DC-DC Charger with MPPT 24V 30A",
    productType: "dc_dc_charger",
    category: "Charging",
    nominalVoltage: 24,
    maxCurrentA: 30,
    continuousPowerW: 720,
    capabilities: ["dc-dc-converter", "battery-charger", "mppt", "pv-input"],
    description: "KISAE smart DC-to-DC battery charger with PV input, 24V 30A. Charges from alternator or solar.",
    partNumber: "DMT2430",
    productUrl: "https://www.kisaepower.com/products/dmt2430/",
    source: "kisaepower.com",
    dataQuality: "partial",
    width: 84,
    height: 112,
    terminals: dcDcPvTerminals,
    dcDcChargerRatings: { outputVoltageV: 24, outputCurrentA: 30, outputPowerW: 720, isolated: false },
    imageUrl: "/product-images/kisae-dc-dc-mppt.svg"
  }
];

// src/data/products/residentialHybridInverters.ts
function hybridInverterTerminals(acInputCurrentA, acOutputCurrentA, pvCurrentA) {
  return [
    // ── DC battery (left) ──────────────────────────────────────
    {
      id: "dc_pos",
      label: "DC+",
      electricalType: "dc_pos",
      kind: "dc_power",
      polarity: "positive",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -80,
      offsetY: -10,
      domain: "dc",
      requiresOvercurrentProtection: true,
      notes: "Battery positive. Requires DC disconnect/fuse between battery and inverter."
    },
    {
      id: "dc_neg",
      label: "DC-",
      electricalType: "dc_neg",
      kind: "dc_power",
      polarity: "negative",
      role: "bidirectional",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -80,
      offsetY: 10,
      domain: "dc",
      notes: "Battery negative."
    },
    // ── MPPT 1 — PV input (top left) ──────────────────────────
    {
      id: "pv1_pos",
      label: "PV1+",
      electricalType: "pv_pos",
      kind: "pv_power",
      polarity: "positive",
      role: "sink",
      direction: "input",
      voltageClass: "pv_high_voltage",
      side: "top",
      offsetX: -50,
      offsetY: -90,
      domain: "pv",
      maxCurrentA: pvCurrentA,
      notes: "MPPT tracker 1 PV positive input."
    },
    {
      id: "pv1_neg",
      label: "PV1-",
      electricalType: "pv_neg",
      kind: "pv_power",
      polarity: "negative",
      role: "sink",
      direction: "input",
      voltageClass: "pv_high_voltage",
      side: "top",
      offsetX: -30,
      offsetY: -90,
      domain: "pv",
      notes: "MPPT tracker 1 PV negative input."
    },
    // ── MPPT 2 — PV input (top right) ─────────────────────────
    {
      id: "pv2_pos",
      label: "PV2+",
      electricalType: "pv_pos",
      kind: "pv_power",
      polarity: "positive",
      role: "sink",
      direction: "input",
      voltageClass: "pv_high_voltage",
      side: "top",
      offsetX: 30,
      offsetY: -90,
      domain: "pv",
      maxCurrentA: pvCurrentA,
      notes: "MPPT tracker 2 PV positive input."
    },
    {
      id: "pv2_neg",
      label: "PV2-",
      electricalType: "pv_neg",
      kind: "pv_power",
      polarity: "negative",
      role: "sink",
      direction: "input",
      voltageClass: "pv_high_voltage",
      side: "top",
      offsetX: 50,
      offsetY: -90,
      domain: "pv",
      notes: "MPPT tracker 2 PV negative input."
    },
    // ── AC In 1 — grid (right, upper group) ───────────────────
    {
      id: "ac_in1_l1",
      label: "AC In 1 L1",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "sink",
      direction: "input",
      voltageClass: "ac_240v",
      side: "right",
      offsetX: 80,
      offsetY: -55,
      domain: "ac",
      phases: 1,
      maxCurrentA: acInputCurrentA,
      notes: "AC input 1 (grid) \u2014 Line 1."
    },
    {
      id: "ac_in1_l2",
      label: "AC In 1 L2",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line2",
      role: "sink",
      direction: "input",
      voltageClass: "ac_240v",
      side: "right",
      offsetX: 80,
      offsetY: -40,
      domain: "ac",
      phases: 1,
      maxCurrentA: acInputCurrentA,
      notes: "AC input 1 (grid) \u2014 Line 2."
    },
    {
      id: "ac_in1_n",
      label: "AC In 1 N",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "neutral",
      role: "sink",
      direction: "input",
      voltageClass: "ac_240v",
      side: "right",
      offsetX: 80,
      offsetY: -25,
      domain: "ac",
      notes: "AC input 1 (grid) \u2014 Neutral."
    },
    // ── AC In 2 — generator (right, lower group) ──────────────
    {
      id: "ac_in2_l1",
      label: "AC In 2 L1",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "sink",
      direction: "input",
      voltageClass: "ac_240v",
      side: "right",
      offsetX: 80,
      offsetY: -5,
      domain: "ac",
      phases: 1,
      maxCurrentA: acInputCurrentA,
      notes: "AC input 2 (generator) \u2014 Line 1."
    },
    {
      id: "ac_in2_l2",
      label: "AC In 2 L2",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line2",
      role: "sink",
      direction: "input",
      voltageClass: "ac_240v",
      side: "right",
      offsetX: 80,
      offsetY: 10,
      domain: "ac",
      phases: 1,
      maxCurrentA: acInputCurrentA,
      notes: "AC input 2 (generator) \u2014 Line 2."
    },
    {
      id: "ac_in2_n",
      label: "AC In 2 N",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "neutral",
      role: "sink",
      direction: "input",
      voltageClass: "ac_240v",
      side: "right",
      offsetX: 80,
      offsetY: 25,
      domain: "ac",
      notes: "AC input 2 (generator) \u2014 Neutral."
    },
    // ── AC Out — split-phase load output (bottom) ─────────────
    {
      id: "ac_out_l1",
      label: "AC Out L1",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line",
      role: "source",
      direction: "output",
      voltageClass: "ac_240v",
      side: "bottom",
      offsetX: -20,
      offsetY: 90,
      domain: "ac",
      phases: 1,
      maxCurrentA: acOutputCurrentA,
      notes: "AC output \u2014 Line 1 (120 V to neutral, 240 V to L2)."
    },
    {
      id: "ac_out_l2",
      label: "AC Out L2",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "line2",
      role: "source",
      direction: "output",
      voltageClass: "ac_240v",
      side: "bottom",
      offsetX: -5,
      offsetY: 90,
      domain: "ac",
      phases: 1,
      maxCurrentA: acOutputCurrentA,
      notes: "AC output \u2014 Line 2 (120 V to neutral, 240 V to L1)."
    },
    {
      id: "ac_out_n",
      label: "AC Out N",
      electricalType: "ac",
      kind: "ac_power",
      polarity: "neutral",
      role: "source",
      direction: "output",
      voltageClass: "ac_240v",
      side: "bottom",
      offsetX: 10,
      offsetY: 90,
      domain: "ac",
      notes: "AC output \u2014 Neutral."
    }
  ];
}
var residentialHybridInverters = [
  {
    id: "hybrid-inv-48v-16k",
    manufacturer: "Generic",
    name: "Hybrid Solar Inverter 48V/16kW",
    productType: "inverter_charger",
    category: "Inverters",
    nominalVoltage: 48,
    continuousPowerW: 16e3,
    peakPowerW: 32e3,
    maxCurrentA: 320,
    capabilities: ["hybrid-inverter", "inverter-charger", "mppt", "pv-input", "battery-charger"],
    description: "Generic residential hybrid solar inverter. 48V/16kW split-phase output, dual MPPT inputs, dual AC inputs (grid + generator). Representative of EG4, Sol-Ark, Deye class products.",
    dataQuality: "partial",
    width: 160,
    height: 180,
    terminals: hybridInverterTerminals(80, 67, 160),
    inverterChargerRatings: {
      dcVoltageV: 48,
      maxDcCurrentA: 320,
      continuousInverterW: 16e3,
      surgeW: 32e3,
      chargerCurrentA: 200,
      acInputVoltageV: 240,
      acInputCurrentA: 80,
      acOutputVoltageV: 240,
      acOutputCurrentA: 67,
      transferSwitchA: 80,
      efficiencyPct: 97,
      mpptTrackerCount: 2,
      maxPvVoltageV: 150,
      maxPvCurrentA: 160,
      maxPvPowerW: 16e3
    }
  }
];

// src/data/products/connectionPoints.ts
var connectionPoints = [
  {
    id: "system-ac-earth",
    manufacturer: "System",
    name: "AC Earth",
    productType: "connection_point",
    category: "Connection Points",
    description: "AC protective earth / grounding connection point.",
    isVirtual: true,
    isBOMItem: false,
    width: 60,
    height: 60,
    terminals: [
      {
        id: "earth",
        label: "AC Earth",
        kind: "chassis_ground",
        role: "bus",
        side: "top",
        offsetX: 0,
        offsetY: -30,
        domain: "earthGround"
      }
    ]
  },
  {
    id: "system-dc-chassis",
    manufacturer: "System",
    name: "DC Chassis",
    productType: "connection_point",
    category: "Connection Points",
    description: "DC negative / chassis bonding reference point.",
    isVirtual: true,
    isBOMItem: false,
    width: 60,
    height: 60,
    terminals: [
      {
        id: "chassis",
        label: "DC Chassis",
        kind: "chassis_ground",
        role: "bus",
        side: "top",
        offsetX: 0,
        offsetY: -30,
        domain: "chassisGround"
      }
    ]
  }
];

// src/data/products/communication.ts
function commPort(id, name, connector, protocols, configurable = false) {
  const locked = protocols.length === 1;
  return {
    id,
    name,
    connectorType: connector,
    supportedProtocols: protocols,
    configuredProtocol: locked || configurable ? protocols[0] : void 0,
    isConfigurable: configurable && !locked
  };
}
function commPortsToTerminals(ports, w, h) {
  const count = ports.length;
  return ports.map((port, i) => {
    const fraction = count === 1 ? 0.5 : i / (count - 1);
    const offsetX = -w / 2 + fraction * w;
    const side = "bottom";
    return {
      id: port.id,
      label: port.name,
      kind: "network",
      role: "bidirectional",
      domain: "communication",
      side,
      offsetX,
      offsetY: h / 2
    };
  });
}
var CAN_PROTOCOLS = ["VE.Can", "BMS-Can", "CANopen", "J1939"];
var ALL_PROTOCOLS = ["VE.Can", "BMS-Can", "VE.Bus", "AEbus", "CANopen", "J1939", "Ethernet"];
function commProduct(partial) {
  const { communicationPorts, width, height, ...rest } = partial;
  return {
    ...rest,
    width,
    height,
    communicationPorts,
    terminals: commPortsToTerminals(communicationPorts, width, height)
  };
}
var communicationProducts = [
  // ---- CAN T-connectors / splitters ----
  commProduct({
    id: "comm-can-t-connector",
    manufacturer: "Generic",
    name: "CAN T-Connector",
    productType: "commAccessory",
    category: "Communication",
    description: "RJ45 T-connector/splitter for CAN bus networks (VE.Can, BMS-Can).",
    commAccessoryBehavior: "passive",
    width: 70,
    height: 50,
    communicationPorts: [
      commPort("port-a", "Port A", "RJ45", CAN_PROTOCOLS),
      commPort("port-b", "Port B", "RJ45", CAN_PROTOCOLS),
      commPort("port-c", "Port C", "RJ45", CAN_PROTOCOLS)
    ]
  }),
  commProduct({
    id: "comm-can-splitter-4port",
    manufacturer: "Generic",
    name: "CAN 4-Port Splitter",
    productType: "commAccessory",
    category: "Communication",
    description: "4-port passive RJ45 CAN bus splitter.",
    commAccessoryBehavior: "passive",
    width: 80,
    height: 50,
    communicationPorts: [
      commPort("port-a", "Port A", "RJ45", CAN_PROTOCOLS),
      commPort("port-b", "Port B", "RJ45", CAN_PROTOCOLS),
      commPort("port-c", "Port C", "RJ45", CAN_PROTOCOLS),
      commPort("port-d", "Port D", "RJ45", CAN_PROTOCOLS)
    ]
  }),
  // ---- CAN terminators ----
  commProduct({
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
      commPort("port-a", "Port", "RJ45", ["VE.Can", "BMS-Can"])
    ]
  }),
  commProduct({
    id: "comm-can-terminator-generic",
    manufacturer: "Generic",
    name: "CAN Terminator",
    productType: "commAccessory",
    category: "Communication",
    description: "Generic 120 Ohm terminator for CAN bus ends.",
    commAccessoryBehavior: "terminator",
    width: 60,
    height: 40,
    communicationPorts: [
      commPort("port-a", "Port", "RJ45", CAN_PROTOCOLS)
    ]
  }),
  // ---- AEbus splitter / terminator ----
  commProduct({
    id: "comm-aebus-splitter",
    manufacturer: "Generic",
    name: "AEbus Splitter",
    productType: "commAccessory",
    category: "Communication",
    description: "Passive AEbus communication splitter for parallel battery networks.",
    commAccessoryBehavior: "passive",
    width: 70,
    height: 50,
    communicationPorts: [
      commPort("port-a", "Port A", "RJ45", ["AEbus"]),
      commPort("port-b", "Port B", "RJ45", ["AEbus"]),
      commPort("port-c", "Port C", "RJ45", ["AEbus"])
    ]
  }),
  commProduct({
    id: "comm-aebus-terminator",
    manufacturer: "Generic",
    name: "AEbus Terminator",
    productType: "commAccessory",
    category: "Communication",
    description: "Terminator for AEbus network end points.",
    commAccessoryBehavior: "terminator",
    width: 60,
    height: 40,
    communicationPorts: [
      commPort("port-a", "Port", "RJ45", ["AEbus"])
    ]
  }),
  // ---- RJ45 coupler ----
  commProduct({
    id: "comm-rj45-coupler",
    manufacturer: "Generic",
    name: "RJ45 Coupler",
    productType: "commAccessory",
    category: "Communication",
    description: "Inline RJ45 coupler for extending communication cables.",
    commAccessoryBehavior: "passive",
    width: 60,
    height: 40,
    communicationPorts: [
      commPort("port-a", "Port A", "RJ45", ALL_PROTOCOLS),
      commPort("port-b", "Port B", "RJ45", ALL_PROTOCOLS)
    ]
  }),
  // ---- Active gateways ----
  commProduct({
    id: "comm-vebus-ethernet-gw",
    manufacturer: "Victron Energy",
    name: "VE.Bus to Ethernet Interface",
    productType: "commGateway",
    category: "Communication",
    description: "Active gateway bridging VE.Bus to Ethernet for remote monitoring.",
    commAccessoryBehavior: "active-gateway",
    commProtocolBridges: [
      { fromProtocol: "VE.Bus", toProtocol: "Ethernet" }
    ],
    width: 90,
    height: 60,
    communicationPorts: [
      commPort("port-vebus", "VE.Bus Port", "RJ45", ["VE.Bus"]),
      commPort("port-eth", "Ethernet Port", "RJ45", ["Ethernet"])
    ]
  }),
  commProduct({
    id: "comm-can-usb-interface",
    manufacturer: "Generic",
    name: "CAN to USB Interface",
    productType: "commGateway",
    category: "Communication",
    description: "Active CAN-to-USB adapter for diagnostics. Not for permanent installed links.",
    commAccessoryBehavior: "active-interface",
    width: 80,
    height: 55,
    communicationPorts: [
      commPort("port-can", "CAN Port", "RJ45", CAN_PROTOCOLS)
    ]
  }),
  // ---- Network cables ----
  commProduct({
    id: "comm-vebus-cable-rj45",
    manufacturer: "Victron Energy",
    name: "VE.Bus RJ45 Cable",
    productType: "commAccessory",
    category: "Communication",
    description: "RJ45 cable for connecting VE.Bus devices (MultiPlus, Quattro, etc.).",
    commAccessoryBehavior: "passive",
    isBOMItem: true,
    width: 60,
    height: 40,
    communicationPorts: [
      commPort("port-a", "Port A", "RJ45", ["VE.Bus"]),
      commPort("port-b", "Port B", "RJ45", ["VE.Bus"])
    ]
  }),
  commProduct({
    id: "comm-vecan-cable-rj45",
    manufacturer: "Victron Energy",
    name: "VE.Can RJ45 Cable",
    productType: "commAccessory",
    category: "Communication",
    description: "RJ45 cable for VE.Can network connections.",
    commAccessoryBehavior: "passive",
    isBOMItem: true,
    width: 60,
    height: 40,
    communicationPorts: [
      commPort("port-a", "Port A", "RJ45", ["VE.Can", "BMS-Can"]),
      commPort("port-b", "Port B", "RJ45", ["VE.Can", "BMS-Can"])
    ]
  })
];

// src/data/products/categories.ts
var CATEGORIES = [
  {
    id: "Batteries",
    label: "Batteries",
    description: "Energy storage: lithium, AGM, gel, and other battery types.",
    sortOrder: 1
  },
  {
    id: "Solar",
    label: "Solar",
    description: "Solar panels, arrays, and PV combiner boxes.",
    sortOrder: 2
  },
  {
    id: "Charging",
    label: "Charging",
    description: "MPPT charge controllers, DC-DC chargers, and shore power chargers.",
    sortOrder: 3
  },
  {
    id: "Inverters",
    label: "Inverters",
    description: "Inverters and inverter/charger combo units.",
    sortOrder: 4
  },
  {
    id: "Distribution",
    label: "Distribution",
    description: "DC and AC distribution panels, busbars, and combiners.",
    sortOrder: 5
  },
  {
    id: "Protection",
    label: "Protection",
    description: "Fuses, circuit breakers, disconnects, and overcurrent protection.",
    sortOrder: 6
  },
  {
    id: "AC Equipment",
    label: "AC Equipment",
    description: "Shore power inlets, transfer switches, and AC distribution panels.",
    sortOrder: 7
  },
  {
    id: "Loads",
    label: "Loads",
    description: "DC loads, AC loads, and other consuming devices.",
    sortOrder: 8
  },
  {
    id: "Monitoring",
    label: "Monitoring",
    description: "Battery monitors, system monitors, and control hubs.",
    sortOrder: 9
  },
  {
    id: "Cables",
    label: "Cables",
    description: "Power cables, signal cables, and cable assemblies.",
    sortOrder: 10
  },
  {
    id: "Accessories",
    label: "Accessories",
    description: "Miscellaneous accessories, adapters, and generic placeholders.",
    sortOrder: 11
  },
  {
    id: "Connection Points",
    label: "Connection Points",
    description: "Grounding symbols and chassis bonding reference points for schematic clarity.",
    sortOrder: 12
  },
  {
    id: "Communication",
    label: "Communication",
    description: "Communication accessories, gateways, splitters, terminators, and network cables.",
    sortOrder: 13
  }
];
var CATEGORY_IDS = CATEGORIES.sort((a, b) => a.sortOrder - b.sortOrder).map((c) => c.id);

// src/data/products/productTypes.ts
var PRODUCT_TYPE_DEFINITIONS = [
  // --- Energy Storage ---
  {
    id: "battery",
    label: "Battery",
    description: "Electrochemical energy storage device.",
    defaultCategory: "Batteries",
    bomSection: "Energy Storage",
    requiresTerminals: true
  },
  // --- Charging ---
  {
    id: "mppt",
    label: "MPPT Charge Controller",
    description: "Solar charge controller using maximum power point tracking.",
    defaultCategory: "Charging",
    bomSection: "Charging Sources",
    requiresTerminals: true
  },
  {
    id: "dc_dc_charger",
    label: "DC-DC Charger",
    description: "Isolated or non-isolated DC-DC converter used for charging from alternator or another battery.",
    defaultCategory: "Charging",
    bomSection: "Charging Sources",
    requiresTerminals: true
  },
  {
    id: "shore_charger",
    label: "Shore Power Charger",
    description: "AC-powered battery charger connected to shore power.",
    defaultCategory: "Charging",
    bomSection: "Charging Sources",
    requiresTerminals: true
  },
  // --- Power Conversion ---
  {
    id: "inverter_charger",
    label: "Inverter / Charger",
    description: "Combined DC-to-AC inverter and AC-to-DC battery charger.",
    defaultCategory: "Inverters",
    bomSection: "Power Conversion",
    requiresTerminals: true
  },
  {
    id: "converter",
    label: "Converter",
    description: "AC-to-DC power converter (non-charger).",
    defaultCategory: "Inverters",
    bomSection: "Power Conversion",
    requiresTerminals: true
  },
  // --- Solar ---
  {
    id: "solar_array",
    label: "Solar Array",
    description: "Photovoltaic solar panel or array generating DC power.",
    defaultCategory: "Solar",
    bomSection: "Charging Sources",
    requiresTerminals: true
  },
  {
    id: "solar_combiner",
    label: "Solar Combiner Box",
    description: "PV string combiner box combining multiple solar strings into one output.",
    defaultCategory: "Solar",
    bomSection: "Charging Sources",
    requiresTerminals: true,
    isPassThrough: true
  },
  {
    id: "pvCombinerBox",
    label: "PV Combiner Box",
    description: "PV combiner box (alias for solar_combiner; preferred new type name).",
    defaultCategory: "Solar",
    bomSection: "Charging Sources",
    requiresTerminals: true,
    isPassThrough: true
  },
  // --- Distribution ---
  {
    id: "dc_distribution",
    label: "DC Distribution",
    description: "DC power distribution panel or Lynx-style distribution module.",
    defaultCategory: "Distribution",
    bomSection: "DC Distribution",
    requiresTerminals: true,
    isPassThrough: true
  },
  {
    id: "busbar",
    label: "Busbar",
    description: "Single-polarity DC busbar for connecting multiple conductors.",
    defaultCategory: "Distribution",
    bomSection: "DC Distribution",
    requiresTerminals: true,
    isPassThrough: true
  },
  {
    id: "ac_distribution",
    label: "AC Distribution Panel",
    description: "AC branch circuit distribution panel.",
    defaultCategory: "AC Equipment",
    bomSection: "AC Distribution",
    requiresTerminals: true,
    isPassThrough: true
  },
  // --- Protection ---
  {
    id: "fuse",
    label: "Fuse",
    description: "Single-use overcurrent protection device.",
    defaultCategory: "Protection",
    bomSection: "Protection",
    requiresTerminals: true,
    isPassThrough: true
  },
  {
    id: "breaker",
    label: "Circuit Breaker",
    description: "Resettable overcurrent protection device.",
    defaultCategory: "Protection",
    bomSection: "Protection",
    requiresTerminals: true,
    isPassThrough: true
  },
  {
    id: "dcDisconnect",
    label: "DC Disconnect",
    description: "Manual or automatic DC disconnect switch.",
    defaultCategory: "Protection",
    bomSection: "Protection",
    requiresTerminals: true,
    isPassThrough: true
  },
  {
    id: "acDisconnect",
    label: "AC Disconnect",
    description: "Manual or automatic AC disconnect switch.",
    defaultCategory: "Protection",
    bomSection: "Protection",
    requiresTerminals: true,
    isPassThrough: true
  },
  {
    id: "relay",
    label: "Relay",
    description: "Electrically controlled switch.",
    defaultCategory: "Protection",
    bomSection: "Protection",
    requiresTerminals: true,
    isPassThrough: true
  },
  {
    id: "contactor",
    label: "Contactor",
    description: "Heavy-duty electrically controlled switch for high-current circuits.",
    defaultCategory: "Protection",
    bomSection: "Protection",
    requiresTerminals: true,
    isPassThrough: true
  },
  // --- AC Equipment ---
  {
    id: "shorePowerInlet",
    label: "Shore Power Inlet",
    description: "AC shore power inlet connector.",
    defaultCategory: "AC Equipment",
    bomSection: "AC Distribution",
    requiresTerminals: true
  },
  {
    id: "transferSwitch",
    label: "Transfer Switch",
    description: "Automatic or manual transfer switch between power sources.",
    defaultCategory: "AC Equipment",
    bomSection: "AC Distribution",
    requiresTerminals: true,
    isPassThrough: true
  },
  // --- Loads ---
  {
    id: "dc_load",
    label: "DC Load",
    description: "Generic or specific DC consuming device.",
    defaultCategory: "Loads",
    bomSection: "Accessories",
    requiresTerminals: true
  },
  {
    id: "ac_load",
    label: "AC Load",
    description: "Generic or specific AC consuming device.",
    defaultCategory: "Loads",
    bomSection: "Accessories",
    requiresTerminals: true
  },
  // --- Monitoring ---
  {
    id: "monitor",
    label: "Monitor / Control",
    description: "Battery monitor, system monitor, or control hub.",
    defaultCategory: "Monitoring",
    bomSection: "Monitoring & Control",
    requiresTerminals: false
  },
  {
    id: "batteryMonitor",
    label: "Battery Monitor",
    description: "Dedicated battery state-of-charge monitor (preferred new type name).",
    defaultCategory: "Monitoring",
    bomSection: "Monitoring & Control",
    requiresTerminals: false
  },
  // --- Cables ---
  {
    id: "cable",
    label: "Cable",
    description: "Power or signal cable assembly.",
    defaultCategory: "Cables",
    bomSection: "Cabling",
    requiresTerminals: false
  },
  // --- Accessories ---
  {
    id: "accessory",
    label: "Accessory",
    description: "Miscellaneous accessory or component that does not fit another type.",
    defaultCategory: "Accessories",
    bomSection: "Accessories",
    requiresTerminals: false
  }
];
var PRODUCT_TYPE_MAP = new Map(
  PRODUCT_TYPE_DEFINITIONS.map((d) => [d.id, d])
);
var PASS_THROUGH_PRODUCT_TYPES = new Set(
  PRODUCT_TYPE_DEFINITIONS.filter((d) => d.isPassThrough).map((d) => d.id)
);

// src/data/products/index.ts
function netTerminal(id, label, offsetX, offsetY) {
  return { id, label, kind: "network", role: "bidirectional", domain: "communication", side: "top", offsetX, offsetY };
}
var VE_BUS_PORT = {
  id: "ve_bus",
  name: "VE.Bus",
  connectorType: "RJ45",
  supportedProtocols: ["VE.Bus"],
  configuredProtocol: "VE.Bus"
};
var VE_CAN_PORT = {
  id: "ve_can",
  name: "VE.Can",
  connectorType: "RJ45",
  supportedProtocols: ["VE.Can"],
  configuredProtocol: "VE.Can"
};
var VE_DIRECT_PORT = {
  id: "ve_direct",
  name: "VE.Direct",
  connectorType: "VE.Direct",
  supportedProtocols: ["VE.Direct"],
  configuredProtocol: "VE.Direct"
};
var BMS_CAN_PORT = {
  id: "bms_can",
  name: "BMS-Can",
  connectorType: "RJ45",
  supportedProtocols: ["BMS-Can"],
  configuredProtocol: "BMS-Can"
};
var ETHERNET_PORT = {
  id: "ethernet",
  name: "Ethernet",
  connectorType: "RJ45",
  supportedProtocols: ["Ethernet"],
  configuredProtocol: "Ethernet"
};
var CAN_CONFIGURABLE_PORT = {
  id: "can_bus",
  name: "BMS-Can / VE.Can",
  connectorType: "RJ45",
  supportedProtocols: ["BMS-Can", "VE.Can"],
  configuredProtocol: "BMS-Can",
  isConfigurable: true,
  notes: "CAN-bus profile is selectable (VE.Can or BMS-Can)."
};
function withCommPorts(product, ports) {
  const w = product.width;
  const h = product.height;
  const count = ports.length;
  const newTerminals = ports.map((port, i) => {
    const fraction = count === 1 ? 0.5 : i / (count - 1);
    const offsetX = -w / 2 + fraction * w;
    return netTerminal(port.id, port.name, offsetX, -h / 2);
  });
  return {
    ...product,
    communicationPorts: ports,
    terminals: [...product.terminals, ...newTerminals]
  };
}
var SMARTLITHIUM_IDS = /* @__PURE__ */ new Set([
  "bat-vic-smart-12-100",
  "bat-vic-smart-12-200",
  "bat-vic-smart-24-100",
  "bat-vic-smart-48-100",
  "victron-lithium-ng-12-100",
  "victron-lithium-ng-12-200",
  "victron-lithium-ng-25-100",
  "victron-lithium-ng-51-100"
]);
var MONITORING_VE_DIRECT_IDS = /* @__PURE__ */ new Set([
  "smartshunt-500",
  "smartshunt-1000",
  "smartshunt-2000"
]);
function applyCommPorts(products) {
  return products.map((p) => {
    if (p.communicationPorts) return p;
    if (p.productType === "inverter_charger") {
      return withCommPorts(p, [VE_BUS_PORT]);
    }
    if (p.productType === "mppt") {
      return withCommPorts(p, [VE_CAN_PORT, VE_DIRECT_PORT]);
    }
    if (SMARTLITHIUM_IDS.has(p.id)) {
      return withCommPorts(p, [BMS_CAN_PORT]);
    }
    if (MONITORING_VE_DIRECT_IDS.has(p.id)) {
      return withCommPorts(p, [VE_DIRECT_PORT]);
    }
    if (p.id === "ekrano-gx") {
      return withCommPorts(p, [
        CAN_CONFIGURABLE_PORT,
        VE_BUS_PORT,
        ETHERNET_PORT
      ]);
    }
    return p;
  });
}
var ALL_PRODUCTS = applyCommPorts([
  ...batteries,
  ...inverterChargers,
  ...mppts,
  ...dcDcChargers,
  ...acChargers,
  ...solarArrays,
  ...distribution,
  ...protection,
  ...monitoring,
  ...accessories,
  ...kisaeProducts,
  ...residentialHybridInverters,
  ...connectionPoints,
  ...communicationProducts
]);
var PRODUCT_MAP = new Map(
  ALL_PRODUCTS.map((p) => [p.id, p])
);

// scripts/migrate-products.ts
var SOURCE_MAP = [
  { products: batteries, dir: "batteries" },
  { products: mppts, dir: "mppts" },
  { products: inverterChargers, dir: "inverter-chargers" },
  { products: dcDcChargers, dir: "dc-dc-chargers" },
  { products: acChargers, dir: "ac-chargers" },
  { products: solarArrays, dir: "solar" },
  { products: distribution, dir: "distribution" },
  { products: protection, dir: "protection" },
  { products: monitoring, dir: "monitoring" },
  { products: accessories, dir: "accessories" },
  { products: kisaeProducts, dir: "kisae" },
  { products: residentialHybridInverters, dir: "residential" },
  { products: connectionPoints, dir: "connection-points" },
  { products: communicationProducts, dir: "communication" }
];
var idToDir = /* @__PURE__ */ new Map();
for (const { products, dir } of SOURCE_MAP) {
  for (const p of products) {
    if (idToDir.has(p.id)) {
      console.warn(`WARN: duplicate id "${p.id}" found in source arrays`);
    }
    idToDir.set(p.id, dir);
  }
}
function serialize(obj) {
  return JSON.stringify(obj, null, 2).replace(/"([a-zA-Z_$][a-zA-Z0-9_$]*)"\s*:/g, "$1:");
}
function generateFileContent(product) {
  return [
    `import type { Product } from '../../../../types/system';`,
    ``,
    `const product: Product = ${serialize(product)};`,
    ``,
    `export default product;`,
    ``
  ].join("\n");
}
var ROOT = process.cwd();
var CATALOG_ROOT = path.join(ROOT, "src", "data", "products", "catalog");
console.log(`
Migrating ${ALL_PRODUCTS.length} products to ${CATALOG_ROOT}
`);
var written = 0;
var skipped = 0;
var unmapped = [];
for (const product of ALL_PRODUCTS) {
  const subdir = idToDir.get(product.id);
  if (!subdir) {
    unmapped.push(product.id);
    continue;
  }
  const dir = path.join(CATALOG_ROOT, subdir);
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${product.id}.ts`;
  const filepath = path.join(dir, filename);
  if (fs.existsSync(filepath)) {
    console.log(`  SKIP (exists): ${subdir}/${filename}`);
    skipped++;
    continue;
  }
  fs.writeFileSync(filepath, generateFileContent(product), "utf-8");
  console.log(`  WRITE: ${subdir}/${filename}`);
  written++;
}
console.log(`
${"\u2500".repeat(50)}`);
console.log(`Source product count : ${idToDir.size}`);
console.log(`ALL_PRODUCTS count   : ${ALL_PRODUCTS.length}`);
console.log(`Files written        : ${written}`);
console.log(`Files skipped        : ${skipped}`);
if (unmapped.length > 0) {
  console.warn(`
WARN: ${unmapped.length} products in ALL_PRODUCTS had no source mapping:`);
  for (const id of unmapped) console.warn(`  - ${id}`);
}
if (ALL_PRODUCTS.length !== idToDir.size) {
  console.warn(`
WARN: count mismatch \u2014 ALL_PRODUCTS (${ALL_PRODUCTS.length}) !== source arrays (${idToDir.size})`);
  console.warn("This may indicate products added/removed by applyCommPorts or duplicates.");
}
console.log(`
Done. Validate the output in src/data/products/catalog/, then flip index.ts.
`);
