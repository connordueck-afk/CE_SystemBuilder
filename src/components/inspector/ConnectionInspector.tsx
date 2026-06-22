import type { SystemConnection, SystemComponent, Product } from '../../types/system';
import { CABLE_TABLE } from '../../data/cableAmpacity';
import { getEffectiveTerminal } from '../../utils/effectiveTerminals';
import { terminalDirectionLabel } from '../../utils/terminalDirection';
import type { ProtectionRecommendation } from '../../utils/protectionRecommendations';

interface Props {
  connection: SystemConnection;
  fromComponent: SystemComponent | undefined;
  toComponent: SystemComponent | undefined;
  fromProduct: Product | undefined;
  toProduct: Product | undefined;
  systemVoltage: number;
  protectionRecommendations: ProtectionRecommendation[];
  onUpdateLength: (id: string, ft: number) => void;
  onUpdateDesignCurrent: (id: string, currentA: number | undefined) => void;
  onUpdateCableAwg: (id: string, awg: string) => void;
  onAutoCableAwg: (id: string) => void;
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

export function ConnectionInspector({
  connection,
  fromComponent,
  toComponent,
  fromProduct,
  toProduct,
  systemVoltage,
  protectionRecommendations,
  onUpdateLength,
  onUpdateDesignCurrent,
  onUpdateCableAwg,
  onAutoCableAwg,
  onResetRoute,
  onRemove,
}: Props) {
  const fromLabel = fromComponent?.label ?? fromProduct?.name ?? 'Unknown';
  const toLabel = toComponent?.label ?? toProduct?.name ?? 'Unknown';
  const dropWarn = (connection.voltageDropPercent ?? 0) > 3;
  const fromTerminal = fromComponent && fromProduct
    ? getEffectiveTerminal(fromProduct, connection.fromTerminalId, fromComponent)
    : undefined;
  const toTerminal = toComponent && toProduct
    ? getEffectiveTerminal(toProduct, connection.toTerminalId, toComponent)
    : undefined;

  return (
    <div className="inspector-content">
      <div className="inspector-section">
        <div className="inspector-label">Connection</div>
        <div style={{ color: '#46546a', fontSize: 12, fontWeight: 700 }}>
          <span style={{ color: '#182235', fontWeight: 700 }}>{fromLabel}</span>
          {' -> '}
          <span style={{ color: '#182235', fontWeight: 700 }}>{toLabel}</span>
        </div>
        <div style={{ color: '#6d7b90', fontSize: 11, fontWeight: 700, marginTop: 2 }}>
          {connection.fromTerminalId}
          {' -> '}
          {connection.toTerminalId}
        </div>
      </div>

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
          <span style={{ color: '#6d7b90', fontSize: 12, fontWeight: 600 }}>A</span>
        </div>
        <Row label="Calculated Current" value={connection.calculatedCurrentA != null ? `${connection.calculatedCurrentA.toFixed(0)} A` : null} />
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

      {protectionRecommendations.length > 0 && (
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

      <div className="inspector-section">
        <div className="inspector-label">Cable Run</div>
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
          <input
            type="number"
            className="inspector-input"
            style={{ width: 70 }}
            value={connection.cableLengthFt}
            min={1}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v > 0) onUpdateLength(connection.id, v);
            }}
          />
          <span style={{ color: '#6d7b90', fontSize: 12, fontWeight: 600 }}>ft</span>
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
          <div style={{ color: '#935f0d', fontSize: 11, fontWeight: 600, marginTop: 6 }}>
            Warning: voltage drop exceeds 3% - consider larger cable or shorter run
          </div>
        )}
      </div>

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
            <div key={i} style={{ color: '#935f0d', fontSize: 12, fontWeight: 600, padding: '3px 0' }}>Warning: {w}</div>
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

