import { useState, useMemo } from 'react';

interface Props {
  svgList: string[];
  currentUrl: string | undefined;
  onSelect: (path: string) => void;
  onClose: () => void;
}

export function SVGPickerModal({ svgList, currentUrl, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q ? svgList.filter(s => s.toLowerCase().includes(q)) : svgList;
  }, [svgList, query]);

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
