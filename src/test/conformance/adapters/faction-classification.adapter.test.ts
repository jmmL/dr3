import { expect } from 'vitest';
import { runConformanceSuite } from '../harness';
import {
  getFactionClassification,
  getUnitClassification,
  getRetreatSuccessRolls,
  isRetreatSuccessful,
} from '@/engine/units/faction-helpers';

runConformanceSuite(
  'chunk_1_foundations/05_faction_classification.json',
  (input, expected) => {
    // Faction classification tests
    if ('faction' in input && 'classification' in expected) {
      const faction = input.faction as string;
      expect(getFactionClassification(faction)).toBe(expected.classification);
    }

    // Unit type classification (mercenaries)
    if ('unit_type' in input && 'classification' in expected) {
      const unitType = input.unit_type as string;
      expect(getUnitClassification(unitType)).toBe(expected.classification);
    }

    // Retreat success rolls
    if ('classification' in input && 'retreat_success_rolls' in expected) {
      const classification = input.classification as 'human' | 'non_human';
      expect(getRetreatSuccessRolls(classification)).toEqual(
        expected.retreat_success_rolls,
      );
    }

    // Retreat roll tests
    if ('retreat_roll' in input && 'retreat_successful' in expected) {
      const classification = input.classification as 'human' | 'non_human';
      const roll = input.retreat_roll as number;
      expect(isRetreatSuccessful(classification, roll)).toBe(
        expected.retreat_successful,
      );
    }

    // Mercenary retreat rolls
    if ('unit_type' in input && 'retreat_success_rolls' in expected) {
      expect(getRetreatSuccessRolls('human')).toEqual(
        expected.retreat_success_rolls,
      );
    }
  },
);
