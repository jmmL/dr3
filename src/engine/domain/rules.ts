import { calculateCombatModifier, resolveCombat } from '@/engine/combat/combat-resolution';
import { getNeighborCoords } from '@/engine/map/hex-grid';
import { calculateCumulativeTerrainCost } from '@/engine/map/terrain';
import { canEnterHexByMp } from '@/engine/movement/movement';
import { getCombatStrength, isCombatUnit } from '@/engine/units/unit-helpers';
import { calculateSiegeModifier, resolveSiegeRoll } from '@/engine/siege/siege-resolution';
import type { EventType, GameState, HexCoord, TurnStage, UnitState } from '@/types';
import { hexKeyFromCoord } from '@/types';
import { nextInt, roll2d6, rollDie } from './rng';

export interface DomainResult {
  ok: boolean;
  reason?: string;
}

export interface RandomEventResult extends DomainResult {
  eventType?: EventType;
  eventRoll?: number;
}

export interface CombatResolutionResult extends DomainResult {
  attackerLosses?: number;
  defenderLosses?: number;
  winner?: 'attacker' | 'defender' | 'tie';
}

export interface MovementValidationResult extends DomainResult {
  terrainCost?: number;
  minimumMovementApplies?: boolean;
}

export interface CombatDeclarationValidationResult extends DomainResult {
  attackerHex?: HexCoord;
  defenderHex?: HexCoord;
}

function fail(reason: string): DomainResult {
  return { ok: false, reason };
}

function isCoordEqual(a: HexCoord, b: HexCoord): boolean {
  return a.col === b.col && a.row === b.row;
}

function isAdjacent(G: GameState, from: HexCoord, to: HexCoord): boolean {
  return getNeighborCoords(G.hexMap, from.col, from.row).some(
    (coord) => coord.col === to.col && coord.row === to.row,
  );
}

function getUnitsAtHex(G: GameState, coord: HexCoord): UnitState[] {
  return Object.values(G.units).filter(
    (unit) => unit.isAlive && isCoordEqual(unit.position, coord),
  );
}

function getCombatUnitsAtHex(G: GameState, coord: HexCoord): UnitState[] {
  return getUnitsAtHex(G, coord).filter((unit) => isCombatUnit(unit.unitType));
}

function getControlledCombatUnitsAtHex(
  G: GameState,
  coord: HexCoord,
  playerID: string,
): UnitState[] {
  return getCombatUnitsAtHex(G, coord).filter((unit) =>
    canControlUnitForPlayer(G, playerID, unit),
  );
}

function getHostileCombatUnitsAtHex(
  G: GameState,
  coord: HexCoord,
  playerID: string,
): UnitState[] {
  return getCombatUnitsAtHex(G, coord).filter((unit) =>
    isUnitHostileToPlayer(G, playerID, unit),
  );
}

export function canControlUnitForPlayer(
  G: GameState,
  playerID: string,
  unit: UnitState,
): boolean {
  const player = G.players[playerID];
  if (!player) return false;
  if (unit.factionId === player.homeFactionId) return true;

  const faction = G.factions[unit.factionId];
  if (faction?.controllingPlayerId === playerID) return true;

  return unit.isMercenary;
}

function isUnitHostileToPlayer(
  G: GameState,
  playerID: string,
  unit: UnitState,
): boolean {
  return !canControlUnitForPlayer(G, playerID, unit);
}

function hasEnemyCombatUnitAtHex(
  G: GameState,
  coord: HexCoord,
  playerID: string,
): boolean {
  return getCombatUnitsAtHex(G, coord).some((unit) =>
    isUnitHostileToPlayer(G, playerID, unit),
  );
}

function getTerrainAbilityFlags(unit: UnitState): {
  hasTreeSymbol: boolean;
  hasMountainSymbol: boolean;
} {
  return {
    hasTreeSymbol: unit.abilities.includes('forest_walking'),
    hasMountainSymbol: unit.abilities.includes('mountaineer'),
  };
}

