import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import UnitMarker from './UnitMarker'
import { Unit } from '../engine/state/GameState'

// Helper to create mock units
function createMockUnit(overrides: Partial<Unit> = {}): Unit {
  return {
    id: 'test-unit-1',
    type: 'army',
    kingdomId: 'hothior',
    ownerId: 'player1',
    position: { col: 5, row: 5 },
    movementAllowance: 4,
    movementRemaining: 4,
    isInsideCastle: false,
    hasMoved: false,
    specialAbilities: [],
    ...overrides,
  }
}

describe('UnitMarker', () => {
  it('renders nothing when no units provided', () => {
    const { container } = render(
      <svg>
        <UnitMarker units={[]} hexSize={20} />
      </svg>
    )

    expect(container.querySelector('.unit-markers')).toBeNull()
  })

  it('renders unit markers group when units provided', () => {
    const units = [createMockUnit()]

    const { container } = render(
      <svg>
        <UnitMarker units={units} hexSize={20} />
      </svg>
    )

    expect(container.querySelector('.unit-markers')).toBeInTheDocument()
  })

  it('displays unit icon for army type', () => {
    const units = [createMockUnit({ type: 'army' })]

    render(
      <svg>
        <UnitMarker units={units} hexSize={20} />
      </svg>
    )

    // Army icon is ⚔️
    expect(screen.getByText('⚔️')).toBeInTheDocument()
  })

  it('displays monarch icon for monarch type', () => {
    const units = [createMockUnit({ type: 'monarch' })]

    render(
      <svg>
        <UnitMarker units={units} hexSize={20} />
      </svg>
    )

    expect(screen.getByText('👑')).toBeInTheDocument()
  })

  it('displays ambassador icon for ambassador type', () => {
    const units = [createMockUnit({ type: 'ambassador' })]

    render(
      <svg>
        <UnitMarker units={units} hexSize={20} />
      </svg>
    )

    expect(screen.getByText('📜')).toBeInTheDocument()
  })

  it('shows count badge when multiple units of same type', () => {
    const units = [
      createMockUnit({ id: 'army-1', type: 'army' }),
      createMockUnit({ id: 'army-2', type: 'army' }),
      createMockUnit({ id: 'army-3', type: 'army' }),
    ]

    render(
      <svg>
        <UnitMarker units={units} hexSize={20} />
      </svg>
    )

    // Should show count of 3
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('does not show count badge for single unit', () => {
    const units = [createMockUnit()]

    const { container } = render(
      <svg>
        <UnitMarker units={units} hexSize={20} />
      </svg>
    )

    // Should not have a count badge (only icon)
    expect(container.querySelectorAll('.unit-count-badge')).toHaveLength(0)
  })

  it('groups units by type and kingdom', () => {
    const units = [
      createMockUnit({ id: 'army-1', type: 'army', kingdomId: 'hothior' }),
      createMockUnit({ id: 'army-2', type: 'army', kingdomId: 'hothior' }),
      createMockUnit({ id: 'monarch-1', type: 'monarch', kingdomId: 'hothior' }),
    ]

    const { container } = render(
      <svg>
        <UnitMarker units={units} hexSize={20} />
      </svg>
    )

    // Should have 2 separate unit markers (army group + monarch)
    const markers = container.querySelectorAll('.unit-marker')
    expect(markers).toHaveLength(2)
  })

  it('applies has-moved class when all units in group have moved', () => {
    const units = [
      createMockUnit({ id: 'army-1', hasMoved: true }),
      createMockUnit({ id: 'army-2', hasMoved: true }),
    ]

    const { container } = render(
      <svg>
        <UnitMarker units={units} hexSize={20} />
      </svg>
    )

    expect(container.querySelector('.has-moved')).toBeInTheDocument()
  })

  it('does not apply has-moved class when not all units moved', () => {
    const units = [
      createMockUnit({ id: 'army-1', hasMoved: true }),
      createMockUnit({ id: 'army-2', hasMoved: false }),
    ]

    const { container } = render(
      <svg>
        <UnitMarker units={units} hexSize={20} />
      </svg>
    )

    expect(container.querySelector('.has-moved')).toBeNull()
  })

  it('uses kingdom color for chit background', () => {
    const units = [createMockUnit({ kingdomId: 'mivior' })]

    const { container } = render(
      <svg>
        <UnitMarker units={units} hexSize={20} />
      </svg>
    )

    const chit = container.querySelector('.unit-chit')
    expect(chit).toHaveAttribute('fill', '#4169E1') // Mivior's royal blue
  })

  it('scales chit size based on hexSize prop', () => {
    const units = [createMockUnit()]

    const { container } = render(
      <svg>
        <UnitMarker units={units} hexSize={40} />
      </svg>
    )

    const chit = container.querySelector('.unit-chit')
    // chitWidth = hexSize * 0.7 = 28
    expect(chit).toHaveAttribute('width', '28')
  })
})
