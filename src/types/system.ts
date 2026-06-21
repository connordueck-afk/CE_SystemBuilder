// ============================================================
// system.ts — Core type definitions for Nomadeus System Builder
// ============================================================
// All additions are backward-compatible extensions.
// Existing field names, types, and semantics are preserved.
// ============================================================

// -----------------------------------------------------------
// Voltage
// -----------------------------------------------------------

export type NominalVoltage = 12 | 24 | 48;

// -----------------------------------------------------------
// Product Types
// -----------------------------------------------------------

export type ProductType =
  | 'battery'
  | 'inverter_charger'
  | 'mppt'
  | 'solar_array'
  | 'solar_combiner'
  | 'dc_distribution'
  | 'fuse'
  | 'breaker'
  | 'busbar'
  | 'cable'
  | 'dc_dc_charger'
  | 'shore_charger'
  | 'ac_distribution'
  | 'dc_load'
  | 'ac_load'
  | 'monitor'
  | 'accessory'
  // New extensible types added in catalog refactor
  | 'pvCombinerBox'
  | 'transferSwitch'
  | 'dcDisconnect'
  | 'acDisconnect'
  | 'relay'
  | 'contactor'
  | 'converter'
  | 'batteryMonitor'
  | 'shorePowerInlet';

// -----------------------------------------------------------
// Electrical Domains
// -----------------------------------------------------------

/** The electrical domain a terminal belongs to. */
export type ElectricalDomain =
  | 'dc'
  | 'ac'
  | 'pv'
  | 'chassisGround'
  | 'earthGround'
  | 'communication'
  | 'signal';

// -----------------------------------------------------------
// Terminal Types (existing — preserved)
// -----------------------------------------------------------

export type ElectricalType = 'dc_pos' | 'dc_neg' | 'pv_pos' | 'pv_neg' | 'ac' | 'signal' | 'generic';
export type ConnectionPointKind =
  | 'dc_power'
  | 'pv_power'
  | 'ac_power'
  | 'chassis_ground'
  | 'signal'
  | 'network'
  | 'generic';
export type ConnectionPolarity = 'positive' | 'negative' | 'line' | 'neutral' | 'ground';
export type ConnectionRole =
  | 'source'
  | 'sink'
  | 'bidirectional'
  | 'pass_through'
  | 'bus'
  | 'sense'
  | 'control';
export type TerminalDirection = 'input' | 'output' | 'bidirectional';
export type VoltageClass =
  | 'dc_low_voltage'
  | 'pv_high_voltage'
  | 'ac_120v'
  | 'ac_240v'
  | 'signal_low_voltage';
export type TerminalSide = 'left' | 'right' | 'top' | 'bottom';
export type BusPolarity = 'positive' | 'negative';
export type SolarWiringMode = 'series' | 'parallel';

/** Existing terminal definition (preserved). Canvas positioning included. */
export interface TerminalDefinition {
  id: string;
  label: string;
  electricalType?: ElectricalType;
  kind: ConnectionPointKind;
  polarity?: ConnectionPolarity;
  role: ConnectionRole;
  /** Electrical power-flow direction at this connection point. */
  direction?: TerminalDirection;
  voltageClass?: VoltageClass;
  maxVoltageV?: number;
  maxCurrentA?: number;
  side: TerminalSide;
  offsetX: number;
  offsetY: number;

  // Extended fields added in catalog refactor (optional — do not break existing products)
  /** Electrical domain for future validation and cable sizing systems. */
  domain?: ElectricalDomain;
  /** Whether this terminal must be connected for a valid system. */
  required?: boolean;
  /** Terminal IDs on other products that this terminal can legally connect to. */
  connectableTo?: string[];
  /** Whether overcurrent protection is required on this terminal's circuit. */
  requiresOvercurrentProtection?: boolean;
  /** Manufacturer-recommended fuse rating for this terminal. */
  recommendedFuseA?: number;
  /** Maximum allowable fuse rating for this terminal's circuit. */
  maxFuseA?: number;
  /** Whether a disconnect switch is required on this terminal's circuit. */
  requiresDisconnect?: boolean;
  /** Nominal voltage at this terminal. */
  voltageNominalV?: number;
  /** Minimum allowable voltage at this terminal. */
  voltageMinV?: number;
  /** Maximum allowable voltage at this terminal. */
  voltageMaxV?: number;
  /** Maximum continuous power at this terminal (W). */
  powerMaxW?: number;
  /** Number of AC phases (1, 2, or 3). */
  phases?: 1 | 2 | 3;
  /** Total number of conductors at this terminal. */
  conductorCount?: number;
  /** Human-readable notes about this terminal. */
  notes?: string;
}