function removeLosses(units: UnitState[], losses: number): void {
  let remainingLosses = losses;

  for (const unit of units) {
    if (remainingLosses <= 0) break;
    const take = Math.min(unit.count, remainingLosses);
    unit.count -= take;
    remainingLosses -= take;
    if (unit.count <= 0) {
      unit.count = 0;
      unit.isAlive = false;
    }
  }
}

function eventTypeFromRoll(total: number): EventType {
  switch (total) {
    case 2:
      return 'untimely_death';
    case 3:
      return 'storms';
    case 4:
      return 'mutiny';
    case 5:
      return 'bad_omens';
    case 6:
      return 'replacements';
    case 7:
      return 'no_event';
    case 8:
      return 'reinforcements';
    case 9:
      return 'plague';
    case 10:
      return 'replacements';
    case 11:
      return 'desertion';
    case 12:
      return 'help_from_afar';
    default:
      return 'no_event';
  }
}

export function setStage(G: GameState, stage: TurnStage): void {
  G.stage = stage;
}

export function getStageForPlayer(G: GameState, playerID: string): TurnStage | null {
  const activePlayer = G.turnOrder[G.activePlayerIndex];
  if (activePlayer !== playerID) return null;
  return G.stage;
}

export function rollRandomEventForPlayer(
  G: GameState,
  playerID: string,
): RandomEventResult {
  if (getStageForPlayer(G, playerID) !== 'rollEvents') {
    return { ok: false, reason: 'wrong_stage' };
  }

  const roll = roll2d6(G.rngState);
  G.rngState = roll.nextState;
  const eventType = eventTypeFromRoll(roll.total);

  G.log.push(
    `P${playerID} rolled random event ${roll.first}+${roll.second}=${roll.total} (${eventType}).`,
  );

  return { ok: true, eventType, eventRoll: roll.total };
}

export function drawDiplomacyCardForPlayer(G: GameState, playerID: string): DomainResult {
  if (getStageForPlayer(G, playerID) !== 'drawCard') {
    return fail('wrong_stage');
  }

  const draw = nextInt(G.rngState, 45);
  G.rngState = draw.nextState;
  const cardId = `card-${draw.value + 1}`;
  const hand = G.diplomacyDeck.playerHands[playerID];
  if (!hand) return fail('unknown_player');

  hand.push(cardId);
  G.log.push(`P${playerID} drew ${cardId}.`);
  return { ok: true };
}

export function conductDiplomacyForPlayer(
  G: GameState,
  playerID: string,
  targetFactionId: string,
  action: 'activate' | 'deactivate',
): DomainResult {
  if (getStageForPlayer(G, playerID) !== 'diplomacy') {
    return fail('wrong_stage');
  }

  const target = G.factions[targetFactionId];
  if (!target) return fail('unknown_faction');

  if (action === 'activate') {
    target.activationStatus = 'activated';
    target.controllingPlayerId = playerID;
  } else {
    target.activationStatus = 'unactivated';
    target.controllingPlayerId = null;
  }

  G.log.push(`P${playerID} diplomacy ${action} on ${targetFactionId}.`);
  return { ok: true };
}

