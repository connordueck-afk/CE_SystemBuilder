// ============================================================
// vite-plugin-product-builder.ts
// Dev-only Vite plugin that adds local file I/O API endpoints
// for the product builder tool at /__dev/products/*.
// Only active during `vite dev` — never ships in a build.
// ============================================================

import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

// ---- Types ----

interface ProductListEntry {
  id: string;
  subdir: string;
}

// ---- Helpers ----

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

function json(res: ServerResponse, data: unknown, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function err(res: ServerResponse, message: string, status = 500) {
  json(res, { error: message }, status);
}

function serialize(obj: unknown): string {
  return JSON.stringify(obj, null, 2)
    .replace(/"([a-zA-Z_$][a-zA-Z0-9_$]*)"\s*:/g, '$1:');
}

function generateProductFile(product: unknown): string {
  return [
    `import type { Product } from '../../../../types/system';`,
    ``,
    `const product: Product = ${serialize(product)};`,
    ``,
    `export default product;`,
    ``,
  ].join('\n');
}

// ---- List catalog product files ----

function listCatalogProducts(catalogRoot: string): ProductListEntry[] {
  const entries: ProductListEntry[] = [];
  if (!fs.existsSync(catalogRoot)) return entries;
  for (const subdir of fs.readdirSync(catalogRoot)) {
    const dirPath = path.join(catalogRoot, subdir);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    for (const file of fs.readdirSync(dirPath)) {
      if (!file.endsWith('.ts')) continue;
      entries.push({ id: file.slice(0, -3), subdir });
    }
  }
  return entries.sort((a, b) => a.subdir.localeCompare(b.subdir) || a.id.localeCompare(b.id));
}

// ---- List SVG assets ----

function listSvgs(imagesRoot: string, rel = ''): string[] {
  const results: string[] = [];
  if (!fs.existsSync(imagesRoot)) return results;
  for (const entry of fs.readdirSync(imagesRoot)) {
    const fullPath = path.join(imagesRoot, entry);
    const relPath = rel ? `${rel}/${entry}` : entry;
    if (fs.statSync(fullPath).isDirectory()) {
      results.push(...listSvgs(fullPath, relPath));
    } else if (entry.endsWith('.svg')) {
      results.push(relPath);
    }
  }
  return results.sort();
}

// ---- Plugin ----

export function productBuilderPlugin(): Plugin {
  return {
    name: 'product-builder',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/__dev/')) return next();

        const root = server.config.root;
        const catalogRoot = path.join(root, 'src', 'data', 'products', 'catalog');
        const imagesRoot = path.join(root, 'public', 'product-images');

        const url = new URL(req.url, `http://localhost`);
        const pathname = url.pathname;

        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
          res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST', 'Access-Control-Allow-Headers': 'Content-Type' });
          res.end();
          return;
        }

        try {
          // GET /__dev/products/list
          if (req.method === 'GET' && pathname === '/__dev/products/list') {
            return json(res, listCatalogProducts(catalogRoot));
          }

          // GET /__dev/products/svgs
          if (req.method === 'GET' && pathname === '/__dev/products/svgs') {
            return json(res, listSvgs(imagesRoot));
          }

          // POST /__dev/products/save  body: { id, subdir, product }
          if (req.method === 'POST' && pathname === '/__dev/products/save') {
            const body = await readBody(req) as { id: string; subdir: string; product: unknown };
            const { id, subdir, product } = body;

            if (!id || !subdir || !product) return err(res, 'Missing id, subdir, or product', 400);

            const dir = path.join(catalogRoot, subdir);
            fs.mkdirSync(dir, { recursive: true });

            const filePath = path.join(dir, `${id}.ts`);
            fs.writeFileSync(filePath, generateProductFile(product), 'utf-8');

            // Tell Vite to invalidate the module so HMR picks up the change
            const moduleId = `/src/data/products/catalog/${subdir}/${id}.ts`;
            const mod = server.moduleGraph.getModuleById(moduleId);
            if (mod) server.moduleGraph.invalidateModule(mod);

            return json(res, { ok: true, path: filePath });
          }

          // POST /__dev/products/upload-svg  body: { filename, subdir?, content }
          if (req.method === 'POST' && pathname === '/__dev/products/upload-svg') {
            const body = await readBody(req) as { filename: string; subdir?: string; content: string };
            const { content } = body;

            if (!body.filename || !content) return err(res, 'Missing filename or content', 400);
            if (!content.includes('<svg')) return err(res, 'File does not look like an SVG', 400);

            // Sanitize filename: strip any path, force .svg extension
            let filename = path.basename(body.filename);
            if (!filename.toLowerCase().endsWith('.svg')) filename += '.svg';

            // Sanitize subdir: allow nested folders but no traversal
            const subdir = (body.subdir ?? '')
              .replace(/\\/g, '/')
              .split('/')
              .map(seg => seg.replace(/[^a-zA-Z0-9_-]/g, ''))
              .filter(Boolean)
              .join('/');

            const destDir = subdir ? path.join(imagesRoot, subdir) : imagesRoot;
            // Guard against escaping the images root
            if (!path.resolve(destDir).startsWith(path.resolve(imagesRoot))) {
              return err(res, 'Invalid subdir', 400);
            }

            fs.mkdirSync(destDir, { recursive: true });
            const filePath = path.join(destDir, filename);
            fs.writeFileSync(filePath, content, 'utf-8');

            const rel = subdir ? `${subdir}/${filename}` : filename;
            return json(res, { ok: true, path: rel });
          }

          // POST /__dev/set-default-system  body: { system: SystemDesign, target: string }
          // target: 'default' | 'simple-12v' | 'full-12v' | 'offgrid-48v'
          if (req.method === 'POST' && pathname === '/__dev/set-default-system') {
            const body = await readBody(req) as { system: unknown; target?: string };
            if (!body.system) return err(res, 'Missing system', 400);

            const target = body.target ?? 'default';

            if (target === 'default') {
              const content = [
                `import type { SystemDesign } from '../types/system';`,
                ``,
                `// Last pushed from canvas: ${new Date().toISOString()}`,
                `export const DEFAULT_SYSTEM: SystemDesign = ${serialize(body.system)};`,
                ``,
              ].join('\n');
              const filePath = path.join(root, 'src', 'data', 'defaultSystem.ts');
              fs.writeFileSync(filePath, content, 'utf-8');
              const mod = server.moduleGraph.getModuleById('/src/data/defaultSystem.ts');
              if (mod) server.moduleGraph.invalidateModule(mod);
              return json(res, { ok: true });
            }

            // Preset targets — patch the specific const inside presetSystems.ts
            const PRESET_CONST_MAP: Record<string, string> = {
              'simple-12v':  'SIMPLE_12V',
              'full-12v':    'FULL_12V',
              'offgrid-48v': 'OFFGRID_48V',
            };
            const constName = PRESET_CONST_MAP[target];
            if (!constName) return err(res, `Unknown target: ${target}`, 400);

            const presetsPath = path.join(root, 'src', 'data', 'presetSystems.ts');
            let src = fs.readFileSync(presetsPath, 'utf-8');

            // Replace: const NAME: SystemDesign = { ... }; (top-level braces only)
            const escaped = constName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(const ${escaped}: SystemDesign = )\\{[\\s\\S]*?\\n\\};`);
            const updated = src.replace(regex, `$1${serialize(body.system)};`);

            if (updated === src) return err(res, `Could not find 'const ${constName}: SystemDesign' in presetSystems.ts`, 500);

            fs.writeFileSync(presetsPath, updated, 'utf-8');
            const mod = server.moduleGraph.getModuleById('/src/data/presetSystems.ts');
            if (mod) server.moduleGraph.invalidateModule(mod);
            return json(res, { ok: true });
          }

          // POST /__dev/products/trim-svg  body: { imageUrl, viewBox: { x, y, w, h } }
          if (req.method === 'POST' && pathname === '/__dev/products/trim-svg') {
            const body = await readBody(req) as { imageUrl: string; viewBox: { x: number; y: number; w: number; h: number } };
            const { imageUrl, viewBox } = body;
            if (!imageUrl || !viewBox) return err(res, 'Missing imageUrl or viewBox', 400);

            // Strip the /product-images/ prefix and guard against path traversal
            const relPath = imageUrl.replace(/^\/product-images\//, '');
            const filePath = path.resolve(imagesRoot, relPath);
            if (!filePath.startsWith(path.resolve(imagesRoot))) return err(res, 'Invalid path', 400);
            if (!fs.existsSync(filePath)) return err(res, 'SVG file not found', 404);

            let svg = fs.readFileSync(filePath, 'utf-8');
            const newVB = `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`;

            if (/viewBox=/i.test(svg)) {
              svg = svg.replace(/viewBox=["'][^"']*["']/i, `viewBox="${newVB}"`);
            } else {
              // No existing viewBox — inject one into the opening <svg> tag
              svg = svg.replace(/<svg\b/i, `<svg viewBox="${newVB}"`);
            }

            fs.writeFileSync(filePath, svg, 'utf-8');
            return json(res, { ok: true, viewBox: newVB });
          }

          // DELETE /__dev/products/delete  body: { id, subdir }
          if (req.method === 'POST' && pathname === '/__dev/products/delete') {
            const body = await readBody(req) as { id: string; subdir: string };
            const { id, subdir } = body;
            const filePath = path.join(catalogRoot, subdir, `${id}.ts`);
            if (!fs.existsSync(filePath)) return err(res, 'File not found', 404);
            fs.unlinkSync(filePath);
            return json(res, { ok: true });
          }

          next();
        } catch (e) {
          err(res, String(e));
        }
      });
    },
  };
}
