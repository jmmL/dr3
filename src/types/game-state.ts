import type { HexMap, HexCoord } from './hex';
import type { UnitState } from './unit';
import type { FactionState } from './faction';
import type { DiplomacyDeckState } from './cards';
import type { SiegeState } from './siege';

export type TurnStage =
  | 'rollEvents'
  | 'drawCard'
  | 'diplomacy'
  | 'siegeResolution'
  | 'movement'
  | 'combat';

export interface PlayerState {
  id: string;
  homeFactionId: string;
  isHuman: boolean;
}

export interface GameState {
  hexMap: HexMap;
  units: Record<string, UnitState>;
  factions: Record<string, FactionState>;
  players: Record<string, PlayerState>;
  diplomacyDeck: DiplomacyDeckState;
  sieges: SiegeState[];
  currentTurn: number;
  maxTurns: number;
  turnOrder: string[];
  activePlayerIndex: number;
  stage: TurnStage;
  pendingCombats: Array<{
    attackerHex: HexCoord;
    defenderHex: HexCoord;
    declaredByPlayerId: string;
  }>;
  log: string[];
  seed: string;
  rngState: number[];
}

export type RuntimeGameState = Omit<GameState, 'hexMap'>;
