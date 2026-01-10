/**
 * Faction definitions for Divine Right
 *
 * Contains all 11 factions with their cities, capitals, and starting units.
 * Data sourced from DR3 rulebook with DR25 hex coordinate mappings.
 *
 * Note: Some location names differ between editions:
 * - DR3 "Stone Face" = DR25 "The Face"
 * - DR3 "The Gathering" = DR25 "The Digs"
 * - DR3 "Khuzdul" = DR25 "Kuzdol"
 */

import { KingdomId } from '../../types'

export interface FactionCity {
  /** City name as it appears in hex data (DR25 naming) */
  name: string
  /** Hex coordinates */
  col: number
  row: number
  /** Starting army count */
  armies: number
  /** Starting sea fleet count */
  seaFleet?: number
  /** Starting riverine fleet count */
  riverFleet?: number
  /** Is this the faction capital? */
  isCapital?: boolean
}

export interface Faction {
  /** Faction ID (matches KingdomId) */
  id: KingdomId
  /** Display name */
  name: string
  /** Race/type */
  race: 'Human' | 'Elves' | 'Dwarves' | 'Goblins' | 'Trolls'
  /** Coat of arms emoji */
  coatOfArms: string
  /** Capital city name */
  capitalName: string
  /** Capital city ID (normalized) */
  capitalId: string
  /** Is this a player-selectable faction? */
  isPlayerFaction: boolean
  /** All cities belonging to this faction */
  cities: FactionCity[]
}

/**
 * Normalize a city name to an ID
 */
