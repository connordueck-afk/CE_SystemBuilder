import type { FuseSlotState, SystemComponent, Product, NominalVoltage, CommunicationProtocol, DcSourceType, AcSourceType } from '../../types/system';
import { CABLE_TABLE } from '../../data/cableAmpacity';
import { fmt } from '../../utils/priceCalculations';
import type { SolarArrayAggregation } from '../../utils/solarCalculations';
import {
  calculateSolarStringStats,
  getSolarPanelCount,
  getSolarPanelUnitRatings,
} from '../../utils/solarCalculations';
import { isDcBusProduct } from '../../utils/dcBusVoltage';
import { getFuseHolderForProduct } from '../../utils/fuseHolders';
import { fuseRatingsForStyle, findFuseProductByStyleRating } from '../../utils/fuseSelection';
import {
  COMPONENT_SCALE_MAX,
  COMPONENT_SCALE_MIN,
  COMPONENT_SCALE_STEP,
  clampComponentScale,
  componentScale,
} from '../../utils/componentScale';

type SourceLoadKind = 'dc_source' | 'ac_source' | 'dc_load' | 'ac_load';

const DC_SOURCE_TYPES: DcSourceType[] = ['Generic', 'Vehicle Battery', 'Alternator', 'Auxiliary Battery', 'DC Generator', 'Solar Charge Output', 'Power Supply', 'Other'];
const AC_SOURCE_TYPES: AcSourceType[] = ['Generic', 'Shore Power', 'Generator', 'Grid', 'Inverter Output', 'Other'];

function getSourceLoadKind(product: Product): SourceLoadKind | null {
  if (product.productType === 'dc_load') return 'dc_load';
  if (product.productType === 'ac_load') return 'ac_load';
  const hasAcSource = product.terminals.some((t) => t.role === 'source' && t.kind === 'ac_power');
  if (hasAcSource && product.productType === 'shorePowerInlet') return 'ac_source';
  const hasDcSource = product.terminals.some((t) => t.role === 'source' && t.kind === 'dc_power');
  if (hasDcSource && product.productType === 'accessory' && product.dataQuality === 'placeholder') return 'dc_source';
  return null;
}

