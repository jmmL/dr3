# DR3 Web App Architecture (Single-Player on GitHub Pages)

## Goals
- Ship a single-player, browser-based experience hosted on GitHub Pages.
- Reuse mature frameworks and avoid NIH: rely on proven game engines and UI tooling.
- Keep a clear path to future multiplayer server migration without re-architecting core logic.
- Treat the conformance suite as the source of truth for game logic correctness.
- Mobile browser-first delivery (especially iOS Safari).

## Architecture Options (Reuse-First)
### Option A: boardgame.io (Recommended)
- **boardgame.io** as the rules engine and state container.
  - Client-only mode for GitHub Pages hosting (no server required).
  - Natural migration path to a boardgame.io server for future multiplayer.
- **TypeScript** for strict typing and consistency with the JSON conformance suite.

### Option B: Phaser 3 + Custom Rules Core
- **Phaser 3** for rendering + input, especially if you need a game-loop mindset.
- Requires a bespoke rules engine layer and serialization of state for tests.
- Pros: high-performance canvas rendering; Cons: more custom work to align with conformance suite.

### Option C: PixiJS + XState (Statecharts)
- **PixiJS** for rendering, **XState** for turn/phase logic.
- Pros: explicit state machine for phases; Cons: higher integration overhead, more custom harness work.

### Option D: React + Zustand/Redux + Pure Rules
- Use a state store and implement rules as pure functions invoked by UI.
- Pros: minimal dependencies; Cons: more NIH risk and less built-in multiplayer migration.

### UI + Rendering
- **React** for UI and board rendering.
- **react-hexgrid** (SVG) for hex map rendering.
  - Prefer SVG for clarity and accessibility; mobile-first layouts are simpler.
  - Switch to pixi.js if performance becomes a bottleneck (large maps, many units).

### Build + Tooling
- **Vite** for bundling and fast local iteration.
- **Vitest** for unit/integration testing (fast, Vite-native).
- **Playwright** for E2E UI testing (GitHub Actions friendly).
- **eslint + prettier** for linting and formatting.

## Architecture Overview (Option A)
```
UI (React) ───────────────┐
                          │
Game Client (boardgame.io)│
                          │
Rules + Moves (TypeScript)│
                          │
Conformance Harness ──────┘
```

### Modules
1. **Game Logic (Rules Layer)**
   - Implemented as boardgame.io `moves`, `events`, and `phases`.
   - Sole source of truth for game state transitions.
   - Must pass the JSON conformance suite as a hard gate.

2. **State Models (Shared Types)**
   - Shared TypeScript types used by logic, UI, and tests.
   - Keep aligned with the canonical game-state shape in the conformance plan.

3. **UI Layer**
   - Responsible for rendering board state and interactions.
   - No game rules or validation in UI; all rules enforced in the engine.

4. **CPU Opponent Layer**
   - Start with a simple policy-based bot using boardgame.io bot hooks.
   - Upgrade to MCTS or heuristic search without touching UI.

5. **Persistence Layer**
   - Use `localStorage` for save/load in single-player.
   - Abstract behind a small interface to allow server-backed persistence later.

## GitHub Pages Hosting
- Use a static build with client-only boardgame.io transport.
- Save game state to `localStorage` keyed by game version and scenario.
- Optional: support exporting/importing JSON saves.

## Future Migration Path (Multiplayer)
- Swap the boardgame.io client to server transport.
- Add a boardgame.io server (Node) with persistence (Postgres + Redis).
- UI and rules remain unchanged; only transport and auth layers are added.

## Conformance Suite Integration
### Test Strategy
- **Conformance Suite** is mandatory and runs in CI for any rule changes.
- Build a test runner that loads JSON fixtures and executes rule logic directly.
- Map suite test cases to boardgame.io move invocations and assertions.

### Validation Layers
1. **Schema Validation**
   - Validate conformance JSON against the schema in `docs/conformance/schema/`.
2. **Engine Conformance Tests**
   - Execute each fixture against the rules engine.
3. **Regression Tests**
   - For any bugfix, add a regression test fixture before code changes.

## Testing Matrix (Recommended)
| Layer | Tooling | Purpose |
|-------|---------|---------|
| Schema Validation | JSON Schema + custom harness | Ensure suite data integrity |
| Unit | Vitest | Pure logic helpers and calculations |
| Conformance | Vitest + fixture runner | Rules compliance |
| Integration | Vitest | Multi-rule interactions |
| E2E | Playwright | UI flows, save/load, CPU turns |
| Lint/Format | eslint/prettier | Quality and consistency |

## Best-Practice Patterns
- Treat JSON conformance suite as the spec, not an afterthought.
- Keep UI passive: all legality checks must happen in the rules engine.
- Use deterministic randomness by injecting RNG sequences in tests.
- Build a minimal `GameState` shape shared between suite, engine, and UI.

## Agentic Development (Web Sandbox Harness, Jan 2026)
- Apply good practice for **leading models** in a web sandbox:
  - Keep tasks small and verifiable (conformance suite first, UI second).
  - Prefer deterministic tests over manual steps.
  - Use explicit data fixtures and avoid hidden state.
- Be mindful of sandbox limitations (January 2026):
  - Limited long-running servers; use static builds or short-lived dev servers.
  - File system and network access may be constrained in CI environments.
  - Browser automation is available but can be flaky for heavy canvas renders.
  - Avoid sub-agent orchestration within the sandbox.
- Maintain a lightweight “definition of done” checklist:
  - Conformance suite updated.
  - Unit tests updated.
  - E2E coverage added (if UI flow changed).
  - Documentation updated for architecture/PRD changes.

## Open Questions
- Confirm SVG hex rendering requirements for iOS Safari performance.
- Decide CPU difficulty levels and acceptable response time per turn.
- Determine minimum viable UX for rule explanations and tooltips.
