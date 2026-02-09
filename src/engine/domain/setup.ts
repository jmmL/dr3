import {
  loadFactions,
  loadHexMap,
  loadPersonalityCards,
  loadUnitDefinitions,
} from '@/data/load-refs';
import type {
  FactionData,
  FactionState,
  GameState,
  PlayerState,
  UnitDefinition,
  UnitState,
} from '@/types';
import { normalizeSeed, seedToState } from './rng';

interface SetupPlayer {
  id: string;
  homeFactionId: string;
  isHuman: boolean;
}

export interface SetupOptions {
  seed?: string;
  players?: SetupPlayer[];
  maxTurns?: number;
}

function buildPlayerStates(playerSlots: SetupPlayer[]): Record<string, PlayerState> {
  const players: Record<string, PlayerState> = {};
  for (const slot of playerSlots) {
    players[slot.id] = {
      id: slot.id,
      homeFactionId: slot.homeFactionId,
      isHuman: slot.isHuman,
      hand: [],
    };
  }
  return players;
}

function buildFactionDataRecord(factions: FactionData[]): Record<string, FactionData> {
  const record: Record<string, FactionData> = {};
  for (const faction of factions) {
    record[faction.id] = faction;
  }
  return record;
}

function buildFactionStateRecord(factions: FactionData[]): Record<string, FactionState> {
  const states: Record<string, FactionState> = {};
  for (const faction of factions) {
    states[faction.id] = {
      id: faction.id,
      activationStatus: 'unactivated',
      controllingPlayerId: null,
      personalityCardId: null,
      monarchAlive: true,
      ambassadorAlive: true,
      ambassadorBanishedUntilTurn: null,
      diplomacyPenalty: 0,
      castlesOwned: faction.cities.map((city) => city.id),
      victoryPoints: 0,
    };
  }
  return states;
}

function buildUnitDefinitionRecord(units: UnitDefinition[]): Record<string, UnitDefinition> {
  const record: Record<string, UnitDefinition> = {};
  for (const definition of units) {
    record[definition.id] = definition;
  }
  return record;
}

function toUnitState(definition: UnitDefinition): UnitState | null {
  if (!definition.startHex) return null;

  return {
    id: definition.id,
    definitionId: definition.id,
    factionId: definition.factionId,
    unitType: definition.unitType,
    position: definition.startHex,
    movementPoints: definition.movementPoints,
    movementRemaining: definition.movementPoints,
    abilities: definition.abilities,
    movementType: definition.movementType,
    count: definition.count,
    isMercenary: definition.unitType.startsWith('mercenary'),
    isAlive: true,
    cityId: definition.cityId,
  };
}

function buildUnitStateRecord(units: UnitDefinition[]): Record<string, UnitState> {
  const record: Record<string, UnitState> = {};
  for (const definition of units) {
    const unit = toUnitState(definition);
    if (unit) {
      record[unit.id] = unit;
    }
  }
  return record;
}

function defaultPlayers(factions: FactionData[]): SetupPlayer[] {
  const factionIds = factions.slice(0, 2).map((f) => f.id);
  return [
    { id: '0', homeFactionId: factionIds[0] ?? 'hothior', isHuman: true },
    { id: '1', homeFactionId: factionIds[1] ?? 'immer', isHuman: false },
  ];
}

export function buildInitialGameState(options: SetupOptions = {}): GameState {
  const seed = normalizeSeed(options.seed);
  const hexMap = loadHexMap();
  const factions = loadFactions();
  const unitDefinitions = loadUnitDefinitions();
  const personalityCards = loadPersonalityCards();
  const playerSlots = options.players ?? defaultPlayers(factions);

  const gameState: GameState = {
    hexMap,
    units: buildUnitStateRecord(unitDefinitions),
    unitDefinitions: buildUnitDefinitionRecord(unitDefinitions),
    factions: buildFactionStateRecord(factions),
    factionData: buildFactionDataRecord(factions),
    players: buildPlayerStates(playerSlots),
    diplomacyDeck: {
      drawPile: personalityCards.map((card) => `diplomacy-${card.id}`),
      discardPile: [],
      playerHands: Object.fromEntries(
        playerSlots.map((slot) => [slot.id, [] as string[]]),
      ),
    },
    sieges: [],
    currentTurn: 1,
    maxTurns: options.maxTurns ?? 20,
    turnOrder: playerSlots.map((slot) => slot.id),
    activePlayerIndex: 0,
    phase: 'playerTurn',
    stage: 'rollEvents',
    pendingCombats: [],
    log: [`Game initialized with seed "${seed}"`],
    seed,
    rngState: seedToState(seed),
  };

  for (const slot of playerSlots) {
    const faction = gameState.factions[slot.homeFactionId];
    if (faction) {
      faction.controllingPlayerId = slot.id;
      faction.activationStatus = 'activated';
    }
  }

  return gameState;
}
