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
  | 'shorePowerInlet'
  // Grounding / connection point symbols (virtual, no BOM cost)
  | 'connection_point'
  // Communication accessories and gateways
  | 'commAccessory'
  | 'commGateway';

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
export type ConnectionPolarity = 'positive' | 'negative' | 'line' | 'line2' | 'neutral' | 'ground';
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
export type CableLengthUnit = 'ft' | 'm';

// -----------------------------------------------------------
// Connectors / terminations
// -----------------------------------------------------------

/**
 * How a cable physically terminates at a node (product terminal). Baked into
 * product definitions; not user-editable per placed component.
 * - lug: a ring/lug crimped onto the cable, landing on a stud (carries holeSize).
 * - screw_terminal: a clamp/screw terminal that accepts the bare conductor.
 * - mc4_male / mc4_female: PV MC4 connectors (e.g. solar panel leads).
 * Extensible for further specific connector types later.
 */
export type ConnectorKind = 'lug' | 'screw_terminal' | 'mc4_male' | 'mc4_female';

export interface TerminalConnector {
  kind: ConnectorKind;
  /** Stud/hole size for lug-style connectors, e.g. '1/4', '5/16', '3/8', 'M6', 'M8', 'M10'. */
  holeSize?: string;
}

export type ProductCapability =
  | 'ac-charger'
  | 'inverter'
  | 'inverter-charger'
  | 'hybrid-inverter'
  | 'dc-dc-converter'
  | 'mppt'
  | 'pv-input'
  | 'battery-charger';

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
  /** Largest cable this terminal can physically accept, e.g. "6" or "1/0". */
  maxCableAwg?: string;
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
  /** Default physical connector/termination at this node (overridable per placed component). */
  connector?: TerminalConnector;
  /**
   * Marks a terminal that bolts directly to another module's matching terminal with no
   * cable (e.g. Victron Lynx modules share a busbar). When a connection joins two terminals
   * that declare the same non-empty standard, it defaults to a cableless bus link.
   * Brand-agnostic: any bolt-together busbar opts in by declaring the same string.
   */
  busLinkStandard?: string;
  /** Number of AC phases (1, 2, or 3). */
  phases?: 1 | 2 | 3;
  /** Total number of conductors at this terminal. */
  conductorCount?: number;
  /** Human-readable notes about this terminal. */
  notes?: string;
  /**
   * Power ceiling for this terminal (W). When set alongside maxCurrentA, the engine
   * resolves effective current as min(maxCurrentA, maxPowerW / systemVoltage).
   * Use this for conversion products whose output current varies with system voltage
   * (e.g. an MPPT rated 1200W outputs 100A at 12V but only 25A at 48V).
   */
  maxPowerW?: number;
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
  /** Number of independent MPPT solar trackers (hybrid inverters). */
  mpptTrackerCount?: number;
  /** Maximum PV open-circuit voltage per MPPT tracker (V). */
  maxPvVoltageV?: number;
  /** Maximum PV input current per MPPT tracker (A). */
  maxPvCurrentA?: number;
  /** Total maximum PV input power across all trackers (W). */
  maxPvPowerW?: number;
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
  /** Whether matching batteries of this product may be wired in series. */
  seriesAllowed?: boolean;
  /** Maximum number of matching batteries allowed in one series string. */
  maxSeriesCount?: number;
  /** Whether matching battery strings may be wired in parallel. */
  parallelAllowed?: boolean;
  /** Maximum number of matching strings allowed in one parallel pack. */
  maxParallelStrings?: number;
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
  | 'ac_line2'
  | 'ac_neutral'
  | 'ac_ground'
  | 'chassis_ground'
  | 'signal'
  | 'communication'
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

// -----------------------------------------------------------
// Communication System Types
// -----------------------------------------------------------

export type CommunicationProtocol =
  | 'CANopen'
  | 'J1939'
  | 'VE.Bus'
  | 'VE.Direct'
  | 'VE.Can'
  | 'BMS-Can'
  | 'AEbus'
  | 'RS485'
  | 'Ethernet'
  | 'Other';

