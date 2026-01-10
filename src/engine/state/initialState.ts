/**
 * Divine Right Initial Game State Setup
 * Creates a new game with initial configuration
 */

import {
  GameState,
  Player,
  Kingdom,
  Castle,
  Unit,
  KingdomId,
  HexCoord,
  coordToKey,
} from './GameState'
import { getCastles, getRoyalCastles, MAP_COLS, MAP_ROWS } from '../../data/mapData'
import { KingdomColors, TerrainFlags, hasTerrain } from '../../types'
import { SeededRNG } from '../utils/random'

/**
 * Normalize a castle name to an ID
 * Handles special characters, whitespace, and escaping from JSON
 */
function normalizeCastleId(name: string): string {
  return name
    .toLowerCase()
    .replace(/\\'/g, "'")      // Unescape JSON apostrophes
    .replace(/[^a-z0-9]+/g, '_')  // Replace non-alphanumeric with underscore
    .replace(/^_|_$/g, '')     // Trim leading/trailing underscores
}

// Kingdom definitions with starting armies
// Only includes player-controllable kingdoms with verified royal castle IDs
const KINGDOM_DEFINITIONS: Omit<Kingdom, 'color'>[] = [
  { id: 'hothior', name: 'Hothior', royalCastleId: 'ider_bolis', coatOfArms: '🦅', armyCount: 6, fleetCount: 0, isPlayerKingdom: true },
  { id: 'mivior', name: 'Mivior', royalCastleId: 'pennol', coatOfArms: '🦁', armyCount: 5, fleetCount: 2, isPlayerKingdom: true },
  { id: 'muetar', name: 'Muetar', royalCastleId: 'castle_altarr', coatOfArms: '🐺', armyCount: 4, fleetCount: 0, isPlayerKingdom: true },
  { id: 'shucassam', name: 'Shucassam', royalCastleId: 'marzarbol', coatOfArms: '🐍', armyCount: 5, fleetCount: 1, isPlayerKingdom: true },
  { id: 'immer', name: 'Immer', royalCastleId: 'the_pits', coatOfArms: '🐉', armyCount: 3, fleetCount: 0, isPlayerKingdom: true },
  { id: 'pon', name: 'Pon', royalCastleId: 'invisible_school', coatOfArms: '🦂', armyCount: 4, fleetCount: 1, isPlayerKingdom: true },
  { id: 'rombune', name: 'Rombune', royalCastleId: 'tower_of_zards', coatOfArms: '🦇', armyCount: 3, fleetCount: 2, isPlayerKingdom: true },
  // Non-player kingdoms (activated via diplomacy) - use representative locations
  { id: 'neuth', name: 'Elfland (Neuth)', royalCastleId: 'the_haven', coatOfArms: '🧝', armyCount: 3, fleetCount: 0, isPlayerKingdom: false },
  { id: 'zorn', name: 'Zorn (Goblins)', royalCastleId: 'mounds', coatOfArms: '👺', armyCount: 4, fleetCount: 0, isPlayerKingdom: false },
  { id: 'ghem', name: 'Ghem (Dwarves)', royalCastleId: 'mines_of_rosengg', coatOfArms: '⛏️', armyCount: 3, fleetCount: 0, isPlayerKingdom: false },
  { id: 'trolls', name: 'Troll Country', royalCastleId: 'the_crag', coatOfArms: '🧌', armyCount: 2, fleetCount: 0, isPlayerKingdom: false },
]

// Player kingdoms available for selection (excluding non-player kingdoms)
export const PLAYER_KINGDOMS: KingdomId[] = [
  'hothior', 'mivior', 'muetar', 'shucassam', 'immer', 'pon', 'rombune'
]

// Note: generateId now requires a SeededRNG instance for reproducibility
// See createInitialState for usage

/**
 * Create castles from map data with normalized IDs
 */
function createCastlesFromMapData(): Record<string, Castle> {
  const castles: Record<string, Castle> = {}
  const mapCastles = getCastles()
  const royalCastles = getRoyalCastles()

  for (const hex of mapCastles) {
    const isRoyal = royalCastles.some(r => r.col === hex.col && r.row === hex.row)
    const isPort = hasTerrain(hex.terrain, TerrainFlags.PORT)

    // Generate castle ID from name or coordinates, using normalized form
    const id = hex.name
      ? normalizeCastleId(hex.name)
      : `castle_${hex.col}_${hex.row}`

    const castle: Castle = {
      id,
      name: hex.name?.replace(/\\'/g, "'") || `Castle at ${hex.col},${hex.row}`,
      coord: { col: hex.col, row: hex.row },
      kingdomId: hex.kingdom as KingdomId,
      intrinsicDefense: hex.intrinsic || 1,
      isRoyalCastle: isRoyal,
      isPort,
      isPlundered: false,
      controllerId: null,
    }
    castles[id] = castle
  }

  return castles
}

function createKingdoms(): Record<string, Kingdom> {
  const kingdoms: Record<string, Kingdom> = {}

  for (const def of KINGDOM_DEFINITIONS) {
    const kingdom: Kingdom = {
      ...def,
      color: KingdomColors[def.id as keyof typeof KingdomColors] || '#888888',
    }
    if (def.id) {
      kingdoms[def.id] = kingdom
    }
  }

  return kingdoms
}

function createPlayerUnits(
  playerId: string,
  kingdom: Kingdom,
  startingPosition: HexCoord
): Unit[] {
  const units: Unit[] = []

  // Create monarch
  units.push({
    id: `${kingdom.id}_monarch`,
    type: 'monarch',
    kingdomId: kingdom.id,
    ownerId: playerId,
    position: { ...startingPosition },
    movementAllowance: 6,
    movementRemaining: 6,
    isInsideCastle: true,
    hasMoved: false,
    specialAbilities: ['leader_combat_bonus'],
  })

  // Create armies
  for (let i = 0; i < kingdom.armyCount; i++) {
    units.push({
      id: `${kingdom.id}_army_${i}`,
      type: 'army',
      kingdomId: kingdom.id,
      ownerId: playerId,
      position: { ...startingPosition },
      movementAllowance: 4,
      movementRemaining: 4,
      isInsideCastle: i < 2,  // First 2 armies inside castle
      hasMoved: false,
      specialAbilities: [],
    })
  }

  // Create ambassador
  units.push({
    id: `${kingdom.id}_ambassador`,
    type: 'ambassador',
    kingdomId: kingdom.id,
    ownerId: playerId,
    position: { ...startingPosition },
    movementAllowance: 6,
    movementRemaining: 6,
    isInsideCastle: true,
    hasMoved: false,
    specialAbilities: ['diplomatic_immunity'],
  })

  return units
}

export interface CreateGameOptions {
  humanPlayerId: string
  humanKingdomId: KingdomId
  aiPlayerId: string
  aiKingdomId: KingdomId
  seed?: number
}

export class GameSetupError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GameSetupError'
  }
}

