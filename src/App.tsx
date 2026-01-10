import { useMemo, useEffect } from 'react'
import HexGrid from './components/HexGrid'
import { GameControls } from './components/GameControls'
import { hexData, getHex } from './data/mapData'
import { getUnitsAtHex, getCastleAtHex } from './engine/state/initialState'
import { fromHexKey } from './types'
import { MAP_IMAGE_URL, MAP_CALIBRATION, MAP_IMAGE_DIMENSIONS } from './config/mapCalibration'
import {
  useGame,
  useSelectedHex,
  useGameActions,
  useGamePhase,
  useGameTurn,
} from './store/gameStore'
import './App.css'

function App() {
  const game = useGame()
  const selectedHex = useSelectedHex()
  const phase = useGamePhase()
  const turn = useGameTurn()
  const actions = useGameActions()

  // Create game on mount if not already created
  useEffect(() => {
    if (!game) {
      actions.createGame({
        humanPlayerId: 'human',
        humanKingdomId: 'hothior',
        aiPlayerId: 'ai',
        aiKingdomId: 'mivior',
        seed: 12345,
      })
    }
  }, [game, actions])

  // Get info about the selected hex
  const selectedHexInfo = useMemo(() => {
    if (!selectedHex || !game) return null

    const { col, row } = fromHexKey(selectedHex)
    const hex = getHex(col, row)
    const units = getUnitsAtHex(game, { col, row })
    const castle = getCastleAtHex(game, { col, row })

    return { hex, units, castle }
  }, [selectedHex, game])

  // Show loading if game not ready
  if (!game) {
    return (
      <div className="app">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Divine Right</h1>
        <span className="turn-info">Turn {turn} - {phase}</span>
      </header>

      <main className="main">
        <div className="game-layout">
          <div className="map-container">
            <HexGrid
              hexes={hexData}
              units={game.units}
              selectedHex={selectedHex}
              onHexSelect={actions.selectHex}
              mapImageUrl={MAP_IMAGE_URL ?? undefined}
              mapImageDimensions={MAP_IMAGE_URL ? MAP_IMAGE_DIMENSIONS : undefined}
              calibration={MAP_CALIBRATION}
            />
          </div>
          <aside className="sidebar">
            <GameControls />
          </aside>
        </div>
      </main>

      <footer className="footer">
        {selectedHexInfo ? (
          <div className="hex-info">
            <strong>{selectedHex}</strong>
            {selectedHexInfo.hex?.name && ` - ${selectedHexInfo.hex.name}`}
            {selectedHexInfo.hex?.kingdom && ` (${selectedHexInfo.hex.kingdom})`}
            {selectedHexInfo.castle && ` | Castle: ${selectedHexInfo.castle.name}`}
            {selectedHexInfo.units.length > 0 && (
              <span> | Units: {selectedHexInfo.units.map(u => u.type).join(', ')}</span>
            )}
          </div>
        ) : (
          <div className="hex-info">Tap a hex to select</div>
        )}
      </footer>
    </div>
  )
}

export default App
