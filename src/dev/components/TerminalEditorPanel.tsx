import { useState, useEffect, useCallback } from 'react';
import type {
  TerminalDefinition, ConnectionPointKind, ConnectionPolarity,
  ConnectionRole, TerminalSide, VoltageClass, ConnectorKind,
  ProductCommunicationPort, CommunicationProtocol, CommunicationConnectorType,
} from '../../types/system';

interface Props {
  terminal: TerminalDefinition;
  onChange: (changes: Partial<TerminalDefinition>) => void;
  onDelete: () => void;
  onClose: () => void;
  /** Communication port (matched to this terminal by shared id), if one exists. */
  port?: ProductCommunicationPort;
  /** Upsert (changes) or remove (null) the matching communication port. */
  onPortChange?: (changes: Partial<ProductCommunicationPort> | null) => void;
}

const KINDS: ConnectionPointKind[] = ['dc_power', 'pv_power', 'ac_power', 'signal', 'network', 'chassis_ground', 'generic'];
const POLARITIES: ConnectionPolarity[] = ['positive', 'negative', 'line', 'line2', 'neutral', 'ground'];
const ROLES: ConnectionRole[] = ['source', 'sink', 'bidirectional', 'pass_through', 'bus', 'sense', 'control'];
const SIDES: TerminalSide[] = ['top', 'bottom', 'left', 'right'];
const VCLASSES: VoltageClass[] = ['dc_low_voltage', 'pv_high_voltage', 'ac_120v', 'ac_240v', 'signal_low_voltage'];
const CONNECTOR_KINDS: ConnectorKind[] = ['stud', 'screw_terminal', 'mc4', 'lug', 'ferrule'];
const GENDERED_CONNECTOR_KINDS: ConnectorKind[] = ['mc4'];
const GENDERED_COMM_CONNECTORS: CommunicationConnectorType[] = ['RJ45', 'M12', 'Deutsch', 'JST'];
const PROTOCOLS: CommunicationProtocol[] = ['CANopen', 'J1939', 'VE.Bus', 'VE.Direct', 'VE.Can', 'BMS-Can', 'AEbus', 'RS485', 'Ethernet', 'Other'];
const COMM_CONNECTORS: CommunicationConnectorType[] = ['RJ45', 'M12', 'Deutsch', 'TerminalBlock', 'JST', 'VE.Direct', 'Other'];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pb-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

