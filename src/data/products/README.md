# Product Catalog — Developer Reference

This directory contains the complete product catalog for the Nomadeus System Builder.

---

## Directory Structure

```
src/data/products/
  index.ts              — Catalog entry point. Import ALL_PRODUCTS / getProduct from here.
  categories.ts         — Category definitions (for UI grouping only).
  productTypes.ts       — Product type registry (drives electrical behavior).
  productSchemas.ts     — Factory helpers for creating strongly-typed product objects.

  batteries.ts          — LiFePO4 and other battery products.
  mppts.ts              — MPPT charge controller products.
  inverterChargers.ts   — Inverter/charger combo products.
  solar.ts              — Solar arrays and combiner boxes.
  distribution.ts       — DC distribution panels, busbars, and Lynx modules.
  protection.ts         — Fuses and circuit breakers.
  accessories.ts        — DC-DC chargers, monitors, and generic loads.

  helpers/
    catalogUtils.ts     — Compatibility adapters and catalog query helpers.
    validation.ts       — Catalog validation utilities (dev/test use).
```

The top-level file `src/data/products.ts` re-exports everything from this directory
and is the import target for all existing application code.

---

## Adding a New Product

1. Open the appropriate product file (e.g., `batteries.ts`, `mppts.ts`).

2. Create a product object that satisfies the `Product` interface from `src/types/system.ts`.
   You can use the factory helpers from `productSchemas.ts` or write the object directly.

3. Required fields for every product:

   ```ts
   {
     id: string,           // Unique. Use kebab-case: "bat-vic-smart-12-200".
     manufacturer: string, // e.g., "Victron", "Blue Sea", "Generic"
     name: string,         // Display name: e.g., "SmartLithium 12.8V/200Ah"
     productType: ProductType,
     msrpUsd: number,      // Set to 0 if free or unknown.
     terminals: TerminalDefinition[],
     width: number,        // Canvas symbol width in pixels.
     height: number,       // Canvas symbol height in pixels.
   }
   ```

4. Add it to the exported array at the bottom of the file.

5. The product will automatically appear in:
   - The part library
   - BOM calculations
   - Canvas placement
   - Voltage compatibility filtering

No other files need to change.

---

## Product IDs

Product IDs must be unique across the entire catalog. Use this naming convention:

```
{type-prefix}-{manufacturer-short}-{key-spec}

Examples:
  bat-vic-smart-12-200      (Victron 12V 200Ah battery)
  mppt-vic-250-100          (Victron 250V/100A MPPT)
  inv-vic-mp2-48-5000       (Victron MultiPlus-II 48V 5000W)
  fuse-anl-250a             (ANL 250A fuse)
  dist-vic-lynx-distributor (Victron Lynx Distributor)
```

---

## Product Types

Product types define **electrical behavior**, not UI appearance.

| Type ID            | Description                                | Pass-through |
|--------------------|--------------------------------------------|:------------:|
| `battery`          | Energy storage                             |              |
| `mppt`             | MPPT solar charge controller               |              |
| `inverter_charger` | Inverter + AC charger                      |              |
| `dc_dc_charger`    | Isolated or non-isolated DC-DC charger     |              |
| `solar_array`      | PV panel or array                          |              |
| `solar_combiner`   | PV string combiner                         | yes          |
| `dc_distribution`  | Lynx-style DC distribution module          | yes          |
| `busbar`           | Single-polarity DC busbar                  | yes          |
| `fuse`             | Single-use overcurrent protection          | yes          |
| `breaker`          | Resettable overcurrent protection          | yes          |
| `monitor`          | Battery/system monitor or control hub      |              |
| `dc_load`          | DC consuming device                        |              |
| `ac_load`          | AC consuming device                        |              |
| `accessory`        | Miscellaneous                              |              |

**Do not add behavior based on category names.** Use product type.

To register a new product type, add it to:
1. The `ProductType` union in `src/types/system.ts`
2. The `PRODUCT_TYPE_DEFINITIONS` array in `productTypes.ts`

---

## Categories

Categories are for **UI grouping only** (part library sidebar).

