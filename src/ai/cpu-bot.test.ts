import { describe, expect, it, vi } from 'vitest';
import { Client } from 'boardgame.io/client';
import { MCTSBot } from 'boardgame.io/ai';
import type { State } from 'boardgame.io';
import { DR3Game, type RuntimeGameState } from '@/game/dr3-game';
import * as cpuBot from './cpu-bot';

function createClient() {
  const client = Client({ game: DR3Game, numPlayers: 2, playerID: '0' });
  client.start();
  return client;
}

describe('cpu-bot', () => {
  it('createCpuBot returns a working MCTS bot that can pick an action', async () => {
    const client = createClient();
    const state = client.getState();
    expect(state).toBeTruthy();

    const bot = cpuBot.createCpuBot(10, 4);
    expect(bot).toBeInstanceOf(MCTSBot);

    const result = await bot.play(state as State<RuntimeGameState>, '0');
    expect(result).toBeTruthy();
    expect(result.action).toBeTruthy();
  }, 40_000);

  it('plays a full CPU turn with boardgame.io bot APIs', async () => {
    const client = createClient();

    const before = client.getState();
    expect(before?.ctx.currentPlayer).toBe('0');
    const beforeLogLength = before?.G.log.length ?? 0;

    const steps = await cpuBot.runCpuTurn(client, '0', 8);
    expect(steps).toBeGreaterThan(0);

    const after = client.getState();
    expect(after).toBeTruthy();
    expect((after?.G.log.length ?? 0) > beforeLogLength).toBe(true);
  }, 40_000);

  it('recomputes fallback from post-move state in combat (no stale redeclare)', async () => {
    const enumerateSpy = vi
      .spyOn(DR3Game.ai!, 'enumerate')
      .mockImplementation((G) => {
        if (G.stage !== 'combat') return [];
        if (G.pendingCombats.length > 0) return [{ move: 'resolveCombat' }];
        return [{ move: 'declareCombat' }, { move: 'endTurn' }];
      });
    const scriptedBot: cpuBot.CpuBotLike = {
      play: vi.fn(async () => ({
        action: {
          type: 'MAKE_MOVE',
          payload: {
            type: 'declareCombat',
            args: [1, 1, 1, 2],
            playerID: '0',
          },
        },
      })),
    };

    try {
      const fakeState = {
        G: {
          stage: 'combat',
          pendingCombats: [] as Array<{ attackerHex: unknown; defenderHex: unknown }>,
        },
        ctx: {
          currentPlayer: '0',
          phase: 'combat',
        },
      } as unknown as State<RuntimeGameState>;

      const counters = {
        declared: 0,
        resolved: 0,
      };
      const client: cpuBot.CpuClientLike = {
        getState: () => fakeState,
        moves: {
          declareCombat: () => {
            counters.declared += 1;
            fakeState.G.pendingCombats.push({
              attackerHex: { col: 1, row: 1 },
              defenderHex: { col: 1, row: 2 },
            } as never);
          },
          resolveCombat: () => {
            if (fakeState.G.pendingCombats.length > 0) {
              counters.resolved += 1;
              fakeState.G.pendingCombats.shift();
            }
          },
          endTurn: () => {
            fakeState.ctx.currentPlayer = '1';
          },
        },
      };

      await cpuBot.runCpuTurn(client, '0', 1, scriptedBot);
      expect(counters.declared).toBe(1);
      expect(counters.resolved).toBe(1);
      expect(scriptedBot.play).toHaveBeenCalledTimes(1);
    } finally {
      enumerateSpy.mockRestore();
    }
  });
});