// -----------------------------------------------------------
// Product Pricing
// -----------------------------------------------------------

/** Structured pricing for a physical product. */
export interface ProductPricing {
  msrp: number;
  currency: 'USD' | 'CAD' | 'EUR';
}

// -----------------------------------------------------------
// Data Quality
// -----------------------------------------------------------

/**
 * Indicates the completeness of product data.
 * - complete: All fields verified against manufacturer data.
 * - partial: Some fields are estimates or placeholders.
 * - placeholder: Product is a generic stand-in; most fields are approximate.
 */
export type DataQuality = 'complete' | 'partial' | 'placeholder';

// -----------------------------------------------------------
// Product Category
// -----------------------------------------------------------

/**
 * Broad UI grouping for the part library.
 * Not used for electrical behavior — product type drives behavior.
 */
export type ProductCategory =
  | 'Solar'
  | 'Batteries'
  | 'Charging'
  | 'Inverters'
  | 'Distribution'
  | 'Protection'
  | 'Loads'
  | 'AC Equipment'
  | 'Accessories'
  | 'Monitoring'
  | 'Cables'
  | string; // extensible

// -----------------------------------------------------------
// Electrical Ratings (per product type)
// -----------------------------------------------------------

/** Ratings for MPPT charge controllers. */
export interface MpptRatings {
  /** Battery voltage support (V). */
  batteryVoltagesV: number[];
  /** Maximum PV open-circuit voltage (V). */
  maxPvVoltageV: number;
  /** Maximum PV short-circuit current (A). */
  maxPvCurrentA: number;
  /** Maximum battery charge output current (A). */
  maxOutputCurrentA: number;
  /** Maximum PV power input (W). */
  maxPvPowerW?: number;
  /** Peak conversion efficiency (%). */
  efficiencyPct?: number;
}

/** Ratings for inverter/charger units. */
export interface InverterChargerRatings {
  /** DC bus voltage (V). */
  dcVoltageV: number;
  /** Maximum DC current draw at full inverter output (A). */
  maxDcCurrentA?: number;
  /** Continuous AC inverter output power (W). */
  continuousInverterW: number;
  /** Peak/surge AC output power (W). */
  surgeW?: number;
  /** Maximum AC charger output current (A). */
  chargerCurrentA?: number;
  /** AC input (shore/generator) voltage (V). */
  acInputVoltageV?: number;
  /** Maximum AC input current (A). */
  acInputCurrentA?: number;
  /** AC output voltage (V). */
  acOutputVoltageV?: number;
  /** Maximum AC output current (A). */
  acOutputCurrentA?: number;
  /** Internal transfer switch current rating (A). */
  transferSwitchA?: number;
  /** Peak conversion efficiency (%). */
  efficiencyPct?: number;
}

/** Ratings for batteries. */
export interface BatteryRatings {
  /** Nominal cell/pack voltage (V). */
  nominalVoltageV: number;
  /** Capacity in amp-hours (Ah). */
  capacityAh: number;
  /** Capacity in watt-hours (Wh). */
  capacityWh: number;
  /** Capacity in kilowatt-hours (kWh). */
  capacityKwh: number;
  /** Maximum continuous charge current (A). */
  maxChargeCurrentA?: number;
  /** Maximum continuous discharge current (A). */
  maxDischargeCurrentA?: number;
  /** Peak (pulse) discharge current (A). */
  peakDischargeCurrentA?: number;
  /** Recommended charge voltage (V). */
  chargeVoltageV?: number;
  /** Low-voltage cutoff voltage (V). */
  cutoffVoltageV?: number;
  /** Chemistry type (e.g., LiFePO4, AGM, Gel). */
  chemistry?: string;
  /** Communication interfaces supported (e.g., CANbus, VE.Bus, BMS). */
  communicationInterfaces?: string[];
  /** Whether the battery has an internal BMS. */
  hasInternalBms?: boolean;
}

