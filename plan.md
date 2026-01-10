# Divine Right Solo Play Webapp - Implementation Plan

## Executive Summary

A client-side webapp for solo play of Divine Right (Third Edition), starting with the Basic Game rules. The player controls one kingdom against an AI opponent controlling the other. Built with React + Vite, deployed to GitHub Pages as a PWA.

---

## 1. Technology Stack

### Frontend (Client-Side Only)
| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | React 18 + Vite | Complex game state benefits from React's declarative model. Vite has excellent GitHub Pages deployment and PWA support |
| **Language** | TypeScript | Type safety critical for complex game rules; catches bugs early |
| **Styling** | CSS Modules or Tailwind CSS | Scoped styles, mobile-responsive utilities |
| **State Management** | Zustand or useReducer + Context | Lightweight, serializable state for save/load |
| **Build Tool** | Vite | Fast dev server, easy static deployment |
| **PWA** | vite-plugin-pwa | Service worker generation, offline support |

### Why Not Vanilla JS?
While vanilla JS would work, the game has:
- 500+ hex map state
- Multiple unit positions
- Complex turn phases
- Card hands (hidden/revealed)
- AI decision trees

React's component model and state management will reduce bugs and make the codebase maintainable. The bundle size (~40kb gzipped) is acceptable.

### If This Creates Deployment Issues
If GitHub Pages + React proves problematic, we can fall back to:
1. Preact (3kb React alternative, drop-in compatible)
2. Vanilla JS with a simple reactive state library
3. Deploy to Render/Vercel (still free tier, still static)

**Verdict: React + Vite is low-risk for GitHub Pages. Thousands of games use this stack.**

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ HexBoard │ │ UnitPanel│ │ CardHand │ │ PhaseControls│   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │ dispatches Actions
┌─────────────────────────▼───────────────────────────────────┐
│                    Game Engine                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │ GameState   │ │ Rules       │ │ ActionProcessor    │   │
│  │ (immutable) │ │ Validators  │ │ (command pattern)  │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │ queries state
┌─────────────────────────▼───────────────────────────────────┐
│                    AI System                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │ AIPlayer    │ │ Strategies  │ │ ActionGenerator    │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Decision: Command Pattern

**Every game mutation goes through an Action:**
```typescript
type GameAction =
  | { type: 'MOVE_UNIT'; unitId: string; path: HexCoord[] }
  | { type: 'DECLARE_SIEGE'; castleId: string; attackerIds: string[] }
  | { type: 'RESOLVE_COMBAT'; attackerHex: HexCoord; defenderHex: HexCoord }
  | { type: 'PLAY_DIPLOMACY_CARD'; cardId: string; target: string }
  // ... etc
```

**Why this matters for future multiplayer:**
- Actions are serializable → can send over network
- Actions can be logged → replay/undo, play-by-post
- Actions can be validated → server can verify legality
- No extra work now, huge benefit later

---

## 3. Domain Model

### 3.1 Core Entities

