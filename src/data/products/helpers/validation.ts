// ============================================================
// validation.ts — Catalog validation helpers
// ============================================================
// Run these validations at development time (e.g., in a test
// or build script) to catch catalog data errors early.
//
// These do NOT run in the browser at runtime by default.
// Import and call validateCatalog() in a test or dev script.
// ============================================================

import type { Product, TerminalDefinition } from '../../../types/system';
import { getProductTypeDefinition } from '../productTypes';
import { getFuseRating } from '../../../utils/fuseSelection';
import { getTerminalPortId } from '../../../utils/portSpecs';

// -----------------------------------------------------------
// Validation result types
// -----------------------------------------------------------

export type CatalogValidationSeverity = 'error' | 'warning' | 'info';

export interface CatalogValidationIssue {
  productId: string;
  field?: string;
  severity: CatalogValidationSeverity;
  message: string;
  code: string;
}

export interface CatalogValidationResult {
  valid: boolean;
  errorCount: number;
  warningCount: number;
  issues: CatalogValidationIssue[];
}

// -----------------------------------------------------------
// Individual product validators
// -----------------------------------------------------------

function validateProductId(product: Product, allIds: Set<string>): CatalogValidationIssue[] {
  const issues: CatalogValidationIssue[] = [];
  if (!product.id || product.id.trim() === '') {
    issues.push({
      productId: product.id ?? '(unknown)',
      field: 'id',
      severity: 'error',
      message: 'Product is missing an ID.',
      code: 'MISSING_ID',
    });
  } else if (allIds.has(product.id)) {
    issues.push({
      productId: product.id,
      field: 'id',
      severity: 'error',
      message: `Duplicate product ID: "${product.id}".`,
      code: 'DUPLICATE_ID',
    });
  }
  return issues;
}

function validateRequiredFields(product: Product): CatalogValidationIssue[] {
  const issues: CatalogValidationIssue[] = [];
  if (!product.manufacturer || product.manufacturer.trim() === '') {
    issues.push({ productId: product.id, field: 'manufacturer', severity: 'error', message: 'Missing manufacturer.', code: 'MISSING_MANUFACTURER' });
  }
  if (!product.name || product.name.trim() === '') {
    issues.push({ productId: product.id, field: 'name', severity: 'error', message: 'Missing product name.', code: 'MISSING_NAME' });
  }
  if (!product.productType) {
    issues.push({ productId: product.id, field: 'productType', severity: 'error', message: 'Missing product type.', code: 'MISSING_TYPE' });
  }
  return issues;
}

function validateProductType(product: Product): CatalogValidationIssue[] {
  const issues: CatalogValidationIssue[] = [];
  const typeDef = getProductTypeDefinition(product.productType);
  if (!typeDef) {
    issues.push({
      productId: product.id,
      field: 'productType',
      severity: 'warning',
      message: `Product type "${product.productType}" is not registered in productTypes.ts. Consider adding a definition.`,
      code: 'UNREGISTERED_TYPE',
    });
  }
  return issues;
}

const ENCODING_ARTIFACTS = ['\uFFFD', 'Ã', 'Â', 'â€', 'ï¿½'];

function collectStringFields(value: unknown, path: string, out: Array<{ path: string; value: string }>): void {
  if (typeof value === 'string') {
    out.push({ path, value });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectStringFields(item, `${path}.${index}`, out));
    return;
  }
  if (value != null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      collectStringFields(child, path ? `${path}.${key}` : key, out);
    }
  }
}

function validateTextFields(product: Product): CatalogValidationIssue[] {
  const issues: CatalogValidationIssue[] = [];
  const fields: Array<{ path: string; value: string }> = [];
  collectStringFields(product, '', fields);

  for (const field of fields) {
    if (ENCODING_ARTIFACTS.some((artifact) => field.value.includes(artifact))) {
      issues.push({
        productId: product.id,
        field: field.path,
        severity: 'error',
        message: `Text field "${field.path}" contains a likely mojibake / replacement-character artifact.`,
        code: 'TEXT_ENCODING_ARTIFACT',
      });
    }
  }

  return issues;
}

