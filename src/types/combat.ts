import type { HexCoord } from './hex';

export interface CombatState {
  attackerHex: HexCoord;
  defenderHex: HexCoord;
  attackerUnitIds: string[];
  defenderUnitIds: string[];
  attackerStrength: number;
  defenderStrength: number;
  modifier: number;
  retreatAvailable: boolean;
}

export interface CombatResult {
  dieRoll: number;
  modifiedRoll: number;
  attackerLosses: number;
  defenderLosses: number;
  retreatRequired: 'attacker' | 'defender' | null;
  leaderFateChecks: LeaderFateResult[];
}

export interface LeaderFateResult {
  unitId: string;
  dieRoll: number;
  outcome: 'safe' | 'killed' | 'captured' | 'wounded';
}
