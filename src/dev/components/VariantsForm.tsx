import type { Product, ProductVariant, NominalVoltage } from '../../types/system';
import { CollapsibleSection } from './CollapsibleSection';

interface Props {
  product: Partial<Product>;
  onChange: (variants: ProductVariant[] | undefined) => void;
}

const MPPT_TYPES = new Set<string>(['mppt']);
const PROTECTION_TYPES = new Set<string>(['fuse', 'breaker']);

function isVariantProduct(product: Partial<Product>): boolean {
  const type = product.productType;
  if (!type) return (product.variants?.length ?? 0) > 0;
  return MPPT_TYPES.has(type) || PROTECTION_TYPES.has(type);
}

function nextRating(variants: ProductVariant[]): number {
  if (variants.length === 0) return 100;
  return Math.max(...variants.map(v => v.currentRatingA)) + 25;
}

function parseVoltages(raw: string): NominalVoltage[] | undefined {
  const nums = raw.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n > 0);
  return nums.length > 0 ? (nums as NominalVoltage[]) : undefined;
}

function voltageDisplay(v: NominalVoltage | NominalVoltage[] | undefined): string {
  if (v == null) return '';
  return Array.isArray(v) ? v.join(',') : String(v);
}

// ---- Simple table for fuses / breakers ----