/** Ratings for DC-DC chargers / converters. */
export interface DcDcChargerRatings {
  /** Input voltage range minimum (V). */
  inputVoltageMinV?: number;
  /** Input voltage range maximum (V). */
  inputVoltageMaxV?: number;
  /** Output voltage (V). */
  outputVoltageV?: number;
  /** Maximum output current (A). */
  outputCurrentA?: number;
  /** Maximum input current (A). */
  inputCurrentA?: number;
  /** Whether the unit provides galvanic isolation. */
  isolated?: boolean;
  /** Output power (W). */
  outputPowerW?: number;
}

/** Ratings for bus bars and DC distribution products. */
export interface BusbarRatings {
  /** Maximum rated voltage (V). */
  voltageRatingV?: number;
  /** Maximum rated current (A). */
  currentRatingA?: number;
  /** Number of connection studs/ports. */
  connectionCount?: number;
  /** Positive bus, negative bus, or combined. */
  busDesignation?: 'positive' | 'negative' | 'combined';
}

/** Ratings for fuses and circuit breakers. */
export interface ProtectionRatings {
  /** Current rating (A). */
  currentRatingA: number;
  /** Voltage rating (V). */
  voltageRatingV?: number;
  /** Interrupt/fault current capacity (A). */
  interruptRatingA?: number;
  /** Whether this device is rated for AC, DC, or both. */
  acDcCompatibility?: 'ac' | 'dc' | 'both';
  /** Fuse style (e.g., ANL, MIDI, MEGA, Class T, MRBF). */
  fuseStyle?: string;
  /** Breaker style (e.g., DC Breaker, Smart BatteryProtect). */
  breakerStyle?: string;
  /** Protection type: fuse (single-use) or breaker (resettable). */
  protectionType?: 'fuse' | 'breaker';
}

export type InternalBusType =
  | 'dc_pos'
  | 'dc_neg'
  | 'pv_pos'
  | 'pv_neg'
  | 'ac_line'
  | 'ac_neutral'
  | 'ac_ground'
  | 'chassis_ground'
  | 'signal'
  | 'unknown';

export interface DistributionBusDefinition {
  id: string;
  label: string;
  busType: InternalBusType;
  terminalIds: string[];
  maxCurrentA?: number;
}

export interface DistributionFuseSlotDefinition {
  id: string;
  label: string;
  upstreamBusId: string;
  downstreamTerminalId: string;
  pairedReturnTerminalId?: string;
  fuseStyle?: string;
  protectionType?: 'fuse' | 'breaker';
  defaultInstalled?: boolean;
  defaultFuseA?: number;
  maxFuseA?: number;
  allowedFuseRatingsA?: number[];
}

export interface DistributionTopology {
  buses: DistributionBusDefinition[];
  fuseSlots?: DistributionFuseSlotDefinition[];
}

export interface FuseSlotState {
  installed?: boolean;
  ratingA?: number;
  fuseProductId?: string;
  includeInBom?: boolean;
}

/** Ratings for solar panels. */
export interface SolarPanelRatings {
  /** Open-circuit voltage (V). */
  vocV: number;
  /** Maximum power point voltage (V). */
  vmpV?: number;
  /** Short-circuit current (A). */
  iscA?: number;
  /** Maximum power point current (A). */
  impA?: number;
  /** Rated power at STC (W). */
  powerW: number;
  /** Temperature coefficient of Pmax (%/°C). */
  tempCoefficientPmax?: number;
  /** Temperature coefficient of Voc (%/°C). */
  tempCoefficientVoc?: number;
}

