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
    let handled = false;
    const unitType = input.unit_type as string;

    if ('is_combat_unit' in expected) {
      handled = true;
      expect(isCombatUnit(unitType)).toBe(expected.is_combat_unit);
    }

    if ('is_leader' in expected) {
      handled = true;
      expect(isLeader(unitType)).toBe(expected.is_leader);
    }

    if ('combat_strength' in expected) {
      handled = true;
      expect(getCombatStrength(unitType)).toBe(expected.combat_strength);
    }

    if ('transport_capacity' in expected) {
      handled = true;
      expect(getTransportCapacity(unitType)).toBe(expected.transport_capacity);
    }

    if ('movement_type' in expected) {
      handled = true;
      expect(getMovementType(unitType)).toBe(expected.movement_type);
    }

    if ('player_eliminated' in expected) {
      handled = true;
      const monarchType = input.monarch_type as 'player' | 'non_player';
      const effect = getMonarchDeathEffect(monarchType);
      expect(effect.playerEliminated).toBe(expected.player_eliminated);
    }

    if ('kingdom_enters_confusion' in expected) {
      handled = true;
      const monarchType = input.monarch_type as 'player' | 'non_player';
      const effect = getMonarchDeathEffect(monarchType);
      expect(effect.kingdomEntersConfusion).toBe(
        expected.kingdom_enters_confusion,
      );
    }

    if ('recovery_turns' in expected) {
      handled = true;
      expect(getAmbassadorRecoveryTurns()).toBe(expected.recovery_turns);
    }

    return handled;
  },
);
