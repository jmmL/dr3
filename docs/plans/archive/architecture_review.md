# Architecture & Planning Review

**Date:** January 2026
**Reviewer:** Jules (AI Software Engineer)
**Scope:**
- `docs/architecture/app-architecture.md`
- `docs/prd/divine-right-prd.md`
- `docs/plans/archive/2026-01-25-conformance-suite.md`

---

## 1. Executive Summary
The proposed plan for the Divine Right 3 (DR3) web application is robust, modern, and highly disciplined. The decision to treat the **Conformance Suite as the source of truth** is a standout feature that mitigates the complexity of wargame logic. The choice of `boardgame.io` aligns well with the long-term goal of multiplayer migration. However, significant risks exist in the **integration complexity** between the static JSON suite and the state-based engine, as well as potential **performance bottlenecks** with SVG rendering on mobile.

---

## 2. Steel Man Analysis (Strengths)

### Architecture (`app-architecture.md`)
- **Reuse-First Strategy:** Leveraging `boardgame.io` is an excellent decision. It provides a battle-tested state management system, move validation, and networking layer out of the box, saving months of boilerplate work.
- **Separation of Concerns:** The architecture clearly delineates the "Rules Engine" (pure logic) from the "UI" (React) and the "Persistence" layer. This makes the codebase testable and maintainable.
- **Future-Proofing:** Explicitly designing for a "client-only" Phase 1 that can seamlessly upgrade to a "server-backend" Phase 2 validates the choice of technology.
- **Testing Pyramid:** The inclusion of `Vitest` for logic and `Playwright` for E2E ensures a healthy mix of fast feedback and user-flow verification.

### PRD (`divine-right-prd.md`)
- **Disciplined Scope:** Explicitly listing "Non-Goals" (e.g., Multiplayer, Live Services) prevents scope creep and focuses efforts on the core single-player experience.
- **User-Centricity:** The focus on accessibility (keyboard nav, high contrast) and clarity (tooltips, log) addresses common pain points in digital board game adaptations.
- **Phased Delivery:** The "Core -> Expanded -> Polish" roadmap is realistic and allows for shipping a playable MVP sooner.
- **Measurable Success:** Defining "100% conformance pass rate" gives the engineering team a binary, objective target for "Done."

### Conformance Suite Plan (`docs/plans/archive/2026-01-25-conformance-suite.md`)
- **Implementation Agnosticism:** Designing the suite as pure JSON allows it to outlive the specific game engine. If the UI moves from React to Unity in 5 years, the logic tests remain valid.
- **Granularity:** Mapping tests to specific Rule IDs (`17.9.4`) ensures no rule is left behind and provides instant traceability for bugs.
- **Chunking:** Breaking the massive rulebook into 7 delivery chunks makes the project psychologically and managerially approachable.
- **Schema Validation:** Using JSON Schema ensures the tests themselves are valid, preventing "testing the tests" issues.

---

## 3. Straw Man Analysis (Weaknesses & Risks)

### Architecture
- **Integration Overhead:** The plan glosses over the complexity of the "Harness." Mapping a static JSON input/output to `boardgame.io`'s `G` state and `Move` functions is non-trivial. If the shapes diverge, the harness becomes a complex, buggy translation layer.
- **Performance Risk:** "Default to SVG" (react-hexgrid) for a full wargame map on mobile (iOS Safari) is risky. Large DOM trees with complex event listeners can cause scroll jank and battery drain compared to a Canvas (Pixi/Phaser) approach.
- **Over-Engineering:** For a strictly single-player game, `boardgame.io` adds weight. If the multiplayer future never materializes, a simple Redux/Zustand store would have been lighter and easier to debug.

