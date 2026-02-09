import { describe, expect, it } from 'vitest';
import { buildInitialGameState } from './setup';
import {
  conductDiplomacyForPlayer,
  drawDiplomacyCardForPlayer,
  findFirstLegalMovement,
  moveUnitForPlayer,
  resolveSiegesForPlayer,
  rollRandomEventForPlayer,
  setStage,
} from './rules';

describe('domain rules', () => {
  it('executes early turn stage actions', () => {
    const state = buildInitialGameState({ seed: 'rules-seed' });
    const playerID = state.turnOrder[0]!;

    const randomEvent = rollRandomEventForPlayer(state, playerID);
    expect(randomEvent.ok).toBe(true);

    setStage(state, 'drawCard');
    const draw = drawDiplomacyCardForPlayer(state, playerID);
    expect(draw.ok).toBe(true);

    setStage(state, 'diplomacy');
    const targetFaction = Object.keys(state.factions).find(
      (id) => id !== state.players[playerID]?.homeFactionId,
    );
    expect(targetFaction).toBeTruthy();
    if (!targetFaction) return;

    const diplomacy = conductDiplomacyForPlayer(state, playerID, targetFaction, 'activate');
    expect(diplomacy.ok).toBe(true);

    setStage(state, 'siegeResolution');
    const sieges = resolveSiegesForPlayer(state, playerID);
    expect(sieges.ok).toBe(true);
  });

  it('moves a unit when a legal move exists', () => {
    const state = buildInitialGameState({ seed: 'move-seed' });
    const playerID = state.turnOrder[0]!;
    setStage(state, 'movement');

    const move = findFirstLegalMovement(state, playerID);
    if (!move) {
      expect(move).toBeNull();
      return;
    }

    const unitBefore = state.units[move.unitId];
    expect(unitBefore).toBeTruthy();
    if (!unitBefore) return;
    const before = { ...unitBefore.position };
    const result = moveUnitForPlayer(state, playerID, move.unitId, move.destination);
    expect(result.ok).toBe(true);
    const unitAfter = state.units[move.unitId];
    expect(unitAfter).toBeTruthy();
    if (!unitAfter) return;
    expect(unitAfter.position).not.toEqual(before);
  });
});
