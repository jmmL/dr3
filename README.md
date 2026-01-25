# dr3
An implementation of Divine Right (3rd edition) for fun

## Reference Documentation

A collection of reference documents that form the basis of the rules, map and game pieces.

This folder should never be written to, unless explicit permission is given.

### Compact JSON Format

All JSON data files use abbreviated keys to reduce token usage (55% smaller than original).
See the key mapping section below for the complete key mapping reference.

Key conventions:
- `c`/`r` = col/row coordinates
- `n` = name
- `t` = type or terrain
- `id` = identifier
- `f` = faction/factionId
- Positions stored as `[col, row]` arrays
- Default values omitted (e.g., `movement_type: "standard"`)
- Empty arrays omitted

### Advanced mode splits

Advanced-only content is split into companion files with the `_advanced` suffix:

- `factions_advanced.json`
- `starting_units_advanced.json`
- `hexmap_advanced.json`
- `abilities.json` (shared ability IDs used by starting units)

The base files (`factions.json`, `starting_units.json`, `hexmap.json`) include only basic-mode
factions and metadata. Advanced factions are removed from base references to keep core mode
data clean and linkable by ID.

### Schemas

Schema definitions live alongside the data:

- `schema_abilities.json`
- `schema_factions.json`
- `schema_hexmap.json`
- `schema_starting_units.json`

### Validation

Run the validation script after edits:

```bash
python docs/refs/validate_refs.py
```

## Divine Right Game Data Exports

This directory contains JSON exports of the Divine Right game data, including map hexes and faction information.

### Files

#### `hexmap.json` (138 KB)
Complete map hex data (1,070 hexes from the Divine Right 25th Anniversary Edition map).

**Structure:**
```json
{
  "version": "1.0.0",
  "exportDate": "ISO timestamp",
  "map": {
    "cols": 35,
    "rows": 31,
    "hexes": [ ... ]
  }
}
```

**Hex Properties:**
Each hex includes only the properties that are present:
- `col`, `row` - Coordinates (always present)
- `hexId` - Stable hex identifier (`hex_{col}_{row}`)
- `name` - Optional: Castle or scenic location name
- `nameId` - Optional: Stable name identifier
- `cityId` - Optional: Link to `factions.json` city IDs when the name matches a city
- `terrain` - Optional object with terrain types (only includes present terrain):
  - `clear` - Clear/open terrain
  - `forest`, `hill`, `mountain`, `mountain_pass`, `swamp`
  - `minor_river` - Non-navigable river
  - `major_river` - Navigable river
  - `lake`, `lakeshore`, `sea`, `seashore`
  - `castle`, `port`, `scenic`, `ancient_battlefield`, `royal`
- `kingdom` - Optional: Controlling faction ID (basic-mode only)
- `factionId` - Optional: Controlling faction ID (advanced overlays)
- `intrinsic` - Optional: Castle defense value (1-6)

**Example Hexes:**
```json
{
  "col": 0,
  "row": 0,
  "hexId": "hex_0_0",
  "terrain": { "forest": true },
  "kingdom": "neuth"
}
```

```json
{
  "col": 2,
  "row": 1,
  "hexId": "hex_2_1",
  "name": "Aws Noir",
  "terrain": { "castle": true },
  "kingdom": "ghem",
  "intrinsic": 4
}
```

#### `hexmap_advanced.json`
Advanced-only overlays for special factions. Use these to apply advanced kingdom ownership on top
of the base `hexmap.json` without polluting the basic-mode map data.

#### `factions.json` (8.6 KB)
Faction data for all 11 player-selectable factions.

**Structure:**
```json
{
  "version": "1.0.0",
  "exportDate": "ISO timestamp",
  "factions": [ ... ]
}
```

**Faction Properties:**
- `id` - Faction identifier (matches kingdom ID)
- `name` - Display name
- `race` - Human, Elves, Dwarves, Goblins, or Trolls
- `raceId` - Snake-case race identifier
- `coatOfArms` - Emoji representation
- `capitalName` - Capital city name
- `capitalId` - Capital identifier
- `color` - Hex color code
- `cities` - Array of city objects:
  - `name`, `cityId`, `col`, `row` - City location
  - `armies` - Starting armies
  - `seaFleet` - Optional: Starting sea fleet
  - `isCapital` - Optional: true if this is the capital
- `totalArmies`, `totalSeaFleets`, - Calculated totals

