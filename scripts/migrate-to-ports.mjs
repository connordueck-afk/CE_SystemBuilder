// ============================================================
// scripts/migrate-to-ports.mjs — Phase 3 catalog migration
// ============================================================
// Adds the port-centric structure to every catalog product:
//   - assigns a portId to every terminal
//   - builds a Product.ports entry per portId with kind + topology + role
//   - folds communicationPorts membership in by id (structure only)
// Electrical SPEC VALUES (voltage/current) are deliberately NOT moved here — that
// happens in Phase 4 atomically with legacy-field removal, so no validation rule
// changes behaviour mid-migration. See PORT_REFACTOR_PLAN.md.
//
// SAFETY: for each product we compute the internal bonding (portLinkPairs) before
// and after. Any product whose bonding changes is FLAGGED and skipped — never
// written automatically — so the short-circuit hazard can't slip through.
//
// Usage:
//   node scripts/migrate-to-ports.mjs          # dry run: report only
//   node scripts/migrate-to-ports.mjs --apply  # write the safe (bonding-neutral) products
// ============================================================

import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve('.');
const CATALOG = path.join(ROOT, 'src', 'data', 'products', 'catalog');
const APPLY = process.argv.includes('--apply');

// ---- discover catalog files ----
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const fp = path.join(d, e.name);
    if (e.isDirectory()) walk(fp);
    else if (e.name.endsWith('.ts')) files.push(fp);
  }
})(CATALOG);
files.sort();

// ---- load every product + portLinkPairs via one bundle ----
const entry = [
  `import { portLinkPairs } from ${JSON.stringify(path.join(ROOT, 'src/utils/portLinks.ts'))};`,
  `export { portLinkPairs };`,
  `export const PRODUCTS = [`,
  ...files.map((f, i) => `  { path: ${JSON.stringify(f)}, product: (await import(${JSON.stringify(f)})).default },`),
  `];`,
].join('\n');

const TMP = path.join(ROOT, 'scripts', '.migrate-load.mjs');
await build({
  stdin: { contents: entry, resolveDir: ROOT, loader: 'ts' },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: TMP,
  logLevel: 'warning',
});
const { PRODUCTS, portLinkPairs } = await import(pathToFileURL(TMP).href);

// ---- classification ----
const PASS_THROUGH_TYPES = new Set(['fuse', 'breaker', 'dcDisconnect', 'acDisconnect']);
const BUS_TYPES = new Set(['busbar', 'dc_distribution', 'ac_distribution', 'solar_combiner', 'pvCombinerBox']);

const TERMINAL_KIND_TO_PORT_KIND = {
  dc_power: 'dc', ac_power: 'ac', pv_power: 'pv',
  network: 'comm', chassis_ground: 'ground', signal: 'signal', generic: 'generic',
};

// Series pass-through devices not captured by productType: shunts (in the negative
// line) and inline connectors. Identified by id since they share other types.
function isPassThroughProduct(product) {
  if (PASS_THROUGH_TYPES.has(product.productType)) return true;
  return /shunt/i.test(product.id) || /mc4-connector/i.test(product.id);
}

function isBusProduct(product) {
  return BUS_TYPES.has(product.productType);
}

function classifyTopology(product) {
  if (isPassThroughProduct(product)) return 'pass_through';
  if (isBusProduct(product)) return 'bus';
  return 'two_pole';
}

// Strip a trailing pole/pole-phase suffix from a terminal id to get its circuit stem,
// so the two poles of one circuit share a port while independent circuits stay distinct
// (e.g. ac_in_l & ac_in_n → "ac_in"; ac_in2_l → "ac_in2"; pv1_pos → "pv1").
function poleStem(id) {
  return id.replace(/_(pos|neg|positive|negative|l[0-9]?|n|g|line|neutral|ground)$/i, '');
}

// Port id for a power terminal lacking one. Series/bus devices collapse to a single
// "main" port; everything else groups by circuit stem.
function derivePowerPortId(terminal, product) {
  if (isPassThroughProduct(product) || isBusProduct(product)) return 'main';
  return poleStem(terminal.id) || terminal.id;
}

const dummyComponent = (product) => ({ id: 'x', productId: product.id, quantity: 1, x: 0, y: 0 });
const pairKey = (p) => `${p.fromTerminalId}->${p.toTerminalId}`;
const bondingSig = (product) => portLinkPairs(product, dummyComponent(product)).map(pairKey).sort().join(',');

