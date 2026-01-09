import { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { HexData, TerrainFlags, TerrainColors, KingdomColors, getPrimaryTerrain, hasTerrain, toHexKey } from '../types'
import { Unit } from '../engine/state/GameState'
import UnitMarker from './UnitMarker'
import './HexGrid.css'

interface HexGridProps {
  hexes: Map<string, HexData>
  units?: Record<string, Unit>
  selectedHex: string | null
  onHexSelect: (hexKey: string | null) => void
  /** URL to the map image background. When provided, hexes render as transparent overlay */
  mapImageUrl?: string
  /** Calibration settings for aligning hex grid to map image */
  calibration?: {
    /** X offset to shift the entire grid */
    offsetX: number
    /** Y offset to shift the entire grid */
    offsetY: number
    /** Scale factor for hex size adjustment */
    hexScale: number
  }
}

// Hex geometry constants (flat-top hexagon - matching the DR board game)
const HEX_SIZE = 20 // Distance from center to vertex
const HEX_WIDTH = 2 * HEX_SIZE // Flat-top: point to point horizontally
const HEX_HEIGHT = Math.sqrt(3) * HEX_SIZE // Flat-top: flat edge to flat edge vertically

// Map dimensions
const MAP_COLS = 35
const MAP_ROWS = 31

// Calculate SVG viewBox dimensions
// Flat-top: columns interlock horizontally (3/4 width spacing)
const GRID_WIDTH = MAP_COLS * HEX_WIDTH * 0.75 + HEX_WIDTH * 0.25
const GRID_HEIGHT = MAP_ROWS * HEX_HEIGHT + HEX_HEIGHT * 0.5

/**
 * Generate SVG points string for a flat-top hexagon centered at origin
 */
function hexPoints(size: number): string {
  const points: string[] = []
  for (let i = 0; i < 6; i++) {
    // Flat-top: start at 0 degrees (point to the right)
    const angle = (Math.PI / 180) * (60 * i)
    const x = size * Math.cos(angle)
    const y = size * Math.sin(angle)
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return points.join(' ')
}

/**
 * Convert offset coordinates (col, row) to pixel position (center of hex)
 * Using odd-q offset (odd columns are shifted down)
 *
 * For flat-top hexes:
 * - Horizontal spacing = HEX_WIDTH * 3/4 (hexes interlock)
 * - Vertical spacing = HEX_HEIGHT
 * - Odd columns offset down by HEX_HEIGHT / 2
 */
function hexToPixel(col: number, row: number): { x: number; y: number } {
  const x = col * HEX_WIDTH * 0.75 + HEX_SIZE
  const y = row * HEX_HEIGHT + HEX_HEIGHT / 2 + (col % 2 === 1 ? HEX_HEIGHT / 2 : 0)
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
  units: Unit[]
  isSelected: boolean
  onClick: () => void
  /** When true, hex is transparent (for map image overlay mode) */
  overlayMode: boolean
  /** Scale factor for hex size */
  hexScale: number
}

function SingleHex({ hex, units, isSelected, onClick, overlayMode, hexScale }: SingleHexProps) {
  const { x, y } = hexToPixel(hex.col, hex.row)
  const fillColor = getHexColor(hex)
  const kingdomBorder = getKingdomBorderColor(hex)
  const icon = getHexIcon(hex)
  const hexKey = toHexKey(hex.col, hex.row)
  const scaledSize = HEX_SIZE * hexScale

  return (
    <g
      className={`hex ${isSelected ? 'hex-selected' : ''} ${overlayMode ? 'hex-overlay' : ''}`}
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      data-hex={hexKey}
    >
      {/* Main hex shape - transparent in overlay mode */}
      <polygon
        points={hexPoints(scaledSize)}
        fill={overlayMode ? 'transparent' : fillColor}
        stroke={overlayMode ? 'transparent' : (kingdomBorder || '#333')}
        strokeWidth={overlayMode ? 0 : (kingdomBorder ? 2 : 0.5)}
        className="hex-polygon"
      />

      {/* Hover outline for overlay mode */}
      {overlayMode && (
        <polygon
          points={hexPoints(scaledSize)}
          fill="transparent"
          stroke="transparent"
          strokeWidth={1.5}
          className="hex-hover-outline"
        />
      )}

      {/* Units on this hex */}
      {units.length > 0 && <UnitMarker units={units} hexSize={scaledSize} />}

      {/* Selection highlight */}
      {isSelected && (
        <polygon
          points={hexPoints(scaledSize - 2)}
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          className="hex-selection"
        />
      )}

      {/* Icon for special features - only show in non-overlay mode */}
      {!overlayMode && icon && (
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={scaledSize * 0.8}
          className="hex-icon"
        >
          {icon}
        </text>
      )}

      {/* Hex name (for named locations) - only show in non-overlay mode */}
      {!overlayMode && hex.name && !icon && (
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

// Default calibration - no offset, no scale
const DEFAULT_CALIBRATION = { offsetX: 0, offsetY: 0, hexScale: 1 }

export default function HexGrid({ hexes, units, selectedHex, onHexSelect, mapImageUrl, calibration = DEFAULT_CALIBRATION }: HexGridProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: GRID_WIDTH, height: GRID_HEIGHT })
  const overlayMode = !!mapImageUrl
  const [isPanning, setIsPanning] = useState(false)
  const [startPan, setStartPan] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)

  // Convert hex Map to array for rendering
  const hexArray = useMemo(() => Array.from(hexes.values()), [hexes])

  // Group units by hex position for efficient lookup
  const unitsByHex = useMemo(() => {
    const map = new Map<string, Unit[]>()
    if (units) {
      for (const unit of Object.values(units)) {
        const key = toHexKey(unit.position.col, unit.position.row)
        const existing = map.get(key) || []
        existing.push(unit)
        map.set(key, existing)
      }
    }
    return map
  }, [units])

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
        {/* Background - either solid color or map image */}
        <rect
          className="hex-background"
          x={-100}
          y={-100}
          width={GRID_WIDTH + 200}
          height={GRID_HEIGHT + 200}
          fill="#1a1a2e"
        />

        {/* Map image background when provided */}
        {mapImageUrl && (
          <image
            href={mapImageUrl}
            x={0}
            y={0}
            width={GRID_WIDTH}
            height={GRID_HEIGHT}
            preserveAspectRatio="xMidYMid meet"
            className="map-image"
          />
        )}

        {/* Hex overlay group with calibration offset */}
        <g transform={`translate(${calibration.offsetX}, ${calibration.offsetY})`}>
          {/* Render all hexes */}
          {hexArray.map(hex => {
            const hexKey = toHexKey(hex.col, hex.row)
            return (
              <SingleHex
                key={hexKey}
                hex={hex}
                units={unitsByHex.get(hexKey) || []}
                isSelected={selectedHex === hexKey}
                onClick={() => handleHexClick(hexKey)}
                overlayMode={overlayMode}
                hexScale={calibration.hexScale}
              />
            )
          })}
        </g>
      </svg>
    </div>
  )
}