**Factions Included:**
- Hothior (Human) - Red (#FE0000)
- Mivior (Human) - Pink (#F8A0D2)
- Muetar (Human) - Yellow (#FFFF19)
- Shucassam (Human) - Orange (#F4AC48)
- Immer (Human) - Purple (#BD9FF7)
- Pon (Human) - Blue (#1EA5FF)
- Rombune (Human) - Magenta (#E52E96)
- Neuth (Elves) - Green (#30C44C)
- Zorn (Goblins) - Teal (#7AB5A1)
- Ghem (Dwarves) - Gray (#ACACAC)
- Trolls (Trolls) - Brown (#A86051)

**Note:** Troll faction cities use Divine Right 3rd Edition naming:
- "Stone Face" (capital at 6,13)
- "The Gathering" (at 33,21)
- "The Crag" (at 27,2)
- "The Shunned Vale" (at 17,28)

#### `factions_advanced.json`
Advanced-only factions with city coordinates and IDs for special factions (e.g., The Black Hand).

### Format Features

**Minimal JSON:**
- Only includes properties that are present (no `null` or `false` values)
- Terrain is an object with only present terrain types
- Significantly smaller file size (146 KB total vs. previous 1.4 MB)

## Compact JSON Key Mapping

This section describes the abbreviated keys used in the compact JSON reference files to reduce token usage.

### Total Size Reduction

Files use compact keys with 2-space indentation for readability.

| File | Original | Compact (formatted) | Reduction |
|------|----------|---------------------|-----------|
| hexmap.json | 194KB | 100KB | **48%** |
| starting_units.json | 32KB | 18KB | **44%** |
| factions.json | 10KB | 8KB | **20%** |
| abilities.json | 0.5KB | 0.4KB | **20%** |
| personality_cards.json | 6.6KB | 6.4KB | **3%** |
| **TOTAL** | **243KB** | **136KB** | **55%** |

Note: Minified versions would be 75% smaller, but formatted versions improve human readability.

### Key Mappings

#### hexmap.json
| Compact | Full Key | Description |
|---------|----------|-------------|
| `c` | col | Column coordinate |
| `r` | row | Row coordinate |
| `t` | terrain | Terrain type(s) - string or array |
| `n` | name | Location name |
| `k` | kingdom | Kingdom/faction ID |
| `i` | intrinsic | Intrinsic defense strength |
| `cid` | cityId | City identifier |

#### factions.json
| Compact | Full Key | Description |
|---------|----------|-------------|
| `v` | version | Schema version |
| `d` | exportDate | Export timestamp |
| `f` | factions | Factions array |
| `n` | name | Faction/city name |
| `r` | raceId | Race identifier |
| `c` | color | Faction color |
| `coa` | coatOfArms | Coat of arms emoji |
| `p` | [col, row] | Position as array |
| `a` | armies | Army count |
| `sf` | seaFleet | Sea fleet count |
| `cap` | isCapital | Capital city flag |
| `msl` | monarchStartLocation | Monarch start [col, row] |

#### starting_units.json
| Compact | Full Key | Description |
|---------|----------|-------------|
| `f` | factionId | Faction identifier |
| `u` | units | Units array |
| `id` | unitId | Unit identifier |
| `n` | name | Unit name |
| `t` | unitType | Unit type (army, fleet, monarch, ambassador) |
| `c` | count | Unit count |
| `mp` | movement_points | Movement points |
| `h` | start_hex | Starting hex [col, row] |
| `cid` | cityId | Home city identifier |
| `a` | abilityIds | Ability identifiers |
| `mt` | movement_type | Movement type (omit if "standard") |
| `dep` | deployment | Special deployment rules |

#### abilities.json
| Compact | Full Key | Description |
|---------|----------|-------------|
| `v` | version | Schema version |
| `a` | abilities | Abilities array |
| `id` | abilityId | Ability identifier |
| `n` | name | Ability name |
| `refs` | ruleRefs | Rule references |

#### personality_cards.json
| Compact | Full Key | Description |
|---------|----------|-------------|
| `id` | id | Card identifier |
| `n` | name | Personality name |
| `d` | description | Full description text |

### Notes

- **dr3_rules.json** was not compacted as its hierarchical key structure (e.g., `12.3.1_rule_name`) serves as cross-references between rules
- Terrain in hexmap uses string for single terrain, array for multiple (e.g., `"forest"` or `["port", "royal"]`)
- Positions are stored as `[col, row]` arrays instead of separate `col`/`row` fields
- Default values are omitted (e.g., `movement_type: "standard"` is not stored)
- Empty arrays are omitted (e.g., no `abilities: []`)

## JSON File Sizes and Token Counts

Current file sizes and estimated token counts for all JSON reference files in `docs/refs/`:

| File | Size (bytes) | Est. Tokens |
|------|--------------|-------------|
| abilities.json | 439 | 109 |
| dr3_rules.json | 49,801 | 12,450 |
| factions.json | 8,385 | 2,096 |
| factions_advanced.json | 761 | 190 |
| hexmap.json | 99,980 | 24,995 |
| hexmap_advanced.json | 494 | 123 |
| personality_cards.json | 6,388 | 1,597 |
| schema_abilities.json | 716 | 179 |
| schema_factions.json | 1,866 | 466 |
| schema_hexmap.json | 1,314 | 328 |
| schema_starting_units.json | 1,495 | 373 |
| starting_units.json | 18,466 | 4,616 |
| starting_units_advanced.json | 766 | 191 |
| **TOTAL** | **190,871** | **47,713** |

**Note on Minification:** The current JSON files use 2-space indentation for human readability. Further file size reduction (approximately 25-30% additional reduction) could be achieved through minification (removing all whitespace). However, this would significantly reduce human readability. The current format balances token efficiency with maintainability.
