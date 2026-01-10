/**
 * Seeded Random Number Generator
 *
 * Uses Mulberry32 algorithm - a fast, simple PRNG with good distribution.
 * This allows for reproducible game sequences when given the same seed.
 */

/**
 * Create a seeded random number generator
 * @param seed - Initial seed value
 * @returns Function that returns random numbers in [0, 1)
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0 // Ensure unsigned 32-bit integer

  return function mulberry32(): number {
    state += 0x6d2b79f5
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Random Number Generator wrapper with utility methods
 */
export class SeededRNG {
  private rng: () => number
  private _seed: number

  constructor(seed: number) {
    this._seed = seed
    this.rng = createSeededRandom(seed)
  }

  /** Get the seed used to create this RNG */
  get seed(): number {
    return this._seed
  }

  /** Get next random number in [0, 1) */
  random(): number {
    return this.rng()
  }

  /** Get random integer in [min, max] inclusive */
  randomInt(min: number, max: number): number {
    return Math.floor(this.rng() * (max - min + 1)) + min
  }

  /** Generate a random ID string */
  randomId(length: number = 7): string {
    let result = ''
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(this.rng() * chars.length)]
    }
    return result
  }

  /** Pick a random element from an array */
  pick<T>(array: T[]): T | undefined {
    if (array.length === 0) return undefined
    return array[Math.floor(this.rng() * array.length)]
  }

  /** Shuffle an array in place (Fisher-Yates) */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  /** Roll dice: returns sum of n dice with s sides */
  rollDice(numDice: number, sides: number): number {
    let total = 0
    for (let i = 0; i < numDice; i++) {
      total += this.randomInt(1, sides)
    }
    return total
  }
}

/**
 * Generate a seeded ID (for backward compatibility)
 */
export function generateSeededId(rng: () => number, length: number = 7): string {
  let result = ''
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(rng() * chars.length)]
  }
  return result
}
