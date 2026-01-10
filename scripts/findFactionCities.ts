/**
 * Script to search for all faction cities in hex data
 * Run with: npx tsx scripts/findFactionCities.ts
 */

import { hexDataArray } from '../src/data/mapData'

// All factions with their cities and capitals (per user's rulebook data)
const factions: Record<string, {
  race: string
  capital: string
  cities: Record<string, { armies: number; seaFleet?: number; riverFleet?: number; isCapital?: boolean }>
}> = {
  ghem: {
    race: 'Dwarves',
    capital: 'Ghem',
    cities: {
      'Aws Noir': { armies: 2, riverFleet: 1 },
      'Rosengg': { armies: 2 },
      'Alzak': { armies: 1 },
      'Ghem': { armies: 3, isCapital: true },
    }
  },
  rombune: {
    race: 'Human',
    capital: 'Golkus',
    cities: {
      'Parros': { armies: 2, seaFleet: 1 },
      'Golkus': { armies: 2, seaFleet: 1, isCapital: true },
      'Thores': { armies: 1, seaFleet: 1 },
      'Jipols': { armies: 1, seaFleet: 1 },
    }
  },
  trolls: {
    race: 'Trolls',
    capital: 'Stone Face',
    cities: {
      'The Gathering': { armies: 2 },
      'Shunned Vale': { armies: 2 },
      'Stone Face': { armies: 2, isCapital: true },
      'The Crag': { armies: 2 },
    }
  },
  immer: {
    race: 'Human',
    capital: 'Altarr',
    cities: {
      'Altarr': { armies: 3, isCapital: true },
      'Gap': { armies: 1 },
      'Gorpin': { armies: 1 },
      'Muscaster': { armies: 2 },
      'Wirzor': { armies: 2 },
    }
  },
  hothior: {
    race: 'Human',
    capital: 'Port Lork',
    cities: {
      'Farnot': { armies: 1 },
      'Lapspell': { armies: 2, seaFleet: 1 },
      'Port Lork': { armies: 2, seaFleet: 1, isCapital: true },
      'Tadafat': { armies: 2, riverFleet: 1 },
    }
  },
  neuth: {
    race: 'Elves',
    capital: 'Ider Bolis',
    cities: {
      'Ider Bolis': { armies: 6, riverFleet: 1, isCapital: true },
    }
  },
  mivior: {
    race: 'Human',
    capital: 'Colist',
    cities: {
      'Addat': { armies: 3, seaFleet: 1, riverFleet: 1 },
      'Boliske': { armies: 2, seaFleet: 1 },
      'Boran': { armies: 1, seaFleet: 1 },
      'Colist': { armies: 3, seaFleet: 1, isCapital: true },
    }
  },
  shucassam: {
    race: 'Human',
    capital: 'Adeese',
    cities: {
      'Adeese': { armies: 4, seaFleet: 1, isCapital: true },
      'Khuzdul': { armies: 3 },
      'Lepers': { armies: 1 },
      'Zefnar': { armies: 3, seaFleet: 2 },
    }
  },
  muetar: {
    race: 'Human',
    capital: 'Pennol',
    cities: {
      'Plibba': { armies: 2 },
      'Beolon': { armies: 2 },
      'Pennol': { armies: 3, riverFleet: 1, isCapital: true },
      'Basimar': { armies: 3 },
      'Groat': { armies: 2 },
      'Yando': { armies: 1, riverFleet: 1 },
    }
  },
  pon: {
    race: 'Human',
    capital: 'Marzarbol',
    cities: {
      "Crow's Nest": { armies: 2 },
      'Marzarbol': { armies: 3, isCapital: true },
      'Grugongi': { armies: 2, seaFleet: 1 },
    }
  },
  zorn: {
    race: 'Goblins',
    capital: 'The Pits',
    cities: {
      'Nithmere': { armies: 8 },
      'The Pits': { armies: 3, isCapital: true },
    }
  },
}

// Search for a city in hex data
function findCity(name: string) {
  const normalizedSearch = name.toLowerCase().replace(/[^a-z]/g, '')

  for (const hex of hexDataArray) {
    if (!hex.name) continue
    const hexName = hex.name.toLowerCase().replace(/[^a-z]/g, '')

    // Exact match or contains
    if (hexName === normalizedSearch || hexName.includes(normalizedSearch) || normalizedSearch.includes(hexName)) {
      return hex
    }
  }
  return null
}

console.log('=== FACTION CITY SEARCH RESULTS ===\n')

let foundCount = 0
let missingCount = 0
const missing: string[] = []
const results: Record<string, { found: typeof hexDataArray; notFound: string[] }> = {}

for (const [factionId, faction] of Object.entries(factions)) {
  console.log(`${factionId.toUpperCase()} (${faction.race}) - Capital: ${faction.capital}`)
  results[factionId] = { found: [], notFound: [] }

  for (const [cityName, cityData] of Object.entries(faction.cities)) {
    const hex = findCity(cityName)
    const capitalMark = cityData.isCapital ? ' [CAPITAL]' : ''

    if (hex) {
      foundCount++
      results[factionId].found.push(hex)
      const units = []
      if (cityData.armies) units.push(`${cityData.armies} armies`)
      if (cityData.seaFleet) units.push(`${cityData.seaFleet} sea fleet`)
      if (cityData.riverFleet) units.push(`${cityData.riverFleet} river fleet`)

      console.log(`  ✓ ${cityName}${capitalMark}: (${hex.col},${hex.row}) - "${hex.name}" kingdom=${hex.kingdom} [${units.join(', ')}]`)
    } else {
      missingCount++
      missing.push(`${factionId}: ${cityName}`)
      results[factionId].notFound.push(cityName)
      console.log(`  ✗ ${cityName}${capitalMark}: NOT FOUND`)
    }
  }
  console.log('')
}

console.log('=== SUMMARY ===')
console.log(`Found: ${foundCount}/${foundCount + missingCount}`)
console.log(`Missing: ${missingCount}`)
if (missing.length > 0) {
  console.log('\nMissing cities:')
  missing.forEach(m => console.log(`  - ${m}`))
}

// Export for potential use
export { factions, results }
