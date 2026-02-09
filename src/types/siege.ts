import type { HexCoord } from './hex';

export interface SiegeState {
  hex: HexCoord;
  cityId: string;
  besiegingFactionId: string;
  besiegingUnitIds: string[];
  defendingFactionId: string;
  defendingUnitIds: string[];
  turnsUnderSiege: number;
  isPlundered: boolean;
}

export interface SiegeResult {
  dieRoll: number;
  modifiedRoll: number;
  castleFalls: boolean;
  attackerLosses: number;
  defenderLosses: number;
}
