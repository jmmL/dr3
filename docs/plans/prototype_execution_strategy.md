# Prototype Execution Strategy: Harness & Rendering

**Date:** January 2026
**Status:** Planned
**Goal:** mitigate critical technical risks (Integration Complexity, Mobile Performance) identified in the Architecture Review.

---

## 1. Conformance Harness Prototype ("The Tracer Bullet")

### Objective
Prove that the static JSON Conformance Suite can effectively drive the `boardgame.io` game engine without excessive "glue code" or state divergence.

### Risk Being Mitigated
**Integration Overhead:** If the test data shape and the engine state shape diverge, the harness becomes a complex maintenance burden.

### Strategy
Implement a "Vertical Slice" of the testing pipeline for a single, complex rule: **25.3 Combat Resolution**.

### Implementation Steps

#### 1.1 Project Initialization
- Initialize a blank TypeScript repository with `vite` and `vitest`.
- Install `boardgame.io`.
- **Note:** Do not build the full UI yet. This is a headless logic test.

#### 1.2 Schema-First Type Generation (Explicit State Mapping)
*Recommendation Applied: Explicit State Mapping*
- **Action:** Define the JSON Schema for the Combat Test Case first.
- **Tooling:** Configure `json-schema-to-typescript`.
- **Pipeline:**
  1.  Create `docs/conformance/schema/test_case.schema.json`.
  2.  Run generator script.
  3.  Output `src/types/conformance.d.ts`.
  4.  **Constraint:** The Game Engine's `G` state must `implement` or `extend` this generated type to ensure alignment.

#### 1.3 The Harness (Test Runner)
*Recommendation Applied: Action-Based Testing*
- Create a Vitest utility `runConformanceTest(fixturePath: string)`.
- **Logic Flow:**
  1.  **Load:** Read JSON fixture.
  2.  **Setup:** Initialize `Client({ game: DR3Game })`.
  3.  **Hydrate:** Override internal `G` state with `fixture.input.game_state`.
  4.  **Act:**
      - If `fixture.input.action` is present (e.g., `{ type: 'RESOLVE_COMBAT', args: {...} }`), dispatch that specific move.
      - **Critical:** Ensure the test format supports "Action" inputs, not just static state properties, to properly exercise the Engine's transition logic.
  5.  **Assert:** Compare `client.getState().G` against `fixture.expected`.

#### 1.4 The Rule Implementation (Rule 25.3)
- Implement `moves.resolveCombat` in `boardgame.io`.
- Implement the combat logic (odds calculation, die roll modifiers).
- **Verification:** The test should pass if the logic is correct, and fail with a clear diff if not.

### Success Criteria
- [ ] A test file `tests/combat_25_3.json` exists.
- [ ] `npm test` executes the harness, runs the engine, and passes.
- [ ] No manual Type casting (`as unknown`) is needed between JSON types and Engine types.

---

## 2. Rendering Stress Test

### Objective
Definitively decide between **SVG (React-Hexgrid)** and **Canvas (PixiJS)** for the mobile map view.

### Risk Being Mitigated
**Performance Risk:** A full wargame map with hundreds of units may be too heavy for SVG on mobile browsers, causing unplayable lag.

### Strategy
Build a "Throwaway" prototype that renders the maximum theoretical load and measures frame times on a constrained device profile.

### Implementation Steps

#### 2.1 minimal Environment
- Create a new generic React + Vite page.
- Configure `viewport` meta tag for mobile (no scale).

#### 2.2 Asset Generation
- Generate a 50x60 hex grid data structure (approximate DR3 map size).
- Create a simple SVG asset for a Unit (circle + text + faction color).
- Create a simple SVG asset for Terrain (hex polygon + terrain icon).

#### 2.3 The SVG Implementation (Candidate A)
- Use `react-hexgrid` or raw SVG.
- Render the full grid (3000 hexes).
- **Load Test:** Place 200 units randomly on the map.
- **Interactions:**
  - Implement a CSS `transform: translate/scale` container for Pan/Zoom.
  - Bind Touch Events to update the transform.
- **Optimization:** Use `React.memo` on Hexes and Units.

#### 2.4 The Metric (FPS Monitor)
- Add a simple JS loop:
  ```javascript
  let last = performance.now();
  function loop() {
    const now = performance.now();
    console.log(1000 / (now - last));
    last = now;
    requestAnimationFrame(loop);
  }
  ```
- **Mobile Interaction:** Pan and Zoom continuously for 10 seconds.
- **Fail Condition:** FPS drops below 50 during interaction on a mid-range phone (e.g., iPhone 11/12 or Pixel 5 profile).

#### 2.5 The Fallback (PixiJS)
- If Candidate A fails, implement the same scene in PixiJS.
- Use `pixi-viewport` for pan/zoom.
- Compare FPS.

### Success Criteria
- [ ] A deployed URL (or local build) allows testing on a physical mobile device.
- [ ] A clear "Go / No-Go" decision is recorded in `docs/architecture/decisions/rendering_engine.md`.

---

## 3. Timeline & Dependencies

| Phase | Task | Dependency | Est. Effort |
|-------|------|------------|-------------|
| **Wk 1** | **Harness Prototype** | None | 2 Days |
| | *Define Schema & Types* | | |
| | *Implement Engine Core* | `boardgame.io` | |
| | *Verify Rule 25.3* | | |
| **Wk 1** | **Rendering Stress Test** | None | 1 Day |
| | *Build SVG Grid* | | |
| | *Mobile Profile Test* | | |
| **Decision**| **Commit to Tech Stack** | Results of above | |

## 4. Immediate Next Steps
1. Initialize the repository with `package.json` and dependencies (`boardgame.io`, `vitest`, `vite`).
2. Create the `docs/conformance/schema/` directory.
