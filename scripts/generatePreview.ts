/**
 * Script to generate a preview SVG of the hex grid
 * Run with: npx tsx scripts/generatePreview.ts
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { hexDataArray } from '../src/data/mapData'
import { TerrainFlags, KingdomColors, hasTerrain, getPrimaryTerrain } from '../src/types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Terrain colors
const TerrainColors: Record<string, string> = {
  clear: '#90EE90',
  forest: '#228B22',
  hill: '#DEB887',
  mountain: '#808080',
  pass: '#A9A9A9',
  swamp: '#556B2F',
  river: '#4682B4',
  lake: '#4169E1',
  lakeshore: '#87CEEB',
  sea: '#000080',
  seashore: '#F0E68C',
  scenic: '#FFB6C1',
  battlefield: '#8B4513',
}

// Hex geometry (flat-top hexagon - matching the DR board game)
const HEX_SIZE = 12
const HEX_WIDTH = 2 * HEX_SIZE // Flat-top: point to point horizontally
const HEX_HEIGHT = Math.sqrt(3) * HEX_SIZE // Flat-top: flat edge to flat edge vertically
const MAP_COLS = 35
const MAP_ROWS = 31
// Flat-top: columns interlock horizontally (3/4 width spacing)
const GRID_WIDTH = MAP_COLS * HEX_WIDTH * 0.75 + HEX_WIDTH * 0.25
const GRID_HEIGHT = MAP_ROWS * HEX_HEIGHT + HEX_HEIGHT * 0.5

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

function hexToPixel(col: number, row: number): { x: number; y: number } {
  const x = col * HEX_WIDTH * 0.75 + HEX_SIZE
  const y = row * HEX_HEIGHT + HEX_HEIGHT / 2 + (col % 2 === 1 ? HEX_HEIGHT / 2 : 0)
  return { x, y }
}

function getHexColor(terrain: number): string {
  const primaryTerrain = getPrimaryTerrain(terrain)
  return TerrainColors[primaryTerrain] || TerrainColors.clear
}

function getKingdomBorderColor(kingdom: string | null): string | null {
  if (kingdom) {
    return KingdomColors[kingdom] || null
  }
  return null
}

function getHexIcon(terrain: number): string | null {
  if (hasTerrain(terrain, TerrainFlags.CASTLE)) {
    if (hasTerrain(terrain, TerrainFlags.ROYAL)) {
      return '🏰'
    }
    return '🏯'
  }
  if (hasTerrain(terrain, TerrainFlags.PORT)) {
    return '⚓'
  }
  return null
}

// Generate SVG
console.log('Generating hex grid SVG preview...')

let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${GRID_WIDTH + 40}"
     height="${GRID_HEIGHT + 80}"
     viewBox="-20 -40 ${GRID_WIDTH + 40} ${GRID_HEIGHT + 80}">
  <style>
    .title { font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; }
    .subtitle { font-family: Arial, sans-serif; font-size: 14px; }
    .hex-icon { font-size: ${HEX_SIZE * 0.6}px; }
  </style>

  <!-- Background -->
  <rect x="-20" y="-40" width="${GRID_WIDTH + 40}" height="${GRID_HEIGHT + 80}" fill="#1a1a2e"/>

  <!-- Title -->
  <text x="${GRID_WIDTH / 2}" y="-15" text-anchor="middle" class="title" fill="#fff">Divine Right - Minaria Map</text>
  <text x="${GRID_WIDTH / 2}" y="5" text-anchor="middle" class="subtitle" fill="#aaa">${hexDataArray.length} hexes rendered</text>

  <!-- Hexes -->
`

for (const hex of hexDataArray) {
  const { x, y } = hexToPixel(hex.col, hex.row)
  const fillColor = getHexColor(hex.terrain)
  const kingdomBorder = getKingdomBorderColor(hex.kingdom)
  const icon = getHexIcon(hex.terrain)

  svgContent += `  <g transform="translate(${x.toFixed(1)}, ${(y + 40).toFixed(1)})">
    <polygon points="${hexPoints(HEX_SIZE)}" fill="${fillColor}" stroke="${kingdomBorder || '#333'}" stroke-width="${kingdomBorder ? 1.5 : 0.3}"/>
`

  if (icon) {
    svgContent += `    <text x="0" y="0" text-anchor="middle" dominant-baseline="central" class="hex-icon">${icon}</text>
`
  }

  svgContent += `  </g>
`
}

// Add legend
const legendY = GRID_HEIGHT + 50
svgContent += `
  <!-- Legend -->
  <text x="10" y="${legendY}" fill="#fff" font-family="Arial" font-size="10">🏰 Royal Castle  🏯 Castle  ⚓ Port</text>
`

svgContent += `</svg>`

// Write SVG file
const outputDir = path.join(__dirname, '..', 'e2e', 'screenshots')
fs.mkdirSync(outputDir, { recursive: true })

const svgPath = path.join(outputDir, 'hex-grid-preview.svg')
fs.writeFileSync(svgPath, svgContent)

console.log(`✓ SVG written to: ${svgPath}`)
console.log(`  Total hexes: ${hexDataArray.length}`)
console.log(`  Dimensions: ${Math.round(GRID_WIDTH + 40)}x${Math.round(GRID_HEIGHT + 80)}`)

// Also generate a simple HTML page that wraps the SVG for easier viewing
const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Divine Right - Map Preview</title>
  <style>
    body { margin: 0; background: #1a1a2e; display: flex; justify-content: center; padding: 20px; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <img src="hex-grid-preview.svg" alt="Divine Right Map Preview">
</body>
</html>`

const htmlPath = path.join(outputDir, 'preview.html')
fs.writeFileSync(htmlPath, htmlContent)
console.log(`✓ HTML wrapper written to: ${htmlPath}`)
