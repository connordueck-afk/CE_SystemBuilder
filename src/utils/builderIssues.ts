import type {
  BuilderIssue,
  NominalVoltage,
  Product,
  SystemComponent,
  SystemDesign,
} from '../types/system';
import type { SystemDesignAnalysis } from './analysis/types';
import { validateProduct } from '../data/products/helpers/validation';
import { isDcBusProduct } from './dcBusVoltage';
import { getTerminalPort, terminalKind, terminalRole, terminalVoltageClass } from './portSpecs';

function productLabel(component: SystemComponent | undefined, product: Product): string {
  return component?.label ?? product.name;
}

function dedupeIssues(issues: BuilderIssue[]): BuilderIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = [
      issue.severity,
      issue.code,
      issue.message,
      issue.componentId ?? '',
      issue.connectionId ?? '',
      issue.productId ?? '',
      issue.field ?? '',
    ].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function runtimeProductIssues(product: Product, component: SystemComponent): BuilderIssue[] {
  return buildProductIssues(product, { component }).filter((issue) => issue.severity !== 'info');
}

function sourceLoadKind(product: Product): 'dc_source' | 'ac_source' | 'dc_load' | 'ac_load' | null {
  if (product.productType === 'dc_load') return 'dc_load';
  if (product.productType === 'ac_load') return 'ac_load';

  const hasAcSource = product.terminals.some(
    (terminal) => terminalRole(product, terminal) === 'source' && terminalKind(product, terminal) === 'ac_power'
  );
  if (hasAcSource && product.productType === 'shorePowerInlet') return 'ac_source';

  const hasDcSource = product.terminals.some(
    (terminal) => terminalRole(product, terminal) === 'source' && terminalKind(product, terminal) === 'dc_power'
  );
  if (hasDcSource && product.productType === 'accessory' && product.dataQuality === 'placeholder') {
    return 'dc_source';
  }

  return null;
}

function voltageCompatible(product: Product, systemVoltage: NominalVoltage): boolean {
  if (product.nominalVoltage == null) return true;
  const voltages = Array.isArray(product.nominalVoltage) ? product.nominalVoltage : [product.nominalVoltage];
  return voltages.includes(systemVoltage);
}

function positiveNumber(value: number | undefined): boolean {
  return value != null && Number.isFinite(value) && value > 0;
}

function hasUsableVoltageDefault(
  product: Product,
  systemVoltage: NominalVoltage,
  sourceLoad: 'dc_source' | 'ac_source' | 'dc_load' | 'ac_load'
): boolean {
  if (Array.isArray(product.nominalVoltage) && product.nominalVoltage.includes(systemVoltage)) return true;
  if (positiveNumber(typeof product.nominalVoltage === 'number' ? product.nominalVoltage : undefined)) return true;
  if (sourceLoad === 'dc_source' || sourceLoad === 'dc_load') return positiveNumber(systemVoltage);

  return product.terminals.some((terminal) => {
    if (terminalKind(product, terminal) !== 'dc_power' && terminalKind(product, terminal) !== 'ac_power') return false;
    const port = getTerminalPort(product, terminal);
    return positiveNumber(port?.nominalVoltageV) || terminalVoltageClass(product, terminal) === 'ac_120v';
  });
}

function hasUsableCurrentDefault(product: Product): boolean {
  if (positiveNumber(product.maxCurrentA) || positiveNumber(product.continuousPowerW)) return true;
  if (positiveNumber(product.loadRatings?.currentA) || positiveNumber(product.loadRatings?.powerW)) return true;

  return product.ports?.some((port) => (
    positiveNumber(port.maxCurrentA) || positiveNumber(port.maxPowerW)
  )) ?? false;
}

export function buildProductIssues(
  product: Product,
  options?: { component?: SystemComponent }
): BuilderIssue[] {
  const prefix = options?.component ? `${productLabel(options.component, product)}: ` : '';

  return validateProduct(product).issues.map((issue, index) => ({
    id: `${options?.component?.id ?? product.id}:product:${issue.code}:${issue.field ?? index}`,
    severity: issue.severity,
    code: issue.code,
    message: `${prefix}${issue.message}`,
    componentId: options?.component?.id,
    productId: product.id,
    field: issue.field,
    source: 'product_validation',
  }));
}

