import { Unit, UnitType } from '../engine/state/GameState'
import { KingdomColors } from '../types'
import './UnitMarker.css'

interface UnitMarkerProps {
  units: Unit[]
  hexSize: number
}

interface UnitSummaryItem {
  icon: string
  count: number
  color: string
  hasMoved: boolean
}

// Unit type to emoji mapping
const UNIT_ICONS: Record<UnitType, string> = {
  monarch: '👑',
  army: '⚔️',
  fleet: '⛵',
  ambassador: '📜',
  mercenary_army: '💰',
  mercenary_fleet: '🏴‍☠️',
}

/**
 * Get a compact representation of units for display
 */
function getUnitSummary(units: Unit[]): UnitSummaryItem[] {
  const summary: UnitSummaryItem[] = []

  // Group units by type and kingdom
  const groups = new Map<string, Unit[]>()
  for (const unit of units) {
    const key = `${unit.type}-${unit.kingdomId}`
    const existing = groups.get(key) || []
    existing.push(unit)
    groups.set(key, existing)
  }

  // Create summary entries
  for (const [key, groupUnits] of groups) {
    const [type] = key.split('-')
    const firstUnit = groupUnits[0]
    const color = firstUnit.kingdomId
      ? KingdomColors[firstUnit.kingdomId] || '#888'
      : '#888'

    // Check if all units in group have moved
    const allMoved = groupUnits.every(u => u.hasMoved)

    summary.push({
      icon: UNIT_ICONS[type as UnitType] || '?',
      count: groupUnits.length,
      color,
      hasMoved: allMoved,
    })
  }

  return summary
}

export default function UnitMarker({ units, hexSize }: UnitMarkerProps) {
  if (units.length === 0) return null

  const summary = getUnitSummary(units)
  const fontSize = hexSize * 0.4

  // Layout units in a grid within the hex
  const maxPerRow = 2
  const spacing = hexSize * 0.45

  return (
    <g className="unit-markers">
      {summary.map((item, index) => {
        const row = Math.floor(index / maxPerRow)
        const col = index % maxPerRow
        const offsetX = (col - (Math.min(summary.length, maxPerRow) - 1) / 2) * spacing
        const offsetY = (row - (Math.ceil(summary.length / maxPerRow) - 1) / 2) * spacing * 0.8
        const markerClass = `unit-marker ${item.hasMoved ? 'has-moved' : ''}`

        return (
          <g key={index} transform={`translate(${offsetX}, ${offsetY})`} className={markerClass}>
            {/* Background circle */}
            <circle
              r={fontSize * 0.7}
              fill={item.color}
              stroke="#fff"
              strokeWidth={1.5}
              opacity={0.95}
            />
            {/* Unit icon */}
            <text
              x={0}
              y={2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={fontSize * 0.8}
              className="unit-icon"
            >
              {item.icon}
            </text>
            {/* Count badge if more than 1 */}
            {item.count > 1 && (
              <>
                <circle
                  cx={fontSize * 0.5}
                  cy={-fontSize * 0.3}
                  r={fontSize * 0.35}
                  fill="#fff"
                  stroke={item.color}
                  strokeWidth={1}
                  className="unit-count-badge"
                />
                <text
                  x={fontSize * 0.5}
                  y={-fontSize * 0.25}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={fontSize * 0.45}
                  fontWeight="bold"
                  fill="#000"
                  className="unit-count-badge"
                >
                  {item.count}
                </text>
              </>
            )}
          </g>
        )
      })}
    </g>
  )
}
