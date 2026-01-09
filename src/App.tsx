import { useState, useMemo } from 'react'
import HexGrid from './components/HexGrid'
import { hexData, getHex } from './data/mapData'
import { createInitialState, getUnitsAtHex, getCastleAtHex } from './engine/state/initialState'
import { GameState } from './engine/state/GameState'
import { fromHexKey } from './types'
import { MAP_IMAGE_URL, MAP_CALIBRATION } from './config/mapCalibration'
import './App.css'

// Create a demo game for testing
function createDemoGame(): GameState {
  return createInitialState({
    humanPlayerId: 'human',
    humanKingdomId: 'hothior',
    aiPlayerId: 'ai',
    aiKingdomId: 'mivior',
    seed: 12345,
  })
}

function App() {
  const [selectedHex, setSelectedHex] = useState<string | null>(null)
  const [gameState] = useState<GameState>(() => createDemoGame())

  // Get info about the selected hex
  const selectedHexInfo = useMemo(() => {
    if (!selectedHex) return null

    const { col, row } = fromHexKey(selectedHex)
    const hex = getHex(col, row)
    const units = getUnitsAtHex(gameState, { col, row })
    const castle = getCastleAtHex(gameState, { col, row })

    return { hex, units, castle }
  }, [selectedHex, gameState])

  return (
    <div className="app">
      <header className="header">
        <h1>Divine Right</h1>
        <span className="turn-info">Turn {gameState.turn} - {gameState.phase}</span>
      </header>

      <main className="main">
        <HexGrid
          hexes={hexData}
          units={gameState.units}
          selectedHex={selectedHex}
          onHexSelect={setSelectedHex}
          mapImageUrl={MAP_IMAGE_URL ?? undefined}
          calibration={MAP_CALIBRATION}
        />
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