interface Props {
  component: SystemComponent;
  product: Product;
  products: Map<string, Product>;
  systemVoltage: NominalVoltage;
  solarArray?: SolarArrayAggregation;
  availableFuseProducts?: Array<{ ratingA: number; productId: string }>;
  autoSizedProductId?: string | null;
  onChangeProduct?: (productId: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
  onUpdatePrice: (id: string, price: number | undefined) => void;
  onUpdateIncludeInBom: (id: string, includeInBom: boolean) => void;
  onUpdateFuseHolder: (id: string, includeFuseHolder: boolean, fuseHolderProductId?: string) => void;
  onUpdateInstanceVoltage: (id: string, voltageV: number | undefined) => void;
  onUpdateDcBusNominalVoltage: (id: string, voltageV: number | undefined) => void;
  onUpdateInstanceMaxCurrent: (id: string, currentA: number | undefined) => void;
  onUpdateComponentMaxCableAwg: (id: string, awg: string | undefined) => void;
  onUpdateComponentImageScale: (id: string, scale: number) => void;
  onUpdateBusPolarity: (id: string, busPolarity: SystemComponent['busPolarity']) => void;
  onUpdateFuseSlot: (id: string, slotId: string, patch: FuseSlotState) => void;
  onUpdateSolarConfiguration: (id: string, seriesCount: number, parallelCount: number) => void;
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

export function ComponentInspector({
  component,
  product,
  products,
  systemVoltage,
  solarArray,
  availableFuseProducts,
  autoSizedProductId,
  onChangeProduct,
  onUpdateLabel,
  onUpdatePrice,
  onUpdateIncludeInBom,
  onUpdateFuseHolder,
  onUpdateInstanceVoltage,
  onUpdateDcBusNominalVoltage,
  onUpdateInstanceMaxCurrent,
  onUpdateComponentMaxCableAwg,
  onUpdateComponentImageScale,
  onUpdateBusPolarity,
  onUpdateFuseSlot,
  onUpdateSolarConfiguration,
  onUpdateConfiguredProtocol,
  onUpdateSourceType,
  onRemove,
}: Props) {
  const sourceLoadKind = getSourceLoadKind(product);
  const effectiveMsrp = component.customPriceUsd ?? product.msrpUsd ?? null;
  const capacityKwh = product.capacityWh
    ? (product.capacityWh / 1000).toFixed(2)
    : null;
  const solarPanelCount = getSolarPanelCount(product);
  const solarSeriesCount = component.solarSeriesCount ?? solarPanelCount;
  const solarStats = calculateSolarStringStats(component, product);
  const solarUnit = getSolarPanelUnitRatings(product);
  const arrayStats = solarArray?.stats;
  const supplierUrl = product.productUrl ?? product.datasheetUrl;
  const includeInBom = component.includeInBom !== false;
  const fuseSlots = product.distributionTopology?.fuseSlots ?? [];
  const isDcBus = isDcBusProduct(product);
  const fuseHolder = getFuseHolderForProduct(product);
  const imageScale = componentScale(component);
  const productMaxCableAwg = (() => {
    const awgs = product.terminals
      .filter((t) => ['dc_power', 'pv_power', 'ac_power'].includes(t.kind) && t.maxCableAwg)
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

      {product.productType === 'solar_array' && solarPanelCount > 1 && (
        <div className="inspector-section">
          <div className="inspector-label">Solar String</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600, marginBottom: 3 }}>Panels in Series</div>
              <input
                type="number"
                className="inspector-input"
                min={1}
                value={solarSeriesCount}
                onChange={(e) => {
                  const v = Math.max(1, Math.floor(Number(e.target.value) || 1));
                  onUpdateSolarConfiguration(component.id, v, 1);
                }}
              />
            </div>
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
            <SpecRow label="Solar String" value={`${solarStats.seriesCount}S (${solarStats.panelCount} panels)`} />
            <SpecRow label="String Voc" value={`${solarStats.vocV.toFixed(1)} V`} />
            {solarStats.vmpV != null && <SpecRow label="String Vmp" value={`${solarStats.vmpV.toFixed(1)} V`} />}
            {solarStats.iscA != null && <SpecRow label="String Isc" value={`${solarStats.iscA.toFixed(1)} A`} />}
            {solarStats.impA != null && <SpecRow label="String Imp" value={`${solarStats.impA.toFixed(1)} A`} />}
          </>
        )}
        {solarUnit && solarPanelCount > 1 && (
          <SpecRow label="Panel Rating" value={`${solarUnit.powerW.toFixed(0)} W, Voc ${solarUnit.vocV.toFixed(1)} V`} />
        )}
      </div>

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

      {fuseSlots.length > 0 && (
        <div className="inspector-section">
          <div className="inspector-label">Fuse Slots</div>
          <div className="fuse-slot-list">
            {fuseSlots.map((slot) => {
              const state = component.fuseSlots?.[slot.id] ?? {};
              const installed = state.installed ?? slot.defaultInstalled ?? false;
              const ratingA = state.ratingA ?? slot.defaultFuseA;
              const fuseStyle = slot.fuseStyle ?? slot.protectionType ?? 'Fuse';
              // Ratings menu: explicit override if present, else derived from the catalog by style.
              const ratings = slot.allowedFuseRatingsA && slot.allowedFuseRatingsA.length > 0
                ? [...slot.allowedFuseRatingsA].sort((a, b) => a - b)
                : fuseRatingsForStyle(products.values(), fuseStyle, slot.maxFuseA);
              const selectValue = installed && ratingA != null ? String(ratingA) : '';
              const fuseProduct = installed && ratingA != null
                ? findFuseProductByStyleRating(products.values(), fuseStyle, ratingA)
                : undefined;
              const unitPrice = fuseProduct?.msrpUsd;

              return (
                <div key={slot.id} className={`fuse-slot-row${installed ? '' : ' fuse-slot-row-empty'}`}>
                  <span className="fuse-slot-enabled"><span>{slot.label}</span></span>
                  <select
                    className="inspector-input fuse-slot-rating"
                    value={selectValue}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '') {
                        onUpdateFuseSlot(component.id, slot.id, { installed: false, ratingA: undefined });
                      } else {
                        onUpdateFuseSlot(component.id, slot.id, { installed: true, ratingA: Number(v) });
                      }
                    }}
                  >
                    <option value="">Empty</option>
                    {ratings.map((r) => (
                      <option key={r} value={r}>{`${r}A`}</option>
                    ))}
                  </select>
                  <span className="fuse-slot-style">
                    {fuseStyle}
                    {unitPrice != null ? ` · ${fmt(unitPrice)}` : ''}
                  </span>
                </div>
              );
            })}
          </div>
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
        {fuseHolder && (
          <label className="inspector-checkbox-row">
            <input
              type="checkbox"
              checked={component.includeFuseHolder === true}
              onChange={(e) =>
                onUpdateFuseHolder(
                  component.id,
                  e.target.checked,
                  e.target.checked ? fuseHolder.id : undefined
                )
              }
            />
            <span>Include fuse holder</span>
          </label>
        )}
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

      {/* Communication Ports section */}
      {(product.communicationPorts?.length ?? 0) > 0 && (
        <div className="inspector-section">
          <div className="inspector-label">Communication Ports</div>
          {product.communicationPorts!.map((port) => {
            const currentProtocol = component.configuredProtocols?.[port.id] ?? port.configuredProtocol;
            return (
              <div key={port.id} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: 'var(--ink)', marginBottom: 3 }}>
                  {port.name}
                  <span style={{ fontWeight: 400, color: 'var(--muted)', marginLeft: 6, fontSize: 10 }}>
                    {port.connectorType}
                  </span>
                </div>
                {port.isConfigurable && onUpdateConfiguredProtocol ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="spec-row-label" style={{ flex: 1 }}>Protocol</span>
                    <select
                      className="inspector-input"
                      style={{ width: 130 }}
                      value={currentProtocol ?? ''}
                      onChange={(e) => {
                        const val = e.target.value as CommunicationProtocol | '';
                        onUpdateConfiguredProtocol(component.id, port.id, val || undefined);
                      }}
                    >
                      <option value="">Not configured</option>
                      {port.supportedProtocols.map((proto) => (
                        <option key={proto} value={proto}>{proto}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {port.supportedProtocols.join(', ')}
                  </div>
                )}
                {port.notes && (
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{port.notes}</div>
                )}
              </div>
            );
          })}
        </div>
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

