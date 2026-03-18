/**
 * Combat resolution engine — pure functions (rule 25).
 */

/**
 * Only active player can attack (rule 25.1.1).
 */
export function canPlayerAttack(
  activePlayer: string,
  attackingPlayer: string,
): boolean {
  return activePlayer === attackingPlayer;
}

/**
 * Check adjacency required for attack (rule 25.1.2).
 */
export function canAttackNonAdjacent(adjacent: boolean): boolean {
  return adjacent;
}

/**
 * Attack is optional (rule 25.1.3).
 */
export function isAttackRequired(): boolean {
  return false;
}

/**
 * Retreat before combat timing (rule 25.2.1).
 */
export function canAttemptRetreat(
  attackDeclared: boolean,
  diceRolled: boolean,
): boolean {
  return attackDeclared && !diceRolled;
}

/**
 * Check retreat roll success (rule 25.2.2).
 */
export function isRetreatRollSuccessful(
  factionType: 'human' | 'non_human',
  roll: number,
): boolean {
  if (factionType === 'non_human') return roll >= 3;
  return roll >= 4;
}

/**
 * Determine retreat test order (rule 25.2.3).
 * Test unit with least chance first.
 */
export function getRetreatTestOrder(
  stackUnits: Array<{ type: string }>,
): string[] {
  return [...stackUnits]
    .sort((a, b) => {
      const aMin = a.type === 'human' ? 4 : 3;
      const bMin = b.type === 'human' ? 4 : 3;
      return bMin - aMin; // human first (least chance)
    })
    .map((u) => u.type);
}

/**
 * Get valid retreat destinations (rule 25.2.4).
 */
export function getValidRetreatDestinations(
  adjacentHexes: number[][],
  enemyOccupied: number[][],
): number[][] {
  const enemySet = new Set(enemyOccupied.map((h) => `${h[0]},${h[1]}`));
  return adjacentHexes.filter(
    (h) => !enemySet.has(`${h[0]},${h[1]}`),
  );
}

/**
 * All units retreat to same hex (rule 25.2.5).
 */
export function mustRetreatToSameHex(): boolean {
  return true;
}

/**
 * No retreat if surrounded (rule 25.2.9).
 */
export function canRetreatIfSurrounded(
  allAdjacentEnemyOccupied: boolean,
): boolean {
  return !allAdjacentEnemyOccupied;
}

/**
 * No second retreat (rule 25.2.10).
 */
export function canRetreatAgain(
  retreatedOnce: boolean,
  stillAdjacentToAttacker: boolean,
): boolean {
  if (retreatedOnce && stillAdjacentToAttacker) return false;
  return true;
}

/**
 * Attacker advance after retreat (rule 25.2.11).
 */
export function canAdvanceAfterRetreat(defenderRetreated: boolean): {
  advanceAllowed: boolean;
  furtherAttacksAllowed: boolean;
} {
  return {
    advanceAllowed: defenderRetreated,
    furtherAttacksAllowed: false,
  };
}

/**
 * Retreat sets movement to zero (rule 25.2.6).
 */
export function getMovementAfterRetreat(): number {
  return 0;
}

/**
 * Retreating unit is marked as retreated (rule 25.2.7).
 */
export function isMarkedAsRetreated(hasRetreated: boolean): boolean {
  return hasRetreated;
}

/**
 * Attacker may continue only while still adjacent after retreat (rule 25.2.11).
 */
export function canContinueAttackAfterRetreat(
  retreatDestination: number[],
  attackerHexes: number[][],
  adjacencyCheck: (a: number[], b: number[]) => boolean,
): boolean {
  return attackerHexes.some((hex) => adjacencyCheck(hex, retreatDestination));
}

/**
 * Combat strength per unit type (rule 25.4.3).
 */
export function getUnitCombatStrength(unitType: string): number {
  if (unitType === 'monarch' || unitType === 'ambassador') return 0;
  return 1;
}

/**
 * Combined stack combat strength (rule 25.4.3).
 */
export function getStackCombatStrength(unitTypes: string[]): number {
  return unitTypes.reduce((sum, unitType) => {
    return sum + getUnitCombatStrength(unitType);
  }, 0);
}

/**
 * Unit-type attack eligibility (rule 25.7.1).
 */
export function canUnitTypeInitiateAttack(unitType: string): boolean {
  return unitType !== 'monarch' && unitType !== 'ambassador';
}

/**
 * Both sides roll (rule 25.3.1).
 */
export function getCombatDice(): {
  attackerRolls: number;
  defenderRolls: number;
  dieType: string;
} {
  return { attackerRolls: 1, defenderRolls: 1, dieType: 'd6' };
}

/**
 * Resolve combat (rules 25.3.2-4).
 */
export function resolveCombat(
  attackerRoll: number,
  attackerModifier: number,
  defenderRoll: number,
  defenderModifier: number,
): {
  attackerModifiedTotal: number;
  defenderModifiedTotal: number;
  winner: 'attacker' | 'defender' | 'tie';
  attackerLosses: number;
  defenderLosses: number;
} {
  const aMod = attackerRoll + attackerModifier;
  const dMod = defenderRoll + defenderModifier;

  if (aMod > dMod) {
    return {
      attackerModifiedTotal: aMod,
      defenderModifiedTotal: dMod,
      winner: 'attacker',
      attackerLosses: 0,
      defenderLosses: aMod - dMod,
    };
  }
  if (dMod > aMod) {
    return {
      attackerModifiedTotal: aMod,
      defenderModifiedTotal: dMod,
      winner: 'defender',
      attackerLosses: dMod - aMod,
      defenderLosses: 0,
    };
  }
  // Tie — both lose the tied result
  return {
    attackerModifiedTotal: aMod,
    defenderModifiedTotal: dMod,
    winner: 'tie',
    attackerLosses: aMod,
    defenderLosses: dMod,
  };
}

