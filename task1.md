# Codex Task: Product Catalog Architecture Refactor & Migration

## Goal

Refactor the existing product database into a scalable, strongly typed product catalog for a React-based electrical system builder.

This app is no longer just a product selector. It is becoming a system layout tool for mobile solar, off-grid, RV/marine, and light residential power systems. The product database must support:

* Visual system layout on a canvas
* Drag-and-drop components
* Connection nodes/terminals
* Electrical validation
* Cable sizing recommendations
* Fuse/breaker recommendations
* BOM generation
* System price summary
* Future energy/input/output calculations
* Future system simulation and validation capabilities

Codex has permission to edit, add, reorganize, and delete project files in the repository as needed to complete this refactor.

Do not request permission for normal file creation, deletion, movement, or modification.

Continue working autonomously wherever possible.

Permission should still be requested before:

* Running PowerShell commands
* Running terminal commands
* Installing packages
* Running builds
* Running tests
* Executing scripts
* Making changes that affect the local development environment

---

# Preservation of Existing Functionality (Critical Requirement)

This task is a migration and architecture improvement effort.

It is NOT a rewrite.

The existing application already contains functionality that may not be fully documented in this specification. The absence of a feature from this document does NOT mean the feature should be removed.

Before making structural changes:

* Review the existing codebase.
* Identify existing functionality.
* Preserve existing behavior wherever practical.
* Prefer adapters and migration layers over feature removal.
* Prefer extending existing systems over replacing them.

## Required Rule

If an existing feature works today, assume it is intentionally part of the application.

Do not remove functionality simply because it is not explicitly described in this document.

Examples may include:

* Product selection workflows
* Existing canvas interactions
* Drag-and-drop behavior
* Existing node connection behavior
* Existing pricing calculations
* BOM generation
* Existing product metadata
* Existing filtering/search behavior
* Existing serialization/export behavior
* Existing UI layouts
* Existing helper utilities
* Existing diagram functionality
* Existing calculation logic
* Existing state management
* Existing import/export features

These examples are not exhaustive.

## Migration First Approach

When existing data structures conflict with the new architecture:

Preferred order:

1. Extend the existing structure.
2. Add compatibility adapters.
3. Migrate existing data.
4. Deprecate old structures.
5. Remove old structures only when they are fully replaced and no longer used.

Avoid introducing breaking changes when a compatibility layer can solve the problem.

## Existing Product Data

Do not discard existing product information.

If the current catalog contains fields that are not represented in the new model:

* Preserve them.
* Migrate them.
* Add extension fields if needed.
* Add notes documenting their purpose.

Do not silently delete data.

## Existing UI Features

The goal is to improve the product architecture underneath the application.

The goal is NOT to rebuild the application UI.

If a UI feature depends on an older product structure:

* Update the integration layer.
* Add mapping utilities.
* Add adapters.

Do not remove the feature simply because the underlying data model changed.

## Existing Canvas Features

The current canvas implementation already provides useful functionality.

Preserve:

* Drag-and-drop placement
* Existing node rendering
* Existing connection workflows
* Existing positioning/layout behavior
* Existing selection workflows
* Existing editing workflows

Refactor only as much as necessary to support terminal-driven products.

## Existing Calculations

If pricing, BOM generation, or other calculations already exist:

* Preserve them.
* Improve them if required.
* Adapt them to the new catalog structure.

Do not replace working calculations with placeholders.

## Final Success Criteria

A successful implementation provides:

* The new extensible product architecture
* The new terminal/rating system
* Improved future scalability

AND

* All existing user-visible functionality continues to work unless there is a documented technical reason why it cannot

When in doubt:

**Preserve functionality.**

---

# Core Problem

The current product list is too basic.

It contains products, but it does not contain enough structured electrical information for the app to understand:

* How components connect
* Current flow paths
* Voltage domains
* Cable sizing
* Fuse sizing
* Protection requirements
* BOM generation
* Future validation rules

We need to refactor the product catalog into a structured electrical component database.

This is NOT a UI administration tool task.

Do not build a product editor UI.

Focus on:

1. File structure
2. TypeScript architecture
3. Product schemas
4. Product definitions
5. Terminal definitions
6. Ratings definitions
7. Pricing/BOM metadata
8. Future validation support

---

# Long-Term Vision

This application is evolving into a complete electrical system design tool.

Future capabilities may include:

* System design validation
* Cable sizing
* Fuse sizing
* Voltage drop calculations
* Current flow calculations
* Power flow calculations
* Battery runtime estimates
* Solar production estimates
* Energy consumption modeling
* BOM generation
* Pricing analysis
* Design review reports

