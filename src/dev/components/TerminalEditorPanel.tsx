import type {
  TerminalDefinition, ConnectionPointKind, ConnectionPolarity,
  ConnectionRole, TerminalSide, ElectricalDomain, ElectricalType,
  VoltageClass, ConnectorKind,
} from '../../types/system';

interface Props {
  terminal: TerminalDefinition;
  onChange: (changes: Partial<TerminalDefinition>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const KINDS: ConnectionPointKind[] = ['dc_power', 'pv_power', 'ac_power', 'signal', 'network', 'chassis_ground', 'generic'];
const POLARITIES: ConnectionPolarity[] = ['positive', 'negative', 'line', 'line2', 'neutral', 'ground'];
const ROLES: ConnectionRole[] = ['source', 'sink', 'bidirectional', 'pass_through', 'bus', 'sense', 'control'];
const SIDES: TerminalSide[] = ['top', 'bottom', 'left', 'right'];
const DOMAINS: ElectricalDomain[] = ['dc', 'ac', 'pv', 'chassisGround', 'earthGround', 'communication', 'signal'];
const ETYPES: ElectricalType[] = ['dc_pos', 'dc_neg', 'pv_pos', 'pv_neg', 'ac', 'signal', 'generic'];
const VCLASSES: VoltageClass[] = ['dc_low_voltage', 'pv_high_voltage', 'ac_120v', 'ac_240v', 'signal_low_voltage'];
const CONNECTOR_KINDS: ConnectorKind[] = ['lug', 'screw_terminal', 'mc4_male', 'mc4_female'];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pb-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

export function TerminalEditorPanel({ terminal: t, onChange, onDelete, onClose }: Props) {
  const s = <K extends keyof TerminalDefinition>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const el = e.target as HTMLInputElement;
      const val = el.type === 'number' ? Number(el.value) : el.value || undefined;
      onChange({ [key]: val });
    };

  const num = <K extends keyof TerminalDefinition>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ [key]: e.target.value === '' ? undefined : Number(e.target.value) } as Partial<TerminalDefinition>);

  const bool = <K extends keyof TerminalDefinition>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ [key]: e.target.checked } as Partial<TerminalDefinition>);

  const opt = (key: keyof TerminalDefinition) =>
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      onChange({ [key]: e.target.value || undefined } as Partial<TerminalDefinition>);

  return (
    <div className="pb-section">
      <div className="pb-section-header">
        <span>Terminal: {t.id || '(new)'}</span>
        <div className="pb-row" style={{ gap: 6 }}>
          <button className="pb-btn pb-btn-danger pb-btn-sm" onClick={onDelete}>Delete</button>
          <button className="pb-btn pb-btn-ghost pb-btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
      <div className="pb-section-body">

        <div className="pb-field-row">
          <Field label="ID *">
            <input type="text" value={t.id ?? ''} onChange={e => onChange({ id: e.target.value })} placeholder="dc_pos" />
          </Field>
          <Field label="Label *">
            <input type="text" value={t.label ?? ''} onChange={e => onChange({ label: e.target.value })} placeholder="+" />
          </Field>
        </div>

        <div className="pb-field-row">
          <Field label="Kind *">
            <select value={t.kind ?? ''} onChange={e => onChange({ kind: e.target.value as ConnectionPointKind })}>
              <option value="">—</option>
              {KINDS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </Field>
          <Field label="Role *">
            <select value={t.role ?? ''} onChange={e => onChange({ role: e.target.value as ConnectionRole })}>
              <option value="">—</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
        </div>

        <div className="pb-field-row">
          <Field label="Side *">
            <select value={t.side ?? ''} onChange={e => onChange({ side: e.target.value as TerminalSide })}>
              <option value="">—</option>
              {SIDES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Polarity">
            <select value={t.polarity ?? ''} onChange={opt('polarity')}>
              <option value="">—</option>
              {POLARITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
        </div>

        <div className="pb-field-row">
          <Field label="Offset X (px)">
            <input type="number" value={t.offsetX ?? 0} onChange={e => onChange({ offsetX: Number(e.target.value) })} />
          </Field>
          <Field label="Offset Y (px)">
            <input type="number" value={t.offsetY ?? 0} onChange={e => onChange({ offsetY: Number(e.target.value) })} />
          </Field>
        </div>

        <hr />

        <div className="pb-field-row">
          <Field label="Electrical Type">
            <select value={t.electricalType ?? ''} onChange={opt('electricalType')}>
              <option value="">—</option>
              {ETYPES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Domain">
            <select value={t.domain ?? ''} onChange={opt('domain')}>
              <option value="">—</option>
              {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
        </div>

        <div className="pb-field-row">
          <Field label="Voltage Class">
            <select value={t.voltageClass ?? ''} onChange={opt('voltageClass')}>
              <option value="">—</option>
              {VCLASSES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Max Current (A)">
            <input type="number" value={t.maxCurrentA ?? ''} onChange={num('maxCurrentA')} min={0} />
          </Field>
        </div>

        <div className="pb-field-row">
          <div className="pb-checkbox-row">
            <input
              id="t_requiresOcp"
              type="checkbox"
              checked={t.requiresOvercurrentProtection ?? false}
              onChange={bool('requiresOvercurrentProtection')}
            />
            <label htmlFor="t_requiresOcp">Requires OCP</label>
          </div>
          <div className="pb-checkbox-row">
            <input
              id="t_requiresDisc"
              type="checkbox"
              checked={t.requiresDisconnect ?? false}
              onChange={bool('requiresDisconnect')}
            />
            <label htmlFor="t_requiresDisc">Requires Disconnect</label>
          </div>
        </div>

        <div className="pb-field-row">
          <Field label="Recommended Fuse (A)">
            <input type="number" value={t.recommendedFuseA ?? ''} onChange={num('recommendedFuseA')} min={0} />
          </Field>
          <Field label="Max Fuse (A)">
            <input type="number" value={t.maxFuseA ?? ''} onChange={num('maxFuseA')} min={0} />
          </Field>
        </div>

        <div className="pb-field-row">
          <Field label="Connector Kind">
            <select
              value={t.connector?.kind ?? ''}
              onChange={e => onChange({ connector: e.target.value ? { kind: e.target.value as ConnectorKind } : undefined })}
            >
              <option value="">—</option>
              {CONNECTOR_KINDS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </Field>
          {t.connector?.kind === 'lug' && (
            <Field label="Lug Hole Size">
              <input
                type="text"
                value={t.connector?.holeSize ?? ''}
                onChange={e => onChange({ connector: { kind: 'lug', holeSize: e.target.value || undefined } })}
                placeholder="5/16, M8…"
              />
            </Field>
          )}
        </div>

        <Field label="Notes">
          <input
            type="text"
            value={t.notes ?? ''}
            onChange={e => onChange({ notes: e.target.value || undefined })}
            placeholder="Optional notes about this terminal"
          />
        </Field>

      </div>
    </div>
  );
}
