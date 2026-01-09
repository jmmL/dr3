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

  // Chit dimensions - rectangular like physical game pieces
  const chitWidth = hexSize * 0.7
  const chitHeight = hexSize * 0.55
  const fontSize = hexSize * 0.35
  const cornerRadius = 2

  // Layout units in a grid within the hex
  const maxPerRow = 2
  const spacingX = chitWidth + 2
  const spacingY = chitHeight + 2

  return (
    <g className="unit-markers">
      {summary.map((item, index) => {
        const row = Math.floor(index / maxPerRow)
        const col = index % maxPerRow
        const offsetX = (col - (Math.min(summary.length, maxPerRow) - 1) / 2) * spacingX
        const offsetY = (row - (Math.ceil(summary.length / maxPerRow) - 1) / 2) * spacingY
        const markerClass = `unit-marker ${item.hasMoved ? 'has-moved' : ''}`

        return (
          <g key={index} transform={`translate(${offsetX}, ${offsetY})`} className={markerClass}>
            {/* Chit background - rectangular like physical game pieces */}
            <rect
              x={-chitWidth / 2}
              y={-chitHeight / 2}
              width={chitWidth}
              height={chitHeight}
              rx={cornerRadius}
              ry={cornerRadius}
              fill={item.color}
              stroke="#000"
              strokeWidth={1.5}
              className="unit-chit"
            />
            {/* Inner border for depth effect */}
            <rect
              x={-chitWidth / 2 + 1.5}
              y={-chitHeight / 2 + 1.5}
              width={chitWidth - 3}
              height={chitHeight - 3}
              rx={cornerRadius - 1}
              ry={cornerRadius - 1}
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={0.5}
            />
            {/* Unit icon */}
            <text
              x={0}
              y={1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={fontSize}
              className="unit-icon"
            >
              {item.icon}
            </text>
            {/* Count badge if more than 1 */}
            {item.count > 1 && (
              <>
                <rect
                  x={chitWidth / 2 - fontSize * 0.6}
                  y={-chitHeight / 2 - fontSize * 0.3}
                  width={fontSize * 0.7}
                  height={fontSize * 0.7}
                  rx={2}
                  ry={2}
                  fill="#fff"
                  stroke={item.color}
                  strokeWidth={1}
                  className="unit-count-badge"
                />
                <text
                  x={chitWidth / 2 - fontSize * 0.25}
                  y={-chitHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={fontSize * 0.5}
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
