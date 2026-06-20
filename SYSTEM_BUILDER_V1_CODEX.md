# Nomadeus System Builder V1 — Codex Build Brief

## 1. Project Goal

Build a fresh V1 of the Nomadeus System Builder app.

This is no longer just a product/BOM comparison tool. The new goal is a **system and schematic layout tool** for mobile/off-grid electrical systems. The app should help a user select Victron-style components, place them into a simplified system diagram, auto-generate recommended fuses/cables, and summarize the resulting BOM and system price.

The app is for **concept validation and early design estimation**, not certified electrical design. Calculations should be useful, transparent, and conservative, but every output should be labeled as preliminary and requiring engineering validation.

## 2. Inspiration

Use Wireframe as product inspiration, but do not clone it directly.

The useful concepts to pull from Wireframe are:

- Drag-and-drop off-grid wiring/schematic diagrams
- Prebuilt component types
- Auto wire sizing
- Auto fuse/protection sizing
- Safety/design checks
- Templates or sample systems
- BOM/shopping-list style output
- Exportable system documentation

The improvement goal for Nomadeus is stronger automation around system-level design:

- Better integration between part selection, schematic placement, electrical calculations, BOM, and price summary
- Victron-focused product selection using the existing product/price data
- Automatic placement of required supporting parts such as fuses, cables, and distribution items
- Clear system-level cost structure, including MSRP and estimated OEM/system pricing
- A cleaner workflow for comparing a conventional Victron system against a future Nomadeus integrated product concept

## 3. Starting Point / Repository Assumptions

Use the existing Nomadeus Victron Builder project as the source of useful seed data and UI ideas:

- Existing React/Vite/TypeScript structure may be reused.
- Existing product data should be reused where practical.
- Existing Victron USD price CSV data should be reused where practical.
- Existing BOM, cost summary, CSV export, and saved-system concepts should be preserved and improved.
- The new app should feel like a clean rebuild, not a small patch over the prior layout.

If the current repository already contains the old app, inspect it first. Reuse useful data/models, but do not be afraid to replace the main UI structure.

## 4. Core V1 User Experience

The V1 app should be organized around four major areas:

1. Header / project bar
2. Left sidebar part library
3. Center schematic canvas
4. Right inspector panel
5. Bottom BOM and price summary panel

### 4.1 Header / Project Bar

Include:

- Project/system name
- System nominal voltage selector: 12 V, 24 V, 48 V
- Save/load system controls
- Export controls
- Reset/sample system controls
- High-level price total
- Warning count / issue count

### 4.2 Left Sidebar — Part Selection

Move part selection to a persistent left sidebar.

The left sidebar should include:

- Product search
- Product category filters
- Manufacturer filter
- System voltage compatibility filter if possible
- Product list cards
- Add-to-system button for each part
- Small product detail preview

Target product categories:

- Batteries
- Inverter/chargers
- MPPT solar charge controllers
- Solar panels / solar arrays
- DC distribution / Lynx devices
- DC-DC chargers
- Shore chargers
- Alternator charging components
- AC distribution
- DC loads
- AC loads
- Fuses
- Breakers
- Busbars
- Cables
- Shunts / monitors
- Misc accessories

The add behavior should be similar to the older app: selecting or pressing Add creates a component instance in the current system and immediately updates the diagram, BOM, and price summary.

### 4.3 Center Canvas — System Schematic

The center of the app should be a draggable schematic canvas.

Requirements:

- Components appear as simplified product-type drawings, not plain boxes.
- Components can be dragged by the user.
- Components should snap to a light grid if practical.
- Each component should expose simplified terminals.
- Connections should be drawn terminal-to-terminal.
- The user should be able to select a component or connection.
- The app should include a reasonable auto-layout for the default sample system.

The V1 schematic does not need to be a perfect CAD/electrical drawing. It should be visually clear and functional.

### 4.4 Right Inspector — Component / Connection Details

The right panel should show details for the currently selected item.

For selected components:

- Product name
- Manufacturer
- Product type
- Quantity
- Voltage/current/power specs when available
- MSRP
- OEM/manual price if available
- Notes/warnings
- Remove/duplicate controls

For selected connections:

- From component/terminal
- To component/terminal
- Calculated current
- Recommended fuse/breaker size
- Recommended cable size
- Assumed cable length
- Voltage drop estimate
- Warnings

