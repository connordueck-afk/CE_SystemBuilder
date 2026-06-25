import { useState, useMemo, useRef } from 'react';

interface Props {
  svgList: string[];
  currentUrl: string | undefined;
  onSelect: (path: string) => void;
  onImport: (file: File, subdir: string) => Promise<void>;
  onClose: () => void;
}

export function SVGPickerModal({ svgList, currentUrl, onSelect, onImport, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [subdir, setSubdir] = useState('');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q ? svgList.filter(s => s.toLowerCase().includes(q)) : svgList;
  }, [svgList, query]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.svg')) {
      alert('Please choose an .svg file');
      return;
    }
    setImporting(true);
    try {
      await onImport(file, subdir.trim());
    } catch (err) {
      alert(`Import failed: ${err}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="pb-modal-overlay" onClick={onClose}>
      <div className="pb-modal" onClick={e => e.stopPropagation()}>
        <div className="pb-modal-header">
          <span style={{ fontWeight: 600 }}>Pick SVG</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              className="pb-search"
              style={{ width: 200 }}
              placeholder="Search SVGs…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            <button className="pb-btn pb-btn-ghost pb-btn-sm" onClick={onClose}>Close</button>
          </div>
        </div>
        <div className="pb-modal-toolbar">
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Import:</span>
          <input
            className="pb-search"
            style={{ width: 200 }}
            placeholder="Subfolder (optional, e.g. victron)"
            value={subdir}
            onChange={e => setSubdir(e.target.value)}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
          <button
            className="pb-btn pb-btn-success pb-btn-sm"
            disabled={importing}
            onClick={() => fileInputRef.current?.click()}
          >
            {importing ? 'Importing…' : 'Import SVG…'}
          </button>
        </div>
        <div className="pb-modal-body">
          {filtered.length === 0 && <div className="pb-empty">No SVGs found</div>}
          <div className="pb-svg-grid">
            {filtered.map(p => {
              const url = `/product-images/${p}`;
              const isSelected = currentUrl === url || currentUrl === `/product-images/${p}`;
              const name = p.split('/').pop() ?? p;
              return (
                <div
                  key={p}
                  className={`pb-svg-cell${isSelected ? ' selected' : ''}`}
                  onClick={() => { onSelect(url); onClose(); }}
                  title={p}
                >
                  <img src={url} alt={name} loading="lazy" />
                  <div className="pb-svg-cell-name">{name.replace('.svg', '')}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
