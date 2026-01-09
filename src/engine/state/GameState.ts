/**
 * Divine Right Game State Types
 * Core entities and state structure for the game engine
 */

// Import and re-export KingdomId from canonical source to avoid duplication
import { type KingdomId as KingdomIdType } from '../../types'
export type KingdomId = KingdomIdType

// === COORDINATES ===
export interface HexCoord {
  col: number  // offset coordinate (0-34)
  row: number  // offset coordinate (0-30)
}

export function coordToKey(coord: HexCoord): string {
  return `${coord.col},${coord.row}`
}

export function keyToCoord(key: string): HexCoord {
  const [col, row] = key.split(',').map(Number)
  return { col, row }
}

// === TERRAIN ===
export type TerrainType =
  | 'clear'
  | 'forest'
  | 'hills'
  | 'mountains'
  | 'mountain_pass'
  | 'swamp'
  | 'coast'
  | 'sea'
  | 'lake'

export interface Kingdom {
  id: KingdomId
  name: string
  color: string
  royalCastleId: string
  coatOfArms: string  // emoji
  armyCount: number
  fleetCount: number  // 0 for MVP
  isPlayerKingdom: boolean  // can be controlled by player
}

// === UNITS ===
export type UnitType =
  | 'monarch'
  | 'army'
  | 'fleet'
  | 'ambassador'
  | 'mercenary_army'
  | 'mercenary_fleet'

export interface Unit {
  id: string
  type: UnitType
  kingdomId: KingdomId
  ownerId: string  // player who controls this unit
  position: HexCoord
  movementAllowance: number  // base movement points
  movementRemaining: number  // points left this turn
  isInsideCastle: boolean
  hasMoved: boolean
  specialAbilities: SpecialAbility[]
}

export type SpecialAbility =
  | 'leader_combat_bonus'
  | 'diplomatic_immunity'
  | 'siege_specialist'
  | 'forest_movement'
  | 'mountain_movement'

// === CASTLES ===
export interface Castle {
  id: string
  name: string
  coord: HexCoord
  kingdomId: KingdomId
  intrinsicDefense: number  // 1-6
  isRoyalCastle: boolean
  isPort: boolean
  isPlundered: boolean
  controllerId: string | null  // player who controls
}

// === CARDS ===
export interface IdentityCard {
  kingdomId: KingdomId
  kingName: string
  queenName: string
  royalCastleName: string
  armyCount: number
  fleetCount: number
}

export interface PersonalityCard {
  id: number
  name: string
  description: string
  effects: PersonalityEffect[]
}

export interface PersonalityEffect {
  type: 'diplomacy_modifier' | 'combat_modifier' | 'movement_bonus' | 'special'
  value: number
  condition?: string
}

export interface DiplomacyCard {
  id: number
  name: string
  modifier: number
  type: 'diplomatic_ploy' | 'special_mercenary' | 'event'
  sideEffects: DiplomacyCardEffect[]
}

export type DiplomacyCardEffect =
  | 'banishment_on_failure'
  | 'double_activation'
  | 'instant_alliance'
  | 'mercenary_spawn'

// === PLAYERS ===
export interface Player {
  id: string
  name: string
  isHuman: boolean
  kingdomId: KingdomId
  identityCard: IdentityCard | null
  personalityCard: PersonalityCard | null
  diplomacyHand: DiplomacyCard[]
  victoryPoints: number
  isEliminated: boolean
}

// === ALLIANCES ===
export interface Alliance {
  kingdomId: KingdomId
  playerId: string
  turnActivated: number
  isActive: boolean
}

// === SIEGES ===
export interface Siege {
  id: string
  castleId: string
  attackerPlayerId: string
  turnsRemaining: number
  besiegingUnits: string[]  // unit IDs
  defendingUnits: string[]  // unit IDs
}

// === BANISHMENTS ===
export interface Banishment {
  unitId: string
  kingdomId: KingdomId
  turnsRemaining: number
}

// === GAME PHASES ===
export type GamePhase =
  | 'setup'
  | 'player_order_determination'
  | 'events'
  | 'draw_diplomacy_card'
  | 'diplomacy'
  | 'siege_resolution'
  | 'movement'
  | 'combat'
  | 'end_turn'
  | 'game_over'

// === GAME STATE ===
// Using Record<> instead of Map<> for JSON serialization compatibility
export interface GameState {
  // Meta
  gameId: string
  turn: number
  phase: GamePhase
  playerOrder: string[]  // player IDs for this turn
  currentPlayerIndex: number

  // Map
  mapCols: number
  mapRows: number

  // Units - keyed by unit ID
  units: Record<string, Unit>

  // Players
  players: Player[]

  // Kingdoms - keyed by kingdom ID
  kingdoms: Record<string, Kingdom>

  // Castles - keyed by castle ID
  castles: Record<string, Castle>

  // Cards
  diplomacyDeck: DiplomacyCard[]
  diplomacyDiscard: DiplomacyCard[]
  personalityDeck: PersonalityCard[]

  // Alliances
  alliances: Alliance[]

  // Sieges
  activeSieges: Siege[]

  // Tracking - playerId -> kingdoms violated
  diplomaticPenalties: Record<string, KingdomId[]>
  banishments: Banishment[]

  // Random state
  rngSeed: number

  // History
  actionLog: GameAction[]
}

// === GAME ACTIONS (Command Pattern) ===
export type GameAction =
  | { type: 'START_GAME'; playerIds: string[] }
  | { type: 'DETERMINE_PLAYER_ORDER'; rolls: number[] }
  | { type: 'DRAW_DIPLOMACY_CARD'; playerId: string }
  | { type: 'MOVE_UNIT'; unitId: string; path: HexCoord[] }
  | { type: 'DECLARE_SIEGE'; castleId: string; attackerIds: string[] }
  | { type: 'RESOLVE_SIEGE'; siegeId: string; result: SiegeResult }
  | { type: 'RESOLVE_COMBAT'; attackerHex: HexCoord; defenderHex: HexCoord; result: CombatResult }
  | { type: 'PLAY_DIPLOMACY_CARD'; playerId: string; cardId: number; targetKingdom: KingdomId }
  | { type: 'ACTIVATE_KINGDOM'; playerId: string; kingdomId: KingdomId }
  | { type: 'BANISH_AMBASSADOR'; unitId: string; kingdomId: KingdomId }
  | { type: 'END_PHASE'; playerId: string }
  | { type: 'END_TURN' }
  | { type: 'CLAIM_VICTORY'; playerId: string }

// === RESULTS ===
export interface CombatResult {
  attackerRoll: number
  defenderRoll: number
  attackerLosses: number
  defenderLosses: number
  winner: 'attacker' | 'defender' | 'tie'
  retreatRequired: boolean
}

export interface SiegeResult {
  success: boolean
  turnsElapsed: number
  castleCaptured: boolean
  plundered: boolean
}

export interface DiplomacyResult {
  success: boolean
  roll: number
  modifiers: number
  banished: boolean
}
