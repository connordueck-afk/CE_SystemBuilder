# SystemBuilder Project Notes

Read this first in new sessions. Keep this file compact and update it when architecture or workflows change.

## What This Is

Nomadeus System Builder is a React/Vite/TypeScript app for early-stage mobile/off-grid electrical system design. It lets users select Victron-style/off-grid components, place them on a simplified schematic canvas, connect terminals, and see warnings, cable/fuse recommendations, BOM rows, and price summaries.

Outputs are preliminary design/estimation aids, not certified electrical engineering results.

## Commands

- Install dependencies: `npm install`
- Dev server: `npm run dev`
- Production build/typecheck: `npm run build`
- Preview production build: `npm run preview`

This repo includes Windows wrapper scripts (`node.cmd`, `npm.cmd`, `npx.cmd`) and a checked-in `.local-node` directory. In PowerShell, prefer `.\npm.cmd run build`; the global `npm.ps1` may be blocked by execution policy. In restricted sandboxes, Vite/esbuild may need elevated permission because config loading can touch paths outside the repo.

There is currently no dedicated test or lint script in `package.json`. Use `npm run build` as the main verification step.

## Project Shape

- `src/App.tsx`: Main state owner and application wiring. Handles component/connection mutation, selection, save/load, CSV export, connection enrichment, dynamic conductor inference, warnings, BOM, and price/electrical summaries.
- `src/types/system.ts`: Core domain types for systems, products, terminals, electrical ratings, BOM, warnings, and assumptions. Backward compatibility matters here.
- `src/data/defaultSystem.ts`: Default sample system loaded/reset into the app.
- `src/data/electricalRules.ts`, `src/data/fuseRatings.ts`, `src/data/cableAmpacity.ts`: Electrical assumptions, BOM section mapping, standard fuse sizes, cable ampacity, and voltage-drop helpers.
- `src/data/products.ts`: Compatibility re-export for the product catalog. Existing app code imports `ALL_PRODUCTS` / `getProduct` from here.
- `src/data/products/`: Strongly typed product catalog modules. `index.ts` assembles `ALL_PRODUCTS`; `README.md` is the catalog developer reference.
- `src/utils/`: Calculation, validation, storage, CSV, terminal, solar, and BOM/price summary logic.
- `src/components/layout/`: Header, sidebars, inspector, and bottom/right BOM panels.
- `src/components/parts/`: Product library and cards.
- `src/components/schematic/`: SVG schematic canvas, component nodes, terminals, connection layer, and symbol components.
- `src/components/summary/`: BOM, price, and electrical summary display components.
- `src/styles/app.css`: Global app styling.

Ignore `dist/`, `node_modules/`, and `dev-server*.log` unless the task specifically concerns build output or runtime logs.

## Current UX

The app uses a dense five-area workspace:

- Header/project bar with system name, nominal voltage, save/load/reset/export, total price, and warning count.
- Left component sidebar with product library/search/filtering plus existing placed components.
- Center SVG schematic canvas with grid, drag-to-move, terminal-to-terminal connections, route editing, zoom/pan/scroll, selection, Delete removal, and `r` rotation.
- Right inspector for selected components/connections, labels, prices, instance settings, solar config, bus polarity, cable length, warnings, and removal.
- Right/bottom BOM panel showing BOM, price summary, and electrical summary.

## State And Data Flow

`App.tsx` owns `SystemDesign` state and recomputes derived data with `useMemo`:

- `buildBom(system, PRODUCT_MAP)`
- `buildPriceSummary(bomRows)`
- `buildElectricalSummary(system, PRODUCT_MAP)`
- `generateWarnings(system, PRODUCT_MAP)`

Most state changes should flow through `updateSystem`, which timestamps and runs:

- `withSingleComponentQuantities`
- `withInferredConductors`
- `enrichConnections`

`handleMoveComponent` currently updates directly for drag performance and does not run full enrichment on every pointer move.

Local persistence is in `src/utils/storage.ts`; CSV export is in `src/utils/csvExport.ts`.

## Product Catalog Rules

Use the structured catalog under `src/data/products/`. Import from `src/data/products` or `src/data/products.ts`; do not create a separate catalog entry point.

When adding a product:

- Add it to the appropriate module such as `batteries.ts`, `mppts.ts`, `inverterChargers.ts`, `solar.ts`, `distribution.ts`, `protection.ts`, `monitoring.ts`, `accessories.ts`, `dcDcChargers.ts`, or `acChargers.ts`.
- Ensure it is included in that module's exported array.
- Required practical fields: `id`, `manufacturer`, `name`, `productType`, `terminals`, `width`, `height`; include `msrpUsd`/`oemPriceUsd` when available.
- Product IDs should be stable kebab-case, e.g. `bat-vic-smart-12-200`, `mppt-vic-250-100`, `inv-vic-mp2-48-5000`.
- Product `category` is for UI grouping; `productType` drives electrical behavior, BOM section, current propagation, and validation.
- Every electrically connectable product needs terminals with meaningful `kind`, `polarity`, `role`, `voltageClass`, `side`, `offsetX`, and `offsetY`.
- Use typed ratings fields (`batteryRatings`, `mpptRatings`, `inverterChargerRatings`, etc.) to enrich products, but preserve flat compatibility fields (`maxCurrentA`, `continuousPowerW`, `maxPvVoltageV`, etc.) because calculations still use them.

If adding a new product type, update both the `ProductType` union in `src/types/system.ts` and `PRODUCT_TYPE_DEFINITIONS` in `src/data/products/productTypes.ts`.

## Electrical And Connection Logic

- `src/utils/connectionRules.ts` validates terminal compatibility by component identity, kind, polarity, role, direction, and voltage class. It also handles solar series links and dynamic single-conductor products.
- `src/utils/effectiveTerminals.ts` supports products whose terminal behavior is inferred from connected terminals or per-instance settings.
- `src/utils/electricalCalculations.ts` estimates current, fuse size, cable size, voltage drop, and warnings.
- `src/utils/solarCalculations.ts` computes effective solar array products/configurations and MPPT-facing solar stats.
- `src/utils/terminalDirection.ts` decides whether terminals can provide/receive power.
- Pass-through current behavior exists for fuses, breakers, busbars, DC distribution, solar combiners, and disconnect-like products. Keep product-type pass-through logic in sync when adding new electrical types.

## Styling And UI Notes

- This is an operational design tool, not a marketing page. Keep UI dense, scan-friendly, and work-focused.
- Avoid replacing the existing workspace structure unless the task explicitly calls for it.
- Preserve canvas interactions: drag placement, grid snap, selection, terminal connection workflow, route editing, zoom/pan/scroll, delete, and rotation.
- Symbols live in `src/components/schematic/symbols/`; use simplified product-type drawings rather than plain boxes where practical.
- Keep text compact enough for the sidebars/panels; many controls live in constrained widths.

## Historical Docs

- `SYSTEM_BUILDER_V1_CODEX.md` is the original V1 build brief.
- `task1.md` documents the catalog architecture refactor and emphasizes preserving existing behavior during migration.

These are useful context, but the current source code is authoritative.

## Git

Never commit or push to Git unless explicitly asked to do so.

## Gotchas

- `git status` may report "not a git repository" from this environment even though a `.git` entry is visible. Do not rely on Git being available unless checked.
- Some existing files contain mojibake from earlier encoding issues. Prefer ASCII for new edits unless a file already clearly uses a different character set.
- Do not delete product fields just because the new typed model has no direct slot. Preserve data via optional/extension fields or compatibility helpers.
- There are no automated tests at the moment, so run `npm run build` after code changes whenever feasible.