```typescript
// === COORDINATES ===
interface HexCoord {
  q: number;  // axial coordinate
  r: number;  // axial coordinate
}

// === MAP ===
interface GameMap {
  hexes: Map<string, Hex>;  // key = "q,r"
  kingdoms: Kingdom[];
  castles: Castle[];
  scenicHexes: ScenicHex[];
}

interface Hex {
  coord: HexCoord;
  terrain: TerrainType;
  kingdomId: string | null;  // null = unclaimed
  castleId: string | null;
  scenicType: ScenicHexType | null;
}

type TerrainType =
  | 'clear' | 'forest' | 'hills' | 'mountains' | 'mountain_pass'
  | 'swamp' | 'minor_river' | 'major_river' | 'coast' | 'sea' | 'lake';

// === KINGDOMS ===
interface Kingdom {
  id: string;
  name: string;
  color: string;  // from rulebook
  royalCastleId: string;
  coatOfArms: string;  // emoji or SVG reference
  armyCount: number;
  fleetCount: number;  // 0 for MVP (no naval)
}

// === UNITS ===
interface Unit {
  id: string;
  type: UnitType;
  kingdomId: string;
  position: HexCoord;
  movementAllowance: number;
  isInsideCastle: boolean;  // for siege rules
  specialAbilities: SpecialAbility[];
}

type UnitType =
  | 'monarch' | 'army' | 'fleet' | 'ambassador'
  | 'mercenary_army' | 'mercenary_fleet';

// === CASTLES ===
interface Castle {
  id: string;
  name: string;
  coord: HexCoord;
  kingdomId: string;
  intrinsicDefense: number;  // 1-6
  isRoyalCastle: boolean;
  isPort: boolean;
  isPlundered: boolean;
}

// === CARDS ===
interface IdentityCard {
  kingdomId: string;
  kingName: string;
  queenName: string;
  royalCastleName: string;
  armyCount: number;
  fleetCount: number;
}

interface PersonalityCard {
  id: number;
  name: string;
  description: string;
  effects: PersonalityEffect[];
}

interface DiplomacyCard {
  id: number;
  name: string;
  modifier: number;
  type: 'diplomatic_ploy' | 'special_mercenary';
  sideEffects: string[];  // e.g., "banishment on failure"
}

// === GAME STATE ===
interface GameState {
  // Meta
  turn: number;
  phase: GamePhase;
  playerOrder: string[];  // player IDs for this turn
  currentPlayerIndex: number;

  // Map & Units
  map: GameMap;
  units: Map<string, Unit>;

  // Players
  players: Player[];

  // Cards
  diplomacyDeck: DiplomacyCard[];
  diplomacyDiscard: DiplomacyCard[];
  personalityDeck: PersonalityCard[];

  // Alliances
  alliances: Alliance[];  // which non-player kingdoms allied to which player

  // Sieges
  activeSieges: Siege[];

  // Victory
  victoryPoints: Map<string, number>;

  // Tracking
  diplomaticPenalties: Map<string, string[]>;  // playerId -> kingdomIds violated
  banishments: Banishment[];

  // Random state
  rngSeed: number;  // for reproducible randomness
}

type GamePhase =
  | 'setup'
  | 'player_order_determination'
  | 'events'
  | 'draw_diplomacy_card'
  | 'diplomacy'
  | 'siege_resolution'
  | 'movement'
  | 'combat'
  | 'end_turn'
  | 'game_over';
```

### 3.2 Faction Colors (from Rulebook)

```typescript
const KINGDOM_COLORS: Record<string, string> = {
  'hothior':    '#8B4513',  // brown
  'mivior':     '#4169E1',  // royal blue
  'muetar':     '#228B22',  // forest green
  'shucassam':  '#FFD700',  // gold
  'immer':      '#DC143C',  // crimson
  'pon':        '#800080',  // purple
  'rombune':    '#000000',  // black
  'neuth':      '#90EE90',  // light green (elves)
  'zorn':       '#8B0000',  // dark red (goblins)
  'ghem':       '#A0522D',  // sienna (dwarves)
  'trolls':     '#556B2F',  // dark olive
  'eaters':     '#E6E6FA',  // lavender (magicians - advanced)
  'blackhand':  '#2F4F4F',  // dark slate (magicians - advanced)
};
```

---

## 4. Business Logic Modules

### 4.1 Module Breakdown

