# Codex Prompt: Solar Product Modeling Correction

## Objective

Repair the solar product model in the Mobile System Builder app.

There are two valid solar representations:

1. **Physical Solar Panel** — one placed component equals one physical panel/module.
2. **Custom Solar Array** — one explicit aggregate PV source for customer-supplied/existing/large arrays, with user-entered total PV electrical ratings.

Do **not** allow one normal solar panel component to secretly represent multiple panels in series or parallel. Hidden solar multipliers make the schematic inaccurate and break MPPT sizing, BOM, cable, and fuse analysis.

This is a data-model repair task, not a UI-only cleanup. Fix the type model, catalog, inspector, save/load sanitation, solver, warnings, defaults, and tests.

---

## Core rule

### Physical solar panel

A normal solar panel product must represent exactly one physical module.

Required behavior:

```txt
one placed Solar Panel 400W component = one physical 400 W panel
```

Forbidden behavior:

```txt
one placed Solar Panel 400W component = 7 x 400 W panels
one placed Solar Panel 400W component = hidden string
one placed Solar Panel 400W component = hidden parallel array
```

A seven-panel string must be represented by either:

```txt
A. seven physical panel components with explicit PV wiring, or
B. one Custom Solar Array component with explicit aggregate ratings
```

Do not fake strings using hidden component fields.

---

## Current bad model to remove/deprecate

Find and remove or deprecate these hidden solar multiplier fields from normal physical panel components:

```ts
solarWiringMode?: SolarWiringMode;
solarSeriesCount?: number;
solarParallelCount?: number;
```

These fields may exist on `SystemComponent` or related solar UI/helper code. They must not be used to make a physical panel act like an array.

Also find and remove default/preset data like this:

```ts
{
  id: "pv-string-1",
  productId: "solar-array-400w",
  label: "PV String 1 (7x 400W)",
  quantity: 7,
  solarSeriesCount: 7,
  solarParallelCount: 1
}
```

That is invalid for the new model.

---

## Required product distinction

### 1. Physical solar panel product

Rename user-facing product text from `Solar Array 400W` to `Solar Panel 400W` where applicable.

Compatibility note:

```txt
The existing product ID may temporarily remain `solar-array-400w` if changing it would create large migration impact.
But the display name, documentation, and behavior must clearly treat it as one physical panel only.
```

Physical panel requirements:

```txt
quantity = 1
no solarWiringMode
no solarSeriesCount
no solarParallelCount
no customSolarArrayRatings
BOM quantity comes from number of placed panel components, not a hidden quantity field
solver power/current is one panel only
```

If a loaded/saved system contains bad hidden fields on a physical solar panel, sanitize it.

---

### 2. Custom Solar Array product

Add a dedicated product for aggregate/customer-entered PV arrays.

Preferred type:

```ts
productType: 'custom_solar_array'
```

User-facing name:

```txt
Custom Solar Array
```

Purpose:

```txt
For existing customer arrays, large roof arrays, or systems where it is not practical to draw every physical panel.
This is an explicit aggregate PV source, similar in concept to Custom AC Load, Custom DC Load, Custom AC Source, or Custom DC Source.
```

The symbol may look like a solar panel, but the label and inspector must make clear that it is a custom aggregate array.

---

## Type model changes

Update `src/types/system.ts` and related type files.

Add `custom_solar_array` to the product type union if product types are modeled as a union.

Add per-instance ratings to `SystemComponent`:

```ts
export interface CustomSolarArrayRatings {
  vocV?: number;       // Total open-circuit voltage of the array/string/input
  vmpV?: number;       // Total voltage at max power
  iscA?: number;       // Total short-circuit current
  impA?: number;       // Total current at max power
  powerW?: number;     // Total STC rated power
  coldVocV?: number;   // Optional cold-corrected Voc for MPPT max voltage check
  description?: string;
}

export interface SystemComponent {
  customSolarArrayRatings?: CustomSolarArrayRatings;
}
```

Rules:

```txt
Physical solar panel components must not carry customSolarArrayRatings.
Custom Solar Array components may carry customSolarArrayRatings.
Both physical panels and Custom Solar Array must have quantity = 1.
Neither physical panels nor Custom Solar Array should use solarSeriesCount/solarParallelCount/solarWiringMode.
```

