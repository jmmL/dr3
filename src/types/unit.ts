import type { HexCoord } from './hex';

export type UnitType =
  | 'monarch'
  | 'ambassador'
  | 'army'
  | 'fleet'
  | 'regular_army'
  | 'regular_fleet'
  | 'mercenary_army'
  | 'mercenary_fleet';

export type MovementType = 'standard' | 'teleport' | 'naval';

export type AbilityId =
  | 'forest_walking'
  | 'mountaineer'
  | 'diplomatic'
  | 'flying';

export interface UnitDefinition {
  id: string;
  name: string;
  factionId: string;
  unitType: UnitType;
  count: number;
  movementPoints: number;
  startHex: HexCoord | null;
  cityId: string | null;
  abilities: AbilityId[];
  movementType: MovementType;
  deployment?: {
    type: string;
    rules: string;
    exampleStartHexes?: HexCoord[];
  };
}

export interface UnitState {
  id: string;
  definitionId: string;
  factionId: string;
  unitType: UnitType;
  position: HexCoord;
  movementPoints: number;
  movementRemaining: number;
  abilities: AbilityId[];
  movementType: MovementType;
  count: number;
  isMercenary: boolean;
  isAlive: boolean;
  cityId: string | null;
}
