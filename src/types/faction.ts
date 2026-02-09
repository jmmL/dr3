import type { HexCoord } from './hex';

export type RaceId = 'human' | 'elf' | 'dwarf' | 'goblin' | 'troll';

export interface CityData {
  id: string;
  name: string;
  factionId: string;
  position: HexCoord;
  armies: number;
  seaFleet: number;
  isCapital: boolean;
  intrinsicDefense?: number;
}

export interface FactionData {
  id: string;
  name: string;
  race: RaceId;
  color: string;
  coatOfArms: string;
  monarchStartLocation?: HexCoord;
  notes?: string;
  cities: CityData[];
}

export type ActivationStatus =
  | 'unactivated'
  | 'activated'
  | 'violated'
  | 'confused';

export interface FactionState {
  id: string;
  activationStatus: ActivationStatus;
  controllingPlayerId: string | null;
  personalityCardId: number | null;
  monarchAlive: boolean;
  ambassadorAlive: boolean;
  ambassadorBanishedUntilTurn: number | null;
  diplomacyPenalty: number;
  castlesOwned: string[];
  victoryPoints: number;
}
