import { describe, expect, it } from 'vitest';
import { Client } from 'boardgame.io/client';
import { DR3Game } from '@/game/dr3-game';
import { runCpuTurn } from './cpu-bot';

function createClient() {
  const client = Client({ game: DR3Game, numPlayers: 2, playerID: '0' });
  client.start();
  return client;
}

describe('cpu-bot', () => {
  it('plays a full CPU turn with boardgame.io bot APIs', async () => {
    const client = createClient();

    const before = client.getState();
    expect(before?.ctx.currentPlayer).toBe('0');
    const beforeLogLength = before?.G.log.length ?? 0;

    const steps = await runCpuTurn(client, '0');
    expect(steps).toBeGreaterThan(0);

    const after = client.getState();
    expect(after).toBeTruthy();
    expect((after?.G.log.length ?? 0) > beforeLogLength).toBe(true);
  }, 20_000);
});
