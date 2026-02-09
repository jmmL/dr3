import { useMemo } from 'react';
import type { RuntimeGameState } from '@/game/dr3-game';
import { hexKey } from '@/types';

interface HexBoardProps {
  state: RuntimeGameState;
  hexes: Array<{ col: number; row: number; terrain: string[] }>;
  currentPlayerId: string;
  selectedUnitId: string | null;
  onSelectUnit: (unitId: string) => void;
  onSelectHex: (col: number, row: number) => void;
}

const HEX_SIZE = 14;
const HEX_HEIGHT = Math.sqrt(3) * HEX_SIZE;

function hexCenter(col: number, row: number): { x: number; y: number } {
  return {
    x: col * HEX_SIZE * 1.5 + HEX_SIZE + 8,
    y: row * HEX_HEIGHT + (col % 2 === 1 ? HEX_HEIGHT / 2 : 0) + HEX_HEIGHT / 2 + 8,
  };
}

function polygonPoints(col: number, row: number): string {
  const center = hexCenter(col, row);
  const points: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    const x = center.x + HEX_SIZE * Math.cos(angle);
    const y = center.y + HEX_SIZE * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

function terrainColor(terrain: string[]): string {
  if (terrain.includes('mountain')) return '#6f7f85';
  if (terrain.includes('forest')) return '#4f7a56';
  if (terrain.includes('hill')) return '#9a8e67';
  if (terrain.includes('sea')) return '#1f5070';
  if (terrain.includes('seashore')) return '#2c6f78';
  if (terrain.includes('swamp')) return '#5c6a3a';
  if (terrain.includes('castle')) return '#8e4f37';
  return '#7f7259';
}

export default function HexBoard({
  state,
  hexes,
  currentPlayerId,
  selectedUnitId,
  onSelectUnit,
  onSelectHex,
}: HexBoardProps) {
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

  return (
    <div className="board-shell" data-testid="board-shell">
      <svg className="board-svg" viewBox="0 0 860 740" role="img" aria-label="DR3 board">
        <rect x="0" y="0" width="860" height="740" className="board-backdrop" />
        {hexes.map((hex) => {
          const key = hexKey(hex.col, hex.row);
          return (
            <polygon
              key={key}
              points={polygonPoints(hex.col, hex.row)}
              fill={terrainColor(hex.terrain)}
              className="hex"
              onClick={() => onSelectHex(hex.col, hex.row)}
            />
          );
        })}
        {Array.from(unitsByHex.entries()).map(([key, value]) => {
          const [colRaw, rowRaw] = key.split(',');
          const col = Number(colRaw);
          const row = Number(rowRaw);
          const center = hexCenter(col, row);
          const primaryUnitId = value.unitIds[0] ?? '';
          const selected = primaryUnitId === selectedUnitId;
          return (
            <g
              key={`unit-${key}`}
              className="unit-stack"
              onClick={() => onSelectUnit(primaryUnitId)}
            >
              <circle
                cx={center.x}
                cy={center.y}
                r={selected ? 8 : 6}
                className={value.friendly ? 'unit-friendly' : 'unit-hostile'}
              />
              <text x={center.x} y={center.y + 3} className="unit-label">
                {value.count}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
