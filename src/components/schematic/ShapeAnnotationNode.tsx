import { useState } from 'react';
import type { SystemShapeAnnotation } from '../../types/system';

interface Point {
  x: number;
  y: number;
}

interface DragState {
  mode: 'move' | 'resize';
  pointerId: number;
  startMouse: Point;
  startAnnotation: SystemShapeAnnotation;
}

interface Props {
  annotation: SystemShapeAnnotation;
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

export function ShapeAnnotationNode({
  annotation,
  selected,
  onSelect,
  onMove,
  onResize,
}: Props) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const strokeWidth = annotation.strokeWidth ?? 2;
  const fill = annotation.showFill === false ? 'transparent' : annotation.fillColor ?? '#ffffff';
  const markerId = `arrowhead-${annotation.id}`;

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
      Math.max(24, drag.startAnnotation.width + dx),
      Math.max(24, drag.startAnnotation.height + dy)
    );
  };

  const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
    if (!drag || drag.pointerId !== e.pointerId) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDrag(null);
  };

  const startDrag = (mode: DragState['mode'], e: React.PointerEvent<SVGElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    onSelect(annotation.id);
    setDrag({
      mode,
      pointerId: e.pointerId,
      startMouse: svgCoords(e),
      startAnnotation: annotation,
    });
  };

  return (
    <g
      transform={`translate(${annotation.x} ${annotation.y})`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(annotation.id);
      }}
      onPointerDown={(e) => startDrag('move', e)}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ cursor: 'grab' }}
    >
      {annotation.shapeType === 'arrow' && (
        <defs>
          <marker
            id={markerId}
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M 0 0 L 8 4 L 0 8 z" fill={annotation.strokeColor} />
          </marker>
        </defs>
      )}

      {annotation.shapeType === 'rectangle' && (
        <rect
          x={0}
          y={0}
          width={annotation.width}
          height={annotation.height}
          fill={fill}
          stroke={annotation.strokeColor}
          strokeWidth={strokeWidth}
        />
      )}

      {annotation.shapeType === 'circle' && (
        <ellipse
          cx={annotation.width / 2}
          cy={annotation.height / 2}
          rx={annotation.width / 2}
          ry={annotation.height / 2}
          fill={fill}
          stroke={annotation.strokeColor}
          strokeWidth={strokeWidth}
        />
      )}

      {annotation.shapeType === 'triangle' && (
        <polygon
          points={`${annotation.width / 2},0 ${annotation.width},${annotation.height} 0,${annotation.height}`}
          fill={fill}
          stroke={annotation.strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      )}

      {annotation.shapeType === 'arrow' && (
        <line
          x1={0}
          y1={annotation.height / 2}
          x2={annotation.width}
          y2={annotation.height / 2}
          stroke={annotation.strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          markerEnd={`url(#${markerId})`}
        />
      )}

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
            onPointerDown={(e) => startDrag('resize', e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        </>
      )}
    </g>
  );
}
