import { useState, useEffect, useCallback } from 'react';
import type {
  TerminalDefinition, ConnectionPointKind,
  TerminalSide, ConnectorKind,
  ProductCommunicationPort, CommunicationProtocol, CommunicationConnectorType,
  ProductPort, TerminalGroupDefinition,
} from '../../types/system';
import { CollapsibleSection } from './CollapsibleSection';

interface Props {
  terminal: TerminalDefinition;
  /** Kind resolved port-first (port-owned model), shown read-only on the terminal. */
  resolvedKind: ConnectionPointKind;
  onChange: (changes: Partial<TerminalDefinition>) => void;
  onDelete: () => void;
  onClose: () => void;
  /** Communication port (matched to this terminal by shared id), if one exists. */
  port?: ProductCommunicationPort;
  /** Upsert (changes) or remove (null) the matching communication port. */
  onPortChange?: (changes: Partial<ProductCommunicationPort> | null) => void;
  /** Internal circuit ports used to resolve the terminal group's port. */
  availablePorts?: ProductPort[];
  /** Terminal groups the terminal can be assigned to via `terminalGroupId`. */
  availableGroups?: TerminalGroupDefinition[];
}

const SIDES: TerminalSide[] = ['top', 'bottom', 'left', 'right'];
const CONNECTOR_KINDS: ConnectorKind[] = ['stud', 'screw_terminal', 'mc4', 'lug', 'helios_orng', 'helios_blk', 'ferrule'];
const GENDERED_CONNECTOR_KINDS: ConnectorKind[] = ['mc4'];
const GENDERED_COMM_CONNECTORS: CommunicationConnectorType[] = ['RJ45', 'M12', 'Deutsch', 'JST'];
const PROTOCOLS: CommunicationProtocol[] = ['CANopen', 'J1939', 'VE.Bus', 'VE.Direct', 'VE.Can', 'BMS-Can', 'AEbus', 'RS485', 'Ethernet', 'Pylon LV', 'Other'];
const COMM_CONNECTORS: CommunicationConnectorType[] = ['RJ45', 'M12', 'Deutsch', 'TerminalBlock', 'JST', 'VE.Direct', 'Other'];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pb-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function directionFromRole(role: ProductPort['role'] | undefined): ProductPort['direction'] {
  if (role === 'source') return 'output';
  if (role === 'sink' || role === 'sense') return 'input';
  if (role === 'bidirectional' || role === 'bus' || role === 'control') return 'bidirectional';
  return undefined;
}

