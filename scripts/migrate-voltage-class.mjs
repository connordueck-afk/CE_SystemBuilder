// ============================================================
// scripts/migrate-voltage-class.mjs — Phase 4 voltageClass lift
// ============================================================
// Lifts the per-terminal `voltageClass` (legacy source of truth) up onto each
// owning Port, making the port authoritative for voltage class / service. The
// terminal field is left in place as a deprecated fallback (physical removal is
// a separate, deferred pass — see PORT_REFACTOR_PLAN.md).
//
// Rule per port: collect the distinct non-null voltageClass values across the
// port's member terminals.
//   - exactly one  -> set port.voltageClass to it (behaviour-neutral: the value
//                     getEffectiveTerminals already stamps via the fallback).
//   - zero         -> leave unset (comm/ground/unclassified ports).
//   - more than one -> FLAG and skip (manual review — never guess a service).
// Ports that already declare voltageClass are preserved untouched.
//
// Usage:
//   node scripts/migrate-voltage-class.mjs          # dry run: report only
//   node scripts/migrate-voltage-class.mjs --apply  # write the safe products
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

// ---- load every product via one bundle ----
const entry = [
  `export const PRODUCTS = [`,
  ...files.map((f) => `  { path: ${JSON.stringify(f)}, product: (await import(${JSON.stringify(f)})).default },`),
  `];`,
].join('\n');

const TMP = path.join(ROOT, 'scripts', '.migrate-vc-load.mjs');
await build({
  stdin: { contents: entry, resolveDir: ROOT, loader: 'ts' },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: TMP,
  logLevel: 'warning',
});
const { PRODUCTS } = await import(pathToFileURL(TMP).href);

// ---- the transform (returns { product, changed, flagged } ) ----
function migrate(orig) {
  const product = structuredClone(orig);
  const terminals = product.terminals ?? [];
  const ports = product.ports ?? [];
  const flags = [];
  let changed = false;

  for (const port of ports) {
    if (port.voltageClass != null) continue; // already declared — preserve
    const members = terminals.filter((t) => t.portId === port.id);
    const classes = [...new Set(members.map((t) => t.voltageClass).filter(Boolean))];

    if (classes.length === 0) continue;
    if (classes.length > 1) {
      flags.push({ portId: port.id, classes });
      continue;
    }
    port.voltageClass = classes[0];
    changed = true;
  }

  return { product, changed, flags };
}

// ---- serializer (matches the dev plugin / existing files) ----
function serialize(obj) {
  return JSON.stringify(obj, null, 2).replace(/"([a-zA-Z_$][a-zA-Z0-9_$]*)"\s*:/g, '$1:');
}
function fileContent(product) {
  return `import type { Product } from '../../../../types/system';\n\nconst product: Product = ${serialize(product)};\n\nexport default product;\n`;
}

// ---- run ----
let changedCount = 0, unchanged = 0, flaggedCount = 0;
const flaggedList = [];
const sample = [];

for (const { path: fp, product } of PRODUCTS) {
  const { product: migrated, changed, flags } = migrate(product);
  if (flags.length) { flaggedCount++; flaggedList.push({ id: product.id, fp, flags }); }
  if (!changed) { unchanged++; continue; }
  changedCount++;
  if (sample.length < 6) {
    sample.push({ id: product.id, ports: migrated.ports.map((p) => ({ id: p.id, kind: p.kind, voltageClass: p.voltageClass })) });
  }
  if (APPLY) fs.writeFileSync(fp, fileContent(migrated), 'utf-8');
}

console.log(`\nPhase 4 voltageClass lift (${APPLY ? 'APPLY' : 'DRY RUN'})`);
console.log('─'.repeat(56));
console.log(`Catalog products       : ${PRODUCTS.length}`);
console.log(`Ports populated (write): ${changedCount}${APPLY ? ' — written' : ''}`);
console.log(`Unchanged              : ${unchanged}`);
console.log(`Products with conflicts: ${flaggedCount}`);

if (flaggedList.length) {
  console.log(`\nConflicting ports (members disagree — left unset):`);
  for (const f of flaggedList) {
    for (const flag of f.flags) console.log(`  - ${f.id} :: port "${flag.portId}" -> ${flag.classes.join(' | ')}`);
  }
}

console.log(`\nSample populated ports:`);
for (const s of sample) {
  console.log(`  ${s.id}: ${s.ports.map((p) => `${p.id}=${p.voltageClass ?? '—'}(${p.kind})`).join(', ')}`);
}
console.log('');

fs.rmSync(TMP, { force: true });
