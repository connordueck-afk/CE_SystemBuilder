import type { SystemComponent, Product, NominalVoltage } from '../../types/system';
import { fmt } from '../../utils/priceCalculations';
import type { SolarArrayAggregation } from '../../utils/solarCalculations';
import {
  calculateSolarStringStats,
  getSolarPanelCount,
  getSolarPanelUnitRatings,
} from '../../utils/solarCalculations';

type SourceLoadKind = 'dc_source' | 'ac_source' | 'dc_load' | 'ac_load';

function getSourceLoadKind(product: Product): SourceLoadKind | null {
  if (product.productType === 'dc_load') return 'dc_load';
  if (product.productType === 'ac_load') return 'ac_load';
  const hasAcSource = product.terminals.some((t) => t.role === 'source' && t.domain === 'ac');
  if (hasAcSource && product.productType === 'shorePowerInlet') return 'ac_source';
  const hasDcSource = product.terminals.some((t) => t.role === 'source' && t.domain === 'dc');
  if (hasDcSource && product.productType === 'accessory' && product.dataQuality === 'placeholder') return 'dc_source';
  return null;
}

interface Props {
  component: SystemComponent;
  product: Product;
  systemVoltage: NominalVoltage;
  solarArray?: SolarArrayAggregation;
  onUpdateLabel: (id: string, label: string) => void;
  onUpdatePrice: (id: string, price: number | undefined) => void;
  onUpdateInstanceVoltage: (id: string, voltageV: number | undefined) => void;
  onUpdateInstanceMaxCurrent: (id: string, currentA: number | undefined) => void;
  onUpdateBusPolarity: (id: string, busPolarity: SystemComponent['busPolarity']) => void;
  onUpdateSolarConfiguration: (id: string, seriesCount: number, parallelCount: number) => void;
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
  systemVoltage,
  solarArray,
  onUpdateLabel,
  onUpdatePrice,
  onUpdateInstanceVoltage,
  onUpdateInstanceMaxCurrent,
  onUpdateBusPolarity,
  onUpdateSolarConfiguration,
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
        <div style={{ color: '#182235', fontSize: 12, fontWeight: 900 }}>{product.name}</div>
        <div style={{ color: '#6d7b90', fontSize: 10, fontWeight: 700 }}>{product.manufacturer}</div>
      </div>

      {product.productType === 'solar_array' && solarPanelCount > 1 && (
        <div className="inspector-section">
          <div className="inspector-label">Solar String</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
            <div>
              <div style={{ color: '#6d7b90', fontSize: 9, fontWeight: 800, marginBottom: 3 }}>Panels in Series</div>
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
        {product.maxCurrentA && !sourceLoadKind && <SpecRow label="Max Current" value={`${product.maxCurrentA} A`} />}
        {product.maxPvVoltageV && <SpecRow label="Max PV Voltage" value={`${product.maxPvVoltageV} V`} />}
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
            <div style={{ color: '#b93232', fontSize: 10, fontWeight: 800, lineHeight: 1.4, marginTop: 6 }}>
              Parallel strings have mismatched open-circuit voltage.
            </div>
          )}
        </div>
      )}

      <div className="inspector-section">
        <div className="inspector-label">Pricing</div>
        <SpecRow label="MSRP" value={fmt(product.msrpUsd ?? null)} />
        <SpecRow label="OEM Est." value={fmt(product.oemPriceUsd ?? null)} />
        <div style={{ marginTop: 6 }}>
          <div style={{ color: '#6d7b90', fontSize: 9, fontWeight: 800, marginBottom: 3 }}>Price override (unit)</div>
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
          <div style={{ color: '#46546a', fontSize: 10, lineHeight: 1.5 }}>{product.notes}</div>
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
