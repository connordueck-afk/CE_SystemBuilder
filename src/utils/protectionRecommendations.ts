import type { Product, SystemDesign } from '../types/system';
import type { BusType } from './electricalNetlist';
import { buildBatteryInterconnectMap } from './batteryPackAnalysis';
import { analyzeSystemCircuits } from './circuitAnalysis';

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

function busLabel(busType: BusType): string {
  return busType.replace('_', ' ').toUpperCase();
}

function protectionName(busType: BusType): string {
  return busType === 'ac_line' ? 'breaker' : 'fuse/breaker';
}

function canRecommendInlineProtection(busType: BusType): boolean {
  return busType === 'dc_pos' || busType === 'ac_line';
}

export function buildProtectionRecommendations(
  system: SystemDesign,
  products: Map<string, Product>
): ProtectionRecommendation[] {
  const analysis = analyzeSystemCircuits(system, products);
  const batteryInterconnects = buildBatteryInterconnectMap(system, products);
  const recommendations: ProtectionRecommendation[] = [];

  for (const connection of system.connections) {
    if (batteryInterconnects.has(connection.id)) continue;

    const context = analysis.connections.get(connection.id);
    if (!context || !context.protectionRequired) continue;
    if (!canRecommendInlineProtection(context.busType)) continue;
    if (context.designCurrentA <= 0) continue;
    if (context.protectedBy.length > 0) continue;

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