| Category       | Used For                                      |
|----------------|-----------------------------------------------|
| Batteries      | All battery types                             |
| Solar          | Panels, arrays, combiners                     |
| Charging       | MPPTs, DC-DC chargers, shore chargers         |
| Inverters      | Inverter/charger combos                       |
| Distribution   | Busbars, Lynx modules, DC panels             |
| Protection     | Fuses, breakers, disconnects                 |
| AC Equipment   | Shore inlets, transfer switches, AC panels   |
| Loads          | DC loads, AC loads                           |
| Monitoring     | Monitors, control hubs                       |
| Cables         | Cable assemblies                              |
| Accessories    | Everything else                               |

---

## Terminals

Every product with electrical connections must define terminals.

### Minimum terminal fields

```ts
{
  id: string,          // Unique within this product.
  label: string,       // Display label: "+", "BAT+", "PV+", "AC In L".
  kind: ConnectionPointKind,   // 'dc_power' | 'pv_power' | 'ac_power' | 'signal' | ...
  polarity: ConnectionPolarity, // 'positive' | 'negative' | 'line' | 'neutral' | 'ground'
  role: ConnectionRole,         // 'source' | 'sink' | 'bidirectional' | 'bus' | 'pass_through' | ...
  voltageClass: VoltageClass,   // 'dc_low_voltage' | 'pv_high_voltage' | 'ac_120v' | ...
  side: TerminalSide,  // 'left' | 'right' | 'top' | 'bottom'
  offsetX: number,     // X offset from component center (pixels).
  offsetY: number,     // Y offset from component center (pixels).
}
```

### Optional enrichment fields (new in catalog refactor)

```ts
{
  domain: ElectricalDomain,    // 'dc' | 'ac' | 'pv' | 'signal' | ...
  requiresOvercurrentProtection: boolean,
  recommendedFuseA: number,
  maxFuseA: number,
  requiresDisconnect: boolean,
  voltageNominalV: number,
  voltageMinV: number,
  voltageMaxV: number,
  powerMaxW: number,
  phases: 1 | 2 | 3,
  conductorCount: number,
  notes: string,
}
```

---

## Electrical Ratings

Add the appropriate ratings object for the product type.
Ratings supplement (not replace) the flat electrical fields.

| Product type       | Ratings field              |
|--------------------|----------------------------|
| battery            | `batteryRatings`           |
| mppt               | `mpptRatings`              |
| inverter_charger   | `inverterChargerRatings`   |
| dc_dc_charger      | `dcDcChargerRatings`       |
| busbar/dc_dist.    | `busbarRatings`            |
| fuse/breaker       | `protectionRatings`        |
| solar_array        | `solarPanelRatings`        |
| solar_combiner     | `solarCombinerRatings`     |
| dc_load / ac_load  | `loadRatings`              |

---

## Pricing

```ts
{
  msrpUsd: number,      // Retail price in USD. Set to 0 if free or unknown.
  oemPriceUsd: number,  // Dealer/OEM price (optional).
}
```

The `pricing` structured field (with currency) is also supported for future multi-currency support.

---

## Data Quality

Use `dataQuality` to indicate how complete the product data is:

| Value         | Meaning                                                  |
|---------------|----------------------------------------------------------|
| `complete`    | All fields verified against official manufacturer data.  |
| `partial`     | Key fields present; some specs are estimated.            |
| `placeholder` | Generic stand-in; most fields are approximate.           |

---

## Validation

To validate the catalog during development:

```ts
import { ALL_PRODUCTS } from './index';
import { validateCatalog, assertCatalogValid } from './helpers/validation';

// Get a full report:
const result = validateCatalog(ALL_PRODUCTS);
console.log(result.issues);

// Throw on error (use in tests/CI):
assertCatalogValid(ALL_PRODUCTS);
```

---

## Compatibility Helpers

Use the helpers in `helpers/catalogUtils.ts` instead of reading product fields directly:

```ts
import {
  getProductDisplayName,
  getProductPrice,
  getProductCategory,
  getProductType,
  getProductTerminals,
  getProductsByCategory,
  getProductsByType,
  isVoltageCompatible,
} from './helpers/catalogUtils';
```

These helpers resolve from flat fields or structured ratings, ensuring compatibility
across old and new product definitions.
