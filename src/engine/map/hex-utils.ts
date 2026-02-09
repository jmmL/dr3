import type { HexCoord, CubeCoord } from '@/types';

/**
 * Convert offset coordinates (col, row) to cube coordinates.
 * Uses odd-column offset ("odd-q" layout).
 */
export function offsetToCube(col: number, row: number): CubeCoord {
  const q = col;
  const r = row - Math.floor((col - (col & 1)) / 2);
  const s = -q - r;
  return { q, r, s };
}

export function cubeToOffset(q: number, r: number): HexCoord {
  const col = q;
  const row = r + Math.floor((q - (q & 1)) / 2);
  return { col, row };
}

export function cubeDistance(a: CubeCoord, b: CubeCoord): number {
  return Math.max(
    Math.abs(a.q - b.q),
    Math.abs(a.r - b.r),
    Math.abs(a.s - b.s),
  );
}

export function hexDistance(a: HexCoord, b: HexCoord): number {
  const ca = offsetToCube(a.col, a.row);
  const cb = offsetToCube(b.col, b.row);
  return cubeDistance(ca, cb);
}

/**
 * Get the 6 neighboring hex coordinates for an odd-q offset grid.
 */
export function getNeighborOffsets(col: number): HexCoord[] {
  const isOddCol = col & 1;
  if (isOddCol) {
    return [
      { col: col + 1, row: 0 },   // NE → col+1, row+0
      { col: col + 1, row: 1 },   // SE → col+1, row+1
      { col: col, row: 1 },       // S  → col+0, row+1
      { col: col - 1, row: 1 },   // SW → col-1, row+1
      { col: col - 1, row: 0 },   // NW → col-1, row+0
      { col: col, row: -1 },      // N  → col+0, row-1
    ];
  } else {
    return [
      { col: col + 1, row: -1 },  // NE → col+1, row-1
      { col: col + 1, row: 0 },   // SE → col+1, row+0
      { col: col, row: 1 },       // S  → col+0, row+1
      { col: col - 1, row: 0 },   // SW → col-1, row+0
      { col: col - 1, row: -1 },  // NW → col-1, row-1
      { col: col, row: -1 },      // N  → col+0, row-1
    ];
  }
}

export function getNeighbors(col: number, row: number): HexCoord[] {
  const offsets = getNeighborOffsets(col);
  return offsets.map((o) => ({ col: o.col, row: row + o.row }));
}
