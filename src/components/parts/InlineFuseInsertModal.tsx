import { useEffect, useMemo, useState } from 'react';
import type { NominalVoltage, Product } from '../../types/system';
import type { ProtectionRecommendation } from '../../utils/protectionRecommendations';
import { fmt } from '../../utils/priceCalculations';
import { getProductDisplayImageUrl, resolveProductImageUrl } from '../../utils/productImages';
import { inlineProtectionTerminalIds } from '../../utils/inlineProtection';
import {
  selectBestFuseProduct,
  getFuseStyle,
  getFuseRating,
  fuseStyleRank,
  ampacityForAwg,
} from '../../utils/fuseSelection';
import { STANDARD_FUSE_RATINGS, nextStandardFuse } from '../../data/fuseRatings';

interface Props {
  recommendation: ProtectionRecommendation;
  products: Map<string, Product>;
  systemVoltage: NominalVoltage;
  onCancel: () => void;
  onConfirm: (productId: string, slotRatingA?: number) => void;
}

function voltageCompatible(product: Product, systemVoltage: NominalVoltage): boolean {
  if (product.nominalVoltage == null) return true;
  const voltages = Array.isArray(product.nominalVoltage) ? product.nominalVoltage : [product.nominalVoltage];
  return voltages.includes(systemVoltage);
}

function holderFuseStyle(product: Product): string {
  return product.distributionTopology?.fuseSlots?.[0]?.fuseStyle ?? product.category ?? 'Fuse';
}

function holderMaxFuseA(product: Product): number {
  return product.distributionTopology?.fuseSlots?.[0]?.maxFuseA ?? product.maxCurrentA ?? 0;
}

function holderStyleRank(style: string): number {
  const ranks: Record<string, number> = { 'Class T': 0, ANL: 1, MEGA: 2, MIDI: 3 };
  return ranks[style] ?? 99;
}

function clampToMax(ratingA: number, maxA: number): number {
  if (maxA <= 0) return ratingA;
  const clamped = STANDARD_FUSE_RATINGS.filter((r) => r <= maxA);
  return clamped[clamped.length - 1] ?? ratingA;
}