```
src/
├── engine/
│   ├── state/
│   │   ├── GameState.ts        # State type definitions
│   │   ├── initialState.ts     # Game setup
│   │   └── selectors.ts        # Derived state queries
│   │
│   ├── actions/
│   │   ├── types.ts            # Action type definitions
│   │   ├── movement.ts         # Move validation & execution
│   │   ├── combat.ts           # Combat resolution
│   │   ├── siege.ts            # Siege mechanics
│   │   ├── diplomacy.ts        # Diplomatic actions
│   │   ├── events.ts           # Random events
│   │   └── reducer.ts          # Main action processor
│   │
│   ├── rules/
│   │   ├── terrain.ts          # Movement costs, combat modifiers
│   │   ├── stacking.ts         # Stacking rules
│   │   ├── zones.ts            # Zone of siege calculations
│   │   ├── victory.ts          # Victory point calculations
│   │   └── leaders.ts          # Leader fate, bonuses
│   │
│   ├── map/
│   │   ├── hexUtils.ts         # Hex math (neighbors, distance, pathfinding)
│   │   ├── mapData.ts          # Minaria map definition
│   │   └── territories.ts      # Kingdom boundaries
│   │
│   └── dice.ts                 # Seeded random number generation
│
├── ai/
│   ├── AIPlayer.ts             # AI decision-making coordinator
│   ├── strategies/
│   │   ├── movement.ts         # Where to move units
│   │   ├── combat.ts           # When/what to attack
│   │   ├── diplomacy.ts        # Activation priorities
│   │   └── siege.ts            # Siege decisions
│   └── evaluation.ts           # Board position evaluation
│
├── ui/
│   ├── components/
│   │   ├── board/
│   │   │   ├── HexGrid.tsx
│   │   │   ├── Hex.tsx
│   │   │   ├── Unit.tsx
│   │   │   └── Castle.tsx
│   │   ├── cards/
│   │   │   ├── CardHand.tsx
│   │   │   ├── DiplomacyCard.tsx
│   │   │   └── PersonalityCard.tsx
│   │   ├── controls/
│   │   │   ├── PhaseIndicator.tsx
│   │   │   ├── ActionPanel.tsx
│   │   │   └── DiceRoller.tsx
│   │   └── info/
│   │       ├── KingdomInfo.tsx
│   │       ├── VictoryTrack.tsx
│   │       └── TurnLog.tsx
│   │
│   ├── hooks/
│   │   ├── useGameState.ts
│   │   ├── useHexInteraction.ts
│   │   └── useAITurn.ts
│   │
│   └── App.tsx
│
├── data/
│   ├── kingdoms.json           # Kingdom definitions
│   ├── map.json                # Hex grid data
│   ├── cards.json              # Card definitions
│   └── personalities.json      # Personality card data
│
└── storage/
    └── persistence.ts          # LocalStorage save/load
```

### 4.2 Critical Business Logic Details

#### Movement System
```typescript
// Terrain costs (from rulebook p.11-12)
const TERRAIN_COSTS: Record<TerrainType, number> = {
  clear: 1,
  forest: 2,
  hills: 2,
  mountains: 3,  // must stop after entering
  mountain_pass: 2,
  swamp: 2,
  minor_river: 2,
  major_river: 2,  // special: must start turn in hex to cross
  coast: 1,
  sea: 1,  // fleets only
  lake: Infinity,  // cannot cross lake hexsides
};

// Home territory bonus: all units treat forest/hills as clear in own kingdom
```

#### Combat Resolution
```typescript
function resolveCombat(
  attackers: Unit[],
  defenders: Unit[],
  terrain: TerrainType,
  modifiers: CombatModifier[]
): CombatResult {
  const attackerStrength = attackers.length;
  const defenderStrength = defenders.length;

  // Calculate odds modifier: floor(larger/smaller) - 1
  const ratio = Math.max(attackerStrength, defenderStrength) /
                Math.min(attackerStrength, defenderStrength);
  const oddsModifier = Math.floor(ratio) - 1;

  // Terrain modifiers
  let defenderBonus = 0;
  if (terrain === 'mountains') defenderBonus += 1;
  if (terrain === 'mountain_pass') defenderStrength *= 2;  // doubled

  // Roll dice
  const attackerRoll = rollDie() + (attackerStrength > defenderStrength ? oddsModifier : 0);
  const defenderRoll = rollDie() + defenderBonus +
                       (defenderStrength > attackerStrength ? oddsModifier : 0);

  // Resolve
  if (attackerRoll > defenderRoll) {
    return { loser: 'defender', losses: attackerRoll - defenderRoll };
  } else if (defenderRoll > attackerRoll) {
    return { loser: 'attacker', losses: defenderRoll - attackerRoll };
  } else {
    return { loser: 'both', losses: attackerRoll };  // tie: both lose die value
  }
}
```

