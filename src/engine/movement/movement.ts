/**
 * Movement engine — pure functions for land movement rules (rule 18).
 */

import { canCrossHexside } from '@/engine/map/terrain';

/**
 * Check if a player can move units (rule 18.1.1).
 */
export function canPlayerMove(
  activePlayer: string,
  movingPlayer: string,
): boolean {
  return activePlayer === movingPlayer;
}

/**
 * Check if movement in any direction is allowed (rule 18.1.2).
 */
export function canMoveAnyDirection(): boolean {
  return true;
}

/**
 * Movement points cannot be saved between turns (rule 18.1.3).
 */
export function canSaveMovementPoints(): boolean {
  return false;
}

/**
 * Minimum one-hex movement rule (rule 18.1.4).
 * A unit may always move at least one hex, even if terrain cost exceeds MP.
 * Only applies if the unit hasn't moved yet this turn.
 */
export function canEnterHexWithMinimumMovement(
  movementAllowance: number,
  terrainCost: number,
  hexesMovedThisTurn: number = 0,
): { canEnter: boolean; minimumMovementApplies: boolean } {
  if (terrainCost <= movementAllowance) {
    return { canEnter: true, minimumMovementApplies: false };
  }
  if (hexesMovedThisTurn === 0) {
    return { canEnter: true, minimumMovementApplies: true };
  }
  return { canEnter: false, minimumMovementApplies: false };
}

/**
 * Check who may move (rules 18.2.x).
 */
export function canUnitMove(input: {
  unitOwner?: string;
  isActivePlayer?: boolean;
  unitType?: string;
  controlledByActivePlayer?: boolean;
  isUnderSiege?: boolean;
  activatedThisTurn?: boolean;
  deactivatedThisTurn?: boolean;
}): boolean {
  // Besieged units cannot move (18.3.1)
  if (input.isUnderSiege) return false;

  // Just activated kingdom (18.3.2)
  if (input.activatedThisTurn) return false;

  // Just deactivated kingdom (18.3.3)
  if (input.deactivatedThisTurn) return false;

  // Must be active player or controlled by active player
  if (input.isActivePlayer) return true;
  if (input.controlledByActivePlayer) return true;

  return false;
}

/**
 * Get stack movement allowance (rule 18.4.1).
 * Stack uses slowest unit's MA.
 */
export function getStackMovementAllowance(
  units: Array<{ movementAllowance: number }>,
): number {
  if (units.length === 0) return 0;
  return Math.min(...units.map((u) => u.movementAllowance));
}

/**
 * Can units leave a stack during movement (rule 18.4.2).
 */
export function canLeaveStack(): boolean {
  return true;
}

/**
 * Can units continue independently after leaving stack (rule 18.4.3).
 */
export function canContinueIndependently(remainingMp: number): boolean {
  return remainingMp > 0;
}

/**
 * Check if entry to hex containing enemy is allowed (rule 18.5.1).
 */
export function canEnterEnemyOccupiedHex(): boolean {
  return false;
}

/**
 * Check if ending turn with allied kingdom is allowed (rule 18.5.2).
 */
export function canEndTurnWithAlliedKingdom(): boolean {
  return false;
}

/**
 * Check if movement exceeds allowance (rule 18.5.3).
 */
export function canSpendMovement(
  movementAllowance: number,
  movementSpent: number,
): boolean {
  return movementSpent <= movementAllowance;
}

/**
 * Check terrain cost vs remaining MP (rule 18.5.4).
 */
export function canEnterHexByMp(
  remainingMp: number,
  terrainCost: number,
  hexesMovedThisTurn: number,
): { entryAllowed: boolean; minimumMovementApplies: boolean } {
  if (terrainCost <= remainingMp) {
    return { entryAllowed: true, minimumMovementApplies: false };
  }
  if (hexesMovedThisTurn === 0) {
    return { entryAllowed: true, minimumMovementApplies: true };
  }
  return { entryAllowed: false, minimumMovementApplies: false };
}

/**
 * Hexside crossing (rule 18.5.5) — delegates to terrain module.
 */
export function canCrossHexsideForMovement(
  unitCategory: 'land' | 'fleet',
  hexsideType: string,
): boolean {
  return canCrossHexside(unitCategory, hexsideType);
}

/**
 * Off-map rules (rule 18.5.6).
 */
export function handleOffMap(
  forced: boolean,
  voluntary: boolean,
): { unitEliminated: boolean; movementAllowed: boolean } {
  if (forced) {
    return { unitEliminated: true, movementAllowed: false };
  }
  if (voluntary) {
    return { unitEliminated: false, movementAllowed: false };
  }
  return { unitEliminated: false, movementAllowed: true };
}
