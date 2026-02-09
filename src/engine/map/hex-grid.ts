import type { HexData, HexMap, HexCoord } from '@/types';
import { hexKey } from '@/types';
import { getNeighbors } from './hex-utils';

export function getHex(map: HexMap, col: number, row: number): HexData | undefined {
  return map.hexes.get(hexKey(col, row));
}

export function getHexByCoord(map: HexMap, coord: HexCoord): HexData | undefined {
  return map.hexes.get(hexKey(coord.col, coord.row));
}

export function getNeighborHexes(map: HexMap, col: number, row: number): HexData[] {
  return getNeighbors(col, row)
    .map((n) => map.hexes.get(hexKey(n.col, n.row)))
    .filter((h): h is HexData => h !== undefined);
}

export function getNeighborCoords(map: HexMap, col: number, row: number): HexCoord[] {
  return getNeighbors(col, row).filter((n) =>
    map.hexes.has(hexKey(n.col, n.row)),
  );
}

export function getAllHexes(map: HexMap): HexData[] {
  return Array.from(map.hexes.values());
}

export function getHexesByKingdom(map: HexMap, kingdom: string): HexData[] {
  return getAllHexes(map).filter((h) => h.kingdom === kingdom);
}

export function isValidHex(map: HexMap, col: number, row: number): boolean {
  return map.hexes.has(hexKey(col, row));
}
