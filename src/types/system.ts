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
  | 'custom_solar_array'
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
 * Physical connector kind at a device terminal or cable end.
 *
 * Device-terminal kinds (what the device has):
 * - stud: threaded bolt/post — cable end must be a lug whose hole matches the stud diameter.
 * - screw_terminal: cage/clamp screw — cable end must be a ferrule sized to the conductor.
 * - mc4: PV MC4 connector on the device body. Use `gender` to specify male/female.
 *
 * Cable-end kinds (what the cable carries):
 * - lug: ring lug crimped onto cable, bolts onto a stud (hole must match stud diameter).
 * - ferrule: bootlace ferrule crimped onto cable, inserted into a screw terminal.
 * - mc4: MC4 connector on the cable end. Use `gender` to specify male/female.
 */
export type ConnectorKind =
  | 'stud'
  | 'screw_terminal'
  | 'mc4'
  | 'lug'
  | 'ferrule'
  | 'helios_orng'
  | 'helios_blk'
  | 'comm';

export interface TerminalConnector {
  kind: ConnectorKind;
  /**
   * Stud diameter / lug hole size, e.g. 'M6', 'M8', 'M10', '1/4', '5/16', '3/8'.
   * Required on `stud` device terminals — the cable lug hole must match this diameter.
   * Also carried on `lug` cable ends to record which stud size they fit.
   */
  holeSize?: string;
  /** Connector gender, used for gendered connectors such as MC4. */
  gender?: 'male' | 'female';
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

/**
 * Physical connection point exposed on a product.
 *
 * A terminal owns physical/jack properties only. Electrical behavior is resolved
 * from its terminal group and port:
 * - port: medium, topology, role/direction, voltage/current/power boundary
 * - terminal group: conductor/interface, polarity, internal commoning, OCP/fuse
 * - terminal: label, placement, connector, per-jack physical limits
 */
export interface TerminalDefinition {
  id: string;
  label: string;
  /** Per-jack/contact current rating (A), not the circuit operating current. */
  maxCurrentA?: number;
  side: TerminalSide;
  offsetX: number;
  offsetY: number;
  /** Whether this terminal must be connected for a valid system. */
  required?: boolean;
  /** Terminal IDs on other products that this terminal can legally connect to. */
  connectableTo?: string[];
  /**
   * Smallest cable this terminal/datasheet allows, e.g. "14" or "2".
   * Cable acceptance is terminal-owned because the device terminal block/stud
   * and product datasheet determine the usable wire range.
   */
  minCableAwg?: string;
  /** Largest cable this terminal can physically accept, e.g. "6" or "1/0". */
  maxCableAwg?: string;
  /** Manufacturer-recommended cable size for this terminal/connection. */
  recommendedCableAwg?: string;
  /** Default physical connector/termination at this node (overridable per placed component). */
  connector?: TerminalConnector;
  /**
   * Maximum simultaneous connections allowed on this terminal. When unset, defaults are
   * derived from the connector type (RJ45/M12/MC4 -> 1, stud/screw_terminal -> unlimited).
   */
  maxConnections?: number;
  /**
   * Marks a terminal that bolts directly to another module's matching terminal with no
   * cable. Matching standards default to a cableless bus link.
   */
  busLinkStandard?: string;
  /** Internal group / interface this physical terminal belongs to. */
  terminalGroupId?: string;
  /** Human-readable notes about this terminal. */
  notes?: string;
}

/**
 * A terminal as returned by getEffectiveTerminals. Physical terminal data is
 * augmented with electrical facts resolved from its terminal group and port.
 */
export type EffectiveTerminal = TerminalDefinition & {
  kind: ConnectionPointKind;
  polarity?: ConnectionPolarity;
  role: ConnectionRole;
  direction: TerminalDirection;
  voltageClass?: VoltageClass;
  electricalType?: ElectricalType;
  portId?: string;
  nominalVoltageV?: number;
  voltageMinV?: number;
  voltageMaxV?: number;
  requiresOvercurrentProtection?: boolean;
  requiresDisconnect?: boolean;
  recommendedFuseA?: number;
  maxFuseA?: number;
  maxPowerW?: number;
  phases?: 1 | 2 | 3;
};

/**
 * Electrical/communication character of a port — what kind of circuit it is.
 * The port owns this; terminals are just the physical connectors on the port.
 */
export type PortKind = 'dc' | 'ac' | 'pv' | 'comm' | 'ground' | 'signal' | 'generic';

/**
 * Circuit shape of a port — orthogonal to `kind` (the electrical medium). Drives
 * bonding, DC+/DC- return pairing, and pass-through current semantics:
 * - `two_pole`: a complete circuit with opposite-polarity poles (battery, inverter
 *   DC, DC-DC side). Same-polarity jacks bond; a connected pole requires its return.
 * - `bus`: a single-polarity shared node with many connectors (busbar, battery posts).
 *   All connectors bond into one node; no +/- pairing required.
 * - `pass_through`: a series element whose terminals are distinct nodes with the
 *   device between them (fuse, breaker, shunt, disconnect). Terminals never bond;
 *   current in equals current out; no +/- pairing required.
 */
export type PortTopology = 'two_pole' | 'bus' | 'pass_through';

/**
 * Logical character of a terminal group — what the internal common node / interface is.
 * Drives how the validation engine treats the group:
 * - `power_conductor`: an internal power node (battery DC+ common, busbar stud group).
 *   Carries `kind`/`polarity` and an internal `maxCurrentA` bus rating.
 * - `communication_interface`: one logical comm interface (e.g. a CAN interface exposed
 *   as two RJ45 jacks). Modelled at protocol level, never as individual CAN-H/CAN-L pins.
 * - `signal_interface`: a low-voltage sense/control interface.
 * - `ground_reference`: a chassis/earth reference node.
 */
export type TerminalGroupType =
  | 'power_conductor'
  | 'communication_interface'
  | 'signal_interface'
  | 'ground_reference';

/**
 * An internal common node or logical interface behind one or more terminals.
 *
 * For power, this is where conductor-level internal commoning and internal bus limits
 * live — e.g. a battery's four DC+ posts are one `power_conductor` group with an
 * `internallyCommon` 400 A bus, while each physical post is rated 250 A on its terminal.
 * For communication, this is one logical protocol interface, not individual conductor pins.
 *
 * Every active product terminal references an explicit group.
 */
export interface TerminalGroupDefinition {
  /** Stable id, referenced by `TerminalDefinition.terminalGroupId`. */
  id: string;
  /** Port this group belongs to (matches `ProductPort.id`). */
  portId: string;
  label?: string;

