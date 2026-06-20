import type { SystemTextAnnotation } from '../../types/system';

interface Props {
  annotation: SystemTextAnnotation;
  onUpdate: (id: string, patch: Partial<SystemTextAnnotation>) => void;
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

export function TextAnnotationInspector({ annotation, onUpdate, onRemove }: Props) {
  return (
    <div className="inspector-content">
      <div className="inspector-section">
        <div className="inspector-label">Text</div>
        <textarea
          className="inspector-input annotation-textarea"
          value={annotation.text}
          onChange={(e) => onUpdate(annotation.id, { text: e.target.value })}
        />
      </div>

      <div className="inspector-section">
        <div className="inspector-label">Format</div>
        <div className="annotation-grid">
          <NumberField
            label="Size"
            value={annotation.fontSize}
            min={8}
            onChange={(fontSize) => onUpdate(annotation.id, { fontSize })}
          />
          <label className="annotation-field">
            <span>Color</span>
            <input
              type="color"
              value={annotation.color}
              onChange={(e) => onUpdate(annotation.id, { color: e.target.value })}
            />
          </label>
          <label className="annotation-field">
            <span>Fill</span>
            <input
              type="color"
              value={annotation.backgroundColor || '#ffffff'}
              onChange={(e) => onUpdate(annotation.id, { backgroundColor: e.target.value })}
            />
          </label>
        </div>

        <div className="annotation-button-row">
          <button
            type="button"
            className={`annotation-toggle${annotation.bold ? ' annotation-toggle-active' : ''}`}
            onClick={() => onUpdate(annotation.id, { bold: !annotation.bold })}
          >
            B
          </button>
          <button
            type="button"
            className={`annotation-toggle${annotation.italic ? ' annotation-toggle-active' : ''}`}
            onClick={() => onUpdate(annotation.id, { italic: !annotation.italic })}
          >
            I
          </button>
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              type="button"
              className={`annotation-toggle${(annotation.textAlign ?? 'left') === align ? ' annotation-toggle-active' : ''}`}
              onClick={() => onUpdate(annotation.id, { textAlign: align })}
            >
              {align[0].toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="inspector-section">
        <div className="inspector-label">Box</div>
        <div className="annotation-grid">
          <NumberField
            label="Width"
            value={annotation.width}
            min={60}
            onChange={(width) => onUpdate(annotation.id, { width })}
          />
          <NumberField
            label="Height"
            value={annotation.height}
            min={32}
            onChange={(height) => onUpdate(annotation.id, { height })}
          />
        </div>
      </div>

      <button className="btn-remove" onClick={() => onRemove(annotation.id)}>
        Remove Text Box
      </button>
    </div>
  );
}
