import type { Product } from '../../../../types/system';

const product: Product = {
  id: "fuse-midi-littelfuse",
  manufacturer: "Littelfuse",
  name: "Littelfuse MIDI Fuse",
  productType: "fuse",
  category: "MIDI",
  description: "Littelfuse MIDI/AMI series DC fuse.",
  source: "TBD â€” Littelfuse MIDI series datasheet",
  dataQuality: "placeholder",
  imageUrl: "/product-images/fuse-midi.svg",
  width: 80,
  height: 34,
  terminals: [
    {
      id: "in",
      label: "A",
      polarity: "positive",
      role: "pass_through",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "left",
      offsetX: -40,
      offsetY: 0,
      connector: {
        kind: "stud",
        holeSize: "M6"
      },
      portId: "main"
    },
    {
      id: "out",
      label: "B",
      polarity: "positive",
      role: "pass_through",
      direction: "bidirectional",
      voltageClass: "dc_low_voltage",
      side: "right",
      offsetX: 40,
      offsetY: 0,
      connector: {
        kind: "stud",
        holeSize: "M6"
      },
      portId: "main"
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
    {
      id: "fuse-midi-littelfuse-30a",
      currentRatingA: 30,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-midi-littelfuse-40a",
      currentRatingA: 40,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-midi-littelfuse-50a",
      currentRatingA: 50,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-midi-littelfuse-60a",
      currentRatingA: 60,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-midi-littelfuse-70a",
      currentRatingA: 70,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-midi-littelfuse-80a",
      currentRatingA: 80,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-midi-littelfuse-100a",
      currentRatingA: 100,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-midi-littelfuse-125a",
      currentRatingA: 125,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-midi-littelfuse-150a",
      currentRatingA: 150,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-midi-littelfuse-175a",
      currentRatingA: 175,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    },
    {
      id: "fuse-midi-littelfuse-200a",
      currentRatingA: 200,
      msrpUsd: 0,
      oemPriceUsd: 0,
      partNumber: "TBD"
    }
  ],
  ports: [
    {
      id: "main",
      kind: "dc",
      topology: "pass_through",
      label: "Main",
      maxCurrentA: 0,
      voltageMaxV: 58
    }
  ]
};

export default product;
