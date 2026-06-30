import type {
  BuilderIssue,
  SystemComponent,
  SystemConnection,
  Product,
  FuseSlotState,
  NominalVoltage,
  CustomSolarArrayRatings,
  SystemDiagramAnnotation,
  SystemTextAnnotation,
  SystemShapeAnnotation,
  CableMode,
  DcSourceType,
  AcSourceType,
} from '../../types/system';
import { ComponentInspector } from '../inspector/ComponentInspector';
import { ConnectionInspector } from '../inspector/ConnectionInspector';
import { TextAnnotationInspector } from '../inspector/TextAnnotationInspector';
import { ShapeAnnotationInspector } from '../inspector/ShapeAnnotationInspector';
import { WarningList } from '../inspector/WarningList';
import { findSolarArrayFeedingComponent, getEffectiveProductForComponent } from '../../utils/solarCalculations';
import type { ProtectionRecommendation } from '../../utils/protectionRecommendations';
import { selectBestFuseProduct, ampacityForAwg } from '../../utils/fuseSelection';

interface Props {
  selectedComponentId: string | null;
  selectedConnectionId: string | null;
  selectedAnnotationId: string | null;
  components: SystemComponent[];
  connections: SystemConnection[];
  annotations: SystemDiagramAnnotation[];
  products: Map<string, Product>;
  systemVoltage: NominalVoltage;
  issues: BuilderIssue[];
  protectionRecommendations: ProtectionRecommendation[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onUpdateLabel: (id: string, label: string) => void;
  onUpdatePrice: (id: string, price: number | undefined) => void;
  onUpdateIncludeInBom: (id: string, includeInBom: boolean) => void;
  onUpdateFuseHolder: (id: string, includeFuseHolder: boolean, fuseHolderProductId?: string) => void;
  onUpdateInstanceVoltage: (id: string, voltageV: number | undefined) => void;
  onUpdateDcBusNominalVoltage: (id: string, voltageV: number | undefined) => void;
  onUpdateInstanceMaxCurrent: (id: string, currentA: number | undefined) => void;
  onUpdateComponentMaxCableAwg: (id: string, awg: string | undefined) => void;
  onUpdateComponentImageScale: (id: string, scale: number) => void;
  onUpdateBusPolarity: (id: string, busPolarity: SystemComponent['busPolarity']) => void;
  onUpdateFuseSlot: (id: string, slotId: string, patch: FuseSlotState) => void;
  onChangeComponentProduct: (id: string, productId: string) => void;
  onUpdateCustomSolarArrayRatings: (id: string, ratings: CustomSolarArrayRatings) => void;
  onUpdateConnectionLength: (id: string, ft: number) => void;
  onToggleConnectionBusLink: (id: string, busLink: boolean) => void;
  onUpdateConnectionDesignCurrent: (id: string, currentA: number | undefined) => void;
  onUpdateConnectionCableAwg: (id: string, awg: string) => void;
  onAutoConnectionCableAwg: (id: string) => void;
  onUpdateConnectionCableColor: (id: string, color: string) => void;
  onUpdateConnectionCableType: (id: string, type: string) => void;
  onUpdateConnectionCableMode: (id: string, mode: CableMode) => void;
  onUpdateConnectionPremanufacturedCable: (id: string, cableId: string | undefined) => void;
  onUpdateConfiguredProtocol: (componentId: string, portId: string, protocol: import('../../types/system').CommunicationProtocol | undefined) => void;
  onUpdateSourceType: (id: string, sourceType: DcSourceType | AcSourceType | undefined) => void;
  onResetConnectionRoute: (id: string) => void;
  onUpdateTextAnnotation: (id: string, patch: Partial<SystemTextAnnotation>) => void;
  onUpdateShapeAnnotation: (id: string, patch: Partial<SystemShapeAnnotation>) => void;
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
  issues,
  protectionRecommendations,
  collapsed,
  onToggleCollapsed,
  onUpdateLabel,
  onUpdatePrice,
  onUpdateIncludeInBom,
  onUpdateFuseHolder,
  onUpdateInstanceVoltage,
  onUpdateDcBusNominalVoltage,
  onUpdateInstanceMaxCurrent,
  onUpdateComponentMaxCableAwg,
  onUpdateComponentImageScale,
  onUpdateBusPolarity,
  onUpdateFuseSlot,
  onChangeComponentProduct,
  onUpdateCustomSolarArrayRatings,
  onUpdateConnectionLength,
  onToggleConnectionBusLink,
  onUpdateConnectionDesignCurrent,
  onUpdateConnectionCableAwg,
  onAutoConnectionCableAwg,
  onUpdateConnectionCableColor,
  onUpdateConnectionCableType,
  onUpdateConnectionCableMode,
  onUpdateConnectionPremanufacturedCable,
  onUpdateConfiguredProtocol,
  onUpdateSourceType,
  onResetConnectionRoute,
  onUpdateTextAnnotation,
  onUpdateShapeAnnotation,
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

  const componentIssues = selectedComponentId
    ? issues.filter((issue) => issue.componentId === selectedComponentId)
    : [];
  const connectionIssues = selectedConnectionId
    ? issues.filter((issue) => issue.connectionId === selectedConnectionId)
    : [];
  const connectionProtectionRecommendations = selectedConnectionId
    ? protectionRecommendations.filter((recommendation) => recommendation.connectionId === selectedConnectionId)
    : [];
  const visibleIssues = selectedComponentId
    ? componentIssues
    : selectedConnectionId
    ? connectionIssues
    : issues;
  const errorCount = visibleIssues.filter((issue) => issue.severity === 'error').length;
  const warnCount = visibleIssues.filter((issue) => issue.severity === 'warning').length;
  const infoCount = visibleIssues.filter((issue) => issue.severity === 'info').length;
  const selectedType = selectedComponent
    ? 'C'
    : selectedConnection
    ? 'L'
    : selectedAnnotation
    ? selectedAnnotation.kind === 'shape' ? 'S' : 'T'
    : 'I';

  const isFuseOrBreaker = selectedProduct?.productType === 'fuse' || selectedProduct?.productType === 'breaker';
  const fuseFamily = selectedProduct?.category;
  // The Rating dropdown only changes the rating WITHIN the currently selected
  // fuse family. A family is uniquely identified by category + manufacturer +
  // voltage rating (e.g. "Littelfuse MEGA 58V" vs "Littelfuse MEGA 125V"). If we
  // keyed on category alone, every MEGA family would pool together and ratings
  // shared across families (e.g. 100 A) would appear as duplicate menu entries.
  const availableFuseProducts: Array<{ ratingA: number; productId: string }> = (isFuseOrBreaker && fuseFamily && selectedProduct)
    ? (() => {
        const seenRatings = new Set<number>();
        return Array.from(products.values())
          .filter((p) =>
            p.productType === selectedProduct.productType &&
            p.category === fuseFamily &&
            p.manufacturer === selectedProduct.manufacturer &&
            p.protectionRatings?.voltageRatingV === selectedProduct.protectionRatings?.voltageRatingV &&
            p.protectionRatings?.currentRatingA != null
          )
          .map((p) => ({ ratingA: p.protectionRatings!.currentRatingA, productId: p.id }))
          .sort((a, b) => a.ratingA - b.ratingA)
          .filter(({ ratingA }) => (seenRatings.has(ratingA) ? false : (seenRatings.add(ratingA), true)));
      })()
    : [];

  const hasFuseSizingError = isFuseOrBreaker && componentIssues.some((issue) =>
    issue.code === 'FUSE_UNDER_RATED' || issue.code === 'FUSE_OVER_RATED'
  );

  let autoSizedProductId: string | null = null;
  if (hasFuseSizingError && selectedComponentId && availableFuseProducts.length > 0) {
    const adjConns = connections.filter(
      (c) => c.fromComponentId === selectedComponentId || c.toComponentId === selectedComponentId
    );
    // Use the circuit engine's already ampacity-capped recommendation as the target,
    // and never let the auto-sized part exceed the smallest adjacent cable ampacity
    // (the cable-protection invariant). Both come straight from circuitAnalysis output.
    const targetA = Math.max(0, ...adjConns.map((c) => c.recommendedFuseA ?? 0)) || undefined;
    const adjacentAmpacities = adjConns
      .map((c) => ampacityForAwg(c.manualCableAwg ?? c.recommendedCableAwg))
      .filter((a): a is number => a != null);
    const maxAmpacityA = adjacentAmpacities.length > 0 ? Math.min(...adjacentAmpacities) : undefined;

    const candidates = availableFuseProducts
      .map((p) => products.get(p.productId))
      .filter((p): p is Product => p != null);
    const best = selectBestFuseProduct(candidates, { targetA, maxAmpacityA });
    autoSizedProductId = best?.id ?? null;
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
              ? selectedAnnotation.kind === 'shape' ? 'Shape' : 'Text'
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
          {visibleIssues.length === 0 && (
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
          <div style={{ color: '#6d7b90', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
            Select a component or connection to inspect.
          </div>
          <div className="inspector-section">
            <div className="inspector-label">System Issues</div>
            <WarningList
              issues={issues}
              onSelectComponent={onSelectComponent}
              onSelectConnection={onSelectConnection}
            />
          </div>
        </div>
      )}

      {selectedComponent && selectedProduct && (
        <>
          <div style={{ padding: '8px 16px 8px 8px', borderBottom: '1px solid #dbe2ec' }}>
            <div style={{ color: '#6d7b90', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Issues</div>
            <WarningList issues={componentIssues} />
          </div>
          <ComponentInspector
            component={selectedComponent}
            product={selectedProduct}
            products={products}
            systemVoltage={systemVoltage}
            solarArray={selectedSolarArray}
            availableFuseProducts={availableFuseProducts}
            autoSizedProductId={autoSizedProductId}
            onChangeProduct={selectedComponentId ? (pid) => onChangeComponentProduct(selectedComponentId, pid) : undefined}
            onUpdateLabel={onUpdateLabel}
            onUpdatePrice={onUpdatePrice}
            onUpdateIncludeInBom={onUpdateIncludeInBom}
            onUpdateFuseHolder={onUpdateFuseHolder}
            onUpdateInstanceVoltage={onUpdateInstanceVoltage}
            onUpdateDcBusNominalVoltage={onUpdateDcBusNominalVoltage}
            onUpdateInstanceMaxCurrent={onUpdateInstanceMaxCurrent}
            onUpdateComponentMaxCableAwg={onUpdateComponentMaxCableAwg}
            onUpdateComponentImageScale={onUpdateComponentImageScale}
            onUpdateBusPolarity={onUpdateBusPolarity}
            onUpdateFuseSlot={onUpdateFuseSlot}
            onUpdateCustomSolarArrayRatings={onUpdateCustomSolarArrayRatings}
            onUpdateConfiguredProtocol={onUpdateConfiguredProtocol}
            onUpdateSourceType={onUpdateSourceType}
            onRemove={onRemoveComponent}
          />
        </>
      )}

      {selectedConnection && (
        <>
          <div style={{ padding: '8px 16px 8px 8px', borderBottom: '1px solid #dbe2ec' }}>
            <div style={{ color: '#6d7b90', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Issues</div>
            <WarningList issues={connectionIssues} />
          </div>
          <ConnectionInspector
            connection={selectedConnection}
            fromComponent={fromComp}
            toComponent={toComp}
            fromProduct={fromComp ? getEffectiveProductForComponent(fromComp, products.get(fromComp.productId)) : undefined}
            toProduct={toComp ? getEffectiveProductForComponent(toComp, products.get(toComp.productId)) : undefined}
            systemVoltage={systemVoltage}
            protectionRecommendations={connectionProtectionRecommendations}
            onUpdateLength={onUpdateConnectionLength}
            onToggleBusLink={onToggleConnectionBusLink}
            onUpdateDesignCurrent={onUpdateConnectionDesignCurrent}
            onUpdateCableAwg={onUpdateConnectionCableAwg}
            onAutoCableAwg={onAutoConnectionCableAwg}
            onUpdateCableColor={onUpdateConnectionCableColor}
            onUpdateCableType={onUpdateConnectionCableType}
            onUpdateCableMode={onUpdateConnectionCableMode}
            onUpdatePremanufacturedCable={onUpdateConnectionPremanufacturedCable}
            onResetRoute={onResetConnectionRoute}
            onRemove={onRemoveConnection}
          />
        </>
      )}

      {selectedAnnotation?.kind === 'text' && (
        <TextAnnotationInspector
          annotation={selectedAnnotation}
          onUpdate={onUpdateTextAnnotation}
          onRemove={onRemoveAnnotation}
        />
      )}

      {selectedAnnotation?.kind === 'shape' && (
        <ShapeAnnotationInspector
          annotation={selectedAnnotation}
          onUpdate={onUpdateShapeAnnotation}
          onRemove={onRemoveAnnotation}
        />
      )}
        </>
      )}
    </aside>
  );
}
