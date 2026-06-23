import { Fragment, useState, type ReactNode } from 'react';
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
  /** Toggle a connection between a real cable (in BOM) and a cableless bus link. */
  onToggleBusLink?: (connectionId: string, busLink: boolean) => void;
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

// -----------------------------------------------------------
// Visual cable row
// -----------------------------------------------------------

// Shared gradient/filter defs — render once inside the panel
function CableConnectorDefs() {
  return (
    <svg width={0} height={0} style={{ position: 'absolute', pointerEvents: 'none' }}>
      <defs>
        {/* Light silver metal (lug barrel, screw head) */}
        <linearGradient id="cc-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f5f5f5"/>
          <stop offset="55%"  stopColor="#d8d8d8"/>
          <stop offset="100%" stopColor="#c0c0c0"/>
        </linearGradient>
        {/* Dark plastic housing (MC4, screw block) */}
        <linearGradient id="cc-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#4a5059"/>
          <stop offset="45%"  stopColor="#2f343b"/>
          <stop offset="100%" stopColor="#171b21"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Brightens (factor > 1, mixes with white) or darkens (factor < 1, scales down) a hex colour
function tintHex(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const ch = (c: number) =>
    factor >= 1
      ? Math.min(255, Math.round(c + (255 - c) * (factor - 1)))
      : Math.max(0, Math.round(c * factor));
  return `#${ch(r).toString(16).padStart(2, '0')}${ch(g).toString(16).padStart(2, '0')}${ch(b).toString(16).padStart(2, '0')}`;
}

// Connector SVG canvas: 48 × 28. Cable strand exits from the cable-facing edge at y=14.
const CW = 48;
const CH = 28;
const CY = CH / 2; // 14 — vertical centre / cable strand height

type ConnectorKindStr = 'lug' | 'screw_terminal' | 'mc4_male' | 'mc4_female';

function ConnectorIcon({ kind, side }: { kind: ConnectorKindStr | undefined; side: 'left' | 'right' }) {
  let shapes: ReactNode;

  if (kind === 'lug') {
    // Ring terminal: silver ring disc on outward end + crimp barrel toward cable
    const ringCx = side === 'left' ? 11 : CW - 11;
    const barrelX = side === 'left' ? 20 : 0;
    const barrelW = CW - 20;
    // Shoulder: trapezoid tapering from ring diameter (20px) to barrel (8px)
    const sX = side === 'left' ? 19 : 1;
    const sDir = side === 'left' ? -1 : 1; // shoulder opens outward
    shapes = (
      <>
        {/* Crimp barrel */}
        <rect x={barrelX} y={CY - 4} width={barrelW} height={8} rx={2}
          fill="url(#cc-metal)" stroke="#9a9a9a" strokeWidth={0.8}/>
        <rect x={barrelX + 1} y={CY - 3} width={barrelW - 2} height={2} rx={1}
          fill="white" fillOpacity={0.45}/>
        {/* Crimp seam marks */}
        <line x1={barrelX + (side === 'left' ? 6 : barrelW - 6)} y1={CY - 4}
              x2={barrelX + (side === 'left' ? 6 : barrelW - 6)} y2={CY + 4}
              stroke="#9a9a9a" strokeWidth={0.7} strokeOpacity={0.6}/>
        <line x1={barrelX + (side === 'left' ? 12 : barrelW - 12)} y1={CY - 4}
              x2={barrelX + (side === 'left' ? 12 : barrelW - 12)} y2={CY + 4}
              stroke="#9a9a9a" strokeWidth={0.7} strokeOpacity={0.6}/>
        {/* Shoulder */}
        <path d={`M${sX},${CY-4} L${sX + sDir*2},${CY-6} L${sX + sDir*2},${CY+6} L${sX},${CY+4} Z`}
          fill="#b8b8b8" stroke="#9a9a9a" strokeWidth={0.5}/>
        {/* Ring disc */}
        <circle cx={ringCx} cy={CY} r={11}
          fill="url(#cc-metal)" stroke="#9a9a9a" strokeWidth={0.8}/>
        {/* Ring highlight arc */}
        <path d={`M${ringCx - 8},${CY - 7} Q${ringCx},${CY - 12} ${ringCx + 8},${CY - 7}`}
          fill="none" stroke="white" strokeWidth={1.5} strokeOpacity={0.4} strokeLinecap="round"/>
        {/* Ring hole (stud cutout) */}
        <circle cx={ringCx} cy={CY} r={4.5} fill="#c4ccd4" stroke="#909090" strokeWidth={0.7}/>
        <circle cx={ringCx} cy={CY} r={2.5} fill="#9098a4"/>
      </>
    );
  } else if (kind === 'screw_terminal') {
    // Dark plastic block with a visible phillips screw on the face
    const wireX = side === 'left' ? CW - 10 : 0;
    shapes = (
      <>
        {/* Plastic body */}
        <rect x={2} y={4} width={CW - 4} height={20} rx={3}
          fill="url(#cc-body)" stroke="#31363d" strokeWidth={0.8}/>
        {/* Top glint */}
        <rect x={3} y={5} width={CW - 6} height={2.5} rx={1.5} fill="white" fillOpacity={0.07}/>
        {/* Wire-entry slot (cable-facing side) */}
        <rect x={wireX} y={CY - 3} width={10} height={6} rx={2} fill="#0f1520" stroke="#252d3a" strokeWidth={0.5}/>
        {/* Metal clamp bar */}
        <rect x={9} y={9} width={CW - 18} height={10} rx={2} fill="#1a2030" stroke="#2a3550" strokeWidth={0.5}/>
        {/* Screw head */}
        <circle cx={CW / 2} cy={CY} r={5.5} fill="url(#cc-metal)" stroke="#9a9a9a" strokeWidth={0.7}/>
        <circle cx={CW / 2 - 1} cy={CY - 1} r={2} fill="white" fillOpacity={0.3}/>
        {/* Phillips slot */}
        <line x1={CW/2 - 3.5} y1={CY} x2={CW/2 + 3.5} y2={CY} stroke="#555" strokeWidth={1.1} strokeLinecap="round"/>
        <line x1={CW/2} y1={CY - 3.5} x2={CW/2} y2={CY + 3.5} stroke="#555" strokeWidth={1.1} strokeLinecap="round"/>
      </>
    );
  } else if (kind === 'mc4_male') {
    // Cylindrical black housing + hex locking collar + protruding metal pin on the outward end
    const houseX = side === 'left' ? 6 : 2;
    const houseW = CW - 10;
    const collarX = side === 'left' ? 16 : 22;
    const pinX = side === 'left' ? 0 : CW - 8;
    shapes = (
      <>
        {/* Main housing cylinder */}
        <rect x={houseX} y={CY - 6} width={houseW} height={12} rx={6}
          fill="url(#cc-body)" stroke="#1e2428" strokeWidth={0.8}/>
        {/* Top glint */}
        <rect x={houseX + 2} y={CY - 5} width={houseW - 6} height={2} rx={1}
          fill="white" fillOpacity={0.1}/>
        {/* Hex locking collar (simplified as wider darker band) */}
        <rect x={collarX} y={CY - 8} width={12} height={16} rx={2}
          fill="#22282e" stroke="#1a1e24" strokeWidth={0.8}/>
        <line x1={collarX + 1} y1={CY - 7} x2={collarX + 11} y2={CY - 7}
          stroke="#2e3640" strokeWidth={1.2}/>
        <line x1={collarX + 1} y1={CY + 7} x2={collarX + 11} y2={CY + 7}
          stroke="#2e3640" strokeWidth={1.2}/>
        {/* Contact pin */}
        <rect x={pinX} y={CY - 2} width={8} height={4} rx={2}
          fill="url(#cc-metal)" stroke="#9a9a9a" strokeWidth={0.6}/>
      </>
    );
  } else if (kind === 'mc4_female') {
    // Cylindrical black housing + hex collar + socket recess on outward end
    const houseX = side === 'left' ? 8 : 2;
    const houseW = CW - 10;
    const collarX = side === 'left' ? 16 : 22;
    const sockCx = side === 'left' ? 6 : CW - 6;
    shapes = (
      <>
        {/* Main housing cylinder */}
        <rect x={houseX} y={CY - 6} width={houseW} height={12} rx={6}
          fill="url(#cc-body)" stroke="#1e2428" strokeWidth={0.8}/>
        <rect x={houseX + 2} y={CY - 5} width={houseW - 6} height={2} rx={1}
          fill="white" fillOpacity={0.1}/>
        {/* Locking collar */}
        <rect x={collarX} y={CY - 8} width={12} height={16} rx={2}
          fill="#22282e" stroke="#1a1e24" strokeWidth={0.8}/>
        <line x1={collarX + 1} y1={CY - 7} x2={collarX + 11} y2={CY - 7}
          stroke="#2e3640" strokeWidth={1.2}/>
        <line x1={collarX + 1} y1={CY + 7} x2={collarX + 11} y2={CY + 7}
          stroke="#2e3640" strokeWidth={1.2}/>
        {/* Socket recess: dark circle on outward face */}
        <circle cx={sockCx} cy={CY} r={6} fill="#0c1014" stroke="#1e2428" strokeWidth={0.8}/>
        <circle cx={sockCx} cy={CY} r={3}   fill="#1c2028"/>
        <circle cx={sockCx} cy={CY} r={1.5} fill="#2a3040"/>
      </>
    );
  } else {
    // Unknown / no connector: simple metal end cap on the cable-facing edge
    const capX = side === 'left' ? CW - 8 : 0;
    shapes = (
      <>
        <rect x={capX} y={CY - 4} width={8} height={8} rx={2}
          fill="url(#cc-metal)" stroke="#9a9a9a" strokeWidth={0.7}/>
        <rect x={capX + 1} y={CY - 3} width={6} height={2} rx={1}
          fill="white" fillOpacity={0.4}/>
      </>
    );
  }

  return (
    <svg width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`}
      style={{ display: 'block', flexShrink: 0 }}>
      {shapes}
    </svg>
  );
}

function CableVisualRow({ row }: { row: CableBomRow }) {
  const swatchColor = row.color ? cableColorSwatch(row.color) : null;
  const base = swatchColor ?? '#5a6478';

  // Cylindrical gradient: bright highlight top → base colour → shadow bottom
  const hiColor  = tintHex(base, 1.45);
  const loColor  = tintHex(base, 0.58);

  const fromKind = row.fromEnd.connector?.kind as ConnectorKindStr | undefined;
  const toKind   = row.toEnd.connector?.kind as ConnectorKindStr | undefined;

  const gaugeLabel  = row.gauge !== 'Unspecified' ? `${row.gauge} AWG` : '';
  const lengthLabel = formatFeetAndInches(row.lengthFt);

  return (
    <div>
      {/* Visual: connector — thin cable strand — connector */}
      <div style={{ display: 'flex', alignItems: 'center', height: CH }}>
        <ConnectorIcon kind={fromKind} side="left" />
        <div style={{
          flex: 1,
          height: 5,
          background: `linear-gradient(to bottom, ${hiColor} 0%, ${base} 45%, ${loColor} 100%)`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
        }}/>
        <ConnectorIcon kind={toKind} side="right" />
      </div>
      {/* Labels: [End A]  [gauge · length]  [End B] */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 2, fontSize: 10 }}>
        <span style={{ color: 'var(--muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.fromEnd.connector ? row.fromEnd.label : ''}
        </span>
        <span style={{ color: 'var(--ink-soft)', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, padding: '0 6px' }}>
          {[gaugeLabel, lengthLabel].filter(Boolean).join(' · ')}
        </span>
        <span style={{ color: 'var(--muted)', flex: 1, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.toEnd.connector ? row.toEnd.label : ''}
        </span>
      </div>
    </div>
  );
}

export function CableSummaryPanel({ summary, cableRows, connectorSummary, onToggleBusLink }: Props) {
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
        <div>
          <CableConnectorDefs />
          <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--line-strong)', paddingBottom: 5, marginBottom: 2 }}>
            <div style={{ width: 36, flexShrink: 0, fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>BOM</div>
            <div style={{ width: 200, flexShrink: 0, fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cable</div>
            <div style={{ flex: 1, fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Physical</div>
          </div>
          {cableRows.map((row) => (
            <Fragment key={row.connectionId}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid var(--line)', padding: '7px 0', opacity: row.busLink ? 0.6 : 1 }}>
                <div style={{ width: 36, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                  <input
                    type="checkbox"
                    checked={!row.busLink}
                    disabled={!onToggleBusLink}
                    title={row.busLink ? 'Bus link (no cable) — check to include a cable in the BOM' : 'Uncheck to mark as a direct bus link (no cable)'}
                    onChange={(e) => onToggleBusLink?.(row.connectionId, !e.target.checked)}
                  />
                </div>
                <div style={{ width: 200, flexShrink: 0, fontSize: 12, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.fromLabel} → {row.toLabel}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {row.busLink ? (
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
                      Bus link — no cable
                    </span>
                  ) : (
                    <CableVisualRow row={row} />
                  )}
                </div>
              </div>
            </Fragment>
          ))}
        </div>
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
