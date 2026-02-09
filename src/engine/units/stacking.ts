/**
 * Stacking rules (rule 24).
 * Pure functions — no state dependencies.
 */

export type StackingRelationship = 'same_kingdom' | 'allied' | 'enemy';

/**
 * Check if units of the same kingdom can stack (rule 24.1.1).
 * Same kingdom + mercenaries = unlimited stacking.
 */
export function getSameKingdomStackLimit(): 'unlimited' {
  return 'unlimited';
}

/**
 * Check if same kingdom units can share a hex (rule 24.1.2).
 */
export function canSameKingdomShareHex(): boolean {
  return true;
}

/**
 * Check if allied kingdoms can pass through each other (rule 24.2.1).
 */
export function canAlliedPassThrough(): boolean {
  return true;
}

/**
 * Check if allied kingdoms can end turn in same hex (rule 24.2.2).
 */
export function canAlliedEndTurnTogether(): boolean {
  return false;
}

/**
 * Check if mercenaries can stack with friendly units (rule 24.3.1).
 */
export function canMercenaryStackWithFriendly(): boolean {
  return true;
}

/**
 * Get movement penalty for mercenaries moving between stacks (rule 24.3.2).
 */
export function getMercenaryStackTransferPenalty(): number {
  return 0;
}

/**
 * Fleet stacking rules (rule 24.4.1).
 */
export function getFleetStackingRules(): 'same_as_land' {
  return 'same_as_land';
}

/**
 * Check if units can enter an allied castle (rule 24.5.1).
 * Allowed only if no allied combat units are already present.
 */
export function canEnterAlliedCastle(
  alliedCombatUnitsPresent: number,
): boolean {
  return alliedCombatUnitsPresent === 0;
}

/**
 * Check if defense is allowed in an allied castle (rule 24.5.2).
 */
export function canDefendAlliedCastle(entryAllowed: boolean): boolean {
  return entryAllowed;
}

/**
 * Check if stacking with allied units inside castle is allowed (rule 24.5.3).
 */
export function canStackInAlliedCastle(
  alliedUnitsPresent: boolean,
): boolean {
  return !alliedUnitsPresent;
}

/**
 * Check if stack inspection is allowed (rule 24.6).
 */
export function canInspectOpponentStack(): boolean {
  return true;
}
