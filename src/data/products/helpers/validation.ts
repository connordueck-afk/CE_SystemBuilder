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

    if (!terminal.kind) {
      issues.push({
        productId: product.id,
        field: `terminals.${terminal.id}.kind`,
        severity: 'error',
        message: `Terminal "${terminal.id}" is missing a "kind" field.`,
        code: 'MISSING_TERMINAL_KIND',
      });
    }

    if (!terminal.role) {
      issues.push({
        productId: product.id,
        field: `terminals.${terminal.id}.role`,
        severity: 'error',
        message: `Terminal "${terminal.id}" is missing a "role" field.`,
        code: 'MISSING_TERMINAL_ROLE',
      });
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
    issues.push(...validateProductType(product));
    issues.push(...validateTerminals(product));
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
  issues.push(...validateProductType(product));
  issues.push(...validateTerminals(product));
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
