/**
 * Siege declaration and zone of siege engine — pure functions (rule 17).
 */

export interface AdjacentSiegeUnit {
  owner: string;
  strength: number;
}

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
 * Only friendly adjacent forces count toward siege strength (rule 17.1.3).
 */
export function getBesiegingStrength(
  adjacentUnits: AdjacentSiegeUnit[],
  besiegerOwner: string,
): number {
  return adjacentUnits
    .filter((unit) => unit.owner === besiegerOwner)
    .reduce((sum, unit) => sum + unit.strength, 0);
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
 * Active siege remains valid only while surrounding and force minimum hold.
 */
export function isSiegeStillValid(input: {
  siegeActive: boolean;
  adjacentHexesCovered: number;
  totalAdjacentHexes: number;
  besiegingUnits: number;
  intrinsicDefense: number;
  unitsInside: number;
}): { siegeValid: boolean; siegeEnds: boolean; reason?: string } {
  if (!input.siegeActive) {
    return { siegeValid: false, siegeEnds: false };
  }

  if (!isCastleSurrounded(input.adjacentHexesCovered, input.totalAdjacentHexes)) {
    return {
      siegeValid: false,
      siegeEnds: true,
      reason: 'surrounding_condition_lost',
    };
  }

  const force = hasSufficientForce(
    input.besiegingUnits,
    input.intrinsicDefense,
    input.unitsInside,
  );
  if (!force.sufficient) {
    return {
      siegeValid: false,
      siegeEnds: true,
      reason: 'insufficient_force',
    };
  }

  return { siegeValid: true, siegeEnds: false };
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
export function canAttemptBreakout(
  combatUnitsInside: number,
): { breakoutAllowed: boolean; reason?: string } {
  if (combatUnitsInside <= 0) {
    return { breakoutAllowed: false, reason: 'no_combat_units_inside' };
  }
  return { breakoutAllowed: true };
}

export function getBreakoutCombatRules(): {
  mustFightAllBesiegers: boolean;
  combatType: 'simultaneous';
} {
  return {
    mustFightAllBesiegers: true,
    combatType: 'simultaneous',
  };
}

export function getBreakoutMovementOptions(
  clearedAdjacentHexes: number[][],
  survivors: string[],
): { movementOptionsInclude: number[][]; survivorsMayMove: boolean } {
  return {
    movementOptionsInclude: clearedAdjacentHexes,
    survivorsMayMove: survivors.length > 0 && clearedAdjacentHexes.length > 0,
  };
}

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

export function canSortieAttack(
  targetIsAdjacent: boolean,
  enemiesInTargetHex: boolean,
  currentPhase: string,
  besiegedUnitsAttacking: boolean,
): { sortieAllowed: boolean; targetMustBeAdjacent: boolean } {
  return {
    sortieAllowed:
      targetIsAdjacent &&
      enemiesInTargetHex &&
      currentPhase === 'combat_phase' &&
      besiegedUnitsAttacking,
    targetMustBeAdjacent: true,
  };
}

export function canAdvanceAfterSortie(defenderHexCleared: boolean): boolean {
  return defenderHexCleared;
}

export function getAdvanceLimitFromSiege(): number {
  return 1;
}
