A collection of reference documents that form the basis of the rules, map and game pieces.

This folder should never be written to, unless explicit permission is given.

## Compact JSON Format

All JSON data files use abbreviated keys to reduce token usage (55% smaller than original).
See [KEY_MAPPING.md](KEY_MAPPING.md) for the complete key mapping reference.

Key conventions:
- `c`/`r` = col/row coordinates
- `n` = name
- `t` = type or terrain
- `id` = identifier
- `f` = faction/factionId
- Positions stored as `[col, row]` arrays
- Default values omitted (e.g., `movement_type: "standard"`)
- Empty arrays omitted

## Advanced mode splits

Advanced-only content is split into companion files with the `_advanced` suffix:

- `factions_advanced.json`
- `starting_units_advanced.json`
- `hexmap_advanced.json`
- `abilities.json` (shared ability IDs used by starting units)

The base files (`factions.json`, `starting_units.json`, `hexmap.json`) include only basic-mode
factions and metadata. Advanced factions are removed from base references to keep core mode
data clean and linkable by ID.

## Schemas

Schema definitions live alongside the data:

- `schema_abilities.json`
- `schema_factions.json`
- `schema_hexmap.json`
- `schema_starting_units.json`

## Validation

Run the validation script after edits:

```bash
python docs/refs/validate_refs.py
```
