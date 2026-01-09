# Next Steps

This document outlines the roadmap for implementing the "Basic Game" of Divine Right (3rd Edition).

## Phase 1: Map & Board Setup
- [ ] **Define Data Structures**: Create `Hex` and `HexMap` types in `src/game/types.ts`.
- [ ] **Implement Map Data**: Create a representation of the Minaria map (hardcoded grid or data file).
- [ ] **HexGrid Component**: Build a React component to render the hex board using SVG/Canvas.
- [ ] **Controls**: Add basic pan and zoom functionality.

## Phase 2: Units & Game State
- [ ] **Unit Definitions**: Define `Unit`, `Kingdom`, and `UnitType` (Regular, Mercenary, Leader).
- [ ] **State Management**: Expand `GameState` to track unit positions and player status.
- [ ] **Initial Setup**: Implement logic to place units in their starting locations (as per Rulebook).
- [ ] **Unit Rendering**: Create visual components for units (using simple shapes/colors per kingdom).

## Phase 3: Movement Logic
- [ ] **Selection**: Allow users to select friendly units.
- [ ] **Move Validation**: Implement "Basic Game" movement rules (Terrain costs, max movement points).
- [ ] **Pathfinding**: Highlight valid moves for the selected unit.
- [ ] **Action**: Update state when a unit moves.

## Phase 4: Combat System
- [ ] **Combat Mechanics**: Implement the Combat Results Table (CRT) and Siege logic.
- [ ] **Battle UI**: Create a modal/interface for resolving battles (Attacker selection, Dice rolls, Results).
- [ ] **Retreat/Elimination**: Handle combat outcomes (retreats, unit death).

## Phase 5: Turn Cycle & AI
- [ ] **Phase Management**: Implement the full turn sequence (Events -> Diplomacy -> Movement -> Combat -> Reinforcement).
- [ ] **Diplomacy**: Implement Ambassador movement and Random Events.
- [ ] **Basic AI**: Create a simple bot that makes valid random moves and attacks when odds are favorable.

## Phase 6: Persistence & Polish
- [ ] **Save/Load**: Implement `localStorage` persistence.
- [ ] **UI Polish**: Improve visual feedback and accessibility.
- [x] **Testing**: Add unit tests for core rules. (Infrastructure set up, specific tests needed for new features)