function validateTerminals(product: Product): CatalogValidationIssue[] {
  const issues: CatalogValidationIssue[] = [];
  const typeDef = getProductTypeDefinition(product.productType);

  if (typeDef?.requiresTerminals && (!product.terminals || product.terminals.length === 0)) {
    issues.push({
      productId: product.id,
      field: 'terminals',
      severity: 'error',
      message: `Product type "${product.productType}" requires terminals but none are defined.`,
      code: 'MISSING_TERMINALS',
    });
    return issues;
  }

  const terminalIds = new Set<string>();
  for (const terminal of product.terminals ?? []) {
    if (!terminal.id || terminal.id.trim() === '') {
      issues.push({
        productId: product.id,
        field: 'terminals',
        severity: 'error',
        message: 'A terminal is missing an ID.',
        code: 'MISSING_TERMINAL_ID',
      });
    } else if (terminalIds.has(terminal.id)) {
      issues.push({
        productId: product.id,
        field: `terminals.${terminal.id}`,
        severity: 'error',
        message: `Duplicate terminal ID "${terminal.id}" within product "${product.id}".`,
        code: 'DUPLICATE_TERMINAL_ID',
      });
    } else {
      terminalIds.add(terminal.id);
    }

    for (const field of [
      'kind',
      'polarity',
      'role',
      'direction',
      'voltageClass',
      'requiresOvercurrentProtection',
      'requiresDisconnect',
      'recommendedFuseA',
      'maxFuseA',
      'portId',
      'maxPowerW',
      'voltageNominalV',
      'voltageMinV',
      'voltageMaxV',
      'powerMaxW',
      'phases',
      'conductorCount',
      'electricalType',
    ]) {
      if (field in terminal) {
        issues.push({
          productId: product.id,
          field: `terminals.${terminal.id}.${field}`,
          severity: 'error',
          message: `Terminal "${terminal.id}" must not define "${field}"; assign electrical behavior on its terminal group or port.`,
          code: 'TERMINAL_OWNS_ELECTRICAL_FIELD',
        });
      }
    }
  }

  return issues;
}

function validatePricing(product: Product): CatalogValidationIssue[] {
  const issues: CatalogValidationIssue[] = [];
  const hasPrice = (product.msrpUsd != null) || (product.pricing?.msrp != null);

  if (!hasPrice) {
    // Free/unknown products (msrpUsd === 0) should set it explicitly
    issues.push({
      productId: product.id,
      field: 'msrpUsd',
      severity: 'info',
      message: 'Product has no MSRP data. Set msrpUsd: 0 if the product is free or price is unknown.',
      code: 'MISSING_PRICE',
    });
  }

  return issues;
}

function validateCanvasLayout(product: Product): CatalogValidationIssue[] {
  const issues: CatalogValidationIssue[] = [];
  if (!product.width || product.width <= 0) {
    issues.push({ productId: product.id, field: 'width', severity: 'warning', message: 'Product has no valid canvas width.', code: 'MISSING_WIDTH' });
  }
  if (!product.height || product.height <= 0) {
    issues.push({ productId: product.id, field: 'height', severity: 'warning', message: 'Product has no valid canvas height.', code: 'MISSING_HEIGHT' });
  }
  return issues;
}

/**
 * Validates the port model: every terminal must resolve to a defined port through its
 * terminal group, and every port must declare kind/topology/role.
 */
