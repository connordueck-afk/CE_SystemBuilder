import type { Product, SystemDesign } from '../types/system';
import { buildElectricalNetlist, busTypeRequiresFuse, type BusType } from './electricalNetlist';
import { buildBatteryInterconnectMap } from './batteryPackAnalysis';

export type ProtectionRecommendationKind = 'missing_overcurrent_protection';

export interface ProtectionRecommendation {
  id: string;
  kind: ProtectionRecommendationKind;
  severity: 'warning' | 'error';
  connectionId: string;
  busType: BusType;
  message: string;
  reason: string;
  recommendedFuseA?: number;
  recommendedCableAwg?: string;
}

const PROTECTION_TYPES = new Set(['fuse', 'breaker']);

function busLabel(busType: BusType): string {
  return busType.replace('_', ' ').toUpperCase();
}

function protectionName(busType: BusType): string {
  return busType === 'ac_line' ? 'breaker' : 'fuse/breaker';
}

function isProtectionProduct(product: Product | undefined): boolean {
  return Boolean(product && PROTECTION_TYPES.has(product.productType));
}

function canRecommendInlineProtection(busType: BusType): boolean {
  return busType === 'dc_pos' || busType === 'ac_line';
}

export function buildProtectionRecommendations(
  system: SystemDesign,
  products: Map<string, Product>
): ProtectionRecommendation[] {
  const netlist = buildElectricalNetlist(system, products);
  const componentProducts = new Map(
    system.components.map((component) => [component.id, products.get(component.productId)])
  );
  const batteryInterconnects = buildBatteryInterconnectMap(system, products);
  const recommendations: ProtectionRecommendation[] = [];

  for (const connection of system.connections) {
    if (batteryInterconnects.has(connection.id)) continue;

    const context = netlist.connectionContexts.get(connection.id);
    if (!context || !busTypeRequiresFuse(context.busType)) continue;
    if (!canRecommendInlineProtection(context.busType)) continue;
    if (context.operatingCurrentA <= 0) continue;
    if (context.availableCurrentA != null) continue;

    const fromProduct = componentProducts.get(connection.fromComponentId);
    const toProduct = componentProducts.get(connection.toComponentId);
    if (isProtectionProduct(fromProduct) || isProtectionProduct(toProduct)) continue;

    recommendations.push({
      id: `rec-protection-${connection.id}`,
      kind: 'missing_overcurrent_protection',
      severity: 'warning',
      connectionId: connection.id,
      busType: context.busType,
      recommendedFuseA: connection.recommendedFuseA,
      recommendedCableAwg: connection.recommendedCableAwg,
      message: `Missing ${protectionName(context.busType)} on ${busLabel(context.busType)} branch`,
      reason: `${busLabel(context.busType)} conductors carrying load should be protected by an in-line fuse or breaker sized for the branch.`,
    });
  }

  return recommendations;
}
