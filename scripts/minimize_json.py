#!/usr/bin/env python3
"""
Minimize JSON files in docs/refs/ for optimal LLM token usage.

Techniques used:
1. Columnar format for tabular data (headers + rows instead of repeated keys)
2. String interning for hexmap terrain/kingdom (where it saves the most)
3. Full minification (no whitespace)
4. Default value omission

Output format uses special keys:
- $h: headers (column names for columnar data)
- $s: string table (interned strings for specific columns, marked with $i)
- $i: columns that use string interning (indices into $h)
- _: data rows (columnar format)
"""
from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REFS = ROOT / "docs" / "refs"
OUT = REFS  # Output to same directory (overwrite)

# Minimum frequency for a string to be interned
MIN_INTERN_FREQ = 2


def load(path: Path) -> Any:
    return json.loads(path.read_text())


def save(path: Path, data: Any) -> int:
    """Save minified JSON and return byte size."""
    content = json.dumps(data, separators=(",", ":"), ensure_ascii=False)
    path.write_text(content)
    return len(content.encode("utf-8"))


def collect_strings_from_column(items: list[dict], column: str, strings: Counter) -> None:
    """Collect string values from a specific column."""
    for item in items:
        val = item.get(column)
        if isinstance(val, str):
            strings[val] += 1
        elif isinstance(val, list):
            for v in val:
                if isinstance(v, str):
                    strings[v] += 1


def build_string_table_for_columns(
    items: list[dict],
    columns: list[str],
    min_freq: int = MIN_INTERN_FREQ
) -> dict[str, int]:
    """Build string interning table for specific columns only."""
    strings: Counter = Counter()
    for col in columns:
        collect_strings_from_column(items, col, strings)

    table = {}
    idx = 0
    for s, count in strings.most_common():
        if count >= min_freq and (len(s) > 2 or count >= 3):
            table[s] = idx
            idx += 1
    return table


def intern_value(val: Any, table: dict[str, int]) -> Any:
    """Replace string with index if in table."""
    if isinstance(val, str) and val in table:
        return table[val]
    return val


def to_columnar(
    items: list[dict],
    key_order: list[str] | None = None,
    intern_table: dict[str, int] | None = None,
    intern_columns: set[str] | None = None
) -> dict:
    """Convert array of objects to columnar format.

    Args:
        items: List of dicts to convert
        key_order: Preferred column order
        intern_table: String->index mapping for interning
        intern_columns: Set of column names to apply interning to

    Returns: {"$h": [...headers], "_": [...rows]}
    """
    if not items:
        return {"$h": [], "_": []}

    intern_table = intern_table or {}
    intern_columns = intern_columns or set()

    # Collect all keys in order of frequency (most common first)
    key_counts: Counter = Counter()
    for item in items:
        for k in item:
            key_counts[k] += 1

    if key_order:
        headers = [k for k in key_order if k in key_counts]
        headers += [k for k in key_counts if k not in key_order]
    else:
        headers = [k for k, _ in key_counts.most_common()]

    rows = []
    for item in items:
        row = []
        for h in headers:
            val = item.get(h)
            if val is None:
                row.append(None)
            elif h in intern_columns:
                # Apply interning to this column
                if isinstance(val, list):
                    row.append([intern_value(v, intern_table) for v in val])
                else:
                    row.append(intern_value(val, intern_table))
            else:
                row.append(val)
        # Trim trailing Nones
        while row and row[-1] is None:
            row.pop()
        rows.append(row)

    return {"$h": headers, "_": rows}


def minimize_hexmap(data: dict) -> dict:
    """Minimize hexmap.json using columnar format and string interning.

    String interning is applied to: t (terrain), k (kingdom), cid (cityId)
    These columns have highly repeated string values.
    """
    hexes = data["map"]["hexes"]

    # Build string table for columns with repeated strings
    intern_columns = {"t", "k", "cid"}
    table = build_string_table_for_columns(hexes, list(intern_columns))

    # Convert to columnar with optimal key order
    key_order = ["c", "r", "t", "k", "n", "cid", "i", "cap", "msl"]
    columnar = to_columnar(hexes, key_order, table, intern_columns)

    # Build reverse table (index -> string)
    if table:
        string_list = [""] * len(table)
        for s, idx in table.items():
            string_list[idx] = s
        columnar["$s"] = string_list
        # Mark which columns use interning
        columnar["$i"] = [columnar["$h"].index(c) for c in intern_columns if c in columnar["$h"]]

    return {
        "v": data.get("version", data.get("v", "1.0.0")),
        "map": {
            "cols": data["map"]["cols"],
            "rows": data["map"]["rows"],
        },
        **columnar
    }


