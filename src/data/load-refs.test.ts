import { describe, it, expect } from 'vitest';
import {
  loadHexMap,
  loadFactions,
  loadUnitDefinitions,
  loadAbilities,
  loadPersonalityCards,
} from './load-refs';

describe('loadHexMap', () => {
  it('loads all hexes from the map data', () => {
    const map = loadHexMap();
    expect(map.cols).toBe(35);
    expect(map.rows).toBe(31);
    expect(map.hexes.size).toBe(1070);
  });

  it('parses single terrain type', () => {
    const map = loadHexMap();
    const hex = map.hexes.get('0,0');
    expect(hex).toBeDefined();
    expect(hex!.terrain).toEqual(['forest']);
  });

  it('parses multi-terrain hexes', () => {
    const map = loadHexMap();
    const hex = map.hexes.get('1,0');
    expect(hex).toBeDefined();
    expect(hex!.terrain).toContain('forest');
    expect(hex!.terrain).toContain('scenic');
  });

  it('parses city hexes with intrinsic defense', () => {
    const map = loadHexMap();
    const hex = map.hexes.get('2,1');
    expect(hex).toBeDefined();
    expect(hex!.name).toBe('Aws Noir');
    expect(hex!.cityId).toBe('aws_noir');
    expect(hex!.intrinsicDefense).toBe(4);
    expect(hex!.kingdom).toBe('ghem');
  });
});

describe('loadFactions', () => {
  it('loads all 11 factions', () => {
    const factions = loadFactions();
    expect(factions).toHaveLength(11);
  });

  it('parses faction structure correctly', () => {
    const factions = loadFactions();
    const hothior = factions.find((f) => f.id === 'hothior');
    expect(hothior).toBeDefined();
    expect(hothior!.name).toBe('Hothior');
    expect(hothior!.race).toBe('human');
    expect(hothior!.cities.length).toBeGreaterThan(0);
  });

  it('parses cities with capital flag', () => {
    const factions = loadFactions();
    const hothior = factions.find((f) => f.id === 'hothior')!;
    const capital = hothior.cities.find((c) => c.isCapital);
    expect(capital).toBeDefined();
    expect(capital!.name).toBe('Port Lork');
  });
});

describe('loadUnitDefinitions', () => {
  it('loads unit definitions for all factions', () => {
    const units = loadUnitDefinitions();
    expect(units.length).toBeGreaterThan(0);
    const factionIds = new Set(units.map((u) => u.factionId));
    expect(factionIds.size).toBeGreaterThanOrEqual(11);
  });

  it('parses unit abilities', () => {
    const units = loadUnitDefinitions();
    const ghemMonarch = units.find((u) => u.id === 'ghem_monarch');
    expect(ghemMonarch).toBeDefined();
    expect(ghemMonarch!.abilities).toContain('mountaineer');
  });

  it('parses teleport movement type', () => {
    const units = loadUnitDefinitions();
    const ambassadors = units.filter((u) => u.movementType === 'teleport');
    expect(ambassadors.length).toBeGreaterThan(0);
  });
});

describe('loadAbilities', () => {
  it('loads all 4 abilities', () => {
    const abilities = loadAbilities();
    expect(abilities).toHaveLength(4);
    const ids = abilities.map((a) => a.id);
    expect(ids).toContain('forest_walking');
    expect(ids).toContain('mountaineer');
    expect(ids).toContain('diplomatic');
    expect(ids).toContain('flying');
  });
});

describe('loadPersonalityCards', () => {
  it('loads all 20 personality cards', () => {
    const cards = loadPersonalityCards();
    expect(cards).toHaveLength(20);
  });

  it('parses card structure', () => {
    const cards = loadPersonalityCards();
    const disciplined = cards.find((c) => c.id === 1);
    expect(disciplined).toBeDefined();
    expect(disciplined!.name).toBe('Disciplined');
    expect(disciplined!.description).toBeTruthy();
  });
});
