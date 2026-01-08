# Divine Right 3rd Edition (Web Implementation)

This project is a web-based implementation of the "Divine Right" (3rd Edition) board game, focusing on solo play against a random AI.

## Architecture

The application is built using **Next.js (React)** and **TypeScript**.

### Core Modules

1.  **Game Engine (`src/game/`)**:
    *   Pure TypeScript logic.
    *   Holds the source of truth for the game state.
    *   Handles all rule enforcement, turn sequencing, and AI moves.
    *   Decoupled from the UI to allow for easy testing and potential future multiplayer upgrades.

2.  **UI (`src/components/`, `src/app/`)**:
    *   React components rendering the state.
    *   `HexGrid`: Renders the map.
    *   `Unit`: Renders unit counters.
    *   `Sidebar`: Shows current player, phase, and actions.

### Data Structures

#### GameState
```typescript
interface GameState {
  turn: number;
  currentPhase: Phase;
  activePlayerId: string;
  players: Record<string, Player>;
  map: HexMap; // Or just a list of unit positions if the map is static
  units: Record<string, Unit>;
  ...
}
```

#### Hex
```typescript
interface Hex {
  id: string; // e.g., "1010" (col/row)
  terrain: TerrainType;
  ...
}
```

### Game Loop (Basic Game)
1.  **Random Events Phase** (Dice Roll)
2.  **Diplomacy Phase** (Ambassador movement & attempts)
3.  **Movement Phase**
4.  **Combat Phase** (Sieges and Field Battles)
5.  **Reinforcement Phase**

### AI Strategy (MVP)
*   **Diplomacy:** Randomly select a valid target.
*   **Movement:** Randomly move units towards enemy castles or units (simple heuristic) or just random valid moves.
*   **Combat:** Always attack if odds are >= 1:1 (or random).

## Unknowns / TBD
*   **Nation Colors:** Need to extract specific color codes/names for each Kingdom (Mivior, Hothior, etc.) from the rulebook or user input.
*   **Map Data:** Need to manually transcribe the hex map (terrain types per hex).

## Development Plan

1.  **Walking Skeleton** (Current): Basic Next.js setup.
2.  **Map Rendering:** Implement `HexGrid` and render the empty board.
3.  **Game State & Unit Placement:** Define state and allow placing units.
4.  **Movement Logic:** Implement movement rules and pathfinding.
5.  **Combat Logic:** Implement combat tables and dice rolling.
6.  **Turn Cycle:** Implement the full phase loop.
7.  **AI:** Add the random bot.
8.  **Persistence:** Save/Load to `localStorage`.
