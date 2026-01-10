/**
 * Game Controls Component
 *
 * Displays current game phase, turn info, and provides controls
 * for advancing through the game flow.
 */

import { useState, useCallback } from 'react'
import {
  useGame,
  useGamePhase,
  useGameTurn,
  useGameActions,
  RandomEvent,
} from '../store/gameStore'
import { GamePhase } from '../engine/state/GameState'

/**
 * Human-readable phase names
 */
const PHASE_NAMES: Record<GamePhase, string> = {
  setup: 'Setup',
  player_order_determination: 'Player Order',
  events: 'Random Events',
  draw_diplomacy_card: 'Draw Card',
  diplomacy: 'Diplomacy',
  siege_resolution: 'Sieges',
  movement: 'Movement',
  combat: 'Combat',
  end_turn: 'End Turn',
  game_over: 'Game Over',
}

/**
 * Phase descriptions for help text
 */
const PHASE_DESCRIPTIONS: Record<GamePhase, string> = {
  setup: 'Select your kingdom and prepare for battle.',
  player_order_determination: 'Roll dice to determine who acts first this turn.',
  events: 'Check for random events that may affect the realm.',
  draw_diplomacy_card: 'Draw a diplomacy card for use this turn.',
  diplomacy: 'Attempt to form alliances or play diplomatic ploys.',
  siege_resolution: 'Resolve ongoing sieges against castles.',
  movement: 'Move your units across the map.',
  combat: 'Resolve battles between opposing forces.',
  end_turn: 'Prepare for the next turn.',
  game_over: 'The game has ended.',
}

interface PlayerOrderRoll {
  playerId: string
  roll: number
}

