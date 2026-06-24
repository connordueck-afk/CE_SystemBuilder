import type { Product, ProductType, ProductCategory, DataQuality } from '../../types/system';
import { PRODUCT_TYPE_DEFINITIONS } from '../../data/products/productTypes';

const CATEGORIES: ProductCategory[] = [
  'Batteries', 'Solar', 'Charging', 'Inverters', 'Distribution',
  'Protection', 'AC Equipment', 'Loads', 'Monitoring', 'Accessories',
  'Communication', 'Connection Points', 'Cables',
];

const QUALITY_OPTIONS: DataQuality[] = ['complete', 'partial', 'placeholder'];

interface Props {
  product: Partial<Product>;
  onChange: (key: keyof Product, value: unknown) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pb-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

export function CoreFieldsForm({ product, onChange }: Props) {
  const f = <K extends keyof Product>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const el = e.target;
      const raw = (el as HTMLInputElement).type === 'number' ? Number(el.value) : el.value;
      onChange(key, raw);
    };

  const nominalVoltageValue = Array.isArray(product.nominalVoltage)
    ? product.nominalVoltage.join(',')
    : (product.nominalVoltage ?? '');

  return (
    <div className="pb-section">
      <div className="pb-section-header">Core Fields</div>
      <div className="pb-section-body">

        <div className="pb-field-row">
          <Field label="ID *">
            <input
              type="text"
              value={product.id ?? ''}
              onChange={f('id')}
              placeholder="e.g. bat-vic-smart-12-200"
            />
          </Field>
          <Field label="Manufacturer *">
            <input
              type="text"
              value={product.manufacturer ?? ''}
              onChange={f('manufacturer')}
              placeholder="e.g. Victron"
            />
          </Field>
        </div>

        <Field label="Name *">
          <input
            type="text"
            value={product.name ?? ''}
            onChange={f('name')}
            placeholder="e.g. SmartLithium 12.8V/200Ah"
          />
        </Field>

        <div className="pb-field-row">
          <Field label="Product Type *">
            <select value={product.productType ?? ''} onChange={f('productType')}>
              <option value="">— select —</option>
              {PRODUCT_TYPE_DEFINITIONS.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Category">
            <select value={product.category ?? ''} onChange={f('category')}>
              <option value="">— select —</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        <div className="pb-field-row-3">
          <Field label="Width (px) *">
            <input
              type="number"
              value={product.width ?? ''}
              onChange={f('width')}
              placeholder="128"
              min={20}
            />
          </Field>
          <Field label="Height (px) *">
            <input
              type="number"
              value={product.height ?? ''}
              onChange={f('height')}
              placeholder="80"
              min={20}
            />
          </Field>
          <Field label="Nominal Voltage">
            <input
              type="text"
              value={String(nominalVoltageValue)}
              onChange={e => {
                const raw = e.target.value.trim();
                if (raw.includes(',')) {
                  onChange('nominalVoltage', raw.split(',').map(Number).filter(Boolean));
                } else if (raw === '') {
                  onChange('nominalVoltage', undefined);
                } else {
                  onChange('nominalVoltage', Number(raw));
                }
              }}
              placeholder="12 or 12,24,48"
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            value={product.description ?? ''}
            onChange={f('description')}
            placeholder="Brief description of this product"
          />
        </Field>

        <Field label="Image URL (leave blank to use auto-resolved SVG)">
          <input
            type="text"
            value={product.imageUrl ?? ''}
            onChange={f('imageUrl')}
            placeholder="/product-images/victron/mppt-150-60.svg"
          />
        </Field>

        <div className="pb-field-row">
          <Field label="Data Quality">
            <select value={product.dataQuality ?? 'partial'} onChange={f('dataQuality')}>
              {QUALITY_OPTIONS.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </Field>
          <Field label="Part Number">
            <input
              type="text"
              value={product.partNumber ?? ''}
              onChange={f('partNumber')}
            />
          </Field>
        </div>

        <div className="pb-field-row">
          <Field label="MSRP (USD)">
            <input
              type="number"
              value={product.msrpUsd ?? ''}
              onChange={f('msrpUsd')}
              min={0}
              step={0.01}
            />
          </Field>
          <Field label="OEM Price (USD)">
            <input
              type="number"
              value={product.oemPriceUsd ?? ''}
              onChange={f('oemPriceUsd')}
              min={0}
              step={0.01}
            />
          </Field>
        </div>

        <Field label="Product URL">
          <input
            type="url"
            value={product.productUrl ?? ''}
            onChange={f('productUrl')}
            placeholder="https://…"
          />
        </Field>

        <Field label="Source / Notes">
          <input
            type="text"
            value={product.source ?? ''}
            onChange={f('source')}
            placeholder="e.g. Victron 2024 datasheet"
          />
        </Field>

        <div className="pb-field-row">
          <div className="pb-checkbox-row">
            <input
              id="isVirtual"
              type="checkbox"
              checked={product.isVirtual ?? false}
              onChange={e => onChange('isVirtual', e.target.checked)}
            />
            <label htmlFor="isVirtual">Virtual (no BOM cost)</label>
          </div>
          <div className="pb-checkbox-row">
            <input
              id="isBOMItem"
              type="checkbox"
              checked={product.isBOMItem ?? true}
              onChange={e => onChange('isBOMItem', e.target.checked)}
            />
            <label htmlFor="isBOMItem">BOM Item</label>
          </div>
        </div>

      </div>
    </div>
  );
}
