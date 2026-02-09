import { expect } from 'vitest';
import { runConformanceSuite } from '../harness';
import {
  getTerrainMovementCost,
  getEffectiveTerrain,
  mustStopInTerrain,
  hasHomeKingdomBonus,
  type TerrainAbilities,
} from '@/engine/map/terrain';

runConformanceSuite(
  'chunk_1_foundations/06_terrain_capabilities.json',
  (input, expected) => {
    const abilities: TerrainAbilities = {
      hasTreeSymbol: (input.unit_has_tree_symbol as boolean) ?? false,
      hasMountainSymbol: (input.unit_has_mountain_symbol as boolean) ?? false,
    };

    if ('effective_terrain' in expected && 'terrain' in input) {
      const terrain = input.terrain as string;
      expect(getEffectiveTerrain(terrain, abilities)).toBe(
        expected.effective_terrain,
      );
    }

    if ('movement_cost' in expected && 'terrain' in input) {
      const terrain = input.terrain as string;
      expect(getTerrainMovementCost(terrain, abilities)).toBe(
        expected.movement_cost,
      );
    }

    if ('must_stop' in expected && 'terrain' in input) {
      const terrain = input.terrain as string;
      expect(mustStopInTerrain(terrain, abilities)).toBe(expected.must_stop);
    }

    if ('has_home_kingdom_bonus' in expected) {
      const unitType = input.unit_type as string;
      const inHome = input.in_home_kingdom as boolean;
      expect(hasHomeKingdomBonus(unitType, inHome)).toBe(
        expected.has_home_kingdom_bonus,
      );
    }

    if ('effective_tree_symbol' in expected) {
      const unitType = input.unit_type as string;
      const inHome = input.in_home_kingdom as boolean;
      const hasBonus = hasHomeKingdomBonus(unitType, inHome);
      expect(hasBonus).toBe(expected.effective_tree_symbol);
      expect(hasBonus).toBe(expected.effective_mountain_symbol);
    }
  },
);