export function GameControls() {
  const game = useGame()
  const phase = useGamePhase()
  const turn = useGameTurn()
  const actions = useGameActions()

  const [playerRolls, setPlayerRolls] = useState<PlayerOrderRoll[]>([])
  const [randomEvent, setRandomEvent] = useState<RandomEvent | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleStartGame = useCallback(() => {
    if (!game) return
    actions.startGame()
  }, [game, actions])

  const handleDetermineOrder = useCallback(() => {
    setIsProcessing(true)
    const rolls = actions.determinePlayerOrder()
    setPlayerRolls(rolls)
    setIsProcessing(false)
  }, [actions])

  const handleRollEvent = useCallback(() => {
    setIsProcessing(true)
    const event = actions.rollRandomEvent()
    setRandomEvent(event)
    setIsProcessing(false)
  }, [actions])

  const handleAdvancePhase = useCallback(() => {
    // Clear phase-specific state when advancing
    setPlayerRolls([])
    setRandomEvent(null)
    actions.advancePhase()
  }, [actions])

  const handleEndTurn = useCallback(() => {
    setPlayerRolls([])
    setRandomEvent(null)
    actions.endTurn()
  }, [actions])

  if (!game) {
    return (
      <div style={styles.container}>
        <div style={styles.noGame}>No game in progress</div>
      </div>
    )
  }

  const currentPhase = phase || 'setup'
  const currentTurn = turn || 1

  return (
    <div style={styles.container}>
      {/* Turn and Phase Header */}
      <div style={styles.header}>
        <div style={styles.turnBadge}>Turn {currentTurn}</div>
        <div style={styles.phaseName}>{PHASE_NAMES[currentPhase]}</div>
      </div>

      {/* Phase Description */}
      <div style={styles.description}>
        {PHASE_DESCRIPTIONS[currentPhase]}
      </div>

      {/* Phase-specific Content */}
      <div style={styles.content}>
        {currentPhase === 'setup' && (
          <button
            onClick={handleStartGame}
            style={styles.primaryButton}
            disabled={isProcessing}
          >
            Start Game
          </button>
        )}

        {currentPhase === 'player_order_determination' && (
          <>
            {playerRolls.length === 0 ? (
              <button
                onClick={handleDetermineOrder}
                style={styles.primaryButton}
                disabled={isProcessing}
              >
                Roll for Initiative
              </button>
            ) : (
              <div style={styles.rollResults}>
                <h4 style={styles.resultsTitle}>Initiative Rolls</h4>
                {playerRolls.map((roll, index) => {
                  const player = game.players.find(p => p.id === roll.playerId)
                  return (
                    <div
                      key={roll.playerId}
                      style={{
                        ...styles.rollItem,
                        ...(index === 0 ? styles.firstPlace : {}),
                      }}
                    >
                      <span>{player?.name || roll.playerId}</span>
                      <span style={styles.rollValue}>{roll.roll}</span>
                    </div>
                  )
                })}
                <button
                  onClick={handleAdvancePhase}
                  style={styles.secondaryButton}
                >
                  Continue
                </button>
              </div>
            )}
          </>
        )}

        {currentPhase === 'events' && (
          <>
            {!randomEvent ? (
              <button
                onClick={handleRollEvent}
                style={styles.primaryButton}
                disabled={isProcessing}
              >
                Roll for Events
              </button>
            ) : (
              <div style={styles.eventResult}>
                <div style={styles.eventRoll}>
                  Roll: <strong>{randomEvent.roll}</strong>
                </div>
                <div style={styles.eventType}>
                  {randomEvent.type === 'none' ? 'No Event' : randomEvent.type.replace(/_/g, ' ')}
                </div>
                <div style={styles.eventDescription}>
                  {randomEvent.description}
                </div>
                <button
                  onClick={handleAdvancePhase}
                  style={styles.secondaryButton}
                >
                  Continue
                </button>
              </div>
            )}
          </>
        )}

        {(currentPhase === 'draw_diplomacy_card' ||
          currentPhase === 'diplomacy' ||
          currentPhase === 'siege_resolution' ||
          currentPhase === 'movement' ||
          currentPhase === 'combat') && (
          <button
            onClick={handleAdvancePhase}
            style={styles.primaryButton}
          >
            End {PHASE_NAMES[currentPhase]} Phase
          </button>
        )}

        {currentPhase === 'end_turn' && (
          <button
            onClick={handleEndTurn}
            style={styles.primaryButton}
          >
            Start Next Turn
          </button>
        )}

        {currentPhase === 'game_over' && (
          <div style={styles.gameOver}>
            <h3>Game Over</h3>
            <p>The game has ended after {currentTurn} turns.</p>
            <button
              onClick={() => actions.resetGame()}
              style={styles.primaryButton}
            >
              New Game
            </button>
          </div>
        )}
      </div>

      {/* Player Info */}
      <div style={styles.playerInfo}>
        {game.players.map(player => (
          <div
            key={player.id}
            style={{
              ...styles.playerCard,
              borderColor: player.isHuman ? '#4CAF50' : '#2196F3',
            }}
          >
            <div style={styles.playerName}>
              {player.isHuman ? '👤' : '🤖'} {player.name}
            </div>
            <div style={styles.playerKingdom}>
              {player.kingdomId && game.kingdoms[player.kingdomId]?.coatOfArms}{' '}
              {player.kingdomId && game.kingdoms[player.kingdomId]?.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '1rem',
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
    color: '#e0e0e0',
    minWidth: '280px',
  },
  noGame: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  turnBadge: {
    backgroundColor: '#e94560',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: 'bold',
  },
  phaseName: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
  description: {
    fontSize: '0.875rem',
    color: '#a0a0a0',
    marginBottom: '1rem',
    lineHeight: 1.4,
  },
  content: {
    marginBottom: '1rem',
  },
  primaryButton: {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#e94560',
    color: 'white',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  secondaryButton: {
    width: '100%',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#0f3460',
    color: 'white',
    marginTop: '0.75rem',
  },
  rollResults: {
    backgroundColor: '#16213e',
    padding: '1rem',
    borderRadius: '4px',
  },
  resultsTitle: {
    margin: '0 0 0.75rem 0',
    fontSize: '0.875rem',
    color: '#a0a0a0',
  },
  rollItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem',
    backgroundColor: '#0f3460',
    borderRadius: '4px',
    marginBottom: '0.5rem',
  },
  firstPlace: {
    backgroundColor: '#1a472a',
    border: '1px solid #4CAF50',
  },
  rollValue: {
    fontWeight: 'bold',
    fontSize: '1.25rem',
  },
  eventResult: {
    backgroundColor: '#16213e',
    padding: '1rem',
    borderRadius: '4px',
    textAlign: 'center',
  },
  eventRoll: {
    fontSize: '0.875rem',
    color: '#a0a0a0',
    marginBottom: '0.5rem',
  },
  eventType: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginBottom: '0.5rem',
  },
  eventDescription: {
    fontSize: '0.875rem',
    color: '#a0a0a0',
    marginBottom: '0.75rem',
  },
  gameOver: {
    textAlign: 'center',
    padding: '1rem',
  },
  playerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    borderTop: '1px solid #333',
    paddingTop: '1rem',
  },
  playerCard: {
    backgroundColor: '#16213e',
    padding: '0.75rem',
    borderRadius: '4px',
    borderLeft: '3px solid',
  },
  playerName: {
    fontWeight: 'bold',
    marginBottom: '0.25rem',
  },
  playerKingdom: {
    fontSize: '0.875rem',
    color: '#a0a0a0',
  },
}

export default GameControls