### 4.5 Bottom Panel — BOM and System Price Summary

Keep the BOM and system price summary as first-class app features.

Provide either a bottom drawer or tabbed lower panel with:

- BOM table
- System price summary
- Manufacturer subtotal view
- Product-type subtotal view
- Export CSV button

The BOM and price summary must update automatically whenever parts, quantities, auto-generated fuses/cables, or pricing inputs change.

## 5. BOM Requirements

The BOM should include both user-selected products and auto-generated supporting items.

### 5.1 BOM Table Columns

Include these columns:

- Section
- Product type
- Manufacturer
- Part number / product name
- Description
- Quantity
- Unit MSRP
- Extended MSRP
- Unit OEM / estimated cost
- Extended OEM / estimated cost
- Price source
- Auto-generated flag
- Notes

### 5.2 BOM Sections

Group items into logical sections:

- Energy storage
- Charging sources
- Power conversion
- DC distribution
- AC distribution
- Protection
- Cabling
- Monitoring/control
- Accessories

### 5.3 BOM Behaviors

The BOM should:

- Update automatically as the schematic changes.
- Allow quantities to be changed from either the BOM or inspector.
- Include auto-generated fuses, breakers, and cables.
- Mark auto-generated items clearly.
- Allow manual override for price and quantity.
- Allow CSV export.
- Preserve enough structure that the BOM can later be exported to a quote/proposal.

## 6. System Price Summary Requirements

The system price summary should remain visible and useful.

Include:

- Total MSRP
- Total estimated OEM/system cost
- Estimated savings vs MSRP
- Total selected product cost
- Total auto-generated protection/cabling cost
- Subtotals by BOM section
- Subtotals by manufacturer
- Optional subtotal by product type

Also include a clear statement that OEM/system cost is an estimate unless an explicit product-level OEM override exists.

## 7. Visual Component Requirements

Create simple reusable schematic symbols/components for each product type.

### 7.1 Battery

Show:

- Battery body
- Positive terminal
- Negative terminal
- Optional voltage/capacity label

Terminals:

- `dc_pos`
- `dc_neg`

### 7.2 Battery Bank

If multiple batteries are added, support either individual batteries or grouped battery bank representation.

Show:

- Total kWh
- Nominal voltage
- Battery count
- Positive and negative terminals

### 7.3 MPPT Solar Charge Controller

Show:

- Product body
- PV input positive/negative terminals
- Battery output positive/negative terminals

Terminals:

- `pv_pos`
- `pv_neg`
- `bat_pos`
- `bat_neg`

### 7.4 Solar Array

Show:

- Solar panel / array icon
- Array wattage label
- Positive and negative terminals

Terminals:

- `pv_pos`
- `pv_neg`

### 7.5 Inverter/Charger

Show:

- Product body
- DC input positive/negative
- AC input
- AC output

Terminals:

- `dc_pos`
- `dc_neg`
- `ac_in_l`
- `ac_in_n`
- `ac_out_l`
- `ac_out_n`

### 7.6 Lynx / DC Distribution

Show:

- Busbar/distribution body
- Main positive/negative terminals
- Multiple fused outputs

Terminals:

- `main_pos`
- `main_neg`
- `out_pos_1`, `out_neg_1`
- `out_pos_2`, `out_neg_2`
- Expand as needed for V1

### 7.7 Fuse / Breaker

Show:

- Inline protection symbol
- Rating label
- Input/output terminals

Terminals:

- `in`
- `out`

### 7.8 Cable

Represent cables as connections between terminals.

Show:

- Cable size label if known
- Current label if useful
- Fuse rating label near protection device

## 8. Data Model Requirements

Create or refactor TypeScript types around the new schematic model.

Suggested core types:

