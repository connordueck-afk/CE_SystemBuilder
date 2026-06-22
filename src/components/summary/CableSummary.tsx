import type { CableLengthSummaryItem } from '../../types/system';

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
            <th>Cable Gauge</th>
            <th>Total Length</th>
            <th>Cable Count</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((item) => (
            <tr key={item.gauge}>
              <td>{item.gauge}</td>
              <td>{item.totalLengthFt.toFixed(1)} ft</td>
              <td>{item.cableCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
