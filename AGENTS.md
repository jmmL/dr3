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
* **Clean:** Follows project style guides (linting/formatting) and uses meaningful variable names.
* **Efficient:** Avoids unnecessary complexity or performance bottlenecks.
* **Documented:** Includes clear comments for complex logic and updates `README.md` or API docs if architecture changes.


## First Steps
TBD

## Verify Changes
TBD

## Key Resources
- **docs/plans/** - Working plans
- **docs/refs/** - READ-ONLY source data (in JSON and Markdown) comprising the Rules, information about Factions, the Hexmap and Starting Units. These form the basis of the physical game that is being replicated, and are the ultimate source of truth. They are the basis for the future conformance suite. Never modify these files.

## Architecture
TBD

## Skills
You have skills in `.claude/skills/` - use them for debugging, TDD, planning, code review, etc.
Never attempt to launch sub-agents, as you are running in web sandbox, and are unable to do so within your current sandbox. 