export function resolveSiegesForPlayer(G: GameState, playerID: string): DomainResult {
  if (getStageForPlayer(G, playerID) !== 'siegeResolution') {
    return fail('wrong_stage');
  }

  const player = G.players[playerID];
  if (!player) return fail('unknown_player');

  const playerFactionIds = new Set<string>([player.homeFactionId]);
  for (const [factionId, state] of Object.entries(G.factions)) {
    if (state.controllingPlayerId === playerID) {
      playerFactionIds.add(factionId);
    }
  }

  const sieges = G.sieges.filter((siege) => playerFactionIds.has(siege.besiegingFactionId));
  if (sieges.length === 0) {
    G.log.push(`P${playerID} has no sieges to resolve.`);
    return { ok: true };
  }

  for (const siege of sieges) {
    const roll = rollDie(G.rngState);
    G.rngState = roll.nextState;
    const intrinsicDefense = G.hexMap.hexes.get(hexKeyFromCoord(siege.hex))
      ?.intrinsicDefense ?? 0;
    const modifier = calculateSiegeModifier(
      siege.besiegingUnitIds.length,
      intrinsicDefense,
      siege.defendingUnitIds.length,
    );
    const result = resolveSiegeRoll(roll.value, modifier);
    siege.turnsUnderSiege += 1;
    if (result.castleTaken) {
      siege.isPlundered = true;
    }
    G.log.push(
      `P${playerID} siege at ${siege.hex.col},${siege.hex.row} roll=${roll.value} mod=${modifier} taken=${result.castleTaken}.`,
    );
  }

  return { ok: true };
}

export function moveUnitForPlayer(
  G: GameState,
  playerID: string,
  unitId: string,
  destination: HexCoord,
): DomainResult {
  const legalMove = validateMoveUnitForPlayer(G, playerID, unitId, destination);
  if (!legalMove.ok) return fail(legalMove.reason ?? 'illegal_move');

  const unit = G.units[unitId];
  if (!unit || !unit.isAlive) return fail('unknown_or_dead_unit');
  const terrainCost = legalMove.terrainCost ?? 0;
  unit.position = destination;
  unit.movementRemaining = legalMove.minimumMovementApplies
    ? 0
    : Math.max(0, unit.movementRemaining - terrainCost);
  G.log.push(`P${playerID} moved ${unitId} to ${destination.col},${destination.row}.`);

  return { ok: true };
}

function getLegalMovementCost(
  G: GameState,
  playerID: string,
  unit: UnitState,
  destination: HexCoord,
): {
  ok: boolean;
  reason?: string;
  terrainCost: number;
  minimumMovementApplies: boolean;
} {
  if (!canControlUnitForPlayer(G, playerID, unit)) {
    return { ok: false, reason: 'not_controllable', terrainCost: 0, minimumMovementApplies: false };
  }
  if (!isAdjacent(G, unit.position, destination)) {
    return { ok: false, reason: 'not_adjacent', terrainCost: 0, minimumMovementApplies: false };
  }

  const destinationHex = G.hexMap.hexes.get(hexKeyFromCoord(destination));
  if (!destinationHex) {
    return { ok: false, reason: 'invalid_destination', terrainCost: 0, minimumMovementApplies: false };
  }
  if (hasEnemyCombatUnitAtHex(G, destination, playerID)) {
    return { ok: false, reason: 'enemy_hex', terrainCost: 0, minimumMovementApplies: false };
  }

  const terrainCost = calculateCumulativeTerrainCost(
    destinationHex.terrain,
    getTerrainAbilityFlags(unit),
  );
  const movementCheck = canEnterHexByMp(
    unit.movementRemaining,
    terrainCost,
    unit.movementRemaining === unit.movementPoints ? 0 : 1,
  );
  if (!movementCheck.entryAllowed) {
    return { ok: false, reason: 'insufficient_movement', terrainCost, minimumMovementApplies: false };
  }

  return {
    ok: true,
    terrainCost,
    minimumMovementApplies: movementCheck.minimumMovementApplies,
  };
}

export function validateMoveUnitForPlayer(
  G: GameState,
  playerID: string,
  unitId: string,
  destination: HexCoord,
): MovementValidationResult {
  if (getStageForPlayer(G, playerID) !== 'movement') {
    return fail('wrong_stage');
  }
  const unit = G.units[unitId];
  if (!unit || !unit.isAlive) return fail('unknown_or_dead_unit');
  const legalMove = getLegalMovementCost(G, playerID, unit, destination);
  if (!legalMove.ok) return fail(legalMove.reason ?? 'illegal_move');
  return {
    ok: true,
    terrainCost: legalMove.terrainCost,
    minimumMovementApplies: legalMove.minimumMovementApplies,
  };
}

