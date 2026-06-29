// ============================================================
// tests/run.mjs — test bundler + runner
// ============================================================
// The catalog entry point (src/data/products/index.ts) discovers products with
// Vite's `import.meta.glob`, which only exists under Vite. esbuild/node has no
// such API, so this runner bundles the tests with a small plugin that statically
// expands that one glob call into real imports at bundle time. Keeps the harness
// dependency-free (esbuild is already present via Vite). Run with `npm test`.
// ============================================================

import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve('.');
const OUT = path.join(root, 'tests', '.electrical.out.mjs');

/**
 * Expand `import.meta.glob<...>('<glob>', { eager: true })` inside the catalog
 * index into eager static namespace imports. Only the single known usage pattern
 * (eager, recursive `./catalog/**\/*.ts`) is handled.
 */
const importMetaGlobPlugin = {
  name: 'import-meta-glob',
  setup(b) {
    b.onLoad({ filter: /src[\\/]data[\\/]products[\\/]index\.ts$/ }, (args) => {
      const dir = path.dirname(args.path);
      const src = fs.readFileSync(args.path, 'utf8');

      const catalogDir = path.join(dir, 'catalog');
      const files = [];
      (function walk(d) {
        for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
          const fp = path.join(d, entry.name);
          if (entry.isDirectory()) walk(fp);
          else if (entry.name.endsWith('.ts')) files.push(fp);
        }
      })(catalogDir);

      const rels = files
        .map((f) => './' + path.relative(dir, f).split(path.sep).join('/'))
        .sort();
      const imports = rels.map((r, i) => `import * as __glob${i} from ${JSON.stringify(r)};`).join('\n');
      const obj = `{\n${rels.map((r, i) => `  ${JSON.stringify(r)}: __glob${i},`).join('\n')}\n}`;

      const replaced = src.replace(
        /import\.meta\.glob\s*(?:<[^>]*>)?\s*\([\s\S]*?\{\s*eager:\s*true\s*\}\s*\)/,
        obj
      );
      if (replaced === src) {
        throw new Error('import-meta-glob plugin: could not find the glob call to expand');
      }

      return { contents: `${imports}\n${replaced}`, loader: 'ts', resolveDir: dir };
    });
  },
};

await build({
  entryPoints: [path.join(root, 'tests', 'electrical.test.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: OUT,
  plugins: [importMetaGlobPlugin],
  logLevel: 'warning',
});

await import(pathToFileURL(OUT).href);
