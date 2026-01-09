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

// Kingdom definitions with starting armies
const KINGDOM_DEFINITIONS: Omit<Kingdom, 'color'>[] = [
  { id: 'hothior', name: 'Hothior', royalCastleId: 'ider_bolis', coatOfArms: '🦅', armyCount: 6, fleetCount: 0, isPlayerKingdom: true },
  { id: 'mivior', name: 'Mivior', royalCastleId: 'pennol', coatOfArms: '🦁', armyCount: 5, fleetCount: 2, isPlayerKingdom: true },
  { id: 'muetar', name: 'Muetar', royalCastleId: 'castle_altarr', coatOfArms: '🐺', armyCount: 4, fleetCount: 0, isPlayerKingdom: true },
  { id: 'shucassam', name: 'Shucassam', royalCastleId: 'marzarbol', coatOfArms: '🐍', armyCount: 5, fleetCount: 1, isPlayerKingdom: true },
  { id: 'immer', name: 'Immer', royalCastleId: 'the_pits', coatOfArms: '🐉', armyCount: 3, fleetCount: 0, isPlayerKingdom: true },
  { id: 'pon', name: 'Pon', royalCastleId: 'invisible_school', coatOfArms: '🦂', armyCount: 4, fleetCount: 1, isPlayerKingdom: true },
  { id: 'rombune', name: 'Rombune', royalCastleId: 'tower_of_zards', coatOfArms: '🦇', armyCount: 3, fleetCount: 2, isPlayerKingdom: true },
  { id: 'neuth', name: 'Elfland (Neuth)', royalCastleId: 'neuth_castle', coatOfArms: '🧝', armyCount: 3, fleetCount: 0, isPlayerKingdom: false },
  { id: 'zorn', name: 'Zorn (Goblins)', royalCastleId: 'zorn_castle', coatOfArms: '👺', armyCount: 4, fleetCount: 0, isPlayerKingdom: false },
  { id: 'ghem', name: 'Ghem (Dwarves)', royalCastleId: 'mines_of_rosengg', coatOfArms: '⛏️', armyCount: 3, fleetCount: 0, isPlayerKingdom: false },
  { id: 'trolls', name: 'Troll Country', royalCastleId: 'troll_castle', coatOfArms: '🧌', armyCount: 2, fleetCount: 0, isPlayerKingdom: false },
]

// Player kingdoms available for selection (excluding non-player kingdoms)
export const PLAYER_KINGDOMS: KingdomId[] = [
  'hothior', 'mivior', 'muetar', 'shucassam', 'immer', 'pon', 'rombune'
]

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function createCastlesFromMapData(): Map<string, Castle> {
  const castles = new Map<string, Castle>()
  const mapCastles = getCastles()
  const royalCastles = getRoyalCastles()

  for (const hex of mapCastles) {
    const isRoyal = royalCastles.some(r => r.col === hex.col && r.row === hex.row)
    const isPort = hasTerrain(hex.terrain, TerrainFlags.PORT)

    // Generate castle ID from name or coordinates
    const id = hex.name
      ? hex.name.toLowerCase().replace(/\s+/g, '_')
      : `castle_${hex.col}_${hex.row}`

    const castle: Castle = {
      id,
      name: hex.name || `Castle at ${hex.col},${hex.row}`,
      coord: { col: hex.col, row: hex.row },
      kingdomId: hex.kingdom as KingdomId,
      intrinsicDefense: hex.intrinsic || 1,
      isRoyalCastle: isRoyal,
      isPort,
      isPlundered: false,
      controllerId: null,
    }
    castles.set(id, castle)
  }

  return castles
}

function createKingdoms(): Map<KingdomId, Kingdom> {
  const kingdoms = new Map<KingdomId, Kingdom>()

  for (const def of KINGDOM_DEFINITIONS) {
    const kingdom: Kingdom = {
      ...def,
      color: KingdomColors[def.id as keyof typeof KingdomColors] || '#888888',
    }
    kingdoms.set(def.id, kingdom)
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

export function createInitialState(options: CreateGameOptions): GameState {
  const { humanPlayerId, humanKingdomId, aiPlayerId, aiKingdomId, seed } = options

  // Create kingdoms
  const kingdoms = createKingdoms()

  // Create castles from map data
  const castles = createCastlesFromMapData()

  // Get royal castles for starting positions
  const humanKingdom = kingdoms.get(humanKingdomId)!
  const aiKingdom = kingdoms.get(aiKingdomId)!

  const humanRoyalCastle = Array.from(castles.values()).find(
    c => c.kingdomId === humanKingdomId && c.isRoyalCastle
  )
  const aiRoyalCastle = Array.from(castles.values()).find(
    c => c.kingdomId === aiKingdomId && c.isRoyalCastle
  )

  // Create players
  const humanPlayer: Player = {
    id: humanPlayerId,
    name: 'Human Player',
    isHuman: true,
    kingdomId: humanKingdomId,
    identityCard: {
      kingdomId: humanKingdomId,
      kingName: `King of ${humanKingdom.name}`,
      queenName: `Queen of ${humanKingdom.name}`,
      royalCastleName: humanRoyalCastle?.name || 'Royal Castle',
      armyCount: humanKingdom.armyCount,
      fleetCount: humanKingdom.fleetCount,
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
      kingName: `King of ${aiKingdom.name}`,
      queenName: `Queen of ${aiKingdom.name}`,
      royalCastleName: aiRoyalCastle?.name || 'Royal Castle',
      armyCount: aiKingdom.armyCount,
      fleetCount: aiKingdom.fleetCount,
    },
    personalityCard: null,
    diplomacyHand: [],
    victoryPoints: 0,
    isEliminated: false,
  }

  // Create units
  const units = new Map<string, Unit>()

  const humanUnits = createPlayerUnits(
    humanPlayerId,
    humanKingdom,
    humanRoyalCastle?.coord || { col: 0, row: 0 }
  )
  for (const unit of humanUnits) {
    units.set(unit.id, unit)
  }

  const aiUnits = createPlayerUnits(
    aiPlayerId,
    aiKingdom,
    aiRoyalCastle?.coord || { col: 0, row: 0 }
  )
  for (const unit of aiUnits) {
    units.set(unit.id, unit)
  }

  // Set castle controllers
  if (humanRoyalCastle) {
    humanRoyalCastle.controllerId = humanPlayerId
  }
  if (aiRoyalCastle) {
    aiRoyalCastle.controllerId = aiPlayerId
  }

  // Initial game state
  return {
    gameId: generateId(),
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
    diplomaticPenalties: new Map(),
    banishments: [],

    rngSeed: seed ?? Date.now(),
    actionLog: [],
  }
}

/**
 * Get all units at a specific hex
 */
export function getUnitsAtHex(state: GameState, coord: HexCoord): Unit[] {
  const key = coordToKey(coord)
  return Array.from(state.units.values()).filter(
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
  return Array.from(state.castles.values()).find(
    c => coordToKey(c.coord) === key
  )
}
