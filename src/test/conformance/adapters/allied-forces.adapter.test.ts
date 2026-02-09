import { expect } from 'vitest';
import { runConformanceSuite } from '../harness';
import {
  getAlliedForceMovementControl,
  canAlliedForcesStackEndTurn,
  canAlliedForcesCoordinate,
  canEnterAlliedCastleForces,
  canMercenaryStackWithFriendlyForces,
} from '@/engine/units/faction-helpers';

runConformanceSuite(
  'chunk_6_supporting/16_allied_forces.json',
  (input, expected) => {
    if ('movement_control' in expected) {
      const owner = input.allied_force_owner as string;
      expect(getAlliedForceMovementControl(owner)).toBe(
        expected.movement_control,
      );
    }

    if ('stacking_allowed' in expected && 'allied_kingdom' in input) {
      const k1 = input.allied_kingdom as string;
      const k2 = input.other_kingdom as string;
      expect(canAlliedForcesStackEndTurn(k1, k2)).toBe(
        expected.stacking_allowed,
      );
    }

    if ('coordination_allowed' in expected) {
      expect(canAlliedForcesCoordinate()).toBe(expected.coordination_allowed);
    }

    if ('entry_allowed' in expected && 'castle_owner' in input) {
      const present = input.allied_combat_units_present as number;
      const result = canEnterAlliedCastleForces(present);
      expect(result.entryAllowed).toBe(expected.entry_allowed);
      if ('defense_allowed' in expected) {
        expect(result.defenseAllowed).toBe(expected.defense_allowed);
      }
    }

    if ('stacking_allowed' in expected && 'mercenary_unit' in input) {
      expect(canMercenaryStackWithFriendlyForces()).toBe(
        expected.stacking_allowed,
      );
    }
  },
);