function ProtectionVariantsTable({ variants, baseId, onChange }: {
  variants: ProductVariant[];
  baseId: string;
  onChange: (v: ProductVariant[]) => void;
}) {
  function update(index: number, changes: Partial<ProductVariant>) {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...changes } : v)));
  }
  function remove(index: number) {
    onChange(variants.filter((_, i) => i !== index));
  }
  function add() {
    const ratingA = nextRating(variants);
    onChange([...variants, { id: `${baseId}-${ratingA}a`, currentRatingA: ratingA }]);
  }

  return (
    <CollapsibleSection
      title={`Variants (${variants.length})`}
      actions={<button className="pb-btn pb-btn-ghost pb-btn-sm" onClick={add}>+ Add</button>}
      bodyStyle={{ padding: 0 }}
    >
        {variants.length === 0 ? (
          <div className="pb-empty">No variants — click Add to define per-rating entries</div>
        ) : (
          <table className="pb-variants-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Rating (A)</th>
                <th>MSRP ($)</th>
                <th>OEM ($)</th>
                <th>Part #</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {variants.map((v, i) => (
                <tr key={i}>
                  <td><input type="text" value={v.id} onChange={e => update(i, { id: e.target.value })} /></td>
                  <td><input type="number" value={v.currentRatingA} min={1} onChange={e => update(i, { currentRatingA: Number(e.target.value) })} /></td>
                  <td><input type="number" value={v.msrpUsd ?? ''} min={0} step={0.01} onChange={e => update(i, { msrpUsd: e.target.value ? Number(e.target.value) : undefined })} /></td>
                  <td><input type="number" value={v.oemPriceUsd ?? ''} min={0} step={0.01} onChange={e => update(i, { oemPriceUsd: e.target.value ? Number(e.target.value) : undefined })} /></td>
                  <td><input type="text" value={v.partNumber ?? ''} onChange={e => update(i, { partNumber: e.target.value || undefined })} /></td>
                  <td><button className="pb-btn pb-btn-danger pb-btn-sm" onClick={() => remove(i)} title="Remove">×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </CollapsibleSection>
  );
}

// ---- Extended table for MPPTs ----

function MpptVariantsTable({ variants, baseId, onChange }: {
  variants: ProductVariant[];
  baseId: string;
  onChange: (v: ProductVariant[]) => void;
}) {
  function update(index: number, changes: Partial<ProductVariant>) {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...changes } : v)));
  }
  function remove(index: number) {
    onChange(variants.filter((_, i) => i !== index));
  }
  function add() {
    const ratingA = nextRating(variants);
    const pvV = variants[variants.length - 1]?.maxPvVoltageV ?? 150;
    onChange([...variants, {
      id: `${baseId}-${pvV}-${ratingA}`,
      name: `MPPT ${pvV}/${ratingA}`,
      currentRatingA: ratingA,
      maxPvVoltageV: pvV,
      nominalVoltage: [12, 24, 48],
    }]);
  }

  return (
    <CollapsibleSection
      title={`Variants (${variants.length})`}
      actions={<button className="pb-btn pb-btn-ghost pb-btn-sm" onClick={add}>+ Add</button>}
      bodyStyle={{ padding: 0, overflowX: 'auto' }}
    >
        {variants.length === 0 ? (
          <div className="pb-empty">No variants — click Add to define per-model entries</div>
        ) : (
          <table className="pb-variants-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>PV V</th>
                <th>Out A</th>
                <th>Power W</th>
                <th>Bat V</th>
                <th>MSRP</th>
                <th>OEM</th>
                <th>Part #</th>
                <th>URL</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {variants.map((v, i) => (
                <tr key={i}>
                  <td style={{ minWidth: 180 }}><input type="text" value={v.id} onChange={e => update(i, { id: e.target.value })} /></td>
                  <td style={{ minWidth: 200 }}><input type="text" value={v.name ?? ''} placeholder="e.g. SmartSolar MPPT 150/35" onChange={e => update(i, { name: e.target.value || undefined })} /></td>
                  <td style={{ minWidth: 70 }}><input type="number" value={v.maxPvVoltageV ?? ''} min={1} onChange={e => update(i, { maxPvVoltageV: e.target.value ? Number(e.target.value) : undefined })} /></td>
                  <td style={{ minWidth: 60 }}><input type="number" value={v.currentRatingA} min={1} onChange={e => update(i, { currentRatingA: Number(e.target.value) })} /></td>
                  <td style={{ minWidth: 80 }}><input type="number" value={v.continuousPowerW ?? ''} min={1} onChange={e => update(i, { continuousPowerW: e.target.value ? Number(e.target.value) : undefined })} /></td>
                  <td style={{ minWidth: 90 }}>
                    <input
                      type="text"
                      value={voltageDisplay(v.nominalVoltage)}
                      placeholder="12,24,48"
                      onChange={e => update(i, { nominalVoltage: parseVoltages(e.target.value) })}
                    />
                  </td>
                  <td style={{ minWidth: 70 }}><input type="number" value={v.msrpUsd ?? ''} min={0} step={0.01} onChange={e => update(i, { msrpUsd: e.target.value ? Number(e.target.value) : undefined })} /></td>
                  <td style={{ minWidth: 70 }}><input type="number" value={v.oemPriceUsd ?? ''} min={0} step={0.01} onChange={e => update(i, { oemPriceUsd: e.target.value ? Number(e.target.value) : undefined })} /></td>
                  <td style={{ minWidth: 130 }}><input type="text" value={v.partNumber ?? ''} onChange={e => update(i, { partNumber: e.target.value || undefined })} /></td>
                  <td style={{ minWidth: 200 }}><input type="url" value={v.productUrl ?? ''} placeholder="https://…" onChange={e => update(i, { productUrl: e.target.value || undefined })} /></td>
                  <td><button className="pb-btn pb-btn-danger pb-btn-sm" onClick={() => remove(i)} title="Remove">×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </CollapsibleSection>
  );
}

// ---- Main component ----

export function VariantsForm({ product, onChange }: Props) {
  if (!isVariantProduct(product)) return null;

  const variants = product.variants ?? [];
  const baseId = product.id ?? 'product';
  const isMppt = product.productType === 'mppt';

  function handleChange(next: ProductVariant[]) {
    onChange(next.length ? next : undefined);
  }

  if (isMppt) {
    return <MpptVariantsTable variants={variants} baseId={baseId} onChange={handleChange} />;
  }

  return <ProtectionVariantsTable variants={variants} baseId={baseId} onChange={handleChange} />;
}
