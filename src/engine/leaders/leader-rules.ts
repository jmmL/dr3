/**
 * Leader rules — pure functions (rule 26).
 */

import { rollDie, seedToState } from '@/engine/domain/rng';
import { isLeader, getCombatStrength } from '@/engine/units/unit-helpers';

/**
 * Check if a unit type is a leader (rule 26.1).
 */
export function isLeaderUnit(unitType: string): boolean {
  return isLeader(unitType);
}

/**
 * Get leader combat strength (rule 26.2).
 */
export function getLeaderCombatStrength(unitType: string): number {
  return getCombatStrength(unitType);
}

/**
 * Check if leader movement bonus applies to stack (rule 26.3.1).
 * Stack must contain own regulars and/or mercenaries.
 */
export function doesLeaderBonusApply(
  stackContents: string[],
): boolean {
  const validTypes = new Set([
    'regular_army',
    'regular_fleet',
    'army',
    'fleet',
    'mercenary_army',
    'mercenary_fleet',
  ]);
  return stackContents.some((t) => validTypes.has(t));
}

/**
 * Get effective movement allowance for stack with leader (rule 26.3.2).
 */
export function getLeaderStackMovement(
  leaderMA: number,
  unitMA: number,
  stackedWithLeader: boolean,
): number {
  if (stackedWithLeader) return leaderMA;
  return unitMA;
}

/**
 * Check if unit used leader bonus correctly (rule 26.3.3).
 * Must begin AND end turn stacked with leader.
 */
export function didUseLeaderBonus(
  beganWithLeader: boolean,
  endedWithLeader: boolean,
): boolean {
  return beganWithLeader && endedWithLeader;
}

/**
 * Can units be left behind during leader move (rule 26.3.4).
 */
export function canLeaveBehindDuringLeaderMove(): boolean {
  return true;
}

/**
 * Units using leader movement cannot move independently (rule 26.3.5).
 */
export function canMoveIndependentlyAfterLeaderMove(
  usedLeaderMovement: boolean,
): boolean {
  return !usedLeaderMovement;
}

/**
 * Unit terrain bonuses don't transfer to leader (rule 26.3.6).
 */
export function doTerrainBonusesTransferToLeader(): boolean {
  return false;
}

/**
 * Get leader combat bonus from personality card (rule 26.4.1).
 */
export function getLeaderCombatBonus(personalityCardCombatBonus: number): number {
  return personalityCardCombatBonus;
}

/**
 * Apply leader combat bonus during combat resolution (rule 26.4.1).
 */
export function getLeaderAdjustedCombatValue(
  baseStrength: number,
  combatRoll: number,
  combatBonus: number,
): number {
  return baseStrength + combatRoll + combatBonus;
}

/**
 * Multiple leader bonuses stack (rule 26.4.2).
 */
export function getTotalLeaderCombatBonus(
  leaders: Array<{ combatBonus: number }>,
): number {
  return leaders.reduce((sum, l) => sum + l.combatBonus, 0);
}

/**
 * Leader combat bonus does not apply to siege (rule 26.4.3).
 */
export function doesLeaderBonusApplyToSiege(): boolean {
  return false;
}

/**
 * Lone leader can pass through enemy stack (rule 26.5.1).
 */
export function canLoneLeaderPassThroughEnemy(
  isAlone: boolean,
): boolean {
  return isAlone;
}

/**
 * Lone leader passing through enemy requires fate roll (rule 26.5.2).
 */
export function doesPassThroughRequireFateRoll(
  isAlone: boolean,
  passedThroughEnemy: boolean,
): boolean {
  return isAlone && passedThroughEnemy;
}

/**
 * Check if fate roll is required (rule 26.6.1).
 */
export function isFateRollRequired(input: {
  leaderInStack?: boolean;
  stackLostCombatUnits?: boolean;
  leaderAlone?: boolean;
  passedThroughEnemy?: boolean;
  enemyPassedThrough?: boolean;
  leaderInCastle?: boolean;
  castleTakenBySiege?: boolean;
  leaderInBesiegedCastle?: boolean;
  leavingAlone?: boolean;
  leaderAboardFleet?: boolean;
  fleetLostAtSea?: boolean;
}): boolean {
  if (input.leaderInStack && input.stackLostCombatUnits) return true;
  if (input.leaderAlone && input.passedThroughEnemy) return true;
  if (input.leaderAlone && input.enemyPassedThrough) return true;
  if (input.leaderInCastle && input.castleTakenBySiege) return true;
  if (input.leaderInBesiegedCastle && input.leavingAlone) return true;
  if (input.leaderAboardFleet && input.fleetLostAtSea) return true;
  return false;
}

/**
 * Resolve leader fate roll (rule 26.6.2).
 */
export function resolveFateRoll(
  roll: number,
): 'killed' | 'no_effect' | 'captured' {
  if (roll === 1) return 'killed';
  if (roll === 6) return 'captured';
  return 'no_effect';
}

/**
 * Fate outcome effects (rule 26.6.2).
 */
export function getFateOutcomeEffect(
  outcome: 'killed' | 'no_effect' | 'captured',
): {
  removedFromGame: boolean;
  removedFromMap: boolean;
  heldByCaptor: boolean;
  ransomEligible: boolean;
  remainsInPlace: boolean;
} {
  switch (outcome) {
    case 'killed':
      return {
        removedFromGame: true,
        removedFromMap: true,
        heldByCaptor: false,
        ransomEligible: false,
        remainsInPlace: false,
      };
    case 'captured':
      return {
        removedFromGame: false,
        removedFromMap: true,
        heldByCaptor: true,
        ransomEligible: true,
        remainsInPlace: false,
      };
    case 'no_effect':
      return {
        removedFromGame: false,
        removedFromMap: false,
        heldByCaptor: false,
        ransomEligible: false,
        remainsInPlace: true,
      };
  }
}

/**
 * Deterministic seeded fate roll for conformance coverage.
 */
export function rollLeaderFateWithSeed(
  seed: string | number,
): { roll: number; outcome: 'killed' | 'no_effect' | 'captured' } {
  const state = seedToState(String(seed));
  const result = rollDie(state);
  return {
    roll: result.value,
    outcome: resolveFateRoll(result.value),
  };
}

/**
 * Check if additional fate roll is needed (rule 26.6.3).
 * Only one fate roll per player turn / per enemy phase.
 */
export function isAdditionalFateRollRequired(
  fateRollsThisPhase: number,
): boolean {
  return fateRollsThisPhase === 0;
}

/**
 * Can a unit enter a lone leader's hex (rule 26.6.5).
 */
export function canEnterLoneLeaderHex(
  enteringUnitType: string,
): { entryAllowed: boolean; fateRollTriggered: boolean } {
  // Any non-fleet unit can enter
  if (enteringUnitType === 'fleet' || enteringUnitType === 'regular_fleet' || enteringUnitType === 'mercenary_fleet') {
    return { entryAllowed: false, fateRollTriggered: false };
  }
  return { entryAllowed: true, fateRollTriggered: true };
}

/**
 * Lone leader cannot be attacked in combat (rule 26.7).
 */
export function canAttackLoneLeader(): boolean {
  return false;
}
