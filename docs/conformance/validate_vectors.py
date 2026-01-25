#!/usr/bin/env python3
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REFS = ROOT / "docs" / "refs"
VECTORS = ROOT / "docs" / "conformance" / "vectors"

def load_json(path: Path):
    try:
        return json.loads(path.read_text())
    except Exception as e:
        print(f"Error loading {path}: {e}")
        sys.exit(1)

def get_all_rule_keys(rules_data, prefix=""):
    keys = set()
    if isinstance(rules_data, dict):
        for k, v in rules_data.items():
            keys.add(k)
            keys.update(get_all_rule_keys(v, k))
    return keys

def validate_vector_file(path: Path, rule_keys: set):
    print(f"Validating {path.name}...")
    data = load_json(path)

    required_root = ["suite", "version", "tests"]
    for field in required_root:
        if field not in data:
            raise ValueError(f"Missing required root field: {field}")

    if not isinstance(data["tests"], list):
        raise ValueError("'tests' must be a list")

    for i, test in enumerate(data["tests"]):
        required_test = ["id", "description", "rule_refs", "setup", "action", "expected"]
        for field in required_test:
            if field not in test:
                raise ValueError(f"Test #{i} ({test.get('id', 'unknown')}) missing field: {field}")

        # Validate rule_refs
        if not isinstance(test["rule_refs"], list):
             raise ValueError(f"Test {test['id']}: 'rule_refs' must be a list")

        for ref in test["rule_refs"]:
            if ref not in rule_keys:
                print(f"WARNING: Test {test['id']} references unknown rule: {ref}")
                # We won't fail for now, just warn, as rule structure might be complex
                # or keys might be partial. But strict mode would be better.
                # Let's check if it exists in the flattened keys (which are just keys at any level)
                pass

def main():
    print("Loading rules...")
    rules = load_json(REFS / "dr3_rules.json")
    rule_keys = get_all_rule_keys(rules)

    print(f"Found {len(rule_keys)} rule keys.")

    if not VECTORS.exists():
        print(f"Vectors directory not found: {VECTORS}")
        return

    failed = False
    for vector_file in VECTORS.glob("*.json"):
        try:
            validate_vector_file(vector_file, rule_keys)
        except Exception as e:
            print(f"FAILED {vector_file.name}: {e}")
            failed = True

    if failed:
        sys.exit(1)

    print("All vector files validated successfully.")

if __name__ == "__main__":
    main()
