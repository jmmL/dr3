export interface TerrainAbilities {
  hasTreeSymbol: boolean;
  hasMountainSymbol: boolean;
}

const NO_ABILITIES: TerrainAbilities = {
  hasTreeSymbol: false,
  hasMountainSymbol: false,
};

/**
 * Get base movement cost for a single terrain type.
 * Does not factor in unit abilities.
 */
export function getBaseTerrainCost(terrain: string): number {
  switch (terrain) {
    case 'clear':
    case 'lakeshore':
    case 'seashore':
    case 'sea':
    case 'open_sea':
    case 'isle_of_fright':
    case 'castle':
    case 'port':
    case 'seaport':
    case 'scenic':
    case 'scenic_hex':
    case 'royal':
    case 'ancient_battlefield':
      return 1;
    case 'forest':
    case 'minor_river':
    case 'major_river':
    case 'hill':
    case 'hills':
    case 'swamp':
    case 'mountain_pass':
      return 2;
    case 'mountain':
      return 3;
    case 'lake':
      return Infinity;
    default:
      return 1;
  }
}

/**
 * Get movement cost for a terrain type considering unit abilities.
 */
export function getTerrainMovementCost(
  terrain: string,
  abilities: TerrainAbilities = NO_ABILITIES,
): number {
  if (terrain === 'forest' && abilities.hasTreeSymbol) return 1;
  if ((terrain === 'hill' || terrain === 'hills') && abilities.hasMountainSymbol) return 1;
  return getBaseTerrainCost(terrain);
}

/**
 * Get the effective terrain type after applying abilities.
 */
export function getEffectiveTerrain(
  terrain: string,
  abilities: TerrainAbilities = NO_ABILITIES,
): string {
  if (terrain === 'forest' && abilities.hasTreeSymbol) return 'clear';
  if ((terrain === 'hill' || terrain === 'hills') && abilities.hasMountainSymbol) return 'clear';
  return terrain;
}

/**
 * Check if a unit must stop after entering this terrain.
 */
export function mustStopInTerrain(
  terrain: string,
  abilities: TerrainAbilities = NO_ABILITIES,
): boolean {
  if (terrain === 'mountain') {
    return !abilities.hasMountainSymbol;
  }
  return false;
}

/**
 * Calculate movement cost for a hex with multiple terrain types.
 * Terrain effects are cumulative (rule 19.17).
 */
export function calculateCumulativeTerrainCost(
  terrains: string[],
  abilities: TerrainAbilities = NO_ABILITIES,
): number {
  return terrains.reduce(
    (total, t) => total + getTerrainMovementCost(t, abilities),
    0,
  );
}

/**
 * Check if cumulative terrain requires stopping.
 */
export function mustStopInCumulativeTerrain(
  terrains: string[],
  abilities: TerrainAbilities = NO_ABILITIES,
): boolean {
  return terrains.some((t) => mustStopInTerrain(t, abilities));
}

/**
 * Get combat modifier for terrain (defender bonus).
 */
export function getTerrainCombatModifier(
  terrain: string,
  combatRole: 'attacker' | 'defender',
): number {
  if (combatRole === 'defender' && terrain === 'mountain') return 1;
  return 0;
}

/**
 * Get effective combat value considering terrain.
 * Mountain pass doubles defender value.
 */
export function getEffectiveCombatValue(
  terrain: string,
  combatRole: 'attacker' | 'defender',
  baseCombatValue: number,
): number {
  if (combatRole === 'defender' && terrain === 'mountain_pass') {
    return baseCombatValue * 2;
  }
  return baseCombatValue;
}

/**
 * Check if a hexside crossing is allowed.
 */
export function canCrossHexside(
  unitCategory: 'land' | 'fleet',
  hexsideType: string,
): boolean {
  if (unitCategory === 'land' && hexsideType === 'all_lake') return false;
  if (unitCategory === 'land' && hexsideType === 'all_sea') return false;
  if (unitCategory === 'fleet' && hexsideType === 'all_land') return false;
  return true;
}

/**
 * Check if a unit can enter a terrain type.
 */
export function canEnterTerrain(
  terrain: string,
  unitCategory: 'land' | 'fleet',
  options: {
    isTransported?: boolean;
    isRescueOperation?: boolean;
    relationship?: 'friendly' | 'enemy' | 'neutral';
    castleIntact?: boolean;
  } = {},
): boolean {
  if (
    (terrain === 'open_sea' || terrain === 'sea') &&
    unitCategory === 'land' &&
    !options.isTransported
  ) {
    return false;
  }

  if (
    terrain === 'isle_of_fright' &&
    unitCategory === 'fleet' &&
    !options.isRescueOperation
  ) {
    return false;
  }

  if (
    terrain === 'castle' &&
    options.relationship === 'enemy' &&
    options.castleIntact !== false
  ) {
    return false;
  }

  return true;
}

/**
 * Check if a terrain type provides access for both fleets and land units (seaports).
 */
export function getTerrainAccess(terrain: string): {
  fleetAccess: boolean;
  landAccess: boolean;
} {
  if (terrain === 'seaport' || terrain === 'port') {
    return { fleetAccess: true, landAccess: true };
  }
  if (terrain === 'sea' || terrain === 'open_sea') {
    return { fleetAccess: true, landAccess: false };
  }
  return { fleetAccess: false, landAccess: true };
}

/**
 * Check if home kingdom bonus applies to a unit type.
 */
export function hasHomeKingdomBonus(
  unitType: string,
  inHomeKingdom: boolean,
): boolean {
  if (!inHomeKingdom) return false;
  return unitType === 'monarch' || unitType === 'regular' || unitType === 'regular_army' || unitType === 'regular_fleet';
}

/**
 * Get effective terrain abilities for a unit considering home kingdom bonus.
 */
export function getEffectiveAbilities(
  baseAbilities: TerrainAbilities,
  unitType: string,
  inHomeKingdom: boolean,
): TerrainAbilities {
  if (hasHomeKingdomBonus(unitType, inHomeKingdom)) {
    return { hasTreeSymbol: true, hasMountainSymbol: true };
  }
  return baseAbilities;
}

/**
 * Check whether major river crossing is allowed.
 */
export function canCrossMajorRiver(beganInHex: boolean): boolean {
  return beganInHex;
}
