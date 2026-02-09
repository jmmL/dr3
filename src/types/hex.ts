export type TerrainType =
  | 'clear'
  | 'forest'
  | 'hill'
  | 'mountain'
  | 'mountain_pass'
  | 'swamp'
  | 'sea'
  | 'seashore'
  | 'lakeshore'
  | 'lake'
  | 'major_river'
  | 'minor_river'
  | 'port'
  | 'castle'
  | 'royal'
  | 'scenic'
  | 'ancient_battlefield';

export interface HexCoord {
  col: number;
  row: number;
}

export interface CubeCoord {
  q: number;
  r: number;
  s: number;
}

export interface HexData {
  col: number;
  row: number;
  terrain: TerrainType[];
  name?: string;
  kingdom?: string;
  intrinsicDefense?: number;
  cityId?: string;
}

export interface HexMap {
  cols: number;
  rows: number;
  hexes: Map<string, HexData>;
}

export function hexKey(col: number, row: number): string {
  return `${col},${row}`;
}

export function hexKeyFromCoord(coord: HexCoord): string {
  return `${coord.col},${coord.row}`;
}
