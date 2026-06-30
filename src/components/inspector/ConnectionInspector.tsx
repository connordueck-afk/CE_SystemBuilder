import { useState } from 'react';
import type { InternalBusType, SystemConnection, SystemComponent, Product, CableMode } from '../../types/system';
import { CABLE_TABLE } from '../../data/cableAmpacity';
import { feetAndInchesToFeet, feetToFeetAndInches } from '../../utils/cableSummary';
import { getEffectiveTerminal } from '../../utils/effectiveTerminals';
import { terminalKind } from '../../utils/portSpecs';
import { canProvidePower, terminalDirectionLabel } from '../../utils/terminalDirection';
import type { ProtectionRecommendation } from '../../utils/protectionRecommendations';
import { sharedBusLinkStandard } from '../../utils/busLinks';
import { BUS_DEFAULT_COLOR, BUS_DEFAULT_TYPE } from '../../utils/cableDefaults';
import { getPremanufacturedCable } from '../../data/products/cableAssemblies';
import { PremanufacturedCableSelector } from '../parts/PremanufacturedCableSelector';
import { deriveConnectionProtocol } from '../../utils/communicationNetworks';

const CABLE_COLORS = ['Red', 'Black', 'Yellow', 'Orange', 'Blue', 'Green', 'White', 'Brown', 'Gray', 'Purple'];
const CABLE_TYPES = ['THHN/THWN', 'RHH/RHW-2', 'Marine Grade', 'Welding Cable', 'Battery Cable', 'Chassis Wire (MTW)'];

const COLOR_SWATCHES: Record<string, string> = {
  red: '#e53535', black: '#1a1a1a', yellow: '#e8c020', orange: '#e87020',
  blue: '#1e6fd0', green: '#2a8a2a', white: '#e8e8e8', brown: '#8b5e3c',
  gray: '#808080', grey: '#808080', purple: '#8040a0',
};

export function cableColorSwatch(color: string): string | null {
  return COLOR_SWATCHES[color.toLowerCase()] ?? null;
}


interface Props {
  connection: SystemConnection;
  fromComponent: SystemComponent | undefined;
  toComponent: SystemComponent | undefined;
  fromProduct: Product | undefined;
  toProduct: Product | undefined;
  systemVoltage: number;
  protectionRecommendations: ProtectionRecommendation[];
  onUpdateLength: (id: string, ft: number) => void;
  onToggleBusLink: (id: string, busLink: boolean) => void;
  onUpdateDesignCurrent: (id: string, currentA: number | undefined) => void;
  onUpdateCableAwg: (id: string, awg: string) => void;
  onAutoCableAwg: (id: string) => void;
  onUpdateCableColor: (id: string, color: string) => void;
  onUpdateCableType: (id: string, type: string) => void;
  onUpdateCableMode: (id: string, mode: CableMode) => void;
  onUpdatePremanufacturedCable: (id: string, cableId: string | undefined) => void;
  onResetRoute: (id: string) => void;
  onRemove: (id: string) => void;
}

function Row({ label, value, warn }: { label: string; value: string | number | null; warn?: boolean }) {
  return (
    <div className="connection-row">
      <span className="connection-row-label">{label}</span>
      <span className={`connection-row-value${warn ? ' connection-row-value-warn' : ''}`}>{value ?? '-'}</span>
    </div>
  );
}

function positiveNumber(value: number | undefined): number | undefined {
  return value != null && Number.isFinite(value) && value > 0 ? value : undefined;
}

function endpointSourceCapabilityA(
  component: SystemComponent | undefined,
  product: Product | undefined,
  terminalId: string,
  systemVoltage: number
): number | undefined {
  if (!component || !product) return undefined;

  const terminal = getEffectiveTerminal(product, terminalId, component);
  if (!terminal) return undefined;
  const terminalCanSource = canProvidePower(terminal) || product.productType === 'battery';
  if (!terminalCanSource) return undefined;

  if (component.instanceMaxCurrentA != null) {
    return positiveNumber(component.instanceMaxCurrentA);
  }

  if (terminal.maxCurrentA != null) {
    return positiveNumber(terminal.maxCurrentA);
  }

  if (terminal.maxPowerW != null && systemVoltage > 0) {
    return positiveNumber(terminal.maxPowerW / systemVoltage);
  }

  if (product.productType === 'battery') {
    return positiveNumber(product.batteryRatings?.maxDischargeCurrentA) ??
      positiveNumber(product.maxCurrentA);
  }

  if (product.productType === 'mppt' && terminalKind(product, terminal) === 'dc_power') {
    return positiveNumber(product.mpptRatings?.maxOutputCurrentA) ?? positiveNumber(product.maxCurrentA);
  }

  if (product.productType === 'dc_dc_charger' && terminal.id.toLowerCase().startsWith('out')) {
    return positiveNumber(product.dcDcChargerRatings?.outputCurrentA) ?? positiveNumber(product.maxCurrentA);
  }

  if (product.productType === 'inverter_charger' && terminalKind(product, terminal) === 'dc_power') {
    return positiveNumber(product.inverterChargerRatings?.maxDcCurrentA) ?? positiveNumber(product.maxCurrentA);
  }

  return undefined;
}

