import { describe, expect, it } from 'vitest';
import { Client } from 'boardgame.io/client';
import { DR3Game, toDomainState } from './dr3-game';
import { findFirstCombatPair, findFirstLegalMovement } from '@/engine/domain/rules';

function createClient() {
  const client = Client({ game: DR3Game, numPlayers: 2 });
  client.start();
  return client;
}

function getCurrentPlayerStage(client: ReturnType<typeof createClient>): string | null {
  const state = client.getState();
  if (!state) return null;
  return state.G.stage ?? null;
}

function runToMovement(client: ReturnType<typeof createClient>): void {
  const state = client.getState();
  if (!state) return;
  const targetFactionId = Object.keys(state.G.factions).find(
    (id) => id !== state.G.players[state.ctx.currentPlayer]?.homeFactionId,
  );
  if (!targetFactionId) return;
  client.moves.rollRandomEvent?.();
  client.moves.drawDiplomacyCard?.();
  client.moves.conductDiplomacy?.(targetFactionId, 'activate');
  client.moves.resolveSieges?.();
}

describe('DR3Game', () => {
  it('starts in rollEvents stage', () => {
    const client = createClient();
    expect(getCurrentPlayerStage(client)).toBe('rollEvents');
  });

  it('advances through early phases via move flow', () => {
    const client = createClient();
    client.moves.rollRandomEvent?.();
    expect(getCurrentPlayerStage(client)).toBe('drawCard');

    client.moves.drawDiplomacyCard?.();
    expect(getCurrentPlayerStage(client)).toBe('diplomacy');
  });

  it('moves a unit in movement stage when a legal move exists', () => {
    const client = createClient();
    runToMovement(client);
    expect(getCurrentPlayerStage(client)).toBe('movement');

    const state = client.getState();
    expect(state).toBeTruthy();
    if (!state) return;

    const legalMove = findFirstLegalMovement(
      toDomainState(state.G),
      state.ctx.currentPlayer,
    );
    if (!legalMove) {
      client.moves.toCombatPhase?.();
      expect(getCurrentPlayerStage(client)).toBe('combat');
      return;
    }

    const unitBefore = state.G.units[legalMove.unitId];
    expect(unitBefore).toBeTruthy();
    if (!unitBefore) return;
    const previousPosition = { ...unitBefore.position };

    client.moves.moveUnit?.(
      legalMove.unitId,
      legalMove.destination.col,
      legalMove.destination.row,
    );
    const nextState = client.getState();
    expect(nextState).toBeTruthy();
    if (!nextState) return;

    const unitAfter = nextState.G.units[legalMove.unitId];
    expect(unitAfter).toBeTruthy();
    if (!unitAfter) return;
    expect(unitAfter.position).toEqual(legalMove.destination);
    expect(unitAfter.position).not.toEqual(previousPosition);
  });

  it('handles combat declaration and resolution in combat stage', () => {
    const client = createClient();
    runToMovement(client);
    client.moves.toCombatPhase?.();
    expect(getCurrentPlayerStage(client)).toBe('combat');

    const state = client.getState();
    expect(state).toBeTruthy();
    if (!state) return;

    const pair = findFirstCombatPair(toDomainState(state.G), state.ctx.currentPlayer);
    if (!pair) {
      client.moves.endTurn?.();
      expect(client.getState()).toBeTruthy();
      return;
    }

    client.moves.declareCombat?.(
      pair.attacker.col,
      pair.attacker.row,
      pair.defender.col,
      pair.defender.row,
    );
    const withPending = client.getState();
    expect(withPending).toBeTruthy();
    expect(withPending?.G.pendingCombats.length).toBeGreaterThan(0);

    client.moves.resolveCombat?.();
    const resolved = client.getState();
    expect(resolved).toBeTruthy();
    expect(resolved?.G.log.length).toBeGreaterThan(0);
  });
});
