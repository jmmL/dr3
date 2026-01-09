/**
 * Script to convert dr25hexdata.py to TypeScript
 * Run with: node scripts/convertHexData.mjs
 */

import fs from 'fs'
import path from 'path'

const inputFile = path.join(process.cwd(), 'dr25hexdata.py')
const outputFile = path.join(process.cwd(), 'src/data/mapData.ts')

// Read the Python file
const pythonCode = fs.readFileSync(inputFile, 'utf-8')

// Kingdom name mappings
const kingdomMap = {
  'names.Neuth': 'neuth',
  'names.Hothior': 'hothior',
  'names.Mivior': 'mivior',
  'names.Muetar': 'muetar',
  'names.Shucassam': 'shucassam',
  'names.Immer': 'immer',
  'names.Pon': 'pon',
  'names.Rombune': 'rombune',
  'names.Zorn': 'zorn',
  'names.Ghem': 'ghem',
  'names.Trolls': 'trolls',
  'names.Eaters_of_Wisdom': 'eaters',
  'names.Black_Hand': 'blackhand',
  'names.Invisible_School': 'eaters',
  'names.Tower_of_Zards': 'blackhand',
  'None': null,
}

// Terrain flag mappings
const terrainMap = {
  'Dr25Hex.FOREST': 0x0001,
  'Dr25Hex.HILL': 0x0002,
  'Dr25Hex.MOUNTAIN': 0x0004,
  'Dr25Hex.PASS': 0x0008,
  'Dr25Hex.SWAMP': 0x0010,
  'Dr25Hex.RIVER': 0x0020,
  'Dr25Hex.LAKE': 0x0040,
  'Dr25Hex.LAKESHORE': 0x0080,
  'Dr25Hex.SEA': 0x0100,
  'Dr25Hex.SEASHORE': 0x0200,
  'Dr25Hex.CASTLE': 0x0400,
  'Dr25Hex.PORT': 0x0800,
  'Dr25Hex.SCENIC': 0x1000,
  'Dr25Hex.ANCIENT_BATTLEFIELD': 0x2000,
  'Dr25Hex.ROYAL': 0x4000,
  'Dr25Hex.NON_CASTLE_PORT': 0x8000,
  'Dr25Hex.NAVIGABLE': 0x10000,
}

// Parse terrain flags string like "Dr25Hex.CASTLE|Dr25Hex.ROYAL"
function parseTerrainFlags(flagsStr) {
  if (!flagsStr || flagsStr === '0') return 0

  const parts = flagsStr.split('|').map(s => s.trim())
  let result = 0
  for (const part of parts) {
    if (terrainMap[part] !== undefined) {
      result |= terrainMap[part]
    }
  }
  return result
}

// Parse kingdom reference
function parseKingdom(kingdomStr) {
  if (!kingdomStr || kingdomStr === 'None') return null
  const trimmed = kingdomStr.trim()
  return kingdomMap[trimmed] || null
}

// Parse a single Dr25Hex line
// Format: Dr25Hex((col,row), name, terrain, kingdom, intrinsic)
function parseHexLine(line) {
  // Match: Dr25Hex((col,row), name, terrain, kingdom, intrinsic)
  const match = line.match(/Dr25Hex\(\((\d+),(\d+)\),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*(\d+)\)/)

  if (!match) return null

  const col = parseInt(match[1])
  const row = parseInt(match[2])
  let name = match[3].trim()
  const terrainStr = match[4].trim()
  const kingdomStr = match[5].trim()
  const intrinsic = parseInt(match[6])

  // Handle name - can be None, 'string', or names.Something
  if (name === 'None') {
    name = null
  } else if (name.startsWith("'") || name.startsWith('"')) {
    // Remove quotes
    name = name.slice(1, -1)
  } else if (name.startsWith('names.')) {
    // Convert names.Something to readable string
    name = name.replace('names.', '').replace(/_/g, ' ')
  }

  return {
    col,
    row,
    name,
    terrain: parseTerrainFlags(terrainStr),
    kingdom: parseKingdom(kingdomStr),
    intrinsic
  }
}

// Find all hex definitions
const hexes = []
const lines = pythonCode.split('\n')

for (let i = 0; i < lines.length; i++) {
  let line = lines[i]

  // Handle multi-line definitions
  if (line.includes('Dr25Hex') && !line.includes('))')) {
    // Combine with next line(s) until we find the closing ))
    while (!line.includes('))') && i + 1 < lines.length) {
      i++
      line += ' ' + lines[i].trim()
    }
  }

  if (line.includes('Dr25Hex')) {
    const hex = parseHexLine(line)
    if (hex) {
      hexes.push(hex)
    }
  }
}

console.log(`Parsed ${hexes.length} hexes`)

// Generate TypeScript output
const output = `/**
 * Map data for Divine Right - Minaria
 * Auto-generated from dr25hexdata.py
 *
 * Note: This data is from the 25th Anniversary Edition.
 * Verify key locations against DR3 rulebook map.
 */

import { HexData, toHexKey } from '../types'

/**
 * Raw hex data array
 */
export const hexDataArray: HexData[] = ${JSON.stringify(hexes, null, 2)}

/**
 * Hex data indexed by "col,row" key for O(1) lookup
 */
export const hexData: Map<string, HexData> = new Map(
  hexDataArray.map(hex => [toHexKey(hex.col, hex.row), hex])
)

/**
 * Map dimensions
 */
export const MAP_COLS = 35
export const MAP_ROWS = 31

/**
 * Get hex at coordinate
 */
export function getHex(col: number, row: number): HexData | undefined {
  return hexData.get(toHexKey(col, row))
}

/**
 * Get all hexes belonging to a kingdom
 */
export function getKingdomHexes(kingdom: string): HexData[] {
  return hexDataArray.filter(hex => hex.kingdom === kingdom)
}

/**
 * Get all castles
 */
export function getCastles(): HexData[] {
  return hexDataArray.filter(hex => (hex.terrain & 0x0400) !== 0)
}

/**
 * Get royal castles
 */
export function getRoyalCastles(): HexData[] {
  return hexDataArray.filter(hex => (hex.terrain & 0x4400) === 0x4400)
}
`

// Ensure output directory exists
fs.mkdirSync(path.dirname(outputFile), { recursive: true })

// Write output
fs.writeFileSync(outputFile, output)
console.log(`Written to ${outputFile}`)

// Log some stats
const kingdoms = new Set(hexes.map(h => h.kingdom).filter(Boolean))
console.log(`Kingdoms: ${[...kingdoms].join(', ')}`)

const castles = hexes.filter(h => (h.terrain & 0x0400) !== 0)
console.log(`Castles: ${castles.length}`)

const royalCastles = hexes.filter(h => (h.terrain & 0x4400) === 0x4400)
console.log(`Royal Castles: ${royalCastles.map(c => c.name).join(', ')}`)
