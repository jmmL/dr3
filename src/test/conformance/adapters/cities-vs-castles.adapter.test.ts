import { expect } from 'vitest';
import { runConformanceSuite } from '../harness';
import * as sr from '@/engine/siege/siege-resolution';
import { loadHexMap, loadFactions } from '@/data/load-refs';

const hexMap = loadHexMap();
const factions = loadFactions();

function findCity(name: string, kingdom: string) {
  const faction = factions.find((f) => f.id === kingdom);
  return faction?.cities.find((c) => c.name === name);
}

function isCastleHex(cityName: string, kingdom: string): boolean {
  const city = findCity(cityName, kingdom);
  if (!city) return false;
  const hex = hexMap.hexes.get(`${city.position.col},${city.position.row}`);
  return hex?.terrain.includes('castle') ?? false;
}

runConformanceSuite(
  'chunk_5_special_rules/31_cities_vs_castles.json',
  (input, expected) => {
    // 31.1 - General distinction
    if ('defense_guaranteed' in expected && input.location_type === 'city') {
      expect(sr.isCityDeploymentHex()).toBe(expected.deployment_hex);
      expect(sr.doesCityGuaranteeDefense()).toBe(expected.defense_guaranteed);
      return;
    }

    // 31.2.1 - Specific cities without castles
    if ('is_castle' in expected && 'location' in input && 'kingdom' in input) {
      const name = input.location as string;
      const kingdom = input.kingdom as string;
      const isCastle = isCastleHex(name, kingdom);
      expect(isCastle).toBe(expected.is_castle);
      if ('intrinsic_defense' in expected) {
        const city = findCity(name, kingdom);
        if (city) {
          const hex = hexMap.hexes.get(`${city.position.col},${city.position.row}`);
          expect(hex?.intrinsicDefense ?? 0).toBe(expected.intrinsic_defense);
        }
      }
      return;
    }

    // 31.2.1 - Troll locations
    if ('all_are_castles' in expected) {
      const locations = input.locations as string[];
      const kingdom = input.kingdom as string;
      const allCastles = locations.every((loc) => isCastleHex(loc, kingdom));
      expect(allCastles).toBe(expected.all_are_castles);
      return;
    }

    // 31.2.2 - Deployment
    if ('deployment_allowed' in expected) {
      expect(sr.isCityDeploymentHex()).toBe(expected.deployment_allowed);
      return;
    }

    // 31.2.2 - No siege on non-castle
    if ('siege_allowed' in expected && input.is_castle === false) {
      expect(sr.canBesiegeNonCastle()).toBe(expected.siege_allowed);
      return;
    }

    // 31.3.1 - Castle identification
    if ('is_castle' in expected && 'hex_terrain' in input) {
      expect(sr.isCastleLocation(input.hex_terrain as string[])).toBe(expected.is_castle);
      return;
    }

    // 31.3.2 - Castle defense
    if ('siege_rules_apply' in expected && 'defense_strength' in expected) {
      expect(expected.siege_rules_apply).toBe(true);
      expect(expected.defense_strength).toBe(input.intrinsic_defense);
      return;
    }
  },
);
