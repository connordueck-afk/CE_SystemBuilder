# Product Builder — Implementation Plan

## Background

This plan was drafted at the end of a session. The goal is to:

1. **Restructure** the product catalog from multi-product files to one file per product
2. **Build** a dev-only product builder UI for creating and editing products

Both parts must be done in order — the builder depends on the per-file structure for clean file I/O.

---

## Part 1 — Migrate to One Product Per File

### Why

The current structure (all batteries in `batteries.ts`, all MPPTs in `mppts.ts`, etc.) makes the builder's write logic complex and risky — to update one product you'd need to parse an array and replace one object without touching others. Per-file eliminates this entirely.

### New Directory Structure

```
src/data/products/
  index.ts                        ← rewritten to use import.meta.glob
  productTypes.ts                 ← unchanged
  productSchemas.ts               ← unchanged
  categories.ts                   ← unchanged
  connectionPoints.ts             ← unchanged (virtual symbols, not real products)
  helpers/
    catalogUtils.ts               ← unchanged
    validation.ts                 ← unchanged
  catalog/
    batteries/
      bat-vic-smart-12-100.ts
      bat-vic-smart-12-200.ts
      bat-disc-48-100.ts
      ...
    mppts/
      mppt-vic-100-20.ts
      ...
    inverter-chargers/
      ...
    dc-dc-chargers/
      ...
    ac-chargers/
      ...
    solar/
      ...
    distribution/
      ...
    protection/
      ...
    monitoring/
      ...
    accessories/
      ...
    communication/
      ...
    residential/
      ...
    kisae/
      ...
    cable-assemblies/
      ...
```

File naming: use the product `id` as the filename (e.g. `bat-vic-smart-12-200.ts`).

### Per-Product File Format

Each file exports a single `Product` as the default export:

```typescript
// src/data/products/catalog/batteries/bat-vic-smart-12-200.ts
import type { Product } from '../../../../types/system';

const product: Product = {
  id: 'bat-vic-smart-12-200',
  manufacturer: 'Victron',
  name: 'SmartLithium 12.8V/200Ah',
  productType: 'battery',
  // ... all other fields
};

export default product;
```

No factory function required in the file itself — the product is just a typed object literal. This keeps files simple and writable by the builder tool.

### New `index.ts` using `import.meta.glob`

```typescript
import type { Product } from '../../types/system';

// Auto-discover all product files
const modules = import.meta.glob<{ default: Product }>(
  './catalog/**/*.ts',
  { eager: true }
);

const rawProducts: Product[] = Object.values(modules).map(m => m.default);

// ... applyCommPorts logic stays here (see note below)

export const ALL_PRODUCTS: Product[] = applyCommPorts(rawProducts);
export const PRODUCT_MAP: Map<string, Product> = new Map(ALL_PRODUCTS.map(p => [p.id, p]));
export function getProduct(id: string): Product | undefined { return PRODUCT_MAP.get(id); }

// Re-export everything else unchanged
export * from './categories';
export * from './productTypes';
export * from './productSchemas';
export * from './helpers/catalogUtils';
export * from './helpers/validation';
```

### Important: `applyCommPorts` / `withCommPorts`

Currently in `index.ts`, communication ports are injected at catalog assembly time based on product type and a hardcoded `SMARTLITHIUM_IDS` set. This logic must be **migrated into each individual product file** during the restructure — each product that needs comm ports should declare `communicationPorts` directly.

The `applyCommPorts` and `withCommPorts` functions in `index.ts` can be deleted once every product that needs ports has them declared inline.

Affected products to check (currently enriched by `applyCommPorts`):
- All `inverter_charger` types → `VE_BUS_PORT`
- All `mppt` types → `VE_CAN_PORT` + `VE_DIRECT_PORT`
- SmartLithium battery IDs → `BMS_CAN_PORT` (see `SMARTLITHIUM_IDS` set in current `index.ts`)
- SmartShunt IDs (`smartshunt-500`, `smartshunt-1000`, `smartshunt-2000`) → `VE_DIRECT_PORT`
- `ekrano-gx` → `CAN_CONFIGURABLE_PORT` + `VE_BUS_PORT` + `ETHERNET_PORT`

