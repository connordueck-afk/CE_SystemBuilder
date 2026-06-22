# Fuse, Cable, and Node Rule Audit & Implementation Brief

## Purpose

Audit the current fuse and cable sizing approach in the System Builder app against the rule set below, then implement the required changes.

The goal is to move away from simple component-level assumptions and toward a graph-based electrical model where nodes, cables, fuses, busbars, and distribution devices interact correctly.

This brief focuses on **DC system wiring**, especially **DC+ protection** and **DC- return-path sizing**.

---

## High-Level Goal

When a user drags two electrical nodes together, the app should create a cable/branch, determine whether protection is required, recommend or request fuse insertion, auto-size fuse and cable where possible, and continuously validate the branch when the user edits fuse size or cable size.

The app should no longer throw an error simply because:

> A source can supply more current than the fuse rating.

That is a normal and valid condition. A battery may be capable of 200 A while a branch is intentionally fused at 100 A.

Instead, the app must distinguish between:

- source available current
- source fault current
- sink demand current
- intended branch current
- fuse amp rating
- fuse interrupt rating
- cable ampacity
- cable voltage-drop performance

---

## Important Non-Regression Requirement

Do not remove existing app functionality while implementing this work.

Preserve existing features unless a change is explicitly required to support the rule set below. This includes, but is not limited to:

- component selection
- schematic/system layout
- drag/drop behavior
- BOM generation
- system price summary
- existing product data
- existing visual component rendering
- existing cable/fuse display behavior where still compatible

If existing code uses a simpler model, migrate it carefully rather than deleting related functionality.

---

## Working Assumptions

This app is a design assistance tool, not a final certified engineering approval tool.

Use conservative defaults where exact product or regulatory data is missing.

The default system profile is a mobile/low-voltage DC style system similar to Victron, marine, RV, van, or off-grid battery systems.

Default behavior:

- DC+ conductors are protected/fused.
- DC- conductors are not fused.
- Batteries and battery-backed buses are high-fault-current sources.
- Busbars and distributors propagate source capability.
- Fuses protect cables, not devices, although device max fuse ratings still matter.
- Manual user edits are allowed but must be validated.

---

# Core Concepts

## 1. Nodes

Each device exposes electrical nodes.

A node can be:

- **source**: can supply power
- **sink**: consumes/receives power
- **bidirectional**: can both source and sink power
- **passive connection point**: does not create power but passes current/source capability

Examples:

| Device / Node | Classification |
|---|---|
| Battery DC+ | bidirectional / high-fault-current source |
| Battery DC- | return node |
| MPPT battery-side DC+ | source, usually current-limited |
| MPPT PV input | sink from PV perspective / PV-side special case |
| Inverter DC+ | sink |
| Inverter-charger DC+ | bidirectional |
| DC-DC converter input | sink |
| DC-DC converter output | source, usually current-limited |
| Charger DC output | source, usually current-limited |
| Plain busbar post | passive connection point |
| Fused distributor output | source-backed protected output when fed |

---

## 2. Branches / Cables

When two nodes are connected, the app creates a branch/cable.

A branch should track:

- connected endpoints
- electrical domain, such as DC+, DC-, PV, AC, signal
- length
- intended branch current
- current source paths
- sink demand paths
- fuse/protection devices associated with the branch
- cable size
- ampacity
- voltage drop
- validation status
- whether values are auto-selected or manually locked

The branch should not blindly size itself based only on maximum source capability.

---

## 3. Sources vs Sinks

A source-capable node can energize a cable fault.

A sink node does not create a fuse requirement by itself, but its current demand determines the minimum usable branch capacity.

Important rule:

> Source capability determines fuse requirement and fault analysis. Sink demand determines required branch capacity.

---

## 4. Branch Design Current

The sizing process should begin with **branch design current**, not with cable size or fuse size.

Branch design current is the intended normal operating current of the branch.

It may come from:

- sink current demand
- source controlled output current
- device manufacturer recommendation
- downstream load sum
- user-selected branch limit
- bidirectional current calculation
- product metadata

