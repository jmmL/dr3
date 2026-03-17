# Dependency Audit Triage (2026-03-17)

Current `npm audit --json` status:

- Total: `8`
- High: `4`
- Moderate: `3`
- Low: `1`

## Triage summary

### Explicitly accepted for now

- `boardgame.io` -> `svelte` advisory chain
  - The recommended npm fix downgrades `boardgame.io` to `0.39.14`, which is a semver-major regression for this repo.
  - This project is a static client app and does not use Svelte SSR directly.
  - Action: accept temporarily, revisit during a broader boardgame.io upgrade/replacement decision.

### Fixable but deferred

- `rollup`
  - Action: revisit with a broader Vite upgrade once the recovery slice is stable.
- `minimatch`, `ajv`, `qs`, `flatted`, `koa`
  - These are transitive advisories. The repo should prefer dependency tree upgrades over scattered overrides where practical.

## Policy

- Audit findings must be triaged explicitly, not ignored silently.
- If a fix requires a breaking framework/runtime downgrade, document the acceptance and the rationale.
- Re-run `npm run audit:json` after dependency upgrades and update this file.
