# SystemBuilder Project Notes

Read this first in new sessions. This is the single active context file for the
repo; keep it compact and update it when architecture or workflows change.

## What This Is

Nomadeus System Builder is a React/Vite/TypeScript app for early-stage mobile and
off-grid electrical system design. Users place products on a schematic canvas,
connect terminals, review validation issues, size cables/fuses, and generate BOM
and price summaries.

Outputs are preliminary design and estimation aids, not certified electrical
engineering results. The app is a system design/validation tool, not a circuit
simulator.

## Commands

- Install dependencies: `.\npm.cmd install`
- Dev server: `.\npm.cmd run dev`
- Host dev server: `.\npm.cmd run dev:host`
- Tests: `.\npm.cmd test`
- Typecheck: `.\npm.cmd run typecheck`
- Production build: `.\npm.cmd run build`
- Preview production build: `.\npm.cmd run preview`

This repo includes Windows wrapper scripts (`node.cmd`, `npm.cmd`, `npx.cmd`) and
a checked-in `.local-node` directory. In PowerShell, prefer the wrappers because
global `npm.ps1` may be blocked by execution policy. In restricted sandboxes,
Vite/esbuild commands may need elevated permission because config loading and the
test runner can touch paths outside the repo.

## Project Shape

- `src/App.tsx`: Main state owner and application wiring. Consumes
  `analyzeSystemDesign`, owns placement/selection/save/load/export flows, and
  recomputes BOM, price, electrical, and warning views.
- `src/types/system.ts`: Core domain types for systems, products, ports,
  terminal groups, terminals, connections, BOM, warnings, and assumptions.
  Backward compatibility matters here.
- `src/utils/analysis/`: Authoritative analysis entry point. Import
  `analyzeSystemDesign` from `src/utils/analysis`.
- `src/utils/`: Supporting calculation, validation, storage, CSV, terminal,
  solar, BOM, price, and legacy-compatible analysis helpers.
- `src/data/defaultSystem.ts`: Default sample system loaded/reset into the app.
- `src/data/products.ts`: Compatibility re-export for the product catalog.
- `src/data/products/`: Product catalog, helpers, validation, schemas, and local
  catalog docs.
- `src/data/products/catalog/`: Active product catalog. One product per file.
- `src/data/products/legacy/`: Preserved products that are not loaded.
- `src/dev/` and `vite-plugin-product-builder.ts`: Dev-only product builder and
  file/SVG middleware.
- `src/components/layout/`: Header, sidebars, inspector, and BOM panels.
- `src/components/schematic/`: SVG canvas, nodes, terminals, connections,
  routing, and product-type symbols.
- `src/components/summary/`: BOM, price, electrical, and cable summary displays.
- `src/styles/app.css`: Global app styling.

Ignore `dist/`, `node_modules/`, `dev-server*.log`, `.electrical.out.mjs`, and
other generated output unless the task specifically concerns them.

## Current UX

The app is a dense operational workspace:

- Header/project bar with system name, nominal voltage, save/load/reset/export,
  total price, and warning count.
- Left component sidebar with product library/search/filtering plus placed
  components.
- Center SVG schematic canvas with grid, drag-to-move, terminal-to-terminal
  connections, route editing, zoom/pan/scroll, selection, Delete removal, and
  `r` rotation.
- Right inspector for selected components/connections, labels, prices, instance
  settings, solar config, bus polarity, cable length, warnings, and removal.
- Right/bottom BOM panel showing BOM, price summary, electrical summary, and
  cable-related output.

Preserve these workflows unless the task explicitly asks for a UX redesign.

## State And Data Flow

`App.tsx` owns `SystemDesign` state. Most state changes should flow through
`updateSystem`, which timestamps the system and runs enrichment such as:

- `withSingleComponentQuantities`
- `withInferredConductors`
- `enrichConnections`

`handleMoveComponent` updates directly for drag performance and does not run full
enrichment on every pointer move.

The UI should consume the authoritative analysis via:

```ts
import { analyzeSystemDesign } from './utils/analysis';
```

`analyzeSystemDesign(system, PRODUCT_MAP)` produces `SystemDesignAnalysis`,
including issues, warnings, connection analysis, terminal/group analysis,
communication networks, and legacy adapters. Some deterministic legacy modules
still exist under `src/utils/` and are reused as subordinate stages or adapters;
do not add a second independent analysis path.

Local persistence is in `src/utils/storage.ts`; CSV export is in
`src/utils/csvExport.ts`.

## Product Catalog

The active catalog is intentionally small and fully ported. Product files live
under `src/data/products/catalog/<category>/<product-id>.ts`; the loader in
`src/data/products/index.ts` discovers them with `import.meta.glob`.

Inactive products are preserved under `src/data/products/legacy/` and are not
loaded into `ALL_PRODUCTS` or `PRODUCT_MAP`. Do not add the legacy folder to the
loader glob. To reactivate a product, move it into `catalog/` and fully port it to
the current model.

