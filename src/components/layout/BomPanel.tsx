import { useState } from 'react';
import type { BomRow, PriceSummary } from '../../types/system';
import type { ElectricalSummary } from '../../utils/systemSummary';
import { BomTable } from '../summary/BomTable';
import { ElectricalSummaryPanel } from '../summary/ElectricalSummary';
import { PriceSummaryPanel } from '../summary/PriceSummary';
import { fmt } from '../../utils/priceCalculations';

type BomTab = 'bom' | 'price' | 'electrical';

interface Props {
  bomRows: BomRow[];
  priceSummary: PriceSummary;
  electricalSummary: ElectricalSummary;
  isOpen: boolean;
  onToggle: () => void;
  onExportCsv: () => void;
}

export function BomPanel({ bomRows, priceSummary, electricalSummary, isOpen, onToggle, onExportCsv }: Props) {
  const [activeTab, setActiveTab] = useState<BomTab>('bom');
  const [priceTab, setPriceTab] = useState<'overview' | 'section' | 'manufacturer'>('overview');

  return (
    <aside className={`bom-panel${isOpen ? ' bom-panel-open' : ''}`}>
      <button className="bom-panel-tab" onClick={onToggle} title={isOpen ? 'Collapse panel' : 'Expand BOM'}>
        <span className="bom-panel-tab-icon">{isOpen ? '>' : '<'}</span>
        <span className="bom-panel-tab-label">BOM</span>
      </button>

      <div className="bom-panel-inner">
        <div className="bom-panel-header">
          <button
            className={`bottom-tab ${activeTab === 'bom' ? 'bottom-tab-active' : ''}`}
            onClick={() => setActiveTab('bom')}
          >
            BOM ({bomRows.length})
          </button>
          <button
            className={`bottom-tab ${activeTab === 'price' ? 'bottom-tab-active' : ''}`}
            onClick={() => setActiveTab('price')}
          >
            Price
          </button>
          <button
            className={`bottom-tab ${activeTab === 'electrical' ? 'bottom-tab-active' : ''}`}
            onClick={() => setActiveTab('electrical')}
          >
            Electrical
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn-header" onClick={onExportCsv} title="Export BOM as CSV">
            CSV
          </button>
        </div>

        <div className="bom-panel-totals">
          <span className="bottom-total-label">MSRP</span>
          <span className="bottom-total-msrp">{fmt(priceSummary.totalMsrp)}</span>
          <span className="bottom-total-label">OEM</span>
          <span className="bottom-total-oem">{fmt(priceSummary.totalOem)}</span>
          <span className="bottom-total-label">Save</span>
          <span className="bottom-total-save">{fmt(priceSummary.savings)}</span>
        </div>

        <div className="bom-panel-content">
          {activeTab === 'bom' && (
            <BomTable rows={bomRows} />
          )}
          {activeTab === 'price' && (
            <PriceSummaryPanel
              summary={priceSummary}
              activeTab={priceTab}
              onTabChange={setPriceTab}
            />
          )}
          {activeTab === 'electrical' && (
            <ElectricalSummaryPanel summary={electricalSummary} />
          )}
        </div>
      </div>
    </aside>
  );
}