export function normalizeCityId(name: string): string {
  return name
    .toLowerCase()
    .replace(/\\'/g, "'")
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

/**
 * All faction definitions with cities and starting units
 */
export const FACTIONS: Faction[] = [
  // === PLAYER FACTIONS (Human kingdoms) ===
  {
    id: 'hothior',
    name: 'Hothior',
    race: 'Human',
    coatOfArms: '🦅',
    capitalName: 'Port Lork',
    capitalId: 'port_lork',
    isPlayerFaction: true,
    cities: [
      { name: 'Port Lork', col: 9, row: 17, armies: 2, seaFleet: 1, isCapital: true },
      { name: 'Farnot', col: 10, row: 19, armies: 1 },
      { name: 'Castle Lapspell', col: 13, row: 18, armies: 2, seaFleet: 1 },
      { name: 'Tadafat', col: 10, row: 14, armies: 2, riverFleet: 1 },
    ],
  },
  {
    id: 'mivior',
    name: 'Mivior',
    race: 'Human',
    coatOfArms: '🦁',
    capitalName: 'Colist',
    capitalId: 'colist',
    isPlayerFaction: true,
    cities: [
      { name: 'Colist', col: 4, row: 21, armies: 3, seaFleet: 1, isCapital: true },
      { name: 'Addat', col: 3, row: 12, armies: 3, seaFleet: 1, riverFleet: 1 },
      { name: 'Boliske', col: 3, row: 18, armies: 2, seaFleet: 1 },
      { name: 'Boran', col: 5, row: 16, armies: 1, seaFleet: 1 },
    ],
  },
  {
    id: 'muetar',
    name: 'Muetar',
    race: 'Human',
    coatOfArms: '🐺',
    capitalName: 'Pennol',
    capitalId: 'pennol',
    isPlayerFaction: true,
    cities: [
      { name: 'Pennol', col: 19, row: 11, armies: 3, riverFleet: 1, isCapital: true },
      { name: 'Plibba', col: 17, row: 14, armies: 2 },
      { name: 'Beolon', col: 21, row: 16, armies: 2 },
      { name: 'Basimar', col: 24, row: 9, armies: 3 },
      { name: 'Groat', col: 23, row: 15, armies: 2 },
      { name: 'Yando', col: 19, row: 16, armies: 1, riverFleet: 1 },
    ],
  },
  {
    id: 'shucassam',
    name: 'Shucassam',
    race: 'Human',
    coatOfArms: '🐍',
    capitalName: 'Adeese',
    capitalId: 'adeese',
    isPlayerFaction: true,
    cities: [
      { name: 'Adeese', col: 24, row: 23, armies: 4, seaFleet: 1, isCapital: true },
      { name: 'Kuzdol', col: 19, row: 23, armies: 3 },  // DR3: Khuzdul
      { name: 'Lepers', col: 27, row: 25, armies: 1 },
      { name: 'Zefnar', col: 11, row: 22, armies: 3, seaFleet: 2 },
    ],
  },
  {
    id: 'immer',
    name: 'Immer',
    race: 'Human',
    coatOfArms: '🐉',
    capitalName: 'Castle Altarr',
    capitalId: 'castle_altarr',
    isPlayerFaction: true,
    cities: [
      { name: 'Castle Altarr', col: 14, row: 6, armies: 3, isCapital: true },
      { name: 'Gap Castle', col: 18, row: 5, armies: 1 },
      { name: 'Gorpin', col: 15, row: 3, armies: 1 },
      { name: 'Muscaster', col: 15, row: 8, armies: 2 },
      { name: 'Wirzor', col: 12, row: 3, armies: 2 },
    ],
  },
  {
    id: 'pon',
    name: 'Pon',
    race: 'Human',
    coatOfArms: '🦂',
    capitalName: 'Marzarbol',
    capitalId: 'marzarbol',
    isPlayerFaction: true,
    cities: [
      { name: 'Marzarbol', col: 28, row: 17, armies: 3, isCapital: true },
      { name: "Crow's Nest", col: 26, row: 13, armies: 2 },
      { name: 'Grugongi', col: 30, row: 20, armies: 2, seaFleet: 1 },
    ],
  },
  {
    id: 'rombune',
    name: 'Rombune',
    race: 'Human',
    coatOfArms: '🦇',
    capitalName: 'The Golkus',
    capitalId: 'the_golkus',
    isPlayerFaction: true,
    cities: [
      { name: 'The Golkus', col: 5, row: 27, armies: 2, seaFleet: 1, isCapital: true },
      { name: 'Parros', col: 11, row: 28, armies: 2, seaFleet: 1 },
      { name: 'Thores', col: 2, row: 29, armies: 1, seaFleet: 1 },
      { name: 'Jipols', col: 19, row: 28, armies: 1, seaFleet: 1 },
    ],
  },

  // === NON-PLAYER FACTIONS ===
  {
    id: 'neuth',
    name: 'Elfland (Neuth)',
    race: 'Elves',
    coatOfArms: '🧝',
    capitalName: 'Ider Bolis',
    capitalId: 'ider_bolis',
    isPlayerFaction: false,
    cities: [
      { name: 'Ider Bolis', col: 4, row: 5, armies: 6, riverFleet: 1, isCapital: true },
    ],
  },
  {
    id: 'zorn',
    name: 'Zorn',
    race: 'Goblins',
    coatOfArms: '👺',
    capitalName: 'The Pits',
    capitalId: 'the_pits',
    isPlayerFaction: false,
    cities: [
      { name: 'The Pits', col: 23, row: 2, armies: 3, isCapital: true },
      // Note: Nithmere (8 armies) is from advanced rules, not included
    ],
  },
  {
    id: 'ghem',
    name: 'Ghem',
    race: 'Dwarves',
    coatOfArms: '⛏️',
    capitalName: 'Mines of Rosengg',
    capitalId: 'mines_of_rosengg',
    isPlayerFaction: false,
    cities: [
      { name: 'Mines of Rosengg', col: 32, row: 9, armies: 2, isCapital: true },
      { name: 'Aws Noir', col: 2, row: 1, armies: 2, riverFleet: 1 },
      { name: 'Alzak', col: 33, row: 14, armies: 1 },
    ],
  },
  {
    id: 'trolls',
    name: 'Troll Country',
    race: 'Trolls',
    coatOfArms: '🧌',
    capitalName: 'The Face',
    capitalId: 'the_face',
    isPlayerFaction: false,
    cities: [
      // Note: Troll spawning points are not castles, but treated as such for now
      { name: 'The Face', col: 6, row: 13, armies: 2, isCapital: true },  // DR3: Stone Face
      { name: 'The Digs', col: 33, row: 21, armies: 2 },  // DR3: The Gathering
      { name: 'The Crag', col: 27, row: 2, armies: 2 },
      { name: 'The Shunned Vale', col: 17, row: 28, armies: 2 },
    ],
  },
]

/**
 * Get faction by ID
 */
export function getFaction(id: KingdomId): Faction | undefined {
  return FACTIONS.find(f => f.id === id)
}

/**
 * Get all player-selectable factions
 */
export function getPlayerFactions(): Faction[] {
  return FACTIONS.filter(f => f.isPlayerFaction)
}

/**
 * Get capital city for a faction
 */
export function getFactionCapital(id: KingdomId): FactionCity | undefined {
  const faction = getFaction(id)
  return faction?.cities.find(c => c.isCapital)
}

/**
 * Get total starting armies for a faction
 */
export function getFactionTotalArmies(id: KingdomId): number {
  const faction = getFaction(id)
  if (!faction) return 0
  return faction.cities.reduce((sum, city) => sum + city.armies, 0)
}

/**
 * Get total starting fleets for a faction
 */
export function getFactionTotalFleets(id: KingdomId): { sea: number; river: number } {
  const faction = getFaction(id)
  if (!faction) return { sea: 0, river: 0 }
  return faction.cities.reduce(
    (acc, city) => ({
      sea: acc.sea + (city.seaFleet || 0),
      river: acc.river + (city.riverFleet || 0),
    }),
    { sea: 0, river: 0 }
  )
}

/**
 * Player faction IDs for selection
 */
export const PLAYER_FACTION_IDS: KingdomId[] = FACTIONS
  .filter(f => f.isPlayerFaction)
  .map(f => f.id)