The product architecture created during this task should support those future goals.

---

# Key Design Principle

Electrical behavior must NOT depend on category names.

The system should be driven primarily by:

* Product type
* Product capabilities
* Terminal definitions
* Electrical ratings
* Connection rules
* Protection requirements

Categories exist primarily for UI organization and product discovery.

---

# Product Architecture

The system should separate:

## Product Category

Broad UI grouping.

Examples:

* Solar
* Batteries
* Charging
* Inverters
* Distribution
* Protection
* Loads
* AC Equipment
* Accessories
* Monitoring
* Cables

These categories must be extensible.

Do not hardcode application behavior based on category names.

---

## Product Type

Functional electrical behavior.

Examples:

* mpptChargeController
* dcDcCharger
* inverterCharger
* inverter
* battery
* busBar
* fuse
* breaker
* batteryMonitor
* solarPanel
* pvCombinerBox
* acDistributionPanel
* dcDistributionPanel
* shorePowerInlet
* transferSwitch
* dcDisconnect
* acDisconnect
* load
* relay
* contactor
* converter

This list is expected to grow.

The architecture should allow new types to be added without modifying core application behavior.

---

## Physical Product

A specific purchasable product.

Examples:

* Victron SmartSolar MPPT 150/100
* Victron MultiPlus-II 48/3000
* Victron Lynx Distributor
* Battle Born 12V 100Ah Battery

Each physical product should contain:

* Unique ID
* Manufacturer
* Product name
* Model
* Part number
* Category
* Product type
* MSRP
* Currency
* Product URL
* Datasheet URL
* Description
* Electrical ratings
* Terminal definitions
* Optional future metadata

---

# Product File Organization

Refactor the product catalog into a maintainable structure.

Suggested structure:

```txt
src/
  data/
    products/
      index.ts
      categories.ts
      productTypes.ts
      productSchemas.ts
      products/
        batteries.ts
        mppts.ts
        inverterChargers.ts
        dcDcChargers.ts
        distribution.ts
        protection.ts
        solar.ts
        loads.ts
        monitoring.ts
        accessories.ts
      helpers/
        validation.ts
        catalogUtils.ts
      README.md
```

Exact structure may vary.

Maintain the same design goals:

* Clear separation
* Easy maintenance
* Agent-friendly
* Human-readable
* Easy expansion

---

# Required Core Product Model

Create a strongly typed product model.

## Product Identity

```ts
interface ProductIdentity {
  id: string;
  manufacturer: string;
  name: string;
  model?: string;
  partNumber?: string;
  sku?: string;
  description?: string;
  productUrl?: string;
  datasheetUrl?: string;
  imageUrl?: string;
}
```

---

## Pricing

```ts
interface ProductPricing {
  msrp: number;
  currency: "USD" | "CAD" | "EUR";
}
```

---

## Category and Type

```ts
type ProductCategory = string;
type ProductType = string;
```

Maintain extensibility.

---

## Electrical Domains

```ts
type ElectricalDomain =
  | "dc"
  | "ac"
  | "pv"
  | "chassisGround"
  | "earthGround"
  | "communication"
  | "signal";
```

---

# Terminal Architecture

The terminal model is one of the most important parts of this refactor.

The canvas, validation system, and future calculations should be able to use terminal definitions.

Each product should expose its connection points.

Example:

```ts
interface ProductTerminal {
  id: string;
  label: string;

  domain: ElectricalDomain;

  direction:
    | "input"
    | "output"
    | "bidirectional"
    | "passive";

  polarity?:
    | "positive"
    | "negative"
    | "line"
    | "neutral"
    | "ground"
    | "none";

  voltageNominalV?: number;
  voltageMinV?: number;
  voltageMaxV?: number;

  currentMaxA?: number;
  powerMaxW?: number;

  phases?: 1 | 2 | 3;

  conductorCount?: number;

  required?: boolean;

  connectableTo?: string[];

  requiresOvercurrentProtection?: boolean;

  recommendedFuseA?: number;
  maxFuseA?: number;

  requiresDisconnect?: boolean;

  notes?: string;
}
```

Adapt as necessary.

---

# Product Ratings

Each product type should expose ratings appropriate to its function.

Do not force every product into the same rating structure.

Create specialized rating definitions where appropriate.

---

## MPPT

Include:

* Battery voltage support
* Max PV voltage
* Max PV current
* Max output current
* Max PV power
* Efficiency
* PV terminals
* Battery terminals

