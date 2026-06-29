import type { BuilderIssue } from '../../types/system';

interface Props {
  issues: BuilderIssue[];
  onSelectComponent?: (id: string) => void;
  onSelectConnection?: (id: string) => void;
}

const SEVERITY_STYLES: Record<string, { className: string; icon: string }> = {
  error: { className: 'issue-card-error', icon: '!' },
  warning: { className: 'issue-card-warning', icon: '!' },
  info: { className: 'issue-card-info', icon: 'i' },
};

export function WarningList({ issues, onSelectComponent, onSelectConnection }: Props) {
  if (issues.length === 0) {
    return <div className="ok-message">No issues detected</div>;
  }

  return (
    <div className="warning-list">
      {issues.map((issue) => {
        const s = SEVERITY_STYLES[issue.severity];
        return (
          <div
            key={issue.id}
            className={`issue-card ${s.className}`}
            style={{ cursor: issue.componentId || issue.connectionId ? 'pointer' : 'default' }}
            onClick={() => {
              if (issue.componentId && onSelectComponent) onSelectComponent(issue.componentId);
              if (issue.connectionId && onSelectConnection) onSelectConnection(issue.connectionId);
            }}
          >
            <span className="issue-icon">{s.icon}</span>
            <span className="issue-message">{issue.message}</span>
          </div>
        );
      })}
    </div>
  );
}
