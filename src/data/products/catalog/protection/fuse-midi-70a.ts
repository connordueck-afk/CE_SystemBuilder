import type { Product } from '../../../../types/system';

const product: Product = {
  id: "fuse-midi-70a",
  manufacturer: "Generic",
  name: "MIDI Fuse 70A",
  productType: "fuse",
  category: "MIDI",
  maxCurrentA: 70,
  msrpUsd: 12,
  oemPriceUsd: 8,
  description: "MIDI fuse, 70A DC protection",
  source: "Catalog scrape: MIDI/AMI fuse ranges",
  dataQuality: "placeholder",
  imageUrl: "/product-images/fuse-midi.svg",
  width: 80,
  height: 34,
  terminals: [
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
  ],
  protectionRatings: {
    currentRatingA: 70,
    voltageRatingV: 58,
    interruptRatingA: 2000,
    acDcCompatibility: "dc",
    fuseStyle: "MIDI",
    protectionType: "fuse"
  }
};

export default product;
