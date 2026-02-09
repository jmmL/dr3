import { describe, expect, it } from 'vitest';
import { buildInitialGameState } from '@/engine/domain/setup';
import type { RuntimeGameState } from '@/game/dr3-game';
import {
  deleteSave,
  exportSave,
  importSave,
  listSaveMetadata,
  loadGame,
  saveGame,
} from './save-load';

class MemoryStorage {
  private readonly data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }
}

function toRuntimeState(): RuntimeGameState {
  const fullState = buildInitialGameState({ seed: 'save-seed' });
  const runtime = Object.fromEntries(
    Object.entries(fullState).filter(([key]) => key !== 'hexMap'),
  ) as RuntimeGameState;
  return runtime;
}

describe('save-load', () => {
  it('saves and loads game state for a slot', () => {
    const storage = new MemoryStorage();
    const state = toRuntimeState();

    saveGame('slot-a', state, storage);
    const loaded = loadGame('slot-a', storage);

    expect(loaded).toBeTruthy();
    expect(loaded?.state.seed).toBe(state.seed);
  });

  it('exports and imports a save payload', () => {
    const state = toRuntimeState();
    const saved = {
      schemaVersion: 1,
      savedAtIso: new Date().toISOString(),
      state,
    };

    const exported = exportSave(saved);
    const imported = importSave(exported);
    expect(imported.state.seed).toBe(state.seed);
  });

  it('deletes and lists save metadata', () => {
    const storage = new MemoryStorage();
    const state = toRuntimeState();

    saveGame('slot-a', state, storage);
    saveGame('slot-b', state, storage);
    deleteSave('slot-b', storage);

    const metadata = listSaveMetadata(['slot-a', 'slot-b'], storage);
    expect(metadata).toHaveLength(1);
    expect(metadata[0]?.slotId).toBe('slot-a');
  });
});
