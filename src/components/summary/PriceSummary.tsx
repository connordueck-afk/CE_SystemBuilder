import type { PriceSummary } from '../../types/system';
import { fmt } from '../../utils/priceCalculations';

interface Props {
  summary: PriceSummary;
  activeTab: 'overview' | 'section' | 'manufacturer';
  onTabChange: (tab: 'overview' | 'section' | 'manufacturer') => void;
}

function SummaryRow({ label, msrp, highlight }: { label: string; msrp: number; highlight?: boolean }) {
  return (
    <tr style={{ background: highlight ? 'var(--blue-soft)' : undefined }}>
      <td style={{ color: highlight ? 'var(--ink)' : 'var(--ink-soft)', fontWeight: highlight ? 700 : 600 }}>{label}</td>
      <td style={{ textAlign: 'right', color: 'var(--ink)', fontWeight: 600 }}>{fmt(msrp)}</td>
    </tr>
  );
}

export function PriceSummaryPanel({ summary, activeTab, onTabChange }: Props) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--line)', padding: '6px 8px' }}>
        {(['overview', 'section', 'manufacturer'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              padding: '6px 10px',
              fontSize: 12,
              background: activeTab === tab ? 'var(--blue-soft)' : 'transparent',
              color: activeTab === tab ? 'var(--blue)' : 'var(--muted)',
              border: 'none',
              borderRadius: 6,
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        <table className="price-table">
          <thead>
            <tr>
              <th>Category</th>
              <th style={{ textAlign: 'right' }}>MSRP</th>
            </tr>
          </thead>
          <tbody>
            {activeTab === 'overview' && (
              <>
                <SummaryRow label="Total System" msrp={summary.totalMsrp} highlight />
                <tr>
                  <td colSpan={2} style={{ padding: '6px 8px', color: 'var(--muted)', fontSize: 11, fontWeight: 700 }}>
                    All prices are preliminary MSRP estimates.
                  </td>
                </tr>
              </>
            )}
            {activeTab === 'section' && (
              Object.entries(summary.bySection)
                .sort((a, b) => b[1].msrp - a[1].msrp)
                .map(([section, { msrp }]) => (
                  <SummaryRow key={section} label={section} msrp={msrp} />
                ))
            )}
            {activeTab === 'manufacturer' && (
              Object.entries(summary.byManufacturer)
                .sort((a, b) => b[1].msrp - a[1].msrp)
                .map(([mfr, { msrp }]) => (
                  <SummaryRow key={mfr} label={mfr} msrp={msrp} />
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
