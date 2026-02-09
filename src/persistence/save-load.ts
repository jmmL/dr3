import type { RuntimeGameState } from '@/game/dr3-game';

export const SAVE_SCHEMA_VERSION = 1;
const SAVE_KEY_PREFIX = 'dr3:save:';

export interface SaveMetadata {
  slotId: string;
  schemaVersion: number;
  savedAtIso: string;
}

export interface SavedGame {
  schemaVersion: number;
  savedAtIso: string;
  state: RuntimeGameState;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function saveKey(slotId: string): string {
  return `${SAVE_KEY_PREFIX}${slotId}`;
}

function assertValidSaveObject(value: unknown): asserts value is SavedGame {
  if (!value || typeof value !== 'object') {
    throw new Error('Invalid save payload.');
  }
  const candidate = value as Partial<SavedGame>;
  if (candidate.schemaVersion !== SAVE_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported save schema version ${String(candidate.schemaVersion)}.`,
    );
  }
  if (typeof candidate.savedAtIso !== 'string' || !candidate.state) {
    throw new Error('Malformed save payload.');
  }
}

export function createSaveSnapshot(state: RuntimeGameState): SavedGame {
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    savedAtIso: new Date().toISOString(),
    state,
  };
}

export function saveGame(
  slotId: string,
  state: RuntimeGameState,
  storage: StorageLike = localStorage,
): SavedGame {
  const snapshot = createSaveSnapshot(state);
  storage.setItem(saveKey(slotId), JSON.stringify(snapshot));
  return snapshot;
}

export function loadGame(
  slotId: string,
  storage: StorageLike = localStorage,
): SavedGame | null {
  const raw = storage.getItem(saveKey(slotId));
  if (!raw) return null;

  const parsed = JSON.parse(raw) as unknown;
  assertValidSaveObject(parsed);
  return parsed;
}

export function deleteSave(slotId: string, storage: StorageLike = localStorage): void {
  storage.removeItem(saveKey(slotId));
}

export function exportSave(snapshot: SavedGame): string {
  return JSON.stringify(snapshot, null, 2);
}

export function importSave(payload: string): SavedGame {
  const parsed = JSON.parse(payload) as unknown;
  assertValidSaveObject(parsed);
  return parsed;
}

export function listSaveMetadata(
  slotIds: string[],
  storage: StorageLike = localStorage,
): SaveMetadata[] {
  const metadata: SaveMetadata[] = [];
  for (const slotId of slotIds) {
    const saved = loadGame(slotId, storage);
    if (!saved) continue;
    metadata.push({
      slotId,
      schemaVersion: saved.schemaVersion,
      savedAtIso: saved.savedAtIso,
    });
  }
  return metadata;
}