#### Siege Zone Calculation
```typescript
function canDeclareSiege(
  castle: Castle,
  besiegingUnits: Unit[],
  defendingUnits: Unit[]
): boolean {
  // 1. Castle must be surrounded by units or their zones of siege
  const surroundingHexes = getNeighbors(castle.coord);
  const coveredHexes = new Set<string>();

  for (const unit of besiegingUnits) {
    if (isAdjacent(unit.position, castle.coord)) {
      // Unit covers its hex and extends zone one hex each direction around castle
      coveredHexes.add(coordToKey(unit.position));
      for (const neighbor of getNeighbors(castle.coord)) {
        if (isWithinOneOfUnit(neighbor, unit.position, castle.coord)) {
          coveredHexes.add(coordToKey(neighbor));
        }
      }
    }
  }

  const allSurrounded = surroundingHexes.every(h => coveredHexes.has(coordToKey(h)));

  // 2. No defending units "outside" the castle
  const defendersOutside = defendingUnits.filter(u =>
    coordEquals(u.position, castle.coord) && !u.isInsideCastle
  );
  if (defendersOutside.length > 0) return false;

  // 3. Besieging units >= defenders inside + intrinsic defense
  const defendersInside = defendingUnits.filter(u =>
    coordEquals(u.position, castle.coord) && u.isInsideCastle
  );
  const requiredStrength = defendersInside.length + castle.intrinsicDefense;
  const besiegingStrength = besiegingUnits.filter(u =>
    isAdjacent(u.position, castle.coord)
  ).length;

  return allSurrounded && besiegingStrength >= requiredStrength;
}
```

#### Diplomacy
```typescript
function attemptActivation(
  ambassador: Unit,
  targetKingdom: Kingdom,
  personalityCard: PersonalityCard,
  diplomacyCard: DiplomacyCard | null,
  diplomaticPenalty: boolean
): ActivationResult {
  let roll = rollDie();

  // Apply diplomacy card modifier
  if (diplomacyCard) {
    roll += diplomacyCard.modifier;
  }

  // Apply personality card modifiers
  roll += getPersonalityModifier(personalityCard, diplomacyCard?.type);

  // Apply diplomatic penalty (-1 for having violated this kingdom)
  if (diplomaticPenalty) {
    roll -= 1;
  }

  // Success on 6+
  const success = roll >= 6;

  // Check for banishment on failure with certain cards
  let banished = false;
  if (!success && diplomacyCard?.sideEffects.includes('banishment_on_failure')) {
    banished = true;
  }

  return { success, roll, banished };
}
```

---

## 5. AI Opponent System

### 5.1 AI Architecture

```typescript
interface AIPlayer {
  playerId: string;
  kingdomId: string;

  // Called when it's AI's turn for each phase
  decideAction(state: GameState, phase: GamePhase): GameAction | null;
}

class SimpleRuleAI implements AIPlayer {
  // Priority-based decision making

  decideDiplomacy(state: GameState): GameAction | null {
    // Priority 1: Activate kingdom with most armies adjacent to enemy
    // Priority 2: Activate kingdom with good personality card bonus
    // Priority 3: Save card if nothing good available
  }

  decideMovement(state: GameState): GameAction[] {
    // Rule 1: Move units toward nearest enemy castle
    // Rule 2: Concentrate forces (don't spread thin)
    // Rule 3: Protect own royal castle if threatened
    // Rule 4: Move monarch with army for combat bonus
  }

  decideCombat(state: GameState): GameAction[] {
    // Rule 1: Attack if odds >= 2:1
    // Rule 2: Don't attack into mountains unless 3:1+
    // Rule 3: Prioritize attacking units outside castles
  }

  decideSiege(state: GameState): GameAction[] {
    // Rule 1: Attempt siege if requirements met
    // Rule 2: Prioritize royal castles (more victory points)
  }
}
```