  groupType: TerminalGroupType;

  /** Conductor polarity for power conductors. */
  polarity?: ConnectionPolarity;

  /** True when all terminals in this group are the same internal node. */
  internallyCommon: boolean;

  /** Internal bus/common-node current rating (A) — may exceed the device source rating. */
  maxCurrentA?: number;

  /** Internal voltage rating (V) if applicable. */
  maxVoltageV?: number;

  // --- Circuit protection requirements (apply per-pole to this group's conductors) ---
  /** Whether this group's conductor requires overcurrent protection (a fuse/breaker). */
  requiresOvercurrentProtection?: boolean;
  /** Whether this group's conductor requires a disconnect. */
  requiresDisconnect?: boolean;
  /** Manufacturer-recommended fuse rating for this group's conductor (A). */
  recommendedFuseA?: number;
  /** Maximum allowable fuse rating for this group's conductor (A). */
  maxFuseA?: number;

  notes?: string;
}

/**
 * A device-internal port/circuit referenced by terminal groups.
 * Groups the terminals of one circuit (e.g. a battery's "main", a DC-DC
 * converter's "input"/"output", or a comm bus with several connectors) and
 * owns the boundary specs (voltage, current, kind) for that circuit.
 *
 * Ports own electrical boundary specs. Terminals are physical jacks; terminal
 * groups assign those jacks to conductor/interface groups on a port.
 */
export interface ProductPort {
  /** Stable id matched by `TerminalGroupDefinition.portId`. */
  id: string;
  /** Human-readable name (e.g. "Battery", "Input", "Output"). */
  label?: string;

