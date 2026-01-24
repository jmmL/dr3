#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DERIVED = ROOT / "docs" / "refs_derived"

ADVANCED_FACTIONS = {"blackhand", "eaters"}

SNAKE_CASE_RE = re.compile(r"^[a-z0-9]+(?:_[a-z0-9]+)*$")


def load(path: Path):
    return json.loads(path.read_text())


def assert_true(condition: bool, message: str):
    if not condition:
        raise AssertionError(message)


def collect_city_ids(factions: dict) -> set[str]:
    ids = set()
    for faction in factions["factions"]:
        for city in faction.get("cities", []):
            ids.add(city["id"])
    return ids


def validate_abilities(abilities: dict):
    ids = [ability["id"] for ability in abilities["abilities"]]
    assert_true(len(ids) == len(set(ids)), "Duplicate ability IDs found")


def validate_factions(factions: dict):
    ids = [faction["id"] for faction in factions["factions"]]
    assert_true(len(ids) == len(set(ids)), "Duplicate faction IDs found")
    for faction in factions["factions"]:
        city_ids = [city["id"] for city in faction.get("cities", [])]
        assert_true(len(city_ids) == len(set(city_ids)), f"Duplicate city IDs in {faction['id']}")


def validate_starting_units(starting: dict, abilities: dict, city_ids: set[str]):
    ability_ids = {ability["id"] for ability in abilities["abilities"]}
    for faction in starting["starting_units"]:
        for unit in faction["units"]:
            assert_true(isinstance(unit["movement_points"], (int, float)), f"Non-numeric movement_points for {unit['name']}")
            if unit["type"] == "ambassador":
                assert_true(unit["movement_type"] == "teleport", f"Ambassador missing teleport movement_type: {unit['name']}")
            for ability_id in unit.get("ability_ids", []):
                assert_true(ability_id in ability_ids, f"Unknown ability_id {ability_id} in {unit['name']}")
            if unit.get("city_id"):
                assert_true(unit["city_id"] in city_ids, f"Unknown city_id {unit['city_id']} in {unit['name']}")


def validate_hexmap(hexmap: dict, city_ids: set[str], mode: str):
    for hex_entry in hexmap["map"]["hexes"]:
        for key in hex_entry["terrain"].keys():
            assert_true(SNAKE_CASE_RE.match(key), f"Terrain key not snake_case: {key}")
        if hex_entry.get("city_id"):
            assert_true(hex_entry["city_id"] in city_ids, f"Unknown city_id in hexmap: {hex_entry['city_id']}")
        faction_id = hex_entry.get("faction_id")
        if mode == "basic" and faction_id in ADVANCED_FACTIONS:
            raise AssertionError(f"Advanced faction {faction_id} present in basic hexmap")


def validate_mode_split(starting: dict, mode: str):
    for faction in starting["starting_units"]:
        is_advanced = faction["faction_id"] in ADVANCED_FACTIONS
        if mode == "basic" and is_advanced:
            raise AssertionError("Advanced faction present in basic starting_units")
        if mode == "advanced" and not is_advanced:
            raise AssertionError("Basic faction present in advanced starting_units")


def main():
    abilities = load(DERIVED / "abilities.json")
    factions_basic = load(DERIVED / "factions.json")
    factions_advanced = load(DERIVED / "factions_advanced.json")
    starting_basic = load(DERIVED / "starting_units.json")
    starting_advanced = load(DERIVED / "starting_units_advanced.json")
    hexmap_basic = load(DERIVED / "hexmap.json")
    hexmap_advanced = load(DERIVED / "hexmap_advanced.json")

    validate_abilities(abilities)
    validate_factions(factions_basic)
    validate_factions(factions_advanced)

    city_ids = collect_city_ids(factions_basic) | collect_city_ids(factions_advanced)

    validate_starting_units(starting_basic, abilities, city_ids)
    validate_starting_units(starting_advanced, abilities, city_ids)

    validate_hexmap(hexmap_basic, city_ids, mode="basic")
    validate_hexmap(hexmap_advanced, city_ids, mode="advanced")

    validate_mode_split(starting_basic, mode="basic")
    validate_mode_split(starting_advanced, mode="advanced")

    print("Derived refs validation passed.")


if __name__ == "__main__":
    main()