/**
 * Validate that a kingdom can be used for play
 */
function validateKingdom(
  kingdomId: KingdomId,
  kingdoms: Record<string, Kingdom>,
  castles: Record<string, Castle>
): { kingdom: Kingdom; royalCastle: Castle } {
  if (!kingdomId) {
    throw new GameSetupError('Kingdom ID cannot be null')
  }

  const kingdom = kingdoms[kingdomId]
  if (!kingdom) {
    throw new GameSetupError(`Kingdom '${kingdomId}' not found in kingdom definitions`)
  }

  if (!kingdom.isPlayerKingdom) {
    throw new GameSetupError(`Kingdom '${kingdomId}' is not a player-controllable kingdom`)
  }

  const royalCastle = castles[kingdom.royalCastleId]
  if (!royalCastle) {
    const availableCastles = Object.keys(castles).slice(0, 10).join(', ')
    throw new GameSetupError(
      `Royal castle '${kingdom.royalCastleId}' not found for kingdom '${kingdomId}'. ` +
      `Available castles include: ${availableCastles}...`
    )
  }

  return { kingdom, royalCastle }
}

export function createInitialState(options: CreateGameOptions): GameState {
  const { humanPlayerId, humanKingdomId, aiPlayerId, aiKingdomId, seed } = options

  // Initialize seeded RNG for reproducible game setup
  const rngSeed = seed ?? Date.now()
  const rng = new SeededRNG(rngSeed)

  // Create kingdoms and castles
  const kingdoms = createKingdoms()
  const castles = createCastlesFromMapData()

  // Validate selected kingdoms and get their royal castles
  const humanSetup = validateKingdom(humanKingdomId, kingdoms, castles)
  const aiSetup = validateKingdom(aiKingdomId, kingdoms, castles)

  // Create players
  const humanPlayer: Player = {
    id: humanPlayerId,
    name: 'Human Player',
    isHuman: true,
    kingdomId: humanKingdomId,
    identityCard: {
      kingdomId: humanKingdomId,
      kingName: `King of ${humanSetup.kingdom.name}`,
      queenName: `Queen of ${humanSetup.kingdom.name}`,
      royalCastleName: humanSetup.royalCastle.name,
      armyCount: humanSetup.kingdom.armyCount,
      fleetCount: humanSetup.kingdom.fleetCount,
    },
    personalityCard: null,  // Dealt during setup
    diplomacyHand: [],
    victoryPoints: 0,
    isEliminated: false,
  }

  const aiPlayer: Player = {
    id: aiPlayerId,
    name: 'AI Opponent',
    isHuman: false,
    kingdomId: aiKingdomId,
    identityCard: {
      kingdomId: aiKingdomId,
      kingName: `King of ${aiSetup.kingdom.name}`,
      queenName: `Queen of ${aiSetup.kingdom.name}`,
      royalCastleName: aiSetup.royalCastle.name,
      armyCount: aiSetup.kingdom.armyCount,
      fleetCount: aiSetup.kingdom.fleetCount,
    },
    personalityCard: null,
    diplomacyHand: [],
    victoryPoints: 0,
    isEliminated: false,
  }

  // Create units at royal castle locations
  const units: Record<string, Unit> = {}

  const humanUnits = createPlayerUnits(
    humanPlayerId,
    humanSetup.kingdom,
    humanSetup.royalCastle.coord
  )
  for (const unit of humanUnits) {
    units[unit.id] = unit
  }

  const aiUnits = createPlayerUnits(
    aiPlayerId,
    aiSetup.kingdom,
    aiSetup.royalCastle.coord
  )
  for (const unit of aiUnits) {
    units[unit.id] = unit
  }

  // Set castle controllers
  humanSetup.royalCastle.controllerId = humanPlayerId
  aiSetup.royalCastle.controllerId = aiPlayerId

  // Initial game state
  return {
    gameId: rng.randomId(),
    turn: 1,
    phase: 'setup',
    playerOrder: [humanPlayerId, aiPlayerId],
    currentPlayerIndex: 0,

    mapCols: MAP_COLS,
    mapRows: MAP_ROWS,

    units,
    players: [humanPlayer, aiPlayer],
    kingdoms,
    castles,

    diplomacyDeck: [],  // Will be populated during setup
    diplomacyDiscard: [],
    personalityDeck: [],  // Will be populated during setup

    alliances: [],
    activeSieges: [],
    diplomaticPenalties: {},
    banishments: [],

    rngSeed,
    actionLog: [],
  }
}

/**
 * Get all units at a specific hex
 */
export function getUnitsAtHex(state: GameState, coord: HexCoord): Unit[] {
  const key = coordToKey(coord)
  return Object.values(state.units).filter(
    unit => coordToKey(unit.position) === key
  )
}

/**
 * Get player by ID
 */
export function getPlayer(state: GameState, playerId: string): Player | undefined {
  return state.players.find(p => p.id === playerId)
}

/**
 * Get current player
 */
export function getCurrentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex]
}

/**
 * Get castle at a specific hex
 */
export function getCastleAtHex(state: GameState, coord: HexCoord): Castle | undefined {
  const key = coordToKey(coord)
  return Object.values(state.castles).find(
    c => coordToKey(c.coord) === key
  )
}
