import type {
  BuilderIssue,
  CommunicationNetwork,
  CustomSolarArrayRatings,
  FuseSlotState,
  SystemComponent,
  SystemConnection,
  Product,
  ProductPort,
  NominalVoltage,
  CommunicationProtocol,
  DcSourceType,
  AcSourceType,
} from '../../types/system';
import { useState } from 'react';
import { CABLE_TABLE } from '../../data/cableAmpacity';
import { fmt } from '../../utils/priceCalculations';
import type { SolarArrayAggregation } from '../../utils/solarCalculations';
import {
  calculateSolarStringStats,
  findSolarArrayFeedingPort,
  getSolarPanelUnitRatings,
} from '../../utils/solarCalculations';
import { isDcBusProduct } from '../../utils/dcBusVoltage';
import { getTerminalPortId, terminalKind, terminalRole } from '../../utils/portSpecs';
import { getFuseRating } from '../../utils/fuseSelection';
import { getEffectiveTerminals } from '../../utils/effectiveTerminals';
import type { SystemDesignAnalysis } from '../../utils/analysis';
import {
  COMPONENT_SCALE_MAX,
  COMPONENT_SCALE_MIN,
  COMPONENT_SCALE_STEP,
  clampComponentScale,
  componentScale,
} from '../../utils/componentScale';
import { getProductBuilderUrl } from '../../utils/productBuilderLinks';

type SourceLoadKind = 'dc_source' | 'ac_source' | 'dc_load' | 'ac_load';

const DC_SOURCE_TYPES: DcSourceType[] = ['Generic', 'Vehicle Battery', 'Alternator', 'Auxiliary Battery', 'DC Generator', 'Solar Charge Output', 'Power Supply', 'Other'];
const AC_SOURCE_TYPES: AcSourceType[] = ['Generic', 'Shore Power', 'Generator', 'Grid', 'Inverter Output', 'Other'];

function getSourceLoadKind(product: Product): SourceLoadKind | null {
  if (product.productType === 'dc_load') return 'dc_load';
  if (product.productType === 'ac_load') return 'ac_load';
  const hasAcSource = product.terminals.some((t) => terminalRole(product, t) === 'source' && terminalKind(product, t) === 'ac_power');
  if (hasAcSource && product.productType === 'shorePowerInlet') return 'ac_source';
  const hasDcSource = product.terminals.some((t) => terminalRole(product, t) === 'source' && terminalKind(product, t) === 'dc_power');
  if (hasDcSource && product.productType === 'accessory' && product.dataQuality === 'placeholder') return 'dc_source';
  return null;
}

