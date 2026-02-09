/**
 * Siege resolution engine — pure functions (rule 17.8-17.13).
 */

/**
 * Siege resolution timing (rule 17.8.1).
 */
export function canResolveSiege(
  currentPhase: string,
  _activePlayer: string,
  _besieger: string,
): boolean {
  return currentPhase === 'siege_resolution';
}

/**
 * Die type for siege (rule 17.8.2).
 */
export function getSiegeDieInfo(): { dieType: string; diceCount: number } {
  return { dieType: 'd6', diceCount: 1 };
}

/**
 * Resolve siege roll (rules 17.8.3-4).
 */
export function resolveSiegeRoll(
  roll: number,
  modifier: number,
): {
  modifiedRoll: number;
  castleTaken: boolean;
  siegeContinues: boolean;
  unitsInsideEliminated: boolean;
  leadersRequireFateRoll: boolean;
} {
  const modified = roll + modifier;
  const taken = modified >= 6;
  return {
    modifiedRoll: modified,
    castleTaken: taken,
    siegeContinues: !taken,
    unitsInsideEliminated: taken,
    leadersRequireFateRoll: taken,
  };
}

/**
 * No further action after siege attack (rule 17.8.5).
 */
export function canActAfterSiegeAttack(): {
  furtherMovementAllowed: boolean;
  furtherAttackAllowed: boolean;
} {
  return { furtherMovementAllowed: false, furtherAttackAllowed: false };
}

/**
 * Calculate siege modifier (rule 17.9.1-3).
 * modifier = floor(attackers / (defenders + intrinsic_defense)) - 1
 */
export function calculateSiegeModifier(
  besiegingUnits: number,
  intrinsicDefense: number,
  unitsInside: number,
): number {
  const denominator = unitsInside + intrinsicDefense;
  if (denominator === 0) return besiegingUnits - 1;
  return Math.floor(besiegingUnits / denominator) - 1;
}

/**
 * Plundered castle rules (rule 17.10.x).
 */
export function getPlunderedCastleRules(): {
  siegeRulesApply: boolean;
  castleDefenseApplies: boolean;
} {
  return { siegeRulesApply: false, castleDefenseApplies: false };
}

export function canPlacementInPlundered(): boolean {
  return true;
}

export function isOccupiedPlunderedFriendly(): boolean {
  return true;
}

export function isPlunderPermanent(): boolean {
  return true;
}

/**
 * Fleet siege rules (rule 17.11.x).
 */
export function getTotalSiegeStrength(
  armies: number,
  fleets: number,
): number {
  return armies + fleets;
}

export function canFleetAttackAllLand(): boolean {
  return false;
}

export function doesPortRequireFleet(): boolean {
  return true;
}

export function areSeaHexesCovered(
  totalSea: number,
  coveredSea: number,
): boolean {
  return coveredSea >= totalSea;
}

export function getTotalSiegeWithSeaborne(
  fleets: number,
  unitsAboard: number,
  landUnits: number,
): number {
  return fleets + unitsAboard + landUnits;
}

export function doSeaborneExhibitZoneOfSiege(): boolean {
  return false;
}

/**
 * Siege relief rules (rule 17.12.x).
 */
export function canAdvanceIntoCastleAfterRelief(): boolean {
  return true;
}

export function getReliefAdvanceHexes(
  castleSurrounded: boolean,
): number {
  return castleSurrounded ? 2 : 1;
}

export function getReliefPositionOptions(): string[] {
  return ['inside_castle', 'outside_castle'];
}

/**
 * Forced peace rules (rule 17.13.x).
 */
export function isForcedPeaceEligible(
  castleType: string,
  castleStatus: string,
  occupiedBy: string,
): boolean {
  return (
    castleType === 'royal' &&
    castleStatus === 'plundered' &&
    occupiedBy === 'enemy'
  );
}

export function getForcedPeaceRollType(): { rollType: string; die: string } {
  return { rollType: 'forced_peace_die_roll', die: '1d6' };
}

export function isForcedPeaceSuccessful(
  roll: number,
  contested: boolean,
): boolean {
  if (contested) return roll >= 6;
  return roll >= 5;
}

export function getForcedPeaceModifiedRoll(
  roll: number,
  _diplomacyCardModifier: number,
  _diplomaticPenalty: number,
): { modifiedRoll: number; modifiersApplied: boolean } {
  // Rule 17.13.7: diplomacy cards and penalties do NOT apply
  return { modifiedRoll: roll, modifiersApplied: false };
}

export function getForcedPeaceDuration(durationRoll: number): number {
  return durationRoll;
}

export function canDiplomacyDuringForcedPeace(): boolean {
  return false;
}

export function handleForcedPeaceViolation(): {
  diplomaticPenaltyIncurred: boolean;
  forcedPeaceEnds: boolean;
  kingdomAvailableImmediately: boolean;
} {
  return {
    diplomaticPenaltyIncurred: true,
    forcedPeaceEnds: true,
    kingdomAvailableImmediately: true,
  };
}

export function isPlayerMonarchSubjectToForcedPeace(): boolean {
  return false;
}

/**
 * City vs Castle rules (rule 31).
 */
export function isCityDeploymentHex(): boolean {
  return true;
}

export function isCastleLocation(hexTerrain: string[]): boolean {
  return hexTerrain.includes('castle');
}

export function doesCityGuaranteeDefense(): boolean {
  return false;
}

export function canBesiegeNonCastle(): boolean {
  return false;
}