export function listLegalDestinationsForUnit(
  G: GameState,
  playerID: string,
  unitId: string,
): HexCoord[] {
  const unit = G.units[unitId];
  if (!unit || !unit.isAlive) return [];
  if (!canControlUnitForPlayer(G, playerID, unit)) return [];

  const neighbors = getNeighborCoords(G.hexMap, unit.position.col, unit.position.row);
  return neighbors.filter((neighbor) => getLegalMovementCost(G, playerID, unit, neighbor).ok);
}

export function findAllLegalMovements(
  G: GameState,
  playerID: string,
): Array<{ unitId: string; destination: HexCoord }> {
  const units = Object.values(G.units).filter(
    (unit) =>
      unit.isAlive &&
      unit.movementRemaining > 0 &&
      canControlUnitForPlayer(G, playerID, unit),
  );
  const moves: Array<{ unitId: string; destination: HexCoord }> = [];

  for (const unit of units) {
    const destinations = listLegalDestinationsForUnit(G, playerID, unit.id);
    for (const destination of destinations) {
      moves.push({ unitId: unit.id, destination });
    }
  }

  return moves;
}

export function findFirstLegalMovement(
  G: GameState,
  playerID: string,
): { unitId: string; destination: HexCoord } | null {
  return findAllLegalMovements(G, playerID)[0] ?? null;
}

export function findFirstCombatPair(
  G: GameState,
  playerID: string,
): { attacker: HexCoord; defender: HexCoord } | null {
  const controlled = Object.values(G.units).filter(
    (unit) =>
      unit.isAlive &&
      canControlUnitForPlayer(G, playerID, unit) &&
      isCombatUnit(unit.unitType),
  );

  for (const attacker of controlled) {
    const neighbors = getNeighborCoords(
      G.hexMap,
      attacker.position.col,
      attacker.position.row,
    );
    for (const neighbor of neighbors) {
      const defenders = getHostileCombatUnitsAtHex(G, neighbor, playerID);
      if (defenders.length > 0) {
        return { attacker: attacker.position, defender: neighbor };
      }
    }
  }

  return null;
}

export function listCombatTargetsForHex(
  G: GameState,
  playerID: string,
  attackerHex: HexCoord,
): HexCoord[] {
  if (getStageForPlayer(G, playerID) !== 'combat') {
    return [];
  }
  const attackerUnits = getControlledCombatUnitsAtHex(G, attackerHex, playerID);
  if (attackerUnits.length === 0) {
    return [];
  }

  const neighbors = getNeighborCoords(G.hexMap, attackerHex.col, attackerHex.row);
  return neighbors.filter(
    (neighbor) => getHostileCombatUnitsAtHex(G, neighbor, playerID).length > 0,
  );
}

export function validateCombatDeclarationForPlayer(
  G: GameState,
  playerID: string,
  attackerHex: HexCoord,
  defenderHex: HexCoord,
): CombatDeclarationValidationResult {
  if (getStageForPlayer(G, playerID) !== 'combat') {
    return fail('wrong_stage');
  }
  if (!isAdjacent(G, attackerHex, defenderHex)) return fail('not_adjacent');

  const attackerUnits = getControlledCombatUnitsAtHex(G, attackerHex, playerID);
  if (attackerUnits.length === 0) return fail('no_attacker_units');

  const defenderUnits = getHostileCombatUnitsAtHex(G, defenderHex, playerID);
  if (defenderUnits.length === 0) return fail('no_defender_units');

  return { ok: true, attackerHex, defenderHex };
}