---

## Catalog changes

Add a catalog product for Custom Solar Array.

Suggested product data:

```ts
{
  id: 'custom-solar-array',
  name: 'Custom Solar Array',
  manufacturer: 'Custom',
  productType: 'custom_solar_array',
  category: 'Solar',
  subcategory: 'Solar Panels',
  terminals: [
    // PV+ and PV- terminals connected to a PV/two-pole port through terminal groups
  ],
  ports: [
    {
      id: 'pv-input',
      kind: 'pv',
      topology: 'two_pole',
      role: 'source',
      direction: 'output'
    }
  ],
  terminalGroups: [
    // PV+ and PV- groups tied to the PV port
  ],
  // Price/BOM should be custom/user-entered or excluded by default
}
```

Follow existing catalog conventions rather than inventing a parallel schema.

---

## Inspector/UI changes

### Physical solar panel inspector

Remove/disable UI controls that let one physical panel become many panels, including:

```txt
Panels in Series
Panels in Parallel
Solar Wiring Mode
Array quantity multiplier
```

Remove or disable functions similar to:

```ts
handleUpdateSolarWiringMode()
handleUpdateSolarConfiguration()
```

for physical panel products.

Physical panel inspector should show one-panel ratings only.

### Custom Solar Array inspector

Add editable fields:

```txt
Array Voc / open-circuit voltage
Array Vmp / voltage at max power
Array Isc / short-circuit current
Array Imp / current at max power
Array Power
Cold-corrected Voc
Description / notes
Include in BOM
Custom price
```

UX behavior:

```txt
If Vmp and Imp are entered and powerW is blank, calculate/display powerW = Vmp × Imp.
If powerW is user-entered, do not overwrite it unless the user clears it or explicitly asks to recalculate.
Clearly label this as an aggregate/custom array, not a single panel.
```

---

## Validation rules

For Custom Solar Array:

```txt
Voc must be > 0
Isc must be > 0
Vmp must be <= Voc when both are entered
Imp must be <= Isc when both are entered
coldVocV must be >= Voc when both are entered
powerW must be > 0, or computable from Vmp × Imp
```

Warnings/issues to add or reuse:

```txt
CUSTOM_SOLAR_ARRAY_INCOMPLETE
CUSTOM_SOLAR_ARRAY_INVALID_RATINGS
MPPT_PV_VOLTAGE_EXCEEDED
MPPT_PV_CURRENT_EXCEEDED
MPPT_PV_POWER_EXCEEDED
```

Do not silently treat missing custom array ratings as 0 A or 0 W.

---

## Solver requirements

Update the canonical solver path, not just UI summaries.

Use:

```txt
analyzeSystemDesign()
analyzeSystemCircuits()
```

as the authoritative path.

### Physical solar panel solver behavior

One placed physical solar panel evaluates as one physical panel only.

Example:

```txt
Solar Panel 400W = 400 W panel
not 2800 W
not 7 x 400 W
```

Use the catalog panel ratings for PV current/voltage/power.

### Custom Solar Array solver behavior

For Custom Solar Array connected to MPPT PV input:

```txt
PV+ design current uses Isc.
PV- design current matches PV+ through the two-pole return-current pairing model.
PV operating summaries may use Imp.
MPPT max PV voltage check uses coldVocV if present, otherwise Voc.
MPPT max PV current check uses Isc.
MPPT max PV power check uses powerW, or Vmp × Imp if powerW is blank and both are available.
Do not compute PV current from battery/system voltage.
```

Required MPPT compatibility checks:

```txt
array voltage <= mpptRatings.maxPvVoltageV
array Isc <= mpptRatings.maxPvCurrentA
array power <= mpptRatings.maxPvPowerByVoltageW[systemVoltage], falling back to mpptRatings.maxPvPowerW
```

If the exact MPPT rating field names differ, use the existing equivalent fields in the catalog model. Do not invent a second MPPT rating model.

---

## Save/load sanitization and migration

Add sanitization for old saved systems and preset/default systems.

### Physical solar panel sanitization

For physical solar panel products:

```txt
force quantity = 1
remove solarWiringMode
remove solarSeriesCount
remove solarParallelCount
remove customSolarArrayRatings
```

