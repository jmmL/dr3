/**
 * Game Store - Zustand-based state management for Divine Right
 *
 * Uses immer for immutable updates and supports the command pattern
 * via GameAction types for all state mutations.
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import {
  GameState,
  GamePhase,
  GameAction,
  HexCoord,
  Unit,
  KingdomId,
} from '../engine/state/GameState'
import { createInitialState, CreateGameOptions } from '../engine/state/initialState'
import { SeededRNG } from '../engine/utils/random'

/**
 * Random event result from the Events phase
 */
export interface RandomEvent {
  roll: number
  type: RandomEventType
  description: string
  affectedKingdom?: KingdomId
}

export type RandomEventType =
  | 'none'
  | 'assassination'
  | 'brigands'
  | 'border_dispute'
  | 'succession_crisis'
  | 'good_harvest'
  | 'plague'
  | 'earthquake'
  | 'rebellion'
  | 'dragon'

/**
 * Extended game store state with UI-related data
 */
interface GameStore {
  // Core game state
  game: GameState | null

  // UI state
  selectedHex: string | null
  selectedUnitId: string | null
  validMoveTargets: HexCoord[]
  lastRandomEvent: RandomEvent | null

  // RNG instance (recreated from seed when needed)
  rng: SeededRNG | null

  // Actions
  actions: {
    // Game lifecycle
    createGame: (options: CreateGameOptions) => void
    resetGame: () => void

    // Phase transitions
    startGame: () => void
    advancePhase: () => void
    endTurn: () => void

    // Player order determination
    determinePlayerOrder: () => { playerId: string; roll: number }[]

    // Random events
    rollRandomEvent: () => RandomEvent

    // Card actions
    drawDiplomacyCard: (playerId: string) => void

    // Unit actions
    selectUnit: (unitId: string | null) => void
    moveUnit: (unitId: string, path: HexCoord[]) => boolean
    resetUnitMovement: () => void

    // UI actions
    selectHex: (hexKey: string | null) => void
    setValidMoveTargets: (targets: HexCoord[]) => void

    // Action dispatch (command pattern)
    dispatch: (action: GameAction) => void
  }
}

/**
 * Get next phase in the turn sequence
 */
function getNextPhase(current: GamePhase): GamePhase {
  const sequence: GamePhase[] = [
    'player_order_determination',
    'events',
    'draw_diplomacy_card',
    'diplomacy',
    'siege_resolution',
    'movement',
    'combat',
    'end_turn',
  ]

  const currentIndex = sequence.indexOf(current)
  if (currentIndex === -1 || currentIndex >= sequence.length - 1) {
    return 'player_order_determination'
  }
  return sequence[currentIndex + 1]
}

/**
 * Check if game should end
 */
function checkGameOver(state: GameState): boolean {
  // Game ends after turn 20 (when turn 20 completes)
  if (state.turn >= 20) return true

  // Game ends if only one player remains
  const activePlayers = state.players.filter(p => !p.isEliminated)
  if (activePlayers.length <= 1) return true

  return false
}

/**
 * Random Events Table (2d6)
 * Based on DR3 rulebook page 6
 */
function resolveRandomEvent(roll: number, _rng: SeededRNG): RandomEvent {
  // 2d6 outcomes
  switch (roll) {
    case 2:
      return {
        roll,
        type: 'assassination',
        description: 'Assassination attempt! A monarch is targeted.',
      }
    case 3:
      return {
        roll,
        type: 'plague',
        description: 'Plague strikes! Armies in affected area take losses.',
      }
    case 4:
      return {
        roll,
        type: 'brigands',
        description: 'Brigands! Trade routes disrupted.',
      }
    case 5:
      return {
        roll,
        type: 'border_dispute',
        description: 'Border dispute erupts between kingdoms.',
      }
    case 6:
    case 7:
    case 8:
      return {
        roll,
        type: 'none',
        description: 'Nothing of note occurs.',
      }
    case 9:
      return {
        roll,
        type: 'good_harvest',
        description: 'Good harvest! Prosperity in the realm.',
      }
    case 10:
      return {
        roll,
        type: 'rebellion',
        description: 'Rebellion! Unrest in a random kingdom.',
      }
    case 11:
      return {
        roll,
        type: 'earthquake',
        description: 'Earthquake! A castle is damaged.',
      }
    case 12:
      return {
        roll,
        type: 'dragon',
        description: 'Dragon sighted! A terrible beast awakens.',
      }
    default:
      return {
        roll,
        type: 'none',
        description: 'Invalid roll - no event.',
      }
  }
}

