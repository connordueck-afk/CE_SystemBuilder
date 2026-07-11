const fs = require('fs');
const path = require('path');
const { DOMImplementation, XMLSerializer } = require('@xmldom/xmldom');

global.document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
global.XMLSerializer = XMLSerializer;

const probeElement = global.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
const elementProto = Object.getPrototypeOf(probeElement);
if (!elementProto.append) {
  elementProto.append = function append(...nodes) {
    for (const node of nodes) {
      this.appendChild(typeof node === 'string' ? global.document.createTextNode(node) : node);
    }
  };
}
if (!elementProto.prepend) {
  elementProto.prepend = function prepend(...nodes) {
    for (const node of nodes.reverse()) {
      this.insertBefore(typeof node === 'string' ? global.document.createTextNode(node) : node, this.firstChild);
    }
  };
}
if (!elementProto.remove) {
  elementProto.remove = function remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}

const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');

pdfjs.GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/legacy/build/pdf.worker.js');

const manualsDir = path.resolve('ProductManuals', 'Victron');
const outDir = path.join(manualsDir, 'SVGImages');
const pageDir = path.join(outDir, '_page1-svg');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function safeName(name) {
  return name
    .replace(/\.pdf$/i, '')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^-+|-+$/g, '');
}

function countMatches(text, regex) {
  return (text.match(regex) || []).length;
}

async function convertFirstPage(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({
    data,
    disableFontFace: true,
    useSystemFonts: false,
  }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  const opList = await page.getOperatorList();
  const svgGfx = new pdfjs.SVGGraphics(page.commonObjs, page.objs);
  const svg = await svgGfx.getSVG(opList, viewport);
  const serialized = new XMLSerializer().serializeToString(svg);
  await doc.destroy();
  return { svg: serialized, width: viewport.width, height: viewport.height };
}

async function main() {
  ensureDir(outDir);
  ensureDir(pageDir);

  const pdfs = fs
    .readdirSync(manualsDir)
    .filter((name) => name.toLowerCase().endsWith('.pdf'))
    .sort((a, b) => a.localeCompare(b));

  const results = [];

  for (const pdf of pdfs) {
    const pdfPath = path.join(manualsDir, pdf);
    const base = `Victron_${safeName(pdf)}`;
    const pageSvgPath = path.join(pageDir, `${base}_page-1.svg`);

    try {
      const { svg, width, height } = await convertFirstPage(pdfPath);
      fs.writeFileSync(pageSvgPath, svg, 'utf8');

      const imageCount = countMatches(svg, /<image\b/gi);
      const vectorCount =
        countMatches(svg, /<path\b/gi) +
        countMatches(svg, /<rect\b/gi) +
        countMatches(svg, /<circle\b/gi) +
        countMatches(svg, /<polygon\b/gi) +
        countMatches(svg, /<polyline\b/gi) +
        countMatches(svg, /<line\b/gi);

      results.push({
        manual: pdf,
        pageSvg: path.relative(outDir, pageSvgPath).replace(/\\/g, '/'),
        width: Math.round(width * 100) / 100,
        height: Math.round(height * 100) / 100,
        vectorElements: vectorCount,
        imageElements: imageCount,
        result: imageCount === 0 && vectorCount > 0 ? 'page-1-vector-svg' : 'needs-review',
      });
      console.log(`converted: ${pdf}`);
    } catch (error) {
      results.push({
        manual: pdf,
        pageSvg: '',
        width: '',
        height: '',
        vectorElements: 0,
        imageElements: 0,
        result: 'conversion-failed',
        notes: error && error.stack ? error.stack.split('\n')[0] : String(error),
      });
      console.error(`failed: ${pdf}: ${error.message}`);
    }
  }

  const csvHeader = ['manual', 'pageSvg', 'width', 'height', 'vectorElements', 'imageElements', 'result', 'notes'];
  const csv = [
    csvHeader.join(','),
    ...results.map((row) =>
      csvHeader
        .map((key) => {
          const value = row[key] == null ? '' : String(row[key]);
          return `"${value.replace(/"/g, '""')}"`;
        })
        .join(','),
    ),
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'page1-svg-conversion-results.csv'), csv, 'utf8');

  const summary = [
    '# Victron Page 1 SVG Conversion Results',
    '',
    'These files are page-1 vector conversions used as extraction intermediates.',
    'They are not yet guaranteed to be tightly cropped standalone product-only SVGs.',
    '',
    '| Manual | Result | Vector Elements | Image Elements | Page SVG |',
    '|---|---|---:|---:|---|',
    ...results.map(
      (row) =>
        `| ${row.manual.replace(/\|/g, '\\|')} | ${row.result} | ${row.vectorElements} | ${row.imageElements} | ${row.pageSvg ? `\`${row.pageSvg}\`` : ''} |`,
    ),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'extraction-results.md'), summary, 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
