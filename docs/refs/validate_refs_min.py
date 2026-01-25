#!/usr/bin/env python3
"""
Validate minified reference data in columnar JSON format.

The minimized JSON format uses:
- $h: headers (column names for columnar data)
- $s: string table (interned strings, only for hexmap terrain/kingdom)
- $i: column indices that use string interning
- _: data rows (columnar format)
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
REFS = ROOT / "docs" / "refs"

ADVANCED_FACTIONS = {"blackhand", "eaters"}
SNAKE_CASE_RE = re.compile(r"^[a-z0-9]+(?:_[a-z0-9]+)*$")
RULE_SECTION_KEYS = {
    "1_game",
    "2_components",
    "3_setup",
    "4_unit_types",
    "5_faction_classification",
    "6_special_terrain_capabilities",
    "7_sequence_of_play",
    "8_random_events",
    "9_mercenary_units",
    "10_friendly_location_definition",
    "11_random_determination",
    "12_diplomacy",
    "13_diplomacy_cards",
    "14_personality_cards",
    "15_activating_violated_kingdom",
    "16_allied_forces",
    "17_sieges",
    "18_movement",
    "19_terrain",
    "20_ports",
    "21_fleet_movement",
    "22_sea_transport",
    "23_zones_of_control",
    "24_stacking",
    "25_combat",
    "26_leaders",
    "27_leader_adrift_at_sea",
    "28_death_and_capture_of_monarchs",
    "29_victory_conditions",
    "30_special_kingdom_rules",
    "31_cities_vs_castles",
}


def load(path: Path):
    return json.loads(path.read_text())


def assert_true(condition: bool, message: str):
    if not condition:
        raise AssertionError(message)


def deref(val: Any, strings: list[str]) -> Any:
    """Dereference a value - convert string indices back to strings."""
    if isinstance(val, int) and strings and 0 <= val < len(strings):
        return strings[val]
    if isinstance(val, list):
        return [deref(v, strings) for v in val]
    return val


def expand_columnar(
    data: dict,
    strings: list[str] | None = None,
    intern_cols: set[int] | None = None
) -> list[dict]:
    """Convert columnar format back to list of dicts.

    Args:
        data: Dict with $h (headers) and _ (rows)
        strings: Optional string table for interned values
        intern_cols: Set of column indices that use string interning
    """
    headers = data.get("$h", [])
    rows = data.get("_", [])
    strings = strings or data.get("$s", [])
    intern_cols = intern_cols or set(data.get("$i", []))

    result = []
    for row in rows:
        obj = {}
        for i, h in enumerate(headers):
            if i < len(row):
                val = row[i]
                if val is not None:
                    # Only deref if this column uses interning
                    if i in intern_cols and strings:
                        obj[h] = deref(val, strings)
                    else:
                        obj[h] = val
        result.append(obj)
    return result


def collect_city_ids(factions_data: dict) -> set[str]:
    """Collect city IDs from columnar factions format."""
    cities = expand_columnar(factions_data.get("cities", {}))
    return {city["id"] for city in cities if "id" in city}


def validate_abilities(abilities_data: dict):
    """Validate columnar abilities format."""
    abilities = expand_columnar(abilities_data)
    ability_ids = [a["id"] for a in abilities if "id" in a]
    assert_true(
        len(ability_ids) == len(set(ability_ids)),
        "Duplicate abilityId values in abilities.min.json"
    )


def validate_personality_cards(cards_data: dict):
    """Validate columnar personality_cards format."""
    cards = expand_columnar(cards_data)
    card_ids = [card["id"] for card in cards if "id" in card]
    assert_true(
        len(card_ids) == len(set(card_ids)),
        "Duplicate personality card id values in personality_cards.min.json"
    )
    for card in cards:
        assert_true(
            isinstance(card.get("id"), int),
            "Non-integer personality card id in personality_cards.min.json"
        )
        assert_true(
            isinstance(card.get("n"), str) and card.get("n"),
            "Missing personality card name in personality_cards.min.json"
        )
        assert_true(
            isinstance(card.get("d"), str) and card.get("d"),
            "Missing personality card description in personality_cards.min.json"
        )


def validate_factions(factions_data: dict):
    """Validate columnar factions format."""
    factions = expand_columnar(factions_data.get("f", {}))
    cities = expand_columnar(factions_data.get("cities", {}))

    faction_ids = [f["id"] for f in factions if "id" in f]
    assert_true(len(faction_ids) == len(set(faction_ids)), "Duplicate faction IDs")

    # Check city IDs are unique per faction
    fid_to_cities: dict[str, list[str]] = {}
    for city in cities:
        fid = city.get("fid")
        cid = city.get("id")
        if fid and cid:
            fid_to_cities.setdefault(fid, []).append(cid)

    for fid, cids in fid_to_cities.items():
        assert_true(
            len(cids) == len(set(cids)),
            f"Duplicate cityId values in faction {fid}"
        )


def validate_starting_units(
    starting_data: dict,
    abilities_data: dict,
    city_ids: set[str]
):
    """Validate columnar starting_units format (no string interning)."""
    units = expand_columnar(starting_data)
    abilities = expand_columnar(abilities_data)
    ability_ids = {a["id"] for a in abilities if "id" in a}

    for unit in units:
        name = unit.get("n", "unknown")
        mp = unit.get("mp")
        assert_true(
            isinstance(mp, (int, float)),
            f"Non-numeric movement_points for {name}"
        )

        movement_type = unit.get("mt", "standard")
        if unit.get("t") == "ambassador":
            assert_true(
                movement_type == "teleport",
                f"Ambassador movement_type not teleport: {name}"
            )

        for ability_id in unit.get("a", []):
            assert_true(
                ability_id in ability_ids,
                f"Unknown abilityId {ability_id} on {name}"
            )

        cid = unit.get("cid")
        if cid:
            assert_true(cid in city_ids, f"Unknown cityId {cid} on {name}")


def validate_hexmap(hexmap_data: dict, city_ids: set[str], mode: str):
    """Validate columnar hexmap format with string interning."""
    strings = hexmap_data.get("$s", [])
    headers = hexmap_data.get("$h", [])
    rows = hexmap_data.get("_", [])
    intern_cols = set(hexmap_data.get("$i", []))

    # Find column indices
    t_idx = headers.index("t") if "t" in headers else -1
    k_idx = headers.index("k") if "k" in headers else -1
    cid_idx = headers.index("cid") if "cid" in headers else -1

    def deref_val(val: Any, col_idx: int) -> Any:
        """Dereference value if column uses interning."""
        if col_idx in intern_cols and strings:
            if isinstance(val, int) and 0 <= val < len(strings):
                return strings[val]
            if isinstance(val, list):
                return [
                    strings[v] if isinstance(v, int) and 0 <= v < len(strings) else v
                    for v in val
                ]
        return val

    for row in rows:
        # Validate terrain
        if 0 <= t_idx < len(row):
            terrain = row[t_idx]
            if terrain is not None:
                terrain = deref_val(terrain, t_idx)
                terrain_list = terrain if isinstance(terrain, list) else [terrain]
                for t in terrain_list:
                    t_str = str(t)
                    assert_true(
                        SNAKE_CASE_RE.match(t_str),
                        f"Terrain key not snake_case: {t_str}"
                    )

        # Validate city reference
        if 0 <= cid_idx < len(row):
            cid = row[cid_idx]
            if cid is not None:
                cid_str = str(deref_val(cid, cid_idx))
                assert_true(cid_str in city_ids, f"Unknown cityId {cid_str} in hexmap")

        # Check for advanced factions in basic mode
        if mode == "basic" and 0 <= k_idx < len(row):
            k = row[k_idx]
            if k is not None:
                k_str = str(deref_val(k, k_idx))
                if k_str in ADVANCED_FACTIONS:
                    raise AssertionError("Advanced faction present in hexmap.min.json")


def validate_rules(rules_data: dict):
    """Validate dr3_rules minified format."""
    assert_true(
        isinstance(rules_data, dict),
        "dr3_rules.min.json must be a JSON object"
    )
    missing_sections = RULE_SECTION_KEYS - set(rules_data.keys())
    assert_true(
        not missing_sections,
        f"dr3_rules.min.json missing sections: {sorted(missing_sections)}"
    )


def validate_mode_split(starting_data: dict, mode: str):
    """Validate mode split using columnar format (no string interning)."""
    units = expand_columnar(starting_data)

    # Group by faction
    factions_seen = set()
    for unit in units:
        f = unit.get("f")
        if f:
            factions_seen.add(f)

    for faction in factions_seen:
        is_advanced = faction in ADVANCED_FACTIONS
        if mode == "basic" and is_advanced:
            raise AssertionError("Advanced faction present in starting_units.min.json")
        if mode == "advanced" and not is_advanced:
            raise AssertionError(
                "Basic faction present in starting_units_advanced.min.json"
            )


def main():
    abilities = load(REFS / "abilities.min.json")
    factions = load(REFS / "factions.min.json")
    factions_advanced = load(REFS / "factions_advanced.min.json")
    starting_units = load(REFS / "starting_units.min.json")
    starting_units_advanced = load(REFS / "starting_units_advanced.min.json")
    hexmap = load(REFS / "hexmap.min.json")
    hexmap_advanced = load(REFS / "hexmap_advanced.min.json")
    personality_cards = load(REFS / "personality_cards.min.json")
    rules = load(REFS / "dr3_rules.min.json")

    validate_abilities(abilities)
    validate_personality_cards(personality_cards)
    validate_rules(rules)
    validate_factions(factions)
    validate_factions(factions_advanced)

    city_ids = collect_city_ids(factions) | collect_city_ids(factions_advanced)

    validate_starting_units(starting_units, abilities, city_ids)
    validate_starting_units(starting_units_advanced, abilities, city_ids)

    validate_hexmap(hexmap, city_ids, mode="basic")
    validate_hexmap(hexmap_advanced, city_ids, mode="advanced")

    validate_mode_split(starting_units, mode="basic")
    validate_mode_split(starting_units_advanced, mode="advanced")

    print("Minified reference data validation passed.")


if __name__ == "__main__":
    main()
