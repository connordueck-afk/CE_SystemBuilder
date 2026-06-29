# Product Catalog Developer Reference

This directory contains the active product catalog, catalog helpers, schemas, and
validation utilities for Nomadeus System Builder.

The current catalog is intentionally reduced to a fully ported validation set.
Products under `legacy/` are preserved for future reintegration but are not loaded.

## Directory Structure

```txt
src/data/products/
  index.ts                  Catalog entry point; exports ALL_PRODUCTS and PRODUCT_MAP.
  categories.ts             UI category definitions.
  productTypes.ts           Product type registry; drives behavior.
  productSchemas.ts         Factory/helper types for product objects.
  PORT_TERMINAL_MODEL.md    Compact rules for ports, terminal groups, terminals.
  cableAssemblies.ts        Cable assembly data.
  helpers/
    catalogUtils.ts         Product query and compatibility helpers.
    validation.ts           Catalog validation utilities.
  catalog/
    <category>/
      <product-id>.ts       Active products, one product per file.
  legacy/
    ...                     Preserved products that are not loaded.
```

`src/data/products.ts` re-exports this directory for compatibility with existing
application imports.

`index.ts` discovers active products with:

```ts
import.meta.glob('./catalog/**/*.ts', { eager: true })
```

Do not include `legacy/` in the loader glob. Reactivate legacy products deliberately
by moving one product file back under `catalog/` and porting it to the current model.

## Product Model

See `PORT_TERMINAL_MODEL.md` for the compact canonical catalog-porting rules and
product-pattern examples.

Electrical behavior is port-first:

```txt
Product
  ports
  terminalGroups
  terminals
```

Ports define the electrical boundary and specifications. Terminals are physical
connectors on ports. Terminal groups model internal commoning and shared limits.

Port axes:

- `kind`: electrical medium such as `dc`, `ac`, `pv`, `comm`, `ground`, `signal`,
  or `generic`.
- `topology`: circuit shape such as `two_pole`, `bus`, or `pass_through`.

Common port specs include nominal/min/max voltage, max current, max power, AC
phases, and communication protocol fields.

Terminal fields carry connector/placement facts such as `id`, `label`,
`terminalGroupId`, `side`, `offsetX`, `offsetY`, `connector`, and per-jack limits.
`portId` remains as a legacy fallback; active products should assign ports
through the terminal group.

Terminal groups carry internal common-node facts such as `polarity`,
`internallyCommon`, and `maxCurrentA`.

Resolve electrical facts through helpers such as `src/utils/portSpecs.ts`,
`src/utils/portLinks.ts`, and `src/utils/effectiveTerminals.ts` instead of adding
new raw field reads.

## Adding Or Editing Products

1. Add or edit one product file under `catalog/<category>/<product-id>.ts`.
2. Export a single `Product` as the default export.
3. Run catalog validation through `.\npm.cmd test`.

Minimal product shape:

```ts
import type { Product } from '../../../../types/system';

const product: Product = {
  id: 'example-product-id',
  manufacturer: 'Example',
  name: 'Example Product',
  productType: 'dc_load',
  category: 'Loads',
  dataQuality: 'placeholder',
  width: 120,
  height: 80,
  ports: [],
  terminalGroups: [],
  terminals: [],
};

export default product;
```

Required practical fields:

- `id`
- `manufacturer`
- `name`
- `productType`
- `category`
- `width`
- `height`
- `ports`
- `terminalGroups`
- `terminals`

Add `msrpUsd`, `oemPriceUsd`, `partNumber`, `productUrl`, `datasheetUrl`, typed
ratings, and compatibility fields when available.

Product IDs are stable. Do not rename them casually because saved systems and BOM
logic depend on IDs.

## Product Types And Categories

`productType` defines behavior. `category` defines UI grouping.

Do not use category names for electrical behavior.

If adding a new product type, update:

- `ProductType` in `src/types/system.ts`
- `PRODUCT_TYPE_DEFINITIONS` in `src/data/products/productTypes.ts`
- Any analysis/BOM/UI behavior that depends on product type

## Data Quality

Use `dataQuality` honestly:

| Value | Meaning |
| --- | --- |
| `complete` | Key fields are verified against reliable manufacturer data. |
| `partial` | Important fields exist, but some specs are estimated or incomplete. |
| `placeholder` | Generic stand-in or incomplete product data. |

## Validation

Use the project test runner for catalog validation and analysis scenario coverage:

```powershell
.\npm.cmd test
```

Useful direct APIs:

```ts
import { ALL_PRODUCTS } from './index';
import { validateCatalog, assertCatalogValid } from './helpers/validation';

const result = validateCatalog(ALL_PRODUCTS);
assertCatalogValid(ALL_PRODUCTS);
```

## Dev Product Builder

The dev product builder lives in `src/dev/` and is served only during Vite dev mode
through `vite-plugin-product-builder.ts`. It can edit product files, assign ports
and terminals, and browse/upload SVG assets.

## Fuse Products

Fuse products commonly use `variants` so one product line expands into individual
current-rated products at catalog load time. Keep variant IDs stable and include
rating, voltage, interrupt, style, and part-number data whenever available.

Current active protection examples live under `catalog/protection/`.
