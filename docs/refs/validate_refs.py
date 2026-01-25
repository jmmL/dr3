#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REFS = ROOT / "docs" / "refs"

ADVANCED_FACTIONS = {"blackhand", "eaters"}
SNAKE_CASE_RE = re.compile(r"^[a-z0-9]+(?:_[a-z0-9]+)*$")


def load(path: Path):
    return json.loads(path.read_text())


def assert_true(condition: bool, message: str):
    if not condition:
        raise AssertionError(message)


def collect_city_ids(factions: dict) -> set[str]:
    """Collect city IDs from compact factions format (f=factions array, cities[].id=cityId)."""
    ids = set()
    for faction in factions.get("f", []):
        for city in faction.get("cities", []):
            ids.add(city["id"])
    return ids


def validate_abilities(abilities: dict):
    """Validate compact abilities format (a=abilities array, id=abilityId)."""
    ability_ids = [ability["id"] for ability in abilities["a"]]
    assert_true(len(ability_ids) == len(set(ability_ids)), "Duplicate abilityId values in abilities.json")


def validate_factions(factions: dict):
    """Validate compact factions format (f=factions array, id=factionId, cities[].id=cityId)."""
    faction_ids = [faction["id"] for faction in factions.get("f", [])]
    assert_true(len(faction_ids) == len(set(faction_ids)), "Duplicate faction IDs in factions.json")
    for faction in factions.get("f", []):
        city_ids = [city["id"] for city in faction.get("cities", [])]
        assert_true(len(city_ids) == len(set(city_ids)), f"Duplicate cityId values in faction {faction['id']}")


def validate_starting_units(starting: list, abilities: dict, city_ids: set[str]):
    """Validate compact starting_units format.

    Compact keys: f=factionId, u=units, n=name, t=unitType, mp=movement_points,
    mt=movement_type (omit if 'standard'), a=abilityIds, cid=cityId
    """
    ability_ids = {ability["id"] for ability in abilities["a"]}
    for faction in starting:
        for unit in faction.get("u", []):
            assert_true(isinstance(unit["mp"], (int, float)), f"Non-numeric movement_points for {unit['n']}")
            # mt is omitted when 'standard', so check if present
            movement_type = unit.get("mt", "standard")
            if unit["t"] == "ambassador":
                assert_true(movement_type == "teleport", f"Ambassador movement_type not teleport: {unit['n']}")
            for ability_id in unit.get("a", []):
                assert_true(ability_id in ability_ids, f"Unknown abilityId {ability_id} on {unit['n']}")
            if unit.get("cid"):
                assert_true(unit["cid"] in city_ids, f"Unknown cityId {unit['cid']} on {unit['n']}")


def validate_hexmap(hexmap: dict, city_ids: set[str], mode: str):
    """Validate compact hexmap format.

    Compact keys: c=col, r=row, t=terrain (string or array), n=name, k=kingdom, cid=cityId
    Terrain is now a string (single) or array (multiple) instead of object with boolean values.
    """
    for hex_entry in hexmap["map"]["hexes"]:
        # Terrain is now string or array, not object
        terrain = hex_entry.get("t")
        if terrain:
            terrain_list = terrain if isinstance(terrain, list) else [terrain]
            for key in terrain_list:
                assert_true(SNAKE_CASE_RE.match(key), f"Terrain key not snake_case: {key}")
        if hex_entry.get("cid"):
            assert_true(hex_entry["cid"] in city_ids, f"Unknown cityId {hex_entry['cid']} in hexmap")
        if mode == "basic":
            # k=kingdom in compact format
            if hex_entry.get("k") in ADVANCED_FACTIONS:
                raise AssertionError("Advanced faction present in hexmap.json")


def validate_mode_split(starting: list, mode: str):
    """Validate mode split using compact format (f=factionId)."""
    for faction in starting:
        is_advanced = faction["f"] in ADVANCED_FACTIONS
        if mode == "basic" and is_advanced:
            raise AssertionError("Advanced faction present in starting_units.json")
        if mode == "advanced" and not is_advanced:
            raise AssertionError("Basic faction present in starting_units_advanced.json")


def main():
    abilities = load(REFS / "abilities.json")
    factions = load(REFS / "factions.json")
    factions_advanced = load(REFS / "factions_advanced.json")
    starting_units = load(REFS / "starting_units.json")
    starting_units_advanced = load(REFS / "starting_units_advanced.json")
    hexmap = load(REFS / "hexmap.json")
    hexmap_advanced = load(REFS / "hexmap_advanced.json")

    validate_abilities(abilities)
    validate_factions(factions)
    validate_factions(factions_advanced)

    city_ids = collect_city_ids(factions) | collect_city_ids(factions_advanced)

    validate_starting_units(starting_units, abilities, city_ids)
    validate_starting_units(starting_units_advanced, abilities, city_ids)

    validate_hexmap(hexmap, city_ids, mode="basic")
    validate_hexmap(hexmap_advanced, city_ids, mode="advanced")

    validate_mode_split(starting_units, mode="basic")
    validate_mode_split(starting_units_advanced, mode="advanced")

    print("Reference data validation passed.")


if __name__ == "__main__":
    main()
