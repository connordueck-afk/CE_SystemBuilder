// Diagnostic: Helios → DC+ busbar + DC- busbar. Why is there a fuse warning but no
// inline-fuse recommendation (icon)? Bundles src with the import.meta.glob plugin.
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve('.');
const OUT = path.join(ROOT, 'scripts', '.diag.mjs');

const globPlugin = {
  name: 'import-meta-glob',
  setup(b) {
    b.onLoad({ filter: /src[\\/]data[\\/]products[\\/]index\.ts$/ }, (args) => {
      const dir = path.dirname(args.path);
      const src = fs.readFileSync(args.path, 'utf8');
      const catalogDir = path.join(dir, 'catalog');
      const files = [];
      (function walk(d) {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
          const fp = path.join(d, e.name);
          if (e.isDirectory()) walk(fp); else if (e.name.endsWith('.ts')) files.push(fp);
        }
      })(catalogDir);
      const rels = files.map((f) => './' + path.relative(dir, f).split(path.sep).join('/')).sort();
      const imports = rels.map((r, i) => `import * as __g${i} from ${JSON.stringify(r)};`).join('\n');
      const obj = `{\n${rels.map((r, i) => `  ${JSON.stringify(r)}: __g${i},`).join('\n')}\n}`;
      const replaced = src.replace(/import\.meta\.glob\s*(?:<[^>]*>)?\s*\([\s\S]*?\{\s*eager:\s*true\s*\}\s*\)/, obj);
      return { contents: `${imports}\n${replaced}`, loader: 'ts', resolveDir: dir };
    });
  },
};

const entry = `
import { PRODUCT_MAP } from ${JSON.stringify(path.join(ROOT, 'src/data/products/index.ts'))};
import { analyzeSystemCircuits } from ${JSON.stringify(path.join(ROOT, 'src/utils/circuitAnalysis.ts'))};
import { buildProtectionRecommendations } from ${JSON.stringify(path.join(ROOT, 'src/utils/protectionRecommendations.ts'))};
import { generateWarnings } from ${JSON.stringify(path.join(ROOT, 'src/utils/electricalCalculations.ts'))};
import { DEFAULT_ASSUMPTIONS } from ${JSON.stringify(path.join(ROOT, 'src/data/electricalRules.ts'))};
import { getEffectiveTerminals } from ${JSON.stringify(path.join(ROOT, 'src/utils/effectiveTerminals.ts'))};
import { busTypeFromTerminal } from ${JSON.stringify(path.join(ROOT, 'src/utils/electricalNetlist.ts'))};

const bat = PRODUCT_MAP.get('discover-helios-ess-52-48-16000');
console.log('Helios effective terminals (id, kind, polarity, busType, OCP):');
for (const t of getEffectiveTerminals(bat, { id: 'b', productId: bat.id, quantity: 1, x: 0, y: 0 })) {
  if (t.kind === 'dc_power') console.log('  ', t.id, t.kind, t.polarity, busTypeFromTerminal(t), 'ocp=' + !!t.requiresOvercurrentProtection);
}

const system = {
  id: 's', name: 's', nominalVoltage: 48, assumptions: { ...DEFAULT_ASSUMPTIONS },
  createdAt: '', updatedAt: '',
  components: [
    { id: 'bat', productId: 'discover-helios-ess-52-48-16000', quantity: 1, x: 0, y: 0 },
    { id: 'busP', productId: 'dist-generic-busbar-5pt', quantity: 1, x: 200, y: 0, busPolarity: 'positive', inferredConnectionKind: 'dc_power', inferredPolarity: 'positive', inferredVoltageClass: 'dc_low_voltage' },
    { id: 'busN', productId: 'dist-generic-busbar-5pt', quantity: 1, x: 200, y: 200, busPolarity: 'negative', inferredConnectionKind: 'dc_power', inferredPolarity: 'negative', inferredVoltageClass: 'dc_low_voltage' },
    { id: 'load', productId: 'acc-dc-load-generic', quantity: 1, x: 400, y: 100, instanceMaxCurrentA: 50 },
  ],
  connections: [
    { id: 'c-pos', fromComponentId: 'bat', fromTerminalId: 'dc_pos_1', toComponentId: 'busP', toTerminalId: 'terminal_1', cableLengthFt: 2 },
    { id: 'c-neg', fromComponentId: 'bat', fromTerminalId: 'dc_neg_1', toComponentId: 'busN', toTerminalId: 'terminal_1', cableLengthFt: 2 },
    { id: 'c-load-pos', fromComponentId: 'busP', fromTerminalId: 'terminal_2', toComponentId: 'load', toTerminalId: 'dc_pos', cableLengthFt: 2 },
    { id: 'c-load-neg', fromComponentId: 'busN', fromTerminalId: 'terminal_2', toComponentId: 'load', toTerminalId: 'dc_neg', cableLengthFt: 2 },
  ],
};

const analysis = analyzeSystemCircuits(system, PRODUCT_MAP);
console.log('\\nConnection analysis:');
for (const [id, ctx] of analysis.connections) {
  console.log('  ', id, 'busType=' + ctx.busType, 'designA=' + ctx.designCurrentA, 'protReq=' + ctx.protectionRequired, 'protectedBy=' + ctx.protectedBy.length);
  for (const sp of ctx.sourceProtection ?? []) console.log('       src[' + sp.side + '] required=' + sp.required + ' protected=' + sp.protected + ' present=' + sp.sourcePresent);
}
const recs = buildProtectionRecommendations(system, PRODUCT_MAP);
console.log('\\nProtection recommendations (icons):', recs.length);
for (const r of recs) console.log('  ', r.connectionId, r.busType, r.message);

const warnings = generateWarnings(system, PRODUCT_MAP);
console.log('\\nSystem warnings:', warnings.length);
for (const w of warnings) console.log('  [' + w.severity + ']', w.code, '-', w.message);
`;

await build({ stdin: { contents: entry, resolveDir: ROOT, loader: 'ts' }, bundle: true, platform: 'node', format: 'esm', outfile: OUT, plugins: [globPlugin], logLevel: 'warning' });
await import(pathToFileURL(OUT).href);
fs.rmSync(OUT, { force: true });
