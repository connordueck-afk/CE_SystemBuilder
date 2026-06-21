import type {
  SystemComponent,
  SystemConnection,
  Product,
  SystemWarning,
  FuseSlotState,
  NominalVoltage,
  SolarWiringMode,
  SystemTextAnnotation,
} from '../../types/system';
import { ComponentInspector } from '../inspector/ComponentInspector';
import { ConnectionInspector } from '../inspector/ConnectionInspector';
import { TextAnnotationInspector } from '../inspector/TextAnnotationInspector';
import { WarningList } from '../inspector/WarningList';
import { findSolarArrayFeedingComponent, getEffectiveProductForComponent } from '../../utils/solarCalculations';
import type { ProtectionRecommendation } from '../../utils/protectionRecommendations';
import { recommendedFuseA } from '../../utils/electricalCalculations';

interface Props {
  selectedComponentId: string | null;
  selectedConnectionId: string | null;
  selectedAnnotationId: string | null;
  components: SystemComponent[];
  connections: SystemConnection[];
  annotations: SystemTextAnnotation[];
  products: Map<string, Product>;
  systemVoltage: NominalVoltage;
  warnings: SystemWarning[];
  protectionRecommendations: ProtectionRecommendation[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onUpdateLabel: (id: string, label: string) => void;
  onUpdatePrice: (id: string, price: number | undefined) => void;
  onUpdateIncludeInBom: (id: string, includeInBom: boolean) => void;
  onUpdateInstanceVoltage: (id: string, voltageV: number | undefined) => void;
  onUpdateInstanceMaxCurrent: (id: string, currentA: number | undefined) => void;
  onUpdateBusPolarity: (id: string, busPolarity: SystemComponent['busPolarity']) => void;
  onUpdateFuseSlot: (id: string, slotId: string, patch: FuseSlotState) => void;
  onChangeComponentProduct: (id: string, productId: string) => void;
  onUpdateSolarWiringMode: (id: string, mode: SolarWiringMode) => void;
  onUpdateSolarConfiguration: (id: string, seriesCount: number, parallelCount: number) => void;
  onUpdateConnectionLength: (id: string, ft: number) => void;
  onUpdateConnectionDesignCurrent: (id: string, currentA: number | undefined) => void;
  onUpdateConnectionCableAwg: (id: string, awg: string) => void;
  onAutoConnectionCableAwg: (id: string) => void;
  onResetConnectionRoute: (id: string) => void;
  onUpdateAnnotation: (id: string, patch: Partial<SystemTextAnnotation>) => void;
  onRemoveComponent: (id: string) => void;
  onRemoveConnection: (id: string) => void;
  onRemoveAnnotation: (id: string) => void;
  onSelectComponent: (id: string) => void;
  onSelectConnection: (id: string) => void;
}

export function RightInspector({
  selectedComponentId,
  selectedConnectionId,
  selectedAnnotationId,
  components,
  connections,
  annotations,
  products,
  systemVoltage,
  warnings,
  protectionRecommendations,
  collapsed,
  onToggleCollapsed,
  onUpdateLabel,
  onUpdatePrice,
  onUpdateIncludeInBom,
  onUpdateInstanceVoltage,
  onUpdateInstanceMaxCurrent,
  onUpdateBusPolarity,
  onUpdateFuseSlot,
  onChangeComponentProduct,
  onUpdateSolarWiringMode,
  onUpdateSolarConfiguration,
  onUpdateConnectionLength,
  onUpdateConnectionDesignCurrent,
  onUpdateConnectionCableAwg,
  onAutoConnectionCableAwg,
  onResetConnectionRoute,
  onUpdateAnnotation,
  onRemoveComponent,
  onRemoveConnection,
  onRemoveAnnotation,
  onSelectComponent,
  onSelectConnection,
}: Props) {
  const selectedComponent = components.find((c) => c.id === selectedComponentId);
  const selectedConnection = connections.find((c) => c.id === selectedConnectionId);
  const selectedAnnotation = annotations.find((annotation) => annotation.id === selectedAnnotationId);
  const selectedProduct = selectedComponent
    ? products.get(selectedComponent.productId)
    : undefined;
  const selectedSolarArray =
    selectedComponent && selectedProduct && ['solar_combiner', 'mppt'].includes(selectedProduct.productType)
      ? findSolarArrayFeedingComponent(selectedComponent.id, components, connections, products)
      : undefined;

  const fromComp = selectedConnection
    ? components.find((c) => c.id === selectedConnection.fromComponentId)
    : undefined;
  const toComp = selectedConnection
    ? components.find((c) => c.id === selectedConnection.toComponentId)
    : undefined;

  const componentWarnings = selectedComponentId
    ? warnings.filter((w) => w.componentId === selectedComponentId)
    : [];
  const connectionWarnings = selectedConnectionId
    ? warnings.filter((w) => w.connectionId === selectedConnectionId)
    : [];
  const connectionProtectionRecommendations = selectedConnectionId
    ? protectionRecommendations.filter((recommendation) => recommendation.connectionId === selectedConnectionId)
    : [];
  const visibleWarnings = selectedComponentId
    ? componentWarnings
    : selectedConnectionId
    ? connectionWarnings
    : warnings;
  const errorCount = visibleWarnings.filter((w) => w.severity === 'error').length;
  const warnCount = visibleWarnings.filter((w) => w.severity === 'warning').length;
  const infoCount = visibleWarnings.filter((w) => w.severity === 'info').length;
  const selectedType = selectedComponent
    ? 'C'
    : selectedConnection
    ? 'L'
    : selectedAnnotation
    ? 'T'
    : 'I';

  const isFuseOrBreaker = selectedProduct?.productType === 'fuse' || selectedProduct?.productType === 'breaker';
  const fuseFamily = selectedProduct?.category;
  const availableFuseProducts: Array<{ ratingA: number; productId: string }> = (isFuseOrBreaker && fuseFamily && selectedProduct)
    ? Array.from(products.values())
        .filter((p) => p.productType === selectedProduct.productType && p.category === fuseFamily && p.protectionRatings?.currentRatingA != null)
        .map((p) => ({ ratingA: p.protectionRatings!.currentRatingA, productId: p.id }))
        .sort((a, b) => a.ratingA - b.ratingA)
    : [];

  const hasFuseSizingError = isFuseOrBreaker && componentWarnings.some((w) =>
    w.code === 'FUSE_UNDER_RATED' || w.code === 'FUSE_OVER_RATED'
  );

  let autoSizedProductId: string | null = null;
  if (hasFuseSizingError && selectedComponentId && availableFuseProducts.length > 0) {
    const adjConns = connections.filter(
      (c) => c.fromComponentId === selectedComponentId || c.toComponentId === selectedComponentId
    );
    const knownCurrentConns = adjConns.filter((c) => (c.calculatedCurrentA ?? 0) > 0);
    if (knownCurrentConns.length > 0) {
      const throughCurrentA = Math.max(...knownCurrentConns.map((c) => c.calculatedCurrentA!));
      const targetA = recommendedFuseA(throughCurrentA);
      const match = availableFuseProducts.find((p) => p.ratingA >= targetA);
      autoSizedProductId = match?.productId ?? null;
    }
  }

  return (
    <aside className={`right-inspector${collapsed ? ' right-inspector-collapsed' : ''}`}>
      <div className="sidebar-title sidebar-title-with-action">
        {!collapsed && (
          <span>
            {selectedComponent
              ? 'Component'
              : selectedConnection
              ? 'Connection'
              : selectedAnnotation
              ? 'Text'
              : 'Inspector'}
          </span>
        )}
        <button
          className="sidebar-collapse-toggle"
          onClick={onToggleCollapsed}
          title={collapsed ? 'Expand inspector' : 'Collapse inspector'}
        >
          {collapsed ? '<' : '>'}
        </button>
      </div>

      {collapsed && (
        <div className="inspector-rail" aria-label="Collapsed inspector status">
          <div className="inspector-rail-icon" title="Inspector">
            {selectedType}
          </div>
          {errorCount > 0 && (
            <div className="inspector-rail-badge inspector-rail-badge-error" title={`${errorCount} errors`}>
              !
              <span>{errorCount}</span>
            </div>
          )}
          {warnCount > 0 && (
            <div className="inspector-rail-badge inspector-rail-badge-warning" title={`${warnCount} warnings`}>
              !
              <span>{warnCount}</span>
            </div>
          )}
          {infoCount > 0 && (
            <div className="inspector-rail-badge inspector-rail-badge-info" title={`${infoCount} notices`}>
              i
              <span>{infoCount}</span>
            </div>
          )}
          {visibleWarnings.length === 0 && (
            <div className="inspector-rail-badge inspector-rail-badge-ok" title="No issues detected">
              ok
            </div>
          )}
        </div>
      )}

      {!collapsed && (
        <>
      {!selectedComponent && !selectedConnection && !selectedAnnotation && (
        <div className="inspector-content">
          <div style={{ color: '#6d7b90', fontSize: 11, fontWeight: 700, marginBottom: 12 }}>
            Select a component or connection to inspect.
          </div>
          <div className="inspector-section">
            <div className="inspector-label">System Issues</div>
            <WarningList
              warnings={warnings}
              onSelectComponent={onSelectComponent}
              onSelectConnection={onSelectConnection}
            />
          </div>
        </div>
      )}

      {selectedComponent && selectedProduct && (
        <>
          {componentWarnings.length > 0 && (
            <div style={{ padding: '8px', borderBottom: '1px solid #dbe2ec' }}>
              <WarningList warnings={componentWarnings} />
            </div>
          )}
          <ComponentInspector
            component={selectedComponent}
            product={selectedProduct}
            systemVoltage={systemVoltage}
            solarArray={selectedSolarArray}
            availableFuseProducts={availableFuseProducts}
            autoSizedProductId={autoSizedProductId}
            onChangeProduct={selectedComponentId ? (pid) => onChangeComponentProduct(selectedComponentId, pid) : undefined}
            onUpdateLabel={onUpdateLabel}
            onUpdatePrice={onUpdatePrice}
            onUpdateIncludeInBom={onUpdateIncludeInBom}
            onUpdateInstanceVoltage={onUpdateInstanceVoltage}
            onUpdateInstanceMaxCurrent={onUpdateInstanceMaxCurrent}
            onUpdateBusPolarity={onUpdateBusPolarity}
            onUpdateFuseSlot={onUpdateFuseSlot}
            onUpdateSolarConfiguration={onUpdateSolarConfiguration}
            onRemove={onRemoveComponent}
          />
        </>
      )}

      {selectedConnection && (
        <>
          {connectionWarnings.length > 0 && (
            <div style={{ padding: '8px', borderBottom: '1px solid #dbe2ec' }}>
              <WarningList warnings={connectionWarnings} />
            </div>
          )}
          <ConnectionInspector
            connection={selectedConnection}
            fromComponent={fromComp}
            toComponent={toComp}
            fromProduct={fromComp ? getEffectiveProductForComponent(fromComp, products.get(fromComp.productId)) : undefined}
            toProduct={toComp ? getEffectiveProductForComponent(toComp, products.get(toComp.productId)) : undefined}
            systemVoltage={systemVoltage}
            protectionRecommendations={connectionProtectionRecommendations}
            onUpdateLength={onUpdateConnectionLength}
            onUpdateDesignCurrent={onUpdateConnectionDesignCurrent}
            onUpdateCableAwg={onUpdateConnectionCableAwg}
            onAutoCableAwg={onAutoConnectionCableAwg}
            onResetRoute={onResetConnectionRoute}
            onRemove={onRemoveConnection}
          />
        </>
      )}

      {selectedAnnotation && (
        <TextAnnotationInspector
          annotation={selectedAnnotation}
          onUpdate={onUpdateAnnotation}
          onRemove={onRemoveAnnotation}
        />
      )}
        </>
      )}
    </aside>
  );
}
