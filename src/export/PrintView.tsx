import { createPortal } from 'react-dom';
import type { BomRow, PriceSummary, Product, SystemDesign } from '../types/system';
import type { BusColorMap } from '../utils/busColors';
import type { BusType } from '../utils/electricalNetlist';
import type { ElectricalSummary } from '../utils/systemSummary';
import { BUS_COLOR_OPTIONS } from '../utils/busColors';
import { StaticSchematic } from './StaticSchematic';
import './print.css';

interface Props {
  system: SystemDesign;
  products: Map<string, Product>;
  busColors: BusColorMap;
  bomRows: BomRow[];
  electricalSummary: ElectricalSummary;
  priceSummary: PriceSummary;
}

const BUS_LABEL: Partial<Record<BusType, string>> = {
  dc_pos: 'DC Positive',
  dc_neg: 'DC Negative / Return',
  chassis_ground: 'Chassis Ground',
  pv_pos: 'PV Positive',
  pv_neg: 'PV Negative',
  ac_line: 'AC Line (L1)',
  ac_line2: 'AC Line (L2)',
  ac_neutral: 'AC Neutral',
  ac_ground: 'AC Ground',
  communication: 'Communication',
  signal: 'Signal',
  unknown: 'Unknown',
};

const CABLE_SCHEDULE_ORDER: BusType[] = [
  'dc_pos', 'dc_neg', 'chassis_ground',
  'pv_pos', 'pv_neg',
  'ac_line', 'ac_line2', 'ac_neutral', 'ac_ground',
  'communication', 'signal',
];

function fmt(val: number | null | undefined, suffix = '') {
  if (val == null) return '—';
  return `${val.toLocaleString()}${suffix}`;
}

function fmtPrice(val: number | null) {
  if (val == null) return '—';
  return `$${val.toFixed(2)}`;
}

