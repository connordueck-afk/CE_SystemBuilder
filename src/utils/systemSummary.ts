import type { Product, SystemDesign } from '../types/system';
import type { BusType } from './electricalNetlist';
import { buildElectricalNetlist } from './electricalNetlist';
import { findSolarArrayFeedingComponent } from './solarCalculations';
import { analyzeBatteryTopology } from './batteryTopology';

export interface BatteryElectricalSummary {
  batteryCount: number;
  stringCount: number;
  packCount: number;
  primaryPackLabel?: string;
  packVoltageV?: number;
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
  const topology = analyzeBatteryTopology(system, products);
  const primaryPack = topology.packs
    .slice()
    .sort((a, b) => b.capacityWh - a.capacityWh)[0];
  const battery: BatteryElectricalSummary = {
    batteryCount: topology.packs.reduce((sum, pack) => sum + pack.batteryComponentIds.length, 0),
    stringCount: topology.strings.length,
    packCount: topology.packs.length,
    primaryPackLabel: primaryPack ? `${primaryPack.seriesCount}S${primaryPack.parallelCount}P` : undefined,
    packVoltageV: primaryPack?.voltageV,
    capacityWh: topology.packs.reduce((sum, pack) => sum + pack.capacityWh, 0),
    capacityAh: topology.packs.some((pack) => pack.capacityAh != null)
      ? topology.packs.reduce((sum, pack) => sum + (pack.capacityAh ?? 0), 0)
      : undefined,
    maxChargeCurrentA: topology.packs.some((pack) => pack.maxChargeCurrentA != null)
      ? topology.packs.reduce((sum, pack) => sum + (pack.maxChargeCurrentA ?? 0), 0)
      : undefined,
    maxDischargeCurrentA: topology.packs.some((pack) => pack.maxDischargeCurrentA != null)
      ? topology.packs.reduce((sum, pack) => sum + (pack.maxDischargeCurrentA ?? 0), 0)
      : undefined,
  };

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