export function TerminalEditorPanel({ terminal: t, onChange, onDelete, onClose, port, onPortChange }: Props) {
  const isCommNode = t.kind === 'network';
  const supported = port?.supportedProtocols ?? [];

  // Buffer the ID locally so intermediate keystrokes don't get committed to state.
  // Committing on every keystroke lets an in-progress rename temporarily collide
  // with an existing terminal ID, tying them together.
  const [draftId, setDraftId] = useState(t.id ?? '');
  useEffect(() => { setDraftId(t.id ?? ''); }, [t.id]);

  const commitId = useCallback(() => {
    const trimmed = draftId.trim();
    if (!trimmed) {
      setDraftId(t.id ?? '');         // revert empty back to current id
    } else if (trimmed !== t.id) {
      onChange({ id: trimmed });
    }
  }, [draftId, t.id, onChange]);

  const toggleProtocol = (proto: CommunicationProtocol) => {
    if (!onPortChange) return;
    const nextList = supported.includes(proto)
      ? supported.filter(p => p !== proto)
      : [...supported, proto];
    if (nextList.length === 0) {
      // No protocols left → drop the port entirely.
      onPortChange(null);
      return;
    }
    const changes: Partial<ProductCommunicationPort> = { supportedProtocols: nextList };
    // Keep the default protocol valid against the new list.
    if (port?.configuredProtocol && !nextList.includes(port.configuredProtocol)) {
      changes.configuredProtocol = nextList[0];
    }
    onPortChange(changes);
  };

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
            <input
              type="text"
              value={draftId}
              onChange={e => setDraftId(e.target.value)}
              onBlur={commitId}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitId(); } }}
              placeholder="dc_pos"
            />
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
          {isCommNode ? (
            <>
              <Field label="Connector">
                <select
                  value={port?.connectorType ?? 'RJ45'}
                  onChange={e => onPortChange?.({ connectorType: e.target.value as CommunicationConnectorType })}
                >
                  {COMM_CONNECTORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              {GENDERED_COMM_CONNECTORS.includes(port?.connectorType ?? 'RJ45' as CommunicationConnectorType) && (
                <Field label="Gender">
                  <select
                    value={port?.gender ?? ''}
                    onChange={e => onPortChange?.({ gender: (e.target.value || undefined) as 'male' | 'female' | undefined })}
                  >
                    <option value="">—</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </Field>
              )}
            </>
          ) : (
            <>
              <Field label="Connector">
                <select
                  value={t.connector?.kind ?? ''}
                  onChange={e => onChange({ connector: e.target.value ? { kind: e.target.value as ConnectorKind } : undefined })}
                >
                  <option value="">—</option>
                  {CONNECTOR_KINDS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </Field>
              {t.connector?.kind && GENDERED_CONNECTOR_KINDS.includes(t.connector.kind) && (
                <Field label="Gender">
                  <select
                    value={t.connector?.gender ?? ''}
                    onChange={e => onChange({ connector: { ...t.connector!, gender: (e.target.value || undefined) as 'male' | 'female' | undefined } })}
                  >
                    <option value="">—</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </Field>
              )}
              {(t.connector?.kind === 'stud' || t.connector?.kind === 'lug') && (
                <Field label={t.connector.kind === 'stud' ? 'Stud Diameter' : 'Lug Hole Size'}>
                  <input
                    type="text"
                    value={t.connector?.holeSize ?? ''}
                    onChange={e => onChange({ connector: { kind: t.connector!.kind, holeSize: e.target.value || undefined } })}
                    placeholder="M6, M8, 5/16, 3/8…"
                  />
                </Field>
              )}
            </>
          )}
        </div>

        <div className="pb-field-row">
          <Field label="Max Connections">
            <input
              type="number"
              value={t.maxConnections ?? ''}
              onChange={e => onChange({ maxConnections: e.target.value ? Number(e.target.value) : undefined })}
              min={1}
              placeholder="auto"
            />
          </Field>
        </div>

        <Field label="Notes">
          <input
            type="text"
            value={t.notes ?? ''}
            onChange={e => onChange({ notes: e.target.value || undefined })}
            placeholder="Optional notes about this terminal"
          />
        </Field>

        {isCommNode && onPortChange && (
          <>
            <hr />
            <div className="pb-field">
              <label>Supported Protocols</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px' }}>
                {PROTOCOLS.map(proto => (
                  <div key={proto} className="pb-checkbox-row">
                    <input
                      id={`proto_${proto}`}
                      type="checkbox"
                      checked={supported.includes(proto)}
                      onChange={() => toggleProtocol(proto)}
                    />
                    <label htmlFor={`proto_${proto}`}>{proto}</label>
                  </div>
                ))}
              </div>
            </div>

            {supported.length > 0 && (
              <>
                <div className="pb-field-row">
                  <Field label="Port Name">
                    <input
                      type="text"
                      value={port?.name ?? ''}
                      onChange={e => onPortChange({ name: e.target.value || undefined })}
                      placeholder={t.label || t.id}
                    />
                  </Field>
                </div>

                <div className="pb-field-row">
                  <div className="pb-checkbox-row">
                    <input
                      id="port_configurable"
                      type="checkbox"
                      checked={port?.isConfigurable ?? false}
                      onChange={e => onPortChange({ isConfigurable: e.target.checked || undefined })}
                    />
                    <label htmlFor="port_configurable">User-configurable</label>
                  </div>
                  <Field label="Default Protocol">
                    <select
                      value={port?.configuredProtocol ?? ''}
                      onChange={e => onPortChange({ configuredProtocol: (e.target.value || undefined) as CommunicationProtocol | undefined })}
                    >
                      <option value="">—</option>
                      {supported.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Field>
                </div>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}
