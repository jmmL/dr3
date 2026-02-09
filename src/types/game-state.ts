import type { HexMap, HexCoord } from './hex';
import type { UnitState, UnitDefinition } from './unit';
import type { FactionState, FactionData } from './faction';
import type { DiplomacyDeckState } from './cards';
import type { SiegeState } from './siege';

export type GamePhase =
  | 'setup'
  | 'playerOrder'
  | 'playerTurn'
  | 'endOfTurn';

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
  hand: string[];
}

export interface GameState {
  hexMap: HexMap;
  units: Record<string, UnitState>;
  unitDefinitions: Record<string, UnitDefinition>;
  factions: Record<string, FactionState>;
  factionData: Record<string, FactionData>;
  players: Record<string, PlayerState>;
  diplomacyDeck: DiplomacyDeckState;
  sieges: SiegeState[];
  currentTurn: number;
  maxTurns: number;
  turnOrder: string[];
  activePlayerIndex: number;
  phase: GamePhase;
  stage: TurnStage | null;
  pendingCombats: Array<{
    attackerHex: HexCoord;
    defenderHex: HexCoord;
  }>;
  log: string[];
  seed: string;
  rngState: number[];
}
