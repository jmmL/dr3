/**
 * Faction classification and properties (rule 5).
 * Pure functions.
 */

import { loadFactions } from '@/data/load-refs';

export type FactionClassification = 'human' | 'non_human';

const HUMAN_FACTIONS = new Set([
  'hothior',
  'immer',
  'mivior',
  'muetar',
  'pon',
  'rombune',
  'shucassam',
]);

const NON_HUMAN_FACTIONS = new Set(['neuth', 'ghem', 'zorn', 'trolls']);

/**
 * Get faction classification (rule 5.2/5.3).
 */
export function getFactionClassification(
  faction: string,
): FactionClassification {
  if (HUMAN_FACTIONS.has(faction)) return 'human';
  if (NON_HUMAN_FACTIONS.has(faction)) return 'non_human';
  return 'human'; // Default: mercenaries classified as human (rule 5.4.1)
}

/**
 * Get the classification for a unit type (rule 5.4).
 * Mercenaries are classified as human.
 */
export function getUnitClassification(
  unitType: string,
  factionId?: string,
): FactionClassification {
  if (unitType === 'mercenary' || unitType === 'mercenary_army' || unitType === 'mercenary_fleet') {
    return 'human';
  }
  if (factionId) {
    return getFactionClassification(factionId);
  }
  return 'human';
}

/**
 * Get retreat success rolls for a classification (rules 5.2.2, 5.3.2).
 * Human: 4,5,6 succeed. Non-human: 3,4,5,6 succeed.
 */
export function getRetreatSuccessRolls(
  classification: FactionClassification,
): number[] {
  if (classification === 'non_human') return [3, 4, 5, 6];
  return [4, 5, 6];
}

/**
 * Check if a retreat roll succeeds.
 */
export function isRetreatSuccessful(
  classification: FactionClassification,
  roll: number,
): boolean {
  return getRetreatSuccessRolls(classification).includes(roll);
}

/**
 * Check if a location is friendly (rule 10).
 */
export function isFriendlyLocation(input: {
  locationKingdom?: string;
  playerKingdom?: string;
  alliedKingdoms?: string[];
  plundered?: boolean;
  friendlyCombatUnitsPresent?: number;
}): boolean {
  // Own kingdom (rule 10.1.1)
  if (input.locationKingdom && input.playerKingdom) {
    if (input.locationKingdom === input.playerKingdom) return true;
  }

  // Allied kingdom (rule 10.1.2)
  if (input.locationKingdom && input.alliedKingdoms) {
    if (input.alliedKingdoms.includes(input.locationKingdom)) return true;
  }

  // Plundered with friendly combat unit (rule 10.1.3)
  if (input.plundered) {
    return (input.friendlyCombatUnitsPresent ?? 0) > 0;
  }

  return false;
}

/**
 * Get who controls allied force movement (rule 16.1).
 */
export function getAlliedForceMovementControl(owner: string): string {
  return owner;
}

/**
 * Check if allied forces can stack at end of turn (rule 16.2).
 */
export function canAlliedForcesStackEndTurn(
  kingdom1: string,
  kingdom2: string,
): boolean {
  return kingdom1 === kingdom2;
}

/**
 * Check if allied forces can coordinate actions (rule 16.3).
 */
export function canAlliedForcesCoordinate(): boolean {
  return true;
}

/**
 * Check if forces can enter allied castle (rule 16.4).
 */
export function canEnterAlliedCastleForces(
  alliedCombatUnitsPresent: number,
): { entryAllowed: boolean; defenseAllowed: boolean } {
  const allowed = alliedCombatUnitsPresent === 0;
  return { entryAllowed: allowed, defenseAllowed: allowed };
}

/**
 * Check if mercenaries can stack with friendly forces (rule 16.5).
 */
export function canMercenaryStackWithFriendlyForces(): boolean {
  return true;
}

/**
 * Load faction data and return race mapping.
 */
let _factionRaceCache: Map<string, string> | null = null;

export function getFactionRace(factionId: string): string {
  if (!_factionRaceCache) {
    _factionRaceCache = new Map();
    const factions = loadFactions();
    for (const f of factions) {
      _factionRaceCache.set(f.id, f.race);
    }
  }
  return _factionRaceCache.get(factionId) ?? 'human';
}
