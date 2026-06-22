import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targets = [
  path.join(root, 'public', 'product-images', 'victron'),
  path.join(root, 'public', 'product-images', 'victron-smartsolar-mppt.svg'),
  path.join(root, 'public', 'product-images', 'fuse-midi.svg'),
  path.join(root, 'public', 'product-images', 'fuse-mega.svg'),
  path.join(root, 'public', 'product-images', 'fuse-anl.svg'),
  path.join(root, 'public', 'product-images', 'fuse-class-t.svg'),
  path.join(root, 'public', 'product-images', 'fuse-mrbf.svg'),
  path.join(root, 'public', 'product-images', 'breaker-dc-breaker.svg'),
  path.join(root, 'public', 'product-images', 'pv-disconnect.svg'),
  path.join(root, 'public', 'product-images', 'pv-branch-2-1.svg'),
  path.join(root, 'public', 'product-images', 'pv-branch-3-1.svg'),
  path.join(root, 'public', 'product-images', 'pv-branch-4-1.svg'),
];

const padding = 14;

function numberAttr(tag, name) {
  const match = tag.match(new RegExp(`${name}="([^"]+)"`));
  if (!match) return undefined;
  const value = Number.parseFloat(match[1]);
  return Number.isFinite(value) ? value : undefined;
}

function expand(box, minX, minY, maxX, maxY) {
  if (![minX, minY, maxX, maxY].every(Number.isFinite)) return box;
  return {
    minX: Math.min(box.minX, minX),
    minY: Math.min(box.minY, minY),
    maxX: Math.max(box.maxX, maxX),
    maxY: Math.max(box.maxY, maxY),
  };
}

function identity() {
  return [1, 0, 0, 1, 0, 0];
}

function multiply(left, right) {
  return [
    left[0] * right[0] + left[2] * right[1],
    left[1] * right[0] + left[3] * right[1],
    left[0] * right[2] + left[2] * right[3],
    left[1] * right[2] + left[3] * right[3],
    left[0] * right[4] + left[2] * right[5] + left[4],
    left[1] * right[4] + left[3] * right[5] + left[5],
  ];
}

function applyMatrix(matrix, x, y) {
  return {
    x: matrix[0] * x + matrix[2] * y + matrix[4],
    y: matrix[1] * x + matrix[3] * y + matrix[5],
  };
}

function transformedBox(matrix, minX, minY, maxX, maxY) {
  const points = [
    applyMatrix(matrix, minX, minY),
    applyMatrix(matrix, maxX, minY),
    applyMatrix(matrix, maxX, maxY),
    applyMatrix(matrix, minX, maxY),
  ];
  return {
    minX: Math.min(...points.map((point) => point.x)),
    minY: Math.min(...points.map((point) => point.y)),
    maxX: Math.max(...points.map((point) => point.x)),
    maxY: Math.max(...points.map((point) => point.y)),
  };
}

function numbers(value) {
  return (value.match(/[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi) ?? [])
    .map(Number)
    .filter(Number.isFinite);
}

function parseTransform(value) {
  if (!value) return identity();
  let matrix = identity();
  for (const match of value.matchAll(/(matrix|translate|scale)\(([^)]*)\)/g)) {
    const [, kind, raw] = match;
    const nums = numbers(raw);
    let next = identity();
    if (kind === 'matrix' && nums.length >= 6) {
      next = nums.slice(0, 6);
    } else if (kind === 'translate') {
      next = [1, 0, 0, 1, nums[0] ?? 0, nums[1] ?? 0];
    } else if (kind === 'scale') {
      next = [nums[0] ?? 1, 0, 0, nums[1] ?? nums[0] ?? 1, 0, 0];
    }
    matrix = multiply(matrix, next);
  }
  return matrix;
}

function attr(tag, name) {
  return tag.match(new RegExp(`${name}="([^"]+)"`))?.[1];
}

