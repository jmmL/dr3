import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Client } from 'boardgame.io/client';
import { loadHexMap } from '@/data/load-refs';
import { runCpuTurn } from '@/ai/cpu-bot';
import { DR3Game, toDomainState, type RuntimeGameState } from '@/game/dr3-game';
import {
  findAllLegalMovements,
  listLegalDestinationsForUnit,
  validateMoveUnitForPlayer,
} from '@/engine/domain/rules';
import {
  createSaveSnapshot,
  exportSave,
  importSave,
  loadGame,
  saveGame,
} from '@/persistence/save-load';
import { hexKey, type TurnStage } from '@/types';
import HexBoard from '@/ui/HexBoard';

const LOCAL_PLAYER_ID = '0';
const dr3Client = Client({ game: DR3Game, numPlayers: 2, playerID: LOCAL_PLAYER_ID, debug: false });
dr3Client.start();

const staticHexMap = loadHexMap();
const BOARD_HEXES = Array.from(staticHexMap.hexes.values()).map((hex) => ({
  col: hex.col,
  row: hex.row,
  terrain: [...hex.terrain],
}));

type Dr3ClientState = ReturnType<typeof dr3Client.getState>;
type AutomationWindow = Window &
  typeof globalThis & {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => Promise<void>;
  };
