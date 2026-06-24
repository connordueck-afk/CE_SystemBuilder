import type { Product } from '../../../../types/system';

const product: Product = {
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
};

export default product;
