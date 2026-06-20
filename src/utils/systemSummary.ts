import type { Product, SystemDesign } from '../types/system';
import type { BusType } from './electricalNetlist';
import { buildElectricalNetlist } from './electricalNetlist';
import { findSolarArrayFeedingComponent } from './solarCalculations';

export interface BatteryElectricalSummary {
  batteryCount: number;
  capacityWh: number;
  capacityAh?: number;
  maxChargeCurrentA?: number;
  maxDischargeCurrentA?: number;
}

export interface SolarElectricalSummary {
  mpptComponentId: string;
  mpptLabel: string;
  stringCount: number;
  panelCount: number;
  powerW: number;
  vocV: number;
  vmpV?: number;
  iscA?: number;
  impA?: number;
}

export interface ElectricalSummary {
  battery: BatteryElectricalSummary;
  solar: SolarElectricalSummary[];
  powerNodes: PowerNodeElectricalSummary[];
}

export interface PowerNodeElectricalSummary {
  componentId: string;
  label: string;
  netId: string;
  busType: BusType;
  terminalCount: number;
  operatingCurrentA: number;
  availableCurrentA?: number;
  totalPowerW: number;
  protectedBy?: string;
}

export function buildElectricalSummary(
  system: SystemDesign,
  products: Map<string, Product>
): ElectricalSummary {
  const battery = system.components.reduce<BatteryElectricalSummary>(
    (summary, component) => {
      const product = products.get(component.productId);
      if (!product || product.productType !== 'battery') return summary;

      const quantity = component.quantity || 1;
      return {
        batteryCount: summary.batteryCount + quantity,
        capacityWh: summary.capacityWh + (product.capacityWh ?? product.batteryRatings?.capacityWh ?? 0) * quantity,
        capacityAh: product.batteryRatings?.capacityAh != null
          ? (summary.capacityAh ?? 0) + product.batteryRatings.capacityAh * quantity
          : summary.capacityAh,
        maxChargeCurrentA: product.batteryRatings?.maxChargeCurrentA != null
          ? (summary.maxChargeCurrentA ?? 0) + product.batteryRatings.maxChargeCurrentA * quantity
          : summary.maxChargeCurrentA,
        maxDischargeCurrentA: product.batteryRatings?.maxDischargeCurrentA != null
          ? (summary.maxDischargeCurrentA ?? 0) + product.batteryRatings.maxDischargeCurrentA * quantity
          : summary.maxDischargeCurrentA,
      };
    },
    { batteryCount: 0, capacityWh: 0 }
  );

  const solar = system.components.flatMap<SolarElectricalSummary>((component) => {
    const product = products.get(component.productId);
    if (!product || product.productType !== 'mppt') return [];

    const array = findSolarArrayFeedingComponent(component.id, system.components, system.connections, products);
    if (!array.stats) return [];

    return [{
      mpptComponentId: component.id,
      mpptLabel: component.label ?? product.name,
      stringCount: array.strings.length,
      panelCount: array.stats.panelCount,
      powerW: array.stats.powerW,
      vocV: array.stats.vocV,
      vmpV: array.stats.vmpV,
      iscA: array.stats.iscA,
      impA: array.stats.impA,
    }];
  });

  const netlist = buildElectricalNetlist(system, products);
  const nodeProductTypes = new Set(['busbar', 'dc_distribution', 'ac_distribution']);
  const powerNodes = system.components.flatMap<PowerNodeElectricalSummary>((component) => {
    const product = products.get(component.productId);
    if (!product || !nodeProductTypes.has(product.productType)) return [];

    const nodeNets = netlist.nets.filter((net) => net.componentIds.includes(component.id) && net.busType !== 'unknown');
    return nodeNets.map((net) => ({
      componentId: `${component.id}:${net.id}`,
      label: component.label ?? product.name,
      netId: net.id,
      busType: net.busType,
      terminalCount: net.terminalKeys.filter((key) => key.startsWith(`${component.id}:`)).length,
      operatingCurrentA: net.operatingCurrentA,
      availableCurrentA: net.availableCurrentA,
      totalPowerW: net.operatingCurrentA * system.nominalVoltage,
      protectedBy: net.protectedBy?.map((boundary) => `${boundary.label}${boundary.ratingA ? ` ${boundary.ratingA}A` : ''}`).join(', '),
    }));
  });

  return { battery, solar, powerNodes };
}