def minimize_starting_units(data: list) -> dict:
    """Minimize starting_units.json using columnar format.

    No string interning - columns contain mixed numeric/string values.
    Columnar format alone provides significant savings.
    """
    # Flatten all units with faction prefix
    all_units = []
    for faction in data:
        for unit in faction.get("u", []):
            unit_copy = {"f": faction["f"], **unit}
            all_units.append(unit_copy)

    # Convert to columnar (no interning)
    key_order = ["f", "id", "n", "t", "c", "mp", "h", "cid", "a", "mt", "dep"]
    return to_columnar(all_units, key_order)


def minimize_factions(data: dict) -> dict:
    """Minimize factions.json using columnar format.

    Splits faction metadata and cities into separate columnar structures.
    No string interning - not enough repetition to justify complexity.
    """
    factions = data.get("f", [])

    # Collect all cities into a flat array for columnar format
    all_cities = []
    faction_meta = []

    for faction in factions:
        meta = {k: v for k, v in faction.items() if k != "cities"}
        cities = faction.get("cities", [])
        # Add faction reference to each city
        for city in cities:
            city_copy = {"fid": faction["id"], **city}
            all_cities.append(city_copy)
        faction_meta.append(meta)

    # Convert cities to columnar
    city_key_order = ["fid", "id", "n", "p", "a", "sf", "cap"]
    cities_columnar = to_columnar(all_cities, city_key_order)

    # Convert faction meta to columnar
    faction_key_order = ["id", "n", "r", "c", "coa", "notes", "msl"]
    factions_columnar = to_columnar(faction_meta, faction_key_order)

    return {
        "v": data.get("v", "1.0.0"),
        "f": factions_columnar,
        "cities": cities_columnar
    }


def minimize_abilities(data: dict) -> dict:
    """Minimize abilities.json using columnar format."""
    abilities = data.get("a", [])
    key_order = ["id", "n", "refs"]
    columnar = to_columnar(abilities, key_order)
    return {"v": data.get("v", "1.0.0"), **columnar}


def minimize_personality_cards(data: list) -> dict:
    """Minimize personality_cards.json using columnar format."""
    key_order = ["id", "n", "d"]
    return to_columnar(data, key_order)


def minimize_rules(data: dict) -> dict:
    """Minimize dr3_rules.json - just minify, preserve structure.

    Rules have a hierarchical structure that must be preserved.
    No string interning due to mixed content types.
    """
    # Just return the data as-is; save() will minify it
    return data


def process_file(name: str, minimize_fn) -> tuple[int, int]:
    """Process a single file and return (original_size, new_size)."""
    path = REFS / name
    if not path.exists():
        return 0, 0

    original_size = path.stat().st_size
    data = load(path)
    minimized = minimize_fn(data)
    new_size = save(path, minimized)

    return original_size, new_size


def main():
    print("Minimizing JSON files in docs/refs/")
    print("=" * 60)

    files = [
        ("hexmap.json", minimize_hexmap),
        ("hexmap_advanced.json", minimize_hexmap),
        ("starting_units.json", minimize_starting_units),
        ("starting_units_advanced.json", minimize_starting_units),
        ("factions.json", minimize_factions),
        ("factions_advanced.json", minimize_factions),
        ("abilities.json", minimize_abilities),
        ("personality_cards.json", minimize_personality_cards),
        ("dr3_rules.json", minimize_rules),
    ]

    total_original = 0
    total_new = 0

    for name, fn in files:
        orig, new = process_file(name, fn)
        if orig > 0:
            reduction = (1 - new / orig) * 100
            print(f"{name:35} {orig:>8} -> {new:>8} ({reduction:>5.1f}% smaller)")
            total_original += orig
            total_new += new

    print("=" * 60)
    reduction = (1 - total_new / total_original) * 100
    print(f"{'TOTAL':35} {total_original:>8} -> {total_new:>8} ({reduction:>5.1f}% smaller)")

    print("\nDone! Files have been minimized in place.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
