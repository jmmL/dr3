import { MCTSBot } from 'boardgame.io/ai';
import type { State } from 'boardgame.io';
import { DR3Game, type RuntimeGameState } from '@/game/dr3-game';

type CpuAction =
  | {
      type: 'MAKE_MOVE';
      payload: { type: string; args?: unknown[]; playerID: string };
    }
  | {
      type: 'GAME_EVENT';
      payload: { type: string; args?: unknown[]; playerID: string };
    };

export interface CpuClientLike {
  getState(): State<RuntimeGameState> | null;
  moves: Record<string, (...args: unknown[]) => void>;
}

export function createCpuBot(
  iterations: number = 60,
  playoutDepth: number = 8,
): MCTSBot {
  return new MCTSBot({
    game: DR3Game,
    enumerate: DR3Game.ai?.enumerate,
    iterations,
    playoutDepth,
    seed: 'dr3-cpu-seed',
  });
}

function isMoveAction(action: CpuAction): action is Extract<CpuAction, { type: 'MAKE_MOVE' }> {
  return action.type === 'MAKE_MOVE';
}

function runFallbackStep(
  client: CpuClientLike,
  state: State<RuntimeGameState>,
): boolean {
  const currentPlayer = state.ctx.currentPlayer;
  switch (state.G.stage) {
    case 'rollEvents':
      client.moves.rollRandomEvent?.();
      return true;
    case 'drawCard':
      client.moves.drawDiplomacyCard?.();
      return true;
    case 'diplomacy': {
      const targetFactionId = Object.keys(state.G.factions).find(
        (id) => id !== state.G.players[currentPlayer]?.homeFactionId,
      );
      if (!targetFactionId) return false;
      client.moves.conductDiplomacy?.(targetFactionId, 'activate');
      return true;
    }
    case 'siegeResolution':
      client.moves.resolveSieges?.();
      return true;
    case 'movement':
      client.moves.toCombatPhase?.();
      return true;
    case 'combat':
      if (state.G.pendingCombats.length > 0) {
        client.moves.resolveCombat?.();
      } else {
        client.moves.endTurn?.();
      }
      return true;
    default:
      return false;
  }
}

export async function runCpuTurn(
  client: CpuClientLike,
  playerID: string,
  maxSteps: number = 20,
): Promise<number> {
  const bot = createCpuBot();
  let steps = 0;

  while (steps < maxSteps) {
    const state = client.getState();
    if (!state) break;
    if (state.ctx.currentPlayer !== playerID) break;
    const stageBefore = state.G.stage;

    const played = await bot.play(state, playerID);
    const action = played.action as CpuAction;
    const fallbackActions = DR3Game.ai?.enumerate(state.G, state.ctx, playerID) ?? [];

    if (isMoveAction(action)) {
      const moveDispatch = client.moves[action.payload.type];
      if (moveDispatch) {
        moveDispatch(...(action.payload.args ?? []));
      }
    }

    const stateAfterBot = client.getState();
    if (!stateAfterBot || stateAfterBot.ctx.currentPlayer !== playerID) {
      steps += 1;
      continue;
    }

    if (stateAfterBot.G.stage === stageBefore) {
      const preferredFallback = fallbackActions.find(
        (candidate) =>
          'move' in candidate &&
          ((stageBefore === 'movement' && candidate.move === 'toCombatPhase') ||
            (stageBefore === 'combat' && candidate.move === 'endTurn')),
      );
      const fallback = preferredFallback ?? fallbackActions[0];
      if (fallback && 'move' in fallback) {
        const fallbackDispatch = client.moves[fallback.move];
        if (fallbackDispatch) {
          fallbackDispatch(...(fallback.args ?? []));
        }
      } else {
        runFallbackStep(client, stateAfterBot);
      }
    }

    steps += 1;
  }

  // Last-resort deterministic completion to keep CPU turns bounded in UI and tests.
  while (steps < maxSteps * 2) {
    const state = client.getState();
    if (!state) break;
    if (state.ctx.currentPlayer !== playerID) break;
    if (!runFallbackStep(client, state)) break;
    steps += 1;
  }

  return steps;
}
