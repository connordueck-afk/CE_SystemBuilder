import { useId } from 'react';
import { IconInfo } from '../icons';
import { CURRENT_APP_VERSION } from '../../utils/storage';

export function InternalReleaseNotice() {
  const headingId = useId();

  return (
    <section className="internal-release-notice" aria-labelledby={headingId}>
      <div className="internal-release-icon" aria-hidden="true">
        <IconInfo size={16} />
      </div>
      <div className="internal-release-content">
        <div className="internal-release-heading-row">
          <h2 id={headingId}>Changelog</h2>
          <span className="internal-release-version">v{CURRENT_APP_VERSION} &middot; Internal preview</span>
        </div>
        <p>
          This is a working first copy for internal evaluation only. Features, product data,
          pricing, and calculations are still being refined. Treat all results as preliminary,
          sanity-check anything important, and please report anything that looks surprising.
        </p>
      </div>
    </section>
  );
}
