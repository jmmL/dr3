import { describe, expect, it } from 'vitest';
import { normalizeSeed, roll2d6, seedToState } from './rng';

describe('rng', () => {
  it('normalizes empty seed', () => {
    expect(normalizeSeed('')).toBe('dr3-default-seed');
  });

  it('produces deterministic 2d6 sequence from seed', () => {
    const stateA = seedToState('alpha');
    const stateB = seedToState('alpha');

    const firstA = roll2d6(stateA);
    const firstB = roll2d6(stateB);
    expect(firstA.total).toBe(firstB.total);

    const secondA = roll2d6(firstA.nextState);
    const secondB = roll2d6(firstB.nextState);
    expect(secondA.total).toBe(secondB.total);
  });
});