```ts
export type NominalVoltage = 12 | 24 | 48;

export type ProductType =
  | 'battery'
  | 'battery_bank'
  | 'inverter_charger'
  | 'mppt'
  | 'solar_array'
  | 'dc_distribution'
  | 'fuse'
  | 'breaker'
  | 'busbar'
  | 'cable'
  | 'dc_dc_charger'
  | 'shore_charger'
  | 'ac_distribution'
  | 'dc_load'
  | 'ac_load'
  | 'monitor'
  | 'accessory';

export interface Product {
  id: string;
  manufacturer: string;
  name: string;
  productType: ProductType;
  category?: string;
  description?: string;
  nominalVoltage?: NominalVoltage | NominalVoltage[];
  capacityWh?: number;
  continuousPowerW?: number;
  peakPowerW?: number;
  maxCurrentA?: number;
  maxPvVoltageV?: number;
  maxPvCurrentA?: number;
  msrpUsd?: number;
  oemPriceUsd?: number;
  source?: string;
  notes?: string;
  terminals?: TerminalDefinition[];
}

export interface TerminalDefinition {
  id: string;
  label: string;
  electricalType: 'dc_pos' | 'dc_neg' | 'pv_pos' | 'pv_neg' | 'ac' | 'signal' | 'generic';
  side?: 'left' | 'right' | 'top' | 'bottom';
}

export interface SystemComponent {
  id: string;
  productId: string;
  label?: string;
  quantity: number;
  x: number;
  y: number;
  rotation?: 0 | 90 | 180 | 270;
  customPriceUsd?: number;
  userNotes?: string;
  autoGenerated?: boolean;
}

export interface SystemConnection {
  id: string;
  fromComponentId: string;
  fromTerminalId: string;
  toComponentId: string;
  toTerminalId: string;
  cableLengthFt: number;
  calculatedCurrentA?: number;
  recommendedFuseA?: number;
  recommendedCableAwg?: string;
  voltageDropV?: number;
  voltageDropPercent?: number;
  autoGenerated?: boolean;
  warnings?: string[];
}

export interface SystemDesign {
  id: string;
  name: string;
  nominalVoltage: NominalVoltage;
  components: SystemComponent[];
  connections: SystemConnection[];
  assumptions: SystemAssumptions;
  createdAt: string;
  updatedAt: string;
}

export interface SystemAssumptions {
  inverterEfficiency: number;
  defaultOemDiscountPercent: number;
  defaultCableLengthFt: number;
  maxVoltageDropPercent: number;
  continuousLoadMultiplier: number;
}
```

## 9. Calculation Requirements

Create calculation utilities that are easy to inspect and change later.

Suggested files:

- `src/utils/electricalCalculations.ts`
- `src/utils/bomCalculations.ts`
- `src/utils/priceCalculations.ts`
- `src/utils/autoProtection.ts`
- `src/data/electricalRules.ts`
- `src/data/cableAmpacity.ts`
- `src/data/fuseRatings.ts`

### 9.1 Current Calculations

Use simple V1 estimates:

- DC current from power: `I = P / V`
- Inverter DC current: `I = AC_Output_W / (Battery_Voltage * Inverter_Efficiency)`
- Solar controller output current: use controller rating if available, otherwise estimate from solar watts / battery voltage
- Battery current: sum downstream DC demand where practical

### 9.2 Fuse Sizing

V1 fuse sizing can use a simple conservative rule:

1. Determine expected continuous current.
2. Multiply by a continuous-load factor, default 1.25.
3. Round up to the next standard fuse size.
4. Warn if the resulting fuse exceeds known component limits.
5. Warn if cable ampacity is lower than fuse rating.

Use a standard rating list such as:

```ts
[5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 100, 125, 150, 175, 200, 225, 250, 300, 350, 400, 500, 600]
```

### 9.3 Cable Sizing

V1 cable sizing can use a simplified ampacity table.

Include common sizes:

- 18 AWG
- 16 AWG
- 14 AWG
- 12 AWG
- 10 AWG
- 8 AWG
- 6 AWG
- 4 AWG
- 2 AWG
- 1 AWG
- 1/0
- 2/0
- 4/0

For each cable recommendation:

- Select the smallest cable whose simplified ampacity is above the fuse/current requirement.
- Calculate approximate voltage drop from cable length and current.
- Warn if voltage drop exceeds the configured limit.
- Allow the user to override length and cable size.

### 9.4 Design Checks / Warnings

Add a warning system that can flag:

- Missing fuse/protection on major DC branch
- Cable ampacity lower than fuse rating
- Voltage drop above configured limit
- Component voltage mismatch
- Inverter too large for system voltage/battery current assumptions
- MPPT output current exceeds expected distribution path
- Battery capacity missing or unknown
- Product price missing
- Connection missing required terminal pairing
- AC and DC terminals connected incorrectly

