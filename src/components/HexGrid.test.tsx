import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HexGrid from './HexGrid'
import { HexData, toHexKey, TerrainFlags } from '../types'

// Create a small test hex map (3x3 grid)
function createTestHexMap(): Map<string, HexData> {
  const hexes: HexData[] = [
    { col: 0, row: 0, name: null, terrain: TerrainFlags.CLEAR, kingdom: 'hothior', intrinsic: 0 },
    { col: 1, row: 0, name: null, terrain: TerrainFlags.FOREST, kingdom: 'hothior', intrinsic: 0 },
    { col: 2, row: 0, name: 'Test Castle', terrain: TerrainFlags.CASTLE, kingdom: 'hothior', intrinsic: 3 },
    { col: 0, row: 1, name: null, terrain: TerrainFlags.HILL, kingdom: null, intrinsic: 0 },
    { col: 1, row: 1, name: null, terrain: TerrainFlags.MOUNTAIN, kingdom: null, intrinsic: 0 },
    { col: 2, row: 1, name: null, terrain: TerrainFlags.SEA, kingdom: null, intrinsic: 0 },
    { col: 0, row: 2, name: null, terrain: TerrainFlags.CLEAR, kingdom: 'mivior', intrinsic: 0 },
    { col: 1, row: 2, name: null, terrain: TerrainFlags.SWAMP, kingdom: 'mivior', intrinsic: 0 },
    { col: 2, row: 2, name: null, terrain: TerrainFlags.RIVER, kingdom: 'mivior', intrinsic: 0 },
  ]

  return new Map(hexes.map(hex => [toHexKey(hex.col, hex.row), hex]))
}

describe('HexGrid', () => {
  it('renders hex grid container', () => {
    const hexes = createTestHexMap()
    const onHexSelect = vi.fn()

    const { container } = render(
      <HexGrid hexes={hexes} selectedHex={null} onHexSelect={onHexSelect} />
    )

    expect(container.querySelector('.hex-grid-container')).toBeInTheDocument()
  })

  it('renders SVG hex grid element', () => {
    const hexes = createTestHexMap()
    const onHexSelect = vi.fn()

    const { container } = render(
      <HexGrid hexes={hexes} selectedHex={null} onHexSelect={onHexSelect} />
    )

    expect(container.querySelector('svg.hex-grid')).toBeInTheDocument()
  })

  it('renders correct number of hexes', () => {
    const hexes = createTestHexMap()
    const onHexSelect = vi.fn()

    const { container } = render(
      <HexGrid hexes={hexes} selectedHex={null} onHexSelect={onHexSelect} />
    )

    const hexPolygons = container.querySelectorAll('.hex-polygon')
    expect(hexPolygons).toHaveLength(9) // 3x3 grid
  })

  it('calls onHexSelect when hex is clicked', () => {
    const hexes = createTestHexMap()
    const onHexSelect = vi.fn()

    const { container } = render(
      <HexGrid hexes={hexes} selectedHex={null} onHexSelect={onHexSelect} />
    )

    // Find and click the first hex
    const firstHex = container.querySelector('.hex')
    expect(firstHex).not.toBeNull()
    fireEvent.click(firstHex!)

    expect(onHexSelect).toHaveBeenCalled()
  })

  it('deselects hex when clicking selected hex', () => {
    const hexes = createTestHexMap()
    const onHexSelect = vi.fn()
    const selectedHex = '0,0'

    const { container } = render(
      <HexGrid hexes={hexes} selectedHex={selectedHex} onHexSelect={onHexSelect} />
    )

    // Click the selected hex
    const hex = container.querySelector(`[data-hex="${selectedHex}"]`)
    expect(hex).not.toBeNull()
    fireEvent.click(hex!)

    // Should call with null to deselect
    expect(onHexSelect).toHaveBeenCalledWith(null)
  })

  it('selects different hex when clicking unselected hex', () => {
    const hexes = createTestHexMap()
    const onHexSelect = vi.fn()

    const { container } = render(
      <HexGrid hexes={hexes} selectedHex="0,0" onHexSelect={onHexSelect} />
    )

    // Click a different hex
    const hex = container.querySelector('[data-hex="1,1"]')
    expect(hex).not.toBeNull()
    fireEvent.click(hex!)

    expect(onHexSelect).toHaveBeenCalledWith('1,1')
  })

  it('applies selected class to selected hex', () => {
    const hexes = createTestHexMap()
    const onHexSelect = vi.fn()

    const { container } = render(
      <HexGrid hexes={hexes} selectedHex="1,1" onHexSelect={onHexSelect} />
    )

    const selectedHex = container.querySelector('[data-hex="1,1"]')
    expect(selectedHex).toHaveClass('hex-selected')
  })

  it('renders reset view button', () => {
    const hexes = createTestHexMap()
    const onHexSelect = vi.fn()

    render(
      <HexGrid hexes={hexes} selectedHex={null} onHexSelect={onHexSelect} />
    )

    expect(screen.getByText('Reset View')).toBeInTheDocument()
  })

  it('shows zoom level indicator', () => {
    const hexes = createTestHexMap()
    const onHexSelect = vi.fn()

    const { container } = render(
      <HexGrid hexes={hexes} selectedHex={null} onHexSelect={onHexSelect} />
    )

    // Initial zoom should be 100%
    expect(container.querySelector('.zoom-level')).toHaveTextContent('100%')
  })

  it('renders castle icon for castle terrain', () => {
    const hexes = createTestHexMap()
    const onHexSelect = vi.fn()

    render(
      <HexGrid hexes={hexes} selectedHex={null} onHexSelect={onHexSelect} />
    )

    // Should find castle emoji (🏯 for regular castle)
    expect(screen.getByText('🏯')).toBeInTheDocument()
  })

  it('renders units when provided', () => {
    const hexes = createTestHexMap()
    const onHexSelect = vi.fn()
    const units = {
      'test-army': {
        id: 'test-army',
        type: 'army' as const,
        kingdomId: 'hothior' as const,
        ownerId: 'player1',
        position: { col: 0, row: 0 },
        movementAllowance: 4,
        movementRemaining: 4,
        isInsideCastle: false,
        hasMoved: false,
        specialAbilities: [],
      },
    }

    const { container } = render(
      <HexGrid hexes={hexes} units={units} selectedHex={null} onHexSelect={onHexSelect} />
    )

    expect(container.querySelector('.unit-markers')).toBeInTheDocument()
  })

  it('applies overlay mode when mapImageUrl provided', () => {
    const hexes = createTestHexMap()
    const onHexSelect = vi.fn()

    const { container } = render(
      <HexGrid
        hexes={hexes}
        selectedHex={null}
        onHexSelect={onHexSelect}
        mapImageUrl="/test-map.png"
        mapImageDimensions={{ width: 1000, height: 800 }}
      />
    )

    // Hexes should have overlay class
    const overlayHexes = container.querySelectorAll('.hex-overlay')
    expect(overlayHexes.length).toBeGreaterThan(0)
  })

  it('renders hexes without overlay class when no map image', () => {
    const hexes = createTestHexMap()
    const onHexSelect = vi.fn()

    const { container } = render(
      <HexGrid hexes={hexes} selectedHex={null} onHexSelect={onHexSelect} />
    )

    const overlayHexes = container.querySelectorAll('.hex-overlay')
    expect(overlayHexes).toHaveLength(0)
  })
})
