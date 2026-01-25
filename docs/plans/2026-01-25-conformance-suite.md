# Conformance Suite Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Create a declarative, implementation-agnostic conformance suite that validates game logic against the DR3 rules.

**Architecture:** Test cases are pure JSON data files organized by rule section. Any implementation (TypeScript, Python, Rust, etc.) can parse these fixtures and validate their game engine produces correct outputs. The JSON files are the specification — implementations are conformant if they pass all tests.

**Tech Stack:** JSON test fixtures, JSON Schema for validation, no runtime dependencies.

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | Pure game logic assertions | Data validation is separate concern |
| Organization | Mirror rule structure | Direct traceability, easy coverage verification |
| Format | Declarative JSON | Precise, machine-parseable, implementation-agnostic |
| Context | Minimal inputs | Focused tests, obvious failures |
| Randomness | Parameterized roll outcomes | Die result as input, assert effects |
| Coverage | Complete, chunked delivery | Comprehensive foundation, manageable effort |
| Completeness | Include negative test cases | Validate what is NOT allowed, not just what is |

---

## Test Case Schema

### Base Structure

Every test case follows this structure:

```json
{
  "id": "25.4.1_combat_modifier_basic",
  "rule_ref": "25.4.1",
  "description": "Combat modifier is (larger/smaller) - 1, fractions dropped",
  "input": { },
  "expected": { }
}
```

The `rule_ref` field provides direct lookup into `dr3_rules.min.json` for full rule context and verification.

### Schema Definition

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["id", "description", "input", "expected"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[0-9]+\\.[0-9]+(\\.[0-9]+)?_[a-z_]+$",
      "description": "Unique identifier: rule_ref + descriptive suffix"
    },
    "rule_ref": {
      "type": "string",
      "pattern": "^[0-9]+\\.[0-9]+(\\.[0-9]+)?$",
      "description": "Reference to rule in dr3_rules.min.json"
    },
    "rule_refs": {
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^[0-9]+\\.[0-9]+(\\.[0-9]+)?$"
      },
      "minItems": 2,
      "description": "References to multiple rules for integration tests"
    },
    "description": {
      "type": "string",
      "description": "Human-readable description of what this tests"
    },
    "input": {
      "type": "object",
      "description": "Minimal context needed to evaluate the rule"
    },
    "expected": {
      "type": "object",
      "description": "Expected outcome from applying the rule"
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Optional categorization tags (e.g., 'negative', 'boundary', 'happy_path')"
    },
    "notes": {
      "type": "string",
      "description": "Optional clarifying notes for edge cases"
    }
  },
  "oneOf": [
    { "required": ["rule_ref"] },
    { "required": ["rule_refs"] }
  ]
}
```

### File Organization

```
docs/conformance/
├── schema/
│   └── test_case.schema.json
├── chunk_1_foundations/
│   ├── 04_unit_types.json
│   ├── 05_faction_classification.json
│   ├── 06_terrain_capabilities.json
│   └── 19_terrain.json
├── chunk_2_core_mechanics/
│   ├── 18_movement.json
│   ├── 25_combat.json
│   └── 26_leaders.json
├── chunk_3_advanced_mechanics/
│   ├── 12_diplomacy.json
│   ├── 13_diplomacy_cards.json
│   ├── 14_personality_cards.json
│   └── 17_sieges.json
├── chunk_4_events_outcomes/
│   ├── 08_random_events.json
│   ├── 28_death_and_capture.json
│   └── 29_victory_conditions.json
├── chunk_5_special_rules/
│   ├── 30_special_kingdom_rules.json
│   └── 31_cities_vs_castles.json
├── chunk_6_supporting/
│   ├── 09_mercenary_units.json
│   ├── 10_friendly_location.json
│   ├── 11_random_determination.json
│   ├── 16_allied_forces.json
│   ├── 20_ports.json
│   ├── 21_fleet_movement.json
│   ├── 22_sea_transport.json
│   ├── 23_zones_of_control.json
│   ├── 24_stacking.json
│   └── 27_leader_adrift.json
└── chunk_7_integration/
    └── rule_interactions.json
