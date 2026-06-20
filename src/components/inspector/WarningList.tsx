import type { SystemWarning } from '../../types/system';

interface Props {
  warnings: SystemWarning[];
  onSelectComponent?: (id: string) => void;
  onSelectConnection?: (id: string) => void;
}

const SEVERITY_STYLES: Record<string, { className: string; icon: string }> = {
  error: { className: 'issue-card-error', icon: '!' },
  warning: { className: 'issue-card-warning', icon: '!' },
  info: { className: 'issue-card-info', icon: 'i' },
};

export function WarningList({ warnings, onSelectComponent, onSelectConnection }: Props) {
  if (warnings.length === 0) {
    return <div className="ok-message">No issues detected</div>;
  }

  return (
    <div className="warning-list">
      {warnings.map((w) => {
        const s = SEVERITY_STYLES[w.severity];
        return (
          <div
            key={w.id}
            className={`issue-card ${s.className}`}
            style={{ cursor: w.componentId || w.connectionId ? 'pointer' : 'default' }}
            onClick={() => {
              if (w.componentId && onSelectComponent) onSelectComponent(w.componentId);
              if (w.connectionId && onSelectConnection) onSelectConnection(w.connectionId);
            }}
          >
            <span className="issue-icon">{s.icon}</span>
            <span className="issue-message">{w.message}</span>
          </div>
        );
      })}
    </div>
  );
}
