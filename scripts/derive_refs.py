#!/usr/bin/env python3
from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
REFS_DIR = ROOT / "docs" / "refs"
OUT_DIR = ROOT / "docs" / "refs_derived"

ADVANCED_FACTIONS_BY_NAME = {
    "The Black Hand": "blackhand",
    "The Eaters of Wisdom": "eaters",
}

ABILITY_MAP = {
    "Forestwalking": "forest_walking",
    "Mountaineer": "mountaineer",
    "Diplomatic": "diplomatic",
    "Flying": "flying",
}

ABILITY_RULE_REFS = {
    "forest_walking": ["6.1_tree_symbol"],
    "mountaineer": ["6.2_mountain_symbol"],
    "diplomatic": ["12_diplomacy"],
    "flying": [],
}

UNIT_CITY_ID_OVERRIDES = {
    "Lapsell": "castle_lapspell",
    "Altarr": "castle_altarr",
    "Gap": "gap_castle",
    "Golkus": "the_golkus",
    "Rosengg": "mines_of_rosengg",
    "Shunned Vale": "the_shunned_vale",
}

TERRAIN_KEY_MAP = {
    "minorRiver": "minor_river",
    "majorRiver": "major_river",
    "ancientBattlefield": "ancient_battlefield",
    "pass": "mountain_pass",
}


@dataclass(frozen=True)
class CityRef:
    id: str
    name: str


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "_", value)
    value = re.sub(r"_+", "_", value)
    return value.strip("_")


def load_json(path: Path):
    return json.loads(path.read_text())


def dump_json(path: Path, payload: dict | list):
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_city_map(factions: list[dict]) -> dict[str, CityRef]:
    city_map: dict[str, CityRef] = {}
    for faction in factions:
        for city in faction.get("cities", []):
            city_id = slugify(city["name"])
            city_map[city["name"]] = CityRef(id=city_id, name=city["name"])
    return city_map


def derive_factions_basic(source: dict, generated_at: str) -> dict:
    factions = []
    for faction in source["factions"]:
        cities = []
        for city in faction.get("cities", []):
            city_id = slugify(city["name"])
            cities.append({
                "id": city_id,
                "name": city["name"],
                "coords": {"col": city["col"], "row": city["row"]},
                "armies": city["armies"],
                "sea_fleet": city.get("seaFleet", 0),
                "is_capital": city.get("isCapital", False),
            })
        factions.append({
            "id": faction["id"],
            "name": faction["name"],
            "race": faction["race"],
            "race_id": slugify(faction["race"]),
            "coat_of_arms": faction["coatOfArms"],
            "color": faction["color"],
            "capital_name": faction["capitalName"],
            "capital_id": faction["capitalId"],
            "cities": cities,
            "total_armies": faction["totalArmies"],
            "total_sea_fleets": faction["totalSeaFleets"],
            "notes": faction.get("notes"),
        })
    return {
        "version": source.get("version"),
        "mode": "basic",
        "generated_at": generated_at,
        "source": {"file": "docs/refs/factions.json", "exportDate": source.get("exportDate")},
        "factions": factions,
    }


def infer_advanced_factions(hexmap: dict, generated_at: str) -> dict:
    entries = {}
    for hex_entry in hexmap["map"]["hexes"]:
        kingdom = hex_entry.get("kingdom")
        if kingdom in ("blackhand", "eaters"):
            entries[kingdom] = hex_entry
    advanced = []
    for name, faction_id in ADVANCED_FACTIONS_BY_NAME.items():
        entry = entries.get(faction_id)
        if not entry:
            continue
        city_name = entry.get("name", name)
        advanced.append({
            "id": faction_id,
            "name": name,
            "race": "Special",
            "race_id": "special",
            "coat_of_arms": None,
            "color": None,
            "capital_name": city_name,
            "capital_id": slugify(city_name),
            "cities": [{
                "id": slugify(city_name),
                "name": city_name,
                "coords": {"col": entry["col"], "row": entry["row"]},
                "armies": None,
                "sea_fleet": None,
                "is_capital": True,
                "intrinsic_defense": entry.get("intrinsic"),
                "terrain": entry.get("terrain"),
            }],
            "notes": "Inferred from hexmap and starting units; advanced-only faction.",
        })
    return {
        "version": hexmap.get("version"),
        "mode": "advanced",
        "generated_at": generated_at,
        "source": {"file": "docs/refs/hexmap.json", "exportDate": hexmap.get("exportDate")},
        "factions": advanced,
    }


def derive_abilities(generated_at: str) -> dict:
    abilities = []
    for ability_name, ability_id in ABILITY_MAP.items():
        abilities.append({
            "id": ability_id,
            "name": ability_name,
            "rule_refs": ABILITY_RULE_REFS.get(ability_id, []),
        })
    return {
        "version": "1.0.0",
        "generated_at": generated_at,
        "abilities": sorted(abilities, key=lambda item: item["id"]),
    }


def normalize_terrain(terrain: dict) -> dict:
    normalized = {}
    for key, value in terrain.items():
        normalized_key = TERRAIN_KEY_MAP.get(key, key)
        normalized[normalized_key] = value
    return normalized


