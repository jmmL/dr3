import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Client } from 'boardgame.io/client';
import { loadHexMap } from '@/data/load-refs';
import { runCpuTurn } from '@/ai/cpu-bot';
import { DR3Game } from '@/game/dr3-game';
import {
  createSaveSnapshot,
  exportSave,
  importSave,
  loadGame,
  saveGame,
} from '@/persistence/save-load';
import HexBoard from '@/ui/HexBoard';

const dr3Client = Client({ game: DR3Game, numPlayers: 2, playerID: '0', debug: false });
dr3Client.start();

const staticHexMap = loadHexMap();
const BOARD_HEXES = Array.from(staticHexMap.hexes.values()).map((hex) => ({
  col: hex.col,
  row: hex.row,
  terrain: [...hex.terrain],
}));

type Dr3ClientState = ReturnType<typeof dr3Client.getState>;

function downloadJson(filename: string, payload: string): void {
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [clientState, setClientState] = useState<Dr3ClientState>(dr3Client.getState());
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>('Ready.');

  useEffect(() => {
    return dr3Client.subscribe((state) => {
      setClientState(state);
    });
  }, []);

  const runtimeState = clientState?.G;
  const currentPlayerId = clientState?.ctx.currentPlayer ?? '0';
  const stage = runtimeState?.stage ?? 'rollEvents';

  const selectedUnit = runtimeState && selectedUnitId ? runtimeState.units[selectedUnitId] : null;
  const recentLog = useMemo(
    () => (runtimeState?.log ?? []).slice(-16).reverse(),
    [runtimeState?.log],
  );

  function getDiplomacyTarget(): string | null {
    if (!runtimeState) return null;
    return (
      Object.keys(runtimeState.factions).find(
        (id) => id !== runtimeState.players[currentPlayerId]?.homeFactionId,
      ) ?? null
    );
  }

  function handleHexSelect(col: number, row: number): void {
    if (!runtimeState || stage !== 'movement' || !selectedUnitId) return;
    dr3Client.moves.moveUnit?.(selectedUnitId, col, row);
  }

  function handleSave(): void {
    if (!runtimeState) return;
    saveGame('slot-a', runtimeState);
    setStatusText('Saved to slot-a.');
  }

  function handleLoad(): void {
    if (!clientState) return;
    const loaded = loadGame('slot-a');
    if (!loaded) {
      setStatusText('No save found in slot-a.');
      return;
    }
    const clientWithOverride = dr3Client as unknown as {
      overrideGameState: (state: unknown) => void;
    };
    clientWithOverride.overrideGameState({
      ...clientState,
      G: loaded.state,
    });
    setStatusText('Loaded slot-a.');
  }

  function handleExport(): void {
    if (!runtimeState) return;
    const snapshot = createSaveSnapshot(runtimeState);
    downloadJson(`dr3-save-${Date.now()}.json`, exportSave(snapshot));
    setStatusText('Exported save file.');
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    if (!clientState) return;
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const payload = await file.text();
      const imported = importSave(payload);
      const clientWithOverride = dr3Client as unknown as {
        overrideGameState: (state: unknown) => void;
      };
      clientWithOverride.overrideGameState({
        ...clientState,
        G: imported.state,
      });
      setStatusText('Imported save file.');
    } catch (error) {
      setStatusText(
        error instanceof Error ? `Import failed: ${error.message}` : 'Import failed.',
      );
    } finally {
      event.target.value = '';
    }
  }

  async function handleCpuTurn(): Promise<void> {
    if (!runtimeState) return;
    const steps = await runCpuTurn(dr3Client, currentPlayerId);
    setStatusText(`CPU executed ${steps} actions.`);
  }

  if (!runtimeState || !clientState) {
    return <div className="app-root">Loading game...</div>;
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Divine Right 3</h1>
        <p>Single-player prototype aligned to conformance-first engine rules.</p>
      </header>

      <main className="layout">
        <HexBoard
          state={runtimeState}
          hexes={BOARD_HEXES}
          currentPlayerId={currentPlayerId}
          selectedUnitId={selectedUnitId}
          onSelectUnit={setSelectedUnitId}
          onSelectHex={handleHexSelect}
        />

        <aside className="sidebar">
          <section className="panel">
            <h2>Turn</h2>
            <div className="kv"><span>Turn</span><strong>{clientState.ctx.turn}</strong></div>
            <div className="kv"><span>Player</span><strong>{currentPlayerId}</strong></div>
            <div className="kv"><span>Stage</span><strong data-testid="stage-value">{stage}</strong></div>
            <div className="status" data-testid="status-text">{statusText}</div>
          </section>

          <section className="panel">
            <h2>Actions</h2>
            <div className="actions">
              <button data-testid="btn-roll-event" onClick={() => dr3Client.moves.rollRandomEvent?.()} disabled={stage !== 'rollEvents'}>
                Roll Event
              </button>
              <button data-testid="btn-draw-card" onClick={() => dr3Client.moves.drawDiplomacyCard?.()} disabled={stage !== 'drawCard'}>
                Draw Card
              </button>
              <button
                data-testid="btn-diplomacy"
                onClick={() => {
                  const target = getDiplomacyTarget();
                  if (target) dr3Client.moves.conductDiplomacy?.(target, 'activate');
                }}
                disabled={stage !== 'diplomacy'}
              >
                Conduct Diplomacy
              </button>
              <button data-testid="btn-resolve-sieges" onClick={() => dr3Client.moves.resolveSieges?.()} disabled={stage !== 'siegeResolution'}>
                Resolve Sieges
              </button>
              <button data-testid="btn-to-combat" onClick={() => dr3Client.moves.toCombatPhase?.()} disabled={stage !== 'movement'}>
                To Combat
              </button>
              <button data-testid="btn-end-turn" onClick={() => dr3Client.moves.endTurn?.()} disabled={stage !== 'combat'}>
                End Turn
              </button>
              <button data-testid="btn-run-cpu" onClick={handleCpuTurn}>Run CPU</button>
            </div>
          </section>

          <section className="panel">
            <h2>Save/Load</h2>
            <div className="actions">
              <button data-testid="btn-save" onClick={handleSave}>Save Slot A</button>
              <button data-testid="btn-load" onClick={handleLoad}>Load Slot A</button>
              <button data-testid="btn-export" onClick={handleExport}>Export JSON</button>
              <label className="file-label" data-testid="import-label">
                Import JSON
                <input data-testid="file-import" type="file" accept="application/json" onChange={handleImport} />
              </label>
            </div>
          </section>

          <section className="panel">
            <h2>Selection</h2>
            {selectedUnit ? (
              <div className="selection">
                <div className="kv"><span>Unit</span><strong>{selectedUnit.id}</strong></div>
                <div className="kv"><span>Faction</span><strong>{selectedUnit.factionId}</strong></div>
                <div className="kv"><span>Count</span><strong>{selectedUnit.count}</strong></div>
                <div className="kv"><span>MP</span><strong>{selectedUnit.movementRemaining}</strong></div>
              </div>
            ) : (
              <p className="muted">Select a unit stack from the board.</p>
            )}
          </section>

          <section className="panel">
            <h2>Turn Log</h2>
            <ol className="turn-log">
              {recentLog.map((entry, index) => (
                <li key={`${index}-${entry}`}>{entry}</li>
              ))}
            </ol>
          </section>
        </aside>
      </main>
    </div>
  );
}
