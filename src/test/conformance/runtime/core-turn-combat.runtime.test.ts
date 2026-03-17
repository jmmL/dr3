import { Client } from 'boardgame.io/client';
import { describe, expect, it } from 'vitest';
import { getNeighborCoords } from '@/engine/map/hex-grid';
import { isCombatUnit } from '@/engine/units/unit-helpers';
import {
  canControlUnitForPlayer,
  declareCombatForPlayer,
  findAllLegalMovements,
  findFirstCombatPair,
  listCombatTargetsForHex,
  moveUnitForPlayer,
  resolveNextCombatForPlayer,
  validateMoveUnitForPlayer,
} from '@/engine/domain/rules';
import { DR3Game, toDomainState, type RuntimeGameState } from '@/game/dr3-game';
import { loadSuite } from '../harness';

type Dr3Client = ReturnType<typeof createClient>;

function createClient(playerID?: string) {
  const client = Client({ game: DR3Game, numPlayers: 2, playerID, debug: false });
  client.start();
  return client;
}

function expectState(client: Dr3Client) {
  const state = client.getState();
  expect(state).toBeTruthy();
  return state!;
}

function runToMovement(client: Dr3Client): void {
  const state = expectState(client);
  const targetFactionId = Object.keys(state.G.factions).find(
    (id) => id !== state.G.players[state.ctx.currentPlayer]?.homeFactionId,
  );
  expect(targetFactionId).toBeTruthy();
  if (!targetFactionId) return;

  client.moves.rollRandomEvent?.();
  client.moves.drawDiplomacyCard?.();
  client.moves.conductDiplomacy?.(targetFactionId, 'activate');
  client.moves.resolveSieges?.();
}

function injectAdjacentEnemy(client: Dr3Client): void {
  const state = expectState(client);
  const currentPlayer = state.ctx.currentPlayer;
  const domainState = toDomainState(state.G);

  const attacker = Object.values(state.G.units).find(
    (unit) =>
      unit.isAlive &&
      unit.count > 0 &&
      isCombatUnit(unit.unitType) &&
      canControlUnitForPlayer(domainState, currentPlayer, unit),
  );
  expect(attacker).toBeTruthy();
  if (!attacker) return;

  const defender = Object.values(state.G.units).find(
    (unit) =>
      unit.isAlive &&
      unit.count > 0 &&
      isCombatUnit(unit.unitType) &&
      unit.factionId !== attacker.factionId,
  );
  expect(defender).toBeTruthy();
  if (!defender) return;

  const adjacent = getNeighborCoords(
    domainState.hexMap,
    attacker.position.col,
    attacker.position.row,
  ).find((coord) => {
    const occupiedByFriendly = Object.values(state.G.units).some(
      (candidate) =>
        candidate.isAlive &&
        candidate.factionId === attacker.factionId &&
        candidate.position.col === coord.col &&
        candidate.position.row === coord.row,
    );
    return !occupiedByFriendly;
  });
  expect(adjacent).toBeTruthy();
  if (!adjacent) return;

  const clientWithOverride = client as unknown as {
    overrideGameState: (nextState: unknown) => void;
  };
  const nextG: RuntimeGameState = {
    ...state.G,
    units: {
      ...state.G.units,
      [defender.id]: {
        ...defender,
        position: { col: adjacent.col, row: adjacent.row },
      },
    },
  };
  clientWithOverride.overrideGameState({ ...state, G: nextG });
}

function overrideGameState(
  client: Dr3Client,
  transform: (state: RuntimeGameState) => RuntimeGameState,
): void {
  const state = expectState(client);
  const clientWithOverride = client as unknown as {
    overrideGameState: (nextState: unknown) => void;
  };
  const nextG = transform(structuredClone(state.G) as RuntimeGameState);
  clientWithOverride.overrideGameState({ ...state, G: nextG });
}