---

## Inverter Charger

Include:

* DC voltage
* DC current
* Continuous inverter power
* Surge power
* Charger current
* AC input voltage
* AC input current
* AC output voltage
* AC output current
* Transfer switch current
* Ground terminals
* Protection requirements

---

## Battery

Include:

* Nominal voltage
* Capacity Ah
* Capacity Wh
* Capacity kWh
* Max charge current
* Max discharge current
* Peak discharge current
* Charge voltage
* Cutoff voltage
* Communication interfaces
* Internal protection information

---

## DC-DC Charger

Include:

* Input voltage
* Output voltage
* Output current
* Input current
* Isolation information
* Protection requirements

---

## Bus Bars and Distribution

Include:

* Voltage rating
* Current rating
* Connection count
* Positive/negative designation
* Protection requirements

---

## Fuse and Breaker Products

Include:

* Current rating
* Voltage rating
* Interrupt rating
* AC/DC compatibility
* Fuse style
* Protection type

---

## Solar Panels

Include:

* Voc
* Vmp
* Isc
* Imp
* Power rating
* Temperature coefficients if available

---

## PV Combiner Boxes

Include:

* Number of strings
* Input count
* Output count
* Maximum voltage
* Maximum current
* Included protection devices

---

## Loads

Include:

* Voltage
* Current
* Power
* Startup current
* Duty cycle assumptions where available

---

# Terminal Driven Canvas

Long-term goal:

The canvas should render connection nodes from terminal definitions.

Avoid:

```ts
if (type === "battery") {
  renderTwoNodes();
}
```

Prefer:

```ts
renderNodes(product.terminals);
```

Maintain existing canvas functionality.

Only refactor as necessary.

---

# Protection and Cable Sizing

Do NOT hardcode all cable sizes and fuse sizes into products.

Instead:

Products should expose:

* Current limits
* Voltage limits
* Protection requirements

Future algorithms should calculate:

* Fuse size
* Breaker size
* Cable size
* Disconnect requirements

Optional manufacturer recommendations may be stored.

Examples:

```ts
recommendedFuseA
recommendedCableGauge
maxFuseA
```

---

# BOM Requirements

Every physical product should support:

* BOM inclusion
* Quantity tracking
* Pricing
* Category grouping
* Manufacturer grouping

Future generated items should also be supported:

* Fuses
* Breakers
* Cables
* Lugs
* Bus bars

The architecture must not prevent calculated BOM items.

---

# Validation

Add lightweight validation helpers where practical.

Examples:

* Unique product IDs
* Required fields present
* Terminal IDs unique within a product
* Products with electrical behavior have terminals
* Pricing exists
* Categories exist
* Product type exists

Keep validation simple.

---

# Migration Requirements

Migrate existing products.

Preserve:

* Existing names
* Existing pricing
* Existing categories
* Existing ratings
* Existing metadata
* Existing canvas information

Missing information may be represented as:

```ts
dataQuality:
  | "complete"
  | "partial"
  | "placeholder";
```

Never silently delete product data.

---

# Compatibility Layer

If existing code depends on the current catalog structure:

Use adapters.

Preferred helpers:

```ts
getProductDisplayName()
getProductPrice()
getProductCategory()
getProductType()
getProductTerminals()
getProductsByCategory()
getProductsByType()
```

Avoid scattering compatibility code throughout the UI.

---

# Deliverables

Produce:

1. Refactored product catalog architecture
2. Strong TypeScript definitions
3. Organized product data files
4. Compatibility adapters
5. Product migration
6. Validation helpers
7. Updated exports/imports
8. Developer documentation

Add:

```txt
src/data/products/README.md
```

Document:

* Adding products
* Categories
* Product types
* Terminals
* Ratings
* Pricing
* Validation

---

# Success Criteria

A human or agent should be able to add a new product by:

1. Opening the correct product file.
2. Creating a product object.
3. Adding:

   * Identity
   * Pricing
   * Category
   * Product type
   * Ratings
   * Terminals
4. Saving the file.

The application should then be capable of:

* Displaying the product
* Adding it to the canvas
* Rendering appropriate nodes
* Including it in BOM calculations
* Using it in future validation systems
* Using it in future cable sizing systems
* Using it in future fuse sizing systems

while preserving all existing application functionality.

## Final Rule

When there is a conflict between:

* Preserving functionality

and

* Implementing a cleaner architecture

Prefer preserving functionality and introduce adapters, migration layers, or compatibility helpers.

This task is a migration, not a rewrite.