When adding or editing a product:

- Use one file per product under the appropriate `catalog/<category>/` folder.
- Required practical fields include `id`, `manufacturer`, `name`, `productType`,
  `terminals`, `width`, and `height`; include `msrpUsd`/`oemPriceUsd` when
  available.
- Product IDs are stable kebab-case, for example
  `discover-helios-ess-52-48-16000`, `mppt-vic-150-60`,
  `inv-vic-mp2-48-5000`.
- `category` is for UI grouping only; `productType`, ports, terminal groups, and
  ratings drive electrical behavior.
- Every electrically connectable product needs explicit `ports`,
  `terminalGroups`, and terminals with valid `portId` and `terminalGroupId`.
- Preserve compatibility fields and typed ratings unless you are deliberately
  migrating all consumers.
- If adding a new product type, update both the `ProductType` union in
  `src/types/system.ts` and `PRODUCT_TYPE_DEFINITIONS` in
  `src/data/products/productTypes.ts`.

Use the dev product builder during local development when helpful. It is wired
only in Vite serve mode through `vite-plugin-product-builder.ts`.

## Ports, Terminals, And Groups

For catalog porting/rebuild work, use
`src/data/products/PORT_TERMINAL_MODEL.md` as the compact rulebook.

Ports are the electrical boundary/specification model. Terminals are physical
connectors on ports. Terminal groups model internal common nodes and bus limits.
- In the product builder, terminal ports are resolved through the terminal group;
  `TerminalDefinition.portId` is legacy fallback data and should not be edited in
  the terminal inspector.

- `ProductPort.kind`: electrical medium such as `dc`, `ac`, `pv`, `comm`,
  `ground`, `signal`, or `generic`.
- `ProductPort.topology`: circuit shape such as `two_pole`, `bus`, or
  `pass_through`.
- Port specs include values such as nominal/min/max voltage, current, power,
  phases, and communication protocol.
- Terminals own physical connector data, labels, canvas position, and per-jack
  limits.
- Terminal groups carry polarity, internal commoning, and shared current limits,
  such as the Discover Helios common DC+ bus.

Resolve port/terminal electrical facts through helpers such as
`src/utils/portSpecs.ts`, `src/utils/portLinks.ts`, and
`src/utils/effectiveTerminals.ts` rather than scattering raw field reads.

## Electrical And Validation Logic

- `src/utils/analysis/` is the public analysis surface.
- `src/utils/connectionRules.ts` validates terminal compatibility.
- `src/utils/effectiveTerminals.ts` applies port-resolved and instance-specific
  terminal behavior.
- `src/utils/circuitAnalysis.ts`, `src/utils/electricalNetlist.ts`,
  `src/utils/electricalCalculations.ts`, and related helpers still contain useful
  deterministic stages, but should not become separate UI entry points.
- `src/utils/solarCalculations.ts` handles solar array/product configuration.
- `src/utils/communicationNetworks.ts` models communication at protocol level,
  not individual CAN-H/CAN-L conductors.
- Pass-through and bus behavior must stay synchronized across product metadata,
  port topology, connection rules, analysis, BOM, and summaries.

Core design philosophy:

- Size branches from design current, not source fault capability.
- Fuses protect cables; device max-fuse ratings still matter.
- DC+ protection and DC- return-path rules are separate.
- Unknown product data should produce clear warnings, not silent assumptions.
- Prefer graph/port metadata over one-off component exceptions.

## Styling And UI Notes

This is an operational design tool, not a marketing page. Keep UI dense,
scan-friendly, and work-focused. Avoid replacing the existing workspace structure
unless requested.

Preserve canvas interactions: drag placement, grid snap, selection,
terminal-to-terminal connection workflow, route editing, zoom/pan/scroll, delete,
and rotation. Symbols live in `src/components/schematic/symbols/`; use simplified
product-type drawings rather than plain boxes where practical.

Keep text compact enough for constrained sidebars and panels.

## Historical Docs

Long implementation briefs and completed plans are archived under
`docs/archive/context-history/`. They are useful history, but this `AGENTS.md` and
the current source code are authoritative.

## Git

Never commit or push unless explicitly asked.

The worktree may contain user changes. Do not revert changes you did not make.

## Gotchas

- `git status` may report "not a git repository" from this environment even when
  a `.git` entry is visible.
- Some existing files contain mojibake from earlier encoding issues. Prefer ASCII
  for new edits unless a file already clearly uses another character set.
- Product data has compatibility fields from older schema generations. Do not
  delete fields just because a newer typed model has no direct slot.
- Run `.\npm.cmd test` and `.\npm.cmd run build` after meaningful code changes
  whenever feasible. If sandboxed esbuild/Vite fails with access-denied path
  errors, rerun with elevated permission.