function validatePorts(product: Product): CatalogValidationIssue[] {
  const issues: CatalogValidationIssue[] = [];
  const portIds = new Set((product.ports ?? []).map((p) => p.id));

  for (const t of product.terminals ?? []) {
    const resolvedPortId = getTerminalPortId(product, t);
    if (!resolvedPortId) {
      issues.push({ productId: product.id, field: `terminals.${t.id}.terminalGroupId`, severity: 'error', code: 'TERMINAL_NO_PORT', message: `Terminal "${t.id}" has no resolvable port through its terminal group.` });
    } else if (!portIds.has(resolvedPortId)) {
      issues.push({ productId: product.id, field: `terminals.${t.id}.portId`, severity: 'error', code: 'TERMINAL_UNKNOWN_PORT', message: `Terminal "${t.id}" resolves to unknown port "${resolvedPortId}".` });
    }
  }

  for (const p of product.ports ?? []) {
    if (!p.kind) {
      issues.push({ productId: product.id, field: `ports.${p.id}.kind`, severity: 'error', code: 'PORT_NO_KIND', message: `Port "${p.id}" has no kind.` });
    }
    if (!p.topology) {
      issues.push({ productId: product.id, field: `ports.${p.id}.topology`, severity: 'error', code: 'PORT_NO_TOPOLOGY', message: `Port "${p.id}" (${p.kind}) has no topology.` });
    }
    if (!p.role) {
      issues.push({ productId: product.id, field: `ports.${p.id}.role`, severity: 'error', code: 'PORT_NO_ROLE', message: `Port "${p.id}" has no role.` });
    }

    if ((p.kind === 'dc' || p.kind === 'pv' || p.kind === 'ac') && !p.voltageClass) {
      issues.push({
        productId: product.id,
        field: `ports.${p.id}.voltageClass`,
        severity: 'error',
        code: 'PORT_NO_VOLTAGE_CLASS',
        message: `Port "${p.id}" (${p.kind}) has no voltageClass.`,
      });
    }
  }

  return issues;
}

function validateTerminalGroups(product: Product): CatalogValidationIssue[] {
  const issues: CatalogValidationIssue[] = [];
  const groups = product.terminalGroups ?? [];
  const groupIds = new Set<string>();
  const portIds = new Set((product.ports ?? []).map((port) => port.id));

  if ((product.terminals ?? []).length > 0 && groups.length === 0) {
    issues.push({
      productId: product.id,
      field: 'terminalGroups',
      severity: 'error',
      code: 'MISSING_TERMINAL_GROUPS',
      message: 'Active products with terminals must declare explicit terminalGroups.',
    });
  }

  for (const group of groups) {
    if (!group.id) {
      issues.push({ productId: product.id, field: 'terminalGroups.id', severity: 'error', code: 'MISSING_TERMINAL_GROUP_ID', message: 'A terminal group is missing an ID.' });
    } else if (groupIds.has(group.id)) {
      issues.push({ productId: product.id, field: `terminalGroups.${group.id}`, severity: 'error', code: 'DUPLICATE_TERMINAL_GROUP_ID', message: `Duplicate terminal group ID "${group.id}".` });
    } else {
      groupIds.add(group.id);
    }

    if (!group.portId) {
      issues.push({ productId: product.id, field: `terminalGroups.${group.id}.portId`, severity: 'error', code: 'TERMINAL_GROUP_NO_PORT', message: `Terminal group "${group.id}" has no portId.` });
    } else if (!portIds.has(group.portId)) {
      issues.push({ productId: product.id, field: `terminalGroups.${group.id}.portId`, severity: 'error', code: 'TERMINAL_GROUP_UNKNOWN_PORT', message: `Terminal group "${group.id}" references unknown port "${group.portId}".` });
    }

    if ('kind' in group) {
      issues.push({ productId: product.id, field: `terminalGroups.${group.id}.kind`, severity: 'error', code: 'TERMINAL_GROUP_OWNS_KIND', message: `Terminal group "${group.id}" must not define kind; it inherits electrical medium from its port.` });
    }
  }

  for (const terminal of product.terminals ?? []) {
    if (!terminal.terminalGroupId) {
      issues.push({
        productId: product.id,
        field: `terminals.${terminal.id}.terminalGroupId`,
        severity: 'error',
        code: 'TERMINAL_NO_GROUP',
        message: `Terminal "${terminal.id}" has no terminalGroupId.`,
      });
    } else if (!groupIds.has(terminal.terminalGroupId)) {
      issues.push({
        productId: product.id,
        field: `terminals.${terminal.id}.terminalGroupId`,
        severity: 'error',
        code: 'TERMINAL_UNKNOWN_GROUP',
        message: `Terminal "${terminal.id}" references unknown terminal group "${terminal.terminalGroupId}".`,
      });
    }
  }

  return issues;
}

