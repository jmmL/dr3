# Divine Right Conformance Suite

This directory contains the **Conformance Suite** for Divine Right webapp implementations.

## Purpose

The purpose of this suite is to provide a standardized set of "Test Vectors" that any implementation of the Divine Right rules can verify against. This ensures that the game logic (movement, combat, setup, etc.) matches the official rules and data as defined in this repository.

## Structure

*   `vectors/`: Contains JSON files defining test cases. Each file groups related tests (e.g., `movement.json`, `combat.json`).
*   `schema_vector.json`: The JSON Schema that defines the format of the test vectors.
*   `validate_vectors.py`: A utility script to validate that the test vector files themselves strictly adhere to the schema.

## How to Use

A webapp implementation should:
1.  **Ingest** the JSON files from `vectors/`.
2.  **Implement** a test runner that:
    *   Sets up the game state according to the `setup` block of each test.
    *   Performs the `action` specified.
    *   **Asserts** that the resulting state or return value matches the `expected` block.

## Test Vector Format

Each JSON file in `vectors/` should contain an object with a `tests` array. Each test object has:

*   `id`: Unique identifier for the test case.
*   `description`: Human-readable description.
*   `rule_refs`: Array of strings referencing rule keys from `docs/refs/dr3_rules.json`.
*   `setup`: Object defining the initial state (units, positions, etc.).
*   `action`: Object defining the operation to perform.
*   `expected`: Object defining the expected outcome.

Example:
```json
{
  "id": "move_plain_1",
  "description": "Regular army moves 1 hex into clear terrain",
  "rule_refs": ["19.1_clear"],
  "setup": {
    "units": [{ "id": "u1", "type": "regular", "hex": [10, 10] }]
  },
  "action": {
    "type": "move",
    "unitId": "u1",
    "path": [[10, 11]]
  },
  "expected": {
    "success": true,
    "remaining_mp": 2
  }
}
```