export type CommunicationConnectorType =
  | 'RJ45'
  | 'M12'
  | 'Deutsch'
  | 'TerminalBlock'
  | 'JST'
  | 'VE.Direct'
  | 'Other';

export type CommunicationTopologyType =
  | 'bus'
  | 'point-to-point'
  | 'daisy-chain'
  | 'star'
  | 'configurable';

export type CommunicationAccessoryBehavior =
  | 'passive'
  | 'terminator'
  | 'active-gateway'
  | 'active-interface';

export interface CommunicationProtocolBridge {
  fromProtocol: CommunicationProtocol;
  toProtocol: CommunicationProtocol;
}

export interface ProductCommunicationPort {
  id: string;
  name: string;
  connectorType: CommunicationConnectorType;
  supportedProtocols: CommunicationProtocol[];
  configuredProtocol?: CommunicationProtocol;
  topology?: CommunicationTopologyType;
  isConfigurable?: boolean;
  notes?: string;
}

export interface CommunicationNetworkError {
  code: string;
  message: string;
}

export interface CommunicationNetworkWarning {
  code: string;
  message: string;
}

export interface CommunicationNetwork {
  id: string;
  portRefs: Array<{ componentId: string; portId: string }>;
  wireIds: string[];
  protocols: CommunicationProtocol[];
  connectorTypes: CommunicationConnectorType[];
  errors: CommunicationNetworkError[];
  warnings: CommunicationNetworkWarning[];
}

/** Wire kind — distinguishes power cables from communication links. */
export type WireKind = 'dc-power' | 'ac-power' | 'communication';

// -----------------------------------------------------------
// Source Type (for generic DC/AC source components)
// -----------------------------------------------------------

export type DcSourceType = 'Vehicle Battery' | 'Alternator' | 'Generic' | 'DC Generator' | 'Solar Charge Output' | 'Auxiliary Battery' | 'Power Supply' | 'Other';
export type AcSourceType = 'Generator' | 'Shore Power' | 'Generic' | 'Inverter Output' | 'Grid' | 'Other';

// -----------------------------------------------------------
// Pre-manufactured Cable Types
// -----------------------------------------------------------

export type CableMode = 'dynamic' | 'premanufactured';

export interface PremanufacturedCable {
  id: string;
  supplier?: string;
  name: string;
  gauge: string;
  length: number;
  lengthUnit: 'ft' | 'm';
  connectorA?: string;
  connectorB?: string;
  polarityCompatibility?: string[];
  voltageTypeCompatibility?: ('DC' | 'AC')[];
  currentRatingA?: number;
  price?: number | null;
  partNumber?: string;
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
  /** Electrical/application capabilities for multi-function products and filtering. */
  capabilities?: ProductCapability[];

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

  /**
   * When true, this product is a virtual schematic symbol (e.g. AC Earth, DC Chassis).
   * Virtual products are excluded from BOM cost calculations.
   */
  isVirtual?: boolean;
  /**
   * When false, this product is excluded from BOM line items even if placed on the canvas.
   * Defaults to true for normal products.
   */
  isBOMItem?: boolean;

  /**
   * Communication ports available on this product for permanent installed network connections.
   */
  communicationPorts?: ProductCommunicationPort[];

  /**
   * For communication accessories: declares whether this component is passive (merges networks)
   * or an active gateway (bridges/isolates protocols).
   */
  commAccessoryBehavior?: CommunicationAccessoryBehavior;