### 5.2 AI Decision Flow

```
Each AI Turn:
1. Events Phase: Automatic (dice roll)
2. Diplomacy Phase:
   - Evaluate each neutral kingdom
   - Score by: army count, proximity to player, personality bonus
   - Attempt activation of highest-scored kingdom
3. Siege Phase:
   - Check all potential sieges
   - Roll for each valid siege
4. Movement Phase:
   - Generate all legal moves
   - Score each unit's possible destinations
   - Execute moves in priority order (threatened units first)
5. Combat Phase:
   - Identify all possible attacks
   - Calculate expected outcomes
   - Execute attacks with positive expected value
```

---

## 6. UI/UX Design

### 6.1 Mobile-First Layout

```
┌─────────────────────────────────────┐
│  Turn 5 | Phase: Movement | ⚙️ 💾   │  <- Header (sticky)
├─────────────────────────────────────┤
│                                     │
│                                     │
│         [Hex Map - Scrollable       │  <- Main area (70% height)
│          Pannable, Zoomable]        │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  [Selected Unit/Hex Info]           │  <- Context panel (collapsible)
├─────────────────────────────────────┤
│  [Phase Actions]  [End Phase]       │  <- Action bar (sticky bottom)
│  🎴 Cards (3)     [End Turn]        │
└─────────────────────────────────────┘
```

### 6.2 Hex Rendering (Simple SVG)

```typescript
// Each hex is a simple SVG polygon with:
// - Fill color based on terrain
// - Border color based on kingdom (or grey if unclaimed)
// - Unit icons as emoji overlays

const TERRAIN_COLORS: Record<TerrainType, string> = {
  clear: '#90EE90',      // light green
  forest: '#228B22',     // forest green
  hills: '#DEB887',      // burlywood
  mountains: '#808080',  // gray
  mountain_pass: '#A9A9A9',
  swamp: '#556B2F',      // dark olive
  coast: '#F0E68C',      // khaki
  sea: '#4169E1',        // royal blue
  lake: '#87CEEB',       // sky blue
  minor_river: '#90EE90', // (drawn as line overlay)
  major_river: '#90EE90', // (drawn as line overlay)
};

const UNIT_EMOJI: Record<UnitType, string> = {
  monarch: '👑',
  army: '⚔️',
  fleet: '⛵',
  ambassador: '📜',
  mercenary_army: '💰',
  mercenary_fleet: '🏴‍☠️',
};

const CASTLE_EMOJI = '🏰';
const ROYAL_CASTLE_EMOJI = '🏯';
```

### 6.3 Touch Interactions

- **Tap hex**: Select hex, show info panel
- **Tap unit**: Select unit, show movement range
- **Tap destination**: Move selected unit (if legal)
- **Long press**: Show context menu (attack, siege, etc.)
- **Pinch**: Zoom map
- **Drag**: Pan map
- **Swipe up on bottom panel**: Expand to show cards

---

## 7. Data Persistence

### 7.1 Save Game Format

```typescript
interface SaveGame {
  version: string;  // for migration
  timestamp: number;
  gameState: GameState;
  actionLog: GameAction[];  // for replay/debugging
}

// Stored in localStorage
const STORAGE_KEY = 'divine_right_save';
const MAX_SAVE_SLOTS = 5;

function saveGame(state: GameState, slot: number): void {
  const saves = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  saves[slot] = {
    version: '1.0.0',
    timestamp: Date.now(),
    gameState: state,
    actionLog: state.actionLog,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
}

function loadGame(slot: number): GameState | null {
  const saves = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  return saves[slot]?.gameState || null;
}
```