export function buildComponentConfigurationIssues(
  component: SystemComponent,
  product: Product,
  systemVoltage: NominalVoltage
): BuilderIssue[] {
  const issues: BuilderIssue[] = [];
  const label = productLabel(component, product);
  const sourceLoad = sourceLoadKind(product);

  if (!voltageCompatible(product, systemVoltage)) {
    const rated = Array.isArray(product.nominalVoltage)
      ? product.nominalVoltage.join('/')
      : String(product.nominalVoltage);
    issues.push({
      id: `${component.id}:config:voltage-mismatch`,
      severity: 'warning',
      code: 'PRODUCT_VOLTAGE_MISMATCH',
      message: `${label} is rated for ${rated}V but the system is ${systemVoltage}V.`,
      componentId: component.id,
      productId: product.id,
      source: 'component_configuration',
    });
  }

  if (sourceLoad) {
    if (!positiveNumber(component.instanceVoltageV) && !hasUsableVoltageDefault(product, systemVoltage, sourceLoad)) {
      issues.push({
        id: `${component.id}:config:instance-voltage`,
        severity: 'warning',
        code: 'INSTANCE_VOLTAGE_MISSING',
        message: `${label} is missing its operating/output voltage. Set the instance voltage in the inspector.`,
        componentId: component.id,
        productId: product.id,
        field: 'instanceVoltageV',
        source: 'component_configuration',
      });
    }
    if (!positiveNumber(component.instanceMaxCurrentA) && !hasUsableCurrentDefault(product)) {
      issues.push({
        id: `${component.id}:config:instance-current`,
        severity: 'warning',
        code: 'INSTANCE_CURRENT_MISSING',
        message: `${label} is missing its operating/output current. Set the instance current so sizing and warnings use the real value.`,
        componentId: component.id,
        productId: product.id,
        field: 'instanceMaxCurrentA',
        source: 'component_configuration',
      });
    }
  }

  if (
    product.productType === 'busbar' &&
    product.manufacturer === 'Generic' &&
    !component.busPolarity &&
    !component.inferredPolarity
  ) {
    issues.push({
      id: `${component.id}:config:bus-polarity`,
      severity: 'info',
      code: 'BUS_POLARITY_UNSET',
      message: `${label} does not have a positive/negative bus assignment yet. Connect it or set its polarity in the inspector.`,
      componentId: component.id,
      productId: product.id,
      field: 'busPolarity',
      source: 'component_configuration',
    });
  }

  if (isDcBusProduct(product) && component.dcNominalVoltage == null && product.productType === 'dc_distribution') {
    issues.push({
      id: `${component.id}:config:dc-bus-voltage`,
      severity: 'info',
      code: 'DC_BUS_VOLTAGE_UNSET',
      message: `${label} is using the system default DC voltage. Set an explicit nominal voltage if this node represents a different bus.`,
      componentId: component.id,
      productId: product.id,
      field: 'dcNominalVoltage',
      source: 'component_configuration',
    });
  }

  for (const port of product.communicationPorts ?? []) {
    if (!port.isConfigurable) continue;
    const configured = component.configuredProtocols?.[port.id] ?? port.configuredProtocol;
    if (configured) continue;

    issues.push({
      id: `${component.id}:config:comm:${port.id}`,
      severity: 'info',
      code: 'COMM_PROTOCOL_UNSET',
      message: `${label} communication port "${port.name}" is configurable but has no selected protocol.`,
      componentId: component.id,
      productId: product.id,
      field: `configuredProtocols.${port.id}`,
      source: 'component_configuration',
    });
  }

  return issues;
}

export function buildBuilderIssues(
  system: SystemDesign,
  products: Map<string, Product>,
  analysis: SystemDesignAnalysis
): BuilderIssue[] {
  const issues: BuilderIssue[] = [];

  for (const warning of analysis.warnings) {
    issues.push({
      ...warning,
      source: 'system_warning',
    });
  }

  for (const issue of analysis.issues) {
    issues.push({
      id: issue.id,
      severity: issue.severity,
      code: issue.code,
      message: issue.message,
      componentId: issue.componentId,
      connectionId: issue.connectionId,
      source: 'design_issue',
    });
  }

  for (const component of system.components) {
    const product = products.get(component.productId);
    if (!product) continue;

    issues.push(...runtimeProductIssues(product, component));
    issues.push(...buildComponentConfigurationIssues(component, product, system.nominalVoltage));
  }

  return dedupeIssues(issues);
}
