# DR3 - Divine Right Webapp

## Definition of Complete & Good
### 1. Complete (Definition of Done)
A feature or task is **Complete** only when:
* **Business Logic:** Implements the required logic as verified by passing the full **Conformance Suite** (once this exists).
* **Testing:** Passes all relevant **Unit Tests** and **End-to-End (E2E) Tests** with no regressions.
* **Full Stack:** Both Frontend and Backend components are implemented and integrated (unless explicitly scoped to a single layer).
* **Pipeline:** All changes successfully pass the **CI/CD** pipeline.

### 2. Good (Definition of Quality)
Code and assets are considered **Good** when they are:
* **Clean:** Follow TDD principles. Keep a separation of concerns and don't repeat yourself. There are useful principles in SOLID that you should follow. Prioritise maintainable code and design. This project utilises reference documents from the physical board game for rules and game pieces; these are thr ultimate source of truth. You must write code that complies with this conformance suite.
* **Efficient:** Avoids unnecessary complexity or performance bottlenecks. Prefer small patch-style edits to wholesale rewrites.
* **Documented:** Clear code does not need inline comments and documentation. If code is unclear when you first write it, refactor it to be simpler first. Leave inline comments only for unusual or edge cases. Update relevant documentation when large changes to features or architecture are implemented.

## Learnings

**Conformance Suite Design:** Declarative JSON test specs are specification-first, not TDD. Include negative test cases (what's NOT allowed), not just happy paths. Use rule references to existing JSON for traceability — avoid duplicating rule text in test cases.

**Learning:** Validation harness should enforce schema parity with integration tests.

**Learning:** Rule references must be 2-3 parts (e.g., `25.2` or `25.2.2`), not 4+ parts — group sub-rules under parent.

## First Steps
TBD

## Verify Changes
TBD

## Workflow Reminder
- At the end of each completed task, always:
  1. Commit the changes.
  2. Open a PR with those committed changes.
- For each new feature or significant work package:
  1. Create a new branch before making changes.
  2. Push that branch to `origin`.
  3. Open a PR from that branch.

## Key Resources
- **docs/plans/** - Working plans
- **docs/refs/** - Reference data stored in minified format for LLM use:

| Original Files | Minified Files | Description |
|----------------|----------------|-------------|
| `hexmap.json` | `hexmap.min.json` | Hex grid map data |
| `factions.json` | `factions.min.json` | Faction definitions |
| `starting_units.json` | `starting_units.min.json` | Unit deployment data |
| `abilities.json` | `abilities.min.json` | Unit ability definitions |
| `personality_cards.json` | `personality_cards.min.json` | Monarch personality cards |
| `dr3_rules.json` | `dr3_rules.min.json` | Game rules reference |

Never modify a file in /docs/refs unless given specific permission to do so.

## Architecture
TBD

## Skills
You have skills in `.claude/skills/` - use them for debugging, TDD, planning, code review, etc.
