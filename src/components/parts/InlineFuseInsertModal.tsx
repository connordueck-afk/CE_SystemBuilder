import { useEffect, useMemo, useState } from 'react';
import type { NominalVoltage, Product } from '../../types/system';
import type { ProtectionRecommendation } from '../../utils/protectionRecommendations';
import { fmt } from '../../utils/priceCalculations';
import { getProductDisplayImageUrl, resolveProductImageUrl } from '../../utils/productImages';
import {
  selectBestFuseProduct,
  getFuseStyle,
  getFuseRating,
  fuseStyleRank,
  ampacityForAwg,
} from '../../utils/fuseSelection';

interface Props {
  recommendation: ProtectionRecommendation;
  products: Map<string, Product>;
  systemVoltage: NominalVoltage;
  onCancel: () => void;
  onConfirm: (productId: string) => void;
}

function voltageCompatible(product: Product, systemVoltage: NominalVoltage): boolean {
  if (product.nominalVoltage == null) return true;
  const voltages = Array.isArray(product.nominalVoltage) ? product.nominalVoltage : [product.nominalVoltage];
  return voltages.includes(systemVoltage);
}

function protectionKind(recommendation: ProtectionRecommendation): 'Fuse' | 'Breaker' {
  return recommendation.busType === 'ac_line' ? 'Breaker' : 'Fuse';
}

function productMatchesRecommendation(
  product: Product,
  recommendation: ProtectionRecommendation,
  systemVoltage: NominalVoltage
): boolean {
  if (!voltageCompatible(product, systemVoltage)) return false;

  if (recommendation.busType === 'ac_line') {
    const acPowerTerminals = product.terminals.filter((terminal) => terminal.kind === 'ac_power');
    return product.productType === 'breaker' &&
      product.protectionRatings?.acDcCompatibility === 'ac' &&
      acPowerTerminals.length === 2;
  }

  return product.productType === 'fuse';
}

export function InlineFuseInsertModal({
  recommendation,
  products,
  systemVoltage,
  onCancel,
  onConfirm,
}: Props) {
  const [selectedProtectionStyle, setSelectedProtectionStyle] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const kind = protectionKind(recommendation);
  const kindLower = kind.toLowerCase();

  const protectionProducts = useMemo(() => {
    return [...products.values()]
      .filter((product) => productMatchesRecommendation(product, recommendation, systemVoltage))
      .sort((a, b) => (
        getFuseRating(a) - getFuseRating(b) ||
        fuseStyleRank(getFuseStyle(a)) - fuseStyleRank(getFuseStyle(b)) ||
        a.name.localeCompare(b.name)
      ));
  }, [products, recommendation, systemVoltage]);

  const maxAmpacityA = ampacityForAwg(recommendation.recommendedCableAwg);

  useEffect(() => {
    const best = selectBestFuseProduct(protectionProducts, {
      targetA: recommendation.recommendedFuseA,
      maxAmpacityA,
    });
    setSelectedProtectionStyle(best ? getFuseStyle(best) : '');
    setSelectedProductId(best?.id ?? '');
  }, [protectionProducts, recommendation.connectionId, recommendation.recommendedFuseA, maxAmpacityA]);

  const protectionStyles = useMemo(() => {
    return [...new Set(protectionProducts.map(getFuseStyle))]
      .sort((a, b) => fuseStyleRank(a) - fuseStyleRank(b) || a.localeCompare(b));
  }, [protectionProducts]);

  const protectionProductsForStyle = useMemo(() => {
    return protectionProducts
      .filter((product) => getFuseStyle(product) === selectedProtectionStyle)
      .sort((a, b) => getFuseRating(a) - getFuseRating(b) || a.name.localeCompare(b.name));
  }, [protectionProducts, selectedProtectionStyle]);

  const selectedProduct = products.get(selectedProductId) ?? protectionProductsForStyle[0];
  const selectedProductImageUrl = resolveProductImageUrl(
    selectedProduct ? getProductDisplayImageUrl(selectedProduct) : undefined
  );

  function selectProtectionStyle(style: string) {
    const productsForStyle = protectionProducts
      .filter((product) => getFuseStyle(product) === style)
      .sort((a, b) => getFuseRating(a) - getFuseRating(b) || a.name.localeCompare(b.name));
    const best = selectBestFuseProduct(productsForStyle, {
      targetA: recommendation.recommendedFuseA,
      maxAmpacityA,
    });
    setSelectedProtectionStyle(style);
    setSelectedProductId(best?.id ?? productsForStyle[0]?.id ?? '');
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal product-selector-modal" onClick={(event) => event.stopPropagation()}>
        <div className="product-selector-header">
          <div>
            <div className="modal-title">Insert {kind}</div>
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
              <span>{kind} type</span>
              <select
                className="category-select"
                value={selectedProtectionStyle}
                onChange={(event) => selectProtectionStyle(event.target.value)}
                disabled={protectionStyles.length === 0}
              >
                {protectionStyles.map((style) => (
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
                disabled={protectionProductsForStyle.length === 0}
              >
                {protectionProductsForStyle.map((product) => (
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
                <div className="selected-product-name">No {kindLower} models available</div>
                <div className="selected-product-description">
                  The catalog does not have a compatible {kindLower} for this branch.
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
