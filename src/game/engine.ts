// Placeholder for the Game Engine
export interface GameState {
  turn: number;
  message: string;
}

export function createInitialState(): GameState {
  return {
    turn: 1,
    message: "Welcome to Divine Right",
  };
}
