import { expect } from 'vitest';
import { runConformanceSuite } from '../harness';
import { isFriendlyLocation } from '@/engine/units/faction-helpers';

runConformanceSuite(
  'chunk_6_supporting/10_friendly_location.json',
  (input, expected) => {
    if ('friendly' in expected) {
      const result = isFriendlyLocation({
        locationKingdom: input.location_kingdom as string | undefined,
        playerKingdom: input.player_kingdom as string | undefined,
        alliedKingdoms: input.allied_kingdoms as string[] | undefined,
        plundered: input.plundered as boolean | undefined,
        friendlyCombatUnitsPresent: input.friendly_combat_units_present as
          | number
          | undefined,
      });
      expect(result).toBe(expected.friendly);
    }
  },
);
