import { expect } from 'vitest';
import { runConformanceSuite } from '../harness';
import {
  getSameKingdomStackLimit,
  canSameKingdomShareHex,
  canAlliedPassThrough,
  canAlliedEndTurnTogether,
  canMercenaryStackWithFriendly,
  getMercenaryStackTransferPenalty,
  getFleetStackingRules,
  canEnterAlliedCastle,
  canDefendAlliedCastle,
  canStackInAlliedCastle,
  canInspectOpponentStack,
} from '@/engine/units/stacking';

runConformanceSuite(
  'chunk_6_supporting/24_stacking.json',
  (input, expected) => {
    if ('stack_limit' in expected) {
      expect(getSameKingdomStackLimit()).toBe(expected.stack_limit);
    }

    if ('hex_sharing_allowed' in expected) {
      expect(canSameKingdomShareHex()).toBe(expected.hex_sharing_allowed);
    }

    if ('pass_through_allowed' in expected) {
      expect(canAlliedPassThrough()).toBe(expected.pass_through_allowed);
    }

    if ('end_turn_allowed' in expected) {
      expect(canAlliedEndTurnTogether()).toBe(expected.end_turn_allowed);
    }

    if ('stacking_allowed' in expected && 'mercenary_unit' in input) {
      expect(canMercenaryStackWithFriendly()).toBe(expected.stacking_allowed);
    }

    if ('movement_penalty' in expected) {
      expect(getMercenaryStackTransferPenalty()).toBe(
        expected.movement_penalty,
      );
    }

    if ('stacking_rules' in expected) {
      expect(getFleetStackingRules()).toBe(expected.stacking_rules);
    }

    if ('entry_allowed' in expected && 'allied_castle' in input) {
      const present = input.allied_combat_units_present as number;
      expect(canEnterAlliedCastle(present)).toBe(expected.entry_allowed);
    }

    if ('defense_allowed' in expected && 'entry_allowed' in input) {
      const entryAllowed = input.entry_allowed as boolean;
      expect(canDefendAlliedCastle(entryAllowed)).toBe(
        expected.defense_allowed,
      );
    }

    if (
      'stacking_allowed' in expected &&
      'allied_castle' in input &&
      'allied_units_present' in input
    ) {
      const present = input.allied_units_present as boolean;
      expect(canStackInAlliedCastle(present)).toBe(expected.stacking_allowed);
    }

    if ('inspection_allowed' in expected) {
      expect(canInspectOpponentStack()).toBe(expected.inspection_allowed);
    }
  },
);