interface Props {
  component: SystemComponent;
  product: Product;
  components: SystemComponent[];
  connections: SystemConnection[];
  products: Map<string, Product>;
  systemVoltage: NominalVoltage;
  solarArray?: SolarArrayAggregation;
  analysis?: SystemDesignAnalysis;
  componentIssues?: BuilderIssue[];
  availableFuseProducts?: Array<{ ratingA: number; productId: string }>;
  autoSizedProductId?: string | null;
  debugMode: boolean;
  onChangeProduct?: (productId: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
  onUpdatePrice: (id: string, price: number | undefined) => void;
  onUpdateIncludeInBom: (id: string, includeInBom: boolean) => void;
  onUpdateInstanceVoltage: (id: string, voltageV: number | undefined) => void;
  onUpdateDcBusNominalVoltage: (id: string, voltageV: number | undefined) => void;
  onUpdateInstanceMaxCurrent: (id: string, currentA: number | undefined) => void;
  onUpdateComponentMaxCableAwg: (id: string, awg: string | undefined) => void;
  onUpdateComponentImageScale: (id: string, scale: number) => void;
  onUpdateBusPolarity: (id: string, busPolarity: SystemComponent['busPolarity']) => void;
  onUpdateFuseSlot: (id: string, slotId: string, patch: FuseSlotState) => void;
  onOpenFusePicker?: (componentId: string, slotId: string) => void;
  onRemoveFuseSlot?: (componentId: string, slotId: string) => void;
  onUpdateCustomSolarArrayRatings: (id: string, ratings: CustomSolarArrayRatings) => void;
  onUpdateConfiguredProtocol?: (id: string, portId: string, protocol: CommunicationProtocol | undefined) => void;
  onUpdateSourceType?: (id: string, sourceType: DcSourceType | AcSourceType | undefined) => void;
  onRemove: (id: string) => void;
}

function SpecRow({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="spec-row">
      <span className="spec-row-label">{label}</span>
      <span className="spec-row-value">{value ?? '-'}</span>
    </div>
  );
}

function fmtUnit(value: number | undefined, unit: string, digits = 0): string | null {
  if (value == null || !Number.isFinite(value)) return null;
  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} ${unit}`;
}

function compactLabel(value: string): string {
  return value.replace(/_/g, ' ');
}

function portKindLabel(kind: ProductPort['kind']): string {
  switch (kind) {
    case 'dc':
      return 'DC Power';
    case 'ac':
      return 'AC Power';
    case 'pv':
      return 'Solar Input';
    case 'comm':
      return 'Communication';
    case 'ground':
      return 'Ground';
    case 'signal':
      return 'Signal';
    default:
      return 'General Purpose';
  }
}

function connectionTerminalId(componentId: string, connection: SystemConnection): string | undefined {
  if (connection.fromComponentId === componentId) return connection.fromTerminalId;
  if (connection.toComponentId === componentId) return connection.toTerminalId;
  return undefined;
}

function PortSummarySection({
  component,
  product,
  port,
  components,
  connections,
  products,
  systemVoltage,
  analysis,
  onUpdateConfiguredProtocol,
  collapsed,
  onToggleCollapsed,
}: {
  component: SystemComponent;
  product: Product;
  port: ProductPort;
  components: SystemComponent[];
  connections: SystemConnection[];
  products: Map<string, Product>;
  systemVoltage: NominalVoltage;
  analysis?: SystemDesignAnalysis;
  onUpdateConfiguredProtocol?: (id: string, portId: string, protocol: CommunicationProtocol | undefined) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const effectiveTerminals = getEffectiveTerminals(product, component)
    .filter((terminal) => terminal.portId === port.id || getTerminalPortId(product, terminal) === port.id);
  const terminalIds = new Set(effectiveTerminals.map((terminal) => terminal.id));
  const portConnections = connections.filter((connection) => {
    const terminalId = connectionTerminalId(component.id, connection);
    return terminalId != null && terminalIds.has(terminalId);
  });

  const groupDefs = product.terminalGroups?.filter((group) => group.portId === port.id) ?? [];
  const maxTerminalCurrentA = Math.max(0, ...effectiveTerminals.map((terminal) => terminal.maxCurrentA ?? 0));
  const currentLimitA = port.maxCurrentA ?? (maxTerminalCurrentA > 0 ? maxTerminalCurrentA : undefined);
  const maxPowerW = port.maxPowerByVoltageW?.[systemVoltage] ?? port.maxPowerW;
  const terminalIssueKeys = new Set(effectiveTerminals.map((terminal) => `${component.id}:${terminal.id}`));
  const groupIssueKeys = new Set(groupDefs.map((group) => `${component.id}:${group.id}`));
  const portIssues = analysis?.issues.filter((issue) =>
    issue.componentId === component.id &&
    (
      (issue.terminalKey != null && terminalIssueKeys.has(issue.terminalKey)) ||
      (issue.terminalGroupKey != null && groupIssueKeys.has(issue.terminalGroupKey))
    )
  ) ?? [];
  const communicationNetwork = port.kind === 'comm'
    ? analysis?.communicationNetworks.find((network: CommunicationNetwork) =>
        network.portRefs.some((ref) => ref.componentId === component.id && ref.portId === port.id)
      )
    : undefined;
  const configuredProtocol = component.configuredProtocols?.[port.id] ?? port.configuredProtocol;
  const pvArray = port.kind === 'pv'
    ? findSolarArrayFeedingPort(component.id, [...terminalIds], components, connections, products)
    : undefined;
  const pvStats = pvArray?.stats;
  const voltageRange = port.voltageMinV != null && port.voltageMaxV != null
    ? `${fmtUnit(port.voltageMinV, 'V')} to ${fmtUnit(port.voltageMaxV, 'V')}`
    : null;
  const communicationIssueCount = communicationNetwork
    ? communicationNetwork.errors.length + communicationNetwork.warnings.length
    : 0;
  const supportedProtocols = port.supportedProtocols ?? [];

  // PV ports get a simplified, customer-facing card: attached array size and
  // basic port ratings only. No connection/terminal/design-current engineering detail.
  if (port.kind === 'pv') {
    return (
      <div className="port-summary-card">
        <div className="port-summary-heading">
          <div className="port-summary-heading-copy">
            <div className="port-summary-title">{port.label ?? port.id}</div>
            <div className="port-summary-meta">Solar Input</div>
          </div>
          <div className="port-summary-heading-actions">
            {portIssues.length > 0 && (
              <span className="port-summary-badge">{portIssues.length}</span>
            )}
            <button
              type="button"
              className="port-summary-toggle"
              aria-expanded={!collapsed}
              aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${port.label ?? port.id}`}
              onClick={onToggleCollapsed}
            >
              <span className="port-summary-toggle-icon" aria-hidden="true">{collapsed ? '+' : '-'}</span>
            </button>
          </div>
        </div>

        {collapsed ? null : (
          <>
            <div className="port-summary-subsection">
              <div className="port-summary-subtitle">Attached Array</div>
              {pvStats ? (
                <>
                  <SpecRow label="Array Size" value={fmtUnit(pvStats.powerW, 'W')} />
                  <SpecRow label="Panels" value={`${pvStats.panelCount}`} />
                  <SpecRow label="Strings" value={`${pvArray?.strings.length ?? 0}`} />
                  <SpecRow label="Voc" value={fmtUnit(pvStats.vocV, 'V', 1)} />
                  {pvStats.coldVocV != null && <SpecRow label="Cold Voc" value={fmtUnit(pvStats.coldVocV, 'V', 1)} />}
                  {pvStats.vmpV != null && <SpecRow label="Vmp" value={fmtUnit(pvStats.vmpV, 'V', 1)} />}
                  {pvStats.iscA != null && <SpecRow label="Isc" value={fmtUnit(pvStats.iscA, 'A', 1)} />}
                  {pvStats.impA != null && <SpecRow label="Imp" value={fmtUnit(pvStats.impA, 'A', 1)} />}
                  {(pvArray?.mismatches.length ?? 0) > 0 && (
                    <div className="port-summary-warning">Parallel strings have mismatched open-circuit voltage.</div>
                  )}
                </>
              ) : (
                <div className="port-summary-empty">No PV array detected on this port.</div>
              )}
            </div>

            <div className="port-summary-subsection">
              <div className="port-summary-subtitle">Port Ratings</div>
              {port.nominalVoltageV != null && <SpecRow label="Nominal Voltage" value={fmtUnit(port.nominalVoltageV, 'V')} />}
              {port.voltageMinV != null && <SpecRow label="Min Voltage" value={fmtUnit(port.voltageMinV, 'V')} />}
              {port.voltageMaxV != null && <SpecRow label="Max Voltage" value={fmtUnit(port.voltageMaxV, 'V')} />}
              {currentLimitA != null && <SpecRow label="Current Limit" value={fmtUnit(currentLimitA, 'A')} />}
              {maxPowerW != null && <SpecRow label="Power Limit" value={fmtUnit(maxPowerW, 'W')} />}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="port-summary-card">
      <div className="port-summary-heading">
        <div className="port-summary-heading-copy">
          <div className="port-summary-title">{port.label ?? port.id}</div>
          <div className="port-summary-meta">{portKindLabel(port.kind)}</div>
        </div>
        <div className="port-summary-heading-actions">
          {portIssues.length > 0 && (
            <span className="port-summary-badge">{portIssues.length}</span>
          )}
          <button
            type="button"
            className="port-summary-toggle"
            aria-expanded={!collapsed}
            aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${port.label ?? port.id}`}
            onClick={onToggleCollapsed}
          >
            <span className="port-summary-toggle-icon" aria-hidden="true">{collapsed ? '+' : '-'}</span>
          </button>
        </div>
      </div>

      {collapsed ? null : (
        <>
          {(port.kind === 'dc' || port.kind === 'ac') && (
            <div className="port-summary-subsection">
              <div className="port-summary-subtitle">Port Ratings</div>
              {port.nominalVoltageV != null && <SpecRow label="Voltage" value={fmtUnit(port.nominalVoltageV, 'V')} />}
              {voltageRange != null && <SpecRow label="Allowed Voltage" value={voltageRange} />}
              {voltageRange == null && port.voltageMinV != null && <SpecRow label="Minimum Voltage" value={fmtUnit(port.voltageMinV, 'V')} />}
              {voltageRange == null && port.voltageMaxV != null && <SpecRow label="Maximum Voltage" value={fmtUnit(port.voltageMaxV, 'V')} />}
              {currentLimitA != null && <SpecRow label="Max Current" value={fmtUnit(currentLimitA, 'A')} />}
              {maxPowerW != null && <SpecRow label="Max Power" value={fmtUnit(maxPowerW, 'W')} />}
              {port.phases != null && <SpecRow label="AC Service" value={`${port.phases}-phase`} />}
            </div>
          )}

          {port.kind === 'comm' && (
            <div className="port-summary-subsection">
              <div className="port-summary-subtitle">Communication Port</div>
              <SpecRow label="Connector" value={effectiveTerminals.find(t => t.connectorType != null)?.connectorType ?? null} />
              {port.isConfigurable && onUpdateConfiguredProtocol ? (
                <div className="spec-row-editable">
                  <span className="spec-row-label">Protocol</span>
                  <select
                    className="inspector-input port-summary-select"
                    value={configuredProtocol ?? ''}
                    onChange={(e) => {
                      const val = e.target.value as CommunicationProtocol | '';
                      onUpdateConfiguredProtocol(component.id, port.id, val || undefined);
                    }}
                  >
                    <option value="">Not configured</option>
                    {supportedProtocols.map((proto) => (
                      <option key={proto} value={proto}>{proto}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <SpecRow label="Active Protocol" value={configuredProtocol ?? null} />
              )}
              <SpecRow label="Supported Protocols" value={supportedProtocols.join(', ') || null} />
              <SpecRow
                label="Status"
                value={communicationNetwork
                  ? communicationIssueCount > 0 ? 'Needs review' : 'Connected'
                  : portConnections.length > 0 ? 'Wired' : 'Not connected'}
              />
              {communicationNetwork && communicationNetwork.protocols.length > 0 && (
                <SpecRow label="Network Protocol" value={communicationNetwork.protocols.join(', ')} />
              )}
              {communicationIssueCount > 0 && (
                <SpecRow label="Review Items" value={`${communicationIssueCount}`} />
              )}
            </div>
          )}

          {(port.kind === 'ground' || port.kind === 'signal' || port.kind === 'generic') && (
            <div className="port-summary-subsection">
              <div className="port-summary-subtitle">Port Details</div>
              {port.voltageClass && <SpecRow label="Service" value={compactLabel(port.voltageClass)} />}
              {currentLimitA != null && <SpecRow label="Max Current" value={fmtUnit(currentLimitA, 'A')} />}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function ComponentInspector({
  component,
  product,
  components,
  connections,
  products,
  systemVoltage,
  solarArray,
  analysis,
  availableFuseProducts,
  autoSizedProductId,
  debugMode,
  onChangeProduct,
  onUpdateLabel,
  onUpdatePrice,
  onUpdateIncludeInBom,
  onUpdateInstanceVoltage,
  onUpdateDcBusNominalVoltage,
  onUpdateInstanceMaxCurrent,
  onUpdateComponentMaxCableAwg,
  onUpdateComponentImageScale,
  onUpdateBusPolarity,
  onUpdateFuseSlot,
  onOpenFusePicker,
  onRemoveFuseSlot,
  onUpdateCustomSolarArrayRatings,
  onUpdateConfiguredProtocol,
  onUpdateSourceType,
  onRemove,
}: Props) {
  const [collapsedPorts, setCollapsedPorts] = useState<Record<string, boolean>>({});
  const sourceLoadKind = getSourceLoadKind(product);
  const effectiveMsrp = component.customPriceUsd ?? product.msrpUsd ?? null;
  const capacityKwh = product.capacityWh
    ? (product.capacityWh / 1000).toFixed(2)
    : null;
  const solarStats = calculateSolarStringStats(component, product);
  const solarUnit = getSolarPanelUnitRatings(product);
  const arrayStats = solarArray?.stats;
  const customSolarRatings = component.customSolarArrayRatings ?? {};
  const computedCustomSolarPower =
    customSolarRatings.vmpV != null && customSolarRatings.impA != null
      ? customSolarRatings.vmpV * customSolarRatings.impA
      : undefined;
  const supplierUrl = product.productUrl ?? product.datasheetUrl;
  const includeInBom = component.includeInBom !== false;
  const fuseSlots = product.distributionTopology?.fuseSlots ?? [];
  const isDcBus = isDcBusProduct(product);
  const imageScale = componentScale(component);
  const productMaxCableAwg = (() => {
    const awgs = product.terminals
      .filter((t) => ['dc_power', 'pv_power', 'ac_power'].includes(terminalKind(product, t)) && t.maxCableAwg)
      .map((t) => t.maxCableAwg!);
    if (awgs.length === 0) return null;
    const minIdx = Math.min(...awgs.map((awg) => CABLE_TABLE.findIndex((c) => c.awg === awg)).filter((i) => i >= 0));
    return CABLE_TABLE[minIdx]?.label ?? null;
  })();

  return (
    <div className="inspector-content">
      <div className="inspector-section">
        <div className="inspector-label">Label</div>
        <input
          className="inspector-input"
          value={component.label ?? product.name}
          onChange={(e) => onUpdateLabel(component.id, e.target.value)}
        />
      </div>

      <div className="inspector-section">
        <div className="inspector-label">Product</div>
        <div style={{ color: 'var(--ink)', fontSize: 14, fontWeight: 700 }}>{product.name}</div>
        <div style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700 }}>{product.manufacturer}</div>
        {debugMode && import.meta.env.DEV && (
          <a
            className="supplier-link inspector-builder-link"
            href={getProductBuilderUrl(product.id)}
            target="_blank"
            rel="noreferrer"
          >
            Open in Product Builder
          </a>
        )}
      </div>

      <div className="inspector-section">
        <div className="inspector-label">Canvas Scale</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center' }}>
          <input
            type="range"
            min={COMPONENT_SCALE_MIN}
            max={COMPONENT_SCALE_MAX}
            step={COMPONENT_SCALE_STEP}
            value={imageScale}
            onChange={(e) => onUpdateComponentImageScale(component.id, Number(e.target.value))}
          />
          <div style={{ color: 'var(--ink)', fontSize: 12, fontWeight: 800, minWidth: 42, textAlign: 'right' }}>
            {Math.round(imageScale * 100)}%
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button
            type="button"
            className="btn-secondary-inline"
            onClick={() => onUpdateComponentImageScale(component.id, imageScale - COMPONENT_SCALE_STEP)}
          >
            -
          </button>
          <button
            type="button"
            className="btn-secondary-inline"
            onClick={() => onUpdateComponentImageScale(component.id, 1)}
            disabled={clampComponentScale(imageScale) === 1}
          >
            Reset
          </button>
          <button
            type="button"
            className="btn-secondary-inline"
            onClick={() => onUpdateComponentImageScale(component.id, imageScale + COMPONENT_SCALE_STEP)}
          >
            +
          </button>
        </div>
      </div>

      {(product.productType === 'fuse' || product.productType === 'breaker') &&
        availableFuseProducts && availableFuseProducts.length > 0 && onChangeProduct && (
        <div className="inspector-section">
          <div className="inspector-label">Rating</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <select
              className="inspector-input"
              style={{ flex: 1 }}
              value={product.maxCurrentA ?? ''}
              onChange={(e) => {
                const ratingA = Number(e.target.value);
                const match = availableFuseProducts.find((p) => p.ratingA === ratingA);
                if (match) onChangeProduct(match.productId);
              }}
            >
              {availableFuseProducts.map(({ ratingA, productId }) => (
                <option key={productId} value={ratingA}>{ratingA} A</option>
              ))}
            </select>
            {autoSizedProductId && (
              <button
                className="btn-secondary-inline"
                onClick={() => onChangeProduct(autoSizedProductId!)}
                title="Apply recommended rating based on circuit current"
              >
                Auto Size
              </button>
            )}
          </div>
        </div>
      )}

      {product.productType === 'custom_solar_array' && (
        <div className="inspector-section">
          <div className="inspector-label">Aggregate PV Ratings</div>
          {([
            ['vocV', 'Array Voc', 'V'],
            ['vmpV', 'Array Vmp', 'V'],
            ['iscA', 'Array Isc', 'A'],
            ['impA', 'Array Imp', 'A'],
            ['powerW', 'Array Power', 'W'],
            ['coldVocV', 'Cold Voc', 'V'],
          ] as const).map(([field, label, unit]) => (
            <div className="spec-row spec-row-editable" key={field}>
              <span className="spec-row-label">{label}</span>
              <input
                type="number"
                className="spec-row-input"
                min={0}
                step={field === 'powerW' ? 10 : 0.1}
                value={customSolarRatings[field] ?? ''}
                placeholder={field === 'powerW' && computedCustomSolarPower != null ? String(Math.round(computedCustomSolarPower)) : ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  onUpdateCustomSolarArrayRatings(component.id, {
                    ...customSolarRatings,
                    [field]: Number.isFinite(value) ? value : undefined,
                  });
                }}
              />
              <span className="spec-row-unit">{unit}</span>
            </div>
          ))}
          {customSolarRatings.powerW == null && computedCustomSolarPower != null && (
            <SpecRow label="Calculated Power" value={`${computedCustomSolarPower.toFixed(0)} W`} />
          )}
          <div style={{ marginTop: 6 }}>
            <div style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600, marginBottom: 3 }}>Description</div>
            <textarea
              className="inspector-input"
              rows={3}
              value={customSolarRatings.description ?? ''}
              onChange={(e) => {
                onUpdateCustomSolarArrayRatings(component.id, {
                  ...customSolarRatings,
                  description: e.target.value || undefined,
                });
              }}
            />
          </div>
        </div>
      )}

      <div className="inspector-section">
        <div className="inspector-label">Specifications</div>
        <SpecRow label="Type" value={product.productType.replace(/_/g, ' ')} />
        {product.nominalVoltage != null && (
          <SpecRow
            label="Rated Voltage"
            value={Array.isArray(product.nominalVoltage)
              ? product.nominalVoltage.join('/') + 'V'
              : product.nominalVoltage + 'V'}
          />
        )}
        {capacityKwh && <SpecRow label="Total Capacity" value={`${capacityKwh} kWh`} />}
        {product.continuousPowerW && <SpecRow label="Continuous Power" value={`${product.continuousPowerW} W`} />}
        {product.maxCurrentA && !sourceLoadKind && product.productType !== 'fuse' && product.productType !== 'breaker' && (
          <SpecRow label="Max Current" value={`${product.maxCurrentA} A`} />
        )}
        {product.maxPvVoltageV && <SpecRow label="Max PV Voltage" value={`${product.maxPvVoltageV} V`} />}
        {isDcBus && (
          <div className="spec-row spec-row-editable">
            <span className="spec-row-label">Nominal Voltage</span>
            <input
              type="number"
              className="spec-row-input"
              min={1}
              value={component.dcNominalVoltage ?? ''}
              placeholder={String(systemVoltage)}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                onUpdateDcBusNominalVoltage(component.id, isNaN(v) ? undefined : v);
              }}
            />
            <span className="spec-row-unit">VDC</span>
          </div>
        )}
        {(sourceLoadKind === 'dc_source' || sourceLoadKind === 'ac_source') && onUpdateSourceType && (
          <div className="spec-row spec-row-editable">
            <span className="spec-row-label">Source Type</span>
            <select
              className="spec-row-input"
              value={component.sourceType ?? 'Generic'}
              onChange={(e) => {
                const val = e.target.value;
                onUpdateSourceType(
                  component.id,
                  val === 'Generic' ? undefined : val as DcSourceType | AcSourceType
                );
              }}
            >
              {(sourceLoadKind === 'dc_source' ? DC_SOURCE_TYPES : AC_SOURCE_TYPES).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}
        {sourceLoadKind && (
          <>
            <div className="spec-row spec-row-editable">
              <span className="spec-row-label">
                {sourceLoadKind === 'dc_source' || sourceLoadKind === 'ac_source' ? 'Output Voltage' : 'Operating Voltage'}
              </span>
              <input
                type="number"
                className="spec-row-input"
                min={1}
                value={component.instanceVoltageV ?? ''}
                placeholder={
                  sourceLoadKind === 'ac_source' || sourceLoadKind === 'ac_load'
                    ? '120'
                    : String(systemVoltage)
                }
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  onUpdateInstanceVoltage(component.id, isNaN(v) ? undefined : v);
                }}
              />
              <span className="spec-row-unit">V</span>
            </div>
            <div className="spec-row spec-row-editable">
              <span className="spec-row-label">
                {sourceLoadKind === 'dc_source' || sourceLoadKind === 'ac_source' ? 'Max Current' : 'Max Current Draw'}
              </span>
              <input
                type="number"
                className="spec-row-input"
                min={0}
                value={component.instanceMaxCurrentA ?? ''}
                placeholder={
                  product.maxCurrentA != null
                    ? String(product.maxCurrentA)
                    : product.continuousPowerW && (component.instanceVoltageV ?? (sourceLoadKind === 'ac_source' || sourceLoadKind === 'ac_load' ? 120 : systemVoltage))
                    ? String(Math.round(product.continuousPowerW / (component.instanceVoltageV ?? (sourceLoadKind === 'ac_source' || sourceLoadKind === 'ac_load' ? 120 : systemVoltage))))
                    : ''
                }
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  onUpdateInstanceMaxCurrent(component.id, isNaN(v) ? undefined : v);
                }}
              />
              <span className="spec-row-unit">A</span>
            </div>
          </>
        )}
        {product.productType === 'solar_array' && product.maxPvCurrentA && (
          <SpecRow label="Max PV Current" value={`${product.maxPvCurrentA} A`} />
        )}
        {productMaxCableAwg && (
          <SpecRow label="Max Cable Size" value={productMaxCableAwg} />
        )}
        {solarStats && (
          <>
            <SpecRow label={product.productType === 'custom_solar_array' ? 'Array Type' : 'Panel Count'} value={product.productType === 'custom_solar_array' ? 'Custom aggregate' : `${solarStats.panelCount}`} />
            <SpecRow label={product.productType === 'custom_solar_array' ? 'Array Voc' : 'Panel Voc'} value={`${solarStats.vocV.toFixed(1)} V`} />
            {solarStats.vmpV != null && <SpecRow label={product.productType === 'custom_solar_array' ? 'Array Vmp' : 'Panel Vmp'} value={`${solarStats.vmpV.toFixed(1)} V`} />}
            {solarStats.iscA != null && <SpecRow label={product.productType === 'custom_solar_array' ? 'Array Isc' : 'Panel Isc'} value={`${solarStats.iscA.toFixed(1)} A`} />}
            {solarStats.impA != null && <SpecRow label={product.productType === 'custom_solar_array' ? 'Array Imp' : 'Panel Imp'} value={`${solarStats.impA.toFixed(1)} A`} />}
          </>
        )}
        {solarUnit && (
          <SpecRow label="Panel Rating" value={`${solarUnit.powerW.toFixed(0)} W, Voc ${solarUnit.vocV.toFixed(1)} V`} />
        )}
      </div>

      {fuseSlots.length > 0 && (
        <div className="inspector-section">
          <div className="inspector-label">Fuse Slots</div>
          <div className="fuse-slot-list">
            {fuseSlots.map((slot) => {
              const state = component.fuseSlots?.[slot.id] ?? {};
              const installed = state.installed ?? slot.defaultInstalled ?? false;
              const fuseStyle = slot.fuseStyle ?? slot.protectionType ?? 'Fuse';
              const selectedProductId = state.fuseProductId ?? '';
              const selectedProduct = selectedProductId ? products.get(selectedProductId) : undefined;
              const fuseRating = selectedProduct ? getFuseRating(selectedProduct) : state.ratingA;
              const unitPrice = selectedProduct?.msrpUsd;

              const hasSelectedProduct = Boolean(selectedProduct);
              const hasRating = fuseRating != null;

              return (
                <div key={slot.id} className={`fuse-slot-row${installed ? '' : ' fuse-slot-row-empty'}`}>
                  <div className="fuse-slot-header">
                    <span className="fuse-slot-title">Fuse {slot.label}</span>
                    <span className={`fuse-slot-rating-badge${fuseRating ? '' : ' fuse-slot-rating-badge--empty'}`}>
                      {fuseRating ? `${fuseRating}A` : '—'}
                    </span>
                  </div>
                  <div className="fuse-slot-style">
                    {selectedProduct
                      ? `${selectedProduct.manufacturer} ${selectedProduct.name}`
                      : hasRating
                        ? `Auto-sized ${fuseRating}A · ${fuseStyle}`
                        : `No fuse selected · ${fuseStyle}`}
                    {unitPrice != null ? ` · ${fmt(unitPrice)}` : ''}
                  </div>
                  {(onOpenFusePicker || (onRemoveFuseSlot && installed)) && (
                    <div className="fuse-slot-actions">
                      {onOpenFusePicker && (
                        <button
                          type="button"
                          className="btn-secondary-inline"
                          onClick={() => onOpenFusePicker(component.id, slot.id)}
                        >
                          Pick Fuse
                        </button>
                      )}
                      {onRemoveFuseSlot && installed && (
                        <button
                          type="button"
                          className="btn-remove-inline"
                          onClick={() => onRemoveFuseSlot(component.id, slot.id)}
                          title="Remove fuse from this slot"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(product.ports?.length ?? 0) > 0 && (
        <div className="inspector-section">
          <div className="inspector-label">Ports</div>
          <div className="port-summary-list">
            {product.ports!.map((port) => (
              <PortSummarySection
                key={port.id}
                component={component}
                product={product}
                port={port}
                components={components}
                connections={connections}
                products={products}
                systemVoltage={systemVoltage}
                analysis={analysis}
                onUpdateConfiguredProtocol={onUpdateConfiguredProtocol}
                collapsed={collapsedPorts[`${component.id}:${port.id}`] ?? false}
                onToggleCollapsed={() => {
                  const collapseKey = `${component.id}:${port.id}`;
                  setCollapsedPorts((prev) => ({
                    ...prev,
                    [collapseKey]: !(prev[collapseKey] ?? false),
                  }));
                }}
              />
            ))}
          </div>
        </div>
      )}

      {arrayStats && (product.productType === 'solar_combiner' || product.productType === 'mppt') && (
        <div className="inspector-section">
          <div className="inspector-label">Solar Array</div>
          <SpecRow label="Array Size" value={`${arrayStats.powerW.toFixed(0)} W`} />
          <SpecRow label="Strings" value={`${solarArray?.strings.length ?? 0}`} />
          <SpecRow label="Panels" value={`${arrayStats.panelCount}`} />
          <SpecRow label="Array Voc" value={`${arrayStats.vocV.toFixed(1)} V`} />
          {arrayStats.vmpV != null && <SpecRow label="Array Vmp" value={`${arrayStats.vmpV.toFixed(1)} V`} />}
          {arrayStats.iscA != null && <SpecRow label="Array Isc" value={`${arrayStats.iscA.toFixed(1)} A`} />}
          {arrayStats.impA != null && <SpecRow label="Array Imp" value={`${arrayStats.impA.toFixed(1)} A`} />}
          {(solarArray?.mismatches.length ?? 0) > 0 && (
            <div style={{ color: 'var(--red)', fontSize: 12, fontWeight: 600, lineHeight: 1.4, marginTop: 6 }}>
              Parallel strings have mismatched open-circuit voltage.
            </div>
          )}
        </div>
      )}

      <div className="inspector-section">
        <div className="inspector-label">Pricing</div>
        <label className="inspector-checkbox-row">
          <input
            type="checkbox"
            checked={includeInBom}
            onChange={(e) => onUpdateIncludeInBom(component.id, e.target.checked)}
          />
          <span>Include In BOM</span>
        </label>
        <SpecRow label="MSRP" value={fmt(product.msrpUsd ?? null)} />
        <div style={{ marginTop: 6 }}>
          <div style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600, marginBottom: 3 }}>Price override (unit)</div>
          <input
            type="number"
            className="inspector-input"
            placeholder="Override MSRP..."
            value={component.customPriceUsd ?? ''}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              onUpdatePrice(component.id, isNaN(v) ? undefined : v);
            }}
          />
        </div>
      </div>

      {product.notes && (
        <div className="inspector-section">
          <div className="inspector-label">Notes</div>
          <div style={{ color: 'var(--ink-soft)', fontSize: 12, lineHeight: 1.5 }}>{product.notes}</div>
        </div>
      )}

      {component.autoGenerated && (
        <div className="auto-note">
          Auto-generated - calculated from system topology
        </div>
      )}

      {supplierUrl && (
        <a
          className="supplier-link"
          href={supplierUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open Supplier Page
        </a>
      )}

      <button
        className="btn-remove"
        onClick={() => onRemove(component.id)}
      >
        Remove Component
      </button>
    </div>
  );
}

