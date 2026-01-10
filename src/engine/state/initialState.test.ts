import { describe, it, expect } from 'vitest'
import { createInitialState, GameSetupError, PLAYER_KINGDOMS } from './initialState'

describe('createInitialState', () => {
  it('creates a valid game state with Hothior vs Mivior', () => {
    const state = createInitialState({
      humanPlayerId: 'human',
      humanKingdomId: 'hothior',
      aiPlayerId: 'ai',
      aiKingdomId: 'mivior',
      seed: 12345,
    })

    expect(state.gameId).toBeDefined()
    expect(state.turn).toBe(1)
    expect(state.phase).toBe('setup')
    expect(state.players).toHaveLength(2)
    expect(state.players[0].kingdomId).toBe('hothior')
    expect(state.players[1].kingdomId).toBe('mivior')
  })

  it('creates units at royal castle locations', () => {
    const state = createInitialState({
      humanPlayerId: 'human',
      humanKingdomId: 'hothior',
      aiPlayerId: 'ai',
      aiKingdomId: 'mivior',
    })

    // Hothior should have units at Ider Bolis
    const hothiorUnits = Object.values(state.units).filter(u => u.kingdomId === 'hothior')
    expect(hothiorUnits.length).toBeGreaterThan(0)

    // All Hothior units should be at the same location (royal castle)
    const positions = new Set(hothiorUnits.map(u => `${u.position.col},${u.position.row}`))
    expect(positions.size).toBe(1)
  })

  it('throws GameSetupError for invalid kingdom', () => {
    expect(() => createInitialState({
      humanPlayerId: 'human',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Testing invalid input
      humanKingdomId: 'invalid_kingdom' as any,
      aiPlayerId: 'ai',
      aiKingdomId: 'mivior',
    })).toThrow(GameSetupError)
  })

  it('throws GameSetupError for non-player kingdom', () => {
    expect(() => createInitialState({
      humanPlayerId: 'human',
      humanKingdomId: 'neuth', // Non-player kingdom (Elves)
      aiPlayerId: 'ai',
      aiKingdomId: 'mivior',
    })).toThrow(GameSetupError)

    expect(() => createInitialState({
      humanPlayerId: 'human',
      humanKingdomId: 'neuth',
      aiPlayerId: 'ai',
      aiKingdomId: 'mivior',
    })).toThrow(/not a player-controllable kingdom/)
  })

  it('throws GameSetupError for null kingdom', () => {
    expect(() => createInitialState({
      humanPlayerId: 'human',
      humanKingdomId: null,
      aiPlayerId: 'ai',
      aiKingdomId: 'mivior',
    })).toThrow(GameSetupError)
  })

  it('creates correct unit counts for each kingdom', () => {
    const state = createInitialState({
      humanPlayerId: 'human',
      humanKingdomId: 'hothior',
      aiPlayerId: 'ai',
      aiKingdomId: 'mivior',
    })

    const hothiorUnits = Object.values(state.units).filter(u => u.kingdomId === 'hothior')
    const monarchs = hothiorUnits.filter(u => u.type === 'monarch')
    const armies = hothiorUnits.filter(u => u.type === 'army')
    const ambassadors = hothiorUnits.filter(u => u.type === 'ambassador')

    expect(monarchs).toHaveLength(1)
    expect(armies).toHaveLength(6) // Hothior has 6 armies
    expect(ambassadors).toHaveLength(1)
  })

  it('state is JSON serializable', () => {
    const state = createInitialState({
      humanPlayerId: 'human',
      humanKingdomId: 'hothior',
      aiPlayerId: 'ai',
      aiKingdomId: 'mivior',
    })

    // This should not throw
    const json = JSON.stringify(state)
    const parsed = JSON.parse(json)

    expect(parsed.gameId).toBe(state.gameId)
    expect(parsed.turn).toBe(state.turn)
    expect(Object.keys(parsed.units)).toHaveLength(Object.keys(state.units).length)
    expect(Object.keys(parsed.castles)).toHaveLength(Object.keys(state.castles).length)
  })
})

describe('PLAYER_KINGDOMS', () => {
  it('contains all player-controllable kingdoms', () => {
    expect(PLAYER_KINGDOMS).toContain('hothior')
    expect(PLAYER_KINGDOMS).toContain('mivior')
    expect(PLAYER_KINGDOMS).toContain('muetar')
    expect(PLAYER_KINGDOMS).toContain('shucassam')
    expect(PLAYER_KINGDOMS).toContain('immer')
    expect(PLAYER_KINGDOMS).toContain('pon')
    expect(PLAYER_KINGDOMS).toContain('rombune')
  })

  it('does not contain non-player kingdoms', () => {
    expect(PLAYER_KINGDOMS).not.toContain('neuth')
    expect(PLAYER_KINGDOMS).not.toContain('zorn')
    expect(PLAYER_KINGDOMS).not.toContain('ghem')
    expect(PLAYER_KINGDOMS).not.toContain('trolls')
  })

  it('all player kingdoms can create valid game states', () => {
    for (let i = 0; i < PLAYER_KINGDOMS.length; i++) {
      for (let j = 0; j < PLAYER_KINGDOMS.length; j++) {
        if (i === j) continue // Same kingdom

        const humanKingdom = PLAYER_KINGDOMS[i]
        const aiKingdom = PLAYER_KINGDOMS[j]

        expect(() => createInitialState({
          humanPlayerId: 'human',
          humanKingdomId: humanKingdom,
          aiPlayerId: 'ai',
          aiKingdomId: aiKingdom,
        })).not.toThrow()
      }
    }
  })
})