  /**
   * For active gateways: which protocol bridges this component supports.
   */
  commProtocolBridges?: CommunicationProtocolBridge[];
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
  /** Visual scale for the placed product image/symbol in the schematic canvas. */
  imageScale?: number;
  locked?: boolean;
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
  /** Per-instance nominal DC bus voltage for busbar/distribution components (V). */
  dcNominalVoltage?: number;
  /** Per-instance max current for source/load blocks — overrides product default (A). */
  instanceMaxCurrentA?: number;
  /** Largest cable this placed component/node can physically accept, e.g. "6" or "1/0". */
  maxCableAwg?: string;
  /** Whether raw fuse components should add a matching holder/base to the BOM. */
  includeFuseHolder?: boolean;
  /** Optional explicit holder/base product for a raw fuse component. */
  fuseHolderProductId?: string;
  /** Per-slot fuse/breaker settings for fused distribution products. */
  fuseSlots?: Record<string, FuseSlotState>;
  userNotes?: string;
  autoGenerated?: boolean;
  inferredElectricalType?: ElectricalType;
  inferredConnectionKind?: ConnectionPointKind;
  inferredPolarity?: ConnectionPolarity;
  inferredVoltageClass?: VoltageClass;
  /** Per-instance configured protocol for each configurable communication port. Key = portId. */
  configuredProtocols?: Record<string, CommunicationProtocol>;
  /** Descriptive source type for generic DC/AC source components. */
  sourceType?: DcSourceType | AcSourceType;
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
  routeMode?: 'auto' | 'manual';
  cableLengthFt: number;
  /** Unit for cableLengthFt when edited/imported; length is normalized to feet internally. */
  cableLengthUnit?: CableLengthUnit;
  /** User-entered branch design current. Overrides inferred graph current for this conductor. */
  designCurrentOverrideA?: number;
  calculatedCurrentA?: number;
  recommendedFuseA?: number;
  recommendedCableAwg?: string;
  /** User-selected cable size. When omitted, sizing is calculated automatically. */
  manualCableAwg?: string;
  cableColor?: string;
  cableType?: string;
  /**
   * Direct bolted bus link with no cable (e.g. two adjacent Lynx modules). When true the
   * connection still carries current and propagates bus type, but is excluded from the cable
   * BOM, cable-length summary, and connector/lug counts, and gets no AWG/voltage-drop sizing.
   */
  busLink?: boolean;
  /** Derived from circuit analysis — not persisted, overwritten each enrichment pass. */
  busType?: InternalBusType;
  voltageDropV?: number;
  voltageDropPercent?: number;
  autoGenerated?: boolean;
  warnings?: string[];

  // --- Wire kind (power vs communication) ---
  /** Distinguishes power cables from communication links. Defaults to power wiring when absent. */
  wireKind?: WireKind;

  // --- Communication wire fields (only relevant when wireKind = 'communication') ---
  // A communication wire has no protocol of its own; its network type is always
  // derived from the devices it connects (see deriveCommProtocol). Devices with
  // configurable ports set the protocol via SystemComponent.configuredProtocols.
  /** ID of the communication network this wire belongs to (computed, not persisted). */
  networkId?: string;

  // --- Pre-manufactured cable fields ---
  /** Whether this cable run uses a fixed pre-manufactured assembly or a dynamic/custom run. */
  cableMode?: CableMode;
  /** ID of the selected pre-manufactured cable assembly when cableMode = 'premanufactured'. */
  premanufacturedCableId?: string;
  /**
   * Whether this cable should be counted in the cable BOM and length totals.
   * Defaults to true. When false, the wire stays on the diagram and carries current
   * but is excluded from all BOM line items and cable-length summaries.
   */
  includeInBOM?: boolean;
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
  showBackground?: boolean;
  bold?: boolean;
  italic?: boolean;
  textAlign?: 'left' | 'center' | 'right';
}

export type ShapeAnnotationType = 'rectangle' | 'circle' | 'triangle' | 'arrow';

export interface SystemShapeAnnotation {
  id: string;
  kind: 'shape';
  shapeType: ShapeAnnotationType;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor?: string;
  showFill?: boolean;
  strokeWidth?: number;
}

export type SystemDiagramAnnotation = SystemTextAnnotation | SystemShapeAnnotation;

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
  annotations?: SystemDiagramAnnotation[];
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
  productUrl?: string;
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

export interface CableLengthSummaryItem {
  gauge: string;
  color: string;
  type: string;
  totalLengthFt: number;
  cableCount: number;
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