  /** Electrical medium of this port. Owns kind for all its terminals. */
  kind: PortKind;
  /**
   * Circuit shape: drives bonding, +/- pairing, and pass-through semantics.
   * Orthogonal to `kind`.
   */
  topology: PortTopology;
  /** Whole-port power-flow role (e.g. an input port is a `sink`). */
  role: ConnectionRole;
  /** Whole-port power-flow direction. */
  direction?: TerminalDirection;

  // --- Electrical boundary specs (dc / ac / pv / generic) ---
  /**
   * Voltage class / service of this port: the compatibility band two ports must
   * share to be wired together (AC 120 V vs 240 V, DC low voltage, PV high voltage).
   * The port owns this; its terminals are conductors within the service, identified
   * by `polarity` (line/line2/neutral/ground or DC +/-). The actual voltage between
   * two conductors is derived from this class plus the two polarities.
   */
  voltageClass?: VoltageClass;
  /** Nominal voltage at this port (V). Falls back to device nominalVoltage when unset. */
  nominalVoltageV?: number;
  /** Minimum allowable voltage at this port (V). */
  voltageMinV?: number;
  /** Maximum allowable voltage at this port (V) — e.g. PV Voc. */
  voltageMaxV?: number;
  /**
   * Maximum current the device's internal busbar for this port can carry,
   * including pass-through current from daisy-chained parallel devices. May
   * exceed the device's own source rating. When unset, no bus limit is enforced.
   */
  maxCurrentA?: number;
  /** Maximum power through this port (W) — e.g. PV input power. */
  maxPowerW?: number;
  /**
   * Maximum power through this port keyed by system (battery) voltage, in W.
   * For MPPT PV ports, max PV array power is voltage-dependent — e.g.
   * `{ 12: 500, 24: 1000, 48: 2000 }`. When present, prefer this over the
   * scalar `maxPowerW`; resolve via the actual system voltage and fall back to
   * `maxPowerW` for voltages not listed.
   */
  maxPowerByVoltageW?: Partial<Record<number, number>>;
  /** Number of AC phases at this port (AC ports only). */
  phases?: 1 | 2 | 3;

  // --- Communication boundary specs (comm ports only) ---
  connectorType?: CommunicationConnectorType;
  supportedProtocols?: CommunicationProtocol[];
  configuredProtocol?: CommunicationProtocol;
  isConfigurable?: boolean;
  /** Network topology of the comm bus (bus/daisy-chain/star) — distinct from circuit `topology`. */
  commTopology?: CommunicationTopologyType;
  /** Connector gender for gendered comm connectors (M12, Deutsch, JST). */
  gender?: 'male' | 'female';
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
  /** Maximum PV power input (W). For voltage-dependent ratings, see maxPvPowerByVoltageW. */
  maxPvPowerW?: number;
  /**
   * Maximum PV power input keyed by battery/system voltage, in W — e.g.
   * `{ 12: 500, 24: 1000, 48: 2000 }`. Victron MPPTs rate max PV power per
   * system voltage; prefer this over the scalar `maxPvPowerW` when present.
   */
  maxPvPowerByVoltageW?: Partial<Record<number, number>>;
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

/** Per-instance ratings for an explicit aggregate/customer-supplied PV array. */
export interface CustomSolarArrayRatings {
  /** Total open-circuit voltage of the array/string/input (V). */
  vocV?: number;
  /** Total voltage at max power (V). */
  vmpV?: number;
  /** Total short-circuit current (A). */
  iscA?: number;
  /** Total current at max power (A). */
  impA?: number;
  /** Total STC rated power (W). */
  powerW?: number;
  /** Optional cold-corrected Voc for MPPT max voltage checks (V). */
  coldVocV?: number;
  /** User note describing the customer-supplied/existing array. */
  description?: string;
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
  | 'Pylon LV'
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
  /** Connector gender for gendered comm connectors (M12, Deutsch, JST). */
  gender?: 'male' | 'female';
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

/**
 * A single variant within a product family.
 * The base Product holds all shared fields (terminals, image, comms ports, etc.).
 * Each variant overrides only what changes between models in the family.
 * The catalog loader expands variants into full Product entries at load time.
 */
export interface ProductVariant {
  /** Unique product ID for this variant (e.g. "fuse-mega-generic-58v-100a", "mppt-150-35"). */
  id: string;

