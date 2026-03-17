#!/usr/bin/env python3
"""Classify conformance chunks by test wiring depth."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFORMANCE_ROOT = ROOT / "docs" / "conformance"
TEST_ROOT = ROOT / "src" / "test" / "conformance"


def load_tests_count(path: Path) -> int:
    data = json.loads(path.read_text(encoding="utf-8"))
    tests = data.get("tests", data if isinstance(data, list) else [])
    return len(tests)


def main() -> int:
    adapter_text = "\n".join(
        path.read_text(encoding="utf-8")
        for path in sorted((TEST_ROOT / "adapters").glob("*.test.ts"))
    )
    runtime_text = "\n".join(
        path.read_text(encoding="utf-8")
        for path in sorted((TEST_ROOT / "runtime").glob("*.test.ts"))
    )

    rows: list[tuple[str, str, int]] = []
    for path in sorted(CONFORMANCE_ROOT.glob("chunk_*/*.json")):
        relative = path.relative_to(CONFORMANCE_ROOT).as_posix()
        if relative in runtime_text:
            status = "runtime-covered"
        elif relative in adapter_text:
            status = "adapter-only"
        else:
            status = "unwired"
        rows.append((relative, status, load_tests_count(path)))

    summary = {
        "runtime-covered": sum(1 for _, status, _ in rows if status == "runtime-covered"),
        "adapter-only": sum(1 for _, status, _ in rows if status == "adapter-only"),
        "unwired": sum(1 for _, status, _ in rows if status == "unwired"),
    }

    print("Conformance Coverage Report")
    print("===========================")
    print(
        "Summary:"
        f" runtime-covered={summary['runtime-covered']},"
        f" adapter-only={summary['adapter-only']},"
        f" unwired={summary['unwired']}"
    )
    print("")
    print("| Chunk | Status | Tests |")
    print("|---|---|---:|")
    for relative, status, test_count in rows:
        print(f"| `{relative}` | `{status}` | {test_count} |")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
