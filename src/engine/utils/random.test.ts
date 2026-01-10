import { describe, it, expect } from 'vitest'
import { createSeededRandom, SeededRNG, generateSeededId } from './random'

describe('createSeededRandom', () => {
  it('produces same sequence for same seed', () => {
    const rng1 = createSeededRandom(12345)
    const rng2 = createSeededRandom(12345)

    for (let i = 0; i < 10; i++) {
      expect(rng1()).toBe(rng2())
    }
  })

  it('produces different sequences for different seeds', () => {
    const rng1 = createSeededRandom(12345)
    const rng2 = createSeededRandom(54321)

    // Very unlikely to match
    expect(rng1()).not.toBe(rng2())
  })

  it('produces values in range [0, 1)', () => {
    const rng = createSeededRandom(42)

    for (let i = 0; i < 100; i++) {
      const value = rng()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('produces varied distribution', () => {
    const rng = createSeededRandom(99999)
    const values = new Set<number>()

    for (let i = 0; i < 100; i++) {
      values.add(Math.floor(rng() * 10))
    }

    // Should hit most buckets 0-9
    expect(values.size).toBeGreaterThan(7)
  })
})

describe('SeededRNG', () => {
  describe('random', () => {
    it('returns values in [0, 1)', () => {
      const rng = new SeededRNG(123)
      for (let i = 0; i < 50; i++) {
        const v = rng.random()
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThan(1)
      }
    })
  })

  describe('randomInt', () => {
    it('returns integers in specified range', () => {
      const rng = new SeededRNG(456)

      for (let i = 0; i < 50; i++) {
        const v = rng.randomInt(5, 10)
        expect(v).toBeGreaterThanOrEqual(5)
        expect(v).toBeLessThanOrEqual(10)
        expect(Number.isInteger(v)).toBe(true)
      }
    })

    it('works with single value range', () => {
      const rng = new SeededRNG(789)
      expect(rng.randomInt(7, 7)).toBe(7)
    })
  })

  describe('randomId', () => {
    it('generates IDs of specified length', () => {
      const rng = new SeededRNG(111)
      expect(rng.randomId(7)).toHaveLength(7)
      expect(rng.randomId(10)).toHaveLength(10)
      expect(rng.randomId(3)).toHaveLength(3)
    })

    it('generates consistent IDs for same seed', () => {
      const rng1 = new SeededRNG(222)
      const rng2 = new SeededRNG(222)

      expect(rng1.randomId()).toBe(rng2.randomId())
      expect(rng1.randomId()).toBe(rng2.randomId())
    })

    it('generates alphanumeric IDs', () => {
      const rng = new SeededRNG(333)
      const id = rng.randomId(20)
      expect(id).toMatch(/^[a-z0-9]+$/)
    })
  })

  describe('pick', () => {
    it('picks element from array', () => {
      const rng = new SeededRNG(444)
      const items = ['a', 'b', 'c', 'd', 'e']

      for (let i = 0; i < 20; i++) {
        const picked = rng.pick(items)
        expect(items).toContain(picked)
      }
    })

    it('returns undefined for empty array', () => {
      const rng = new SeededRNG(555)
      expect(rng.pick([])).toBeUndefined()
    })

    it('returns same element for same seed', () => {
      const rng1 = new SeededRNG(666)
      const rng2 = new SeededRNG(666)
      const items = [1, 2, 3, 4, 5]

      expect(rng1.pick(items)).toBe(rng2.pick(items))
    })
  })

  describe('shuffle', () => {
    it('maintains all elements', () => {
      const rng = new SeededRNG(777)
      const items = [1, 2, 3, 4, 5]
      const shuffled = rng.shuffle([...items])

      expect(shuffled.sort()).toEqual(items)
    })

    it('produces consistent shuffle for same seed', () => {
      const items1 = [1, 2, 3, 4, 5]
      const items2 = [1, 2, 3, 4, 5]

      new SeededRNG(888).shuffle(items1)
      new SeededRNG(888).shuffle(items2)

      expect(items1).toEqual(items2)
    })

    it('actually shuffles the array', () => {
      const rng = new SeededRNG(999)
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const shuffled = rng.shuffle([...original])

      // Very unlikely to be in original order
      expect(shuffled).not.toEqual(original)
    })
  })

  describe('rollDice', () => {
    it('returns value in valid range for 1d6', () => {
      const rng = new SeededRNG(1000)

      for (let i = 0; i < 50; i++) {
        const roll = rng.rollDice(1, 6)
        expect(roll).toBeGreaterThanOrEqual(1)
        expect(roll).toBeLessThanOrEqual(6)
      }
    })

    it('returns value in valid range for 2d6', () => {
      const rng = new SeededRNG(1001)

      for (let i = 0; i < 50; i++) {
        const roll = rng.rollDice(2, 6)
        expect(roll).toBeGreaterThanOrEqual(2)
        expect(roll).toBeLessThanOrEqual(12)
      }
    })

    it('produces consistent rolls for same seed', () => {
      const rng1 = new SeededRNG(1002)
      const rng2 = new SeededRNG(1002)

      for (let i = 0; i < 10; i++) {
        expect(rng1.rollDice(2, 6)).toBe(rng2.rollDice(2, 6))
      }
    })
  })

  describe('seed getter', () => {
    it('returns the original seed', () => {
      const rng = new SeededRNG(54321)
      expect(rng.seed).toBe(54321)
    })
  })
})

describe('generateSeededId', () => {
  it('generates consistent IDs', () => {
    const rng1 = createSeededRandom(777)
    const rng2 = createSeededRandom(777)

    expect(generateSeededId(rng1)).toBe(generateSeededId(rng2))
  })

  it('generates IDs of specified length', () => {
    const rng = createSeededRandom(888)
    expect(generateSeededId(rng, 10)).toHaveLength(10)
  })
})