Examples:

| Connection | Branch design current basis |
|---|---|
| Battery to load | load current |
| Battery to inverter | inverter DC input current |
| Battery to inverter-charger | larger of inverter draw or charger output |
| Battery to MPPT output | MPPT rated output current |
| Battery to charger output | charger rated output current |
| Battery to DC-DC output | DC-DC output current |
| Busbar to load panel | downstream load sum or user feeder rating |
| Battery to battery | user branch rating or battery interconnect design current |

A source may be capable of more current than the branch is intended to carry.

Example:

- Battery can supply 200 A.
- Connected sink only needs 80 A.
- User wants a 100 A branch.
- A 100 A fuse and cable sized for 100 A can be valid, provided all other checks pass.

---

# Decision Order

Use this decision order when a branch is created or edited:

1. **Classify the connection**
   - DC+, DC-, PV, AC, signal, etc.
   - source/sink/bidirectional/passive endpoints

2. **Determine possible current directions**
   - A to B
   - B to A
   - bidirectional
   - none / invalid or incomplete

3. **Determine source-capable endpoints**
   - battery
   - battery-backed bus
   - charger output
   - MPPT output
   - inverter-charger DC side
   - DC-DC output
   - other configured sources

4. **Determine branch design current**
   - from load/sink demand, controlled source output, user branch rating, downstream loads, or product metadata

5. **Determine whether fuse/protection is required**
   - usually yes for source-fed DC+ cables
   - evaluate per source-capable endpoint

6. **Select or validate fuse**
   - based on branch design current, product recommendations, source-side protection need, and user overrides

7. **Select or validate cable**
   - based on fuse rating, branch current, voltage drop, and installation derating

8. **Validate source capability**
   - source/fuse path must support sink demand

9. **Validate source-side protection**
   - required fuse exists
   - fuse is close enough to source
   - both ends protected where required

10. **Validate ratings**
    - fuse amp rating
    - fuse voltage rating
    - fuse interrupt rating
    - cable ampacity
    - device max fuse
    - busbar/distributor ratings
    - shunt rating

11. **Produce errors/warnings**
    - see error model below

---

# Fuse and Cable Sizing Rules

## Sizing Relationship

The basic relationship is:

> branch design current ≤ fuse rating ≤ cable ampacity

Then cable may need to be larger for voltage drop.

Voltage drop can force a larger cable, but it should not force a larger fuse.

---

## Fuse Selection

The app should select the smallest standard fuse that satisfies all applicable constraints:

- fuse rating is high enough for branch design current
- fuse rating does not exceed cable ampacity
- fuse rating does not exceed device max fuse rating
- fuse voltage rating is suitable for system voltage
- fuse interrupt rating is suitable for available source fault current
- manufacturer-recommended fuse is preferred when known

If the user manually selects a fuse, treat it as a locked constraint and validate the branch around it.

---

## Cable Selection

The app should select the smallest cable that satisfies:

- ampacity is at least selected fuse rating
- ampacity is at least expected branch current
- voltage drop target is met
- installation derating is applied if supported
- cable fits device terminals if terminal data is available
- manufacturer minimum cable size is met

If the user manually selects a cable, treat it as a locked constraint and validate fuse and branch current against it.

---

## Manual Override Rules

### Fuse Auto, Cable Auto

The app auto-selects both fuse and cable.

### User Changes Fuse

Fuse becomes manually locked.

The app should:

- recalculate or validate cable
- verify sink current can still be supported
- warn/error if selected fuse is below required branch current
- error if fuse exceeds device maximum or rating constraints

### User Changes Cable

Cable becomes manually locked.

The app should:

- validate fuse against cable ampacity
- reduce recommended fuse if fuse is still auto
- error if manual fuse exceeds cable capability
- warn if cable creates excessive voltage drop

### User Changes Both Fuse and Cable

Both are locked.

The app should validate only.

Do not silently change either value.

---