function validateProtectionRatings(product: Product): CatalogValidationIssue[] {
  const issues: CatalogValidationIssue[] = [];
  if (product.productType !== 'fuse' && product.productType !== 'breaker') return issues;

  const ratingA = getFuseRating(product);
  if (ratingA <= 0) {
    issues.push({
      productId: product.id,
      field: 'protectionRatings.currentRatingA',
      severity: 'error',
      code: 'PROTECTION_NO_CURRENT_RATING',
      message: 'Protection product has no positive current rating.',
    });
  }

  for (const port of product.ports ?? []) {
    if (port.kind === 'dc' && port.maxCurrentA !== ratingA) {
      issues.push({
        productId: product.id,
        field: `ports.${port.id}.maxCurrentA`,
        severity: 'error',
        code: 'PROTECTION_PORT_RATING_MISMATCH',
        message: `Protection port "${port.id}" maxCurrentA (${port.maxCurrentA ?? 'missing'}) must match the ${ratingA}A protection rating.`,
      });
    }
  }

  return issues;
}

// -----------------------------------------------------------
// Catalog-level validator
// -----------------------------------------------------------

/**
 * Validates the entire product catalog.
 *
 * Usage (dev/test only):
 *   import { ALL_PRODUCTS } from '../products';
 *   import { validateCatalog } from '../products/helpers/validation';
 *   const result = validateCatalog(ALL_PRODUCTS);
 *   if (!result.valid) console.error(result.issues);
 */
export function validateCatalog(products: Product[]): CatalogValidationResult {
  const issues: CatalogValidationIssue[] = [];
  const seenIds = new Set<string>();

  for (const product of products) {
    // Check for duplicates across catalog
    const idIssues = validateProductId(product, seenIds);
    issues.push(...idIssues);
    if (product.id) seenIds.add(product.id);

    issues.push(...validateRequiredFields(product));
    issues.push(...validateTextFields(product));
    issues.push(...validateProductType(product));
    issues.push(...validateTerminals(product));
    issues.push(...validatePorts(product));
    issues.push(...validateTerminalGroups(product));
    issues.push(...validateProtectionRatings(product));
    issues.push(...validatePricing(product));
    issues.push(...validateCanvasLayout(product));
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  return {
    valid: errorCount === 0,
    errorCount,
    warningCount,
    issues,
  };
}

/**
 * Validates a single product in isolation (no duplicate-ID check).
 * Useful for validating a product before adding it to the catalog.
 */
export function validateProduct(product: Product): CatalogValidationResult {
  const issues: CatalogValidationIssue[] = [];
  issues.push(...validateRequiredFields(product));
  issues.push(...validateTextFields(product));
  issues.push(...validateProductType(product));
  issues.push(...validateTerminals(product));
  issues.push(...validatePorts(product));
  issues.push(...validateTerminalGroups(product));
  issues.push(...validateProtectionRatings(product));
  issues.push(...validatePricing(product));
  issues.push(...validateCanvasLayout(product));

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  return {
    valid: errorCount === 0,
    errorCount,
    warningCount,
    issues,
  };
}

/**
 * Asserts the catalog is valid and throws a descriptive error if not.
 * Call in development builds or unit tests to catch catalog regressions early.
 */
export function assertCatalogValid(products: Product[]): void {
  const result = validateCatalog(products);
  if (!result.valid) {
    const errors = result.issues
      .filter((i) => i.severity === 'error')
      .map((i) => `  [${i.code}] ${i.productId}: ${i.message}`)
      .join('\n');
    throw new Error(`Product catalog validation failed with ${result.errorCount} error(s):\n${errors}`);
  }
}