  /**
   * Full display name for this variant (e.g. "SmartSolar MPPT 150/35").
   * If omitted, the loader generates "{baseName} {currentRatingA}A".
   */
  name?: string;

  /** Primary current rating (A). For fuses/breakers: the fuse rating. For MPPTs: the output current. */
  currentRatingA: number;

  /** Max PV input voltage (V). MPPTs only. */
  maxPvVoltageV?: number;

  /** Continuous output power (W). MPPTs only. */
  continuousPowerW?: number;

  /**
   * Supported battery system voltages for this variant.
   * MPPTs only — some models in a family support fewer voltages than others.
   */
  nominalVoltage?: NominalVoltage | NominalVoltage[];

  msrpUsd?: number;
  oemPriceUsd?: number;
  partNumber?: string;
  productUrl?: string;

  /** Override image URL when variants in a family use different physical form factors. */
  imageUrl?: string;
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
  /**
   * Internal port/circuit definitions referenced by terminal groups.
   * A port groups the terminals of one circuit and can declare the rating of the
   * device's internal busbar for that circuit — which may exceed the device's own
   * source rating to allow pass-through (e.g. a battery sources 200A but its
   * internal busbar carries 400A so a second battery can be daisy-chained through
   * it). Per-jack limits live on each terminal's `maxCurrentA`.
   */
  ports?: ProductPort[];
  /**
   * Explicit terminal groups (internal common nodes / logical interfaces) referenced by
   * `TerminalDefinition.terminalGroupId`. This is where internal power-conductor commoning
   * and internal bus current limits live (e.g. a battery's DC+ posts sharing a 400 A
   * internal bus). Active products declare these explicitly.
   */
  terminalGroups?: TerminalGroupDefinition[];
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
   * Legacy communication port metadata. ProductPort(kind='comm') is the canonical
   * owner of protocol/connector metadata; keep this only as a migration fallback.
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

  /**
   * Variant list for product families that share all attributes except current rating and price.
   * When present, the catalog loader expands these into individual Product entries in ALL_PRODUCTS.
   * The base product itself is not added to the catalog — only the resolved variants are.
   */
  variants?: ProductVariant[];
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
  /** @deprecated Legacy hidden solar multiplier; sanitized from live components. */
  solarWiringMode?: SolarWiringMode;
  /** @deprecated Legacy hidden solar multiplier; sanitized from live components. */
  solarSeriesCount?: number;
  /** @deprecated Legacy hidden solar multiplier; sanitized from live components. */
  solarParallelCount?: number;
  /** Per-instance aggregate ratings. Valid only for productType custom_solar_array. */
  customSolarArrayRatings?: CustomSolarArrayRatings;
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

export interface BuilderIssue {
  id: string;
  severity: WarningSeverity;
  message: string;
  code: string;
  componentId?: string;
  connectionId?: string;
  productId?: string;
  field?: string;
  source?: 'system_warning' | 'design_issue' | 'product_validation' | 'component_configuration';
}