### 7.2 Auto-Save

- Auto-save at end of each turn
- Auto-save before closing tab (beforeunload event)
- Keep last 3 auto-saves for recovery

---

## 8. Testing Strategy

### 8.1 Test Pyramid

```
        /\
       /  \      E2E Tests (Playwright)
      /    \     - Full game playthrough
     /──────\    - Critical user flows
    /        \
   /   Int.   \  Integration Tests (Vitest)
  /   Tests    \ - Multiple modules together
 /──────────────\- AI decision making
/                \
/   Unit Tests    \  Unit Tests (Vitest)
/  (Majority)      \ - All business logic
/────────────────────\- Pure functions
```

### 8.2 Critical Test Cases

```typescript
// Movement
describe('Movement', () => {
  test('unit cannot exceed movement allowance');
  test('terrain costs are applied correctly');
  test('home territory bonus reduces forest/hill cost');
  test('cannot enter hex with enemy units');
  test('mountains require stopping');
  test('major river requires starting turn in hex');
});

// Combat
describe('Combat', () => {
  test('odds modifier calculated correctly');
  test('mountain defender bonus applied');
  test('mountain pass doubles defense');
  test('tie results in mutual losses');
  test('leader fate roll triggered on losses');
});

// Siege
describe('Siege', () => {
  test('cannot declare siege without surrounding');
  test('zone of siege extends correctly');
  test('siege requires sufficient strength');
  test('siege roll modifiers calculated');
  test('plundered castle awards victory points');
});

// Diplomacy
describe('Diplomacy', () => {
  test('activation succeeds on 6+');
  test('deactivation requires 7+');
  test('diplomatic penalty applies');
  test('personality card modifiers apply');
  test('banishment occurs on failed threatening cards');
});
```

### 8.3 Game State Invariant Tests

```typescript
// Run after every action to catch bugs
function assertGameStateValid(state: GameState): void {
  // No two units in same hex (except stacking rules)
  // All units belong to valid kingdoms
  // Turn counter only increases
  // Victory points never decrease
  // Card counts are consistent
  // All hexes have valid coordinates
}
```

---

## 9. MVP Scope Definition

### 9.1 MVP Features (Must Have)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Hex map rendering with terrain | P0 | Medium |
| Unit placement and display | P0 | Low |
| Turn phase progression | P0 | Medium |
| Movement with terrain costs | P0 | Medium |
| Combat resolution | P0 | High |
| Siege mechanics | P0 | High |
| Basic diplomacy (activate/deactivate) | P0 | High |
| Random events | P0 | Medium |
| Victory point tracking | P0 | Low |
| Simple AI opponent | P0 | High |
| Save/Load game | P0 | Low |
| Mobile-responsive UI | P0 | Medium |
| 2-player game (human vs AI) | P0 | Low |

### 9.2 MVP Exclusions (Defer to Later)

| Feature | Reason for Deferral |
|---------|---------------------|
| Naval units (fleets) | Adds complexity, not essential for land-based gameplay |
| Sea transport | Requires fleet implementation |
| 3-6 player games | 2-player proves the concept |
| Advanced game rules | Explicit scope exclusion |
| Barbarians | Advanced game |
| Magicians | Advanced game |
| Special mercenaries | Advanced game |
| Temple of Kings | Advanced game |
| Greystaff | Advanced game |
| Online multiplayer | Future scope |
| Undo functionality | Nice-to-have |
| Game replay | Nice-to-have |
| Sound effects | Nice-to-have |
| Animations | Nice-to-have (simple transitions OK) |

### 9.3 MVP Kingdoms

For 2-player, use kingdoms with no fleets to simplify:
- **Player options**: Immer, Muetar, Pon, Ghem (Dwarves)
- **AI options**: Same pool
- **Non-player pool**: Remaining kingdoms (neutrals to activate)

