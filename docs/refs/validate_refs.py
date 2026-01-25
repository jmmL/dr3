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
    ids = set()
    for faction in factions.get("factions", []):
        for city in faction.get("cities", []):
            ids.add(city["cityId"])
    return ids


def validate_abilities(abilities: dict):
    ability_ids = [ability["abilityId"] for ability in abilities["abilities"]]
    assert_true(len(ability_ids) == len(set(ability_ids)), "Duplicate abilityId values in abilities.json")


def validate_factions(factions: dict):
    faction_ids = [faction["id"] for faction in factions.get("factions", [])]
    assert_true(len(faction_ids) == len(set(faction_ids)), "Duplicate faction IDs in factions.json")
    for faction in factions.get("factions", []):
        city_ids = [city["cityId"] for city in faction.get("cities", [])]
        assert_true(len(city_ids) == len(set(city_ids)), f"Duplicate cityId values in faction {faction['id']}")


def validate_starting_units(starting: list, abilities: dict, city_ids: set[str]):
    ability_ids = {ability["abilityId"] for ability in abilities["abilities"]}
    for faction in starting:
        for unit in faction.get("units", []):
            assert_true(isinstance(unit["movement_points"], (int, float)), f"Non-numeric movement_points for {unit['name']}")
            if unit["unitType"] == "ambassador":
                assert_true(unit["movement_type"] == "teleport", f"Ambassador movement_type not teleport: {unit['name']}")
            for ability_id in unit.get("abilityIds", []):
                assert_true(ability_id in ability_ids, f"Unknown abilityId {ability_id} on {unit['name']}")
            if unit.get("cityId"):
                assert_true(unit["cityId"] in city_ids, f"Unknown cityId {unit['cityId']} on {unit['name']}")


def validate_hexmap(hexmap: dict, city_ids: set[str], mode: str):
    for hex_entry in hexmap["map"]["hexes"]:
        for key in hex_entry["terrain"].keys():
            assert_true(SNAKE_CASE_RE.match(key), f"Terrain key not snake_case: {key}")
        if hex_entry.get("cityId"):
            assert_true(hex_entry["cityId"] in city_ids, f"Unknown cityId {hex_entry['cityId']} in hexmap")
        if mode == "basic":
            if hex_entry.get("kingdom") in ADVANCED_FACTIONS or hex_entry.get("factionId") in ADVANCED_FACTIONS:
                raise AssertionError("Advanced faction present in hexmap.json")


def validate_mode_split(starting: list, mode: str):
    for faction in starting:
        is_advanced = faction["factionId"] in ADVANCED_FACTIONS
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
