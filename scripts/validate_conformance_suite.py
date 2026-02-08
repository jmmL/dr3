#!/usr/bin/env python3
"""Validate conformance suite JSON fixtures and coverage matrix."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

CONFORMANCE_DIR = Path("docs/conformance")
CHUNK_GLOB = "chunk_*/*.json"
COVERAGE_MATRIX = CONFORMANCE_DIR / "coverage_matrix.json"

ID_PATTERN = re.compile(r"^[0-9]+\.[0-9]+(\.[0-9]+)?_[a-z_]+$")
RULE_PATTERN = re.compile(r"^[0-9]+\.[0-9]+(\.[0-9]+)?$")


class ValidationError(Exception):
    pass


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def iter_test_cases(data, path: Path):
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and "tests" in data and isinstance(data["tests"], list):
        return data["tests"]
    raise ValidationError(
        f"{path} must be a JSON array or an object with a 'tests' array"
    )


def validate_test_case(test_case, path: Path, index: int):
    if not isinstance(test_case, dict):
        raise ValidationError(f"{path} test[{index}] must be an object")

    required = ["id", "description", "input", "expected"]
    for field in required:
        if field not in test_case:
            raise ValidationError(f"{path} test[{index}] missing '{field}'")

    rule_ref = test_case.get("rule_ref")
    rule_refs = test_case.get("rule_refs")
    if rule_ref is None and rule_refs is None:
        raise ValidationError(
            f"{path} test[{index}] missing 'rule_ref' or 'rule_refs'"
        )
    if rule_ref is not None and rule_refs is not None:
        raise ValidationError(
            f"{path} test[{index}] has both 'rule_ref' and 'rule_refs' (must be one or the other)"
        )

    if rule_ref is not None:
        if not isinstance(rule_ref, str) or not RULE_PATTERN.match(rule_ref):
            raise ValidationError(f"{path} test[{index}] invalid rule_ref")

    if rule_refs is not None:
        if not isinstance(rule_refs, list) or len(rule_refs) < 2:
            raise ValidationError(
                f"{path} test[{index}] rule_refs must be a list of 2+ strings"
            )
        for ref in rule_refs:
            if not isinstance(ref, str) or not RULE_PATTERN.match(ref):
                raise ValidationError(
                    f"{path} test[{index}] invalid rule_refs entry '{ref}'"
                )

    test_id = test_case["id"]
    if not isinstance(test_id, str) or not ID_PATTERN.match(test_id):
        raise ValidationError(f"{path} test[{index}] invalid id '{test_id}'")

    if not isinstance(test_case["description"], str):
        raise ValidationError(f"{path} test[{index}] description must be string")
    if not isinstance(test_case["input"], dict):
        raise ValidationError(f"{path} test[{index}] input must be object")
    if not isinstance(test_case["expected"], dict):
        raise ValidationError(f"{path} test[{index}] expected must be object")


def collect_tests():
    if not CONFORMANCE_DIR.exists():
        raise ValidationError("docs/conformance does not exist")

    paths = sorted(CONFORMANCE_DIR.glob(CHUNK_GLOB))
    if not paths:
        raise ValidationError("No conformance test files found under chunk_*")

    tests = []
    for path in paths:
        data = load_json(path)
        for index, test_case in enumerate(iter_test_cases(data, path)):
            validate_test_case(test_case, path, index)
            tests.append(test_case)
    return tests


def validate_coverage_matrix(test_ids):
    if not COVERAGE_MATRIX.exists():
        return

    data = load_json(COVERAGE_MATRIX)
    if not isinstance(data, dict):
        raise ValidationError("coverage_matrix.json must be an object")

    rules = data.get("rules")
    if rules is None:
        return
    if not isinstance(rules, dict):
        raise ValidationError("coverage_matrix.json 'rules' must be an object")

    matrix_test_ids = set()
    for rule_ref, ids in rules.items():
        if not RULE_PATTERN.match(rule_ref):
            raise ValidationError(f"Invalid rule key in coverage matrix: {rule_ref}")
        if not isinstance(ids, list):
            raise ValidationError(f"Coverage entry for {rule_ref} must be a list")
        for test_id in ids:
            if test_id not in test_ids:
                raise ValidationError(
                    f"Coverage matrix references missing test id '{test_id}'"
                )
            matrix_test_ids.add(test_id)

    orphaned = test_ids - matrix_test_ids
    if orphaned:
        raise ValidationError(
            f"Tests not tracked in coverage matrix: {sorted(orphaned)}"
        )


def main():
    try:
        tests = collect_tests()
        test_ids = {test_case["id"] for test_case in tests}
        validate_coverage_matrix(test_ids)
    except ValidationError as exc:
        print(f"Validation error: {exc}")
        return 1

    print(f"Validated {len(tests)} conformance tests.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
