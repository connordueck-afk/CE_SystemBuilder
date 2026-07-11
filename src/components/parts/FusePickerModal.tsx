import { useMemo, useState } from 'react';
import type { Product } from '../../types/system';
import { fuseProductsOfStyle, getFuseRating } from '../../utils/fuseSelection';
import { fmt } from '../../utils/priceCalculations';
import { resolveProductImageUrl, getProductDisplayImageUrl } from '../../utils/productImages';

interface Props {
  fuseStyle: string;
  maxFuseA?: number;
  currentFuseProductId?: string;
  products: Map<string, Product>;
  onConfirm: (fuseProductId: string) => void;
  onCancel: () => void;
  onSkip: () => void;
  onRemove?: () => void;
}

export function FusePickerModal({
  fuseStyle,
  maxFuseA,
  currentFuseProductId,
  products,
  onConfirm,
  onCancel,
  onSkip,
  onRemove,
}: Props) {
  const styleProducts = useMemo(() => {
    return fuseProductsOfStyle(products.values(), fuseStyle)
      .filter((p) => maxFuseA == null || getFuseRating(p) <= maxFuseA)
      .sort((a, b) => getFuseRating(a) - getFuseRating(b) || a.manufacturer.localeCompare(b.manufacturer));
  }, [products, fuseStyle, maxFuseA]);

  // Product lines: manufacturer + voltage rating
  const productLines = useMemo(() => {
    return [...new Map(
      styleProducts.map((p) => {
        const key = `${p.manufacturer}|${p.protectionRatings?.voltageRatingV ?? ''}`;
        return [key, { key, manufacturer: p.manufacturer, voltageV: p.protectionRatings?.voltageRatingV }];
      })
    ).values()];
  }, [styleProducts]);

  const defaultLineKey = useMemo(() => {
    if (currentFuseProductId) {
      const p = products.get(currentFuseProductId);
      if (p) return `${p.manufacturer}|${p.protectionRatings?.voltageRatingV ?? ''}`;
    }
    return productLines[0]?.key ?? '';
  }, [currentFuseProductId, products, productLines]);

  const [selectedLine, setSelectedLine] = useState(defaultLineKey);

  const ratingsForLine = useMemo(() => {
    return styleProducts
      .filter((p) => `${p.manufacturer}|${p.protectionRatings?.voltageRatingV ?? ''}` === selectedLine)
      .sort((a, b) => getFuseRating(a) - getFuseRating(b));
  }, [styleProducts, selectedLine]);

  const defaultProductId = useMemo(() => {
    if (currentFuseProductId && ratingsForLine.some((p) => p.id === currentFuseProductId)) {
      return currentFuseProductId;
    }
    return ratingsForLine[0]?.id ?? '';
  }, [currentFuseProductId, ratingsForLine]);

  const [selectedProductId, setSelectedProductId] = useState(defaultProductId);

  const selectedProduct = products.get(selectedProductId);
  const selectedImageUrl = resolveProductImageUrl(
    selectedProduct ? getProductDisplayImageUrl(selectedProduct) : undefined
  );

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal product-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="product-selector-header">
          <div>
            <div className="modal-title">Pick {fuseStyle} Fuse</div>
            <div className="product-selector-subtitle">Select the fuse product and rating for this slot.</div>
          </div>
          <button className="product-selector-close" onClick={onCancel} title="Close">x</button>
        </div>

        <div className="product-selector-body">
          <div className="product-preview product-preview-combiner">
            {selectedProduct && selectedImageUrl ? (
              <img
                key={selectedProduct.id}
                src={selectedImageUrl}
                alt={selectedProduct.name}
                className="product-preview-image"
              />
            ) : (
              <div className="product-preview-shape" />
            )}
          </div>

          <div className="product-selector-controls">
            <label className="selector-field">
              <span>Product Line</span>
              <select
                className="category-select"
                value={selectedLine}
                onChange={(e) => {
                  const line = e.target.value;
                  setSelectedLine(line);
                  const first = styleProducts.find((p) =>
                    `${p.manufacturer}|${p.protectionRatings?.voltageRatingV ?? ''}` === line
                  );
                  if (first) setSelectedProductId(first.id);
                }}
              >
                {productLines.map((line) => (
                  <option key={line.key} value={line.key}>
                    {`${line.manufacturer}${line.voltageV ? ` ${line.voltageV}V` : ''}`}
                  </option>
                ))}
              </select>
            </label>

            <label className="selector-field">
              <span>Rating</span>
              <select
                className="category-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                {ratingsForLine.map((p) => (
                  <option key={p.id} value={p.id}>{`${getFuseRating(p)}A`}</option>
                ))}
              </select>
            </label>

            {selectedProduct ? (
              <div className="selected-product-summary">
                <div className="selected-product-name">{selectedProduct.name}</div>
                <div className="selected-product-maker">{selectedProduct.manufacturer}</div>
                {selectedProduct.description && (
                  <div className="selected-product-description">{selectedProduct.description}</div>
                )}
                <div className="selected-product-price">
                  {fmt(selectedProduct.msrpUsd ?? null)}
                </div>
              </div>
            ) : (
              <div className="selected-product-summary">
                <div className="selected-product-name">No fuses available</div>
                <div className="selected-product-description">
                  No {fuseStyle} fuses found in the catalog for this slot.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="product-selector-actions">
          <button className="btn-cancel-small" onClick={onSkip}>Skip</button>
          <button className="btn-cancel-small" onClick={onCancel}>Cancel</button>
          {onRemove && currentFuseProductId && (
            <button className="btn-remove-small" onClick={onRemove}>Remove Fuse</button>
          )}
          <button
            className="btn-add"
            onClick={() => selectedProductId && onConfirm(selectedProductId)}
            disabled={!selectedProductId}
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
