import type { Product } from '../../../../types/system';

const product: Product = {
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
      polarity: "positive",
      role: "sense",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -40,
      offsetY: 0,
      notes: "Positive sense connection via 500A/50mV shunt (included).",
      portId: "dc"
    },
    {
      id: "shunt_neg",
      label: "Shunt-",
      polarity: "negative",
      role: "sense",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 40,
      offsetY: 0,
      notes: "Negative sense connection (load side of shunt).",
      portId: "dc"
    }
  ],
  ports: [
    {
      id: "dc",
      kind: "dc",
      topology: "two_pole",
      label: "DC"
    }
  ]
};

export default product;