export function TerminalEditorPanel({ terminal: t, resolvedKind, onChange, onDelete, onClose, port, onPortChange, availablePorts = [], availableGroups = [] }: Props) {
  // Kind is owned by the terminal's port; polarity by its group — both shown read-only here.
  const assignedGroup = availableGroups.find((g) => g.id === t.terminalGroupId);
  const resolvedPortId = assignedGroup?.portId;
  const assignedPort = availablePorts.find((p) => p.id === resolvedPortId);
  const groupPolarity = assignedGroup?.polarity;
  const resolvedRole = assignedPort?.role;
  const resolvedDirection = assignedPort?.direction ?? directionFromRole(assignedPort?.role);
  const isCommNode = assignedPort?.kind === 'comm';
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

  function s<K extends keyof TerminalDefinition>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const el = e.target as HTMLInputElement;
      const val = el.type === 'number' ? Number(el.value) : el.value || undefined;
      onChange({ [key]: val });
    };
  }

  function num<K extends keyof TerminalDefinition>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ [key]: e.target.value === '' ? undefined : Number(e.target.value) } as Partial<TerminalDefinition>);
  }

  function opt(key: keyof TerminalDefinition) {
    return (e: React.ChangeEvent<HTMLSelectElement>) =>
      onChange({ [key]: e.target.value || undefined } as Partial<TerminalDefinition>);
  }

  return (
    <CollapsibleSection
      title={`Terminal: ${t.id || '(new)'}`}
      actions={
        <div className="pb-row" style={{ gap: 6 }}>
          <button className="pb-btn pb-btn-danger pb-btn-sm" onClick={onDelete}>Delete</button>
          <button className="pb-btn pb-btn-ghost pb-btn-sm" onClick={onClose}>Close</button>
        </div>
      }
    >

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
          <Field label="Kind (from group port)">
            <input
              type="text"
              value={resolvedKind}
              readOnly
              title="Electrical kind is owned by the terminal group's port — set it on the group, not the terminal."
              style={{ opacity: 0.75, cursor: 'not-allowed' }}
            />
          </Field>
          <Field label="Role (from port)">
            <input
              type="text"
              value={resolvedRole ?? '-'}
              readOnly
              title="Role is owned by the terminal group's port."
              style={{ opacity: 0.75, cursor: 'not-allowed' }}
            />
          </Field>
          <Field label="Direction (from port)">
            <input
              type="text"
              value={resolvedDirection ?? 'auto'}
              readOnly
              title="Direction is owned by the terminal group's port. When unset, it is inferred from the port role."
              style={{ opacity: 0.75, cursor: 'not-allowed' }}
            />
          </Field>
        </div>
        {!t.terminalGroupId && (
          <div className="pb-empty" style={{ marginTop: -2 }}>
            Not assigned to a terminal group yet — kind falls back to <code>generic</code>. Assign a Group below to give it an electrical kind.
          </div>
        )}

        <div className="pb-field-row">
          <Field label="Side *">
            <select value={t.side ?? ''} onChange={e => onChange({ side: e.target.value as TerminalSide })}>
              <option value="">-</option>
              {SIDES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Polarity (from group)">
            <input
              type="text"
              value={groupPolarity ?? '—'}
              readOnly
              title="Polarity is owned by the terminal's group — set it on the group."
              style={{ opacity: 0.75, cursor: 'not-allowed' }}
            />
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

        {/* Per-jack connector ratings (the conductor/service specs live on the port & group). */}
        <div className="pb-field-row">
          <Field label="Max Current (A) — per jack">
            <input type="number" value={t.maxCurrentA ?? ''} onChange={num('maxCurrentA')} min={0} />
          </Field>
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
                    <option value="">-</option>
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
                  <option value="">-</option>
                  {CONNECTOR_KINDS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </Field>
              {t.connector?.kind && GENDERED_CONNECTOR_KINDS.includes(t.connector.kind) && (
                <Field label="Gender">
                  <select
                    value={t.connector?.gender ?? ''}
                    onChange={e => onChange({ connector: { ...t.connector!, gender: (e.target.value || undefined) as 'male' | 'female' | undefined } })}
                  >
                    <option value="">-</option>
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
          <Field label="Terminal Group">
            <select value={t.terminalGroupId ?? ''} onChange={opt('terminalGroupId')}>
              <option value="">-</option>
              {availableGroups.map(g => (
                <option key={g.id} value={g.id}>{g.label ? `${g.id} (${g.label})` : g.id}</option>
              ))}
              {t.terminalGroupId && !availableGroups.some(g => g.id === t.terminalGroupId) && (
                <option value={t.terminalGroupId}>{t.terminalGroupId} (missing)</option>
              )}
            </select>
          </Field>
          <Field label="Port (from group)">
            <input
              type="text"
              value={assignedPort
                ? `${assignedPort.id}${assignedPort.label ? ` (${assignedPort.label})` : ''}`
                : resolvedPortId
                ? `${resolvedPortId} (missing)`
                : '—'}
              readOnly
              title="Ports are inherited from the assigned terminal group."
              style={{ opacity: 0.75, cursor: 'not-allowed' }}
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
                      <option value="">-</option>
                      {supported.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Field>
                </div>
              </>
            )}
          </>
        )}

    </CollapsibleSection>
  );
}
