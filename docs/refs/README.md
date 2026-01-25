A collection of reference documents that form the basis of the rules, map and game pieces.

This folder should never be written to, unless explicit permission is given.

## File Structure

Reference data exists in two formats:

| Original Files | Minified Files | Description |
|----------------|----------------|-------------|
| `hexmap.json` | `hexmap.min.json` | Hex grid map data |
| `factions.json` | `factions.min.json` | Faction definitions |
| `starting_units.json` | `starting_units.min.json` | Unit deployment data |
| `abilities.json` | `abilities.min.json` | Unit ability definitions |
| `personality_cards.json` | `personality_cards.min.json` | Monarch personality cards |
| `dr3_rules.json` | `dr3_rules.min.json` | Game rules reference |

Advanced-mode variants follow the same pattern (e.g., `hexmap_advanced.min.json`).

## Original Format

The original `.json` files use abbreviated keys for readability:

- `c`/`r` = col/row coordinates
- `n` = name
- `t` = type or terrain
- `id` = identifier
- `f` = faction/factionId
- `cid` = cityId
- Positions stored as `[col, row]` arrays

## Minified Format (~61% smaller)

The `.min.json` files use a columnar format optimized for LLM token usage:

```json
{
  "$h": ["col1", "col2", ...],  // Column headers
  "$s": ["str0", "str1", ...],  // String table (hexmap only)
  "$i": [2, 3],                 // Columns using string interning
  "_": [                        // Data rows
    [val1, val2, ...],
    [val1, val2, ...]
  ]
}
```

### Reading the Minified Format

```python
def expand_columnar(data):
    headers = data["$h"]
    rows = data["_"]
    strings = data.get("$s", [])
    intern_cols = set(data.get("$i", []))

    result = []
    for row in rows:
        obj = {}
        for i, h in enumerate(headers):
            if i < len(row) and row[i] is not None:
                val = row[i]
                # Dereference if column uses interning
                if i in intern_cols and isinstance(val, int):
                    val = strings[val]
                obj[h] = val
        result.append(obj)
    return result
```

## Regenerating Minified Files

Run the minimization script from the project root:

```bash
python scripts/minimize_json.py
```

This deterministically regenerates all `.min.json` files from the original sources.

## Advanced Mode Splits

Advanced-only content is split into companion files with the `_advanced` suffix:

- `factions_advanced.json` / `factions_advanced.min.json`
- `starting_units_advanced.json` / `starting_units_advanced.min.json`
- `hexmap_advanced.json` / `hexmap_advanced.min.json`

The base files include only basic-mode factions and metadata.

## Schemas

Schema definitions for the original format:

- `schema_abilities.json`
- `schema_factions.json`
- `schema_hexmap.json`
- `schema_starting_units.json`

## Validation

Validate original files:
```bash
python docs/refs/validate_refs.py
```

Validate minified files:
```bash
python docs/refs/validate_refs_min.py
```