# Fuse Behavior Model

A fuse is not a source or a sink.

A fuse is a passive series protection device.

It has two terminals, but those terminals should not permanently be classified as source or sink. Their effective behavior is inherited from the network connected to each side.

The fuse performs two roles in the model:

## 1. Normal Branch Rating

For normal current availability, the fuse caps the protected branch rating.

Example:

- source can supply 200 A
- fuse is 100 A
- downstream available branch current is treated as 100 A

Do not describe the fuse as actively regulating current. It is not an electronic current limiter.

Preferred wording:

> Branch is protected at 100 A.

Avoid wording:

> Fuse limits current to 100 A.

## 2. Fault Protection

For fault analysis, the fuse protects cable segments downstream from the source side, provided:

- it is located close enough to the source
- amp rating is suitable
- voltage rating is suitable
- interrupt rating is suitable

A fuse amp rating does not represent fault current. A 100 A fuse may see thousands of amps during a fault and must be rated to interrupt that current safely.

---

# DC+ Rules

DC+ is the protected conductor in the default profile.

For DC+ branches, evaluate:

- source capability
- source fault current
- fuse requirement
- fuse location
- fuse amp rating
- fuse voltage rating
- fuse interrupt rating
- cable ampacity
- voltage drop
- busbar/distributor propagation
- source-backed branch protection

## DC+ Source-Side Protection Rule

> Every DC+ cable connected to a source-capable endpoint must be protected from that source unless the source is current-limited below cable ampacity, internally protected, or an allowed short unprotected section applies.

Protection must be evaluated per source-capable endpoint.

---

# DC- Rules

DC- has similar current and cable sizing rules, but no fuses in the default profile.

For DC- branches, evaluate:

- return path exists
- cable ampacity is sufficient
- cable voltage drop is included
- negative busbar rating is sufficient
- shunt rating is sufficient
- return current is not bypassing required shunt path
- polarity is correct

Do not require fuses on DC- in the default profile.

If a user inserts a fuse on DC-, show a warning or error depending on selected system profile.

Recommended default:

> DC- conductor is fused. Negative fusing is not supported in the default DC system profile.

## DC- Return Path Rule

> Every DC+ power path must have a matching DC- return path with equal current capability.

Voltage drop should include both positive and negative conductor length.

---

# Source-to-Source and Bidirectional Rules

When two source-capable nodes are connected, a fault can be fed from either end.

Examples:

- battery to battery
- battery to inverter-charger
- battery-backed bus to MPPT
- battery-backed bus to charger
- bidirectional DC-DC to battery

## Rule

> A source-fed cable must be protected from every source-capable endpoint.

For each endpoint, the app must identify the first protective device between that source and the cable and verify that the unprotected length is allowed.

Possible outcomes:

- fuse required at endpoint A only
- fuse required at endpoint B only
- fuse required at both endpoints
- fuse optional at one endpoint because source is current-limited or internally protected
- branch invalid because one source side is unprotected

## Two-Fuse Branches

If a branch has fuses at both ends:

- effective branch current is limited by the smaller fuse
- cable must be protected by the larger fuse
- mismatched fuse ratings are allowed only if valid, but should produce a note or warning

For symmetric source-to-source links, recommend matching fuse sizes unless product data says otherwise.

---

# Busbar and Distribution Device Rules

## Passive Busbar

A plain busbar is a passive common connection point.

It does not create current.

However:

> If any source-capable node attaches to a busbar, all electrically common busbar points become source-capable.

If multiple compatible sources connect to the same busbar, their normal available current should add.

Example:

- Battery 1 branch available current: 100 A
- Battery 2 branch available current: 100 A
- Busbar normal available current: 200 A

Only add source currents if the sources are compatible and allowed to operate in parallel.

## Source Compatibility

Do not blindly combine incompatible sources.

Incompatible examples:

- 12 V source connected directly to 24 V source
- AC source tied to another AC source without transfer/synchronization
- PV string connected directly to battery bus
- different battery chemistries or voltages directly paralleled without explicit support
- charger outputs with incompatible settings

