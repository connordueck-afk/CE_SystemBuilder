import { useState } from 'react';
import type { BomRow, CableLengthSummaryItem, PriceSummary } from '../../types/system';
import type { CableBomRow, ConnectorSummaryItem } from '../../utils/cableSummary';
import type { ElectricalSummary } from '../../utils/systemSummary';
import { fmt } from '../../utils/priceCalculations';
import { BomTable } from '../summary/BomTable';
import { CableSummaryPanel } from '../summary/CableSummary';
import { ElectricalSummaryPanel } from '../summary/ElectricalSummary';
import { PriceSummaryPanel } from '../summary/PriceSummary';

type BomTab = 'bom' | 'cables' | 'price' | 'electrical';

interface Props {
  bomRows: BomRow[];
  cableSummary: CableLengthSummaryItem[];
  cableBomRows: CableBomRow[];
  connectorSummary: ConnectorSummaryItem[];
  priceSummary: PriceSummary;
  electricalSummary: ElectricalSummary;
  onClose: () => void;
  onExportCsv: () => void;
}

export function BomSummaryModal({
  bomRows,
  cableSummary,
  cableBomRows,
  connectorSummary,
  priceSummary,
  electricalSummary,
  onClose,
  onExportCsv,
}: Props) {
  const [activeTab, setActiveTab] = useState<BomTab>('bom');
  const [priceTab, setPriceTab] = useState<'overview' | 'section' | 'manufacturer'>('overview');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal bom-summary-modal" onClick={(event) => event.stopPropagation()}>
        <div className="bom-summary-header">
          <div>
            <div className="modal-title">BOM Summary</div>
            <div className="bom-summary-totals">
              <span className="bottom-total-label">MSRP</span>
              <span className="bottom-total-msrp">{fmt(priceSummary.totalMsrp)}</span>
              <span className="bottom-total-label">OEM</span>
              <span className="bottom-total-oem">{fmt(priceSummary.totalOem)}</span>
              <span className="bottom-total-label">Save</span>
              <span className="bottom-total-save">{fmt(priceSummary.savings)}</span>
            </div>
          </div>
          <button className="product-selector-close" onClick={onClose} title="Close">x</button>
        </div>

        <div className="bom-summary-toolbar">
          <button
            className={`bottom-tab ${activeTab === 'bom' ? 'bottom-tab-active' : ''}`}
            onClick={() => setActiveTab('bom')}
          >
            BOM ({bomRows.length})
          </button>
          <button
            className={`bottom-tab ${activeTab === 'cables' ? 'bottom-tab-active' : ''}`}
            onClick={() => setActiveTab('cables')}
          >
            Cable Summary
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
          <div className="bom-summary-toolbar-spacer" />
          <button className="btn-header" onClick={onExportCsv} title="Export BOM as CSV">
            Export CSV
          </button>
        </div>

        <div className="bom-summary-content">
          {activeTab === 'bom' && <BomTable rows={bomRows} />}
          {activeTab === 'cables' && (
            <CableSummaryPanel
              summary={cableSummary}
              cableRows={cableBomRows}
              connectorSummary={connectorSummary}
            />
          )}
          {activeTab === 'price' && (
            <PriceSummaryPanel
              summary={priceSummary}
              activeTab={priceTab}
              onTabChange={setPriceTab}
            />
          )}
          {activeTab === 'electrical' && <ElectricalSummaryPanel summary={electricalSummary} />}
        </div>
      </div>
    </div>
  );
}
