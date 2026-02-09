/**
 * Unit type classification and properties.
 * Pure functions — no state dependencies.
 */

export interface UnitTypeProperties {
  isCombatUnit: boolean;
  isLeader: boolean;
  combatStrength: number;
  transportCapacity: number;
  movementType: 'standard' | 'teleport' | 'naval';
}

export function getUnitTypeProperties(unitType: string): UnitTypeProperties {
  switch (unitType) {
    case 'monarch':
      return {
        isCombatUnit: false,
        isLeader: true,
        combatStrength: 0,
        transportCapacity: 0,
        movementType: 'standard',
      };
    case 'ambassador':
      return {
        isCombatUnit: false,
        isLeader: false,
        combatStrength: 0,
        transportCapacity: 0,
        movementType: 'teleport',
      };
    case 'regular_army':
    case 'army':
      return {
        isCombatUnit: true,
        isLeader: false,
        combatStrength: 1,
        transportCapacity: 0,
        movementType: 'standard',
      };
    case 'regular_fleet':
    case 'fleet':
      return {
        isCombatUnit: true,
        isLeader: false,
        combatStrength: 1,
        transportCapacity: 1,
        movementType: 'naval',
      };
    case 'mercenary_army':
      return {
        isCombatUnit: true,
        isLeader: false,
        combatStrength: 1,
        transportCapacity: 0,
        movementType: 'standard',
      };
    case 'mercenary_fleet':
      return {
        isCombatUnit: true,
        isLeader: false,
        combatStrength: 1,
        transportCapacity: 1,
        movementType: 'naval',
      };
    default:
      return {
        isCombatUnit: false,
        isLeader: false,
        combatStrength: 0,
        transportCapacity: 0,
        movementType: 'standard',
      };
  }
}

export function isCombatUnit(unitType: string): boolean {
  return getUnitTypeProperties(unitType).isCombatUnit;
}

export function isLeader(unitType: string): boolean {
  return getUnitTypeProperties(unitType).isLeader;
}

export function getCombatStrength(unitType: string): number {
  return getUnitTypeProperties(unitType).combatStrength;
}

export function getTransportCapacity(unitType: string): number {
  return getUnitTypeProperties(unitType).transportCapacity;
}

export function getMovementType(unitType: string): string {
  return getUnitTypeProperties(unitType).movementType;
}

/**
 * Get death effects for a monarch.
 */
export function getMonarchDeathEffect(monarchType: 'player' | 'non_player'): {
  playerEliminated: boolean;
  kingdomEntersConfusion: boolean;
} {
  if (monarchType === 'player') {
    return { playerEliminated: true, kingdomEntersConfusion: false };
  }
  return { playerEliminated: false, kingdomEntersConfusion: true };
}

/**
 * Get recovery turns after ambassador death.
 */
export function getAmbassadorRecoveryTurns(): number {
  return 2;
}
