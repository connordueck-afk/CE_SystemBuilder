import type { Product, SystemDesign } from '../types/system';
import type { BusType } from './electricalNetlist';
import { buildBatteryInterconnectMap } from './batteryPackAnalysis';
import { analyzeSystemCircuits, type SystemCircuitAnalysis } from './circuitAnalysis';

export type ProtectionRecommendationKind = 'missing_overcurrent_protection' | 'pack_fuse_required';

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
  insertTitle?: string;
  defaultComponentLabel?: string;
}

export interface ProtectionRecommendationInputs {
  circuitAnalysis?: SystemCircuitAnalysis;
}

function busLabel(busType: BusType): string {
  return busType.replace('_', ' ').toUpperCase();
}

function protectionName(busType: BusType): string {
  return (busType === 'ac_line' || busType === 'ac_line2') ? 'breaker' : 'fuse/breaker';
}

function canRecommendInlineProtection(busType: BusType): boolean {
  return busType === 'dc_pos' || busType === 'ac_line' || busType === 'ac_line2';
}

export function buildProtectionRecommendations(
  system: SystemDesign,
  products: Map<string, Product>,
  inputs: ProtectionRecommendationInputs = {}
): ProtectionRecommendation[] {
  const analysis = inputs.circuitAnalysis ?? analyzeSystemCircuits(system, products);
  const batteryInterconnects = buildBatteryInterconnectMap(system, products);
  const recommendations: ProtectionRecommendation[] = [];

  for (const connection of system.connections) {
    if (batteryInterconnects.has(connection.id)) continue;

    const context = analysis.connections.get(connection.id);
    if (!context || !context.protectionRequired) continue;
    if (!canRecommendInlineProtection(context.busType)) continue;
    if (context.designCurrentA <= 0) continue;
    if (context.protectedBy.length > 0) continue;
    const packFuseRequired = context.errors.some((issue) => issue.code === 'PACK_FUSE_REQUIRED');

    recommendations.push({
      id: packFuseRequired ? `rec-pack-fuse-${connection.id}` : `rec-protection-${connection.id}`,
      kind: packFuseRequired ? 'pack_fuse_required' : 'missing_overcurrent_protection',
      severity: 'warning',
      connectionId: connection.id,
      busType: context.busType,
      recommendedFuseA: context.recommendedFuseA,
      recommendedCableAwg: context.recommendedCableAwg,
      message: packFuseRequired
        ? 'Parallel battery pack output needs a fuse/breaker'
        : `Missing ${protectionName(context.busType)} on ${busLabel(context.busType)} branch`,
      reason: packFuseRequired
        ? 'Per-battery integrated fuses protect each battery post, but the combined positive takeoff must have its own pack-level fuse or breaker sized for the branch.'
        : `${busLabel(context.busType)} conductors carrying load should be protected by an in-line fuse or breaker sized for the branch.`,
      insertTitle: packFuseRequired ? 'Insert Battery Pack Fuse' : undefined,
      defaultComponentLabel: packFuseRequired ? 'Battery Pack Fuse' : undefined,
    });
  }

  return recommendations;
}
