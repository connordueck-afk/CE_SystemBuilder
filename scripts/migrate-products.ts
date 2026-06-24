// ============================================================
// scripts/migrate-products.ts
// Reads all existing product arrays and writes one .ts file
// per product under src/data/products/catalog/<subdir>/<id>.ts
//
// Run from project root:
//   npx esbuild scripts/migrate-products.ts --bundle --platform=node --format=esm --outfile=scripts/.migrate.mjs && node scripts/.migrate.mjs
//
// The existing product files are NOT modified. Validate the
// output, then flip index.ts to use import.meta.glob.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';

import { batteries } from '../src/data/products/batteries';
import { mppts } from '../src/data/products/mppts';
import { inverterChargers } from '../src/data/products/inverterChargers';
import { dcDcChargers } from '../src/data/products/dcDcChargers';
import { acChargers } from '../src/data/products/acChargers';
import { solarArrays } from '../src/data/products/solar';
import { distribution } from '../src/data/products/distribution';
import { protection } from '../src/data/products/protection';
import { monitoring } from '../src/data/products/monitoring';
import { accessories } from '../src/data/products/accessories';
import { kisaeProducts } from '../src/data/products/kisae';
import { residentialHybridInverters } from '../src/data/products/residentialHybridInverters';
import { connectionPoints } from '../src/data/products/connectionPoints';
import { communicationProducts } from '../src/data/products/communication';
import { ALL_PRODUCTS } from '../src/data/products/index';
import type { Product } from '../src/types/system';

// ---- Subdirectory mapping (source array → catalog subdir) ----

const SOURCE_MAP: Array<{ products: Product[]; dir: string }> = [
  { products: batteries,                dir: 'batteries' },
  { products: mppts,                    dir: 'mppts' },
  { products: inverterChargers,         dir: 'inverter-chargers' },
  { products: dcDcChargers,             dir: 'dc-dc-chargers' },
  { products: acChargers,               dir: 'ac-chargers' },
  { products: solarArrays,              dir: 'solar' },
  { products: distribution,             dir: 'distribution' },
  { products: protection,               dir: 'protection' },
  { products: monitoring,               dir: 'monitoring' },
  { products: accessories,              dir: 'accessories' },
  { products: kisaeProducts,            dir: 'kisae' },
  { products: residentialHybridInverters, dir: 'residential' },
  { products: connectionPoints,         dir: 'connection-points' },
  { products: communicationProducts,    dir: 'communication' },
];

// Build id → subdirectory lookup from the raw (pre-enrichment) source arrays
const idToDir = new Map<string, string>();
for (const { products, dir } of SOURCE_MAP) {
  for (const p of products) {
    if (idToDir.has(p.id)) {
      console.warn(`WARN: duplicate id "${p.id}" found in source arrays`);
    }
    idToDir.set(p.id, dir);
  }
}

// ---- Serialization ----

function serialize(obj: unknown): string {
  // JSON.stringify produces valid TypeScript. Strip quotes from identifier
  // keys to produce idiomatic TS object literal syntax.
  return JSON.stringify(obj, null, 2)
    .replace(/"([a-zA-Z_$][a-zA-Z0-9_$]*)"\s*:/g, '$1:');
}

function generateFileContent(product: Product): string {
  return [
    `import type { Product } from '../../../../types/system';`,
    ``,
    `const product: Product = ${serialize(product)};`,
    ``,
    `export default product;`,
    ``,
  ].join('\n');
}

// ---- Main ----

const ROOT = process.cwd();
const CATALOG_ROOT = path.join(ROOT, 'src', 'data', 'products', 'catalog');

console.log(`\nMigrating ${ALL_PRODUCTS.length} products to ${CATALOG_ROOT}\n`);

let written = 0;
let skipped = 0;
const unmapped: string[] = [];

for (const product of ALL_PRODUCTS) {
  const subdir = idToDir.get(product.id);

  if (!subdir) {
    unmapped.push(product.id);
    continue;
  }

  const dir = path.join(CATALOG_ROOT, subdir);
  fs.mkdirSync(dir, { recursive: true });

  // Sanitize id for use as filename (ids are already kebab-case, safe for fs)
  const filename = `${product.id}.ts`;
  const filepath = path.join(dir, filename);

  if (fs.existsSync(filepath)) {
    console.log(`  SKIP (exists): ${subdir}/${filename}`);
    skipped++;
    continue;
  }

  fs.writeFileSync(filepath, generateFileContent(product), 'utf-8');
  console.log(`  WRITE: ${subdir}/${filename}`);
  written++;
}

// ---- Summary ----

console.log(`\n${'─'.repeat(50)}`);
console.log(`Source product count : ${idToDir.size}`);
console.log(`ALL_PRODUCTS count   : ${ALL_PRODUCTS.length}`);
console.log(`Files written        : ${written}`);
console.log(`Files skipped        : ${skipped}`);

if (unmapped.length > 0) {
  console.warn(`\nWARN: ${unmapped.length} products in ALL_PRODUCTS had no source mapping:`);
  for (const id of unmapped) console.warn(`  - ${id}`);
}

if (ALL_PRODUCTS.length !== idToDir.size) {
  console.warn(`\nWARN: count mismatch — ALL_PRODUCTS (${ALL_PRODUCTS.length}) !== source arrays (${idToDir.size})`);
  console.warn('This may indicate products added/removed by applyCommPorts or duplicates.');
}

console.log(`\nDone. Validate the output in src/data/products/catalog/, then flip index.ts.\n`);