/** Ratings for PV combiner boxes. */
export interface SolarCombinerRatings {
  /** Number of PV input strings. */
  stringCount: number;
  /** Total number of input terminals. */
  inputCount: number;
  /** Total number of output terminals. */
  outputCount: number;
  /** Maximum input voltage (V). */
  maxVoltageV?: number;
  /** Maximum total input current (A). */
  maxCurrentA?: number;
  /** Description of included protection devices. */
  includedProtection?: string;
}

/** Ratings for DC and AC loads. */
export interface LoadRatings {
  /** Operating voltage (V). */
  voltageV?: number;
  /** Continuous operating current (A). */
  currentA?: number;
  /** Continuous operating power (W). */
  powerW?: number;
  /** Startup/inrush current (A). */
  startupCurrentA?: number;
  /** Estimated duty cycle (0–1). */
  dutyCycle?: number;
}

// -----------------------------------------------------------
// Product (extended — fully backward-compatible)
// -----------------------------------------------------------

export interface Product {
  // --- Identity (existing fields) ---
  id: string;
  manufacturer: string;
  name: string;
  productType: ProductType;

  // --- Catalog fields (existing) ---
  category?: string;
  description?: string;
  nominalVoltage?: NominalVoltage | NominalVoltage[];

  // --- Electrical summary fields (existing — flat, used by canvas & calculations) ---
  capacityWh?: number;
  continuousPowerW?: number;
  peakPowerW?: number;
  maxCurrentA?: number;
  maxPvVoltageV?: number;
  maxPvCurrentA?: number;

  // --- Pricing (existing field names preserved) ---
  msrpUsd?: number;
  oemPriceUsd?: number;

  // --- Source / provenance (existing) ---
  source?: string;
  notes?: string;

  // --- Canvas layout (existing — required) ---
  terminals: TerminalDefinition[];
  width: number;
  height: number;

  // -------------------------------------------------------
  // Extended fields added in catalog refactor
  // All optional — existing products without these fields continue to work.
  // -------------------------------------------------------

  /** Part number from manufacturer. */
  partNumber?: string;
  /** SKU used in ordering systems. */
  sku?: string;
  /** URL to manufacturer product page. */
  productUrl?: string;
  /** URL to manufacturer datasheet. */
  datasheetUrl?: string;
  /** URL to product image. */
  imageUrl?: string;

  /**
   * Structured pricing (supplements msrpUsd/oemPriceUsd).
   * Use getProductPrice() helper to resolve pricing from either source.
   */
  pricing?: ProductPricing;

  /**
   * Indicates how complete and verified the product data is.
   * complete = all fields verified; partial = some estimated; placeholder = generic stand-in.
   */
  dataQuality?: DataQuality;

  /**
   * Typed electrical ratings. Populated for products where detailed specs are available.
   * The flat fields (maxCurrentA, continuousPowerW, etc.) remain the primary source
   * for calculations; these ratings provide additional detail for validation and BOM tools.
   */
  batteryRatings?: BatteryRatings;
  mpptRatings?: MpptRatings;
  inverterChargerRatings?: InverterChargerRatings;
  dcDcChargerRatings?: DcDcChargerRatings;
  busbarRatings?: BusbarRatings;
  protectionRatings?: ProtectionRatings;
  distributionTopology?: DistributionTopology;
  solarPanelRatings?: SolarPanelRatings;
  solarCombinerRatings?: SolarCombinerRatings;
  loadRatings?: LoadRatings;
}

// -----------------------------------------------------------
// System Component
// -----------------------------------------------------------

