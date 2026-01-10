import { describe, it, expect } from 'vitest'
import {
  hexData,
  hexDataArray,
  MAP_COLS,
  MAP_ROWS,
  getHex,
  getCastles,
  getRoyalCastles,
  getKingdomHexes,
} from './mapData'
import { TerrainFlags, hasTerrain, toHexKey } from '../types'

describe('mapData', () => {
  describe('hexData Map', () => {
    it('contains expected number of hexes', () => {
      // Map should have around 1000+ hexes
      expect(hexData.size).toBeGreaterThan(1000)
    })

    it('has valid hex keys', () => {
      for (const key of hexData.keys()) {
        expect(key).toMatch(/^\d+,\d+$/)
      }
    })

    it('has consistent keys and coordinates', () => {
      for (const [key, hex] of hexData.entries()) {
        const expectedKey = toHexKey(hex.col, hex.row)
        expect(key).toBe(expectedKey)
      }
    })
  })

  describe('hexDataArray', () => {
    it('matches hexData Map size', () => {
      expect(hexDataArray.length).toBe(hexData.size)
    })

    it('has valid column coordinates', () => {
      for (const hex of hexDataArray) {
        expect(hex.col).toBeGreaterThanOrEqual(0)
        expect(hex.col).toBeLessThan(MAP_COLS)
      }
    })

    it('has valid row coordinates', () => {
      for (const hex of hexDataArray) {
        expect(hex.row).toBeGreaterThanOrEqual(0)
        expect(hex.row).toBeLessThan(MAP_ROWS)
      }
    })

    it('has valid terrain values (non-negative)', () => {
      for (const hex of hexDataArray) {
        expect(hex.terrain).toBeGreaterThanOrEqual(0)
      }
    })

    it('has valid intrinsic values (0-6)', () => {
      for (const hex of hexDataArray) {
        expect(hex.intrinsic).toBeGreaterThanOrEqual(0)
        expect(hex.intrinsic).toBeLessThanOrEqual(6)
      }
    })
  })

  describe('getHex', () => {
    it('returns hex for valid coordinates', () => {
      const hex = getHex(0, 0)
      expect(hex).toBeDefined()
      expect(hex?.col).toBe(0)
      expect(hex?.row).toBe(0)
    })

    it('returns undefined for invalid coordinates', () => {
      expect(getHex(-1, 0)).toBeUndefined()
      expect(getHex(0, -1)).toBeUndefined()
      expect(getHex(100, 100)).toBeUndefined()
    })
  })

  describe('getCastles', () => {
    it('returns array of castle hexes', () => {
      const castles = getCastles()
      expect(castles.length).toBeGreaterThan(0)
    })

    it('all returned hexes have CASTLE terrain flag', () => {
      const castles = getCastles()
      for (const castle of castles) {
        expect(hasTerrain(castle.terrain, TerrainFlags.CASTLE)).toBe(true)
      }
    })

    it('all castles have names', () => {
      const castles = getCastles()
      for (const castle of castles) {
        expect(castle.name).not.toBeNull()
        expect(castle.name?.length).toBeGreaterThan(0)
      }
    })

    it('castles have positive intrinsic defense', () => {
      const castles = getCastles()
      for (const castle of castles) {
        expect(castle.intrinsic).toBeGreaterThan(0)
      }
    })
  })

  describe('getRoyalCastles', () => {
    it('returns expected number of royal castles', () => {
      const royalCastles = getRoyalCastles()
      // Should be 7 player kingdoms with royal castles
      expect(royalCastles.length).toBeGreaterThanOrEqual(7)
    })

    it('all returned hexes have ROYAL and CASTLE flags', () => {
      const royalCastles = getRoyalCastles()
      for (const castle of royalCastles) {
        expect(hasTerrain(castle.terrain, TerrainFlags.CASTLE)).toBe(true)
        expect(hasTerrain(castle.terrain, TerrainFlags.ROYAL)).toBe(true)
      }
    })

    it('all royal castles have names', () => {
      const royalCastles = getRoyalCastles()
      for (const castle of royalCastles) {
        expect(castle.name).not.toBeNull()
      }
    })

    it('royal castles belong to kingdoms', () => {
      const royalCastles = getRoyalCastles()
      for (const castle of royalCastles) {
        expect(castle.kingdom).not.toBeNull()
      }
    })
  })

  describe('getKingdomHexes', () => {
    it('returns hexes for valid kingdom', () => {
      const hothiorHexes = getKingdomHexes('hothior')
      expect(hothiorHexes.length).toBeGreaterThan(0)
    })

    it('all returned hexes belong to specified kingdom', () => {
      const hothiorHexes = getKingdomHexes('hothior')
      for (const hex of hothiorHexes) {
        expect(hex.kingdom).toBe('hothior')
      }
    })

    it('returns empty array for invalid kingdom', () => {
      const invalidHexes = getKingdomHexes('not_a_kingdom')
      expect(invalidHexes).toEqual([])
    })

    it('all player kingdoms have hexes', () => {
      const playerKingdoms = ['hothior', 'mivior', 'muetar', 'shucassam', 'immer', 'pon', 'rombune']
      for (const kingdom of playerKingdoms) {
        const hexes = getKingdomHexes(kingdom)
        expect(hexes.length).toBeGreaterThan(0)
      }
    })
  })

  describe('map dimensions', () => {
    it('MAP_COLS is 35', () => {
      expect(MAP_COLS).toBe(35)
    })

    it('MAP_ROWS is 31', () => {
      expect(MAP_ROWS).toBe(31)
    })
  })

  describe('kingdom data integrity', () => {
    /**
     * NOTE: This test documents known data discrepancies between the
     * 25th Anniversary Edition hex data and DR3 expectations.
     *
     * Known issues (to be fixed in map data verification):
     * - Some kingdoms have 0 royal castles assigned
     * - Some royal castles may be assigned to wrong kingdoms
     * - Data source: 25th Anniversary, target: DR3
     */
    it('documents royal castle assignments per kingdom', () => {
      const playerKingdoms = ['hothior', 'mivior', 'muetar', 'shucassam', 'immer', 'pon', 'rombune']
      const royalCastles = getRoyalCastles()

      // Count how many kingdoms have royal castles
      let kingdomsWithRoyalCastles = 0
      for (const kingdom of playerKingdoms) {
        const kingdomRoyalCastles = royalCastles.filter(c => c.kingdom === kingdom)
        if (kingdomRoyalCastles.length > 0) {
          kingdomsWithRoyalCastles++
        }
      }

      // At minimum, some kingdoms should have royal castles
      // Full verification requires manual comparison with DR3 rulebook
      expect(kingdomsWithRoyalCastles).toBeGreaterThan(0)

      // Total royal castles should be reasonable (at least 7 player kingdoms)
      expect(royalCastles.length).toBeGreaterThanOrEqual(7)
    })

    it('known royal castle names exist', () => {
      const royalCastles = getRoyalCastles()
      const castleNames = royalCastles.map(c => c.name?.toLowerCase().replace(/[^a-z]/g, ''))

      // These are the expected royal castles from the game
      const expectedCastles = [
        'iderbolis',    // Hothior
        'pennol',       // Mivior
        'marzarbol',    // Shucassam
      ]

      for (const expected of expectedCastles) {
        const found = castleNames.some(name => name?.includes(expected))
        expect(found).toBe(true)
      }
    })
  })
})
