import type { Product } from '../../../../types/system';

const product: Product = {
  id: "fuse-midi",
  manufacturer: "Generic",
  name: "MIDI Fuse",
  productType: "fuse",
  category: "MIDI",
  description: "MIDI fuse for DC protection",
  source: "Catalog scrape: MIDI/AMI fuse ranges",
  dataQuality: "placeholder",
  imageUrl: "/product-images/fuse-midi.svg",
  width: 80,
  height: 34,
  terminals: [
    {
      id: "in",
      label: "A",
      kind: "dc_power",
      polarity: "positive",
      role: "pass_through",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -40,
      offsetY: 0,
      connector: { kind: 'stud', holeSize: 'M6' }
    },
    {
      id: "out",
      label: "B",
      kind: "dc_power",
      polarity: "positive",
      role: "pass_through",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 40,
      offsetY: 0,
      connector: { kind: 'stud', holeSize: 'M6' }
    }
  ],
  protectionRatings: {
    currentRatingA: 0,
    voltageRatingV: 58,
    interruptRatingA: 2000,
    acDcCompatibility: "dc",
    fuseStyle: "MIDI",
    protectionType: "fuse"
  },
  variants: [
    { id: "fuse-midi-30a",  currentRatingA: 30,  msrpUsd: 11, oemPriceUsd: 8 },
    { id: "fuse-midi-40a",  currentRatingA: 40,  msrpUsd: 11, oemPriceUsd: 8 },
    { id: "fuse-midi-50a",  currentRatingA: 50,  msrpUsd: 11, oemPriceUsd: 8 },
    { id: "fuse-midi-60a",  currentRatingA: 60,  msrpUsd: 12, oemPriceUsd: 8 },
    { id: "fuse-midi-70a",  currentRatingA: 70,  msrpUsd: 12, oemPriceUsd: 8 },
    { id: "fuse-midi-80a",  currentRatingA: 80,  msrpUsd: 12, oemPriceUsd: 8 },
    { id: "fuse-midi-100a", currentRatingA: 100, msrpUsd: 13, oemPriceUsd: 9 },
    { id: "fuse-midi-125a", currentRatingA: 125, msrpUsd: 13, oemPriceUsd: 9 },
    { id: "fuse-midi-150a", currentRatingA: 150, msrpUsd: 14, oemPriceUsd: 10 },
    { id: "fuse-midi-175a", currentRatingA: 175, msrpUsd: 14, oemPriceUsd: 10 },
    { id: "fuse-midi-200a", currentRatingA: 200, msrpUsd: 15, oemPriceUsd: 11 },
  ],
};

export default product;
