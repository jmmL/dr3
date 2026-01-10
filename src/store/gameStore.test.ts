/**
 * Game Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useGameStore.setState({
      game: null,
      selectedHex: null,
      selectedUnitId: null,
      validMoveTargets: [],
      lastRandomEvent: null,
      rng: null,
    })
  })

  describe('createGame', () => {
    it('creates a new game with initial state', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })

      const { game, rng } = useGameStore.getState()

      expect(game).not.toBeNull()
      expect(game?.phase).toBe('setup')
      expect(game?.turn).toBe(1)
      expect(game?.players).toHaveLength(2)
      expect(rng).not.toBeNull()
    })

    it('initializes RNG with the game seed', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 42,
      })

      const { game, rng } = useGameStore.getState()

      expect(game?.rngSeed).toBe(42)
      expect(rng).not.toBeNull()
    })
  })

  describe('startGame', () => {
    it('transitions from setup to player_order_determination', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })

      actions.startGame()

      const { game } = useGameStore.getState()
      expect(game?.phase).toBe('player_order_determination')
    })

    it('logs START_GAME action', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })

      actions.startGame()

      const { game } = useGameStore.getState()
      const startAction = game?.actionLog.find((a) => a.type === 'START_GAME')
      expect(startAction).toBeDefined()
      expect(startAction?.type).toBe('START_GAME')
    })
  })

  describe('determinePlayerOrder', () => {
    it('rolls for each active player', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })

      const rolls = actions.determinePlayerOrder()

      expect(rolls).toHaveLength(2)
      expect(rolls[0].roll).toBeGreaterThanOrEqual(2)
      expect(rolls[0].roll).toBeLessThanOrEqual(12)
    })

    it('sorts players by roll (highest first)', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })

      const rolls = actions.determinePlayerOrder()

      expect(rolls[0].roll).toBeGreaterThanOrEqual(rolls[1].roll)
    })

    it('updates player order in game state', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })

      const rolls = actions.determinePlayerOrder()
      const { game } = useGameStore.getState()

      expect(game?.playerOrder).toEqual(rolls.map((r) => r.playerId))
    })

    it('produces reproducible results with same seed', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 99999,
      })

      const rolls1 = actions.determinePlayerOrder()

      // Reset and create with same seed
      actions.resetGame()
      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 99999,
      })

      const rolls2 = actions.determinePlayerOrder()

      expect(rolls1[0].roll).toBe(rolls2[0].roll)
      expect(rolls1[1].roll).toBe(rolls2[1].roll)
    })
  })

  describe('rollRandomEvent', () => {
    it('returns a valid random event', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })

      const event = actions.rollRandomEvent()

      expect(event.roll).toBeGreaterThanOrEqual(2)
      expect(event.roll).toBeLessThanOrEqual(12)
      expect(event.type).toBeDefined()
      expect(event.description).toBeDefined()
    })

    it('updates lastRandomEvent in state', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })

      actions.rollRandomEvent()

      const { lastRandomEvent } = useGameStore.getState()
      expect(lastRandomEvent).not.toBeNull()
    })
  })

  describe('advancePhase', () => {
    it('transitions through phases in correct order', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })

      actions.startGame()
      expect(useGameStore.getState().game?.phase).toBe('player_order_determination')

      actions.advancePhase()
      expect(useGameStore.getState().game?.phase).toBe('events')

      actions.advancePhase()
      expect(useGameStore.getState().game?.phase).toBe('draw_diplomacy_card')

      actions.advancePhase()
      expect(useGameStore.getState().game?.phase).toBe('diplomacy')

      actions.advancePhase()
      expect(useGameStore.getState().game?.phase).toBe('siege_resolution')

      actions.advancePhase()
      expect(useGameStore.getState().game?.phase).toBe('movement')

      actions.advancePhase()
      expect(useGameStore.getState().game?.phase).toBe('combat')

      actions.advancePhase()
      expect(useGameStore.getState().game?.phase).toBe('end_turn')
    })
  })

  describe('endTurn', () => {
    it('increments turn counter', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })

      expect(useGameStore.getState().game?.turn).toBe(1)

      actions.endTurn()

      expect(useGameStore.getState().game?.turn).toBe(2)
    })

    it('resets to player_order_determination phase', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })

      actions.startGame()
      actions.advancePhase() // events
      actions.endTurn()

      expect(useGameStore.getState().game?.phase).toBe('player_order_determination')
    })

    it('resets unit movement', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })

      // Mark a unit as moved using setState (immer makes state read-only)
      const { game } = useGameStore.getState()
      const unitId = Object.keys(game?.units || {})[0]

      useGameStore.setState((state) => {
        if (state.game && unitId) {
          state.game.units[unitId].hasMoved = true
          state.game.units[unitId].movementRemaining = 0
        }
      })

      actions.endTurn()

      const { game: updatedGame } = useGameStore.getState()
      const unit = updatedGame?.units[unitId]
      expect(unit?.hasMoved).toBe(false)
      expect(unit?.movementRemaining).toBe(unit?.movementAllowance)
    })

    it('triggers game over after turn 20', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })

      // Fast forward to turn 20 using setState (immer makes state read-only)
      useGameStore.setState((state) => {
        if (state.game) {
          state.game.turn = 20
        }
      })

      actions.endTurn()

      expect(useGameStore.getState().game?.phase).toBe('game_over')
    })
  })

  describe('selectHex', () => {
    it('updates selectedHex state', () => {
      const { actions } = useGameStore.getState()

      actions.selectHex('10,15')

      expect(useGameStore.getState().selectedHex).toBe('10,15')
    })

    it('clears selection with null', () => {
      const { actions } = useGameStore.getState()

      actions.selectHex('10,15')
      actions.selectHex(null)

      expect(useGameStore.getState().selectedHex).toBeNull()
    })
  })

  describe('selectUnit', () => {
    it('updates selectedUnitId state', () => {
      const { actions } = useGameStore.getState()

      actions.selectUnit('hothior_army_0')

      expect(useGameStore.getState().selectedUnitId).toBe('hothior_army_0')
    })

    it('clears validMoveTargets when deselecting', () => {
      const { actions } = useGameStore.getState()

      actions.setValidMoveTargets([{ col: 1, row: 1 }])
      actions.selectUnit('hothior_army_0')
      actions.selectUnit(null)

      expect(useGameStore.getState().validMoveTargets).toEqual([])
    })
  })

  describe('moveUnit', () => {
    it('moves unit to destination', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })

      const unitId = 'hothior_army_0'
      const destination = { col: 10, row: 18 }

      const result = actions.moveUnit(unitId, [destination])

      expect(result).toBe(true)

      const { game: updatedGame } = useGameStore.getState()
      expect(updatedGame?.units[unitId].position).toEqual(destination)
      expect(updatedGame?.units[unitId].hasMoved).toBe(true)
    })

    it('returns false for invalid unit', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })

      const result = actions.moveUnit('nonexistent', [{ col: 5, row: 5 }])

      expect(result).toBe(false)
    })

    it('clears selection after move', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })

      actions.selectUnit('hothior_army_0')
      actions.setValidMoveTargets([{ col: 10, row: 18 }])
      actions.moveUnit('hothior_army_0', [{ col: 10, row: 18 }])

      expect(useGameStore.getState().selectedUnitId).toBeNull()
      expect(useGameStore.getState().validMoveTargets).toEqual([])
    })

    it('logs MOVE_UNIT action', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })

      const path = [{ col: 10, row: 18 }]
      actions.moveUnit('hothior_army_0', path)

      const { game } = useGameStore.getState()
      const moveAction = game?.actionLog.find((a) => a.type === 'MOVE_UNIT')
      expect(moveAction).toBeDefined()
      expect(moveAction?.type).toBe('MOVE_UNIT')
    })
  })

  describe('resetGame', () => {
    it('clears all state', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })

      actions.selectHex('10,15')
      actions.selectUnit('hothior_army_0')

      actions.resetGame()

      const state = useGameStore.getState()
      expect(state.game).toBeNull()
      expect(state.rng).toBeNull()
      expect(state.selectedHex).toBeNull()
      expect(state.selectedUnitId).toBeNull()
    })
  })

  describe('dispatch', () => {
    it('handles END_TURN action', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })

      actions.dispatch({ type: 'END_TURN' })

      expect(useGameStore.getState().game?.turn).toBe(2)
    })

    it('handles CLAIM_VICTORY action', () => {
      const { actions } = useGameStore.getState()

      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })

      actions.dispatch({ type: 'CLAIM_VICTORY', playerId: 'human' })

      expect(useGameStore.getState().game?.phase).toBe('game_over')
    })
  })
})
