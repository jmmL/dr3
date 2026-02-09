const MODULUS = 0x100000000;
const MULTIPLIER = 1664525;
const INCREMENT = 1013904223;

export interface RngRoll {
  value: number;
  nextState: number[];
}

export function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seedToState(seed: string): number[] {
  return [hashSeed(seed)];
}

export function nextRng(state: number[]): RngRoll {
  const current = state[0] ?? 0;
  const value = (Math.imul(current, MULTIPLIER) + INCREMENT) >>> 0;
  return { value, nextState: [value] };
}

export function nextInt(state: number[], maxExclusive: number): RngRoll {
  if (maxExclusive <= 0) {
    throw new Error('maxExclusive must be > 0');
  }
  const step = nextRng(state);
  return { value: step.value % maxExclusive, nextState: step.nextState };
}

export function rollDie(state: number[], sides: number = 6): RngRoll {
  const roll = nextInt(state, sides);
  return { value: roll.value + 1, nextState: roll.nextState };
}

export function roll2d6(state: number[]): {
  first: number;
  second: number;
  total: number;
  nextState: number[];
} {
  const first = rollDie(state);
  const second = rollDie(first.nextState);
  return {
    first: first.value,
    second: second.value,
    total: first.value + second.value,
    nextState: second.nextState,
  };
}

export function normalizeSeed(seed: string | undefined): string {
  if (!seed || seed.trim() === '') return 'dr3-default-seed';
  return seed;
}

export function normalizeRngState(
  seed: string,
  rngState: number[] | undefined,
): number[] {
  if (rngState && rngState.length > 0) return rngState;
  return seedToState(seed);
}

export function toUnitInterval(value: number): number {
  return value / MODULUS;
}