```

---

## Delivery Chunks

### Chunk 1: Foundations
**Rules:** 4, 5, 6, 19
**Rationale:** These define the building blocks (unit types, faction classification, terrain costs) that all other rules reference.

| Rule | Test Count (est.) | Key Assertions |
|------|-------------------|----------------|
| 4_unit_types | ~15 | Combat unit classification, leader identification |
| 5_faction_classification | ~12 | Human vs non-human lists, retreat success rolls |
| 6_terrain_capabilities | ~10 | Tree/mountain symbol effects, home kingdom bonus |
| 19_terrain | ~25 | Movement costs for all terrain types, cumulative effects |

### Chunk 2: Core Mechanics
**Rules:** 18, 25, 26
**Rationale:** Movement and combat are the heart of gameplay. Most other rules modify these.

| Rule | Test Count (est.) | Key Assertions |
|------|-------------------|----------------|
| 18_movement | ~20 | MP spending, minimum movement, stack movement, restrictions |
| 25_combat | ~40 | Modifiers, resolution, ties, retreat before combat, advance |
| 26_leaders | ~25 | Movement bonus, combat bonus, fate rolls, lone leader rules |

### Chunk 3: Advanced Mechanics
**Rules:** 12, 13, 14, 17
**Rationale:** Diplomacy and sieges are complex subsystems with many edge cases.

| Rule | Test Count (est.) | Key Assertions |
|------|-------------------|----------------|
| 12_diplomacy | ~35 | All four functions, thresholds, modifiers, banishment |
| 13_diplomacy_cards | ~15 | Card effects, banishment triggers |
| 14_personality_cards | ~10 | Modifier applications |
| 17_sieges | ~45 | Requirements, zones, modifiers, resolution, forced peace |

### Chunk 4: Events & Outcomes
**Rules:** 8, 28, 29
**Rationale:** Random events drive game dynamics; death/capture and victory determine outcomes.

| Rule | Test Count (est.) | Key Assertions |
|------|-------------------|----------------|
| 8_random_events | ~25 | All 11 event outcomes, placement rules |
| 28_death_and_capture | ~30 | Confusion, prisoner rules, player elimination |
| 29_victory_conditions | ~15 | Point calculations for all scoring events |

### Chunk 5: Special Rules
**Rules:** 30, 31
**Rationale:** Kingdom-specific exceptions (Trolls, Goblins, Dwarves) and city/castle distinction.

| Rule | Test Count (est.) | Key Assertions |
|------|-------------------|----------------|
| 30_special_kingdom_rules | ~20 | Troll regeneration, Goblin deployment, no castles |
| 31_cities_vs_castles | ~10 | Deployment vs defense distinction |

### Chunk 6: Supporting Rules
**Rules:** 9, 10, 11, 16, 20, 21, 22, 23, 24, 27
**Rationale:** Smaller rule sets that support the core mechanics.

| Rule | Test Count (est.) | Key Assertions |
|------|-------------------|----------------|
| 9_mercenary_units | ~10 | Placement, stealing rules |
| 10_friendly_location | ~8 | Definition conditions |
| 11_random_determination | ~5 | Method validation |
| 16_allied_forces | ~12 | Movement, stacking, coordination |
| 20_ports | ~10 | Castle-port vs non-castle port |
| 21_fleet_movement | ~10 | Terrain, restrictions |
| 22_sea_transport | ~12 | Capacity, embark/debark |
| 23_zones_of_control | ~3 | Confirms ZoC does not exist |
| 24_stacking | ~15 | All stacking rules |
| 27_leader_adrift | ~10 | Isle of Fright rules |

### Chunk 7: Integration Tests
**Scope:** Multi-rule scenarios
**Rationale:** Catches edge cases where rules interact in complex ways.

| Scenario Category | Test Count (est.) |
|-------------------|-------------------|
| Fleet transporting army in combat | ~5 |
| Relieving a siege | ~5 |
| Diplomacy on captured monarch | ~5 |
| Deactivation during siege | ~5 |
| Random event during siege | ~5 |

**Total Estimated Tests:** ~450-500

---

## Canonical Game-State Shape (Minimal, Explicit)

To prevent divergent interpretations of “minimal inputs,” define a shared, minimal game-state
shape that tests can embed inside `input`. This schema is intentionally small and extensible:

```json
{
  "game_state": {
    "turn": { "number": 1, "phase": "movement" },
    "factions": [
      { "id": "hothior", "type": "human", "status": "active" }
    ],
    "units": [
      {
        "id": "u1",
        "faction_id": "hothior",
        "unit_type": "army",
        "strength": 1,
        "location": [12, 5],
        "status": "ready"
      }
    ],
    "locations": [
      {
        "hex": [12, 5],
        "terrain": ["clear"],
        "kingdom": "hothior",
        "intrinsic_defense": 4,
        "is_castle": true,
        "is_city": false
      }
    ],
    "modifiers": [
      { "type": "diplomacy_card", "value": 2 }
    ]
  }
}
```

Use this as the shared baseline for integration tests (and any rule that needs broader context),
while keeping single-rule tests free to include only the required subset.

## Example Test Cases by Rule Type

### Terrain Movement Cost (Rule 19)

```json
{
  "id": "19.1.1_clear_terrain_cost",
  "rule_ref": "19.1.1",
  "description": "Clear terrain costs 1 movement point",
  "input": {
    "terrain": "clear"
  },
  "expected": {
    "movement_cost": 1
  }
}
```

```json
{
  "id": "19.6.2_mountain_must_stop",
  "rule_ref": "19.6.2",
  "description": "Units must stop after entering mountain hex",
  "input": {
    "terrain": "mountain",
    "unit_has_mountain_symbol": false
  },
  "expected": {
    "movement_cost": 3,
    "must_stop": true
  }
}
```

```json
{
  "id": "19.17.2_cumulative_terrain",
  "rule_ref": "19.17.2",
  "description": "Forested mountain costs 5 MP and requires stop",
  "input": {
    "terrain": ["forest", "mountain"]
  },
  "expected": {
    "movement_cost": 5,
    "must_stop": true
  }
}
```

### Combat Modifier (Rule 25.4)

```json
{
  "id": "25.4.1_combat_modifier_attacker_advantage",
  "rule_ref": "25.4.1",
  "description": "6 attackers vs 2 defenders: modifier = (6/2)-1 = +2 to attacker",
  "input": {
    "attacker_count": 6,
    "defender_count": 2
  },
  "expected": {
    "modifier": 2,
    "applies_to": "attacker"
  }
}
```

```json
{
  "id": "25.4.2_combat_modifier_fractions_dropped",
  "rule_ref": "25.4.2",
  "description": "5 attackers vs 2 defenders: (5/2)=2.5, drop to 2, minus 1 = +1",
  "input": {
    "attacker_count": 5,
    "defender_count": 2
  },
  "expected": {
    "modifier": 1,
    "applies_to": "attacker"
  }
}
```

```json
{
  "id": "25.4.4_combat_modifier_defender_minimum",
  "rule_ref": "25.4.4",
  "description": "3 defenders vs 2 attackers: formula gives 0, but minimum +1 applies",
  "input": {
    "attacker_count": 2,
    "defender_count": 3
  },
  "expected": {
    "modifier": 1,
    "applies_to": "defender"
  }
}
```

### Combat Resolution (Rule 25.3)

```json
{
  "id": "25.3.2_combat_winner_higher_roll",
  "rule_ref": "25.3.2",
  "description": "Higher modified roll wins combat",
  "input": {
    "attacker_roll": 4,
    "attacker_modifier": 2,
    "defender_roll": 3,
    "defender_modifier": 0
  },
  "expected": {
    "attacker_modified_total": 6,
    "defender_modified_total": 3,
    "winner": "attacker",
    "defender_losses": 3
  }
}
```

```json
{
  "id": "25.3.4_combat_tie_both_lose",
  "rule_ref": "25.3.4",
  "description": "Tied rolls: both sides lose units equal to the tied result",
  "input": {
    "attacker_roll": 4,
    "attacker_modifier": 0,
    "defender_roll": 4,
    "defender_modifier": 0
  },
  "expected": {
    "attacker_modified_total": 4,
    "defender_modified_total": 4,
    "winner": "tie",
    "attacker_losses": 4,
    "defender_losses": 4
  }
}
```

### Retreat Before Combat (Rule 25.2)

```json
{
  "id": "25.2.2.1_human_retreat_success",
  "rule_ref": "25.2.2.1",
  "description": "Human units retreat successfully on rolls of 4, 5, or 6",
  "input": {
    "faction_type": "human",
    "retreat_roll": 4
  },
  "expected": {
    "retreat_successful": true
  }
}
```

```json
{
  "id": "25.2.2.2_non_human_retreat_success",
  "rule_ref": "25.2.2.2",
  "description": "Non-human units retreat successfully on rolls of 3, 4, 5, or 6",
  "input": {
    "faction_type": "non_human",
    "retreat_roll": 3
  },
  "expected": {
    "retreat_successful": true
  }
}
```

### Siege Modifier (Rule 17.9)

```json
{
  "id": "17.9.4_siege_modifier_example_1",
  "rule_ref": "17.9.4",
  "description": "15 attackers vs 4 defense + 3 inside = +1 modifier",
  "input": {
    "besieging_units": 15,
    "intrinsic_defense": 4,
    "units_inside": 3
  },
  "expected": {
    "modifier": 1
  }
}
```

```json
{
  "id": "17.9.5_siege_modifier_example_2",
  "rule_ref": "17.9.5",
  "description": "15 attackers vs 4 defense + 4 inside = +0 modifier",
  "input": {
    "besieging_units": 15,
    "intrinsic_defense": 4,
    "units_inside": 4
  },
  "expected": {
    "modifier": 0
  }
}
```

### Siege Resolution (Rule 17.8)

```json
{
  "id": "17.8.4_siege_success_on_six",
  "rule_ref": "17.8.4",
  "description": "Siege succeeds on modified roll of 6+",
  "input": {
    "siege_roll": 5,
    "siege_modifier": 1
  },
  "expected": {
    "modified_roll": 6,
    "castle_taken": true,
    "units_inside_eliminated": true,
    "leaders_require_fate_roll": true
  }
}
```

```json
{
  "id": "17.8.3_siege_continues_on_five",
  "rule_ref": "17.8.3",
  "description": "Siege continues on rolls 1-5 (before modifier)",
  "input": {
    "siege_roll": 5,
    "siege_modifier": 0
  },
  "expected": {
    "modified_roll": 5,
    "castle_taken": false,
    "siege_continues": true
  }
}
```

### Diplomacy Threshold (Rule 12.3)

```json
{
  "id": "12.3.1.3_activate_threshold",
  "rule_ref": "12.3.1.3",
  "description": "Activation requires modified roll >= 6",
  "input": {
    "function": "activate_neutral_monarch",
    "die_roll": 4,
    "diplomacy_card_modifier": 2,
    "personality_modifier": 0,
    "diplomatic_penalty": 0
  },
  "expected": {
    "modified_roll": 6,
    "success": true
  }
}
```

```json
{
  "id": "12.3.2.3_deactivate_threshold",
  "rule_ref": "12.3.2.3",
  "description": "Deactivation requires modified roll >= 7",
  "input": {
    "function": "deactivate_enemy_allied_monarch",
    "die_roll": 4,
    "diplomacy_card_modifier": 2,
    "personality_modifier": 0,
    "diplomatic_penalty": 0
  },
  "expected": {
    "modified_roll": 6,
    "success": false
  }
}
```

### Leader Fate Roll (Rule 26.6)

```json
{
  "id": "26.6.2.1_fate_roll_killed",
  "rule_ref": "26.6.2.1",
  "description": "Leader killed on fate roll of 1",
  "input": {
    "fate_roll": 1
  },
  "expected": {
    "outcome": "killed"
  }
}
```

```json
{
  "id": "26.6.2.3_fate_roll_captured",
  "rule_ref": "26.6.2.3",
  "description": "Leader captured on fate roll of 6",
  "input": {
    "fate_roll": 6
  },
  "expected": {
    "outcome": "captured"
  }
}
```

### Victory Points (Rule 29.3)

```json
{
  "id": "29.3.1_plunder_castle_points",
  "rule_ref": "29.3.1",
  "description": "Plundering castle awards 5 × intrinsic defense",
  "input": {
    "action": "plunder_castle",
    "intrinsic_defense": 4,
    "is_royal_castle": false
  },
  "expected": {
    "victory_points": 20
  }
}
```

```json
{
  "id": "29.3.2_plunder_royal_castle_points",
  "rule_ref": "29.3.2",
  "description": "Plundering royal castle awards 10 × intrinsic defense",
  "input": {
    "action": "plunder_castle",
    "intrinsic_defense": 4,
    "is_royal_castle": true
  },
  "expected": {
    "victory_points": 40
  }
}
```

### Random Events (Rule 8.2)

```json
{
  "id": "8.2.7_no_event_on_seven",
  "rule_ref": "8.2.7",
  "description": "Roll of 7 results in no event",
  "input": {
    "event_roll": 7
  },
  "expected": {
    "event": "no_event",
    "effect": null
  }
}
```

```json
{
  "id": "8.2.8_reinforcements_on_eight",
  "rule_ref": "8.2.8",
  "description": "Roll of 8 brings 2 mercenary units into play",
  "input": {
    "event_roll": 8
  },
  "expected": {
    "event": "reinforcements",
    "mercenary_units_gained": 2,
    "placement": "any_friendly_castle_or_port"
  }
}
```

### Special Kingdom: Troll Regeneration (Rule 30.1.4)

```json
{
  "id": "30.1.4.2_troll_regeneration",
  "rule_ref": "30.1.4.2",
  "description": "Trolls regenerate one eliminated regular unit at start of each turn",
  "input": {
    "faction": "trolls",
    "eliminated_regulars": 2,
    "turn_phase": "start_of_turn"
  },
  "expected": {
    "units_regenerated": 1,
    "eliminated_regulars_after": 1
  }
}
```

### Special Kingdom: Goblin Deployment (Rule 30.2.1)

```json
{
  "id": "30.2.1.4_goblin_no_adjacency",
  "rule_ref": "30.2.1.4",
  "description": "Nithmere Mountains goblins may not be deployed adjacent to each other",
  "input": {
    "unit_type": "goblin_nithmere",
    "proposed_hex": [20, 5],
    "existing_goblin_hexes": [[20, 6], [21, 7]]
  },
  "expected": {
    "valid_placement": false,
    "reason": "adjacent_to_existing_goblin"
  }
}
```

---

## Negative Test Cases

Negative tests validate what is NOT allowed. They use the `tags: ["negative"]` field for filtering.

### Invalid Movement (Rule 18.5)

```json
{
  "id": "18.5.1_cannot_enter_enemy_hex",
  "rule_ref": "18.5.1",
  "description": "Units cannot enter hex containing enemy unit",
  "tags": ["negative"],
  "input": {
    "unit_type": "army",
    "target_hex_contains": "enemy_unit"
  },
  "expected": {
    "move_allowed": false,
    "reason": "enemy_occupied"
  }
}
```

```json
{
  "id": "18.5.5_land_unit_cannot_cross_sea",
  "rule_ref": "18.5.5",
  "description": "Land units cannot cross all-sea hexsides",
  "tags": ["negative"],
  "input": {
    "unit_type": "army",
    "hexside_type": "all_sea"
  },
  "expected": {
    "move_allowed": false,
    "reason": "land_unit_sea_boundary"
  }
}
```

### Invalid Siege Declaration (Rule 17.1)

```json
{
  "id": "17.1.3_siege_insufficient_force",
  "rule_ref": "17.1.3",
  "description": "Cannot declare siege without sufficient force",
  "tags": ["negative"],
  "input": {
    "besieging_units": 3,
    "intrinsic_defense": 4,
    "units_inside": 2
  },
  "expected": {
    "siege_allowed": false,
    "reason": "insufficient_force",
    "required_minimum": 6
  }
}
```

### Invalid Diplomacy (Rule 12.3.3)

```json
{
  "id": "12.3.3.1_assassination_limit",
  "rule_ref": "12.3.3.1",
  "description": "Assassination attempt limited to once per game per player",
  "tags": ["negative"],
  "input": {
    "function": "attempted_assassination",
    "previous_assassination_attempts": 1
  },
  "expected": {
    "action_allowed": false,
    "reason": "assassination_already_attempted"
  }
}
```

### Invalid Stacking (Rule 24.2)

```json
{
  "id": "24.2.2_allied_kingdoms_cannot_stack",
  "rule_ref": "24.2.2",
  "description": "Different allied kingdoms cannot end turn in same hex",
  "tags": ["negative"],
  "input": {
    "units": [
      { "kingdom": "hothior", "type": "army" },
      { "kingdom": "mivior", "type": "army" }
    ],
    "relationship": "allied_to_same_player"
  },
  "expected": {
    "stacking_allowed": false,
    "reason": "different_allied_kingdoms"
  }
}
```

### Boundary Conditions

```json
{
  "id": "25.4_combat_equal_forces_no_modifier",
  "rule_ref": "25.4.1",
  "description": "Equal forces: (3/3)-1 = 0, no modifier",
  "tags": ["boundary"],
  "input": {
    "attacker_count": 3,
    "defender_count": 3
  },
  "expected": {
    "modifier": 0,
    "applies_to": null
  }
}
```

```json
{
  "id": "17.1_minimum_siege_force",
  "rule_ref": "17.1.3",
  "description": "Exactly minimum force required: siege allowed",
  "tags": ["boundary"],
  "input": {
    "besieging_units": 6,
    "intrinsic_defense": 4,
    "units_inside": 2
  },
  "expected": {
    "siege_allowed": true
  }
}
```

---

## Implementation Notes

### For Test Consumers

Any conformant implementation must:

1. **Parse** the JSON test files
2. **Initialize** game state from `input` fields
3. **Execute** the rule being tested
4. **Assert** results match `expected` fields exactly

### Handling Optional Fields

- `tags`: Ignore if not present
- `notes`: For human understanding only, not machine-processed

### Extensibility

When adding integration tests (Chunk 7), test cases may include:

```json
{
  "id": "integration_siege_relief",
  "rule_refs": ["17.12", "25.3", "25.13"],
  "description": "Relieving force attacks besiegers, wins, advances into castle",
  "input": {
    "game_state": "...",
    "action_sequence": ["move_adjacent", "attack", "advance"]
  },
  "expected": {
    "siege_broken": true,
    "relieving_force_location": "inside_castle"
  }
}
```

Note the plural `rule_refs` for multi-rule scenarios.

### Coverage Matrix

Maintain a simple coverage matrix that maps every rule reference in `dr3_rules.min.json` to one
or more test IDs. This can live as `docs/conformance/coverage_matrix.json` and is updated as
tests are added.

### Versioning

Add `suite_version` at the file level (or as a shared header object) to make future schema or rule
adjustments explicit and reproducible. Use semantic-style increments (e.g., `1.0.0`) for the suite.

### Deterministic Randomness

Where a test depends on multiple rolls or chained random effects, include a deterministic roll
sequence in `input.rolls` (e.g., `[6, 2, 5]`) and specify each consumption point in the description.

---

## Task Breakdown

### Chunk 1: Foundations (~62 tests)

#### Task 1.1: Create directory structure and schema
- Create `docs/conformance/schema/test_case.schema.json`
- Create chunk directories
- Add `docs/conformance/coverage_matrix.json` template

#### Task 1.1b: Add validation harness
- Add `scripts/validate_conformance_suite.py`
- Validate required fields, `rule_ref`/`rule_refs` patterns, and basic type checks
- Validate coverage_matrix references exist in test cases

#### Task 1.2: Write 04_unit_types.json (~15 tests)
- Test combat unit identification
- Test leader identification
- Test unit type properties

#### Task 1.3: Write 05_faction_classification.json (~12 tests)
- Test human faction list
- Test non-human faction list
- Test retreat roll thresholds by type

#### Task 1.4: Write 06_terrain_capabilities.json (~10 tests)
- Test tree symbol effects
- Test mountain symbol effects
- Test home kingdom bonus

#### Task 1.5: Write 19_terrain.json (~25 tests)
- Test all terrain movement costs
- Test special terrain rules (must stop, etc.)
- Test cumulative terrain

### Chunk 2: Core Mechanics (~85 tests)

#### Task 2.1: Write 18_movement.json (~20 tests)
#### Task 2.2: Write 25_combat.json (~40 tests)
#### Task 2.3: Write 26_leaders.json (~25 tests)

### Chunk 3: Advanced Mechanics (~105 tests)

#### Task 3.1: Write 17_sieges.json (~45 tests)
#### Task 3.2: Write 12_diplomacy.json (~35 tests)
#### Task 3.3: Write 13_diplomacy_cards.json (~15 tests)
#### Task 3.4: Write 14_personality_cards.json (~10 tests)

### Chunk 4: Events & Outcomes (~70 tests)

#### Task 4.1: Write 08_random_events.json (~25 tests)
#### Task 4.2: Write 28_death_and_capture.json (~30 tests)
#### Task 4.3: Write 29_victory_conditions.json (~15 tests)

### Chunk 5: Special Rules (~30 tests)

#### Task 5.1: Write 30_special_kingdom_rules.json (~20 tests)
#### Task 5.2: Write 31_cities_vs_castles.json (~10 tests)

### Chunk 6: Supporting Rules (~95 tests)

#### Task 6.1: Write 09_mercenary_units.json (~10 tests)
#### Task 6.2: Write 10_friendly_location.json (~8 tests)
#### Task 6.3: Write 11_random_determination.json (~5 tests)
#### Task 6.4: Write 16_allied_forces.json (~12 tests)
#### Task 6.5: Write 20_ports.json (~10 tests)
#### Task 6.6: Write 21_fleet_movement.json (~10 tests)
#### Task 6.7: Write 22_sea_transport.json (~12 tests)
#### Task 6.8: Write 23_zones_of_control.json (~3 tests)
#### Task 6.9: Write 24_stacking.json (~15 tests)
#### Task 6.10: Write 27_leader_adrift.json (~10 tests)

### Chunk 7: Integration (~25 tests)

#### Task 7.1: Write rule_interactions.json (~25 tests)

---

## Success Criteria

The conformance suite is complete when:

1. Every numbered rule in `dr3_rules.min.json` has at least one corresponding test
2. All test files validate against `test_case.schema.json` and the harness checks
3. Edge cases from rule notes and examples are covered
4. A reference implementation passes all tests

---

## Next Steps

Ready to begin implementation? Start with **Chunk 1: Foundations** to establish the directory structure and foundational test cases that other chunks will build upon.