The `TerminalDefinition` entries for comm ports (top-edge network terminals) also need to move into each product's `terminals` array.

### Migration Script

Write a Node.js script at `scripts/migrate-products.ts` (run with `npx ts-node`) that:

1. Imports the current product arrays from each existing file
2. For each product, generates a `.ts` file in the appropriate `catalog/` subdirectory
3. Maps product type to subdirectory (see table below)
4. Writes the file using a template

| Product source file | Target subdirectory |
|---|---|
| `batteries.ts` | `catalog/batteries/` |
| `mppts.ts` | `catalog/mppts/` |
| `inverterChargers.ts` | `catalog/inverter-chargers/` |
| `dcDcChargers.ts` | `catalog/dc-dc-chargers/` |
| `acChargers.ts` | `catalog/ac-chargers/` |
| `solar.ts` | `catalog/solar/` |
| `distribution.ts` | `catalog/distribution/` |
| `protection.ts` | `catalog/protection/` |
| `monitoring.ts` | `catalog/monitoring/` |
| `accessories.ts` | `catalog/accessories/` |
| `kisae.ts` | `catalog/kisae/` |
| `residentialHybridInverters.ts` | `catalog/residential/` |
| `communication.ts` | `catalog/communication/` |
| `cableAssemblies.ts` | `catalog/cable-assemblies/` |

The script can use `JSON.stringify` with a custom formatter or `util.inspect` to serialize the object. After running, verify with `npm run dev` that `ALL_PRODUCTS.length` matches the pre-migration count.

### Validation After Migration

After the script runs:
- Start dev server, open the app, confirm all products appear in the component picker
- Run any existing tests
- Check that `ALL_PRODUCTS.length` equals the pre-migration count (log it before migration)

---

## Part 2 — Product Builder Dev Tool

### Architecture

- **Vite plugin** (`vite-plugin-product-builder.ts` in project root) — adds a local HTTP middleware to the dev server that reads/writes product files. Only active in dev mode.
- **Dev-only React route** (`/dev/product-builder`) — guarded by `import.meta.env.DEV`. Provides the full UI.
- **No production impact** — the plugin is only wired into Vite's dev server, never the build.

### Vite Plugin (`vite-plugin-product-builder.ts`)

```typescript
import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

export function productBuilderPlugin(): Plugin {
  return {
    name: 'product-builder',
    configureServer(server) {
      server.middlewares.use('/__dev/products', (req, res, next) => {
        // GET  /__dev/products/list         → list all product files
        // GET  /__dev/products/file/:id     → read one product file
        // POST /__dev/products/save         → write a product file
        // GET  /__dev/products/svgs         → list available SVG assets
      });
    }
  };
}
```

Wire it into `vite.config.ts`:

```typescript
import { productBuilderPlugin } from './vite-plugin-product-builder';

export default defineConfig({
  plugins: [react(), productBuilderPlugin()],
});
```

### React Route

Add to the app router (only in dev):

```tsx
// In App.tsx or the router setup
{import.meta.env.DEV && (
  <Route path="/dev/product-builder" element={<ProductBuilderPage />} />
)}
```

Or navigate to it directly: `http://localhost:5173/dev/product-builder`

### Builder UI — Component Breakdown

```
ProductBuilderPage
├── ProductSelector          ← load existing product OR start new
├── ProductTypeSelector      ← drives which form sections appear
├── SVGPicker                ← browse public/product-images/, preview
├── TerminalPlacer           ← visual: drag terminals onto SVG
│     renders the SVG at actual size, click/drag to place terminals
│     each terminal opens a TerminalEditor panel
├── PropertyForm             ← dynamic form based on productType
│     CoreFields             ← id, name, manufacturer, width, height, etc.
│     TypeRatingsForm        ← BatteryRatings / MpptRatings / etc.
│     CommPortsForm          ← optional communication ports
├── CodePreview              ← live generated TypeScript (read-only)
└── SaveButton               ← POST to /__dev/products/save
```

