import { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { HexData, TerrainFlags, TerrainColors, KingdomColors, getPrimaryTerrain, hasTerrain, toHexKey } from '../types'
import './HexGrid.css'

interface HexGridProps {
  hexes: Map<string, HexData>
  selectedHex: string | null
  onHexSelect: (hexKey: string | null) => void
}

// Hex geometry constants (pointy-top hexagon)
const HEX_SIZE = 20 // Distance from center to vertex
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE
const HEX_HEIGHT = 2 * HEX_SIZE

// Map dimensions
const MAP_COLS = 35
const MAP_ROWS = 31

// Calculate SVG viewBox dimensions
const GRID_WIDTH = MAP_COLS * HEX_WIDTH + HEX_WIDTH / 2
const GRID_HEIGHT = MAP_ROWS * HEX_HEIGHT * 0.75 + HEX_HEIGHT * 0.25

/**
 * Generate SVG points string for a pointy-top hexagon centered at origin
 */
function hexPoints(size: number): string {
  const points: string[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30)
    const x = size * Math.cos(angle)
    const y = size * Math.sin(angle)
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return points.join(' ')
}

/**
 * Convert offset coordinates (col, row) to pixel position (center of hex)
 * Using odd-q offset (odd columns are shifted down)
 */
function hexToPixel(col: number, row: number): { x: number; y: number } {
  const x = col * HEX_WIDTH * 0.75 * (4 / 3) + HEX_WIDTH / 2
  const y = row * HEX_HEIGHT * 0.75 + HEX_HEIGHT / 2 + (col % 2 === 1 ? HEX_HEIGHT * 0.375 : 0)
  return { x, y }
}

/**
 * Get display color for a hex based on terrain
 */
function getHexColor(hex: HexData): string {
  const primaryTerrain = getPrimaryTerrain(hex.terrain)
  return TerrainColors[primaryTerrain] || TerrainColors.clear
}

/**
 * Get border color based on kingdom
 */
function getKingdomBorderColor(hex: HexData): string | null {
  if (hex.kingdom) {
    return KingdomColors[hex.kingdom] || null
  }
  return null
}

/**
 * Get icon/emoji for special hex features
 */
function getHexIcon(hex: HexData): string | null {
  if (hasTerrain(hex.terrain, TerrainFlags.CASTLE)) {
    if (hasTerrain(hex.terrain, TerrainFlags.ROYAL)) {
      return '🏰' // Royal castle
    }
    return '🏯' // Regular castle
  }
  if (hasTerrain(hex.terrain, TerrainFlags.PORT)) {
    return '⚓'
  }
  if (hasTerrain(hex.terrain, TerrainFlags.ANCIENT_BATTLEFIELD)) {
    return '⚔️'
  }
  if (hasTerrain(hex.terrain, TerrainFlags.SCENIC)) {
    return '✨'
  }
  return null
}

interface SingleHexProps {
  hex: HexData
  isSelected: boolean
  onClick: () => void
}

function SingleHex({ hex, isSelected, onClick }: SingleHexProps) {
  const { x, y } = hexToPixel(hex.col, hex.row)
  const fillColor = getHexColor(hex)
  const kingdomBorder = getKingdomBorderColor(hex)
  const icon = getHexIcon(hex)
  const hexKey = toHexKey(hex.col, hex.row)

  return (
    <g
      className={`hex ${isSelected ? 'hex-selected' : ''}`}
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      data-hex={hexKey}
    >
      {/* Main hex shape */}
      <polygon
        points={hexPoints(HEX_SIZE)}
        fill={fillColor}
        stroke={kingdomBorder || '#333'}
        strokeWidth={kingdomBorder ? 2 : 0.5}
        className="hex-polygon"
      />

      {/* Selection highlight */}
      {isSelected && (
        <polygon
          points={hexPoints(HEX_SIZE - 2)}
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          className="hex-selection"
        />
      )}

      {/* Icon for special features */}
      {icon && (
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={HEX_SIZE * 0.8}
          className="hex-icon"
        >
          {icon}
        </text>
      )}

      {/* Hex name (for named locations) */}
      {hex.name && !icon && (
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={5}
          fill="#000"
          className="hex-name"
        >
          {hex.name.length > 8 ? hex.name.substring(0, 7) + '…' : hex.name}
        </text>
      )}
    </g>
  )
}

export default function HexGrid({ hexes, selectedHex, onHexSelect }: HexGridProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: GRID_WIDTH, height: GRID_HEIGHT })
  const [isPanning, setIsPanning] = useState(false)
  const [startPan, setStartPan] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)

  // Convert hex Map to array for rendering
  const hexArray = useMemo(() => Array.from(hexes.values()), [hexes])

  // Handle hex click
  const handleHexClick = useCallback((hexKey: string) => {
    onHexSelect(selectedHex === hexKey ? null : hexKey)
  }, [selectedHex, onHexSelect])

  // Pan handling
  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (e.target === svgRef.current || (e.target as Element).classList.contains('hex-background')) {
      setIsPanning(true)
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      setStartPan({ x: clientX, y: clientY })
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isPanning) return

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    const dx = (clientX - startPan.x) * scale
    const dy = (clientY - startPan.y) * scale

    setViewBox(prev => ({
      ...prev,
      x: prev.x - dx,
      y: prev.y - dy,
    }))
    setStartPan({ x: clientX, y: clientY })
  }, [isPanning, startPan, scale])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Zoom handling
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9
    const newScale = Math.min(Math.max(scale * zoomFactor, 0.5), 3)

    // Zoom toward mouse position
    const rect = svgRef.current?.getBoundingClientRect()
    if (rect) {
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const svgX = viewBox.x + (mouseX / rect.width) * viewBox.width
      const svgY = viewBox.y + (mouseY / rect.height) * viewBox.height

      const newWidth = GRID_WIDTH * newScale
      const newHeight = GRID_HEIGHT * newScale

      setViewBox({
        x: svgX - (mouseX / rect.width) * newWidth,
        y: svgY - (mouseY / rect.height) * newHeight,
        width: newWidth,
        height: newHeight,
      })
      setScale(newScale)
    }
  }, [scale, viewBox])

  // Touch zoom handling
  const lastTouchDistance = useRef<number | null>(null)

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)

      if (lastTouchDistance.current !== null) {
        const zoomFactor = lastTouchDistance.current / distance
        const newScale = Math.min(Math.max(scale * zoomFactor, 0.5), 3)

        const newWidth = GRID_WIDTH * newScale
        const newHeight = GRID_HEIGHT * newScale

        // Zoom toward center of pinch
        const centerX = (touch1.clientX + touch2.clientX) / 2
        const centerY = (touch1.clientY + touch2.clientY) / 2
        const rect = svgRef.current?.getBoundingClientRect()

        if (rect) {
          const svgX = viewBox.x + (centerX - rect.left) / rect.width * viewBox.width
          const svgY = viewBox.y + (centerY - rect.top) / rect.height * viewBox.height

          setViewBox({
            x: svgX - (centerX - rect.left) / rect.width * newWidth,
            y: svgY - (centerY - rect.top) / rect.height * newHeight,
            width: newWidth,
            height: newHeight,
          })
          setScale(newScale)
        }
      }
      lastTouchDistance.current = distance
    } else if (e.touches.length === 1 && isPanning) {
      handleMouseMove(e)
    }
  }, [scale, viewBox, isPanning, handleMouseMove])

  const handleTouchEnd = useCallback(() => {
    lastTouchDistance.current = null
    setIsPanning(false)
  }, [])

  // Reset view button
  const resetView = useCallback(() => {
    setViewBox({ x: 0, y: 0, width: GRID_WIDTH, height: GRID_HEIGHT })
    setScale(1)
  }, [])

  // Add global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsPanning(false)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    window.addEventListener('touchend', handleGlobalMouseUp)
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
      window.removeEventListener('touchend', handleGlobalMouseUp)
    }
  }, [])

  return (
    <div className="hex-grid-container">
      <div className="hex-grid-controls">
        <button onClick={resetView} className="reset-view-btn">
          Reset View
        </button>
        <span className="zoom-level">{Math.round(100 / scale)}%</span>
      </div>
      <svg
        ref={svgRef}
        className="hex-grid"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Background */}
        <rect
          className="hex-background"
          x={-100}
          y={-100}
          width={GRID_WIDTH + 200}
          height={GRID_HEIGHT + 200}
          fill="#1a1a2e"
        />

        {/* Render all hexes */}
        {hexArray.map(hex => (
          <SingleHex
            key={toHexKey(hex.col, hex.row)}
            hex={hex}
            isSelected={selectedHex === toHexKey(hex.col, hex.row)}
            onClick={() => handleHexClick(toHexKey(hex.col, hex.row))}
          />
        ))}
      </svg>
    </div>
  )
}
