import type { Game } from 'boardgame.io';
import { INVALID_MOVE, TurnOrder } from 'boardgame.io/core';
import type { GameState, TurnStage } from '@/types';
import { loadHexMap } from '@/data/load-refs';
import { buildInitialGameState, type SetupOptions } from '@/engine/domain/setup';
import {
  conductDiplomacyForPlayer,
  declareCombatForPlayer,
  drawDiplomacyCardForPlayer,
  findFirstCombatPair,
  findFirstLegalMovement,
  hasAnyPendingCombats,
  moveUnitForPlayer,
  resolveNextCombatForPlayer,
  resolveSiegesForPlayer,
  rollRandomEventForPlayer,
  scoreVictoryPointsFromFactionState,
} from '@/engine/domain/rules';

export type DR3SetupData = SetupOptions;
export type RuntimeGameState = Omit<GameState, 'hexMap'>;

const STATIC_HEX_MAP = loadHexMap();

export function toDomainState(G: RuntimeGameState): GameState {
  return { ...G, hexMap: STATIC_HEX_MAP };
}

function transitionStage(G: RuntimeGameState, nextStage: TurnStage): void {
  G.stage = nextStage;
}

function ensureStage(G: RuntimeGameState, stage: TurnStage): boolean {
  return G.stage === stage;
}

export const DR3Game: Game<RuntimeGameState, Record<string, unknown>, DR3SetupData> = {
  name: 'dr3',
  setup: (_context, setupData) => {
    const initial = buildInitialGameState(setupData);
    const runtime = Object.fromEntries(
      Object.entries(initial).filter(([key]) => key !== 'hexMap'),
    ) as RuntimeGameState;
    return runtime;
  },
  disableUndo: false,
  moves: {
    rollRandomEvent: ({ G, playerID }) => {
      if (!ensureStage(G, 'rollEvents')) return INVALID_MOVE;
      const result = rollRandomEventForPlayer(toDomainState(G), playerID);
      if (!result.ok) return INVALID_MOVE;
      transitionStage(G, 'drawCard');
    },
    drawDiplomacyCard: ({ G, playerID }) => {
      if (!ensureStage(G, 'drawCard')) return INVALID_MOVE;
      const result = drawDiplomacyCardForPlayer(toDomainState(G), playerID);
      if (!result.ok) return INVALID_MOVE;
      transitionStage(G, 'diplomacy');
    },
    conductDiplomacy: ({ G, playerID }, factionId: string, action: 'activate' | 'deactivate' = 'activate') => {
      if (!ensureStage(G, 'diplomacy')) return INVALID_MOVE;
      const result = conductDiplomacyForPlayer(
        toDomainState(G),
        playerID,
        factionId,
        action,
      );
      if (!result.ok) return INVALID_MOVE;
      transitionStage(G, 'siegeResolution');
    },
    resolveSieges: ({ G, playerID }) => {
      if (!ensureStage(G, 'siegeResolution')) return INVALID_MOVE;
      const result = resolveSiegesForPlayer(toDomainState(G), playerID);
      if (!result.ok) return INVALID_MOVE;
      transitionStage(G, 'movement');
    },
    moveUnit: ({ G, playerID }, unitId: string, col: number, row: number) => {
      if (!ensureStage(G, 'movement')) return INVALID_MOVE;
      const result = moveUnitForPlayer(toDomainState(G), playerID, unitId, { col, row });
      if (!result.ok) return INVALID_MOVE;
    },
    toCombatPhase: ({ G }) => {
      if (!ensureStage(G, 'movement')) return INVALID_MOVE;
      transitionStage(G, 'combat');
    },
    declareCombat: ({ G, playerID }, attackerCol: number, attackerRow: number, defenderCol: number, defenderRow: number) => {
      if (!ensureStage(G, 'combat')) return INVALID_MOVE;
      const result = declareCombatForPlayer(
        toDomainState(G),
        playerID,
        { col: attackerCol, row: attackerRow },
        { col: defenderCol, row: defenderRow },
      );
      if (!result.ok) return INVALID_MOVE;
    },
    resolveCombat: ({ G, playerID }) => {
      if (!ensureStage(G, 'combat')) return INVALID_MOVE;
      const result = resolveNextCombatForPlayer(toDomainState(G), playerID);
      if (!result.ok) return INVALID_MOVE;
    },
    endTurn: ({ G, ctx }) => {
      if (!ensureStage(G, 'combat')) return INVALID_MOVE;
      const ctxEvents = (ctx as typeof ctx & { events?: { endTurn?: () => void } }).events;
      if (ctxEvents?.endTurn) {
        ctxEvents.endTurn();
      }
    },
  },
  turn: {
    order: TurnOrder.DEFAULT,
    onBegin: ({ G, ctx }) => {
      G.currentTurn = ctx.turn;
      G.phase = 'playerTurn';
      G.stage = 'rollEvents';
      G.activePlayerIndex = G.turnOrder.indexOf(ctx.currentPlayer);
      if (G.activePlayerIndex < 0) G.activePlayerIndex = 0;
      for (const unit of Object.values(G.units)) {
        if (unit.isAlive) {
          unit.movementRemaining = unit.movementPoints;
        }
      }
    },
  },
  endIf: ({ G }) => {
    if (G.currentTurn < G.maxTurns) return;
    const scores = scoreVictoryPointsFromFactionState(toDomainState(G));
    const ordered = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return { winner: ordered[0]?.[0] ?? null, scores };
  },
  events: {
    endTurn: true,
  },
  ai: {
    enumerate: (G, ctx, playerID) => {
      if (ctx.currentPlayer !== playerID) return [];
      const stage = G.stage;
      const domainState = toDomainState(G);

      if (stage === 'rollEvents') return [{ move: 'rollRandomEvent' }];
      if (stage === 'drawCard') return [{ move: 'drawDiplomacyCard' }];
      if (stage === 'diplomacy') {
        const targetFactionId = Object.keys(G.factions).find(
          (id) => id !== G.players[playerID]?.homeFactionId,
        );
        if (!targetFactionId) return [];
        return [{ move: 'conductDiplomacy', args: [targetFactionId, 'activate'] }];
      }
      if (stage === 'siegeResolution') return [{ move: 'resolveSieges' }];
      if (stage === 'movement') {
        const movement = findFirstLegalMovement(domainState, playerID);
        if (movement) {
          return [
            {
              move: 'moveUnit',
              args: [movement.unitId, movement.destination.col, movement.destination.row],
            },
            { move: 'toCombatPhase' },
          ];
        }
        return [{ move: 'toCombatPhase' }];
      }
      if (stage === 'combat') {
        if (hasAnyPendingCombats(domainState)) return [{ move: 'resolveCombat' }, { move: 'endTurn' }];
        const pair = findFirstCombatPair(domainState, playerID);
        if (pair) {
          return [
            {
              move: 'declareCombat',
              args: [pair.attacker.col, pair.attacker.row, pair.defender.col, pair.defender.row],
            },
            { move: 'endTurn' },
          ];
        }
        return [{ move: 'endTurn' }];
      }

      return [];
    },
  },
};
