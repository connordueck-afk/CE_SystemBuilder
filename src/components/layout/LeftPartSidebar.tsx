import type { NominalVoltage, SystemComponent, Product } from '../../types/system';
import { PartLibrary } from '../parts/PartLibrary';

interface SourceLoadOptions {
  voltageV?: number;
  maxCurrentA?: number;
}

interface Props {
  systemVoltage: NominalVoltage;
  onAddProduct: (productId: string, options?: SourceLoadOptions) => void;
  onAddTextAnnotation: () => void;
  components: SystemComponent[];
  products: Map<string, Product>;
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onRemoveComponent: (id: string) => void;
  detailMode: boolean;
  onToggleDetailMode: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function LeftPartSidebar({
  systemVoltage,
  onAddProduct,
  onAddTextAnnotation,
  components,
  products,
  selectedComponentId,
  onSelectComponent,
  onRemoveComponent,
  detailMode,
  collapsed,
  onToggleCollapsed,
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
          {collapsed ? '>' : '<'}
        </button>
      </div>
      <PartLibrary
        systemVoltage={systemVoltage}
        onAdd={(productId, options) => onAddProduct(productId, options)}
        onAddTextAnnotation={onAddTextAnnotation}
        components={components}
        products={products}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
        onRemoveComponent={onRemoveComponent}
        detailMode={detailMode}
        collapsed={collapsed}
        onExpandSidebar={() => {
          if (collapsed) onToggleCollapsed();
        }}
      />
    </aside>
  );
}