/**
 * Loss selection (rule 25.3.5).
 */
export function getLossSelector(losingPlayer: string): string {
  return losingPlayer;
}

/**
 * Calculate combat modifier (rules 25.4.1-4).
 */
export function calculateCombatModifier(
  attackerCount: number,
  defenderCount: number,
): { modifier: number; appliesTo: 'attacker' | 'defender' | null } {
  if (attackerCount === defenderCount) {
    return { modifier: 0, appliesTo: null };
  }

  if (attackerCount > defenderCount) {
    const mod = Math.floor(attackerCount / defenderCount) - 1;
    if (mod === 0) return { modifier: 0, appliesTo: null };
    return { modifier: mod, appliesTo: 'attacker' };
  }

  // Defender advantage — minimum +1 (rule 25.4.4)
  const formulaMod = Math.floor(defenderCount / attackerCount) - 1;
  const mod = Math.max(formulaMod, 1);
  return { modifier: mod, appliesTo: 'defender' };
}

/**
 * All attacks declared first (rule 25.5.1).
 */
export function requiresDeclarationPhase(): boolean {
  return true;
}

/**
 * Resolution after all declared (rule 25.5.1).
 */
export function resolveAfterAllDeclared(): boolean {
  return true;
}

/**
 * Attacker chooses resolution order (rule 25.5.2).
 */
export function getResolutionOrderChooser(): string {
  return 'attacker';
}

/**
 * Results are immediate (rule 25.5.3).
 */
export function areResultsImmediate(): boolean {
  return true;
}

/**
 * Units aboard eliminated fleet (rule 25.6.1).
 */
export function getUnitsLostWithFleet(
  unitsAboard: string[],
): string[] {
  return [...unitsAboard];
}

/**
 * Combat restriction checks (rule 25.7.2).
 */
export function canUnitAttack(input: {
  declaredSiegeAttack?: boolean;
  aboardFleet?: boolean;
  unitType?: string;
  activatedThisTurn?: boolean;
  deactivatedThisTurn?: boolean;
}): boolean {
  if (input.declaredSiegeAttack) return false;
  if (input.aboardFleet && input.unitType === 'land') return false;
  if (input.activatedThisTurn) return false;
  if (input.deactivatedThisTurn) return false;
  return true;
}

/**
 * Cannot attack inside castle (rule 25.8.1).
 */
export function canAttackInsideCastle(
  defenderLocation: string,
): boolean {
  return defenderLocation !== 'inside_castle';
}

/**
 * Multiple hexes combine (rule 25.9.1).
 */
export function getTotalAttackerStrength(
  attackingHexes: Array<{ units: number }>,
): number {
  return attackingHexes.reduce((sum, h) => sum + h.units, 0);
}

/**
 * Allied forces can combine (rule 25.9.2).
 */
export function canAlliedForcesCombine(): boolean {
  return true;
}

/**
 * Unit attack limit (rule 25.10.1).
 */
export function canUnitAttackAgain(
  attacksMadeThisTurn: number,
): boolean {
  return attacksMadeThisTurn === 0;
}

/**
 * Hex attack limit (rule 25.10.2).
 */
export function canHexBeAttackedAgain(
  attacksThisTurnByPlayer: number,
): boolean {
  return attacksThisTurnByPlayer === 0;
}

/**
 * Terrain bonuses in combat (rules 25.11.x).
 */
export function getDefenderTerrainBonus(terrain: string): number {
  if (terrain === 'mountain') return 1;
  return 0;
}

export function getEffectiveDefenderStrength(
  terrain: string,
  baseStrength: number,
): number {
  if (terrain === 'mountain_pass') return baseStrength * 2;
  return baseStrength;
}

/**
 * Hexside attack restrictions (rule 25.11.4).
 */
export function canAttackAcrossHexside(
  unitType: 'land' | 'fleet',
  hexsideType: string,
): boolean {
  if (unitType === 'land' && hexsideType === 'all_sea') return false;
  if (unitType === 'fleet' && hexsideType === 'all_land') return false;
  return true;
}

/**
 * Stack attack rule (rule 25.12.1).
 */
export function mustAllStackAttack(): boolean {
  return true;
}

/**
 * Stack split attacks (rule 25.12.2).
 */
export function canSplitStackAttack(): boolean {
  return true;
}

/**
 * All defenders attacked as one (rule 25.12.3).
 */
export function areAllDefendersAttackedAsOne(): boolean {
  return true;
}

/**
 * Advance after combat (rules 25.13.x).
 */
export function canAdvanceAfterCombat(
  defendersRemaining: number,
): boolean {
  return defendersRemaining === 0;
}

export function getAdvanceChoiceOptions(): string[] {
  return ['none', 'some', 'all'];
}

export function getMaxAdvanceHexes(isSiegeRelief: boolean): number {
  return isSiegeRelief ? 2 : 1;
}