/**
 * Create the game store
 */
export const useGameStore = create<GameStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        game: null,
        selectedHex: null,
        selectedUnitId: null,
        validMoveTargets: [],
        lastRandomEvent: null,
        rng: null,

        actions: {
          createGame: (options: CreateGameOptions) => {
            const game = createInitialState(options)
            set((state) => {
              state.game = game
              state.rng = new SeededRNG(game.rngSeed)
              state.selectedHex = null
              state.selectedUnitId = null
              state.validMoveTargets = []
              state.lastRandomEvent = null
            })
          },

          resetGame: () => {
            set((state) => {
              state.game = null
              state.rng = null
              state.selectedHex = null
              state.selectedUnitId = null
              state.validMoveTargets = []
              state.lastRandomEvent = null
            })
          },

          startGame: () => {
            set((state) => {
              if (!state.game) return
              state.game.phase = 'player_order_determination'
              state.game.actionLog.push({
                type: 'START_GAME',
                playerIds: state.game.players.map(p => p.id),
              })
            })
          },

          advancePhase: () => {
            set((state) => {
              if (!state.game) return

              const nextPhase = getNextPhase(state.game.phase)
              state.game.phase = nextPhase

              // Handle end_turn phase transition
              if (nextPhase === 'end_turn') {
                // Will be handled by endTurn action
              }
            })
          },

          endTurn: () => {
            set((state) => {
              if (!state.game) return

              // Check for game over
              if (checkGameOver(state.game)) {
                state.game.phase = 'game_over'
                return
              }

              // Increment turn
              state.game.turn += 1
              state.game.currentPlayerIndex = 0
              state.game.phase = 'player_order_determination'

              // Reset all unit movement
              Object.values(state.game.units).forEach((unit: Unit) => {
                unit.movementRemaining = unit.movementAllowance
                unit.hasMoved = false
              })

              state.game.actionLog.push({ type: 'END_TURN' })
            })
          },

          determinePlayerOrder: () => {
            const { game, rng } = get()
            if (!game || !rng) return []

            const rolls: { playerId: string; roll: number }[] = []

            // Roll 2d6 for each player
            for (const player of game.players) {
              if (!player.isEliminated) {
                const roll = rng.rollDice(2, 6)
                rolls.push({ playerId: player.id, roll })
              }
            }

            // Sort by roll (highest first)
            rolls.sort((a, b) => b.roll - a.roll)

            // Update player order
            set((state) => {
              if (!state.game) return
              state.game.playerOrder = rolls.map(r => r.playerId)
              state.game.actionLog.push({
                type: 'DETERMINE_PLAYER_ORDER',
                rolls: rolls.map(r => r.roll),
              })
            })

            return rolls
          },

          rollRandomEvent: () => {
            const { rng } = get()
            if (!rng) {
              return { roll: 0, type: 'none' as const, description: 'No RNG available' }
            }

            const roll = rng.rollDice(2, 6)
            const event = resolveRandomEvent(roll, rng)

            set((state) => {
              state.lastRandomEvent = event
            })

            return event
          },

          drawDiplomacyCard: (playerId: string) => {
            set((state) => {
              if (!state.game) return

              const player = state.game.players.find(p => p.id === playerId)
              if (!player) return

              // Draw from deck
              if (state.game.diplomacyDeck.length > 0) {
                const card = state.game.diplomacyDeck.pop()!
                player.diplomacyHand.push(card)
              } else if (state.game.diplomacyDiscard.length > 0) {
                // Shuffle discard into deck
                state.game.diplomacyDeck = [...state.game.diplomacyDiscard]
                state.game.diplomacyDiscard = []
                // Shuffle using RNG - use the shuffle method directly
                // Note: Can't use SeededRNG.shuffle inside immer as it returns the array
                // Inline Fisher-Yates using randomInt
                const rng = get().rng
                if (rng) {
                  for (let i = state.game.diplomacyDeck.length - 1; i > 0; i--) {
                    const j = rng.randomInt(0, i)
                    ;[state.game.diplomacyDeck[i], state.game.diplomacyDeck[j]] = [
                      state.game.diplomacyDeck[j],
                      state.game.diplomacyDeck[i],
                    ]
                  }
                }
                // Draw
                if (state.game.diplomacyDeck.length > 0) {
                  const card = state.game.diplomacyDeck.pop()!
                  player.diplomacyHand.push(card)
                }
              }

              state.game.actionLog.push({
                type: 'DRAW_DIPLOMACY_CARD',
                playerId,
              })
            })
          },

          selectUnit: (unitId: string | null) => {
            set((state) => {
              state.selectedUnitId = unitId
              if (!unitId) {
                state.validMoveTargets = []
              }
            })
          },

          moveUnit: (unitId: string, path: HexCoord[]) => {
            const { game } = get()
            if (!game) return false

            const unit = game.units[unitId]
            if (!unit || path.length === 0) return false

            // Validate move (simplified - full validation would check terrain, etc.)
            const destination = path[path.length - 1]

            set((state) => {
              if (!state.game) return

              const targetUnit = state.game.units[unitId]
              if (!targetUnit) return

              targetUnit.position = destination
              targetUnit.hasMoved = true
              // Deduct movement (simplified - 1 per hex for now)
              targetUnit.movementRemaining = Math.max(
                0,
                targetUnit.movementRemaining - path.length
              )

              state.game.actionLog.push({
                type: 'MOVE_UNIT',
                unitId,
                path,
              })

              // Clear selection
              state.selectedUnitId = null
              state.validMoveTargets = []
            })

            return true
          },

          resetUnitMovement: () => {
            set((state) => {
              if (!state.game) return

              Object.values(state.game.units).forEach((unit: Unit) => {
                unit.movementRemaining = unit.movementAllowance
                unit.hasMoved = false
              })
            })
          },

          selectHex: (hexKey: string | null) => {
            set((state) => {
              state.selectedHex = hexKey
            })
          },

          setValidMoveTargets: (targets: HexCoord[]) => {
            set((state) => {
              state.validMoveTargets = targets
            })
          },

          dispatch: (action: GameAction) => {
            set((state) => {
              if (!state.game) return

              // Add to action log
              state.game.actionLog.push(action)

              // Handle specific actions
              switch (action.type) {
                case 'START_GAME':
                  state.game.phase = 'player_order_determination'
                  break

                case 'DETERMINE_PLAYER_ORDER':
                  // Player order already set by determinePlayerOrder action
                  break

                case 'END_TURN':
                  if (checkGameOver(state.game)) {
                    state.game.phase = 'game_over'
                  } else {
                    state.game.turn += 1
                    state.game.currentPlayerIndex = 0
                    state.game.phase = 'player_order_determination'
                  }
                  break

                case 'END_PHASE':
                  state.game.phase = getNextPhase(state.game.phase)
                  break

                case 'CLAIM_VICTORY':
                  state.game.phase = 'game_over'
                  break

                // Other actions are handled by their specific action methods
                default:
                  break
              }
            })
          },
        },
      }))
    ),
    { name: 'DivineRightGame' }
  )
)

// Selector hooks for better performance
export const useGame = () => useGameStore((state) => state.game)
export const useGamePhase = () => useGameStore((state) => state.game?.phase)
export const useGameTurn = () => useGameStore((state) => state.game?.turn)
export const useSelectedHex = () => useGameStore((state) => state.selectedHex)
export const useSelectedUnit = () => useGameStore((state) => state.selectedUnitId)
export const useGameActions = () => useGameStore((state) => state.actions)