export interface SystemComponent {
  id: string;
  productId: string;
  label?: string;
  quantity: number;
  x: number;
  y: number;
  rotationDeg?: number;
  busPolarity?: BusPolarity;
  /** Legacy quick selector for arrays that are all-series or all-parallel. */
  solarWiringMode?: SolarWiringMode;
  /** Number of panels/modules in each string. */
  solarSeriesCount?: number;
  /** Number of parallel strings in the array. */
  solarParallelCount?: number;
  customPriceUsd?: number;
  /** Whether this placed component should contribute to BOM rows and cost totals. */
  includeInBom?: boolean;
  /** Per-instance voltage for source/load blocks — overrides product default (V). */
  instanceVoltageV?: number;
  /** Per-instance max current for source/load blocks — overrides product default (A). */
  instanceMaxCurrentA?: number;
  /** Per-slot fuse/breaker settings for fused distribution products. */
  fuseSlots?: Record<string, FuseSlotState>;
  userNotes?: string;
  autoGenerated?: boolean;
  inferredElectricalType?: ElectricalType;
  inferredConnectionKind?: ConnectionPointKind;
  inferredPolarity?: ConnectionPolarity;
  inferredVoltageClass?: VoltageClass;
}

// -----------------------------------------------------------
// System Connection
// -----------------------------------------------------------

export interface SystemConnection {
  id: string;
  fromComponentId: string;
  fromTerminalId: string;
  toComponentId: string;
  toTerminalId: string;
  routePoints?: Array<{ x: number; y: number }>;
  cableLengthFt: number;
  /** User-entered branch design current. Overrides inferred graph current for this conductor. */
  designCurrentOverrideA?: number;
  calculatedCurrentA?: number;
  recommendedFuseA?: number;
  recommendedCableAwg?: string;
  /** User-selected cable size. When omitted, sizing is calculated automatically. */
  manualCableAwg?: string;
  voltageDropV?: number;
  voltageDropPercent?: number;
  autoGenerated?: boolean;
  warnings?: string[];
}

// -----------------------------------------------------------
// Diagram Annotations
// -----------------------------------------------------------

export interface SystemTextAnnotation {
  id: string;
  kind: 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  color: string;
  backgroundColor?: string;
  bold?: boolean;
  italic?: boolean;
  textAlign?: 'left' | 'center' | 'right';
}

// -----------------------------------------------------------
// System Assumptions
// -----------------------------------------------------------

export interface SystemAssumptions {
  inverterEfficiency: number;
  defaultOemDiscountPercent: number;
  defaultCableLengthFt: number;
  maxVoltageDropPercent: number;
  continuousLoadMultiplier: number;
  /** Maximum cable length treated as a short unfused battery-pack interconnect. */
  batteryInterconnectMaxLengthFt: number;
}

// -----------------------------------------------------------
// System Design
// -----------------------------------------------------------

export interface SystemDesign {
  id: string;
  name: string;
  nominalVoltage: NominalVoltage;
  components: SystemComponent[];
  connections: SystemConnection[];
  annotations?: SystemTextAnnotation[];
  assumptions: SystemAssumptions;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------
// BOM
// -----------------------------------------------------------

export type BomSection =
  | 'Energy Storage'
  | 'Charging Sources'
  | 'Power Conversion'
  | 'DC Distribution'
  | 'AC Distribution'
  | 'Protection'
  | 'Cabling'
  | 'Monitoring & Control'
  | 'Accessories';

export interface BomRow {
  id: string;
  section: BomSection;
  productType: ProductType;
  manufacturer: string;
  partName: string;
  description: string;
  quantity: number;
  unitMsrpUsd: number | null;
  extendedMsrpUsd: number | null;
  unitOemUsd: number | null;
  extendedOemUsd: number | null;
  priceSource: string;
  autoGenerated: boolean;
  notes: string;
  componentId: string;
}

export interface PriceSummary {
  totalMsrp: number;
  totalOem: number;
  savings: number;
  bySection: Record<string, { msrp: number; oem: number }>;
  byManufacturer: Record<string, { msrp: number; oem: number }>;
}

// -----------------------------------------------------------
// Warnings
// -----------------------------------------------------------

export type WarningSeverity = 'error' | 'warning' | 'info';

export interface SystemWarning {
  id: string;
  severity: WarningSeverity;
  componentId?: string;
  connectionId?: string;
  message: string;
  code: string;
}
