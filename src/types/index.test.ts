import { describe, it, expect } from 'vitest'
import {
  TerrainFlags,
  toHexKey,
  fromHexKey,
  hasTerrain,
  getPrimaryTerrain,
} from './index'

describe('toHexKey', () => {
  it('converts coordinates to string key', () => {
    expect(toHexKey(0, 0)).toBe('0,0')
    expect(toHexKey(10, 20)).toBe('10,20')
    expect(toHexKey(34, 30)).toBe('34,30')
  })
})

describe('fromHexKey', () => {
  it('parses string key back to coordinates', () => {
    expect(fromHexKey('0,0')).toEqual({ col: 0, row: 0 })
    expect(fromHexKey('10,20')).toEqual({ col: 10, row: 20 })
    expect(fromHexKey('34,30')).toEqual({ col: 34, row: 30 })
  })

  it('is inverse of toHexKey', () => {
    for (let col = 0; col < 35; col += 5) {
      for (let row = 0; row < 31; row += 5) {
        const key = toHexKey(col, row)
        const { col: c, row: r } = fromHexKey(key)
        expect(c).toBe(col)
        expect(r).toBe(row)
      }
    }
  })
})

describe('hasTerrain', () => {
  it('detects single terrain flag', () => {
    expect(hasTerrain(TerrainFlags.FOREST, TerrainFlags.FOREST)).toBe(true)
    expect(hasTerrain(TerrainFlags.FOREST, TerrainFlags.HILL)).toBe(false)
  })

  it('detects terrain in combined flags', () => {
    const forestHill = TerrainFlags.FOREST | TerrainFlags.HILL
    expect(hasTerrain(forestHill, TerrainFlags.FOREST)).toBe(true)
    expect(hasTerrain(forestHill, TerrainFlags.HILL)).toBe(true)
    expect(hasTerrain(forestHill, TerrainFlags.MOUNTAIN)).toBe(false)
  })

  it('returns false for clear terrain', () => {
    expect(hasTerrain(TerrainFlags.CLEAR, TerrainFlags.FOREST)).toBe(false)
    expect(hasTerrain(0, TerrainFlags.FOREST)).toBe(false)
  })

  it('detects castle and royal flags', () => {
    const royalCastle = TerrainFlags.CASTLE | TerrainFlags.ROYAL
    expect(hasTerrain(royalCastle, TerrainFlags.CASTLE)).toBe(true)
    expect(hasTerrain(royalCastle, TerrainFlags.ROYAL)).toBe(true)
  })
})

describe('getPrimaryTerrain', () => {
  it('returns clear for empty terrain', () => {
    expect(getPrimaryTerrain(0)).toBe('clear')
    expect(getPrimaryTerrain(TerrainFlags.CLEAR)).toBe('clear')
  })

  it('returns correct terrain type for single flags', () => {
    expect(getPrimaryTerrain(TerrainFlags.FOREST)).toBe('forest')
    expect(getPrimaryTerrain(TerrainFlags.HILL)).toBe('hill')
    expect(getPrimaryTerrain(TerrainFlags.MOUNTAIN)).toBe('mountain')
    expect(getPrimaryTerrain(TerrainFlags.SWAMP)).toBe('swamp')
    expect(getPrimaryTerrain(TerrainFlags.SEA)).toBe('sea')
    expect(getPrimaryTerrain(TerrainFlags.LAKE)).toBe('lake')
  })

  it('prioritizes sea/lake over other terrain', () => {
    const seaCoast = TerrainFlags.SEA | TerrainFlags.FOREST
    expect(getPrimaryTerrain(seaCoast)).toBe('sea')

    const lakeMountain = TerrainFlags.LAKE | TerrainFlags.MOUNTAIN
    expect(getPrimaryTerrain(lakeMountain)).toBe('lake')
  })

  it('prioritizes mountain over forest/hill', () => {
    const mountainForest = TerrainFlags.MOUNTAIN | TerrainFlags.FOREST
    expect(getPrimaryTerrain(mountainForest)).toBe('mountain')
  })
})

describe('TerrainFlags', () => {
  it('has unique values for each flag', () => {
    const values = Object.values(TerrainFlags).filter(v => typeof v === 'number')
    const uniqueValues = new Set(values)
    expect(uniqueValues.size).toBe(values.length)
  })

  it('flags are powers of 2 (except CLEAR)', () => {
    for (const [name, value] of Object.entries(TerrainFlags)) {
      if (name === 'CLEAR') {
        expect(value).toBe(0)
      } else {
        // Check it's a power of 2
        expect(value).toBeGreaterThan(0)
        expect((value as number) & ((value as number) - 1)).toBe(0)
      }
    }
  })
})
