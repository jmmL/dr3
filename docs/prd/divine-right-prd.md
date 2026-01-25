# Divine Right 3 (DR3) Web App — Product Requirements Document (PRD)

## 1. Overview
**Product:** Single-player DR3 web app (player vs computer) hosted on GitHub Pages. The game logic must conform to the rules conformance suite and remain portable to a future multiplayer server environment.

**Target Users:**
- Fans of the original board game seeking a faithful, rules-accurate single-player experience.
- Strategy players who want a quick setup, CPU opponent, and save/load capability.

## 2. Goals
- Deliver a rules-accurate single-player experience using the conformance suite as the source of truth.
- Provide a clean, accessible UI for map navigation, unit management, and rules context.
- Ensure a migration path to multiplayer without rewriting core logic.

## 3. Non-Goals (Phase 1)
- Multiplayer networking, matchmaking, or ranked play.
- Live services, telemetry pipeline, or monetization.
- User accounts or cloud saves.

## 4. Success Metrics
- 100% conformance suite pass rate for all implemented rules.
- 90%+ automated test coverage for rules logic helpers.
- E2E test coverage for: start game, take a turn, save/load, CPU turn.

## 5. User Stories
1. **As a player**, I can start a new game with a chosen faction and difficulty.
2. **As a player**, I can play a complete game of DR3 against a single computer opponent.
3. **As a player**, I can save and resume a game later in the same browser.
4. **As a player**, I can view rule references for actions and outcomes.

## 6. Functional Requirements
### 6.1 Core Gameplay
- Turn-based gameplay with phases aligned to the DR3 rulebook.
- All actions validated through the rules engine (no UI-only validation).
- Deterministic resolution for CPU and random events (seedable RNG).

### 6.2 CPU Opponent
- Provide at least one CPU opponent behavior using boardgame.io bot framework.
- CPU must adhere to the same rules as the player.

### 6.3 Save/Load
- Support manual save and load using `localStorage`.
- Provide export/import of save files as JSON.
- Support deterministic scenario creation via seeds (tutorials/testing).
- Support undoing actions via efficient state snapshots/deltas (boardgame.io supports undo/redo in client state).

### 6.4 Accessibility & UX
- Keyboard navigation for key UI actions.
- High-contrast mode or colorblind-safe palette.
- Tooltips or modal references for rule explanations.

## 7. Non-Functional Requirements
- **Performance:** Render the full map at 60 FPS on modern hardware, mobile-first.
- **Compatibility:** Mobile browser first, especially iOS Safari; also Chrome, Firefox, Safari (latest 2 versions).
- **Reliability:** No state corruption when reloading or saving.
- **Security:** No sensitive data stored; static hosting only.

## 8. Technical Requirements
- **Frameworks:** boardgame.io + React + Vite.
- **Testing:** Vitest + Playwright + conformance suite harness.
- **Hosting:** GitHub Pages (static).
- **Data:** Use `docs/refs/*.min.json` as authoritative sources.

## 9. Conformance Suite Requirements
- Every rule implemented must have conformance tests.
- Conformance suite runs in CI and blocks merge on failure.
- Include negative test cases for illegal actions.

## 10. UX Requirements
- **Board View:** Hex grid with terrain and units clearly differentiated.
- **Sidebar:** Turn log, action list, selected unit details.
- **Action Flow:** Clear, consistent actions without jumping around the screen (e.g., a stable “Next Turn” control).

## 11. Analytics (Optional)
- Event logging only for local debug builds.
- Include a game action log for review/debugging.
- No network telemetry in production.

## 12. Release Plan (Phased)
1. **Phase 1:** Core rules + CPU baseline + save/load.
2. **Phase 2:** Expanded rules coverage + UI polish + rule explanations.
3. **Phase 3:** CPU enhancements + scenario variants.

## 13. Risks & Mitigations
- **Risk:** Rules complexity causes slow UI performance.
  - **Mitigation:** Use memoization and canvas-based rendering if needed.
- **Risk:** Conformance suite grows large and slows CI.
  - **Mitigation:** Split suites and parallelize tests.
- **Risk:** CPU behavior feels weak or random.
  - **Mitigation:** Add heuristic scoring and scripted opening strategies.

## 14. Open Questions
- Preferred rendering approach: SVG (react-hexgrid) vs canvas (pixi.js)? (Default to SVG.)
- Minimum CPU difficulty tiers needed at launch? (Single difficulty for now.)
- Must-have rules for Phase 1:
  - Core diplomacy (activation/deactivation of kingdoms + card modifiers)
  - Movement of all land unit types across all terrain types
  - Core siege rules
  - Combat (including retreat of defending player and multi-stack combat)
  - Events and their impact
  - Victory point allocation and tracking
- Out of scope unless trivial to add: edge cases, naval rules, ambassador duels, monarch assassination, leader fate, forced peace, eliminated players rejoining.