### PRD
- **AI Feasibility:** "Provide at least one CPU opponent... using boardgame.io bot framework" is potentially naive. The default MCTS bot in `boardgame.io` often struggles with games of this complexity (high branching factor, long term strategy). It may result in a CPU that takes 30 seconds to make a suicidal move.
- **"100% Conformance" Trap:** Demanding 100% pass rate for *all* rules before release might paralyze development. Some edge cases (e.g., "Leader Adrift") occur so rarely that blocking release for them is poor ROI.
- **Mobile UX vs. Wargame Complexity:** The PRD wants "Mobile browser first" but also "Tooltips". Hover interactions don't exist on touch. Converting a complex hex-and-counter wargame to a phone screen without massive UX simplification often results in an unplayable "spreadsheet" experience.

### Conformance Suite
- **State Explosion:** The "Minimal Game-State Shape" is optimistic. Complex integration tests (e.g., "Siege Relief with Diplomacy") will require a `game_state` that is nearly the entire engine state. Writing these by hand in JSON will be error-prone and tedious.
- **Static Limitations:** JSON tests are snapshots. They struggle to test "Sequences" or "Interrupts" (e.g., Card play during an opponent's turn) which are common in DR3.
- **Maintenance Burden:** There is no mechanism described to keep the JSON schema and the TypeScript types in sync. They will likely drift, leading to false negatives in CI.

---

## 4. Comparative Analysis

- **Alignment:** All three documents strongly align on the **"Conformance First"** philosophy. This is the project's "North Star" and reduces decision fatigue.
- **Conflict (Rendering):** Architecture suggests "Switch to pixi.js if performance becomes a bottleneck," while PRD defaults to SVG. This "wait and see" approach is dangerous for the fundamental rendering layer. Switching from SVG to Canvas mid-project is a total UI rewrite.
- **Gap (AI Strategy):** Both Architecture and PRD mention AI, but neither details *how* to build a competent AI for *Divine Right*. The generic "boardgame.io bot" is likely insufficient.
- **Gap (State Mapping):** The Conformance plan defines a JSON schema. The Architecture uses TypeScript interfaces. There is no explicit plan to generate one from the other, creating a "Source of Truth" conflict potential.

---

## 5. Recommendations

### Holistic Recommendations
1.  **Prototype the Harness First (Tracer Bullet):** Before writing 500 tests, implement the Conformance Harness and *one* complex rule (e.g., `25.3 Combat Resolution`). Prove that the JSON input can drive the `boardgame.io` engine and verify the output. If this is friction-heavy, rethink the harness or the engine choice.
2.  **Decide Rendering Now:** Do not "wait and see" on SVG vs Canvas. Build a "stress test" prototype immediately: render the full map with maximum units (simulated) on an older iPhone. If it drops below 55fps or stutters on scroll, commit to PixiJS/Phaser immediately.
3.  **De-Risk AI:** Downgrade the "AI" requirement for Phase 1. Instead of a "Bot," consider implementing a "Heuristic Evaluator" that simply validates moves. A full MCTS AI might be a Phase 2 goal.

### Individual Recommendations

**Architecture:**
-   **Explicit State Mapping:** Create a build step that generates TypeScript types *directly* from the Conformance JSON Schema. This ensures the Engine's `G` state is always a superset of the Test Suite's `game_state`.
-   **Service Worker:** For the "Single Player Web App" feel, explicitly plan for a PWA (Progressive Web App) implementation (Offline support) in the Architecture.

**PRD:**
-   **Mobile Interactions:** Explicitly define mobile equivalents for "Tooltips" (e.g., "Long-press for details" or "Context Drawer").
-   **Relax Phase 1 Success Metrics:** Change "100% conformance suite" to "100% of *Core* and *Advanced* chunks; *Special* and *Supporting* rules on best-effort basis."

**Conformance Suite:**
-   **Action-Based Testing:** Add a field for `action` in the test schema. Instead of just asserting state `input` -> `output`, allow tests to specify an `action` (e.g., `{ "type": "MOVE_UNIT", "args": ... }`) to verify the *transition* logic, which fits the `boardgame.io` model better.
-   **Test Generators:** Plan for a simple script to "scaffold" JSON test files to reduce manual typing fatigue.