Warnings should be visible in the header, inspector, and/or a system issues panel.

## 10. Auto-Generated Parts

The app should support auto-generated fuses, breakers, and cable line items.

V1 does not need a perfect physical layout for every auto-generated item. It does need to show them in the schematic and BOM.

Examples:

- Battery bank to Lynx/distribution: main fuse and cable
- Lynx/distribution to inverter/charger: branch fuse and cable
- Solar array to MPPT: PV cable and optional PV protection placeholder
- MPPT to Lynx/distribution or battery bus: fuse and cable
- DC loads from fuse block/distribution: branch fuse and cable

Auto-generated items should include:

- `autoGenerated: true`
- Calculation notes
- User-overridable fields
- Clear BOM labeling

## 11. Default V1 Sample System

Create a default sample system that loads on first launch or can be selected from a template menu.

Sample system:

- Nominal voltage: 12 V
- Battery bank: approximately 10 kWh
- One MPPT solar charge controller
- Solar array placeholder
- Lynx-style DC distribution
- 3 kW inverter/charger
- Main battery protection
- Inverter branch protection
- MPPT branch protection
- Required cables

The sample system should be auto-laid out clearly:

Solar Array → MPPT → Lynx/DC Distribution → Battery Bank

Lynx/DC Distribution → Inverter/Charger → AC Loads / AC Distribution placeholder

The goal is for a user to open the app and immediately understand the intended workflow.

## 12. Product Data Requirements

Reuse the existing product catalog where practical.

Preserve or add these fields where possible:

- `id`
- `manufacturer`
- `name`
- `productType`
- `category`
- `nominalVoltage`
- `capacityWh`
- `continuousPowerW`
- `maxCurrentA`
- `msrpUsd`
- `oemPriceUsd`
- `notes`

Victron products should remain the primary seed catalog.

The app should still support future non-Victron products.

Do not block app functionality if product data is incomplete. Instead:

- Show unknown fields as `Unknown`
- Use placeholder calculations where needed
- Add warnings for missing specs

## 13. Suggested File Structure

Use or adapt this structure:

```txt
src/
  App.tsx
  main.tsx
  types/
    system.ts
    products.ts
    calculations.ts
  data/
    products/
      batteries.ts
      inverterChargers.ts
      mppts.ts
      distribution.ts
      solar.ts
      protection.ts
      cables.ts
      accessories.ts
    products.ts
    productTypes.ts
    electricalRules.ts
    cableAmpacity.ts
    fuseRatings.ts
    defaultSystem.ts
    templates.ts
  components/
    layout/
      AppShell.tsx
      HeaderBar.tsx
      LeftPartSidebar.tsx
      RightInspector.tsx
      BottomSummaryPanel.tsx
    parts/
      PartLibrary.tsx
      ProductCard.tsx
      ProductFilters.tsx
    schematic/
      SchematicCanvas.tsx
      ComponentNode.tsx
      ConnectionLayer.tsx
      Terminal.tsx
      symbols/
        BatterySymbol.tsx
        MpptSymbol.tsx
        SolarArraySymbol.tsx
        InverterChargerSymbol.tsx
        LynxDistributionSymbol.tsx
        FuseSymbol.tsx
        GenericSymbol.tsx
    inspector/
      ComponentInspector.tsx
      ConnectionInspector.tsx
      WarningList.tsx
    summary/
      BomTable.tsx
      PriceSummary.tsx
      ManufacturerSummary.tsx
      SectionSummary.tsx
  utils/
    electricalCalculations.ts
    autoProtection.ts
    bomCalculations.ts
    priceCalculations.ts
    csvExport.ts
    storage.ts
    ids.ts
  styles/
    app.css
    schematic.css
```

Do not follow this structure blindly if the existing repo has a better convention. The important goal is to keep schematic, product data, calculations, and summary logic separated.

## 14. Implementation Phases for Codex

Work in controlled phases. After each phase, the app should still build.

### Phase 1 — Inspect and Stabilize

- Inspect existing repo structure.
- Identify reusable product data and CSV price data.
- Run install/build if possible.
- Note any build issues before large changes.

### Phase 2 — New System Data Model

- Add TypeScript types for products, system components, connections, BOM rows, and calculations.
- Add default assumptions.
- Add default sample system.

### Phase 3 — App Shell Layout

