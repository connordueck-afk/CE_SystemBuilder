import type { NominalVoltage, SystemComponent, Product, ShapeAnnotationType } from '../../types/system';
import { PartLibrary } from '../parts/PartLibrary';
import { IconPanelLeftClose, IconPanelLeftOpen } from '../icons';

interface SourceLoadOptions {
  voltageV?: number;
  maxCurrentA?: number;
}

interface Props {
  systemVoltage: NominalVoltage | 'all';
  onAddProduct: (productId: string, options?: SourceLoadOptions) => void;
  onAddTextAnnotation: () => void;
  onAddShapeAnnotation: (shapeType: ShapeAnnotationType) => void;
  components: SystemComponent[];
  products: Map<string, Product>;
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onRemoveComponent: (id: string) => void;
  detailMode: boolean;
  onToggleDetailMode: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  debugMode?: boolean;
}

export function LeftPartSidebar({
  systemVoltage,
  onAddProduct,
  onAddTextAnnotation,
  onAddShapeAnnotation,
  components,
  products,
  selectedComponentId,
  onSelectComponent,
  onRemoveComponent,
  detailMode,
  collapsed,
  onToggleCollapsed,
  debugMode,
}: Props) {
  return (
    <aside className={`left-sidebar${detailMode ? ' left-sidebar-detailed' : ''}${collapsed ? ' left-sidebar-collapsed' : ''}`}>
      <div className="sidebar-title sidebar-title-with-action">
        {!collapsed && <span>Components</span>}
        <button
          className="sidebar-collapse-toggle"
          onClick={onToggleCollapsed}
          title={collapsed ? 'Expand components' : 'Collapse components'}
        >
          {collapsed ? <IconPanelLeftOpen size={16} /> : <IconPanelLeftClose size={16} />}
        </button>
      </div>
      <PartLibrary
        systemVoltage={systemVoltage}
        onAdd={(productId, options) => onAddProduct(productId, options)}
        onAddTextAnnotation={onAddTextAnnotation}
        onAddShapeAnnotation={onAddShapeAnnotation}
        components={components}
        products={products}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
        onRemoveComponent={onRemoveComponent}
        detailMode={detailMode}
        collapsed={collapsed}
        debugMode={debugMode}
        onExpandSidebar={() => {
          if (collapsed) onToggleCollapsed();
        }}
      />
    </aside>
  );
}
