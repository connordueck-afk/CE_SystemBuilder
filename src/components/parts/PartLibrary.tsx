import { useMemo, useState } from 'react';
import type { NominalVoltage, Product, ProductType, ShapeAnnotationType, SystemComponent } from '../../types/system';
import { ALL_PRODUCTS } from '../../data/products';
import { fmt } from '../../utils/priceCalculations';
import { getProductDisplayImageUrl, resolveProductImageUrl } from '../../utils/productImages';

interface SourceLoadOptions {
  voltageV?: number;
  maxCurrentA?: number;
}

interface Props {
  systemVoltage: NominalVoltage | 'all';
  onAdd: (productId: string, options?: SourceLoadOptions) => void;
  onAddTextAnnotation: () => void;
  onAddShapeAnnotation: (shapeType: ShapeAnnotationType) => void;
  components: SystemComponent[];
  products: Map<string, Product>;
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onRemoveComponent: (id: string) => void;
  detailMode: boolean;
  collapsed: boolean;
  onExpandSidebar: () => void;
}

interface SelectorType {
  id: string;
  label: string;
  description: string;
  productTypes?: ProductType[];
  shapeKind?: 'text' | ShapeAnnotationType;
  match?: (product: Product) => boolean;
}

interface SelectorCategory {
  id: string;
  label: string;
  icon: string;
  types: SelectorType[];
}