export function InlineFuseInsertModal({
  recommendation,
  products,
  systemVoltage,
  onCancel,
  onConfirm,
}: Props) {
  const isDC = recommendation.busType === 'dc_pos';
  const isPackFuse = recommendation.kind === 'pack_fuse_required';
  const modalTitle = recommendation.insertTitle ?? `Insert ${isDC ? 'Fuse Holder' : 'Breaker'}`;

  // DC: holder + slot rating
  const [selectedHolderStyle, setSelectedHolderStyle] = useState('');
  const [selectedHolderId, setSelectedHolderId] = useState('');
  const [selectedRatingA, setSelectedRatingA] = useState(0);

  // AC: breaker product
  const [selectedBreakerStyle, setSelectedBreakerStyle] = useState('');
  const [selectedBreakerId, setSelectedBreakerId] = useState('');

  // --- DC holder products ---
  const holderProducts = useMemo(() => {
    if (!isDC) return [];
    return [...products.values()]
      .filter((p) => p.productType === 'fuse_holder' && voltageCompatible(p, systemVoltage))
      .sort((a, b) => (
        holderStyleRank(holderFuseStyle(a)) - holderStyleRank(holderFuseStyle(b)) ||
        holderMaxFuseA(b) - holderMaxFuseA(a) ||
        a.name.localeCompare(b.name)
      ));
  }, [isDC, products, systemVoltage]);

  const holderStyles = useMemo(() => (
    [...new Set(holderProducts.map(holderFuseStyle))]
      .sort((a, b) => holderStyleRank(a) - holderStyleRank(b) || a.localeCompare(b))
  ), [holderProducts]);

  const holdersForStyle = useMemo(() => (
    holderProducts.filter((p) => holderFuseStyle(p) === selectedHolderStyle)
  ), [holderProducts, selectedHolderStyle]);

  const selectedHolder = holderProducts.find((p) => p.id === selectedHolderId) ?? holdersForStyle[0];
  const maxForHolder = selectedHolder ? holderMaxFuseA(selectedHolder) : 0;

  const ratingsForHolder = useMemo(() => (
    STANDARD_FUSE_RATINGS.filter((r) => maxForHolder <= 0 || r <= maxForHolder)
  ), [maxForHolder]);

  useEffect(() => {
    if (!isDC || holderProducts.length === 0) return;
    const recommendedA = recommendation.recommendedFuseA ?? 30;
    const bestStyle = holderStyles.find((style) =>
      holderProducts.filter((p) => holderFuseStyle(p) === style).some((p) => holderMaxFuseA(p) >= recommendedA)
    ) ?? holderStyles[0] ?? '';
    const holdersOfStyle = holderProducts.filter((p) => holderFuseStyle(p) === bestStyle);
    const bestHolder = holdersOfStyle.find((p) => holderMaxFuseA(p) >= recommendedA) ?? holdersOfStyle[0];
    const maxA = bestHolder ? holderMaxFuseA(bestHolder) : 0;
    const target = nextStandardFuse(recommendedA);
    setSelectedHolderStyle(bestStyle);
    setSelectedHolderId(bestHolder?.id ?? '');
    setSelectedRatingA(maxA > 0 && target > maxA ? clampToMax(target, maxA) : target);
  }, [isDC, holderProducts, holderStyles, recommendation.connectionId, recommendation.recommendedFuseA]);

  function selectHolderStyle(style: string) {
    const holders = holderProducts.filter((p) => holderFuseStyle(p) === style);
    const recommendedA = recommendation.recommendedFuseA ?? 30;
    const bestHolder = holders.find((p) => holderMaxFuseA(p) >= recommendedA) ?? holders[0];
    const maxA = bestHolder ? holderMaxFuseA(bestHolder) : 0;
    const target = nextStandardFuse(recommendedA);
    setSelectedHolderStyle(style);
    setSelectedHolderId(bestHolder?.id ?? '');
    setSelectedRatingA(maxA > 0 && target > maxA ? clampToMax(target, maxA) : target);
  }

  function selectHolder(holderId: string) {
    const holder = holderProducts.find((p) => p.id === holderId);
    const maxA = holder ? holderMaxFuseA(holder) : 0;
    const target = nextStandardFuse(recommendation.recommendedFuseA ?? 30);
    setSelectedHolderId(holderId);
    setSelectedRatingA(maxA > 0 && target > maxA ? clampToMax(target, maxA) : target);
  }

  // --- AC breaker products ---
  const breakerProducts = useMemo(() => {
    if (isDC) return [];
    return [...products.values()]
      .filter((p) =>
        p.productType === 'breaker' &&
        voltageCompatible(p, systemVoltage) &&
        p.protectionRatings?.acDcCompatibility === 'ac' &&
        inlineProtectionTerminalIds(p, recommendation.busType) != null
      )
      .sort((a, b) => (
        getFuseRating(a) - getFuseRating(b) ||
        fuseStyleRank(getFuseStyle(a)) - fuseStyleRank(getFuseStyle(b)) ||
        a.name.localeCompare(b.name)
      ));
  }, [isDC, products, systemVoltage, recommendation.busType]);

  const maxAmpacityA = ampacityForAwg(recommendation.recommendedCableAwg);

  useEffect(() => {
    if (isDC || breakerProducts.length === 0) return;
    const best = selectBestFuseProduct(breakerProducts, { targetA: recommendation.recommendedFuseA, maxAmpacityA });
    setSelectedBreakerStyle(best ? getFuseStyle(best) : '');
    setSelectedBreakerId(best?.id ?? '');
  }, [isDC, breakerProducts, recommendation.connectionId, recommendation.recommendedFuseA, maxAmpacityA]);

  const breakerStyles = useMemo(() => (
    [...new Set(breakerProducts.map(getFuseStyle))]
      .sort((a, b) => fuseStyleRank(a) - fuseStyleRank(b) || a.localeCompare(b))
  ), [breakerProducts]);

  const breakersForStyle = useMemo(() => (
    breakerProducts
      .filter((p) => getFuseStyle(p) === selectedBreakerStyle)
      .sort((a, b) => getFuseRating(a) - getFuseRating(b) || a.name.localeCompare(b.name))
  ), [breakerProducts, selectedBreakerStyle]);

  function selectBreakerStyle(style: string) {
    const forStyle = breakerProducts
      .filter((p) => getFuseStyle(p) === style)
      .sort((a, b) => getFuseRating(a) - getFuseRating(b) || a.name.localeCompare(b.name));
    const best = selectBestFuseProduct(forStyle, { targetA: recommendation.recommendedFuseA, maxAmpacityA });
    setSelectedBreakerStyle(style);
    setSelectedBreakerId(best?.id ?? forStyle[0]?.id ?? '');
  }

  const selectedBreakerProduct = products.get(selectedBreakerId) ?? breakersForStyle[0];

  // --- Shared display ---
  const previewProduct = isDC ? selectedHolder : selectedBreakerProduct;
  const previewImageUrl = resolveProductImageUrl(
    previewProduct ? getProductDisplayImageUrl(previewProduct) : undefined
  );

  const canConfirm = isDC
    ? Boolean(selectedHolder && selectedRatingA > 0)
    : Boolean(selectedBreakerProduct);

  function handleConfirm() {
    if (isDC) {
      if (selectedHolder) onConfirm(selectedHolder.id, selectedRatingA);
    } else {
      if (selectedBreakerProduct) onConfirm(selectedBreakerProduct.id);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal product-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="product-selector-header">
          <div>
            <div className="modal-title">{modalTitle}</div>
            <div className="product-selector-subtitle">{recommendation.message}</div>
          </div>
          <button className="product-selector-close" onClick={onCancel} title="Close">x</button>
        </div>

        <div className="product-selector-body">
          <div className="product-preview product-preview-combiner">
            {previewProduct && previewImageUrl ? (
              <img key={previewProduct.id} src={previewImageUrl} alt={previewProduct.name} className="product-preview-image" />
            ) : (
              <div className="product-preview-shape" />
            )}
          </div>

          <div className="product-selector-controls">
            {isDC ? (
              <>
                <label className="selector-field">
                  <span>{isPackFuse ? 'Pack fuse type' : 'Fuse type'}</span>
                  <select
                    className="category-select"
                    value={selectedHolderStyle}
                    onChange={(e) => selectHolderStyle(e.target.value)}
                    disabled={holderStyles.length === 0}
                  >
                    {holderStyles.map((style) => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </label>

                <label className="selector-field">
                  <span>{isPackFuse ? 'Pack fuse holder' : 'Holder'}</span>
                  <select
                    className="category-select"
                    value={selectedHolder?.id ?? ''}
                    onChange={(e) => selectHolder(e.target.value)}
                    disabled={holdersForStyle.length <= 1}
                  >
                    {holdersForStyle.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </label>

                <label className="selector-field">
                  <span>{isPackFuse ? 'Pack fuse rating' : 'Rating'}</span>
                  <select
                    className="category-select"
                    value={selectedRatingA}
                    onChange={(e) => setSelectedRatingA(Number(e.target.value))}
                    disabled={ratingsForHolder.length === 0}
                  >
                    {ratingsForHolder.map((r) => (
                      <option key={r} value={r}>{r}A</option>
                    ))}
                  </select>
                </label>

                {selectedHolder ? (
                  <div className="selected-product-summary">
                    <div className="selected-product-name">{selectedHolder.name}</div>
                    <div className="selected-product-maker">{selectedHolder.manufacturer}</div>
                    <div className="selected-product-specs">
                      {selectedRatingA}A fuse · max {maxForHolder}A
                      {recommendation.recommendedCableAwg ? ` / ${recommendation.recommendedCableAwg} AWG` : ''}
                    </div>
                    {isPackFuse && (
                      <div className="selected-product-description">
                        Install on the combined positive takeoff after the paralleled battery posts.
                      </div>
                    )}
                    {selectedHolder.description && (
                      <div className="selected-product-description">{selectedHolder.description}</div>
                    )}
                    <div className="selected-product-price">{fmt(selectedHolder.msrpUsd ?? null)}</div>
                  </div>
                ) : (
                  <div className="selected-product-summary">
                    <div className="selected-product-name">No fuse holders available</div>
                    <div className="selected-product-description">
                      The catalog does not have a compatible fuse holder for this branch.
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <label className="selector-field">
                  <span>Breaker type</span>
                  <select
                    className="category-select"
                    value={selectedBreakerStyle}
                    onChange={(e) => selectBreakerStyle(e.target.value)}
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
                    value={selectedBreakerProduct?.id ?? ''}
                    onChange={(e) => setSelectedBreakerId(e.target.value)}
                    disabled={breakersForStyle.length === 0}
                  >
                    {breakersForStyle.map((p) => (
                      <option key={p.id} value={p.id}>{getFuseRating(p)}A</option>
                    ))}
                  </select>
                </label>

                {selectedBreakerProduct ? (
                  <div className="selected-product-summary">
                    <div className="selected-product-name">{selectedBreakerProduct.name}</div>
                    <div className="selected-product-maker">{selectedBreakerProduct.manufacturer}</div>
                    <div className="selected-product-specs">
                      Recommended {recommendation.recommendedFuseA ?? getFuseRating(selectedBreakerProduct)}A
                      {recommendation.recommendedCableAwg ? ` / ${recommendation.recommendedCableAwg} AWG` : ''}
                    </div>
                    {selectedBreakerProduct.description && (
                      <div className="selected-product-description">{selectedBreakerProduct.description}</div>
                    )}
                    <div className="selected-product-price">{fmt(selectedBreakerProduct.msrpUsd ?? null)}</div>
                  </div>
                ) : (
                  <div className="selected-product-summary">
                    <div className="selected-product-name">No breakers available</div>
                    <div className="selected-product-description">
                      The catalog does not have a compatible breaker for this branch.
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="product-selector-actions">
          <button className="btn-cancel-small" onClick={onCancel}>Cancel</button>
          <button className="btn-add" onClick={handleConfirm} disabled={!canConfirm}>Insert</button>
        </div>
      </div>
    </div>
  );
}
