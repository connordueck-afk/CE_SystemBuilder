import { useMemo, useState } from 'react';
import type { PremanufacturedCable, SystemConnection } from '../../types/system';
import { PREMANUFACTURED_CABLES } from '../../data/products/cableAssemblies';

interface Props {
  connection: SystemConnection;
  requiredGauge?: string;
  onSelect: (cableId: string) => void;
  onClose: () => void;
}

const AWG_ORDER = ['4/0 AWG', '2/0 AWG', '1/0 AWG', '1 AWG', '2 AWG', '4 AWG', '6 AWG', '8 AWG', '10 AWG'];

function gaugeIndex(gauge: string): number {
  const idx = AWG_ORDER.indexOf(gauge);
  return idx === -1 ? 99 : idx;
}

/** Returns true if assemblyGauge is equal or heavier (lower AWG index) than requiredGauge. */
function gaugeAtLeastAsHeavy(assemblyGauge: string, requiredGauge: string): boolean {
  return gaugeIndex(assemblyGauge) <= gaugeIndex(requiredGauge);
}

export function PremanufacturedCableSelector({ connection, requiredGauge, onSelect, onClose }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(connection.premanufacturedCableId ?? null);

  const requiredLengthFt = connection.cableLengthFt;

  const { exact, valid, tooShort, wrongGauge } = useMemo(() => {
    const exact: PremanufacturedCable[] = [];
    const valid: PremanufacturedCable[] = [];
    const tooShort: PremanufacturedCable[] = [];
    const wrongGauge: PremanufacturedCable[] = [];

    for (const cable of PREMANUFACTURED_CABLES) {
      const lengthFt = cable.lengthUnit === 'm' ? cable.length * 3.281 : cable.length;
      const isLongEnough = lengthFt >= requiredLengthFt;
      const isGaugeOk = !requiredGauge || gaugeAtLeastAsHeavy(cable.gauge, requiredGauge);

      if (!isGaugeOk) {
        wrongGauge.push(cable);
      } else if (!isLongEnough) {
        tooShort.push(cable);
      } else if (cable.gauge === requiredGauge) {
        exact.push(cable);
      } else {
        valid.push(cable);
      }
    }

    // Sort exact by shortest first, then valid by shortest, then by gauge
    exact.sort((a, b) => a.length - b.length);
    valid.sort((a, b) => gaugeIndex(a.gauge) - gaugeIndex(b.gauge) || a.length - b.length);

    return { exact, valid, tooShort, wrongGauge };
  }, [requiredGauge, requiredLengthFt]);

  const allCables = [...exact, ...valid, ...tooShort, ...wrongGauge];

  function getCableStatus(cable: PremanufacturedCable): 'exact' | 'valid' | 'short' | 'undersized' {
    if (wrongGauge.includes(cable)) return 'undersized';
    if (tooShort.includes(cable)) return 'short';
    if (exact.includes(cable)) return 'exact';
    return 'valid';
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface)', borderRadius: 10, padding: 24, maxWidth: 680, width: '95vw',
          maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Select Pre-manufactured Cable</div>
            {requiredGauge && (
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                Required: {requiredGauge} · {requiredLengthFt.toFixed(1)} ft minimum
              </div>
            )}
          </div>
          <button
            style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--muted)' }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div style={{ overflow: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 700, color: 'var(--ink-soft)' }}>Supplier</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 700, color: 'var(--ink-soft)' }}>Name</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 700, color: 'var(--ink-soft)' }}>Gauge</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 700, color: 'var(--ink-soft)' }}>Length</th>
                <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 700, color: 'var(--ink-soft)' }}>Connectors</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 700, color: 'var(--ink-soft)' }}>Price</th>
                <th style={{ textAlign: 'center', padding: '6px 8px' }}></th>
              </tr>
            </thead>
            <tbody>
              {allCables.map((cable) => {
                const status = getCableStatus(cable);
                const isSelected = cable.id === selectedId;
                const lengthStr = `${cable.length} ${cable.lengthUnit}`;

                return (
                  <tr
                    key={cable.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: isSelected ? 'var(--accent-subtle, #e8f0fc)' : status === 'undersized' || status === 'short' ? 'var(--warn-subtle, #fef9ec)' : 'transparent',
                      opacity: status === 'undersized' ? 0.55 : 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedId(cable.id)}
                  >
                    <td style={{ padding: '6px 8px', color: 'var(--muted)' }}>{cable.supplier ?? '-'}</td>
                    <td style={{ padding: '6px 8px', fontWeight: isSelected ? 700 : 400 }}>{cable.name}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{cable.gauge}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>{lengthStr}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--muted)' }}>
                      {cable.connectorA && cable.connectorB
                        ? `${cable.connectorA} / ${cable.connectorB}`
                        : cable.connectorA ?? '-'}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                      {cable.price != null ? `$${cable.price.toFixed(2)}` : '-'}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      {status === 'short' && (
                        <span title="Too short for this run" style={{ color: '#c98518', fontSize: 11, fontWeight: 600 }}>Short</span>
                      )}
                      {status === 'undersized' && (
                        <span title="Gauge too small" style={{ color: '#b93232', fontSize: 11, fontWeight: 600 }}>Undersized</span>
                      )}
                      {status === 'exact' && (
                        <span style={{ color: '#2f9461', fontSize: 11, fontWeight: 600 }}>Best match</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {allCables.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>
                    No cable assemblies in catalog.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            disabled={!selectedId}
            onClick={() => {
              if (selectedId) {
                onSelect(selectedId);
                onClose();
              }
            }}
          >
            Select Cable
          </button>
        </div>
      </div>
    </div>
  );
}
