# Fuse Catalog Structure

This document describes the file naming convention, data structure, and grouping
mechanism for fuse products. Follow this pattern when adding new fuse products.

---

## File Naming Convention

```
fuse-{style}-{manufacturer}-{voltage}v.ts
```

| Segment        | Examples                                   |
|----------------|--------------------------------------------|
| `{style}`      | `mega`, `anl`, `class-t`, `midi`, `mrbf`  |
| `{manufacturer}` | `generic`, `littelfuse`, `bussmann`, `blue-sea` |
| `{voltage}`    | `32v`, `58v`, `125v`                       |

**Examples:**
- `fuse-mega-littelfuse-32v.ts`
- `fuse-mega-generic-58v.ts`
- `fuse-anl-bussmann-58v.ts`

---

## How Grouping Works

The UI groups fuse products using three existing fields — no new fields required:

| UI Level        | Data Field                       | Example          |
|-----------------|----------------------------------|------------------|
| Fuse style      | `category`                       | `"MEGA"`         |
| Manufacturer    | `manufacturer`                   | `"Littelfuse"`   |
| Voltage line    | `protectionRatings.voltageRatingV` | `32`           |
| Current rating  | `variants[].currentRatingA`      | `100`            |

All files sharing the same `category` appear together in the fuse style group.
Within that group, the UI can sort and filter by manufacturer and voltage.

---

## File Structure Template

```ts
import type { Product } from '../../../../types/system';

const product: Product = {
  id: "fuse-mega-{manufacturer}-{voltage}v",
  manufacturer: "{Manufacturer}",
  name: "{Manufacturer} MEGA Fuse {voltage}V",
  productType: "fuse",
  category: "MEGA",                    // ← fuse style — must match across all MEGA files
  description: "...",
  source: "{Datasheet reference}",
  dataQuality: "verified",             // or "placeholder" for TBD data
  imageUrl: "/product-images/fuse-mega.svg",
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
      domain: "dc",
      connector: { kind: 'stud', holeSize: 'M8' }
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
      domain: "dc",
      connector: { kind: 'stud', holeSize: 'M8' }
    }
  ],
  protectionRatings: {
    currentRatingA: 0,                 // ← overridden per variant
    voltageRatingV: {voltage},         // ← defines this product line
    interruptRatingA: 0,               // ← TBD from datasheet
    acDcCompatibility: "dc",
    fuseStyle: "MEGA",
    protectionType: "fuse"
  },
  variants: [
    { id: "fuse-mega-{manufacturer}-{voltage}v-100a", currentRatingA: 100, msrpUsd: 0, oemPriceUsd: 0, partNumber: "TBD" },
    // ...one entry per available current rating
  ],
};

export default product;
```

---

## Variant ID Convention

```
fuse-{style}-{manufacturer}-{voltage}v-{current}a
```

**Examples:**
- `fuse-mega-littelfuse-32v-100a`
- `fuse-mega-generic-58v-300a`
- `fuse-anl-bussmann-58v-200a`

---

## Voltage Rating Guide

| Voltage Rating | Suitable for                          | Notes                                  |
|----------------|---------------------------------------|----------------------------------------|
| 32V            | 12V and 24V systems                   | Most common for automotive/marine 12V  |
| 58V            | 12V, 24V, and 48V systems             | Standard for off-grid solar/48V marine |
| 125V DC        | Higher voltage battery/PV systems     | Less common; verify system voltage     |
| 150V+          | High-voltage PV or EV applications    | Add files as needed                    |

Choose the lowest voltage rating that still exceeds your system voltage with margin.
A 48V nominal system peaks around 58V fully charged — use 58V or higher rated fuses.

---

## Adding a New Manufacturer / Voltage Line

1. Create a new file following the naming convention above.
2. Set `manufacturer`, `category`, and `protectionRatings.voltageRatingV` correctly.
3. Populate `variants` with current ratings and part numbers from the manufacturer's datasheet.
4. Set `dataQuality: "placeholder"` if part numbers or prices are TBD.
5. The file is picked up automatically by `import.meta.glob` — no registration required.

---

## Current File Inventory

| File                            | Manufacturer  | Voltage | Current Range | Status      |
|---------------------------------|---------------|---------|---------------|-------------|
| `fuse-mega-generic-32v.ts`      | Generic       | 32V     | 60–500A       | Placeholder |
| `fuse-mega-generic-58v.ts`      | Generic       | 58V     | 60–500A       | Placeholder |
| `fuse-mega-littelfuse-32v.ts`   | Littelfuse    | 32V     | 30–500A       | TBD         |
| `fuse-mega-littelfuse-58v.ts`   | Littelfuse    | 58V     | 30–500A       | TBD         |
| `fuse-mega-littelfuse-125v.ts`  | Littelfuse    | 125V    | 30–200A       | TBD         |
