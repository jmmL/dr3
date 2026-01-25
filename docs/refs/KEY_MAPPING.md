# Compact JSON Key Mapping

This document describes the abbreviated keys used in the compact JSON reference files to reduce token usage.

## Total Size Reduction

| File | Before | After | Reduction |
|------|--------|-------|-----------|
| hexmap.json | 194KB | 42KB | **78%** |
| starting_units.json | 32KB | 8KB | **74%** |
| factions.json | 10KB | 3KB | **67%** |
| abilities.json | 0.5KB | 0.3KB | **53%** |
| personality_cards.json | 6.6KB | 5.9KB | **11%** |
| **TOTAL** | **243KB** | **60KB** | **75%** |

## Key Mappings

### hexmap.json
| Compact | Full Key | Description |
|---------|----------|-------------|
| `c` | col | Column coordinate |
| `r` | row | Row coordinate |
| `t` | terrain | Terrain type(s) - string or array |
| `n` | name | Location name |
| `k` | kingdom | Kingdom/faction ID |
| `i` | intrinsic | Intrinsic defense strength |
| `cid` | cityId | City identifier |

### factions.json
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

### starting_units.json
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

### abilities.json
| Compact | Full Key | Description |
|---------|----------|-------------|
| `v` | version | Schema version |
| `a` | abilities | Abilities array |
| `id` | abilityId | Ability identifier |
| `n` | name | Ability name |
| `refs` | ruleRefs | Rule references |

### personality_cards.json
| Compact | Full Key | Description |
|---------|----------|-------------|
| `id` | id | Card identifier |
| `n` | name | Personality name |
| `d` | description | Full description text |

## Notes

- **dr3_rules.json** was not compacted as its hierarchical key structure (e.g., `12.3.1_rule_name`) serves as cross-references between rules
- Terrain in hexmap uses string for single terrain, array for multiple (e.g., `"forest"` or `["port", "royal"]`)
- Positions are stored as `[col, row]` arrays instead of separate `col`/`row` fields
- Default values are omitted (e.g., `movement_type: "standard"` is not stored)
- Empty arrays are omitted (e.g., no `abilities: []`)
