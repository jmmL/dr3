import { expect } from 'vitest';
import { runConformanceSuite } from '../harness';
import {
  isCombatUnit,
  isLeader,
  getCombatStrength,
  getTransportCapacity,
  getMovementType,
  getMonarchDeathEffect,
  getAmbassadorRecoveryTurns,
} from '@/engine/units/unit-helpers';

runConformanceSuite(
  'chunk_1_foundations/04_unit_types.json',
  (input, expected) => {
    const unitType = input.unit_type as string;

    if ('is_combat_unit' in expected) {
      expect(isCombatUnit(unitType)).toBe(expected.is_combat_unit);
    }

    if ('is_leader' in expected) {
      expect(isLeader(unitType)).toBe(expected.is_leader);
    }

    if ('combat_strength' in expected) {
      expect(getCombatStrength(unitType)).toBe(expected.combat_strength);
    }

    if ('transport_capacity' in expected) {
      expect(getTransportCapacity(unitType)).toBe(expected.transport_capacity);
    }

    if ('movement_type' in expected) {
      expect(getMovementType(unitType)).toBe(expected.movement_type);
    }

    if ('player_eliminated' in expected) {
      const monarchType = input.monarch_type as 'player' | 'non_player';
      const effect = getMonarchDeathEffect(monarchType);
      expect(effect.playerEliminated).toBe(expected.player_eliminated);
    }

    if ('kingdom_enters_confusion' in expected) {
      const monarchType = input.monarch_type as 'player' | 'non_player';
      const effect = getMonarchDeathEffect(monarchType);
      expect(effect.kingdomEntersConfusion).toBe(
        expected.kingdom_enters_confusion,
      );
    }

    if ('recovery_turns' in expected) {
      expect(getAmbassadorRecoveryTurns()).toBe(expected.recovery_turns);
    }
  },
);
