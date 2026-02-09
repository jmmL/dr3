import type {
  HexData,
  HexMap,
  TerrainType,
  FactionData,
  RaceId,
  CityData,
  UnitDefinition,
  AbilityId,
  MovementType,
  PersonalityCard,
} from '@/types';
import { hexKey } from '@/types';

import rawHexmap from '../../docs/refs/hexmap.json';
import rawFactions from '../../docs/refs/factions.json';
import rawStartingUnits from '../../docs/refs/starting_units.json';
import rawAbilities from '../../docs/refs/abilities.json';
import rawPersonalityCards from '../../docs/refs/personality_cards.json';

// --- Hexmap ---

interface RawHex {
  c: number;
  r: number;
  t: string | string[];
  n?: string;
  k?: string;
  i?: number;
  cid?: string;
}

export function loadHexMap(): HexMap {
  const map = rawHexmap.map;
  const hexes = new Map<string, HexData>();

  for (const raw of map.hexes as RawHex[]) {
    const terrain: TerrainType[] = Array.isArray(raw.t)
      ? (raw.t as TerrainType[])
      : [raw.t as TerrainType];

    const hex: HexData = {
      col: raw.c,
      row: raw.r,
      terrain,
      ...(raw.n != null && { name: raw.n }),
      ...(raw.k != null && { kingdom: raw.k }),
      ...(raw.i != null && { intrinsicDefense: raw.i }),
      ...(raw.cid != null && { cityId: raw.cid }),
    };

    hexes.set(hexKey(raw.c, raw.r), hex);
  }

  return { cols: map.cols, rows: map.rows, hexes };
}

// --- Factions ---

interface RawFaction {
  id: string;
  n: string;
  r: string;
  c: string;
  coa: string;
  msl?: [number, number];
  notes?: string;
  cities: Array<{
    id: string;
    n: string;
    p: [number, number];
    a?: number;
    sf?: number;
    cap?: boolean;
    i?: number;
  }>;
}

export function loadFactions(): FactionData[] {
  const factions = (rawFactions as unknown as { f: RawFaction[] }).f;

  return factions.map((f) => {
    const cities: CityData[] = f.cities.map((c) => ({
      id: c.id,
      name: c.n,
      factionId: f.id,
      position: { col: c.p[0], row: c.p[1] },
      armies: c.a ?? 0,
      seaFleet: c.sf ?? 0,
      isCapital: c.cap ?? false,
      ...(c.i != null && { intrinsicDefense: c.i }),
    }));

    return {
      id: f.id,
      name: f.n,
      race: f.r as RaceId,
      color: f.c,
      coatOfArms: f.coa,
      ...(f.msl && { monarchStartLocation: { col: f.msl[0], row: f.msl[1] } }),
      ...(f.notes && { notes: f.notes }),
      cities,
    };
  });
}

// --- Starting Units ---

interface RawUnit {
  id: string;
  n: string;
  t: string;
  c: number;
  mp: number;
  h?: [number, number];
  cid?: string | null;
  a?: string[];
  mt?: string;
  dep?: { type: string; rules: string; example_start_hexes?: number[][] };
}

interface RawFactionUnits {
  f: string;
  u: RawUnit[];
}

export function loadUnitDefinitions(): UnitDefinition[] {
  const factionUnits = rawStartingUnits as RawFactionUnits[];
  const definitions: UnitDefinition[] = [];

  for (const fu of factionUnits) {
    for (const u of fu.u) {
      definitions.push({
        id: u.id,
        name: u.n,
        factionId: fu.f,
        unitType: u.t as UnitDefinition['unitType'],
        count: u.c,
        movementPoints: u.mp,
        startHex: u.h ? { col: u.h[0], row: u.h[1] } : null,
        cityId: u.cid ?? null,
        abilities: (u.a ?? []) as AbilityId[],
        movementType: (u.mt ?? 'standard') as MovementType,
        ...(u.dep && {
          deployment: {
            type: u.dep.type,
            rules: u.dep.rules,
            ...(u.dep.example_start_hexes && {
              exampleStartHexes: u.dep.example_start_hexes.map((h) => ({
                col: h[0]!,
                row: h[1]!,
              })),
            }),
          },
        }),
      });
    }
  }

  return definitions;
}

// --- Abilities ---

interface RawAbility {
  id: string;
  n: string;
  refs?: string[];
}

export interface AbilityData {
  id: string;
  name: string;
  ruleRefs: string[];
}

export function loadAbilities(): AbilityData[] {
  const abilities = (rawAbilities as { a: RawAbility[] }).a;
  return abilities.map((a) => ({
    id: a.id,
    name: a.n,
    ruleRefs: a.refs ?? [],
  }));
}

// --- Personality Cards ---

interface RawPersonalityCard {
  id: number;
  n: string;
  d: string;
}

export function loadPersonalityCards(): PersonalityCard[] {
  const cards = rawPersonalityCards as RawPersonalityCard[];
  return cards.map((c) => ({
    id: c.id,
    name: c.n,
    description: c.d,
  }));
}