export function PrintView({ system, products, busColors, bomRows, electricalSummary, priceSummary }: Props) {
  const date = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

  // --- Summary metrics ---
  const batteryKwh = electricalSummary.battery.capacityWh > 0
    ? (electricalSummary.battery.capacityWh / 1000).toFixed(2)
    : null;
  const batteryAh = electricalSummary.battery.capacityAh;
  const solarW = electricalSummary.solar.reduce((sum, s) => sum + s.powerW, 0) || null;

  const acOutputW = system.components.reduce((sum, comp) => {
    const product = products.get(comp.productId);
    if (!product) return sum;
    if (product.productType === 'inverter_charger') {
      return sum + (product.inverterChargerRatings?.continuousInverterW ?? product.continuousPowerW ?? 0);
    }
    return sum;
  }, 0) || null;

  const dcBusCurrentA = electricalSummary.powerNodes
    .filter((n) => n.busType === 'dc_pos')
    .reduce((max, n) => Math.max(max, n.operatingCurrentA), 0) || null;

  // --- Cable schedule ---
  const componentLabel = (id: string) => {
    const comp = system.components.find((c) => c.id === id);
    if (!comp) return id;
    const product = products.get(comp.productId);
    return comp.label ?? product?.name ?? id;
  };

  const connsByBus = new Map<BusType, typeof system.connections>();
  for (const conn of system.connections) {
    if (conn.busLink) continue; // skip cableless bus links
    const busType: BusType = (conn.wireKind === 'communication' ? 'communication' : conn.busType) as BusType ?? 'unknown';
    if (!connsByBus.has(busType)) connsByBus.set(busType, []);
    connsByBus.get(busType)!.push(conn);
  }

  const hasCommunication = system.connections.some(
    (c) => c.wireKind === 'communication' || c.busType === 'communication',
  );

  // --- BOM ---
  const bomBySection = bomRows.reduce<Record<string, BomRow[]>>((acc, row) => {
    (acc[row.section] ??= []).push(row);
    return acc;
  }, {});

  return createPortal(
    <div className="print-view">

      {/* ── PAGE 1: Cover + Summary ── */}
      <div className="print-page print-cover">
        <div className="cover-logo-row">
          <img src={`${import.meta.env.BASE_URL}brand/canadian-energy-logo.png`} alt="Canadian Energy" className="cover-logo" />
          <span className="cover-doc-type">System Design Document</span>
        </div>
        <div className="cover-title">{system.name}</div>
        <div className="cover-meta">
          <span>{date}</span>
          <span>{system.nominalVoltage}V DC System</span>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-card-label">Battery Capacity</div>
            <div className="summary-card-value">{batteryKwh ? `${batteryKwh} kWh` : '—'}</div>
            {batteryAh != null && (
              <div className="summary-card-sub">{fmt(Math.round(batteryAh))} Ah @ {system.nominalVoltage}V</div>
            )}
          </div>
          <div className="summary-card">
            <div className="summary-card-label">Solar Capacity</div>
            <div className="summary-card-value">{solarW ? `${fmt(solarW)} W` : '—'}</div>
            {electricalSummary.solar.length > 0 && (
              <div className="summary-card-sub">{electricalSummary.solar.length} MPPT tracker{electricalSummary.solar.length !== 1 ? 's' : ''}</div>
            )}
          </div>
          <div className="summary-card">
            <div className="summary-card-label">AC Output</div>
            <div className="summary-card-value">{acOutputW ? `${fmt(acOutputW)} W` : '—'}</div>
            <div className="summary-card-sub">Continuous</div>
          </div>
          <div className="summary-card">
            <div className="summary-card-label">DC Bus Load</div>
            <div className="summary-card-value">{dcBusCurrentA ? `${Math.round(dcBusCurrentA)} A` : '—'}</div>
            <div className="summary-card-sub">@ {system.nominalVoltage}V</div>
          </div>
        </div>
      </div>

      {/* ── PAGE 2: Full Schematic ── */}
      <div className="print-page print-schematic-page">
        <div className="schematic-page-header">
          <span className="schematic-page-title">Full System Schematic</span>
          <span className="schematic-page-name">{system.name}</span>
        </div>
        <div className="schematic-frame">
          <StaticSchematic system={system} products={products} busColors={busColors} filter="all" />
        </div>
      </div>

      {/* ── PAGE 3: DC Circuit ── */}
      <div className="print-page print-schematic-page">
        <div className="schematic-page-header">
          <span className="schematic-page-title">DC Circuit</span>
          <span className="schematic-page-name">{system.name}</span>
        </div>
        <div className="schematic-frame">
          <StaticSchematic system={system} products={products} busColors={busColors} filter="dc" />
        </div>
      </div>

      {/* ── PAGE 4: AC Circuit ── */}
      <div className="print-page print-schematic-page">
        <div className="schematic-page-header">
          <span className="schematic-page-title">AC Circuit</span>
          <span className="schematic-page-name">{system.name}</span>
        </div>
        <div className="schematic-frame">
          <StaticSchematic system={system} products={products} busColors={busColors} filter="ac" />
        </div>
      </div>

      {/* ── PAGE 5: Communication Network (only if present) ── */}
      {hasCommunication && (
        <div className="print-page print-schematic-page">
          <div className="schematic-page-header">
            <span className="schematic-page-title">Communication Network</span>
            <span className="schematic-page-name">{system.name}</span>
          </div>
          <div className="schematic-frame">
            <StaticSchematic system={system} products={products} busColors={busColors} filter="communication" />
          </div>
        </div>
      )}

      {/* ── PAGE 6: Legend ── */}
      <div className="print-page print-legend-page">
        <div className="legend-title">Legend</div>
        <div className="legend-body">
          <div className="legend-section">
            <div className="legend-section-title">Wire Colours</div>
            {BUS_COLOR_OPTIONS.map((opt) => (
              <div key={opt.key} className="legend-row">
                <span className="legend-swatch" style={{ background: busColors[opt.key] }} />
                <span className="legend-label">{opt.label}</span>
              </div>
            ))}
          </div>
          <div className="legend-section">
            <div className="legend-section-title">Wire Thickness</div>
            <div className="legend-row"><span className="legend-line legend-line-xl" /><span className="legend-label">2/0 – 4/0 AWG</span></div>
            <div className="legend-row"><span className="legend-line legend-line-lg" /><span className="legend-label">1 – 1/0 AWG</span></div>
            <div className="legend-row"><span className="legend-line legend-line-md" /><span className="legend-label">4 – 6 AWG</span></div>
            <div className="legend-row"><span className="legend-line legend-line-sm" /><span className="legend-label">8 – 14 AWG</span></div>
            <div className="legend-section-title" style={{ marginTop: 20 }}>Labels</div>
            <div className="legend-row">
              <span className="legend-awg-badge">2/0</span>
              <span className="legend-label">Wire gauge label on each run</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CABLE SCHEDULE ── */}
      <div className="print-page print-table-page">
        <div className="table-page-title">{system.name} — Cable Schedule</div>
        {CABLE_SCHEDULE_ORDER.map((busType) => {
          const conns = connsByBus.get(busType);
          if (!conns || conns.length === 0) return null;
          const color = busColors[busType];
          return (
            <div key={busType} className="cable-section">
              <div className="cable-section-header" style={{ borderLeftColor: color }}>
                {BUS_LABEL[busType] ?? busType}
              </div>
              <table className="print-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>From</th>
                    <th>To</th>
                    <th>AWG</th>
                    <th>Length</th>
                    <th>Colour</th>
                    <th>Fuse / OCP</th>
                  </tr>
                </thead>
                <tbody>
                  {conns.map((conn, i) => (
                    <tr key={conn.id}>
                      <td className="td-num">{i + 1}</td>
                      <td>{componentLabel(conn.fromComponentId)}</td>
                      <td>{componentLabel(conn.toComponentId)}</td>
                      <td className="td-center">{conn.manualCableAwg ?? conn.recommendedCableAwg ?? '—'}</td>
                      <td className="td-center">{conn.cableLengthFt ? `${conn.cableLengthFt.toFixed(1)} ft` : '—'}</td>
                      <td className="td-center">{conn.cableColor ?? '—'}</td>
                      <td className="td-center">{conn.recommendedFuseA ? `${conn.recommendedFuseA}A` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {/* ── BILL OF MATERIALS ── */}
      <div className="print-page print-table-page">
        <div className="table-page-title">{system.name} — Bill of Materials</div>
        <table className="print-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Manufacturer</th>
              <th className="td-center">Qty</th>
              <th className="td-right">Unit MSRP</th>
              <th className="td-right">Extended</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(bomBySection).flatMap(([section, rows]) => [
              <tr key={`g-${section}`} className="bom-group-row">
                <td colSpan={5}>{section}</td>
              </tr>,
              ...rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.partName}</td>
                  <td>{row.manufacturer}</td>
                  <td className="td-center">{row.quantity}</td>
                  <td className="td-right">{fmtPrice(row.unitMsrpUsd)}</td>
                  <td className="td-right">{fmtPrice(row.extendedMsrpUsd)}</td>
                </tr>
              )),
            ])}
          </tbody>
        </table>
        <div className="bom-total-row">
          <span>Total MSRP</span>
          <span>{fmtPrice(priceSummary.totalMsrp)}</span>
        </div>
      </div>

    </div>,
    document.body,
  );
}