const SELECTOR_CATEGORIES: SelectorCategory[] = [
  {
    id: 'shapes',
    label: 'Shapes',
    icon: 'shape',
    types: [
      {
        id: 'shape-text',
        label: 'Text Box',
        description: 'Resizable diagram annotation text.',
        shapeKind: 'text',
      },
      {
        id: 'shape-rectangle',
        label: 'Rectangle',
        description: 'Resizable box for grouping or generic schematic blocks.',
        shapeKind: 'rectangle',
      },
      {
        id: 'shape-circle',
        label: 'Circle',
        description: 'Resizable circular marker or callout.',
        shapeKind: 'circle',
      },
      {
        id: 'shape-triangle',
        label: 'Triangle',
        description: 'Directional marker, warning marker, or simple symbol.',
        shapeKind: 'triangle',
      },
      {
        id: 'shape-arrow',
        label: 'Arrow',
        description: 'Direction or flow annotation.',
        shapeKind: 'arrow',
      },
    ],
  },
  {
    id: 'solar',
    label: 'Solar',
    icon: 'solar',
    types: [
      {
        id: 'solar-panels',
        label: 'Panels',
        description: 'Solar panels and generic PV arrays.',
        productTypes: ['solar_array'],
      },
      {
        id: 'solar-mppts',
        label: 'MPPTs',
        description: 'Solar charge controllers using maximum power point tracking.',
        productTypes: ['mppt'],
      },
      {
        id: 'solar-pwm',
        label: 'PWM Charge Controllers',
        description: 'Basic PWM solar charge controllers.',
        productTypes: ['accessory'],
        match: (product) => product.name.toLowerCase().includes('pwm'),
      },
      {
        id: 'solar-connectors',
        label: 'Connectors',
        description: '2-1, 3-1, and 4-1 PV branch connectors for combining same-polarity solar conductors.',
        productTypes: ['solar_combiner'],
        match: (product) => product.category === 'Connectors',
      },
      {
        id: 'solar-combiners',
        label: 'Combiners',
        description: 'PV combiner boxes for multiple solar strings.',
        productTypes: ['solar_combiner', 'pvCombinerBox'],
        match: (product) => product.category !== 'Connectors',
      },
      {
        id: 'solar-disconnects',
        label: 'Disconnects',
        description: 'PV and DC disconnects used between array and controller.',
        productTypes: ['dcDisconnect'],
        match: (product) => /disconnect|pv|solar/i.test(`${product.name} ${product.description ?? ''}`),
      },
    ],
  },
  {
    id: 'battery',
    label: 'Battery',
    icon: 'battery',
    types: [
      {
        id: 'battery-lithium',
        label: 'Lithium',
        description: 'Lithium battery models and generic lithium banks.',
        productTypes: ['battery'],
        match: (product) => /lithium|lifepo|liFePO4/i.test(`${product.name} ${product.description ?? ''} ${product.batteryRatings?.chemistry ?? ''}`),
      },
      {
        id: 'battery-agm',
        label: 'AGM',
        description: 'AGM battery models.',
        productTypes: ['battery'],
        match: (product) => /agm/i.test(`${product.name} ${product.description ?? ''} ${product.batteryRatings?.chemistry ?? ''}`),
      },
      {
        id: 'battery-bms',
        label: 'BMS',
        description: 'Battery management systems and battery protection modules.',
        productTypes: ['monitor', 'accessory'],
        match: (product) => /bms|battery management/i.test(`${product.name} ${product.description ?? ''}`),
      },
      {
        id: 'battery-monitors',
        label: 'Monitors',
        description: 'Battery monitors, shunts, and system monitoring displays.',
        productTypes: ['monitor', 'batteryMonitor'],
        match: (product) => /monitor|shunt|bmv|smartshunt/i.test(`${product.name} ${product.description ?? ''}`),
      },
    ],
  },
  {
    id: 'ac-power',
    label: 'AC Power',
    icon: 'ac',
    types: [
      {
        id: 'ac-inverters',
        label: 'Inverters',
        description: 'Inverter models for DC to AC power.',
        productTypes: ['inverter_charger'],
        match: (product) => product.capabilities?.includes('inverter') || /phoenix inverter/i.test(product.name),
      },
      {
        id: 'ac-chargers',
        label: 'Chargers',
        description: 'AC powered battery chargers.',
        productTypes: ['shore_charger'],
      },
      {
        id: 'ac-inverter-chargers',
        label: 'Inverter/Chargers',
        description: 'Combined inverter and charger units.',
        productTypes: ['inverter_charger'],
        match: (product) =>
          product.capabilities?.includes('inverter-charger') ||
          (!product.capabilities?.includes('inverter') && !/phoenix inverter/i.test(product.name)),
      },
      {
        id: 'ac-source',
        label: 'AC Source',
        description: 'Generic AC source tile. Rename it after adding.',
        productTypes: ['shorePowerInlet'],
        match: (product) => /generic ac source|ac source/i.test(`${product.name} ${product.description ?? ''}`),
      },
      {
        id: 'ac-load',
        label: 'AC Load',
        description: 'Generic AC load tile. Rename it after adding.',
        productTypes: ['ac_load'],
      },
    ],
  },
  {
    id: 'distribution',
    label: 'Distribution',
    icon: 'dc',
    types: [
      {
        id: 'distribution-busbars',
        label: 'Busbars',
        description: 'Single-polarity and combined DC busbars for landing multiple conductors.',
        productTypes: ['busbar'],
      },
      {
        id: 'distribution-dc',
        label: 'DC Distribution',
        description: 'DC distribution panels, Lynx modules, and fused DC distribution hardware.',
        productTypes: ['dc_distribution'],
      },
      {
        id: 'distribution-ac',
        label: 'AC Distribution',
        description: 'AC branch circuit distribution panels.',
        productTypes: ['ac_distribution'],
      },
    ],
  },
  {
    id: 'protection',
    label: 'Protection',
    icon: 'dc',
    types: [
      {
        id: 'protection-fuses',
        label: 'Fuses',
        description: 'ANL, MIDI, MEGA, Class T, MRBF, and other DC fuse protection.',
        productTypes: ['fuse'],
      },
      {
        id: 'protection-ac-breakers',
        label: 'AC Breakers',
        description: 'Single-pole, dual-pole, and 3-pole DIN rail AC circuit breakers.',
        productTypes: ['breaker'],
        match: (product) => product.protectionRatings?.acDcCompatibility === 'ac',
      },
      {
        id: 'protection-breakers',
        label: 'DC Breakers',
        description: 'Resettable DC circuit breakers and battery protection devices.',
        productTypes: ['breaker'],
        match: (product) => product.protectionRatings?.acDcCompatibility !== 'ac',
      },
      {
        id: 'protection-disconnects',
        label: 'Disconnects',
        description: 'Manual AC and DC disconnect switches.',
        productTypes: ['dcDisconnect', 'acDisconnect'],
      },
      {
        id: 'protection-switching',
        label: 'Relays & Contactors',
        description: 'Controlled switching devices for DC and AC circuits.',
        productTypes: ['relay', 'contactor'],
      },
    ],
  },
  {
    id: 'dc-power',
    label: 'DC Power',
    icon: 'dc',
    types: [
      {
        id: 'dc-source',
        label: 'DC Source',
        description: 'Generic DC source tile. Rename it after adding.',
        productTypes: ['accessory'],
        match: (product) => /generic dc source|dc source/i.test(`${product.name} ${product.description ?? ''}`),
      },
      {
        id: 'dc-load',
        label: 'DC Load',
        description: 'Generic DC load tile. Rename it after adding.',
        productTypes: ['dc_load'],
      },
      {
        id: 'dc-dc-converters',
        label: 'DC-DC Converters',
        description: 'DC-DC chargers and converters.',
        productTypes: ['dc_dc_charger', 'converter'],
      },
    ],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  solar: '#c98518',
  battery: '#3975c5',
  'ac-power': '#7c61c7',
  distribution: '#1769d2',
  protection: '#b93232',
  'dc-power': '#2f9461',
  shapes: '#33435a',
};

function voltageCompatible(product: Product, systemVoltage: NominalVoltage | 'all'): boolean {
  if (systemVoltage === 'all') return true;
  if (product.nominalVoltage == null) return true;
  const voltages = Array.isArray(product.nominalVoltage) ? product.nominalVoltage : [product.nominalVoltage];
  return voltages.includes(systemVoltage);
}

function productMatchesSelector(product: Product, selector: SelectorType, systemVoltage: NominalVoltage | 'all'): boolean {
  if (!selector.productTypes) return false;
  if (!selector.productTypes.includes(product.productType)) return false;
  if (!voltageCompatible(product, systemVoltage)) return false;
  return selector.match ? selector.match(product) : true;
}

function allSelectors(): SelectorType[] {
  return SELECTOR_CATEGORIES.flatMap((category) => category.types);
}

function getPrimarySelector(product: Product, systemVoltage: NominalVoltage | 'all'): SelectorType | undefined {
  return allSelectors().find((selector) => productMatchesSelector(product, selector, systemVoltage));
}

function productMatchesPrimarySelector(product: Product, selector: SelectorType, systemVoltage: NominalVoltage | 'all'): boolean {
  return getPrimarySelector(product, systemVoltage)?.id === selector.id;
}

function productSpecLine(product: Product): string {
  const specs: string[] = [];
  if (product.nominalVoltage != null) {
    const voltage = Array.isArray(product.nominalVoltage) ? product.nominalVoltage.join('/') : product.nominalVoltage;
    specs.push(`${voltage}V`);
  }
  if (product.capacityWh) specs.push(`${(product.capacityWh / 1000).toFixed(1)}kWh`);
  if (product.continuousPowerW) specs.push(`${product.continuousPowerW}W`);
  if (product.maxCurrentA) specs.push(`${product.maxCurrentA}A`);
  if (product.maxPvVoltageV) specs.push(`PV ${product.maxPvVoltageV}V`);
  if (product.maxPvCurrentA) specs.push(`${product.maxPvCurrentA}A PV`);
  if (product.capabilities?.includes('pv-input')) specs.push('PV input');
  return specs.join(' / ');
}

function getFuseStyle(product: Product): string {
  return product.protectionRatings?.fuseStyle ?? product.category ?? 'Fuse';
}

function getBreakerStyle(product: Product): string {
  return product.protectionRatings?.breakerStyle ?? product.category ?? 'Breaker';
}

function getFuseRating(product: Product): number {
  return product.protectionRatings?.currentRatingA ?? product.maxCurrentA ?? 0;
}

function getProductIconClass(selectorId: string): string {
  if (selectorId.includes('panel')) return 'product-preview-solar';
  if (selectorId.includes('battery')) return 'product-preview-battery';
  if (selectorId.includes('mppt') || selectorId.includes('pwm')) return 'product-preview-controller';
  if (selectorId.includes('inverter')) return 'product-preview-inverter';
  if (selectorId.includes('charger') || selectorId.includes('converter')) return 'product-preview-controller';
  if (selectorId.includes('combiner')) return 'product-preview-combiner';
  if (selectorId.includes('fuse') || selectorId.includes('breaker') || selectorId.includes('protection')) return 'product-preview-combiner';
  if (selectorId.includes('busbar') || selectorId.includes('distribution')) return 'product-preview-source';
  if (selectorId.includes('load')) return 'product-preview-load';
  if (selectorId.includes('source')) return 'product-preview-source';
  return 'product-preview-generic';
}

function categoryMatchesSearch(category: SelectorCategory, query: string): boolean {
  if (!query) return true;
  const normalized = query.toLowerCase();
  return (
    category.label.toLowerCase().includes(normalized) ||
    category.types.some((selector) => (
      selector.label.toLowerCase().includes(normalized) ||
      selector.description.toLowerCase().includes(normalized)
    ))
  );
}

function typeMatchesSearch(selector: SelectorType, query: string): boolean {
  if (!query) return true;
  const normalized = query.toLowerCase();
  return (
    selector.label.toLowerCase().includes(normalized) ||
    selector.description.toLowerCase().includes(normalized)
  );
}

function productMatchesSearch(product: Product, query: string): boolean {
  if (!query) return true;
  const normalized = query.toLowerCase();
  return [
    product.manufacturer,
    product.name,
    product.partNumber,
    product.category,
    product.productType,
    ...(product.capabilities ?? []),
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalized));
}

