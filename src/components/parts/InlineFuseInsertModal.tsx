import { useEffect, useMemo, useState } from 'react';
import type { NominalVoltage, Product } from '../../types/system';
import type { ProtectionRecommendation } from '../../utils/protectionRecommendations';
import { fmt } from '../../utils/priceCalculations';
import { getProductImageUrl, resolveProductImageUrl } from '../../utils/productImages';

interface Props {
  recommendation: ProtectionRecommendation;
  products: Map<string, Product>;
  systemVoltage: NominalVoltage;
  onCancel: () => void;
  onConfirm: (productId: string) => void;
}

const STYLE_PRIORITY = ['MIDI', 'MEGA', 'ANL', 'Class T', 'MRBF'];

function voltageCompatible(product: Product, systemVoltage: NominalVoltage): boolean {
  if (product.nominalVoltage == null) return true;
  const voltages = Array.isArray(product.nominalVoltage) ? product.nominalVoltage : [product.nominalVoltage];
  return voltages.includes(systemVoltage);
}

function getFuseStyle(product: Product): string {
  return product.protectionRatings?.fuseStyle ?? product.category ?? 'Fuse';
}

function getFuseRating(product: Product): number {
  return product.protectionRatings?.currentRatingA ?? product.maxCurrentA ?? 0;
}

function styleRank(style: string): number {
  const index = STYLE_PRIORITY.indexOf(style);
  return index >= 0 ? index : STYLE_PRIORITY.length;
}

function bestFuseProduct(products: Product[], targetA: number | undefined): Product | undefined {
  const target = targetA ?? 0;
  const adequate = products.filter((product) => getFuseRating(product) >= target);
  const candidates = adequate.length > 0 ? adequate : products;
  return [...candidates].sort((a, b) => (
    getFuseRating(a) - getFuseRating(b) ||
    styleRank(getFuseStyle(a)) - styleRank(getFuseStyle(b)) ||
    a.name.localeCompare(b.name)
  ))[0];
}

export function InlineFuseInsertModal({
  recommendation,
  products,
  systemVoltage,
  onCancel,
  onConfirm,
}: Props) {
  const [selectedFuseStyle, setSelectedFuseStyle] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');

  const fuseProducts = useMemo(() => {
    return [...products.values()]
      .filter((product) => product.productType === 'fuse' && voltageCompatible(product, systemVoltage))
      .sort((a, b) => (
        getFuseRating(a) - getFuseRating(b) ||
        styleRank(getFuseStyle(a)) - styleRank(getFuseStyle(b)) ||
        a.name.localeCompare(b.name)
      ));
  }, [products, systemVoltage]);

  useEffect(() => {
    const best = bestFuseProduct(fuseProducts, recommendation.recommendedFuseA);
    setSelectedFuseStyle(best ? getFuseStyle(best) : '');
    setSelectedProductId(best?.id ?? '');
  }, [fuseProducts, recommendation.connectionId, recommendation.recommendedFuseA]);

  const fuseStyles = useMemo(() => {
    return [...new Set(fuseProducts.map(getFuseStyle))]
      .sort((a, b) => styleRank(a) - styleRank(b) || a.localeCompare(b));
  }, [fuseProducts]);

  const fuseProductsForStyle = useMemo(() => {
    return fuseProducts
      .filter((product) => getFuseStyle(product) === selectedFuseStyle)
      .sort((a, b) => getFuseRating(a) - getFuseRating(b) || a.name.localeCompare(b.name));
  }, [fuseProducts, selectedFuseStyle]);

  const selectedProduct = products.get(selectedProductId) ?? fuseProductsForStyle[0];
  const selectedProductImageUrl = resolveProductImageUrl(
    selectedProduct?.imageUrl ?? (selectedProduct ? getProductImageUrl(selectedProduct.productType) : undefined)
  );

  function selectFuseStyle(style: string) {
    const productsForStyle = fuseProducts
      .filter((product) => getFuseStyle(product) === style)
      .sort((a, b) => getFuseRating(a) - getFuseRating(b) || a.name.localeCompare(b.name));
    const best = bestFuseProduct(productsForStyle, recommendation.recommendedFuseA);
    setSelectedFuseStyle(style);
    setSelectedProductId(best?.id ?? productsForStyle[0]?.id ?? '');
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal product-selector-modal" onClick={(event) => event.stopPropagation()}>
        <div className="product-selector-header">
          <div>
            <div className="modal-title">Insert Fuse</div>
            <div className="product-selector-subtitle">
              {recommendation.message}
            </div>
          </div>
          <button className="product-selector-close" onClick={onCancel} title="Close">x</button>
        </div>

        <div className="product-selector-body">
          <div className="product-preview product-preview-combiner">
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
            <label className="selector-field">
              <span>Fuse type</span>
              <select
                className="category-select"
                value={selectedFuseStyle}
                onChange={(event) => selectFuseStyle(event.target.value)}
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

            {selectedProduct ? (
              <div className="selected-product-summary">
                <div className="selected-product-name">{selectedProduct.name}</div>
                <div className="selected-product-maker">{selectedProduct.manufacturer}</div>
                <div className="selected-product-specs">
                  Recommended {recommendation.recommendedFuseA ?? getFuseRating(selectedProduct)}A
                  {recommendation.recommendedCableAwg ? ` / ${recommendation.recommendedCableAwg} AWG` : ''}
                </div>
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
                <div className="selected-product-name">No fuse models available</div>
                <div className="selected-product-description">
                  The catalog does not have a compatible fuse for this system voltage.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="product-selector-actions">
          <button className="btn-cancel-small" onClick={onCancel}>Cancel</button>
          <button className="btn-add" onClick={() => selectedProduct && onConfirm(selectedProduct.id)} disabled={!selectedProduct}>
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}