### Terminal Placer

The terminal placer is the most novel component. Approach:

- Render the selected SVG at actual pixel size (width × height)
- Click on the SVG to place a new terminal dot
- The click position is converted to `offsetX`/`offsetY` relative to the component center:
  ```
  offsetX = clickX - (width / 2)
  offsetY = clickY - (height / 2)
  ```
- Each placed terminal opens a side panel for setting `id`, `label`, `kind`, `polarity`, `role`, `side`, `connector`, etc.
- Terminals rendered as colored dots with labels overlaid on the SVG

### Property Form — Dynamic Sections by Product Type

The form shows/hides sections based on selected `productType`:

| Product Type | Extra Section Shown |
|---|---|
| `battery` | BatteryRatings form |
| `mppt` | MpptRatings form |
| `inverter_charger` | InverterChargerRatings form |
| `dc_dc_charger` | DcDcChargerRatings form |
| `ac_charger` | AcChargerRatings form |
| `fuse`, `breaker` | ProtectionRatings form |
| `solar_array`, `solar_panel` | SolarRatings form |
| `busbar`, `dc_distribution` | No extra section |

### Code Generation

The builder generates a TypeScript file string (not a factory call — a plain object literal for simplicity and readability):

```typescript
import type { Product } from '../../../../types/system';

const product: Product = ${JSON.stringify(productData, null, 2)};

export default product;
```

The save endpoint writes this to the correct `catalog/<subdirectory>/<id>.ts`. The subdirectory is determined by product type using the same mapping table from Part 1.

### SVG Browser

- Plugin endpoint `GET /__dev/products/svgs` reads `public/product-images/` recursively and returns a list of paths
- UI shows a grid of SVG thumbnails
- Selecting one sets `product.imageUrl` and loads it into the terminal placer

### Load Existing Product

- Endpoint `GET /__dev/products/list` returns all files under `catalog/`
- A searchable dropdown lets you select an existing product by name/id
- Endpoint `GET /__dev/products/file/:id` returns the file content, parsed back to a Product object
- The builder populates all form fields and the terminal placer from the loaded product

---

## Open Questions / Decisions for Next Session

1. **Migration script format** — `util.inspect` preserves more JS idioms; `JSON.stringify` is simpler but loses any comments or non-JSON values. Since the products are mostly plain data, JSON.stringify should be fine.

2. **Subdirectory for connection points** — `connectionPoints.ts` contains virtual symbols (`connection_point` type), not real products. Decide whether to migrate these to the per-file structure or leave them as a special case in `connectionPoints.ts`.

3. **Cable assemblies** — `cableAssemblies.ts` exports differently (not a named array). Check the export pattern before scripting the migration.

4. **Router** — Confirm which router library the app uses (React Router v6 assumed) before wiring the dev route.

5. **comm port terminals** — When migrating, verify that the top-edge network terminals (added by `withCommPorts`) are correctly included in each product's `terminals` array. Run a diff of terminal counts before and after.

---

## Files to Create (in order)

1. `scripts/migrate-products.ts` — migration script
2. `src/data/products/catalog/**/*.ts` — generated product files (output of script)
3. `src/data/products/index.ts` — rewritten to use `import.meta.glob`
4. `vite-plugin-product-builder.ts` — dev server plugin
5. `src/pages/dev/ProductBuilderPage.tsx` — main builder page
6. `src/pages/dev/components/ProductTypeSelector.tsx`
7. `src/pages/dev/components/SVGPicker.tsx`
8. `src/pages/dev/components/TerminalPlacer.tsx`
9. `src/pages/dev/components/PropertyForm.tsx`
10. `src/pages/dev/components/CodePreview.tsx`
11. Wire dev route into `src/App.tsx`

---

## Starting Point for Next Session

> "Read PRODUCT_BUILDER_PLAN.md. We are implementing the product builder tool. Start with Part 1 — write the migration script at `scripts/migrate-products.ts` that reads the existing product arrays and writes one `.ts` file per product into `src/data/products/catalog/`. Before running it, recount ALL_PRODUCTS to establish the baseline product count."
