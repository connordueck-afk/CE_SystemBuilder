import type { SystemShapeAnnotation } from '../../types/system';

interface Props {
  annotation: SystemShapeAnnotation;
  onUpdate: (id: string, patch: Partial<SystemShapeAnnotation>) => void;
  onRemove: (id: string) => void;
}

function NumberField({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="annotation-field">
      <span>{label}</span>
      <input
        type="number"
        className="inspector-input"
        min={min}
        value={Math.round(value)}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (Number.isFinite(next)) onChange(Math.max(min, next));
        }}
      />
    </label>
  );
}

function shapeLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function ShapeAnnotationInspector({ annotation, onUpdate, onRemove }: Props) {
  const showFill = annotation.showFill !== false;

  return (
    <div className="inspector-content">
      <div className="inspector-section">
        <div className="inspector-label">Shape</div>
        <div style={{ color: 'var(--ink)', fontSize: 14, fontWeight: 700 }}>
          {shapeLabel(annotation.shapeType)}
        </div>
      </div>

      <div className="inspector-section">
        <div className="inspector-label">Style</div>
        <div className="annotation-grid">
          <label className="annotation-field">
            <span>Stroke</span>
            <input
              type="color"
              value={annotation.strokeColor}
              onChange={(e) => onUpdate(annotation.id, { strokeColor: e.target.value })}
            />
          </label>
          <label className="annotation-field">
            <span>Fill</span>
            <input
              type="color"
              value={annotation.fillColor ?? '#ffffff'}
              disabled={!showFill || annotation.shapeType === 'arrow'}
              onChange={(e) => onUpdate(annotation.id, { fillColor: e.target.value })}
            />
          </label>
          <NumberField
            label="Line"
            value={annotation.strokeWidth ?? 2}
            min={1}
            onChange={(strokeWidth) => onUpdate(annotation.id, { strokeWidth })}
          />
        </div>

        {annotation.shapeType !== 'arrow' && (
          <div className="annotation-button-row">
            <button
              type="button"
              className={`annotation-toggle annotation-toggle-wide${showFill ? ' annotation-toggle-active' : ''}`}
              onClick={() => onUpdate(annotation.id, { showFill: !showFill })}
            >
              Fill
            </button>
          </div>
        )}
      </div>

      <div className="inspector-section">
        <div className="inspector-label">Size</div>
        <div className="annotation-grid">
          <NumberField
            label="Width"
            value={annotation.width}
            min={24}
            onChange={(width) => onUpdate(annotation.id, { width })}
          />
          <NumberField
            label="Height"
            value={annotation.height}
            min={24}
            onChange={(height) => onUpdate(annotation.id, { height })}
          />
        </div>
      </div>

      <button className="btn-remove" onClick={() => onRemove(annotation.id)}>
        Remove Shape
      </button>
    </div>
  );
}