describe('Runtime conformance: core turn + combat', () => {
  const movementSuite = loadSuite('chunk_2_core_mechanics/18_movement.json');
  const combatSuite = loadSuite('chunk_2_core_mechanics/25_combat.json');

  it('18.1.1_only_active_player_moves: non-active player movement is rejected by runtime validator', () => {
    expect(movementSuite.tests.some((test) => test.id === '18.1.1_only_active_player_moves')).toBe(
      true,
    );

    const client = createClient();
    runToMovement(client);
    const state = expectState(client);
    expect(state.ctx.phase).toBe('movement');

    const movement = findAllLegalMovements(toDomainState(state.G), state.ctx.currentPlayer)[0];
    expect(movement).toBeTruthy();
    if (!movement) return;

    const otherPlayer = state.ctx.currentPlayer === '0' ? '1' : '0';
    const check = validateMoveUnitForPlayer(
      toDomainState(state.G),
      otherPlayer,
      movement.unitId,
      movement.destination,
    );
    expect(check.ok).toBe(false);
    expect(check.reason).toBe('wrong_stage');
  });

  it('18.5.4_terrain_cost_exceeds_remaining: runtime prevents illegal movement after first hex', () => {
    expect(
      movementSuite.tests.some((test) => test.id === '18.5.4_terrain_cost_exceeds_remaining'),
    ).toBe(true);

    const client = createClient();
    runToMovement(client);
    const before = expectState(client);
    expect(before.ctx.phase).toBe('movement');

    const movement = findAllLegalMovements(toDomainState(before.G), before.ctx.currentPlayer)[0];
    expect(movement).toBeTruthy();
    if (!movement) return;

    const unitBefore = before.G.units[movement.unitId];
    expect(unitBefore).toBeTruthy();
    if (!unitBefore) return;

    const illegalDestination = {
      col: movement.destination.col + 3,
      row: movement.destination.row + 3,
    };
    client.moves.moveUnit?.(movement.unitId, illegalDestination.col, illegalDestination.row);

    const after = expectState(client);
    const unitAfter = after.G.units[movement.unitId];
    expect(unitAfter).toBeTruthy();
    if (!unitAfter) return;

    expect(unitAfter.position).toEqual(unitBefore.position);
  });

  it('18.1.4_minimum_movement_one_hex: runtime allows legal first-step movement and updates MP', () => {
    expect(
      movementSuite.tests.some((test) => test.id === '18.1.4_minimum_movement_one_hex'),
    ).toBe(true);

    const client = createClient();
    runToMovement(client);
    const before = expectState(client);
    expect(before.ctx.phase).toBe('movement');

    const movement = findAllLegalMovements(toDomainState(before.G), before.ctx.currentPlayer)[0];
    expect(movement).toBeTruthy();
    if (!movement) return;

    const unitBefore = before.G.units[movement.unitId];
    expect(unitBefore).toBeTruthy();
    if (!unitBefore) return;

    client.moves.moveUnit?.(
      movement.unitId,
      movement.destination.col,
      movement.destination.row,
    );

    const after = expectState(client);
    const unitAfter = after.G.units[movement.unitId];
    expect(unitAfter).toBeTruthy();
    if (!unitAfter) return;

    expect(unitAfter.position).toEqual(movement.destination);
    expect(unitAfter.movementRemaining).toBeLessThanOrEqual(unitBefore.movementRemaining);
  });

  it('movement trusted slice lets the active player move a controlled allied unit', () => {
    const client = createClient('0');
    runToMovement(client);
    const state = expectState(client);
    const currentPlayer = state.ctx.currentPlayer;
    const anchorMove = findAllLegalMovements(toDomainState(state.G), currentPlayer)[0];
    expect(anchorMove).toBeTruthy();
    if (!anchorMove) return;

    const anchorUnit = state.G.units[anchorMove.unitId];
    expect(anchorUnit).toBeTruthy();
    if (!anchorUnit) return;

    const alliedUnit = Object.values(state.G.units).find(
      (unit) =>
        unit.id !== anchorUnit.id &&
        unit.factionId !== anchorUnit.factionId &&
        unit.isAlive,
    );
    expect(alliedUnit).toBeTruthy();
    if (!alliedUnit) return;

    overrideGameState(client, (nextG) => {
      const alliedFaction = nextG.factions[alliedUnit.factionId];
      const alliedState = nextG.units[alliedUnit.id];
      expect(alliedFaction).toBeTruthy();
      expect(alliedState).toBeTruthy();
      if (!alliedFaction || !alliedState) return nextG;
      nextG.factions[alliedUnit.factionId] = {
        ...alliedFaction,
        activationStatus: 'activated',
        controllingPlayerId: currentPlayer,
      };
      nextG.units[alliedUnit.id] = {
        ...alliedState,
        position: { ...anchorUnit.position },
        movementPoints: anchorUnit.movementPoints,
        movementRemaining: anchorUnit.movementRemaining,
        movementType: anchorUnit.movementType,
        abilities: [...anchorUnit.abilities],
      };
      return nextG;
    });

    const alliedState = expectState(client);
    expect(alliedState.G.units[alliedUnit.id]?.position).toEqual(anchorUnit.position);
    const alliedCheck = validateMoveUnitForPlayer(
      toDomainState(alliedState.G),
      currentPlayer,
      alliedUnit.id,
      anchorMove.destination,
    );
    expect(alliedCheck.ok).toBe(true);

    const alliedDomainState = toDomainState(
      structuredClone(alliedState.G) as RuntimeGameState,
    );
    const moved = moveUnitForPlayer(
      alliedDomainState,
      currentPlayer,
      alliedUnit.id,
      anchorMove.destination,
    );
    expect(moved.ok).toBe(true);
    expect(alliedDomainState.units[alliedUnit.id]?.position).toEqual(anchorMove.destination);
  });

  it('25.1.1_only_active_player_attacks: runtime combat declaration requires active player context', () => {
    expect(combatSuite.tests.some((test) => test.id === '25.1.1_only_active_player_attacks')).toBe(
      true,
    );

    const client = createClient();
    runToMovement(client);
    client.moves.toCombatPhase?.();
    injectAdjacentEnemy(client);

    const state = expectState(client);
    expect(state.ctx.phase).toBe('combat');

    const pair = findFirstCombatPair(toDomainState(state.G), state.ctx.currentPlayer);
    expect(pair).toBeTruthy();
    if (!pair) return;

    const domainState = toDomainState(structuredClone(state.G) as RuntimeGameState);
    const activePlayerResult = declareCombatForPlayer(
      domainState,
      state.ctx.currentPlayer,
      pair.attacker,
      pair.defender,
    );
    expect(activePlayerResult.ok).toBe(true);
    expect(domainState.pendingCombats.length).toBeGreaterThan(0);

    const inactivePlayer = state.ctx.currentPlayer === '0' ? '1' : '0';
    const inactivePlayerResult = declareCombatForPlayer(
      domainState,
      inactivePlayer,
      pair.attacker,
      pair.defender,
    );
    expect(inactivePlayerResult.ok).toBe(false);
    expect(inactivePlayerResult.reason).toBe('wrong_stage');
  });

  it('25.5.3_results_immediate: runtime combat resolution clears pending queue immediately', () => {
    expect(combatSuite.tests.some((test) => test.id === '25.5.3_results_immediate')).toBe(true);

    const client = createClient();
    runToMovement(client);
    client.moves.toCombatPhase?.();
    injectAdjacentEnemy(client);

    const state = expectState(client);
    const pair = findFirstCombatPair(toDomainState(state.G), state.ctx.currentPlayer);
    expect(pair).toBeTruthy();
    if (!pair) return;

    const domainState = toDomainState(structuredClone(state.G) as RuntimeGameState);
    const declaration = declareCombatForPlayer(
      domainState,
      state.ctx.currentPlayer,
      pair.attacker,
      pair.defender,
    );
    expect(declaration.ok).toBe(true);
    expect(domainState.pendingCombats.length).toBeGreaterThan(0);

    const resolution = resolveNextCombatForPlayer(domainState, state.ctx.currentPlayer);
    expect(resolution.ok).toBe(true);
    expect(domainState.pendingCombats.length).toBe(0);
  });

  it('combat trusted slice does not treat controlled allied stacks as hostile defenders', () => {
    const client = createClient('0');
    runToMovement(client);
    client.moves.toCombatPhase?.();
    const state = expectState(client);
    const currentPlayer = state.ctx.currentPlayer;
    const domainState = toDomainState(state.G);

    const attacker = Object.values(state.G.units).find(
      (unit) =>
        unit.isAlive &&
        unit.count > 0 &&
        isCombatUnit(unit.unitType) &&
        canControlUnitForPlayer(domainState, currentPlayer, unit),
    );
    expect(attacker).toBeTruthy();
    if (!attacker) return;

    const alliedDefender = Object.values(state.G.units).find(
      (unit) =>
        unit.isAlive &&
        unit.count > 0 &&
        isCombatUnit(unit.unitType) &&
        unit.factionId !== attacker.factionId,
    );
    expect(alliedDefender).toBeTruthy();
    if (!alliedDefender) return;

    const adjacent = getNeighborCoords(
      domainState.hexMap,
      attacker.position.col,
      attacker.position.row,
    ).find((coord) =>
      !Object.values(state.G.units).some(
        (candidate) =>
          candidate.isAlive &&
          candidate.position.col === coord.col &&
          candidate.position.row === coord.row &&
          canControlUnitForPlayer(domainState, currentPlayer, candidate),
      ),
    );
    expect(adjacent).toBeTruthy();
    if (!adjacent) return;

    overrideGameState(client, (nextG) => {
      const alliedFaction = nextG.factions[alliedDefender.factionId];
      const alliedUnitState = nextG.units[alliedDefender.id];
      expect(alliedFaction).toBeTruthy();
      expect(alliedUnitState).toBeTruthy();
      if (!alliedFaction || !alliedUnitState) return nextG;
      nextG.factions[alliedDefender.factionId] = {
        ...alliedFaction,
        activationStatus: 'activated',
        controllingPlayerId: currentPlayer,
      };
      nextG.units[alliedDefender.id] = {
        ...alliedUnitState,
        position: { col: adjacent.col, row: adjacent.row },
      };
      return nextG;
    });

    const alliedState = expectState(client);
    const combatTargets = listCombatTargetsForHex(
      toDomainState(alliedState.G),
      currentPlayer,
      attacker.position,
    );
    expect(combatTargets).toEqual([]);

    client.moves.declareCombat?.(
      attacker.position.col,
      attacker.position.row,
      adjacent.col,
      adjacent.row,
    );
    const after = expectState(client);
    expect(after.G.pendingCombats).toHaveLength(0);
  });
});