function parsePathBounds(d) {
  const tokens = d.match(/[a-zA-Z]|[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/g) ?? [];
  let box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  let command = '';
  let x = 0;
  let y = 0;
  let i = 0;

  function isCommand(token) {
    return /^[a-zA-Z]$/.test(token);
  }

  function readNumber() {
    if (i >= tokens.length || isCommand(tokens[i])) return undefined;
    const value = Number.parseFloat(tokens[i]);
    i += 1;
    return Number.isFinite(value) ? value : undefined;
  }

  while (i < tokens.length) {
    if (isCommand(tokens[i])) {
      command = tokens[i];
      i += 1;
    }

    const relative = command === command.toLowerCase();
    const op = command.toUpperCase();

    if (op === 'M' || op === 'L' || op === 'T') {
      const nx = readNumber();
      const ny = readNumber();
      if (nx == null || ny == null) continue;
      x = relative ? x + nx : nx;
      y = relative ? y + ny : ny;
      box = expand(box, x, y, x, y);
      if (op === 'M') command = relative ? 'l' : 'L';
    } else if (op === 'H') {
      const nx = readNumber();
      if (nx == null) continue;
      x = relative ? x + nx : nx;
      box = expand(box, x, y, x, y);
    } else if (op === 'V') {
      const ny = readNumber();
      if (ny == null) continue;
      y = relative ? y + ny : ny;
      box = expand(box, x, y, x, y);
    } else if (op === 'C') {
      for (let point = 0; point < 3; point += 1) {
        const nx = readNumber();
        const ny = readNumber();
        if (nx == null || ny == null) break;
        const px = relative ? x + nx : nx;
        const py = relative ? y + ny : ny;
        box = expand(box, px, py, px, py);
        if (point === 2) {
          x = px;
          y = py;
        }
      }
    } else if (op === 'S' || op === 'Q') {
      for (let point = 0; point < 2; point += 1) {
        const nx = readNumber();
        const ny = readNumber();
        if (nx == null || ny == null) break;
        const px = relative ? x + nx : nx;
        const py = relative ? y + ny : ny;
        box = expand(box, px, py, px, py);
        if (point === 1) {
          x = px;
          y = py;
        }
      }
    } else if (op === 'A') {
      const rx = readNumber();
      const ry = readNumber();
      readNumber();
      readNumber();
      readNumber();
      const nx = readNumber();
      const ny = readNumber();
      if (rx == null || ry == null || nx == null || ny == null) continue;
      x = relative ? x + nx : nx;
      y = relative ? y + ny : ny;
      box = expand(box, x - rx, y - ry, x + rx, y + ry);
    } else {
      i += 1;
    }
  }

  return box;
}

function collectBounds(svg) {
  let box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const body = svg.replace(/<defs[\s\S]*?<\/defs>/g, '');
  const stack = [identity()];

  function currentMatrix(tag) {
    return multiply(stack.at(-1) ?? identity(), parseTransform(attr(tag, 'transform')));
  }

  function includeTransformed(matrix, minX, minY, maxX, maxY) {
    const transformed = transformedBox(matrix, minX, minY, maxX, maxY);
    box = expand(box, transformed.minX, transformed.minY, transformed.maxX, transformed.maxY);
  }

  for (const rawTag of body.match(/<\/?[^>]+>/g) ?? []) {
    const tag = rawTag.trim();
    if (/^<\/g\b/.test(tag)) {
      if (stack.length > 1) stack.pop();
      continue;
    }
    if (/^<g\b/.test(tag)) {
      stack.push(currentMatrix(tag));
      if (!/\/>$/.test(tag)) continue;
      stack.pop();
      continue;
    }

    const matrix = currentMatrix(tag);
    if (/^<rect\b/.test(tag)) {
      const x = numberAttr(tag, 'x') ?? 0;
      const y = numberAttr(tag, 'y') ?? 0;
      const width = numberAttr(tag, 'width');
      const height = numberAttr(tag, 'height');
      if (width != null && height != null) includeTransformed(matrix, x, y, x + width, y + height);
    } else if (/^<circle\b/.test(tag)) {
      const cx = numberAttr(tag, 'cx');
      const cy = numberAttr(tag, 'cy');
      const r = numberAttr(tag, 'r');
      if (cx != null && cy != null && r != null) includeTransformed(matrix, cx - r, cy - r, cx + r, cy + r);
    } else if (/^<ellipse\b/.test(tag)) {
      const cx = numberAttr(tag, 'cx');
      const cy = numberAttr(tag, 'cy');
      const rx = numberAttr(tag, 'rx');
      const ry = numberAttr(tag, 'ry');
      if (cx != null && cy != null && rx != null && ry != null) includeTransformed(matrix, cx - rx, cy - ry, cx + rx, cy + ry);
    } else if (/^<line\b/.test(tag)) {
      const x1 = numberAttr(tag, 'x1');
      const y1 = numberAttr(tag, 'y1');
      const x2 = numberAttr(tag, 'x2');
      const y2 = numberAttr(tag, 'y2');
      if (x1 != null && y1 != null && x2 != null && y2 != null) {
        includeTransformed(matrix, Math.min(x1, x2), Math.min(y1, y2), Math.max(x1, x2), Math.max(y1, y2));
      }
    } else if (/^<polygon\b|^<polyline\b/.test(tag)) {
      const points = numbers(attr(tag, 'points') ?? '');
      for (let index = 0; index < points.length - 1; index += 2) {
        const point = applyMatrix(matrix, points[index], points[index + 1]);
        box = expand(box, point.x, point.y, point.x, point.y);
      }
    } else if (/^<path\b/.test(tag)) {
      const d = attr(tag, 'd');
      if (!d) continue;
      const pathBox = parsePathBounds(d);
      includeTransformed(matrix, pathBox.minX, pathBox.minY, pathBox.maxX, pathBox.maxY);
    }
  }

  return box;
}

function formatNumber(value) {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function normalizeSvg(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  if (original.includes('data:image/')) return { filePath, skipped: 'embedded raster' };

  const viewBox = original.match(/\bviewBox="([^"]+)"/)?.[1]?.split(/\s+/).map(Number);
  if (!viewBox || viewBox.length !== 4) return { filePath, skipped: 'missing viewBox' };

  const bounds = collectBounds(original);
  if (![bounds.minX, bounds.minY, bounds.maxX, bounds.maxY].every(Number.isFinite)) {
    return { filePath, skipped: 'no geometry' };
  }

  const minX = Math.max(viewBox[0], bounds.minX - padding);
  const minY = Math.max(viewBox[1], bounds.minY - padding);
  const maxX = Math.min(viewBox[0] + viewBox[2], bounds.maxX + padding);
  const maxY = Math.min(viewBox[1] + viewBox[3], bounds.maxY + padding);
  const width = maxX - minX;
  const height = maxY - minY;

  const nextViewBox = [minX, minY, width, height].map(formatNumber).join(' ');
  let next = original
    .replace(/\bwidth="[^"]+"/, `width="${formatNumber(width)}"`)
    .replace(/\bheight="[^"]+"/, `height="${formatNumber(height)}"`)
    .replace(/\bviewBox="[^"]+"/, `viewBox="${nextViewBox}"`);

  if (next !== original) fs.writeFileSync(filePath, next, 'utf8');

  return {
    filePath,
    before: viewBox,
    after: [minX, minY, width, height],
  };
}

function svgFiles(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs.readdirSync(target)
    .filter((name) => name.endsWith('.svg'))
    .map((name) => path.join(target, name));
}

const results = targets.flatMap(svgFiles).map(normalizeSvg);
for (const result of results) {
  const relative = path.relative(root, result.filePath);
  if (result.skipped) {
    console.log(`skip ${relative}: ${result.skipped}`);
  } else {
    console.log(`crop ${relative}: ${result.before.join(' ')} -> ${result.after.map(formatNumber).join(' ')}`);
  }
}
