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
  // Categories collapsed by default; this Set holds the ones the user expanded.
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

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

  const toggle = (subdir: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(subdir)) next.delete(subdir);
      else next.add(subdir);
      return next;
    });
  };

  const searching = query.trim().length > 0;

  // A category is open when searching, when manually expanded, or when it
  // contains the currently-loaded product.
  const isOpen = (subdir: string, items: ProductListEntry[]) =>
    searching || expanded.has(subdir) || items.some(p => p.id === currentId);

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
        {grouped.map(([subdir, items]) => {
          const open = isOpen(subdir, items);
          return (
            <div key={subdir}>
              <div
                className="pb-subdir-header"
                onClick={() => toggle(subdir)}
                title={open ? 'Collapse' : 'Expand'}
              >
                <span className="pb-subdir-caret">{open ? '▾' : '▸'}</span>
                <span className="pb-subdir-name">{subdir}</span>
                <span className="pb-subdir-count">{items.length}</span>
              </div>
              {open && items.map(p => (
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
          );
        })}
      </div>
    </div>
  );
}