Do not silently preserve hidden strings.

If an old saved component had `quantity: 7` or `solarSeriesCount: 7`, choose one of these migration behaviors:

```txt
Preferred: replace it with one Custom Solar Array component using computed aggregate ratings when enough data exists.
Fallback: normalize to one physical panel and add a warning/note that hidden array data was removed.
```

Do not create seven placed panel components automatically unless there is already a safe layout-expansion utility.

### Custom Solar Array sanitization

For Custom Solar Array components:

```txt
force quantity = 1
allow customSolarArrayRatings
remove solarWiringMode
remove solarSeriesCount
remove solarParallelCount
```

---

## Default and preset system rules

Update:

```txt
src/data/defaultSystem.ts
src/data/presetSystems.ts
```

No physical solar panel component may have:

```txt
quantity > 1
solarSeriesCount
solarParallelCount
solarWiringMode
customSolarArrayRatings
```

For default systems, use either:

```txt
A. multiple explicit physical panel components, each quantity 1, or
B. one Custom Solar Array with explicit aggregate ratings
```

For a compact default system, prefer Custom Solar Array if drawing seven panels would clutter the schematic.

Example valid custom array component:

```ts
{
  id: 'custom-pv-array-1',
  productId: 'custom-solar-array',
  label: 'Custom PV Array 1',
  quantity: 1,
  x: 100,
  y: 100,
  customSolarArrayRatings: {
    vocV: 280,
    vmpV: 238,
    iscA: 12,
    impA: 10,
    powerW: 2800,
    description: 'Example aggregate PV array; customer-supplied / existing array.'
  },
  includeInBom: false
}
```

---

## BOM behavior

Physical solar panel:

```txt
BOM quantity = number of placed panel components
```

Custom Solar Array:

```txt
Default includeInBom = false unless product/BOM system already has custom-price support.
If included, show it as one custom array line item, not hidden panels.
Do not infer individual panel count from custom array power.
```

---

## Regression tests

Add tests before or alongside implementation. Use existing test framework if present. If no test framework exists, add a minimal test harness consistent with the repo.

Required tests:

```txt
1. A physical Solar Panel 400W component with quantity: 7 normalizes to quantity: 1.
2. A physical Solar Panel 400W component with solarSeriesCount/solarParallelCount has those fields removed.
3. One physical Solar Panel 400W component calculates as 400 W, not 2800 W.
4. Default/preset systems contain no hidden physical-panel multipliers.
5. A Custom Solar Array with valid ratings preserves customSolarArrayRatings and quantity: 1.
6. A Custom Solar Array with missing Voc or Isc creates CUSTOM_SOLAR_ARRAY_INCOMPLETE.
7. A Custom Solar Array with Vmp > Voc creates CUSTOM_SOLAR_ARRAY_INVALID_RATINGS.
8. A Custom Solar Array with Imp > Isc creates CUSTOM_SOLAR_ARRAY_INVALID_RATINGS.
9. A Custom Solar Array over MPPT max PV voltage creates MPPT_PV_VOLTAGE_EXCEEDED.
10. A Custom Solar Array over MPPT max PV current creates MPPT_PV_CURRENT_EXCEEDED.
11. A Custom Solar Array over MPPT max PV power creates MPPT_PV_POWER_EXCEEDED.
12. Custom Solar Array PV+ branch uses Isc.
13. Custom Solar Array PV- branch current matches PV+.
14. Physical solar panel components cannot carry customSolarArrayRatings after sanitization.
15. BOM quantity becomes seven only when seven separate physical panel components exist.
```

---

## Acceptance criteria

This task is complete only when:

```txt
Normal solar panels can no longer secretly represent multiple panels.
Custom Solar Array exists as an explicit aggregate PV source.
Default and preset systems no longer use hidden solar multipliers.
MPPT voltage/current/power checks work for Custom Solar Array.
Physical panel BOM quantities are based on actual placed components.
Custom Solar Array is shown as one explicit custom aggregate item.
Old saved systems are sanitized.
Regression tests cover both physical-panel and custom-array behavior.
```

Do not solve this by only changing labels. The data model and solver must make the invalid hidden-string state impossible or sanitized away.