Produce an incompatible connection error when appropriate.

## Fault Current at Busbars

Track normal available current separately from fault current.

Do not assume fuse amp rating equals fault current.

For V1, if exact fault current is unknown, mark interrupt-rating verification as unknown or use conservative assumptions.

## Fused Distribution Devices

A fused distribution device is not the same as a plain busbar.

It has:

- a source-backed common bus
- protected branch outputs
- output fuse positions

When fed by a source:

- the internal common bus becomes source-capable
- each fused output becomes source-capable only through its installed fuse
- available current at each output is capped by the branch fuse
- if an output fuse is missing, the output should not be treated as protected

Examples:

- Lynx Distributor
- fuse block
- breaker panel
- DC distribution panel

## Busbar/Distribution Rating Checks

Check:

- busbar current rating
- distributor current rating
- fuse block current rating
- branch output rating
- terminal rating if known

Possible errors:

- busbar overloaded
- distribution device overloaded
- branch output exceeds position rating
- incompatible sources on common bus
- source branch attached to busbar without valid protection
- branch leaving source-backed busbar without valid protection

---

# Error and Warning Model

## Remove Existing Bad Error

Remove or replace the current error:

> Source can supply more current than the fuse can handle.

This is not inherently an error.

A source may supply 200 A while a branch is intentionally fused at 100 A.

Replace with the more specific errors below.

---

## Hard Errors

These should make the branch/system invalid.

### 1. Incompatible Node Connection

Examples:

- DC+ connected to DC-
- 12 V bus connected to 24 V bus
- AC connected to DC
- PV connected directly to battery without charge controller
- incompatible AC sources tied together

### 2. Required Source-Side Fuse Missing

A source-fed DC+ cable does not have valid source-side protection.

Causes:

- no fuse
- fuse on wrong side
- fuse missing from distributor position
- source-to-source branch protected from one end only

### 3. Unprotected Source Lead Too Long

A fuse exists, but the distance from source to fuse exceeds the configured allowed unprotected length.

### 4. Fuse Too Large for Cable

Selected fuse amp rating exceeds cable ampacity after applicable derating.

### 5. Cable Too Small for Expected Branch Current

Cable ampacity is below branch design current.

### 6. Sink Current Demand Exceeds Available Branch Current

The sink needs more current than the source/fuse path can provide.

Examples:

- load requires 120 A, branch fuse is 100 A
- load requires 120 A, source can provide only 80 A

### 7. Source Output Exceeds Sink Input Limit

The source can be configured or connected in a way that exceeds the sink’s allowed input current.

Example:

- charger output 100 A
- battery max charge current 50 A
- no configuration limiting charger to 50 A

### 8. Fuse Voltage Rating Too Low

Fuse/breaker voltage rating is below system voltage or wrong for DC/AC use.

### 9. Fuse Interrupt Rating Too Low

Fuse/breaker interrupt rating is below available source fault current.

### 10. Selected Fuse Exceeds Device Max Fuse

Device has a maximum allowed fuse rating and selected fuse exceeds it.

### 11. Busbar or Distribution Device Overloaded

Expected current exceeds busbar/distributor rating.

### 12. Missing DC- Return Path

A DC+ power path exists but no matching DC- return path is connected.

### 13. DC- Return Cable Undersized

DC- return cable is below required branch current capability.

### 14. Shunt Rating Exceeded

Current through a shunt exceeds shunt rating.

---

## Warnings

Warnings should not necessarily block the design, but should be visible.

### 1. Voltage Drop Exceeds Target

Cable ampacity may be safe, but voltage drop is above the configured target.

### 2. Fuse Smaller Than Manufacturer Recommendation

Selected fuse is below recommended value but still may be intentionally selected.

### 3. Fuse Larger Than Manufacturer Recommendation

Selected fuse is above recommendation but below max allowed; warn.

### 4. Cable Larger Than Needed

Valid but oversized.

