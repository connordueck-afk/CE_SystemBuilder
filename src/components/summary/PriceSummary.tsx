import type { PriceSummary } from '../../types/system';
import { fmt } from '../../utils/priceCalculations';

interface Props {
  summary: PriceSummary;
  activeTab: 'overview' | 'section' | 'manufacturer';
  onTabChange: (tab: 'overview' | 'section' | 'manufacturer') => void;
}

function SummaryRow({
  label, msrp, oem, highlight,
}: {
  label: string;
  msrp: number;
  oem: number;
  highlight?: boolean;
}) {
  return (
    <tr style={{ background: highlight ? '#eaf4ff' : undefined }}>
      <td style={{ color: highlight ? '#182235' : '#46546a', fontWeight: highlight ? 700 : 600 }}>{label}</td>
      <td style={{ textAlign: 'right', color: '#182235', fontWeight: 600 }}>{fmt(msrp)}</td>
      <td style={{ textAlign: 'right', color: '#2f9461', fontWeight: 600 }}>{fmt(oem)}</td>
      <td style={{ textAlign: 'right', color: '#6d7b90', fontSize: 11, fontWeight: 600 }}>
        {msrp > 0 ? `${(((msrp - oem) / msrp) * 100).toFixed(0)}%` : '-'}
      </td>
    </tr>
  );
}

export function PriceSummaryPanel({ summary, activeTab, onTabChange }: Props) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #dbe2ec', padding: '6px 8px' }}>
        {(['overview', 'section', 'manufacturer'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              padding: '6px 10px',
              fontSize: 12,
              background: activeTab === tab ? '#eaf4ff' : 'transparent',
              color: activeTab === tab ? '#1769d2' : '#6d7b90',
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
              <th style={{ textAlign: 'right' }}>OEM Est.</th>
              <th style={{ textAlign: 'right' }}>Savings</th>
            </tr>
          </thead>
          <tbody>
            {activeTab === 'overview' && (
              <>
                <SummaryRow label="Total System" msrp={summary.totalMsrp} oem={summary.totalOem} highlight />
                <tr>
                  <td colSpan={4} style={{ padding: '6px 8px', color: '#6d7b90', fontSize: 11, fontWeight: 700 }}>
                    OEM estimate uses {100 - 30}% of MSRP unless overridden. All prices are preliminary.
                  </td>
                </tr>
                <tr>
                  <td style={{ color: '#46546a', fontWeight: 700 }}>Est. Savings vs MSRP</td>
                  <td colSpan={2} />
                  <td style={{ textAlign: 'right', color: '#2f9461', fontWeight: 700 }}>
                    {fmt(summary.savings)}
                  </td>
                </tr>
              </>
            )}
            {activeTab === 'section' && (
              Object.entries(summary.bySection)
                .sort((a, b) => b[1].msrp - a[1].msrp)
                .map(([section, { msrp, oem }]) => (
                  <SummaryRow key={section} label={section} msrp={msrp} oem={oem} />
                ))
            )}
            {activeTab === 'manufacturer' && (
              Object.entries(summary.byManufacturer)
                .sort((a, b) => b[1].msrp - a[1].msrp)
                .map(([mfr, { msrp, oem }]) => (
                  <SummaryRow key={mfr} label={mfr} msrp={msrp} oem={oem} />
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

