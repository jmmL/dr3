import { createInitialState } from '../engine';

describe('Game Engine', () => {
  it('should create initial state correctly', () => {
    const state = createInitialState();
    expect(state.turn).toBe(1);
    expect(state.message).toBe("Welcome to Divine Right");
  });
});
