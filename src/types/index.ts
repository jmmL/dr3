/**
 * Terrain type flags - can be combined with bitwise OR
 */
export const TerrainFlags = {
  CLEAR: 0,
  FOREST: 0x0001,
  HILL: 0x0002,
  MOUNTAIN: 0x0004,
  PASS: 0x0008,
  SWAMP: 0x0010,
  RIVER: 0x0020,
  LAKE: 0x0040,
  LAKESHORE: 0x0080,
  SEA: 0x0100,
  SEASHORE: 0x0200,
  CASTLE: 0x0400,
  PORT: 0x0800,
  SCENIC: 0x1000,
  ANCIENT_BATTLEFIELD: 0x2000,
  ROYAL: 0x4000,
} as const

/**
 * Kingdom identifiers matching rulebook
 */
export type KingdomId =
  | 'neuth'
  | 'hothior'
  | 'mivior'
  | 'muetar'
  | 'shucassam'
  | 'immer'
  | 'pon'
  | 'rombune'
  | 'zorn'
  | 'ghem'
  | 'trolls'
  | 'eaters'
  | 'blackhand'
  | null

/**
 * Kingdom display colors from rulebook
 */
export const KingdomColors: Record<string, string> = {
  neuth: '#228B22',     // Forest green (Elves)
  hothior: '#8B4513',   // Saddle brown
  mivior: '#4169E1',    // Royal blue
  muetar: '#FFD700',    // Gold/Yellow
  shucassam: '#DAA520', // Goldenrod
  immer: '#800080',     // Purple
  pon: '#DC143C',       // Crimson red
  rombune: '#2F4F4F',   // Dark slate gray
  zorn: '#8B0000',      // Dark red (Goblins)
  ghem: '#A0522D',      // Sienna (Dwarves)
  trolls: '#556B2F',    // Dark olive green
  eaters: '#E6E6FA',    // Lavender (Magicians)
  blackhand: '#1C1C1C', // Near black (Magicians)
}

/**
 * Terrain display colors
 */
export const TerrainColors: Record<string, string> = {
  clear: '#90EE90',       // Light green
  forest: '#228B22',      // Forest green
  hill: '#DEB887',        // Burlywood
  mountain: '#808080',    // Gray
  pass: '#A9A9A9',        // Dark gray
  swamp: '#556B2F',       // Dark olive
  river: '#4682B4',       // Steel blue
  lake: '#4169E1',        // Royal blue
  lakeshore: '#87CEEB',   // Sky blue
  sea: '#000080',         // Navy
  seashore: '#F0E68C',    // Khaki/sand
  scenic: '#FFB6C1',      // Light pink
  battlefield: '#8B4513', // Saddle brown
}

/**
 * Static hex data from the map
 */
export interface HexData {
  /** Column coordinate (0-34) */
  col: number
  /** Row coordinate (0-30) */
  row: number
  /** Optional name for castles, scenic hexes, etc */
  name: string | null
  /** Terrain type flags (bitfield) */
  terrain: number
  /** Owning kingdom ID */
  kingdom: KingdomId
  /** Intrinsic defense strength for castles (0-6) */
  intrinsic: number
}

/**
 * Hex coordinate as string key "col,row"
 */
export type HexKey = string

/**
 * Convert column and row to hex key
 */
export function toHexKey(col: number, row: number): HexKey {
  return `${col},${row}`
}

/**
 * Parse hex key back to coordinates
 */
export function fromHexKey(key: HexKey): { col: number; row: number } {
  const [col, row] = key.split(',').map(Number)
  return { col, row }
}

/**
 * Check if terrain has a specific flag
 */
export function hasTerrain(terrain: number, flag: number): boolean {
  return (terrain & flag) !== 0
}

/**
 * Get the primary terrain type for display color
 */
export function getPrimaryTerrain(terrain: number): string {
  if (hasTerrain(terrain, TerrainFlags.SEA)) return 'sea'
  if (hasTerrain(terrain, TerrainFlags.LAKE)) return 'lake'
  if (hasTerrain(terrain, TerrainFlags.LAKESHORE)) return 'lakeshore'
  if (hasTerrain(terrain, TerrainFlags.SEASHORE)) return 'seashore'
  if (hasTerrain(terrain, TerrainFlags.MOUNTAIN)) return 'mountain'
  if (hasTerrain(terrain, TerrainFlags.PASS)) return 'pass'
  if (hasTerrain(terrain, TerrainFlags.SWAMP)) return 'swamp'
  if (hasTerrain(terrain, TerrainFlags.FOREST)) return 'forest'
  if (hasTerrain(terrain, TerrainFlags.HILL)) return 'hill'
  if (hasTerrain(terrain, TerrainFlags.RIVER)) return 'river'
  if (hasTerrain(terrain, TerrainFlags.ANCIENT_BATTLEFIELD)) return 'battlefield'
  if (hasTerrain(terrain, TerrainFlags.SCENIC)) return 'scenic'
  return 'clear'
}