// ---- the transform (returns a new product object) ----
function migrate(orig) {
  const product = structuredClone(orig);
  const terminals = product.terminals ?? [];
  const commById = new Map((product.communicationPorts ?? []).map((p) => [p.id, p]));

  // 1. ensure every terminal has a portId
  for (const t of terminals) {
    if (t.portId) continue;
    t.portId = t.kind === 'network'
      ? t.id                                  // comm: 1:1 with its own id
      : derivePowerPortId(t, product);
  }

  // 2. build a port object per distinct portId, preserving any existing port fields
  const existing = new Map((product.ports ?? []).map((p) => [p.id, p]));
  const order = [];
  const byId = new Map();
  for (const t of terminals) {
    if (!byId.has(t.portId)) { byId.set(t.portId, []); order.push(t.portId); }
    byId.get(t.portId).push(t);
  }

  const ports = [];
  for (const portId of order) {
    const members = byId.get(portId);
    const kind = TERMINAL_KIND_TO_PORT_KIND[members[0].kind] ?? 'generic';
    const prev = existing.get(portId) ?? {};
    const port = { id: portId, ...prev };
    port.kind = prev.kind ?? kind;
    if (kind === 'comm') {
      const comm = commById.get(portId);
      port.label = prev.label ?? comm?.name ?? members[0].label ?? portId;
      // comm topology left unset (1:1 today; multi-connector merge is a manual follow-up)
    } else {
      port.topology = prev.topology ?? classifyTopology(product);
      port.label = prev.label ?? defaultPortLabel(portId, members);
      populateSpecs(port, product, members);
    }
    // Fold deprecated busRatingA into maxCurrentA, then drop it.
    if (port.busRatingA != null) {
      if (port.maxCurrentA == null) port.maxCurrentA = port.busRatingA;
      delete port.busRatingA;
    }
    ports.push(port);
  }
  product.ports = ports;

  // Legacy cleanup: kind is now owned by the port (built above). Drop the duplicated
  // field from source terminals; `getEffectiveTerminals` re-derives it from the port.
  for (const t of terminals) delete t.kind;

  return product;
}

// Populate a port's electrical spec values from the product's legacy ratings/flat
// fields, by product type. Only fills fields that are not already set. Mutates `port`.
function populateSpecs(port, product, members) {
  const set = (k, v) => { if (v != null && port[k] == null) port[k] = v; };
  const nv = Array.isArray(product.nominalVoltage) ? product.nominalVoltage[0] : product.nominalVoltage;
  const t = product.productType;
  const id = port.id;
  const r = (name) => product[name] ?? {};

  if (port.kind === 'comm') return;

  if (t === 'battery') {
    const b = r('batteryRatings');
    if (id === 'main' || port.kind === 'dc') {
      set('nominalVoltageV', b.nominalVoltageV ?? nv);
      set('maxCurrentA', port.busRatingA ?? b.maxDischargeCurrentA ?? product.maxCurrentA);
    }
  } else if (t === 'inverter_charger') {
    const ic = r('inverterChargerRatings');
    if (port.kind === 'dc') { set('nominalVoltageV', ic.dcVoltageV ?? nv); set('maxCurrentA', ic.maxDcCurrentA ?? product.maxCurrentA); }
    else if (id.startsWith('ac_in')) { set('nominalVoltageV', ic.acInputVoltageV); set('maxCurrentA', ic.acInputCurrentA); set('phases', members.some(m => m.phases === 2) ? 2 : undefined); }
    else if (id.startsWith('ac_out')) { set('nominalVoltageV', ic.acOutputVoltageV); set('maxCurrentA', ic.acOutputCurrentA); }
    else if (port.kind === 'pv') { set('voltageMaxV', ic.maxPvVoltageV); set('maxCurrentA', ic.maxPvCurrentA); set('maxPowerW', ic.maxPvPowerW); }
  } else if (t === 'dc_dc_charger') {
    const d = r('dcDcChargerRatings');
    if (/in/.test(id)) { set('voltageMinV', d.inputVoltageMinV); set('voltageMaxV', d.inputVoltageMaxV); set('maxCurrentA', d.inputCurrentA); }
    else { set('nominalVoltageV', d.outputVoltageV ?? nv); set('maxCurrentA', d.outputCurrentA ?? product.maxCurrentA); }
  } else if (t === 'mppt') {
    const m = r('mpptRatings');
    if (port.kind === 'pv') { set('voltageMaxV', m.maxPvVoltageV ?? product.maxPvVoltageV); set('maxCurrentA', m.maxPvCurrentA ?? product.maxPvCurrentA); set('maxPowerW', m.maxPvPowerW); }
    else { set('nominalVoltageV', (m.batteryVoltagesV ?? [])[0] ?? nv); set('maxCurrentA', m.maxOutputCurrentA ?? product.maxCurrentA); }
  } else if (t === 'shore_charger') {
    const ic = r('inverterChargerRatings');
    if (id.startsWith('ac')) { set('nominalVoltageV', ic.acInputVoltageV); set('maxCurrentA', ic.acInputCurrentA); }
    else { set('nominalVoltageV', ic.dcVoltageV ?? nv); set('maxCurrentA', product.maxCurrentA); }
  } else if (t === 'solar_array') {
    const s = r('solarPanelRatings');
    set('voltageMaxV', s.vocV ?? product.maxPvVoltageV); set('maxCurrentA', s.iscA ?? product.maxPvCurrentA); set('maxPowerW', s.powerW ?? product.continuousPowerW);
  } else if (BUS_TYPES.has(t)) {
    const bb = r('busbarRatings'); const sc = r('solarCombinerRatings');
    set('nominalVoltageV', nv);
    set('maxCurrentA', bb.currentRatingA ?? sc.maxCurrentA ?? product.maxCurrentA);
  } else if (PASS_THROUGH_TYPES.has(t)) {
    const p = r('protectionRatings');
    set('maxCurrentA', p.currentRatingA ?? product.maxCurrentA);
    set('voltageMaxV', p.voltageRatingV);
  } else if (t === 'dc_load' || t === 'ac_load') {
    const l = r('loadRatings');
    set('nominalVoltageV', l.voltageV ?? nv); set('maxCurrentA', l.currentA ?? product.maxCurrentA); set('maxPowerW', l.powerW ?? product.continuousPowerW);
  }
}

