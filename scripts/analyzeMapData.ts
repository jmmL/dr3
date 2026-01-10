/**
 * Script to analyze map data discrepancies
 * Run with: npx tsx scripts/analyzeMapData.ts
 */

import { getRoyalCastles, getCastles, getKingdomHexes } from '../src/data/mapData'

console.log('=== ROYAL CASTLE ANALYSIS ===\n')

const royalCastles = getRoyalCastles()
console.log('Total royal castles found:', royalCastles.length)
console.log('\nRoyal castles by kingdom:\n')

// Group by kingdom
const byKingdom = new Map<string, typeof royalCastles>()
for (const c of royalCastles) {
  const k = c.kingdom || 'unassigned'
  const existing = byKingdom.get(k) || []
  existing.push(c)
  byKingdom.set(k, existing)
}

for (const [k, castles] of byKingdom) {
  console.log(`${k}:`)
  for (const c of castles) {
    console.log(`  - ${c.name} at (${c.col},${c.row})`)
  }
}

console.log('\n=== EXPECTED vs ACTUAL ===\n')

// Expected royal castles per rulebook
const expected: Record<string, string> = {
  hothior: 'Ider Bolis',
  mivior: 'Pennol',
  muetar: 'Castle Altarr',
  shucassam: 'Marzarbol',
  immer: 'The Pits',
  pon: 'Invisible School',
  rombune: 'Tower of Zards',
}

const issues: string[] = []

for (const [kingdom, expectedCastle] of Object.entries(expected)) {
  const actual = royalCastles.filter(c => c.kingdom === kingdom)
  const actualNames = actual.map(c => c.name).join(', ') || 'NONE FOUND'

  if (actual.length === 0) {
    console.log(`✗ ${kingdom}: expected "${expectedCastle}", found NONE`)
    issues.push(`${kingdom} has no royal castle assigned (expected: ${expectedCastle})`)
  } else if (actual.length > 1) {
    console.log(`? ${kingdom}: expected "${expectedCastle}", found MULTIPLE: ${actualNames}`)
    issues.push(`${kingdom} has multiple royal castles: ${actualNames}`)
  } else {
    const match = actual[0].name?.toLowerCase().includes(expectedCastle.toLowerCase().split(' ')[0])
    if (match) {
      console.log(`✓ ${kingdom}: "${actualNames}"`)
    } else {
      console.log(`✗ ${kingdom}: expected "${expectedCastle}", found "${actualNames}"`)
      issues.push(`${kingdom} has wrong castle: expected ${expectedCastle}, found ${actualNames}`)
    }
  }
}

console.log('\n=== ALL ROYAL CASTLES (for cross-reference) ===\n')
for (const c of royalCastles) {
  console.log(`${c.name} (${c.col},${c.row}) - assigned to: ${c.kingdom || 'NONE'}`)
}

console.log('\n=== SUMMARY ===\n')
if (issues.length === 0) {
  console.log('No issues found!')
} else {
  console.log(`Found ${issues.length} issue(s):\n`)
  issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`))
}

console.log('\n=== KINGDOM HEX COUNTS ===\n')
const playerKingdoms = ['hothior', 'mivior', 'muetar', 'shucassam', 'immer', 'pon', 'rombune']
for (const k of playerKingdoms) {
  const hexes = getKingdomHexes(k)
  console.log(`${k}: ${hexes.length} hexes`)
}
