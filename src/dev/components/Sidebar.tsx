import { useState, useMemo } from 'react';

interface ProductListEntry { id: string; subdir: string; }

interface Props {
  products: ProductListEntry[];
  currentId: string | undefined;
  onSelect: (id: string, subdir: string) => void;
  onNew: () => void;
}

export function Sidebar({ products, currentId, onSelect, onNew }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q ? products.filter(p => p.id.includes(q) || p.subdir.includes(q)) : products;
  }, [products, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, ProductListEntry[]>();
    for (const p of filtered) {
      if (!map.has(p.subdir)) map.set(p.subdir, []);
      map.get(p.subdir)!.push(p);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div className="pb-sidebar">
      <div className="pb-sidebar-header">
        <button className="pb-btn pb-btn-success" style={{ width: '100%' }} onClick={onNew}>
          + New Product
        </button>
        <input
          className="pb-search"
          placeholder="Search…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className="pb-product-list">
        {grouped.length === 0 && (
          <div className="pb-empty">No products found</div>
        )}
        {grouped.map(([subdir, items]) => (
          <div key={subdir}>
            <div className="pb-subdir-label">{subdir}</div>
            {items.map(p => (
              <div
                key={p.id}
                className={`pb-product-item${p.id === currentId ? ' active' : ''}`}
                onClick={() => onSelect(p.id, p.subdir)}
                title={p.id}
              >
                {p.id}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
