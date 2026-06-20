// ============================================================
// productSchemas.ts — Product factory helpers and schema utilities
// ============================================================
// Use the factory helpers here to create product definitions
// in the individual product files (batteries.ts, mppts.ts, etc.).
//
// These helpers:
//   1. Ensure required fields are always present.
//   2. Apply sensible defaults.
//   3. Make the structure of each product type explicit.
//
// They do NOT replace the Product interface — they produce
// fully valid Product objects that satisfy the existing type.
// ============================================================

import type {
  Product,
  ProductType,
  NominalVoltage,
  TerminalDefinition,
  BatteryRatings,
  MpptRatings,
  InverterChargerRatings,
  DcDcChargerRatings,
  BusbarRatings,
  ProtectionRatings,
  SolarPanelRatings,
  SolarCombinerRatings,
  LoadRatings,
  DataQuality,
} from '../../types/system';

// -----------------------------------------------------------
// Base product builder
// -----------------------------------------------------------

export interface BaseProductInput {
  id: string;
  manufacturer: string;
  name: string;
  productType: ProductType;
  category?: string;
  description?: string;
  partNumber?: string;
  sku?: string;
  productUrl?: string;
  datasheetUrl?: string;
  imageUrl?: string;
  nominalVoltage?: NominalVoltage | NominalVoltage[];
  msrpUsd?: number;
  oemPriceUsd?: number;
  source?: string;
  notes?: string;
  dataQuality?: DataQuality;
  terminals: TerminalDefinition[];
  width: number;
  height: number;
}

/** Build a base product, applying catalog defaults. */
function buildBase(input: BaseProductInput): Product {
  return {
    ...input,
    dataQuality: input.dataQuality ?? 'partial',
  };
}

// -----------------------------------------------------------
// Battery
// -----------------------------------------------------------

export interface BatteryProductInput extends BaseProductInput {
  ratings: BatteryRatings;
}

export function defineBattery(input: BatteryProductInput): Product {
  const r = input.ratings;
  return {
    ...buildBase(input),
    productType: 'battery',
    nominalVoltage: r.nominalVoltageV as NominalVoltage,
    capacityWh: r.capacityWh,
    maxCurrentA: r.maxDischargeCurrentA,
    batteryRatings: r,
  };
}

// -----------------------------------------------------------
// MPPT Charge Controller
// -----------------------------------------------------------

export interface MpptProductInput extends BaseProductInput {
  ratings: MpptRatings;
}

export function defineMppt(input: MpptProductInput): Product {
  const r = input.ratings;
  return {
    ...buildBase(input),
    productType: 'mppt',
    nominalVoltage: r.batteryVoltagesV as NominalVoltage[],
    maxCurrentA: r.maxOutputCurrentA,
    maxPvVoltageV: r.maxPvVoltageV,
    maxPvCurrentA: r.maxPvCurrentA,
    continuousPowerW: r.maxPvPowerW,
    mpptRatings: r,
  };
}

// -----------------------------------------------------------
// Inverter / Charger
// -----------------------------------------------------------

export interface InverterChargerProductInput extends BaseProductInput {
  ratings: InverterChargerRatings;
}

export function defineInverterCharger(input: InverterChargerProductInput): Product {
  const r = input.ratings;
  return {
    ...buildBase(input),
    productType: 'inverter_charger',
    nominalVoltage: r.dcVoltageV as NominalVoltage,
    continuousPowerW: r.continuousInverterW,
    peakPowerW: r.surgeW,
    maxCurrentA: r.maxDcCurrentA,
    inverterChargerRatings: r,
  };
}

// -----------------------------------------------------------
// DC-DC Charger
// -----------------------------------------------------------

export interface DcDcChargerProductInput extends BaseProductInput {
  ratings: DcDcChargerRatings;
}

export function defineDcDcCharger(input: DcDcChargerProductInput): Product {
  const r = input.ratings;
  return {
    ...buildBase(input),
    productType: 'dc_dc_charger',
    maxCurrentA: r.outputCurrentA,
    continuousPowerW: r.outputPowerW,
    dcDcChargerRatings: r,
  };
}

// -----------------------------------------------------------
// Busbar / DC Distribution
// -----------------------------------------------------------

export interface BusbarProductInput extends BaseProductInput {
  ratings?: BusbarRatings;
}

export function defineBusbar(input: BusbarProductInput): Product {
  const r = input.ratings;
  return {
    ...buildBase(input),
    maxCurrentA: r?.currentRatingA,
    busbarRatings: r,
  };
}

// -----------------------------------------------------------
// Protection (Fuse / Breaker)
// -----------------------------------------------------------

export interface ProtectionProductInput extends BaseProductInput {
  ratings: ProtectionRatings;
}

export function defineProtection(input: ProtectionProductInput): Product {
  const r = input.ratings;
  return {
    ...buildBase(input),
    maxCurrentA: r.currentRatingA,
    protectionRatings: r,
  };
}

// -----------------------------------------------------------
// Solar Array / Panel
// -----------------------------------------------------------

export interface SolarArrayProductInput extends BaseProductInput {
  ratings?: SolarPanelRatings;
}

export function defineSolarArray(input: SolarArrayProductInput): Product {
  const r = input.ratings;
  return {
    ...buildBase(input),
    productType: 'solar_array',
    continuousPowerW: r?.powerW,
    maxPvVoltageV: r?.vocV,
    maxPvCurrentA: r?.iscA,
    solarPanelRatings: r,
  };
}

// -----------------------------------------------------------
// Solar Combiner Box
// -----------------------------------------------------------

export interface SolarCombinerProductInput extends BaseProductInput {
  ratings?: SolarCombinerRatings;
}

export function defineSolarCombiner(input: SolarCombinerProductInput): Product {
  const r = input.ratings;
  return {
    ...buildBase(input),
    productType: 'solar_combiner',
    maxPvVoltageV: r?.maxVoltageV,
    maxPvCurrentA: r?.maxCurrentA,
    solarCombinerRatings: r,
  };
}

// -----------------------------------------------------------
// Load (DC or AC)
// -----------------------------------------------------------

export interface LoadProductInput extends BaseProductInput {
  ratings?: LoadRatings;
}

export function defineLoad(input: LoadProductInput): Product {
  const r = input.ratings;
  return {
    ...buildBase(input),
    continuousPowerW: r?.powerW,
    maxCurrentA: r?.currentA,
    loadRatings: r,
  };
}

// -----------------------------------------------------------
// Generic product (for monitors, accessories, cables, etc.)
// -----------------------------------------------------------

export function defineProduct(input: BaseProductInput): Product {
  return buildBase(input);
}
