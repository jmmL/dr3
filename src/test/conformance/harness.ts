import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

export interface ConformanceTest {
  id: string;
  rule_ref?: string;
  rule_refs?: string[];
  description: string;
  input: Record<string, unknown>;
  expected: Record<string, unknown>;
  action?: { type: string; args?: Record<string, unknown> };
  tags?: string[];
  notes?: string;
}

export interface ConformanceSuite {
  suite_version: string;
  rule_section: string;
  tests: ConformanceTest[];
}

export type AdapterFn = (
  input: Record<string, unknown>,
  expected: Record<string, unknown>,
) => void;

/**
 * Load a conformance test suite from a JSON file.
 */
export function loadSuite(relativePath: string): ConformanceSuite {
  const fullPath = path.resolve(
    __dirname,
    '../../../docs/conformance',
    relativePath,
  );
  const raw = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(raw) as ConformanceSuite;
}

/**
 * Run a conformance suite using the provided adapter function.
 * The adapter translates test input/expected into engine function calls + assertions.
 */
export function runConformanceSuite(
  suitePath: string,
  adapter: AdapterFn,
  options: { skip?: string[] } = {},
): void {
  const suite = loadSuite(suitePath);

  describe(`Conformance: ${suite.rule_section}`, () => {
    for (const test of suite.tests) {
      if (options.skip?.includes(test.id)) {
        it.skip(`${test.id}: ${test.description}`, () => {});
        continue;
      }

      it(`${test.id}: ${test.description}`, () => {
        adapter(test.input, test.expected);
      });
    }
  });
}

/**
 * Helper to assert expected properties exist in a result object.
 */
export function assertExpected(
  result: Record<string, unknown>,
  expected: Record<string, unknown>,
): void {
  for (const [key, value] of Object.entries(expected)) {
    expect(result[key]).toEqual(value);
  }
}
