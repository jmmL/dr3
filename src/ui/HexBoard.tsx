import { useMemo, useRef, useState, type MouseEvent, type WheelEvent } from 'react';
import type { RuntimeGameState } from '@/game/dr3-game';
import { hexKey } from '@/types';
import {
  mapHexCenter,
  mapHexPolygonPoints,
  MINARIA_MAP_CALIBRATION,
} from './map-calibration';

interface HexBoardProps {
  state: RuntimeGameState;
  hexes: Array<{ col: number; row: number; terrain: string[] }>;
  currentPlayerId: string;
  selectedUnitId: string | null;
  legalDestinationKeys: Set<string>;
  selectedCombatAttackerKey: string | null;
  combatTargetKeys: Set<string>;
  onSelectUnit: (unitId: string) => void;
  onSelectHex: (col: number, row: number) => void;
}

const MIN_ZOOM = 0.8;
const MAX_ZOOM = 2.5;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export default function HexBoard({
  state,
  hexes,
  currentPlayerId,
  selectedUnitId,
  legalDestinationKeys,
  selectedCombatAttackerKey,
  combatTargetKeys,
  onSelectUnit,
  onSelectHex,
}: HexBoardProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef<{ active: boolean; x: number; y: number }>({
    active: false,
    x: 0,
    y: 0,
  });

  const unitsByHex = useMemo(() => {
    const byHex = new Map<
      string,
      { count: number; friendly: boolean; unitIds: string[] }
    >();
    const playerHomeFaction = state.players[currentPlayerId]?.homeFactionId;
    for (const unit of Object.values(state.units)) {
      if (!unit.isAlive) continue;
      const key = hexKey(unit.position.col, unit.position.row);
      const entry = byHex.get(key) ?? {
        count: 0,
        friendly: unit.factionId === playerHomeFaction,
        unitIds: [],
      };
      entry.count += unit.count;
      entry.unitIds.push(unit.id);
      byHex.set(key, entry);
    }
    return byHex;
  }, [state.units, state.players, currentPlayerId]);

  function stopDrag(): void {
    dragState.current.active = false;
    setIsDragging(false);
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>): void {
    const rect = event.currentTarget.getBoundingClientRect();
    const cursorX = event.clientX - rect.left;
    const cursorY = event.clientY - rect.top;
    const factor = event.deltaY < 0 ? 1.1 : 0.9;

    setZoom((previousZoom) => {
      const nextZoom = clamp(previousZoom * factor, MIN_ZOOM, MAX_ZOOM);
      if (nextZoom === previousZoom) return previousZoom;
      const zoomRatio = nextZoom / previousZoom;
      setPan((previousPan) => ({
        x: cursorX - (cursorX - previousPan.x) * zoomRatio,
        y: cursorY - (cursorY - previousPan.y) * zoomRatio,
      }));
      return nextZoom;
    });
  }

  function handleMouseDown(event: MouseEvent<HTMLDivElement>): void {
    if (event.button !== 0) return;
    dragState.current = { active: true, x: event.clientX, y: event.clientY };
    setIsDragging(true);
  }

  function handleMouseMove(event: MouseEvent<HTMLDivElement>): void {
    if (!dragState.current.active) return;
    const deltaX = event.clientX - dragState.current.x;
    const deltaY = event.clientY - dragState.current.y;
    dragState.current = { active: true, x: event.clientX, y: event.clientY };
    setPan((previous) => ({ x: previous.x + deltaX, y: previous.y + deltaY }));
  }

  function resetView(): void {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  return (
    <div className="board-shell" data-testid="board-shell">
      <div className="board-toolbar">
        <span className="board-zoom" data-testid="board-zoom">
          Zoom {Math.round(zoom * 100)}%
        </span>
        <button type="button" onClick={resetView} className="board-reset">
          Reset View
        </button>
      </div>
      <div
        className={`board-viewport${isDragging ? ' is-dragging' : ''}`}
        data-testid="board-viewport"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <svg
          className="board-svg board-svg-map"
          data-testid="board-svg"
          viewBox={`0 0 ${MINARIA_MAP_CALIBRATION.imageWidth} ${MINARIA_MAP_CALIBRATION.imageHeight}`}
          role="img"
          aria-label="DR3 board"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          <image
            href={MINARIA_MAP_CALIBRATION.imagePath}
            x={0}
            y={0}
            width={MINARIA_MAP_CALIBRATION.imageWidth}
            height={MINARIA_MAP_CALIBRATION.imageHeight}
            className="board-image"
            preserveAspectRatio="none"
          />
          {hexes.map((hex) => {
            const key = hexKey(hex.col, hex.row);
            return (
              <polygon
                key={key}
                points={mapHexPolygonPoints(hex.col, hex.row)}
                className={`hex${legalDestinationKeys.has(key) ? ' is-legal-destination' : ''}${selectedCombatAttackerKey === key ? ' is-combat-attacker' : ''}${combatTargetKeys.has(key) ? ' is-combat-target' : ''}`}
                data-legal-destination={legalDestinationKeys.has(key) ? 'true' : 'false'}
                data-combat-target={combatTargetKeys.has(key) ? 'true' : 'false'}
                data-hex-key={key}
                onClick={() => onSelectHex(hex.col, hex.row)}
              />
            );
          })}
          {Array.from(unitsByHex.entries()).map(([key, value]) => {
            const [colRaw, rowRaw] = key.split(',');
            const col = Number(colRaw);
            const row = Number(rowRaw);
            const center = mapHexCenter(col, row);
            const primaryUnitId = value.unitIds[0] ?? '';
            const selected = primaryUnitId === selectedUnitId;
            return (
              <g
                key={`unit-${key}`}
                className={`unit-stack${selected ? ' is-selected' : ''}`}
                data-hex-key={key}
                onClick={() => {
                  if (primaryUnitId) onSelectUnit(primaryUnitId);
                }}
              >
                <circle cx={center.x} cy={center.y} r={selected ? 21 : 18} className="unit-badge-halo" />
                <circle
                  cx={center.x}
                  cy={center.y}
                  r={selected ? 15 : 13}
                  className={value.friendly ? 'unit-badge-friendly' : 'unit-badge-hostile'}
                />
                <circle cx={center.x + 14} cy={center.y + 12} r={9} className="unit-count-badge" />
                <text x={center.x + 14} y={center.y + 15} className="unit-count-label">
                  {value.count}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
