import type { BuilderIssue } from '../../types/system';
import { isUserFacingIssue } from '../../utils/builderIssues';
import { IconAlertCircle, IconAlertTriangle, IconInfo } from '../icons';

interface Props {
  issues: BuilderIssue[];
  onSelectComponent?: (id: string) => void;
  onSelectConnection?: (id: string) => void;
  debugMode?: boolean;
}

const SEVERITY_STYLES: Record<string, { className: string; Icon: typeof IconAlertCircle }> = {
  error: { className: 'issue-card-error', Icon: IconAlertCircle },
  warning: { className: 'issue-card-warning', Icon: IconAlertTriangle },
  info: { className: 'issue-card-info', Icon: IconInfo },
};

export function WarningList({ issues, onSelectComponent, onSelectConnection, debugMode = false }: Props) {
  const visibleIssues = issues.filter((issue) => isUserFacingIssue(issue, debugMode));

  if (visibleIssues.length === 0) {
    return <div className="ok-message">No issues detected</div>;
  }

  return (
    <div className="warning-list">
      {visibleIssues.map((issue) => {
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
            <span className="issue-icon"><s.Icon size={14} /></span>
            <span className="issue-message">{issue.message}</span>
          </div>
        );
      })}
    </div>
  );
}
