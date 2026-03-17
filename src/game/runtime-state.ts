import type { RuntimeGameState, TurnStage } from '@/types';

const TURN_STAGES: TurnStage[] = [
  'rollEvents',
  'drawCard',
  'diplomacy',
  'siegeResolution',
  'movement',
  'combat',
];

function assertRecord(
  value: unknown,
  label: string,
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
}

function assertString(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(`${label} must be a string.`);
  }
}

function assertBoolean(value: unknown, label: string): asserts value is boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`${label} must be a boolean.`);
  }
}

function assertNumber(value: unknown, label: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`);
  }
}

function assertStringArray(value: unknown, label: string): asserts value is string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    throw new Error(`${label} must be an array of strings.`);
  }
}

function assertCoord(value: unknown, label: string): void {
  assertRecord(value, label);
  assertNumber(value.col, `${label}.col`);
  assertNumber(value.row, `${label}.row`);
}

function assertTurnStage(value: unknown, label: string): asserts value is TurnStage {
  if (typeof value !== 'string' || !TURN_STAGES.includes(value as TurnStage)) {
    throw new Error(`${label} must be a valid turn stage.`);
  }
}

function assertPlayerRecord(value: unknown, label: string): void {
  assertRecord(value, label);
  for (const [playerId, player] of Object.entries(value)) {
    assertRecord(player, `${label}.${playerId}`);
    assertString(player.id, `${label}.${playerId}.id`);
    assertString(player.homeFactionId, `${label}.${playerId}.homeFactionId`);
    assertBoolean(player.isHuman, `${label}.${playerId}.isHuman`);
  }
}

function assertUnitRecord(value: unknown, label: string): void {
  assertRecord(value, label);
  for (const [unitId, unit] of Object.entries(value)) {
    assertRecord(unit, `${label}.${unitId}`);
    assertString(unit.id, `${label}.${unitId}.id`);
    assertString(unit.definitionId, `${label}.${unitId}.definitionId`);
    assertString(unit.factionId, `${label}.${unitId}.factionId`);
    assertString(unit.unitType, `${label}.${unitId}.unitType`);
    assertCoord(unit.position, `${label}.${unitId}.position`);
    assertNumber(unit.movementPoints, `${label}.${unitId}.movementPoints`);
    assertNumber(unit.movementRemaining, `${label}.${unitId}.movementRemaining`);
    assertStringArray(unit.abilities, `${label}.${unitId}.abilities`);
    assertString(unit.movementType, `${label}.${unitId}.movementType`);
    assertNumber(unit.count, `${label}.${unitId}.count`);
    assertBoolean(unit.isMercenary, `${label}.${unitId}.isMercenary`);
    assertBoolean(unit.isAlive, `${label}.${unitId}.isAlive`);
    if (unit.cityId !== null) {
      assertString(unit.cityId, `${label}.${unitId}.cityId`);
    }
  }
}

function assertFactionRecord(value: unknown, label: string): void {
  assertRecord(value, label);
  for (const [factionId, faction] of Object.entries(value)) {
    assertRecord(faction, `${label}.${factionId}`);
    assertString(faction.id, `${label}.${factionId}.id`);
    assertString(faction.activationStatus, `${label}.${factionId}.activationStatus`);
    if (faction.controllingPlayerId !== null) {
      assertString(
        faction.controllingPlayerId,
        `${label}.${factionId}.controllingPlayerId`,
      );
    }
    if (faction.personalityCardId !== null) {
      assertNumber(faction.personalityCardId, `${label}.${factionId}.personalityCardId`);
    }
    assertBoolean(faction.monarchAlive, `${label}.${factionId}.monarchAlive`);
    assertBoolean(faction.ambassadorAlive, `${label}.${factionId}.ambassadorAlive`);
    if (faction.ambassadorBanishedUntilTurn !== null) {
      assertNumber(
        faction.ambassadorBanishedUntilTurn,
        `${label}.${factionId}.ambassadorBanishedUntilTurn`,
      );
    }
    assertNumber(faction.diplomacyPenalty, `${label}.${factionId}.diplomacyPenalty`);
    assertStringArray(faction.castlesOwned, `${label}.${factionId}.castlesOwned`);
    assertNumber(faction.victoryPoints, `${label}.${factionId}.victoryPoints`);
  }
}

function assertDiplomacyDeck(value: unknown, label: string): void {
  assertRecord(value, label);
  assertStringArray(value.drawPile, `${label}.drawPile`);
  assertStringArray(value.discardPile, `${label}.discardPile`);
  assertRecord(value.playerHands, `${label}.playerHands`);
  for (const [playerId, hand] of Object.entries(value.playerHands)) {
    assertStringArray(hand, `${label}.playerHands.${playerId}`);
  }
}

function assertSieges(value: unknown, label: string): void {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }
  value.forEach((siege, index) => {
    const itemLabel = `${label}[${index}]`;
    assertRecord(siege, itemLabel);
    assertCoord(siege.hex, `${itemLabel}.hex`);
    assertString(siege.cityId, `${itemLabel}.cityId`);
    assertString(siege.besiegingFactionId, `${itemLabel}.besiegingFactionId`);
    assertStringArray(siege.besiegingUnitIds, `${itemLabel}.besiegingUnitIds`);
    assertString(siege.defendingFactionId, `${itemLabel}.defendingFactionId`);
    assertStringArray(siege.defendingUnitIds, `${itemLabel}.defendingUnitIds`);
    assertNumber(siege.turnsUnderSiege, `${itemLabel}.turnsUnderSiege`);
    assertBoolean(siege.isPlundered, `${itemLabel}.isPlundered`);
  });
}

function assertPendingCombats(value: unknown, label: string): void {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }
  value.forEach((combat, index) => {
    const itemLabel = `${label}[${index}]`;
    assertRecord(combat, itemLabel);
    assertCoord(combat.attackerHex, `${itemLabel}.attackerHex`);
    assertCoord(combat.defenderHex, `${itemLabel}.defenderHex`);
    assertString(combat.declaredByPlayerId, `${itemLabel}.declaredByPlayerId`);
  });
}

export function assertValidRuntimeGameState(
  value: unknown,
): asserts value is RuntimeGameState {
  assertRecord(value, 'state');
  assertUnitRecord(value.units, 'state.units');
  assertFactionRecord(value.factions, 'state.factions');
  assertPlayerRecord(value.players, 'state.players');
  assertDiplomacyDeck(value.diplomacyDeck, 'state.diplomacyDeck');
  assertSieges(value.sieges, 'state.sieges');
  assertNumber(value.currentTurn, 'state.currentTurn');
  assertNumber(value.maxTurns, 'state.maxTurns');
  assertStringArray(value.turnOrder, 'state.turnOrder');
  assertNumber(value.activePlayerIndex, 'state.activePlayerIndex');
  assertTurnStage(value.stage, 'state.stage');
  assertPendingCombats(value.pendingCombats, 'state.pendingCombats');
  assertStringArray(value.log, 'state.log');
  assertString(value.seed, 'state.seed');
  if (!Array.isArray(value.rngState) || value.rngState.some((entry) => typeof entry !== 'number')) {
    throw new Error('state.rngState must be an array of numbers.');
  }
}