- Implement header.
- Implement left part sidebar.
- Implement center schematic canvas placeholder.
- Implement right inspector placeholder.
- Implement bottom BOM/price summary panel placeholder.

### Phase 4 — Product Library and Add Flow

- Load product catalog.
- Add search/filter UI.
- Add product cards.
- Add product-to-system flow.
- New components should appear on the schematic and in BOM/price summary.

### Phase 5 — Schematic Canvas

- Add draggable component nodes.
- Add basic schematic symbols.
- Add terminals.
- Add connection rendering.
- Add selected component/connection state.
- Add basic auto-layout for sample system.

### Phase 6 — Electrical Calculations

- Add current estimates.
- Add fuse sizing.
- Add cable sizing.
- Add voltage drop estimates.
- Add warning generation.
- Display calculations in inspector and summary.

### Phase 7 — Auto Protection and Cable Generation

- Add auto-generated protection/cable items for the default sample system.
- Add helper function to regenerate support parts after major topology changes.
- Ensure auto-generated items are included in BOM and price summary.

### Phase 8 — BOM and Price Summary

- Build complete BOM table.
- Build MSRP/OEM/system price summary.
- Add manufacturer and section subtotals.
- Add CSV export.
- Preserve or improve existing CSV export logic.

### Phase 9 — Persistence and Templates

- Save/load systems using localStorage.
- Include sample template system.
- Allow reset to default sample system.
- Persist component positions and user overrides.

### Phase 10 — Polish and Guardrails

- Improve responsive layout.
- Improve schematic readability.
- Add empty states.
- Add missing-price/spec warnings.
- Add basic GitHub Pages/Vite deployment safety.

## 15. GitHub Pages / Vite Deployment Guardrail

Make sure the app works when deployed to GitHub Pages.

Avoid hardcoded absolute asset paths that break under a repo subpath. If needed, configure Vite `base` correctly for the target deployment.

The app should not show a blank white page after deployment because of bad asset paths.

## 16. Acceptance Criteria

The V1 attempt is considered successful if:

- The app builds successfully.
- The app opens to a useful default 12 V sample system.
- The left sidebar contains searchable/selectable parts.
- Adding a part updates the schematic, BOM, and system price summary.
- Components are draggable on the schematic canvas.
- At least these component symbols exist: Battery, MPPT, Solar Array, Lynx/DC Distribution, Inverter/Charger, Fuse/Breaker.
- Components have visible terminals.
- Connections can be displayed between terminals.
- The default system shows auto-generated fuses/cables.
- Cable/fuse recommendations are calculated and visible.
- Warnings are generated for obvious missing/unsafe/incomplete design conditions.
- BOM includes selected products and auto-generated support items.
- Price summary includes total MSRP, estimated OEM/system cost, savings, section subtotals, and manufacturer subtotals.
- CSV export works.
- Save/load works in browser localStorage.
- The app is usable on a normal laptop screen.

## 17. Non-Goals for V1

Do not spend V1 effort on:

- Perfect CAD-level wire routing
- Full NEC/ABYC/UL compliance engine
- Real inventory integration
- User accounts
- Backend database
- Payment/shopping cart flow
- Exact 3D product renders
- Full AC panel design
- Full solar string optimizer
- Full battery cell-level modeling

These can be future phases.

## 18. Design Tone

The app should feel like a technical planning tool:

- Clean
- Dense enough for engineering use
- Not cartoonish
- Not overly glossy
- Clear distinction between selected products, calculated support parts, and warnings
- Easy to screenshot for internal presentations

## 19. Important UX Details

- The BOM/price summary should not be hidden behind too many clicks.
- The left part selection should stay available while editing the schematic.
- The user should be able to drag parts without accidentally changing quantities.
- Product cards should show enough data to choose quickly: name, type, voltage, power/current/capacity, price.
- Missing product data should not break the UI.
- Warnings should guide the user, not block every action.
- The app should support manual overrides because early-stage product data will be incomplete.

## 20. Output Expected from Codex

At the end of the build session, provide:

- Summary of what was changed
- Files created/modified
- How to run locally
- How to build
- Any known limitations
- Any assumptions made in calculations
- Next recommended improvements

Run these commands if possible:

```bash
npm install
npm run build
npm run dev
```

If Node/npm are unavailable in the current environment, state that clearly and still complete the code changes as far as possible.
