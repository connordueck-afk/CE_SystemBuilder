import type { CableLengthSummaryItem } from '../../types/system';
import { cableColorSwatch } from '../inspector/ConnectionInspector';
import { formatFeetAndInches } from '../../utils/cableSummary';

interface Props {
  summary: CableLengthSummaryItem[];
}

export function CableSummaryPanel({ summary }: Props) {
  if (summary.length === 0) {
    return (
      <div className="empty-state">
        No cable lengths have been assigned yet.
      </div>
    );
  }

  return (
    <div className="summary-panel">
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
          {summary.map((item, i) => {
            const swatch = item.color ? cableColorSwatch(item.color) : null;
            return (
              <tr key={i}>
                <td>{item.gauge}</td>
                <td>
                  {item.color ? (
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
                      {item.color}
                    </span>
                  ) : <span style={{ color: '#9aa5b4' }}>—</span>}
                </td>
                <td>{item.type || <span style={{ color: '#9aa5b4' }}>—</span>}</td>
                <td>{formatFeetAndInches(item.totalLengthFt)}</td>
                <td>{item.cableCount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