export function PartLibrary({
  systemVoltage,
  onAdd,
  onAddTextAnnotation,
  onAddShapeAnnotation,
  components,
  products,
  selectedComponentId,
  onSelectComponent,
  onRemoveComponent,
  collapsed,
  onExpandSidebar,
}: Props) {
  const [openCategoryId, setOpenCategoryId] = useState(SELECTOR_CATEGORIES[0].id);
  const [activeSelector, setActiveSelector] = useState<SelectorType | null>(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState('All');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [instanceVoltageV, setInstanceVoltageV] = useState<number | undefined>(undefined);
  const [instanceMaxCurrentA, setInstanceMaxCurrentA] = useState<number | undefined>(undefined);
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const catalogForSelector = useMemo(() => {
    if (!activeSelector) return [];
    return ALL_PRODUCTS.filter((product) => productMatchesPrimarySelector(product, activeSelector, systemVoltage));
  }, [activeSelector, systemVoltage]);

  const manufacturers = useMemo(() => {
    return ['All', ...new Set(catalogForSelector.map((product) => product.manufacturer))].sort((a, b) => {
      if (a === 'All') return -1;
      if (b === 'All') return 1;
      return a.localeCompare(b);
    });
  }, [catalogForSelector]);

  const visibleProducts = useMemo(() => {
    return catalogForSelector.filter((product) => (
      selectedManufacturer === 'All' || product.manufacturer === selectedManufacturer
    ));
  }, [catalogForSelector, selectedManufacturer]);

  const selectedProduct = products.get(selectedProductId) ?? visibleProducts[0];
  const selectedProductImageUrl = resolveProductImageUrl(
    selectedProduct ? getProductDisplayImageUrl(selectedProduct) : undefined
  );
  const isFuseSelector = activeSelector?.id === 'protection-fuses';
  const isBreakerSelector = Boolean(activeSelector?.productTypes?.includes('breaker'));

  const fuseStyles = useMemo(() => {
    if (!isFuseSelector) return [];
    return [...new Set(catalogForSelector.map(getFuseStyle))].sort((a, b) => a.localeCompare(b));
  }, [catalogForSelector, isFuseSelector]);

  const fuseProductsForStyle = useMemo(() => {
    if (!isFuseSelector) return [];
    return catalogForSelector
      .filter((product) => getFuseStyle(product) === selectedStyle)
      .sort((a, b) => getFuseRating(a) - getFuseRating(b));
  }, [catalogForSelector, isFuseSelector, selectedStyle]);

  const breakerStyles = useMemo(() => {
    if (!isBreakerSelector) return [];
    return [...new Set(catalogForSelector.map(getBreakerStyle))].sort((a, b) => a.localeCompare(b));
  }, [catalogForSelector, isBreakerSelector]);

  const breakerProductsForStyle = useMemo(() => {
    if (!isBreakerSelector) return [];
    return catalogForSelector
      .filter((product) => getBreakerStyle(product) === selectedStyle)
      .sort((a, b) => getFuseRating(a) - getFuseRating(b));
  }, [catalogForSelector, isBreakerSelector, selectedStyle]);

  const componentsOnDiagram = useMemo(() => {
    return components
      .map((component) => ({ component, product: products.get(component.productId) }))
      .filter((item): item is { component: SystemComponent; product: Product } => Boolean(item.product));
  }, [components, products]);

  const SOURCE_LOAD_SELECTOR_IDS = new Set(['dc-source', 'dc-load', 'ac-source', 'ac-load']);
  const isAcSelector = (id: string) => id === 'ac-source' || id === 'ac-load';

  function openSelector(selector: SelectorType) {
    if (selector.shapeKind === 'text') {
      onAddTextAnnotation();
      return;
    }
    if (selector.shapeKind) {
      onAddShapeAnnotation(selector.shapeKind);
      return;
    }

    const matches = ALL_PRODUCTS.filter((product) => productMatchesPrimarySelector(product, selector, systemVoltage));
    const firstProduct = matches[0];
    setActiveSelector(selector);
    setSelectedManufacturer('All');
    setSelectedProductId(firstProduct?.id ?? '');
    setSelectedStyle(
      selector.id === 'protection-fuses' && firstProduct ? getFuseStyle(firstProduct)
      : selector.productTypes?.includes('breaker') && firstProduct ? getBreakerStyle(firstProduct)
      : ''
    );

    if (SOURCE_LOAD_SELECTOR_IDS.has(selector.id)) {
      const defaultV = isAcSelector(selector.id) ? 120 : (systemVoltage === 'all' ? 12 : systemVoltage);
      const defaultA = firstProduct?.maxCurrentA
        ?? (firstProduct?.continuousPowerW ? Math.round(firstProduct.continuousPowerW / defaultV) : undefined);
      setInstanceVoltageV(defaultV);
      setInstanceMaxCurrentA(defaultA);
    } else {
      setInstanceVoltageV(undefined);
      setInstanceMaxCurrentA(undefined);
    }
  }

  function closeSelector() {
    setActiveSelector(null);
    setSelectedManufacturer('All');
    setSelectedProductId('');
    setSelectedStyle('');
    setInstanceVoltageV(undefined);
    setInstanceMaxCurrentA(undefined);
  }

  function selectStyle(style: string) {
    const styleGetter = isBreakerSelector ? getBreakerStyle : getFuseStyle;
    const productsForStyle = catalogForSelector
      .filter((product) => styleGetter(product) === style)
      .sort((a, b) => getFuseRating(a) - getFuseRating(b));
    setSelectedStyle(style);
    setSelectedProductId(productsForStyle[0]?.id ?? '');
  }

  function confirmAdd() {
    if (!selectedProduct) return;
    const options: SourceLoadOptions | undefined =
      activeSelector && SOURCE_LOAD_SELECTOR_IDS.has(activeSelector.id)
        ? { voltageV: instanceVoltageV, maxCurrentA: instanceMaxCurrentA }
        : undefined;
    onAdd(selectedProduct.id, options);
    closeSelector();
  }

  const visibleCategories = SELECTOR_CATEGORIES
    .map((category) => {
      const categoryNameMatches = normalizedSearch && category.label.toLowerCase().includes(normalizedSearch);
      const selectorMatchesProducts = (selector: SelectorType) =>
        ALL_PRODUCTS.some((product) =>
          productMatchesSelector(product, selector, systemVoltage) && productMatchesSearch(product, normalizedSearch)
        );
      return {
        ...category,
        types: categoryNameMatches
          ? category.types
          : category.types.filter((selector) =>
              typeMatchesSearch(selector, normalizedSearch) || selectorMatchesProducts(selector)
            ),
      };
    })
    .filter((category) => normalizedSearch ? category.types.length > 0 : categoryMatchesSearch(category, normalizedSearch));

  return (
    <div className="part-library">
      {!collapsed && (
        <div className="part-search">
          <span className="part-search-icon" />
          <input
            className="part-search-input"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search product types..."
          />
        </div>
      )}

      <div className="selector-category-list">
        {(collapsed ? SELECTOR_CATEGORIES : visibleCategories).map((category) => {
          const isOpen = openCategoryId === category.id;
          const color = CATEGORY_COLORS[category.id] ?? '#617089';
          return (
            <section key={category.id} className="selector-category">
              <button
                className="selector-category-header"
                title={category.label}
                onClick={() => {
                  setOpenCategoryId(category.id);
                  if (collapsed) {
                    onExpandSidebar();
                  } else {
                    setOpenCategoryId(isOpen ? '' : category.id);
                  }
                }}
              >
                <span className="selector-category-left">
                  <span className={`selector-category-icon selector-category-icon-${category.icon}`} style={{ color }} />
                  {!collapsed && <span className="selector-category-name">{category.label}</span>}
                </span>
                {!collapsed && <span className="selector-category-caret">{isOpen ? 'v' : '>'}</span>}
              </button>

              {!collapsed && isOpen && (
                <div className="selector-type-list">
                  {category.types.map((selector) => {
                    const count = ALL_PRODUCTS.filter((product) => productMatchesPrimarySelector(product, selector, systemVoltage)).length;
                    const displayCount = selector.shapeKind ? 1 : count;
                    return (
                      <button
                        key={selector.id}
                        className="selector-type-btn"
                        onClick={() => openSelector(selector)}
                      >
                        <span>{selector.label}</span>
                        <span className="selector-type-count">{displayCount}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
        {!collapsed && visibleCategories.length === 0 && (
          <div className="selector-search-empty">No matching product types.</div>
        )}
      </div>

      {!collapsed && <div className="diagram-component-list">
        <div className="diagram-component-title">On diagram</div>
        {componentsOnDiagram.length === 0 ? (
          <div className="diagram-component-empty">No components added yet.</div>
        ) : (
          componentsOnDiagram.map(({ component, product }) => {
            const isSelected = component.id === selectedComponentId;
            const isExcludedFromBom = component.includeInBom === false;
            return (
              <div
                key={component.id}
                className={`system-item${isSelected ? ' system-item-selected' : ''}${isExcludedFromBom ? ' system-item-excluded-bom' : ''}`}
                onClick={() => onSelectComponent(component.id)}
              >
                <span className="system-item-main">
                  <span className="system-item-name" title={product.name}>{product.name}</span>
                  <span className="system-item-specs">{productSpecLine(product)}</span>
                </span>
                <div className="system-item-controls" onClick={(event) => event.stopPropagation()}>
                  <button
                    className="system-item-remove"
                    onClick={() => onRemoveComponent(component.id)}
                    title="Remove"
                  >
                    x
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>}

      {activeSelector && (
        <div className="modal-overlay" onClick={closeSelector}>
          <div className="modal product-selector-modal" onClick={(event) => event.stopPropagation()}>
            <div className="product-selector-header">
              <div>
                <div className="modal-title">{activeSelector.label}</div>
                <div className="product-selector-subtitle">{activeSelector.description}</div>
              </div>
              <button className="product-selector-close" onClick={closeSelector} title="Close">x</button>
            </div>

            <div className="product-selector-body">
              <div className={`product-preview ${getProductIconClass(activeSelector.id)}`}>
                {selectedProduct && selectedProductImageUrl ? (
                  <img
                    key={selectedProduct.id}
                    src={selectedProductImageUrl}
                    alt={selectedProduct.name}
                    className="product-preview-image"
                  />
                ) : (
                  <div className="product-preview-shape" />
                )}
              </div>

              <div className="product-selector-controls">
                {isFuseSelector ? (
                  <>
                    <label className="selector-field">
                      <span>Fuse type</span>
                      <select
                        className="category-select"
                        value={selectedStyle}
                        onChange={(event) => selectStyle(event.target.value)}
                        disabled={fuseStyles.length === 0}
                      >
                        {fuseStyles.map((style) => (
                          <option key={style} value={style}>{style}</option>
                        ))}
                      </select>
                    </label>

                    <label className="selector-field">
                      <span>Rating</span>
                      <select
                        className="category-select"
                        value={selectedProduct?.id ?? ''}
                        onChange={(event) => setSelectedProductId(event.target.value)}
                        disabled={fuseProductsForStyle.length === 0}
                      >
                        {fuseProductsForStyle.map((product) => (
                          <option key={product.id} value={product.id}>{getFuseRating(product)}A</option>
                        ))}
                      </select>
                    </label>
                  </>
                ) : isBreakerSelector ? (
                  <>
                    <label className="selector-field">
                      <span>Breaker type</span>
                      <select
                        className="category-select"
                        value={selectedStyle}
                        onChange={(event) => selectStyle(event.target.value)}
                        disabled={breakerStyles.length === 0}
                      >
                        {breakerStyles.map((style) => (
                          <option key={style} value={style}>{style}</option>
                        ))}
                      </select>
                    </label>

                    <label className="selector-field">
                      <span>Rating</span>
                      <select
                        className="category-select"
                        value={selectedProduct?.id ?? ''}
                        onChange={(event) => setSelectedProductId(event.target.value)}
                        disabled={breakerProductsForStyle.length === 0}
                      >
                        {breakerProductsForStyle.map((product) => (
                          <option key={product.id} value={product.id}>{getFuseRating(product)}A</option>
                        ))}
                      </select>
                    </label>
                  </>
                ) : (
                  <>
                    <label className="selector-field">
                      <span>Manufacturer</span>
                      <select
                        className="category-select"
                        value={selectedManufacturer}
                        onChange={(event) => {
                          const manufacturer = event.target.value;
                          const nextProducts = catalogForSelector.filter((product) => (
                            manufacturer === 'All' || product.manufacturer === manufacturer
                          ));
                          setSelectedManufacturer(manufacturer);
                          setSelectedProductId(nextProducts[0]?.id ?? '');
                        }}
                      >
                        {manufacturers.map((manufacturer) => (
                          <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                        ))}
                      </select>
                    </label>

                    <label className="selector-field">
                      <span>Model</span>
                      <select
                        className="category-select"
                        value={selectedProduct?.id ?? ''}
                        onChange={(event) => setSelectedProductId(event.target.value)}
                        disabled={visibleProducts.length === 0}
                      >
                        {visibleProducts.map((product) => (
                          <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                      </select>
                    </label>
                  </>
                )}

                {selectedProduct ? (
                  <div className="selected-product-summary">
                    <div className="selected-product-name">{selectedProduct.name}</div>
                    <div className="selected-product-maker">{selectedProduct.manufacturer}</div>
                    {productSpecLine(selectedProduct) && (
                      <div className="selected-product-specs">{productSpecLine(selectedProduct)}</div>
                    )}
                    {selectedProduct.description && (
                      <div className="selected-product-description">{selectedProduct.description}</div>
                    )}
                    <div className="selected-product-price">
                      {fmt(selectedProduct.msrpUsd ?? null)}
                      {selectedProduct.oemPriceUsd != null && (
                        <span> / {fmt(selectedProduct.oemPriceUsd)} OEM</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="selected-product-summary">
                    <div className="selected-product-name">No models available yet</div>
                    <div className="selected-product-description">
                      This product type is in the selector, but the catalog does not have matching models for the current system voltage.
                    </div>
                  </div>
                )}

                {activeSelector && SOURCE_LOAD_SELECTOR_IDS.has(activeSelector.id) && (
                  <div className="source-load-config">
                    <div className="source-load-config-title">
                      {activeSelector.id.includes('source') ? 'Output Parameters' : 'Load Parameters'}
                    </div>
                    <label className="selector-field">
                      <span>{activeSelector.id.includes('source') ? 'Output Voltage (V)' : 'Operating Voltage (V)'}</span>
                      <input
                        type="number"
                        className="category-select"
                        min={1}
                        value={instanceVoltageV ?? ''}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          setInstanceVoltageV(isNaN(v) ? undefined : v);
                        }}
                        placeholder={isAcSelector(activeSelector.id) ? '120' : String(systemVoltage === 'all' ? 12 : systemVoltage)}
                      />
                    </label>
                    <label className="selector-field">
                      <span>{activeSelector.id.includes('source') ? 'Max Current (A)' : 'Max Current Draw (A)'}</span>
                      <input
                        type="number"
                        className="category-select"
                        min={0}
                        value={instanceMaxCurrentA ?? ''}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          setInstanceMaxCurrentA(isNaN(v) ? undefined : v);
                        }}
                        placeholder="e.g. 10"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="product-selector-actions">
              <button className="btn-cancel-small" onClick={closeSelector}>Cancel</button>
              <button className="btn-add" onClick={confirmAdd} disabled={!selectedProduct}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
