import { Component, type ErrorInfo, type ReactNode } from 'react';
import { createSystemSaveFile, loadCurrentSystem, systemSaveFilename } from '../../utils/storage';

interface Props {
  children: ReactNode;
}

interface State {
  crashed: boolean;
  downloadError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { crashed: false, downloadError: false };

  static getDerivedStateFromError(): State {
    return { crashed: true, downloadError: false };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('DES System Builder crashed', error, info);
  }

  private downloadAutosave = () => {
    try {
      const system = loadCurrentSystem();
      if (!system) throw new Error('No autosaved design was found.');
      const saveFile = createSystemSaveFile(system);
      const blob = new Blob([`${JSON.stringify(saveFile, null, 2)}\n`], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = systemSaveFilename(system);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      this.setState({ downloadError: false });
    } catch {
      this.setState({ downloadError: true });
    }
  };

  render() {
    if (!this.state.crashed) return this.props.children;

    return (
      <main className="app-crash-screen">
        <section className="app-crash-card" role="alert" aria-labelledby="app-crash-title">
          <img src={`${import.meta.env.BASE_URL}brand/des-mark.png`} className="app-crash-logo" alt="" />
          <div className="app-crash-eyebrow">Recovery mode</div>
          <h1 id="app-crash-title">System Builder hit an unexpected error</h1>
          <p>Your latest successful autosave should still be available. Download a backup before reloading if the drawing contains work you need to preserve.</p>
          {this.state.downloadError && <div className="app-crash-error">No readable autosave could be downloaded.</div>}
          <div className="app-crash-actions">
            <button className="btn-secondary" onClick={this.downloadAutosave}>Download autosave</button>
            <button className="btn-primary" onClick={() => window.location.reload()}>Reload application</button>
          </div>
          <div className="app-crash-disclaimer">Preliminary design aid &mdash; not certified engineering</div>
        </section>
      </main>
    );
  }
}
