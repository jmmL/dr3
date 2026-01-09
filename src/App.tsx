import { useState } from 'react'
import HexGrid from './components/HexGrid'
import { hexData } from './data/mapData'
import './App.css'

function App() {
  const [selectedHex, setSelectedHex] = useState<string | null>(null)

  return (
    <div className="app">
      <header className="header">
        <h1>Divine Right</h1>
        <span className="turn-info">Map Preview</span>
      </header>

      <main className="main">
        <HexGrid
          hexes={hexData}
          selectedHex={selectedHex}
          onHexSelect={setSelectedHex}
        />
      </main>

      <footer className="footer">
        {selectedHex ? (
          <div className="hex-info">
            Selected: {selectedHex}
          </div>
        ) : (
          <div className="hex-info">Tap a hex to select</div>
        )}
      </footer>
    </div>
  )
}

export default App
