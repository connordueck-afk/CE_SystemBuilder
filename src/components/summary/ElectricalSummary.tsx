import type { ElectricalSummary } from '../../utils/systemSummary';

interface Props {
  summary: ElectricalSummary;
}

function fmtNumber(value: number | undefined, digits = 0): string {
  if (value == null || !Number.isFinite(value)) return '-';
  return value.toFixed(digits);
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="spec-row">
      <span className="spec-row-label">{label}</span>
      <span className="spec-row-value">{value}</span>
    </div>
  );
}

function busLabel(value: string): string {
  return value.replace('_', ' ').toUpperCase();
}

export function ElectricalSummaryPanel({ summary }: Props) {
  const battery = summary.battery;

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: 10 }}>
      <div className="inspector-section">
        <div className="inspector-label">Battery</div>
        <Row label="Batteries" value={`${battery.batteryCount}`} />
        <Row label="Strings" value={`${battery.stringCount}`} />
        <Row label="Packs" value={`${battery.packCount}`} />
        {battery.primaryPackLabel && <Row label="Primary Pack" value={battery.primaryPackLabel} />}
        {battery.packVoltageV != null && <Row label="Pack Voltage" value={`${fmtNumber(battery.packVoltageV, 1)} V`} />}
        <Row label="Pack Capacity" value={`${(battery.capacityWh / 1000).toFixed(2)} kWh`} />
        {battery.capacityAh != null && <Row label="Capacity" value={`${fmtNumber(battery.capacityAh)} Ah`} />}
        {battery.maxChargeCurrentA != null && <Row label="Max Charge" value={`${fmtNumber(battery.maxChargeCurrentA)} A`} />}
        {battery.maxDischargeCurrentA != null && <Row label="Max Discharge" value={`${fmtNumber(battery.maxDischargeCurrentA)} A`} />}
      </div>

      <div className="inspector-section">
        <div className="inspector-label">Solar</div>
        {summary.solar.length === 0 ? (
          <div className="empty-state">No connected solar arrays.</div>
        ) : (
          summary.solar.map((array) => (
            <div key={array.mpptComponentId} style={{ marginBottom: 10 }}>
              <div style={{ color: 'var(--ink)', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                {array.mpptLabel}
              </div>
              <Row label="Array Size" value={`${fmtNumber(array.powerW)} W`} />
              <Row label="Strings" value={`${array.stringCount}`} />
              <Row label="Panels" value={`${array.panelCount}`} />
              <Row label="Array Voc" value={`${fmtNumber(array.vocV, 1)} V`} />
              {array.vmpV != null && <Row label="Array Vmp" value={`${fmtNumber(array.vmpV, 1)} V`} />}
              {array.iscA != null && <Row label="Array Isc" value={`${fmtNumber(array.iscA, 1)} A`} />}
              {array.impA != null && <Row label="Array Imp" value={`${fmtNumber(array.impA, 1)} A`} />}
            </div>
          ))
        )}
      </div>

      <div className="inspector-section">
        <div className="inspector-label">Power Nodes</div>
        {summary.powerNodes.length === 0 ? (
          <div className="empty-state">No resolved power busses.</div>
        ) : (
          summary.powerNodes.map((node) => (
            <div key={node.componentId} style={{ marginBottom: 10 }}>
              <div style={{ color: 'var(--ink)', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                {node.label}
              </div>
              <Row label="Net" value={node.netId} />
              <Row label="Bus" value={busLabel(node.busType)} />
              <Row label="Terminals" value={`${node.terminalCount}`} />
              <Row label="Current" value={`${fmtNumber(node.operatingCurrentA)} A`} />
              {node.availableCurrentA != null && <Row label="Available" value={`${fmtNumber(node.availableCurrentA)} A`} />}
              {node.protectedBy && <Row label="Protected By" value={node.protectedBy} />}
              <Row label="Power" value={`${fmtNumber(node.totalPowerW)} W`} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

