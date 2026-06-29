import { useState, type CSSProperties, type ReactNode } from 'react';

interface Props {
  title: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  bodyStyle?: CSSProperties;
  defaultCollapsed?: boolean;
}

export function CollapsibleSection({
  title,
  actions,
  children,
  className,
  bodyClassName,
  bodyStyle,
  defaultCollapsed = false,
}: Props) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className={`pb-section${className ? ` ${className}` : ''}${collapsed ? ' collapsed' : ''}`}>
      <div className="pb-section-header">
        <button
          type="button"
          className="pb-collapse-toggle"
          aria-expanded={!collapsed}
          title={collapsed ? 'Expand panel' : 'Collapse panel'}
          onClick={() => setCollapsed(value => !value)}
        >
          <span className="pb-collapse-arrow">{collapsed ? '>' : 'v'}</span>
        </button>
        <div className="pb-section-title">{title}</div>
        {actions && <div className="pb-section-actions">{actions}</div>}
      </div>
      {!collapsed && (
        <div className={`pb-section-body${bodyClassName ? ` ${bodyClassName}` : ''}`} style={bodyStyle}>
          {children}
        </div>
      )}
    </div>
  );
}