Actually, looking at the rulebook, most kingdoms have fleets. Let's just:
- Include all 11 Basic Game kingdoms
- Simply not implement fleet movement/combat
- Fleets stay in port (decorative only for MVP)

---

## 10. Project Structure

```
dr3/
├── README.md
├── plan.md                 # This document
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── public/
│   ├── manifest.json       # PWA manifest
│   └── icons/              # App icons
├── src/
│   ├── main.tsx            # Entry point
│   ├── App.tsx             # Root component
│   ├── engine/             # Game logic (see section 4.1)
│   ├── ai/                 # AI system
│   ├── ui/                 # React components
│   ├── data/               # Static game data (JSON)
│   ├── storage/            # Persistence
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Helpers
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Pages deployment
```

---

## 11. CI/CD Pipeline

### 11.1 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

### 11.2 Development Workflow

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev

# Run tests
npm run test

# Type check
npm run typecheck

# Lint
npm run lint

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 12. Implementation Phases

### Phase 1: Foundation (MVP Core) ✅ COMPLETE
1. ✅ Project setup (Vite, React, TypeScript, PWA)
2. ✅ Hex grid rendering (flat-top hexes, proper tessellation)
3. ✅ Map data structure and terrain display
4. ✅ Unit display on map (with kingdom colors, movement state)
5. ✅ Basic state management (GameState with validation)
6. ✅ Map image overlay support (calibration infrastructure ready)
7. ✅ Unit testing (Vitest) and E2E setup (Playwright)
8. ✅ GitHub Pages deployment workflow

**Phase 1 Code Review Improvements** (added post-completion):
- ✅ CI/CD runs on Pull Requests (not just main)
- ✅ Eliminated duplicate build in CI pipeline
- ✅ Added ESLint with React/TypeScript rules
- ✅ Increased test coverage (23 → 98 tests)
- ✅ Seeded RNG for reproducible game state
- ✅ Fixed faction capitals and added comprehensive faction data (`src/engine/data/factions.ts`)
- ✅ All 11 factions with cities, coordinates, and starting unit counts

**Note**: Currently using 25th Anniversary Edition map image which has correct
geography but slightly different kingdom colors than the true 3rd Edition.
TODO: Find/obtain authentic Divine Right 3rd Edition map image for final release.

**Edition Naming Differences** (DR25 hex data vs DR3 rulebook):
- DR3 "Stone Face" = DR25 "The Face"
- DR3 "The Gathering" = DR25 "The Digs"
- DR3 "Khuzdul" = DR25 "Kuzdol"

**Known Discrepancies (25th Ann. vs DR3)**:
- Sea of Zett: Larger in DR3 than in 25th Anniversary Edition hex data
- Kingdom colors: May differ slightly between editions
- The hex data was generated from dr25hexdata.py (25th Anniversary source)
- Visual verification needed for: castle positions, terrain boundaries, named locations

### Phase 2: Game Flow

**Infrastructure Prerequisites** (from Phase 1 code review):
- [ ] State management refactor (Zustand or useReducer with action dispatch)
- [ ] Error boundaries for graceful crash recovery
- [ ] HexGrid performance optimization (virtualization for 1000+ hexes)
- [ ] Cross-browser E2E testing (Safari/iOS - primary test platform)

**Game Flow Implementation**:
6. Turn phase system
7. Player order determination
8. Random events table
9. Phase transitions
10. End turn / End game detection

### Phase 3: Core Mechanics
11. Movement system with pathfinding
12. Movement validation and costs
13. Combat system
14. Leader fate rolls
15. Retreat before combat

### Phase 4: Sieges
16. Zone of siege calculation
17. Siege declaration
18. Siege resolution
19. Castle plundering
20. Victory points

### Phase 5: Diplomacy
21. Diplomacy card system
22. Activation attempts
23. Deactivation attempts
24. Personality card effects
25. Ambassador mechanics

