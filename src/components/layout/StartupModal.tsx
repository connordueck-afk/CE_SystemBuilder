interface Props {
  hasCachedSystem: boolean;
  onResume: () => void;
  onNewSystem: () => void;
  onLoadFromFile: () => void;
  onLoadPreset: () => void;
}

function ResumeIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="new-system-card-icon" aria-hidden="true">
      <rect x="8" y="6" width="28" height="36" rx="3" stroke="currentColor" strokeWidth="2.5" />
      <path d="M14 16h16M14 22h12M14 28h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="36" cy="36" r="8" fill="currentColor" opacity="0.12" />
      <path d="M33.5 33l7 3.5-7 3.5V33z" fill="currentColor" />
    </svg>
  );
}

function NewSystemIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="new-system-card-icon" aria-hidden="true">
      <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5 3" />
      <path d="M24 17v14M17 24h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function LoadFileIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="new-system-card-icon" aria-hidden="true">
      <path d="M10 40V12l8-6h20v34H10z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M18 6v8H10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M24 20v12M20 28l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PresetsIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="new-system-card-icon" aria-hidden="true">
      <rect x="6" y="6" width="16" height="16" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <rect x="26" y="6" width="16" height="16" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <rect x="6" y="26" width="16" height="16" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <rect x="26" y="26" width="16" height="16" rx="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function StartupModal({ hasCachedSystem, onResume, onNewSystem, onLoadFromFile, onLoadPreset }: Props) {
  return (
    <div className="modal-overlay">
      <div className="new-system-modal" onClick={(e) => e.stopPropagation()}>
        <div className="new-system-modal-header">
          <div>
            <div className="modal-title">Welcome to System Builder</div>
            <div className="new-system-modal-subtitle">How would you like to get started?</div>
          </div>
        </div>

        <div className="new-system-grid">
          <button
            type="button"
            className={`new-system-card${hasCachedSystem ? '' : ' new-system-card-unavailable'}`}
            onClick={hasCachedSystem ? onResume : undefined}
            disabled={!hasCachedSystem}
            title={hasCachedSystem ? 'Continue your last session' : 'No saved drawing found'}
          >
            <ResumeIcon />
            <div className="new-system-card-name">Resume Drawing</div>
            <div className="new-system-card-desc">
              {hasCachedSystem ? 'Continue where you left off.' : 'No previous session found.'}
            </div>
            <div className="new-system-card-tags">
              <span className="new-system-tag">{hasCachedSystem ? 'Auto-saved' : 'Unavailable'}</span>
            </div>
          </button>

          <button type="button" className="new-system-card new-system-card-empty" onClick={onNewSystem}>
            <NewSystemIcon />
            <div className="new-system-card-name">New System</div>
            <div className="new-system-card-desc">Start with a blank canvas.</div>
            <div className="new-system-card-tags">
              <span className="new-system-tag">Blank</span>
            </div>
          </button>

          <button type="button" className="new-system-card" onClick={onLoadFromFile}>
            <LoadFileIcon />
            <div className="new-system-card-name">Load from File</div>
            <div className="new-system-card-desc">Open a saved .json export.</div>
            <div className="new-system-card-tags">
              <span className="new-system-tag">.json</span>
            </div>
          </button>

          <button type="button" className="new-system-card" onClick={onLoadPreset}>
            <PresetsIcon />
            <div className="new-system-card-name">Load Default System</div>
            <div className="new-system-card-desc">Choose from starter templates.</div>
            <div className="new-system-card-tags">
              <span className="new-system-tag">Templates</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