### 5. Cable May Not Fit Terminal

Cable size exceeds device terminal recommendation or known terminal capacity.

### 6. Source Capability Unknown

Cannot fully validate sink support.

### 7. Fault Current Unknown

Cannot verify fuse interrupt rating.

### 8. Product Fuse Data Missing

Generic sizing used because product recommendation is unavailable.

### 9. Branch Current Inferred

The app inferred branch current and user has not confirmed it.

### 10. DC- Fuse Present in Default Profile

DC- conductor is fused even though default profile does not support negative fusing.

### 11. Mismatched Fuses on Two-Fuse Branch

Two source-side fuses exist but ratings differ. Valid only if cable and branch current checks pass.

---

# UI / Editor Behavior Requirements

## On Node Connection

When a user connects two nodes, the app should show/compute:

- endpoint classifications
- possible current direction
- branch design current
- whether fuse is required
- where fuse is required
- recommended fuse
- recommended cable
- validation status

Example message:

> Fuse required at battery/bus side. Recommended 125 A fuse. Recommended cable size based on selected length and voltage-drop target.

## Fuse Insertion

If a fuse is required but missing, the app should request or auto-suggest fuse insertion.

The user should be able to accept the recommended fuse or manually choose a fuse size.

## Editor Overrides

At any point, the user may change:

- fuse size
- fuse type
- cable size
- cable length
- branch rating
- voltage-drop target
- whether a manufacturer/internal protection assumption applies

After any edit, the app should revalidate the branch.

Do not silently override manually selected values.

Instead, show errors/warnings and recommend corrections.

---

# Validation Test Cases

Use these test cases to verify behavior after implementation.

## Test 1: Battery Source Larger Than Fuse

Battery source capability: 200 A  
Branch fuse: 100 A  
Load: 80 A  
Cable: valid for 100 A

Expected result:

- valid
- no error saying source exceeds fuse
- branch available current treated as 100 A

## Test 2: Load Exceeds Fuse

Battery source capability: 200 A  
Branch fuse: 100 A  
Load: 120 A

Expected result:

- error: sink current demand exceeds available branch current

## Test 3: Fuse Too Large for Cable

Fuse: 200 A  
Cable ampacity: 100 A

Expected result:

- hard error: fuse too large for cable

## Test 4: Cable Too Small for Load

Load: 120 A  
Cable ampacity: 100 A  
Fuse: 100 A or 125 A

Expected result:

- hard error: cable too small for expected branch current and/or sink demand exceeds branch rating

## Test 5: Battery to Busbar Without Fuse

Battery DC+ connected to busbar with no fuse.

Expected result:

- hard error: source-fed cable unprotected

## Test 6: Battery to Busbar With Long Unprotected Lead

Battery DC+ connected to fuse, but fuse too far from battery.

Expected result:

- hard error: unprotected source lead too long

## Test 7: Busbar Source Propagation

Battery connects to busbar. Load connects to another busbar post.

Expected result:

- load branch sees busbar as source-backed
- branch fuse required at busbar side

## Test 8: Multiple Sources on Busbar

Two 100 A battery branches connect to busbar.

Expected result:

- busbar normal available current = 200 A if sources compatible
- all other busbar terminals source-capable
- busbar/distributor current rating checked

## Test 9: Incompatible Sources on Busbar

12 V battery and 24 V battery connected to same busbar.

Expected result:

- hard error: incompatible sources connected to common bus

## Test 10: Source-to-Source Battery Link, One Fuse Only

Battery A connected to Battery B with one fuse near Battery A only.

Expected result:

- error: branch protected from Battery A but not from Battery B

## Test 11: Source-to-Source Battery Link, Fuses Both Ends

Battery A -> fuse -> cable -> fuse -> Battery B

Expected result:

- valid if both fuses protect the cable and source lead lengths are valid
- warning if fuse ratings are mismatched

## Test 12: MPPT to Battery-Backed Bus

MPPT output connected to battery-backed bus.