### Phase 6: AI
26. AI turn structure
27. AI movement decisions
28. AI combat decisions
29. AI diplomacy decisions
30. AI siege decisions

### Phase 7: Polish
31. Save/Load system
32. Mobile UI refinement
33. Tutorial/help overlay
34. Bug fixes from playtesting

---

## 13. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Map data entry is tedious | High | Medium | Generate from image or find existing hex data |
| Siege rules are complex | High | High | Implement iteratively, test extensively |
| AI is too easy/hard | Medium | Medium | Add difficulty settings, tune through playtesting |
| GitHub Pages issues | Low | Low | Fallback to Vercel/Netlify |
| Mobile performance | Medium | Medium | Virtualize hex grid, lazy load |
| State management complexity | Medium | High | Start simple (useReducer), upgrade if needed |

---

## 14. Open Questions

1. **Map Data**: Do we need to manually transcribe all ~500 hexes, or is there existing digital data for the DR3 map?

2. **Card Text**: Should personality/diplomacy cards show full text, or just mechanical effects?

3. **AI Visibility**: Should the player see what the AI is "thinking"? (Helps with learning, but breaks immersion)

4. **Tutorial**: Is an interactive tutorial needed for MVP, or is a rules reference sufficient?

5. **Dice Animation**: Should dice rolls be animated, or just show results?

---

## 15. Success Criteria for MVP

- [ ] Can start a new 2-player game (human vs AI)
- [ ] Can complete full 20-turn game
- [ ] All Basic Game rules implemented (except naval)
- [ ] AI makes reasonable (not random) decisions
- [ ] Game state persists across browser sessions
- [ ] Works on mobile (iPhone/Android Chrome)
- [ ] Works offline after first load
- [ ] Deployed and accessible via GitHub Pages URL
- [ ] No game-breaking bugs in 3 consecutive playthroughs

---

## Appendix A: Map Data Format

The Minaria map will be stored as JSON:

```json
{
  "hexes": [
    {
      "q": 0,
      "r": 0,
      "terrain": "clear",
      "kingdom": "hothior",
      "castle": null,
      "scenic": null
    },
    {
      "q": 1,
      "r": 0,
      "terrain": "forest",
      "kingdom": "hothior",
      "castle": null,
      "scenic": null
    },
    {
      "q": 5,
      "r": 3,
      "terrain": "clear",
      "kingdom": "hothior",
      "castle": {
        "id": "port_lork",
        "name": "Port Lork",
        "defense": 4,
        "isRoyal": true,
        "isPort": true
      },
      "scenic": null
    }
  ],
  "rivers": [
    {
      "type": "major",
      "hexes": [[3,2], [3,3], [4,3], [4,4]]
    }
  ]
}
```

---

## Appendix B: Personality Card Data

```json
{
  "personalityCards": [
    {
      "id": 1,
      "name": "Loyal",
      "description": "This monarch is a noble and faithful friend.",
      "effects": {
        "deactivation": "immune",
        "combatBonus": 0,
        "movementBonus": 0
      }
    },
    {
      "id": 2,
      "name": "Warlike",
      "description": "This monarch loves battle.",
      "effects": {
        "activationBonus": 1,
        "combatBonus": 1
      }
    }
    // ... etc
  ]
}
```

---

## Appendix C: Useful Libraries

| Purpose | Library | Notes |
|---------|---------|-------|
| State | Zustand | Simpler than Redux, good for games |
| Hex Math | honeycomb-grid | Hex grid utilities |
| Pathfinding | ngraph.path | A* for movement |
| Random | seedrandom | Seeded RNG for reproducibility |
| PWA | vite-plugin-pwa | Service worker generation |
| Testing | Vitest | Fast, Vite-native |
| E2E | Playwright | Cross-browser testing |

---

*Last updated: 2026-01-09*
*Version: 1.2.0 - Phase 1 Complete + Code Review Improvements*
