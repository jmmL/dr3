/**
 * Siege declaration and zone of siege engine — pure functions (rule 17).
 */

/**
 * Check if castle is sufficiently surrounded (rule 17.1.1).
 */
export function isCastleSurrounded(
  adjacentHexesCovered: number,
  totalAdjacentHexes: number,
): boolean {
  return adjacentHexesCovered >= totalAdjacentHexes;
}

/**
 * Check if outside defenders block siege (rule 17.1.2).
 */
export function hasOutsideDefenders(defendingUnitsOutside: number): boolean {
  return defendingUnitsOutside > 0;
}

/**
 * Check sufficient force for siege (rule 17.1.3).
 */
export function hasSufficientForce(
  besiegingUnits: number,
  intrinsicDefense: number,
  unitsInside: number,
): { sufficient: boolean; requiredMinimum: number } {
  const required = unitsInside + intrinsicDefense;
  return { sufficient: besiegingUnits >= required, requiredMinimum: required };
}

/**
 * Different players cannot combine siege (rule 17.2).
 */
export function canCombineSiege(): boolean {
  return false;
}

export function canConductSeparateSieges(): boolean {
  return true;
}

/**
 * Fleet zone of siege terrain filter (rule 17.3.2).
 */
export function getFleetZoneTerrains(
  adjacentTerrain: string[],
): { extendsTo: string[]; excludes: string[] } {
  const valid = new Set(['all_sea', 'seashore']);
  return {
    extendsTo: adjacentTerrain.filter((t) => valid.has(t)),
    excludes: adjacentTerrain.filter((t) => !valid.has(t)),
  };
}

/**
 * Land unit zone of siege terrain filter (rule 17.3.3).
 */
export function getLandZoneTerrains(
  adjacentTerrain: string[],
): { extendsTo: string[]; excludes: string[] } {
  const valid = new Set(['all_land', 'seashore']);
  return {
    extendsTo: adjacentTerrain.filter((t) => valid.has(t)),
    excludes: adjacentTerrain.filter((t) => !valid.has(t)),
  };
}

/**
 * Friendly units don't negate zones (rule 17.3.4).
 */
export function doesFriendlyNegateZone(): boolean {
  return false;
}

/**
 * Counter state for units inside (rule 17.4.1).
 */
export function getCounterState(): string {
  return 'inverted';
}

/**
 * Siege declaration valid (rule 17.4.2).
 */
export function isSiegeDeclarationValid(
  outsideDefendersPresent: boolean,
): boolean {
  return !outsideDefendersPresent;
}

/**
 * Retreat into castle (rule 17.4.4).
 */
export function canRetreatIntoCastle(castleFriendly: boolean): boolean {
  return castleFriendly;
}

/**
 * Leader inside castle cannot bonus outside units (rule 17.4.5).
 */
export function doesLeaderInsideBonusApplyOutside(): boolean {
  return false;
}

/**
 * No movement cost for castle entry/exit (rule 17.4.6).
 */
export function getCastleMovementCost(): number {
  return 0;
}

/**
 * Intrinsic defense (rule 17.5.x).
 */
export function getIntrinsicDefense(printedDefense: number): number {
  return printedDefense;
}

export function doesIntrinsicApplyToAttack(): boolean {
  return false;
}

export function canEnemyEnterIntactCastle(
  enteringUnit: string,
): boolean {
  return enteringUnit === 'ambassador';
}

export function getPlunderedDefense(): number {
  return 0;
}

/**
 * Siege declaration conditions (rule 17.6.x).
 */
export function getSiegeDeclarationType(
  surrounded: boolean,
  noOutsideDefenders: boolean,
  sufficientForce: boolean,
): string {
  if (surrounded && noOutsideDefenders && sufficientForce) return 'instant';
  return 'not_met';
}

export function canAnyPlayerDeclare(): boolean {
  return true;
}

/**
 * Retreated units not besieging (rule 17.6.3).
 */
export function doesRetreatedUnitCountAsBesieging(): boolean {
  return false;
}

/**
 * Reinforcements blocked (rule 17.7.1).
 */
export function canReinforceBesiegedCastle(): boolean {
  return false;
}

/**
 * Leaving siege rules (rule 17.7.2-3).
 */
export function canLeaveSiegeWithoutAttack(): boolean {
  return false;
}

export function canExitAfterAttack(
  attackedBesiegers: boolean,
): { exitAllowed: boolean; movementAllowance: string } {
  return {
    exitAllowed: attackedBesiegers,
    movementAllowance: 'full',
  };
}

export function canBesiegedAttackInCombatPhase(): boolean {
  return true;
}

export function getAdvanceLimitFromSiege(): number {
  return 1;
}