def derive_hexmap(hexmap: dict, city_map: dict[str, CityRef], mode: str, generated_at: str) -> dict:
    hexes = []
    for entry in hexmap["map"]["hexes"]:
        terrain = normalize_terrain(entry.get("terrain", {}))
        faction_id = entry.get("kingdom")
        if mode == "basic" and faction_id in ("blackhand", "eaters"):
            faction_id = None
        hex_item = {
            "id": f"hex_{entry['col']}_{entry['row']}",
            "col": entry["col"],
            "row": entry["row"],
            "terrain": terrain,
        }
        if entry.get("name"):
            name = entry["name"]
            hex_item["name"] = name
            hex_item["name_id"] = slugify(name)
            if name in city_map:
                hex_item["city_id"] = city_map[name].id
        if faction_id is not None:
            hex_item["faction_id"] = faction_id
        if "intrinsic" in entry:
            hex_item["intrinsic_defense"] = entry["intrinsic"]
        hexes.append(hex_item)

    return {
        "version": hexmap.get("version"),
        "mode": mode,
        "generated_at": generated_at,
        "source": {"file": "docs/refs/hexmap.json", "exportDate": hexmap.get("exportDate")},
        "map": {
            "cols": hexmap["map"]["cols"],
            "rows": hexmap["map"]["rows"],
            "hexes": hexes,
        },
    }


def classify_unit_type(name: str) -> str:
    lower = name.lower()
    if "monarch" in lower:
        return "monarch"
    if "ambassador" in lower:
        return "ambassador"
    if "fleet" in lower:
        return "fleet"
    if "unit" in lower:
        return "army"
    return "special"


def resolve_city_id(unit_name: str) -> str | None:
    for suffix in (" Unit", " Fleet"):
        if unit_name.endswith(suffix):
            base = unit_name[: -len(suffix)]
            base = base.strip()
            if base in UNIT_CITY_ID_OVERRIDES:
                return UNIT_CITY_ID_OVERRIDES[base]
            return slugify(base)
    return None


def derive_starting_units(source: list[dict], faction_name_to_id: dict[str, str], mode: str, generated_at: str) -> dict:
    units_output = []
    for entry in source:
        faction_name = entry["faction"]
        if mode == "basic" and faction_name in ADVANCED_FACTIONS_BY_NAME:
            continue
        if mode == "advanced" and faction_name not in ADVANCED_FACTIONS_BY_NAME:
            continue
        faction_id = faction_name_to_id.get(faction_name, slugify(faction_name))
        units = []
        for unit in entry["units"]:
            unit_type = classify_unit_type(unit["name"])
            movement_points = unit["movement_points"]
            movement_type = "standard"
            if unit_type == "ambassador":
                movement_points = 0
                movement_type = "teleport"
            ability_ids = [ABILITY_MAP[ability] for ability in unit.get("abilities", [])]
            city_id = resolve_city_id(unit["name"]) if unit.get("start_hex") else None
            units.append({
                "id": slugify(unit["name"]),
                "name": unit["name"],
                "type": unit_type,
                "count": unit["count"],
                "start_hex": unit.get("start_hex"),
                "movement_points": movement_points,
                "movement_type": movement_type,
                "ability_ids": ability_ids,
                "ability_names": unit.get("abilities", []),
                "city_id": city_id,
                "deployment": unit.get("deployment"),
            })
        units_output.append({
            "faction_id": faction_id,
            "faction_name": faction_name,
            "units": units,
        })
    return {
        "version": "1.0.0",
        "mode": mode,
        "generated_at": generated_at,
        "source": {"file": "docs/refs/starting_units.json"},
        "starting_units": units_output,
    }


def build_faction_name_to_id(factions: dict) -> dict[str, str]:
    mapping = {faction["name"]: faction["id"] for faction in factions["factions"]}
    for name, fid in ADVANCED_FACTIONS_BY_NAME.items():
        mapping[name] = fid
    return mapping


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    factions_source = load_json(REFS_DIR / "factions.json")
    hexmap_source = load_json(REFS_DIR / "hexmap.json")
    starting_source = load_json(REFS_DIR / "starting_units.json")

    generated_at = now_iso()

    factions_basic = derive_factions_basic(factions_source, generated_at)
    city_map = build_city_map(factions_source["factions"])
    factions_advanced = infer_advanced_factions(hexmap_source, generated_at)

    abilities = derive_abilities(generated_at)

    hexmap_basic = derive_hexmap(hexmap_source, city_map, mode="basic", generated_at=generated_at)
    hexmap_advanced = derive_hexmap(hexmap_source, city_map, mode="advanced", generated_at=generated_at)

    faction_name_to_id = build_faction_name_to_id(factions_basic)
    starting_basic = derive_starting_units(starting_source, faction_name_to_id, mode="basic", generated_at=generated_at)
    starting_advanced = derive_starting_units(starting_source, faction_name_to_id, mode="advanced", generated_at=generated_at)

    dump_json(OUT_DIR / "factions.json", factions_basic)
    dump_json(OUT_DIR / "factions_advanced.json", factions_advanced)
    dump_json(OUT_DIR / "abilities.json", abilities)
    dump_json(OUT_DIR / "hexmap.json", hexmap_basic)
    dump_json(OUT_DIR / "hexmap_advanced.json", hexmap_advanced)
    dump_json(OUT_DIR / "starting_units.json", starting_basic)
    dump_json(OUT_DIR / "starting_units_advanced.json", starting_advanced)


if __name__ == "__main__":
    main()