export function declareCombatForPlayer(
  G: GameState,
  playerID: string,
  attackerHex: HexCoord,
  defenderHex: HexCoord,
): DomainResult {
  const validation = validateCombatDeclarationForPlayer(
    G,
    playerID,
    attackerHex,
    defenderHex,
  );
  if (!validation.ok) {
    return validation;
  }

  G.pendingCombats.push({ attackerHex, defenderHex, declaredByPlayerId: playerID });
  G.log.push(
    `P${playerID} declared combat ${attackerHex.col},${attackerHex.row} -> ${defenderHex.col},${defenderHex.row}.`,
  );
  return { ok: true };
}

export function resolveNextCombatForPlayer(
  G: GameState,
  playerID: string,
): CombatResolutionResult {
  if (getStageForPlayer(G, playerID) !== 'combat') {
    return { ok: false, reason: 'wrong_stage' };
  }
  const pending = G.pendingCombats.shift();
  if (!pending) return { ok: false, reason: 'no_pending_combat' };
  if (pending.declaredByPlayerId !== playerID) {
    return { ok: false, reason: 'wrong_player' };
  }

  const attackerUnits = getCombatUnitsAtHex(G, pending.attackerHex).filter((unit) =>
    canControlUnitForPlayer(G, playerID, unit),
  );
  const defenderUnits = getCombatUnitsAtHex(G, pending.defenderHex).filter(
    (unit) => isUnitHostileToPlayer(G, playerID, unit),
  );
  if (attackerUnits.length === 0 || defenderUnits.length === 0) {
    return { ok: false, reason: 'combatants_missing' };
  }

  const attackerStrength = attackerUnits.reduce(
    (sum, unit) => sum + getCombatStrength(unit.unitType) * unit.count,
    0,
  );
  const defenderStrength = defenderUnits.reduce(
    (sum, unit) => sum + getCombatStrength(unit.unitType) * unit.count,
    0,
  );
  if (attackerStrength <= 0 || defenderStrength <= 0) {
    return { ok: false, reason: 'no_combat_strength' };
  }

  const modifier = calculateCombatModifier(attackerStrength, defenderStrength);
  const attackRoll = rollDie(G.rngState);
  const defendRoll = rollDie(attackRoll.nextState);
  G.rngState = defendRoll.nextState;

  const attackerModifier = modifier.appliesTo === 'attacker' ? modifier.modifier : 0;
  const defenderModifier = modifier.appliesTo === 'defender' ? modifier.modifier : 0;
  const outcome = resolveCombat(
    attackRoll.value,
    attackerModifier,
    defendRoll.value,
    defenderModifier,
  );

  removeLosses(attackerUnits, outcome.attackerLosses);
  removeLosses(defenderUnits, outcome.defenderLosses);

  G.log.push(
    `Combat resolved at ${pending.attackerHex.col},${pending.attackerHex.row}: winner=${outcome.winner}, A-${outcome.attackerLosses}, D-${outcome.defenderLosses}.`,
  );

  return {
    ok: true,
    attackerLosses: outcome.attackerLosses,
    defenderLosses: outcome.defenderLosses,
    winner: outcome.winner,
  };
}

export function startTurnForPlayer(G: GameState, playerID: string, turn: number): void {
  G.currentTurn = turn;
  G.stage = 'rollEvents';
  G.activePlayerIndex = G.turnOrder.indexOf(playerID);
  if (G.activePlayerIndex < 0) G.activePlayerIndex = 0;

  for (const unit of Object.values(G.units)) {
    if (unit.isAlive && canControlUnitForPlayer(G, playerID, unit)) {
      unit.movementRemaining = unit.movementPoints;
    }
  }
}

export function hasAnyPendingCombats(G: GameState): boolean {
  return G.pendingCombats.length > 0;
}

export function scoreVictoryPointsFromFactionState(G: GameState): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const playerID of G.turnOrder) {
    scores[playerID] = 0;
  }

  for (const factionState of Object.values(G.factions)) {
    if (factionState.controllingPlayerId) {
      scores[factionState.controllingPlayerId] =
        (scores[factionState.controllingPlayerId] ?? 0) +
        factionState.victoryPoints;
    }
  }

  return scores;
}