type LocalDr3Client = typeof dr3Client & {
  playerID?: string | null;
  updatePlayerID: (playerID: string | null) => void;
};

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
  const [pendingCombatConfirmation, setPendingCombatConfirmation] = useState(false);
  const pendingCombatConfirmationRef = useRef(false);

  useEffect(() => {
    return dr3Client.subscribe((state) => {
      setClientState(state);
    });
  }, []);

  const runtimeState = clientState?.G;
  const currentPlayerId = clientState?.ctx.currentPlayer ?? LOCAL_PLAYER_ID;
  const isLocalPlayersTurn = currentPlayerId === LOCAL_PLAYER_ID;
  const stage =
    (runtimeState?.stage ??
      (clientState?.ctx.phase as TurnStage | null) ??
      'rollEvents') as TurnStage;

  const selectedUnit = runtimeState && selectedUnitId ? runtimeState.units[selectedUnitId] : null;
  const legalDestinationKeys = useMemo(() => {
    if (!runtimeState || !isLocalPlayersTurn || stage !== 'movement' || !selectedUnitId) return new Set<string>();
    const legalDestinations = listLegalDestinationsForUnit(
      toDomainState(runtimeState),
      LOCAL_PLAYER_ID,
      selectedUnitId,
    );
    return new Set(legalDestinations.map((coord) => hexKey(coord.col, coord.row)));
  }, [runtimeState, isLocalPlayersTurn, stage, selectedUnitId]);
  const hasAnyLegalMovement = useMemo(() => {
    if (!runtimeState || !isLocalPlayersTurn || stage !== 'movement') return false;
    return findAllLegalMovements(toDomainState(runtimeState), LOCAL_PLAYER_ID).length > 0;
  }, [runtimeState, isLocalPlayersTurn, stage]);
  const recentLog = useMemo(
    () => (runtimeState?.log ?? []).slice(-16).reverse(),
    [runtimeState?.log],
  );

  useEffect(() => {
    setPendingCombatConfirmation(false);
    pendingCombatConfirmationRef.current = false;
  }, [stage, currentPlayerId]);

  async function withClientActingPlayer<T>(
    actingPlayerID: string,
    operation: () => Promise<T> | T,
  ): Promise<T> {
    const clientWithIdentity = dr3Client as unknown as LocalDr3Client;
    const previousPlayerID = clientWithIdentity.playerID ?? LOCAL_PLAYER_ID;
    clientWithIdentity.updatePlayerID(actingPlayerID);
    try {
      return await operation();
    } finally {
      clientWithIdentity.updatePlayerID(previousPlayerID);
    }
  }

  useEffect(() => {
    const automationWindow = window as AutomationWindow;
    const renderGameToText = (): string => {
      const aliveUnits = Object.values(runtimeState.units)
        .filter((unit) => unit.isAlive)
        .map((unit) => ({
          id: unit.id,
          factionId: unit.factionId,
          count: unit.count,
          movementRemaining: unit.movementRemaining,
          position: { col: unit.position.col, row: unit.position.row },
        }));

      return JSON.stringify({
        mode: 'playerTurn',
        coordinateSystem: 'hex col,row (0,0 at top-left; col increases right; row increases down)',
        stage,
        phase: clientState.ctx.phase,
        turn: clientState.ctx.turn,
        currentPlayerId,
        selectedUnitId,
        legalDestinations: selectedUnitId ? Array.from(legalDestinationKeys) : [],
        hasAnyLegalMovement,
        pendingCombatConfirmation,
        statusText,
        aliveUnits,
      });
    };

    const advanceTime = async (ms: number): Promise<void> => {
      const frames = Math.max(1, Math.round(ms / (1000 / 60)));
      for (let index = 0; index < frames; index += 1) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
    };

    automationWindow.render_game_to_text = renderGameToText;
    automationWindow.advanceTime = advanceTime;

    return () => {
      if (automationWindow.render_game_to_text === renderGameToText) {
        delete automationWindow.render_game_to_text;
      }
      if (automationWindow.advanceTime === advanceTime) {
        delete automationWindow.advanceTime;
      }
    };
  }, [
    runtimeState,
    stage,
    clientState.ctx.phase,
    clientState.ctx.turn,
    currentPlayerId,
    selectedUnitId,
    legalDestinationKeys,
    hasAnyLegalMovement,
    pendingCombatConfirmation,
    statusText,
  ]);

  function getDiplomacyTarget(): string | null {
    if (!runtimeState) return null;
    return (
      Object.keys(runtimeState.factions).find(
        (id) => id !== runtimeState.players[currentPlayerId]?.homeFactionId,
      ) ?? null
    );
  }

  function handleHexSelect(col: number, row: number): void {
    if (!runtimeState) return;
    if (!isLocalPlayersTurn) {
      setStatusText('Waiting for CPU turn.');
      return;
    }
    if (stage !== 'movement') {
      setStatusText('Movement is only available during the movement phase.');
      return;
    }
    if (!selectedUnitId) {
      setStatusText('Select a unit stack before choosing a destination hex.');
      return;
    }

    const check = validateMoveUnitForPlayer(
      toDomainState(runtimeState),
      LOCAL_PLAYER_ID,
      selectedUnitId,
      { col, row },
    );
    if (!check.ok) {
      setStatusText(`Illegal move: ${check.reason ?? 'invalid_destination'}.`);
      return;
    }

    const beforePosition = runtimeState.units[selectedUnitId]
      ? { ...runtimeState.units[selectedUnitId].position }
      : null;
    dr3Client.moves.moveUnit?.(selectedUnitId, col, row);
    const afterPosition = dr3Client.getState()?.G.units[selectedUnitId]?.position;
    if (
      !beforePosition ||
      !afterPosition ||
      (afterPosition.col === beforePosition.col && afterPosition.row === beforePosition.row)
    ) {
      setStatusText('Move rejected by active player rules.');
      return;
    }

    setPendingCombatConfirmation(false);
    const movementText = check.minimumMovementApplies
      ? 'minimum movement applied'
      : `cost ${check.terrainCost ?? 0} MP`;
    setStatusText(`Moved ${selectedUnitId} to ${afterPosition.col},${afterPosition.row} (${movementText}).`);
  }

  function handleToCombatPhase(): void {
    if (!isLocalPlayersTurn) {
      setStatusText('Waiting for CPU turn.');
      return;
    }
    if (stage !== 'movement') return;
    if (hasAnyLegalMovement && !pendingCombatConfirmationRef.current) {
      pendingCombatConfirmationRef.current = true;
      setPendingCombatConfirmation(true);
      setStatusText('Legal moves remain. Click To Combat again to confirm.');
      return;
    }

    pendingCombatConfirmationRef.current = false;
    setPendingCombatConfirmation(false);
    dr3Client.moves.toCombatPhase?.();
  }

  function handleSave(): void {
    if (!runtimeState) return;
    saveGame('slot-a', runtimeState);
    setStatusText('Saved to slot-a.');
  }

  function handleLoad(): void {
    const loaded = loadGame('slot-a');
    if (!loaded) {
      setStatusText('No save found in slot-a.');
      return;
    }
    void withClientActingPlayer(currentPlayerId, () => {
      dr3Client.moves.restoreSnapshot?.(loaded.state);
      const restoredStage = dr3Client.getState()?.G.stage;
      const didRestore = restoredStage === loaded.state.stage;
      setSelectedUnitId(null);
      pendingCombatConfirmationRef.current = false;
      setPendingCombatConfirmation(false);
      setStatusText(didRestore ? 'Loaded slot-a.' : 'Load failed for active player context.');
    });
  }

  function handleExport(): void {
    if (!runtimeState) return;
    const snapshot = createSaveSnapshot(runtimeState);
    downloadJson(`dr3-save-${Date.now()}.json`, exportSave(snapshot));
    setStatusText('Exported save file.');
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const payload = await file.text();
      const imported = importSave(payload);
      await withClientActingPlayer(currentPlayerId, () => {
        dr3Client.moves.restoreSnapshot?.(imported.state);
      });
      const restoredStage = dr3Client.getState()?.G.stage;
      const didRestore = restoredStage === imported.state.stage;
      setSelectedUnitId(null);
      pendingCombatConfirmationRef.current = false;
      setPendingCombatConfirmation(false);
      setStatusText(didRestore ? 'Imported save file.' : 'Import failed for active player context.');
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
    const steps = await withClientActingPlayer(currentPlayerId, () =>
      runCpuTurn(dr3Client, currentPlayerId),
    );
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
          legalDestinationKeys={legalDestinationKeys}
          onSelectUnit={(unitId) => {
            setSelectedUnitId(unitId);
            setPendingCombatConfirmation(false);
          }}
          onSelectHex={handleHexSelect}
        />

        <aside className="sidebar">
          <section className="panel">
            <h2>Turn</h2>
            <div className="kv"><span>Turn</span><strong>{clientState.ctx.turn}</strong></div>
            <div className="kv"><span>Player</span><strong data-testid="player-value">{currentPlayerId}</strong></div>
            <div className="kv"><span>Stage</span><strong data-testid="stage-value">{stage}</strong></div>
            <div className="status" data-testid="status-text">{statusText}</div>
          </section>

          <section className="panel">
            <h2>Actions</h2>
            <div className="actions">
              <button data-testid="btn-roll-event" onClick={() => dr3Client.moves.rollRandomEvent?.()} disabled={!isLocalPlayersTurn || stage !== 'rollEvents'}>
                Roll Event
              </button>
              <button data-testid="btn-draw-card" onClick={() => dr3Client.moves.drawDiplomacyCard?.()} disabled={!isLocalPlayersTurn || stage !== 'drawCard'}>
                Draw Card
              </button>
              <button
                data-testid="btn-diplomacy"
                onClick={() => {
                  const target = getDiplomacyTarget();
                  if (target) dr3Client.moves.conductDiplomacy?.(target, 'activate');
                }}
                disabled={!isLocalPlayersTurn || stage !== 'diplomacy'}
              >
                Conduct Diplomacy
              </button>
              <button data-testid="btn-resolve-sieges" onClick={() => dr3Client.moves.resolveSieges?.()} disabled={!isLocalPlayersTurn || stage !== 'siegeResolution'}>
                Resolve Sieges
              </button>
              <button data-testid="btn-to-combat" onClick={handleToCombatPhase} disabled={!isLocalPlayersTurn || stage !== 'movement'}>
                To Combat
              </button>
              <button data-testid="btn-end-turn" onClick={() => dr3Client.moves.endTurn?.()} disabled={!isLocalPlayersTurn || stage !== 'combat'}>
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
