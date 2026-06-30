import type { Product } from '../../../../types/system';

const product: Product = {
  id: "mon-vic-bmv-712",
  manufacturer: "Victron",
  name: "BMV-712 Battery Monitor",
  productType: "monitor",
  category: "Monitoring",
  msrpUsd: 149,
  oemPriceUsd: 104,
  description: "Victron BMV-712 Smart battery monitor with Bluetooth.",
  partNumber: "BAM010712000",
  productUrl: "https://www.victronenergy.com/battery-monitors/bmv-712-smart",
  source: "Victron 2024",
  dataQuality: "complete",
  width: 80,
  height: 60,
  terminalGroups: [
    { id: "sense_pos", portId: "dc", label: "Positive Sense", groupType: "power_conductor", polarity: "positive", internallyCommon: false, maxCurrentA: 1 },
    { id: "sense_neg", portId: "dc", label: "Negative Sense", groupType: "power_conductor", polarity: "negative", internallyCommon: false, maxCurrentA: 1 }
  ],
  terminals: [
    { id: "shunt_pos", terminalGroupId: "sense_pos", label: "Shunt+", side: "left", offsetX: -40, offsetY: 0, maxCurrentA: 1, connector: { kind: "screw_terminal" }, notes: "Positive sense connection via 500A/50mV shunt (included)." },
    { id: "shunt_neg", terminalGroupId: "sense_neg", label: "Shunt-", side: "right", offsetX: 40, offsetY: 0, maxCurrentA: 1, connector: { kind: "screw_terminal" }, notes: "Negative sense connection (load side of shunt)." }
  ],
  ports: [
    { id: "dc", kind: "dc", topology: "two_pole", label: "DC Sense", voltageClass: "dc_low_voltage", maxCurrentA: 1, role: "sense", direction: "bidirectional" }
  ]
};

export default product;
