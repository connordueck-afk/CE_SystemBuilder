import { useState } from 'react';
import type { SystemTextAnnotation } from '../../types/system';

interface Point {
  x: number;
  y: number;
}

interface DragState {
  mode: 'move' | 'resize';
  pointerId: number;
  startMouse: Point;
  startAnnotation: SystemTextAnnotation;
}

interface Props {
  annotation: SystemTextAnnotation;
  selected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
}

function svgCoords(e: React.PointerEvent<SVGElement>): Point {
  const svg = e.currentTarget.ownerSVGElement;
  if (!svg) return { x: 0, y: 0 };
  const point = svg.createSVGPoint();
  point.x = e.clientX;
  point.y = e.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  return point.matrixTransform(ctm.inverse());
}

export function TextAnnotationNode({
  annotation,
  selected,
  onSelect,
  onMove,
  onResize,
}: Props) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const background = annotation.showBackground === false
    ? 'transparent'
    : annotation.backgroundColor || '#ffffff';

  const handlePointerMove = (e: React.PointerEvent<SVGElement>) => {
    if (!drag || drag.pointerId !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();

    const pos = svgCoords(e);
    const dx = pos.x - drag.startMouse.x;
    const dy = pos.y - drag.startMouse.y;

    if (drag.mode === 'move') {
      onMove(annotation.id, drag.startAnnotation.x + dx, drag.startAnnotation.y + dy);
      return;
    }

    onResize(
      annotation.id,
      Math.max(60, drag.startAnnotation.width + dx),
      Math.max(32, drag.startAnnotation.height + dy)
    );
  };

  const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
    if (!drag || drag.pointerId !== e.pointerId) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDrag(null);
  };

  return (
    <g
      transform={`translate(${annotation.x} ${annotation.y})`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(annotation.id);
      }}
    >
      <foreignObject
        x={0}
        y={0}
        width={annotation.width}
        height={annotation.height}
        style={{ overflow: 'visible' }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.setPointerCapture(e.pointerId);
          onSelect(annotation.id);
          setDrag({
            mode: 'move',
            pointerId: e.pointerId,
            startMouse: svgCoords(e),
            startAnnotation: annotation,
          });
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className={`text-annotation-box${selected ? ' text-annotation-box-selected' : ''}`}
          style={{
            width: annotation.width,
            height: annotation.height,
            color: annotation.color,
            background,
            fontSize: annotation.fontSize,
            fontWeight: annotation.bold ? 700 : 500,
            fontStyle: annotation.italic ? 'italic' : 'normal',
            textAlign: annotation.textAlign ?? 'left',
          }}
        >
          {annotation.text}
        </div>
      </foreignObject>

      {selected && (
        <>
          <rect
            x={0}
            y={0}
            width={annotation.width}
            height={annotation.height}
            fill="none"
            stroke="#1769d2"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            pointerEvents="none"
          />
          <rect
            x={annotation.width - 8}
            y={annotation.height - 8}
            width={12}
            height={12}
            rx={2}
            fill="#1769d2"
            stroke="#ffffff"
            strokeWidth={1.5}
            style={{ cursor: 'nwse-resize' }}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.setPointerCapture(e.pointerId);
              onSelect(annotation.id);
              setDrag({
                mode: 'resize',
                pointerId: e.pointerId,
                startMouse: svgCoords(e),
                startAnnotation: annotation,
              });
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        </>
      )}
    </g>
  );
}
