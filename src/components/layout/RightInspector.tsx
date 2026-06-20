import type {
  SystemComponent,
  SystemConnection,
  Product,
  SystemWarning,
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
  onUpdateLabel: (id: string, label: string) => void;
  onUpdatePrice: (id: string, price: number | undefined) => void;
  onUpdateInstanceVoltage: (id: string, voltageV: number | undefined) => void;
  onUpdateInstanceMaxCurrent: (id: string, currentA: number | undefined) => void;
  onUpdateBusPolarity: (id: string, busPolarity: SystemComponent['busPolarity']) => void;
  onUpdateSolarWiringMode: (id: string, mode: SolarWiringMode) => void;
  onUpdateSolarConfiguration: (id: string, seriesCount: number, parallelCount: number) => void;
  onUpdateConnectionLength: (id: string, ft: number) => void;
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
  onUpdateLabel,
  onUpdatePrice,
  onUpdateInstanceVoltage,
  onUpdateInstanceMaxCurrent,
  onUpdateBusPolarity,
  onUpdateSolarWiringMode,
  onUpdateSolarConfiguration,
  onUpdateConnectionLength,
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

  return (
    <aside className="right-inspector">
      <div className="sidebar-title">
        {selectedComponent
          ? 'Component'
          : selectedConnection
          ? 'Connection'
          : selectedAnnotation
          ? 'Text'
          : 'Inspector'}
      </div>

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
            onUpdateLabel={onUpdateLabel}
            onUpdatePrice={onUpdatePrice}
            onUpdateInstanceVoltage={onUpdateInstanceVoltage}
            onUpdateInstanceMaxCurrent={onUpdateInstanceMaxCurrent}
            onUpdateBusPolarity={onUpdateBusPolarity}
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
    </aside>
  );
}
