A collection of reference documents that form the basis of the rules, map and game pieces.

This folder should never be written to, unless explicit permission is given.

## Columnar JSON Format

All JSON data files use a columnar format optimized for minimal token usage (~61% smaller).
This format is designed for efficient LLM ingestion while remaining machine-readable.

### Format Structure

```json
{
  "$h": ["col1", "col2", ...],  // Column headers
  "$s": ["str0", "str1", ...],  // String table (only for hexmap)
  "$i": [2, 3],                 // Column indices using string interning
  "_": [                        // Data rows
    [val1, val2, ...],
    [val1, val2, ...]
  ]
}
```

### Special Keys

- `$h` - Headers: array of column names
- `$s` - String table: interned strings referenced by index (hexmap only)
- `$i` - Intern columns: indices into $h for columns using string interning
- `_` - Rows: array of data rows (trailing nulls trimmed)

### Reading the Format

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

### Key Abbreviations

- `c`/`r` = col/row coordinates
- `n` = name
- `t` = type or terrain
- `id` = identifier
- `f` = faction/factionId
- `cid` = cityId
- `k` = kingdom (faction controlling hex)
- Positions stored as `[col, row]` arrays
- Default values omitted (e.g., `movement_type: "standard"`)
- Empty arrays omitted

## Regenerating Minimized JSON

Run the minimization script from the project root:

```bash
python scripts/minimize_json.py
```

This deterministically regenerates all minimized JSON files from source data.

## Advanced Mode Splits

Advanced-only content is split into companion files with the `_advanced` suffix:

- `factions_advanced.json`
- `starting_units_advanced.json`
- `hexmap_advanced.json`
- `abilities.json` (shared ability IDs used by starting units)

The base files (`factions.json`, `starting_units.json`, `hexmap.json`) include only basic-mode
factions and metadata.

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
