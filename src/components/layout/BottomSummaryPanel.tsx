import type { BomRow, PriceSummary } from '../../types/system';
import { BomTable } from '../summary/BomTable';
import { PriceSummaryPanel } from '../summary/PriceSummary';
import { fmt } from '../../utils/priceCalculations';

type MainTab = 'bom' | 'price';
type PriceTab = 'overview' | 'section' | 'manufacturer';

interface Props {
  bomRows: BomRow[];
  priceSummary: PriceSummary;
  activeTab: MainTab;
  priceTab: PriceTab;
  onTabChange: (tab: MainTab) => void;
  onPriceTabChange: (tab: PriceTab) => void;
  onExportCsv: () => void;
}

export function BottomSummaryPanel({
  bomRows,
  priceSummary,
  activeTab,
  priceTab,
  onTabChange,
  onPriceTabChange,
  onExportCsv,
}: Props) {
  return (
    <div className="bottom-panel">
      {/* Tab bar */}
      <div className="bottom-panel-tabs">
        <button
          className={`bottom-tab ${activeTab === 'bom' ? 'bottom-tab-active' : ''}`}
          onClick={() => onTabChange('bom')}
        >
          BOM ({bomRows.length})
        </button>
        <button
          className={`bottom-tab ${activeTab === 'price' ? 'bottom-tab-active' : ''}`}
          onClick={() => onTabChange('price')}
        >
          Price Summary
        </button>
        <div style={{ flex: 1 }} />
        {/* Quick totals */}
        <div className="bottom-totals">
          <span className="bottom-total-label">Total MSRP</span>
          <span className="bottom-total-msrp">{fmt(priceSummary.totalMsrp)}</span>
          <span className="bottom-total-label">OEM Est.</span>
          <span className="bottom-total-oem">{fmt(priceSummary.totalOem)}</span>
          <span className="bottom-total-label">Save</span>
          <span className="bottom-total-save">{fmt(priceSummary.savings)}</span>
        </div>
        <button className="btn-header" style={{ marginRight: 8 }} onClick={onExportCsv}>
          Export CSV
        </button>
      </div>

      {/* Panel content */}
      <div className="bottom-panel-content">
        {activeTab === 'bom' && (
          <BomTable rows={bomRows} />
        )}
        {activeTab === 'price' && (
          <PriceSummaryPanel
            summary={priceSummary}
            activeTab={priceTab}
            onTabChange={onPriceTabChange}
          />
        )}
      </div>
    </div>
  );
}