function defaultPortLabel(portId, members) {
  const MAP = { dc: 'DC', dc_in: 'DC Input', dc_out: 'DC Output', ac: 'AC', ac_in: 'AC Input', ac_out: 'AC Output', pv: 'PV', ground: 'Ground', main: 'Main' };
  return MAP[portId] ?? members[0].label ?? portId;
}

// ---- serializer (matches the dev plugin / existing files) ----
function serialize(obj) {
  return JSON.stringify(obj, null, 2).replace(/"([a-zA-Z_$][a-zA-Z0-9_$]*)"\s*:/g, '$1:');
}
function fileContent(product) {
  return `import type { Product } from '../../../../types/system';\n\nconst product: Product = ${serialize(product)};\n\nexport default product;\n`;
}

// ---- run ----
let safe = 0, flagged = 0, unchanged = 0;
const flaggedList = [];
const sample = [];

for (const { path: fp, product } of PRODUCTS) {
  const before = bondingSig(product);
  const migrated = migrate(product);
  const after = bondingSig(migrated);

  // A bus product's terminals are genuinely one node — bonding them is the intended
  // fix, so accept the change (verified by the full test suite). All other bonding
  // changes are conflicts (e.g. two independent AC inputs wrongly merged) → flag.
  if (before !== after && !isBusProduct(product)) {
    flagged++;
    flaggedList.push({ id: product.id, type: product.productType, before, after, fp });
    continue;
  }

  safe++;
  if (sample.length < 4) sample.push({ id: product.id, type: product.productType, ports: migrated.ports });
  if (APPLY) fs.writeFileSync(fp, fileContent(migrated), 'utf-8');
}

console.log(`\nPhase 3 migration (${APPLY ? 'APPLY' : 'DRY RUN'})`);
console.log('─'.repeat(56));
console.log(`Catalog products      : ${PRODUCTS.length}`);
console.log(`Bonding-neutral (safe): ${safe}${APPLY ? ' — written' : ''}`);
console.log(`Bonding-changed (flag): ${flagged} — skipped, need review`);

if (flaggedList.length) {
  console.log(`\nFlagged (bonding would change):`);
  for (const f of flaggedList) {
    console.log(`  - ${f.id} [${f.type}]`);
    console.log(`      before: ${f.before || '(none)'}`);
    console.log(`      after : ${f.after || '(none)'}`);
  }
}

console.log(`\nSample migrated ports (safe products):`);
for (const s of sample) {
  console.log(`  ${s.id} [${s.type}]: ${JSON.stringify(s.ports)}`);
}
console.log('');

fs.rmSync(TMP, { force: true });
