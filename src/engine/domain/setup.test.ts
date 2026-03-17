import { describe, expect, it } from 'vitest';
import { buildInitialGameState } from './setup';

describe('buildInitialGameState', () => {
  it('creates a playable initial state', () => {
    const state = buildInitialGameState({ seed: 'test-seed' });
    expect(state.stage).toBe('rollEvents');
    expect(state.turnOrder).toHaveLength(2);
    expect(Object.keys(state.units).length).toBeGreaterThan(0);
    expect(state.seed).toBe('test-seed');
    expect(state.rngState.length).toBeGreaterThan(0);
  });
});
