import { useState } from 'react';
import type { CableLengthSummaryItem } from '../../types/system';
import type { CableBomRow, CableEndTermination, ConnectorSummaryItem } from '../../utils/cableSummary';
import { cableColorSwatch } from '../inspector/ConnectionInspector';
import { formatFeetAndInches } from '../../utils/cableSummary';
import { fmt } from '../../utils/priceCalculations';

type CableView = 'cables' | 'totals';

interface Props {
  summary: CableLengthSummaryItem[];
  cableRows: CableBomRow[];
  connectorSummary: ConnectorSummaryItem[];
}

function ColorCell({ color }: { color: string }) {
  if (!color) return <span style={{ color: '#9aa5b4' }}>—</span>;
  const swatch = cableColorSwatch(color);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      {swatch && (
        <span style={{
          display: 'inline-block',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: swatch,
          border: '1px solid rgba(0,0,0,0.18)',
          flexShrink: 0,
        }} />
      )}
      {color}
    </span>
  );
}

function EndCell({ end }: { end: CableEndTermination }) {
  if (!end.connector) return <span style={{ color: '#9aa5b4' }}>—</span>;
  return (
    <span>
      {end.label}
      {end.lug && (
        <span style={{ display: 'block', color: '#6d7b90', fontSize: 11, fontWeight: 600 }}>
          {end.lug.label}
        </span>
      )}
    </span>
  );
}

export function CableSummaryPanel({ summary, cableRows, connectorSummary }: Props) {
  const [view, setView] = useState<CableView>('cables');

  if (summary.length === 0 && cableRows.length === 0) {
    return (
      <div className="empty-state">
        No cable lengths have been assigned yet.
      </div>
    );
  }

  return (
    <div className="summary-panel">
      <div className="bom-summary-toolbar" style={{ marginBottom: 10 }}>
        <button
          className={`bottom-tab ${view === 'cables' ? 'bottom-tab-active' : ''}`}
          onClick={() => setView('cables')}
        >
          Cables ({cableRows.length})
        </button>
        <button
          className={`bottom-tab ${view === 'totals' ? 'bottom-tab-active' : ''}`}
          onClick={() => setView('totals')}
        >
          Totals
        </button>
      </div>

      {view === 'cables' && (
        <table className="bom-table">
          <thead>
            <tr>
              <th>Cable</th>
              <th>Gauge</th>
              <th>Length</th>
              <th>Color</th>
              <th>Type</th>
              <th>End A</th>
              <th>End B</th>
            </tr>
          </thead>
          <tbody>
            {cableRows.map((row) => (
              <tr key={row.connectionId}>
                <td>{row.fromLabel} → {row.toLabel}</td>
                <td>{row.gauge}</td>
                <td>{formatFeetAndInches(row.lengthFt)}</td>
                <td><ColorCell color={row.color} /></td>
                <td>{row.type || <span style={{ color: '#9aa5b4' }}>—</span>}</td>
                <td><EndCell end={row.fromEnd} /></td>
                <td><EndCell end={row.toEnd} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {view === 'totals' && (
        <>
          <div className="inspector-label" style={{ marginBottom: 6 }}>Cable by gauge</div>
          <table className="bom-table">
            <thead>
              <tr>
                <th>Gauge</th>
                <th>Color</th>
                <th>Type</th>
                <th>Length</th>
                <th>Runs</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((item, i) => (
                <tr key={i}>
                  <td>{item.gauge}</td>
                  <td><ColorCell color={item.color} /></td>
                  <td>{item.type || <span style={{ color: '#9aa5b4' }}>—</span>}</td>
                  <td>{formatFeetAndInches(item.totalLengthFt)}</td>
                  <td>{item.cableCount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="inspector-label" style={{ margin: '16px 0 6px' }}>Lugs &amp; connectors</div>
          {connectorSummary.length === 0 ? (
            <div className="empty-state">No terminations resolved yet.</div>
          ) : (
            <table className="bom-table">
              <thead>
                <tr>
                  <th>Connector</th>
                  <th>Qty</th>
                  <th>Est. Unit</th>
                  <th>Est. Total</th>
                </tr>
              </thead>
              <tbody>
                {connectorSummary.map((item) => (
                  <tr key={item.key}>
                    <td>{item.label}</td>
                    <td>{item.count}</td>
                    <td>{item.estUnitMsrpUsd != null ? fmt(item.estUnitMsrpUsd) : <span style={{ color: '#9aa5b4' }}>—</span>}</td>
                    <td>{item.estExtendedMsrpUsd != null ? fmt(item.estExtendedMsrpUsd) : <span style={{ color: '#9aa5b4' }}>—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
