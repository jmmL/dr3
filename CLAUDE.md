# CLAUDE.md - Best Practices for Divine Right 3

This file contains guidelines and best practices discovered during codebase reviews and development. These help maintain code quality and ensure consistent development practices.

## Project Overview

Divine Right 3 (DR3) is a web-based implementation of the Divine Right board game using:
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: CSS (vanilla)
- **Testing**: Vitest (unit/component) + Playwright (E2E)
- **Deployment**: GitHub Pages via GitHub Actions

## Code Organization

### Directory Structure

```
src/
├── components/     # React UI components
├── data/          # Static game data (map hexes, terrain)
├── engine/        # Game logic
│   ├── data/      # Game data structures (factions, units)
│   ├── state/     # State management (initialState, GameState)
│   └── utils/     # Utilities (random, helpers)
├── hooks/         # Custom React hooks
└── types/         # TypeScript type definitions

e2e/
├── pages/         # Page Object Model classes
└── *.spec.ts      # E2E test files organized by user story
```

### Key Files

- `src/engine/data/factions.ts` - Authoritative faction data (capitals, armies, fleets)
- `src/engine/state/initialState.ts` - Game state initialization
- `src/data/mapData.ts` - Hex grid data imported from JSON
- `plan.md` - Project development plan and phases

## Testing Best Practices

### Unit/Component Tests (Vitest)

1. **Test file location**: Co-locate test files with source (e.g., `mapData.test.ts` next to `mapData.ts`)

2. **Test structure**: Use describe blocks to group related tests
   ```typescript
   describe('ComponentName', () => {
     describe('feature area', () => {
       it('specific behavior', () => { ... })
     })
   })
   ```

3. **Avoid testing implementation details**: Test behavior and outputs, not internal state

4. **Use data-driven tests for validation**:
   ```typescript
   const kingdoms = ['hothior', 'mivior', 'muetar']
   for (const kingdom of kingdoms) {
     it(`${kingdom} has valid configuration`, () => { ... })
   }
   ```

### E2E Tests (Playwright)

1. **Use Page Object Model**: Encapsulate selectors and actions in `e2e/pages/` classes
   ```typescript
   // Good - uses page object
   const gamePage = new GamePage(page)
   await gamePage.clickHex(10)

   // Avoid - raw selectors in tests
   await page.locator('.hex').nth(10).click()
   ```

2. **Organize by user story**: Group tests around what users want to accomplish
   ```typescript
   test.describe('Hex Selection', () => {
     // User Story: As a player, I want to select hexes...
   })
   ```

3. **Multi-browser testing**: Configure Playwright for Chrome, Safari/WebKit, and mobile viewports
   - iOS Safari is a primary mobile target
   - Test landscape orientation for tablets/phones

4. **Visual testing**: Use screenshots for regression testing with tolerance for anti-aliasing

5. **Avoid hardcoded waits**: Use Playwright's auto-waiting
   ```typescript
   // Good - auto-waits
   await expect(gamePage.hexGrid).toBeVisible()

   // Avoid - arbitrary timeouts
   await page.waitForTimeout(1000)
   ```

## Game Data Best Practices

### Edition Differences (DR25 vs DR3)

The hex data comes from the 25th Anniversary Edition which uses different names:
- Stone Face → The Face (DR25)
- The Gathering → The Digs (DR25)
- Khuzdul → Kuzdol (DR25)

### Faction Capital Locations

Capital locations in `factions.ts` are the authoritative source. Not all capitals have the CASTLE terrain flag in hex data - some are cities/locations without fortifications.

### Player Factions (7 total)

| Faction    | Race    | Capital          | Location |
|------------|---------|------------------|----------|
| Hothior    | Human   | Port Lork        | 9,17     |
| Mivior     | Human   | Pennol           | 25,17    |
| Muetar     | Human   | Altarr           | 4,6      |
| Shucassam  | Human   | Marzarbol        | 8,2      |
| Immer      | Human   | The Pits         | 23,3     |
| Pon        | Human   | Adeese           | 32,5     |
| Rombune    | Human   | Tower of Zards   | 28,28    |

### Non-Player Factions (4 total)

| Faction | Race   | Capital              | Location |
|---------|--------|----------------------|----------|
| Neuth   | Elves  | Elfland              | 18,10    |
| Zorn    | Goblin | The Face             | 18,26    |
| Ghem    | Dwarf  | Mines of Rosengg     | 10,27    |
| Aws     | Troll  | The Digs             | 16,21    |

## Reproducibility

### Seeded Random Number Generation

Always use `SeededRNG` from `src/engine/utils/random.ts` for game-affecting randomness:

```typescript
import { SeededRNG } from './utils/random'

const rng = new SeededRNG(gameSeed)
const roll = rng.rollDice(2, 6)  // 2d6
const choice = rng.pick(options)  // Random selection
```

This ensures:
- Games can be replayed with the same seed
- Bug reproduction is possible
- Testing is deterministic

## CI/CD Best Practices

### GitHub Actions Workflow

1. **Run on all PRs**: Validate changes before merge
   ```yaml
   on:
     push:
       branches: ['main']
     pull_request:
       branches: ['main']
   ```

2. **Avoid duplicate builds**: Use artifact passing between jobs
   ```yaml
   - uses: actions/upload-artifact@v4
     with:
       name: dist
       path: dist/
   ```

3. **Lint in CI**: Catch issues early
   ```yaml
   - run: npm run lint
   ```

### Build Configuration

- `npm run build` - Production build to `dist/`
- `npm run preview` - Local preview of production build
- `npm run test` - Run Vitest unit/component tests
- `npm run e2e` - Run Playwright E2E tests
- `npm run lint` - ESLint check

## Performance Considerations

### HexGrid Rendering

The hex grid renders ~1070 hexes. Performance optimizations to consider:
- React.memo for hex components
- Virtualization for off-screen hexes
- Canvas/WebGL for intensive rendering

### State Management

Currently using React's useState. For complex state:
- Consider useReducer for game state
- Zustand for global state if needed
- Avoid prop drilling through too many layers

## Common Patterns

### Type-Safe Kingdom IDs

```typescript
type KingdomId = 'hothior' | 'mivior' | 'muetar' | 'shucassam' | 'immer' | 'pon' | 'rombune'
```

### Hex Coordinate Keys

```typescript
function coordToKey(coord: HexCoord): string {
  return `${coord.col},${coord.row}`
}
```

### Terrain Flag Checking

```typescript
import { TerrainFlags, hasTerrain } from '../types'

if (hasTerrain(hex.terrain, TerrainFlags.CASTLE)) {
  // Hex has a castle
}
```

## Error Handling

### Game Setup Errors

Use `GameSetupError` for configuration issues:

```typescript
import { GameSetupError } from './initialState'

if (!kingdom) {
  throw new GameSetupError(`Kingdom '${id}' not found`)
}
```

### Validation at Boundaries

- Validate user input and external data
- Trust internal code and data structures
- Don't over-validate internal function calls

## Future Considerations

These items are documented for Phase 2+ development:

1. **State Management**: Consider centralized state for complex game logic
2. **Error Boundaries**: Add React error boundaries for graceful failure handling
3. **Accessibility**: Ensure keyboard navigation and screen reader support
4. **Performance Monitoring**: Track render times for HexGrid optimization

---

*Last updated: Phase 1 completion - CI/CD, testing, faction data*
