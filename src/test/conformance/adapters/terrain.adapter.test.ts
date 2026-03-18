import { expect } from 'vitest';
import { runConformanceSuite } from '../harness';
import {
  getBaseTerrainCost,
  getTerrainMovementCost,
  mustStopInTerrain,
  mustStopInCumulativeTerrain,
  calculateCumulativeTerrainCost,
  getTerrainCombatModifier,
  getEffectiveCombatValue,
  canCrossHexside,
  canEnterTerrain,
  getTerrainAccess,
  canCrossMajorRiver,
  type TerrainAbilities,
} from '@/engine/map/terrain';

runConformanceSuite(
  'chunk_1_foundations/19_terrain.json',
  (input, expected) => {
    let handled = false;
    const rawTerrain = input.terrain;
    const abilities: TerrainAbilities = {
      hasTreeSymbol: (input.unit_has_tree_symbol as boolean) ?? false,
      hasMountainSymbol: (input.unit_has_mountain_symbol as boolean) ?? false,
    };

    // Cumulative terrain (array of terrains)
    if (Array.isArray(rawTerrain)) {
      const terrains = rawTerrain as string[];

      if ('movement_cost' in expected) {
        handled = true;
        expect(calculateCumulativeTerrainCost(terrains, abilities)).toBe(
          expected.movement_cost,
        );
      }

      if ('must_stop' in expected) {
        handled = true;
        expect(mustStopInCumulativeTerrain(terrains, abilities)).toBe(
          expected.must_stop,
        );
      }
      return handled;
    }

    const terrain = rawTerrain as string;

    // Simple movement cost
    if ('movement_cost' in expected && !('combat_role' in input)) {
      handled = true;
      if (input.unit_has_tree_symbol || input.unit_has_mountain_symbol) {
        expect(getTerrainMovementCost(terrain, abilities)).toBe(
          expected.movement_cost,
        );
      } else if ('crossing_major_river' in input) {
        expect(getBaseTerrainCost(terrain)).toBe(expected.movement_cost);
      } else {
        expect(getBaseTerrainCost(terrain)).toBe(expected.movement_cost);
      }
    }

    // Must stop
    if ('must_stop' in expected) {
      handled = true;
      expect(mustStopInTerrain(terrain, abilities)).toBe(expected.must_stop);
    }

    // Combat modifier (defender bonus)
    if ('combat_modifier' in expected) {
      handled = true;
      const role = input.combat_role as 'attacker' | 'defender';
      expect(getTerrainCombatModifier(terrain, role)).toBe(
        expected.combat_modifier,
      );
    }

    // Effective combat value (mountain pass doubles)
    if ('effective_combat_value' in expected) {
      handled = true;
      const role = input.combat_role as 'attacker' | 'defender';
      const baseValue = input.base_combat_value as number;
      expect(getEffectiveCombatValue(terrain, role, baseValue)).toBe(
        expected.effective_combat_value,
      );
    }

    // Hexside crossing
    if ('crossing_allowed' in expected && 'hexside_type' in input) {
      handled = true;
      const unitCat = input.unit_type as 'land' | 'fleet';
      const hexside = input.hexside_type as string;
      expect(canCrossHexside(unitCat, hexside)).toBe(
        expected.crossing_allowed,
      );
    }

    // Major river crossing
    if ('crossing_allowed' in expected && 'crossing_major_river' in input) {
      handled = true;
      const beganInHex = input.began_in_hex as boolean;
      expect(canCrossMajorRiver(beganInHex)).toBe(expected.crossing_allowed);
    }

    // Entry allowed
    if ('entry_allowed' in expected) {
      handled = true;
      const unitCat = input.unit_type === 'fleet' ? 'fleet' : 'land' as const;
      expect(
        canEnterTerrain(terrain, unitCat, {
          isTransported: input.is_transported as boolean | undefined,
          isRescueOperation: input.is_rescue_operation as boolean | undefined,
          relationship: input.relationship as
            | 'friendly'
            | 'enemy'
            | undefined,
          castleIntact: input.castle_intact as boolean | undefined,
        }),
      ).toBe(expected.entry_allowed);
    }

    // Terrain access (seaport)
    if ('fleet_access' in expected) {
      handled = true;
      const access = getTerrainAccess(terrain);
      expect(access.fleetAccess).toBe(expected.fleet_access);
      expect(access.landAccess).toBe(expected.land_access);
    }

    return handled;
  },
);