export function ConnectionInspector({
  connection,
  fromComponent,
  toComponent,
  fromProduct,
  toProduct,
  systemVoltage,
  protectionRecommendations,
  onUpdateLength,
  onToggleBusLink,
  onUpdateDesignCurrent,
  onUpdateCableAwg,
  onAutoCableAwg,
  onUpdateCableColor,
  onUpdateCableType,
  onUpdateCableMode,
  onUpdatePremanufacturedCable,
  onResetRoute,
  onRemove,
}: Props) {
  const [showCableSelector, setShowCableSelector] = useState(false);
  const fromLabel = fromComponent?.label ?? fromProduct?.name ?? 'Unknown';
  const toLabel = toComponent?.label ?? toProduct?.name ?? 'Unknown';
  const dropWarn = (connection.voltageDropPercent ?? 0) > 3;
  const busType = connection.busType;
  const suggestedColor = busType ? (BUS_DEFAULT_COLOR[busType] ?? null) : null;
  const suggestedType = busType ? (BUS_DEFAULT_TYPE[busType] ?? null) : null;
  const fromTerminal = fromComponent && fromProduct
    ? getEffectiveTerminal(fromProduct, connection.fromTerminalId, fromComponent)
    : undefined;
  const toTerminal = toComponent && toProduct
    ? getEffectiveTerminal(toProduct, connection.toTerminalId, toComponent)
    : undefined;
  const cableLength = feetToFeetAndInches(connection.cableLengthFt);
  const busLinkCapable = sharedBusLinkStandard(
    fromProduct, connection.fromTerminalId, toProduct, connection.toTerminalId
  ) != null;
  const isBusLink = connection.busLink === true;
  const isCommWire = connection.wireKind === 'communication';
  const derivedProtocol = fromComponent && toComponent && fromProduct && toProduct
    ? deriveConnectionProtocol(
      connection,
      new Map([[fromProduct.id, fromProduct], [toProduct.id, toProduct]]),
      [fromComponent, toComponent]
    )
    : undefined;
  const cableMode = connection.cableMode ?? 'dynamic';
  const selectedAssembly = connection.premanufacturedCableId
    ? getPremanufacturedCable(connection.premanufacturedCableId)
    : undefined;
  const maxSourceCapabilityA = Math.max(
    endpointSourceCapabilityA(fromComponent, fromProduct, connection.fromTerminalId, systemVoltage) ?? 0,
    endpointSourceCapabilityA(toComponent, toProduct, connection.toTerminalId, systemVoltage) ?? 0
  ) || undefined;
  const showSourceCapability = maxSourceCapabilityA != null &&
    (connection.calculatedCurrentA == null || maxSourceCapabilityA > connection.calculatedCurrentA);

  const updateCableLength = (next: Partial<typeof cableLength>) => {
    onUpdateLength(
      connection.id,
      feetAndInchesToFeet(
        next.feet ?? cableLength.feet,
        next.inches ?? cableLength.inches
      )
    );
  };

  return (
    <div className="inspector-content">
      <div className="inspector-section">
        <div className="inspector-label">Connection</div>
        <div style={{ color: 'var(--ink-soft)', fontSize: 12, fontWeight: 700 }}>
          <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{fromLabel}</span>
          {' -> '}
          <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{toLabel}</span>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 700, marginTop: 2 }}>
          {connection.fromTerminalId}
          {' -> '}
          {connection.toTerminalId}
        </div>
      </div>

      {!isCommWire && (
      <div className="inspector-section">
        <div className="inspector-label">Electrical</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span className="connection-row-label" style={{ flex: 1 }}>Design Current</span>
          <input
            type="number"
            className="inspector-input"
            style={{ width: 70 }}
            min={0}
            value={connection.designCurrentOverrideA ?? ''}
            placeholder="Auto"
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              onUpdateDesignCurrent(connection.id, isNaN(v) ? undefined : v);
            }}
          />
          <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600 }}>A</span>
        </div>
        <Row label="Branch Current" value={connection.calculatedCurrentA != null ? `${connection.calculatedCurrentA.toFixed(0)} A` : null} />
        {showSourceCapability && (
          <Row label="Max Source Capability" value={`${maxSourceCapabilityA.toFixed(0)} A`} />
        )}
        <Row
          label="Flow Points"
          value={fromTerminal && toTerminal
            ? `${terminalDirectionLabel(fromTerminal)} -> ${terminalDirectionLabel(toTerminal)}`
            : null}
        />
        <Row label="Recommended Fuse" value={connection.recommendedFuseA != null ? `${connection.recommendedFuseA} A` : null} />
        <Row label="Recommended Cable" value={connection.recommendedCableAwg != null ? `${connection.recommendedCableAwg} AWG` : null} />
        <Row label="System Voltage" value={`${systemVoltage} V`} />
      </div>
      )}

      {!isCommWire && protectionRecommendations.length > 0 && (
        <div className="inspector-section">
          <div className="inspector-label">Required Protection</div>
          {protectionRecommendations.map((recommendation) => (
            <div key={recommendation.id} className="issue-card issue-card-warning" style={{ marginBottom: 6 }}>
              <span className="issue-icon">!</span>
              <span className="issue-message">
                {recommendation.message}
                {recommendation.recommendedFuseA != null && ` - recommended ${recommendation.recommendedFuseA} A`}
                {recommendation.recommendedCableAwg && ` with ${recommendation.recommendedCableAwg} AWG`}
                <span style={{ display: 'block', color: '#6d4a12', fontSize: 11, fontWeight: 700, marginTop: 4 }}>
                  {recommendation.reason}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}

      {busLinkCapable && (
        <div className="inspector-section">
          <div className="inspector-label">Connection Type</div>
          <label className="inspector-checkbox-row">
            <input
              type="checkbox"
              checked={isBusLink}
              onChange={(e) => onToggleBusLink(connection.id, e.target.checked)}
            />
            <span>Direct bus link (no cable)</span>
          </label>
          <div style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600, marginTop: 4 }}>
            These modules bolt together on a shared busbar. Uncheck if they're mounted apart and joined by a cable.
          </div>
        </div>
      )}

      {/* Communication wire network type section */}
      {isCommWire && (
        <div className="inspector-section">
          <div className="inspector-label">Communication Wire</div>
          <Row label="Network Type" value={derivedProtocol ?? 'Unknown'} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 4px' }}>
            <span className="connection-row-label" style={{ flex: 1 }}>Length</span>
            <input
              type="number"
              className="inspector-input"
              style={{ width: 58 }}
              value={cableLength.feet}
              min={0}
              step={1}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v)) updateCableLength({ feet: v });
              }}
            />
            <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600 }}>ft</span>
            <input
              type="number"
              className="inspector-input"
              style={{ width: 58 }}
              value={cableLength.inches}
              min={0}
              max={11}
              step={1}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v)) updateCableLength({ inches: v });
              }}
            />
            <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600 }}>in</span>
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 4 }}>
            Determined by the connected devices. Configure a device's protocol on its component panel.
            Communication wires have no current rating and do not affect cable/fuse sizing.
          </div>
        </div>
      )}

      {isBusLink ? (
        <div className="inspector-section">
          <div className="inspector-label">Cable Run</div>
          <div style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600 }}>
            Direct bus link — no cable, excluded from the cable BOM.
          </div>
        </div>
      ) : isCommWire ? null : (
      <div className="inspector-section">
        <div className="inspector-label">Cable Run</div>

        {/* Cable mode toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span className="connection-row-label" style={{ flex: 1 }}>Cable Type</span>
          <select
            className="inspector-input"
            style={{ width: 145 }}
            value={cableMode}
            onChange={(e) => {
              onUpdateCableMode(connection.id, e.target.value as CableMode);
              if (e.target.value === 'dynamic') {
                onUpdatePremanufacturedCable(connection.id, undefined);
              }
            }}
          >
            <option value="dynamic">Dynamic (custom run)</option>
            <option value="premanufactured">Pre-manufactured</option>
          </select>
        </div>

        {/* Pre-manufactured cable UI */}
        {cableMode === 'premanufactured' && (
          <div style={{ marginBottom: 10 }}>
            {selectedAssembly ? (
              <div style={{ background: 'var(--surface-alt, #f4f7fb)', borderRadius: 6, padding: '8px 10px', marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 12 }}>{selectedAssembly.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 2 }}>
                  {selectedAssembly.gauge} · {selectedAssembly.length} {selectedAssembly.lengthUnit}
                  {selectedAssembly.price != null && ` · $${selectedAssembly.price.toFixed(2)}`}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 6 }}>No cable assembly selected.</div>
            )}
            <button
              className="btn-secondary-wide"
              onClick={() => setShowCableSelector(true)}
            >
              {selectedAssembly ? 'Change Cable Assembly' : 'Select Cable Assembly'}
            </button>
          </div>
        )}

        {cableMode === 'dynamic' && (
          <>
            <div className="cable-size-control">
              <select
                className="inspector-input"
                value={connection.manualCableAwg ?? connection.recommendedCableAwg ?? ''}
                onChange={(e) => onUpdateCableAwg(connection.id, e.target.value)}
              >
                {!connection.manualCableAwg && !connection.recommendedCableAwg && (
                  <option value="" disabled>
                    Select size
                  </option>
                )}
                {CABLE_TABLE.map((cable) => (
                  <option key={cable.awg} value={cable.awg}>
                    {cable.label}
                  </option>
                ))}
              </select>
              <button
                className="btn-secondary-inline"
                disabled={!connection.manualCableAwg}
                onClick={() => onAutoCableAwg(connection.id)}
              >
                Auto
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="connection-row-label" style={{ flex: 1 }}>Length</span>
              <input
                type="number"
                className="inspector-input"
                style={{ width: 58 }}
                value={cableLength.feet}
                min={0}
                step={1}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) updateCableLength({ feet: v });
                }}
              />
              <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600 }}>ft</span>
              <input
                type="number"
                className="inspector-input"
                style={{ width: 58 }}
                value={cableLength.inches}
                min={0}
                max={11}
                step={1}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) updateCableLength({ inches: v });
                }}
              />
              <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600 }}>in</span>
            </div>
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span className="connection-row-label" style={{ flex: 1 }}>Color</span>
                <select
                  className="inspector-input"
                  style={{ width: 110 }}
                  value={connection.cableColor ?? ''}
                  onChange={(e) => onUpdateCableColor(connection.id, e.target.value)}
                >
                  <option value="">{suggestedColor ? `Default (${suggestedColor})` : 'Select...'}</option>
                  {CABLE_COLORS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span className="connection-row-label" style={{ flex: 1 }}>Type</span>
                <select
                  className="inspector-input"
                  style={{ width: 110 }}
                  value={connection.cableType ?? ''}
                  onChange={(e) => onUpdateCableType(connection.id, e.target.value)}
                >
                  <option value="">{suggestedType ? `Default (${suggestedType})` : 'Select...'}</option>
                  {CABLE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <Row
              label="Voltage Drop"
              value={connection.voltageDropV != null ? `${connection.voltageDropV.toFixed(3)} V` : null}
              warn={dropWarn}
            />
            <Row
              label="Drop %"
              value={connection.voltageDropPercent != null ? `${connection.voltageDropPercent.toFixed(2)}%` : null}
              warn={dropWarn}
            />
            {dropWarn && (
              <div style={{ color: 'var(--amber)', fontSize: 11, fontWeight: 600, marginTop: 6 }}>
                Warning: voltage drop exceeds 3% - consider larger cable or shorter run
              </div>
            )}
          </>
        )}
      </div>
      )}

      {showCableSelector && (
        <PremanufacturedCableSelector
          connection={connection}
          onSelect={(cableId) => onUpdatePremanufacturedCable(connection.id, cableId)}
          onClose={() => setShowCableSelector(false)}
        />
      )}

      <div className="inspector-section">
        <div className="inspector-label">Routing</div>
        <button
          className="btn-secondary-wide"
          disabled={!connection.routePoints || connection.routePoints.length === 0}
          onClick={() => onResetRoute(connection.id)}
        >
          Reset Route
        </button>
      </div>

      {connection.autoGenerated && (
        <div className="auto-note">
          Auto-generated connection
        </div>
      )}

      {(connection.warnings?.length ?? 0) > 0 && (
        <div className="inspector-section">
          {connection.warnings!.map((w, i) => (
            <div key={i} style={{ color: 'var(--amber)', fontSize: 12, fontWeight: 600, padding: '3px 0' }}>Warning: {w}</div>
          ))}
        </div>
      )}

      <button
        className="btn-remove"
        onClick={() => onRemove(connection.id)}
      >
        Remove Connection
      </button>
    </div>
  );
}