Expected result:

- bus side fuse required
- branch design current based on MPPT output
- MPPT side fuse optional or based on product metadata/current-limited assumption

## Test 13: Charger Too Large for Battery Charge Limit

Charger output: 100 A  
Battery max charge current: 50 A  
No configured current limit

Expected result:

- error: source output exceeds sink input limit

If charger is configured to 50 A:

- valid if all other checks pass

## Test 14: DC- Return Missing

DC+ path exists to load, but no DC- path.

Expected result:

- hard error: missing DC- return path

## Test 15: DC- Return Cable Undersized

DC+ branch rating: 150 A  
DC- cable ampacity: 100 A

Expected result:

- hard error: DC- return cable undersized

## Test 16: DC- Fuse Present

Battery negative has fuse in default profile.

Expected result:

- warning or error: DC- fusing not supported in default profile

## Test 17: Fuse Interrupt Rating Too Low

Battery fault current: 5000 A  
Fuse AIC: 2000 A

Expected result:

- hard error: fuse interrupt rating too low

## Test 18: Fuse Voltage Rating Too Low

System voltage: 48 V  
Fuse voltage rating: 32 V DC

Expected result:

- hard error: fuse voltage rating too low

## Test 19: Manual Fuse Override

Auto recommendation: 150 A fuse  
User selects: 100 A fuse  
Load: 80 A

Expected result:

- valid if cable and device checks pass
- branch available current becomes 100 A
- no automatic reversion to 150 A

## Test 20: Manual Cable Override

Auto cable: valid for 150 A  
User selects cable valid for 100 A  
Fuse remains 150 A

Expected result:

- hard error: fuse too large for cable
- recommend lower fuse or larger cable

---

# Implementation Notes

## Avoid One-Off Component Logic

Prefer graph-based analysis over hardcoded component-specific exceptions.

Component metadata should feed the graph model, not replace it.

## Preserve Manual Editing

The auto-sizing system should produce recommendations, but the user must be able to override values.

Manual overrides become locked constraints.

The app then validates around them.

## Product Metadata Is Important

Where possible, product data should include:

- node type
- source/sink/bidirectional behavior
- nominal voltage
- min/max voltage
- max source current
- max sink current
- configured current limit
- fault current if known
- recommended fuse
- max fuse
- recommended cable
- max terminal cable size
- internal protection flag
- current-limited source flag
- reverse-current allowed flag

Do not block implementation if all metadata is not currently available. Add graceful fallback behavior and warnings.

## Required Refactor Outcome

By the end of this task, the app should:

1. Stop treating `source current > fuse rating` as an error.
2. Base branch sizing on branch design current.
3. Distinguish normal current from fault current.
4. Evaluate source-side protection per source-capable endpoint.
5. Propagate source capability through busbars/distribution devices.
6. Sum compatible source currents on common buses.
7. Validate source-to-source and bidirectional branches from both ends.
8. Treat fuses as passive series protection devices, not sources or sinks.
9. Apply DC+ fuse rules and DC- return-path rules separately.
10. Support manual fuse/cable overrides with revalidation.
11. Produce clear errors and warnings using the model above.
12. Preserve existing schematic, BOM, pricing, and component selection behavior.

---

# Deliverables for Codex

Codex should:

1. Audit the current implementation against this document.
2. Identify existing logic that conflicts with this rule set.
3. Update the data model if needed.
4. Update connection analysis logic.
5. Update fuse/cable auto-sizing logic.
6. Update busbar/distribution propagation behavior.
7. Update error/warning generation.
8. Update UI messages as needed.
9. Add or update tests using the validation cases above.
10. Confirm what was changed and list any remaining limitations.

---

# Permission and Workflow Notes

Codex may edit and add files in the repository as needed to implement this work.

Do not remove existing features unless necessary and justified.

Do not make destructive changes without clear reason.

If shell commands are required, avoid destructive commands. Ask before running anything that could delete files, reset git state, overwrite broad directories, or otherwise risk data loss.

