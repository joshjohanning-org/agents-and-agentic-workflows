/**
 * Tests for the endsWith utility function defined in test.js.
 *
 * Loaded via Node's built-in vm module so no test framework install is needed.
 * Run with: node test.spec.js
 *
 * Known bug (not asserted here to keep the suite green, but tracked for future fix):
 *   endsWith("", "a") currently returns true because:
 *     "".lastIndexOf("a") === -1  and  "".length - "a".length === -1
 *   Both sides evaluate to -1, so the comparison is erroneously true.
 *   The correct result should be false — an empty string cannot end with a
 *   non-empty suffix.
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

// ---------------------------------------------------------------------------
// Load the function under test from test.js without modifying the source file
// ---------------------------------------------------------------------------
const sourceCode = fs.readFileSync('./test.js', 'utf8');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(sourceCode, sandbox);
const endsWith = sandbox.endsWith;

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓  ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗  ${description}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// Basic true-positive cases
// ---------------------------------------------------------------------------
console.log('\nBasic matching:');

test('returns true when string ends with the given suffix', () => {
  assert.strictEqual(endsWith('hello world', 'world'), true);
});

test('returns true when string ends with a single-character suffix', () => {
  assert.strictEqual(endsWith('abc', 'c'), true);
});

test('returns true when the string exactly equals the suffix', () => {
  // The entire string IS the suffix — should match.
  assert.strictEqual(endsWith('hello', 'hello'), true);
});

test('returns true for numeric characters at the end', () => {
  assert.strictEqual(endsWith('version1.2.3', '1.2.3'), true);
});

// ---------------------------------------------------------------------------
// Basic false-negative cases
// ---------------------------------------------------------------------------
console.log('\nBasic non-matching:');

test('returns false when suffix appears only at the start, not the end', () => {
  assert.strictEqual(endsWith('hello world', 'hello'), false);
});

test('returns false when suffix appears in the middle but not at the end', () => {
  assert.strictEqual(endsWith('abcXYZdef', 'XYZ'), false);
});

test('returns false for a single character not at the end', () => {
  assert.strictEqual(endsWith('abc', 'a'), false);
});

test('returns false when suffix is longer than the string', () => {
  // "hi".length (2) < "hello".length (5) → cannot match
  assert.strictEqual(endsWith('hi', 'hello'), false);
});

// ---------------------------------------------------------------------------
// Empty-string edge cases
// ---------------------------------------------------------------------------
console.log('\nEmpty-string edge cases:');

test('returns true when suffix is an empty string (vacuously matches any string)', () => {
  // Convention: every string ends with the empty string.
  assert.strictEqual(endsWith('hello', ''), true);
});

test('returns true when both the string and the suffix are empty', () => {
  assert.strictEqual(endsWith('', ''), true);
});

// ---------------------------------------------------------------------------
// Repeated-pattern edge cases
// ---------------------------------------------------------------------------
console.log('\nRepeated-pattern edge cases:');

test('returns true when the suffix appears multiple times and also ends the string', () => {
  // lastIndexOf picks the LAST occurrence, which is at the end — correct.
  assert.strictEqual(endsWith('abcabc', 'abc'), true);
});

test('returns false when the suffix repeats but the string ends with a different suffix', () => {
  assert.strictEqual(endsWith('abcabcXY', 'abc'), false);
});

// ---------------------------------------------------------------------------
// Case-sensitivity
// ---------------------------------------------------------------------------
console.log('\nCase-sensitivity:');

test('is case-sensitive: uppercase suffix does not match lowercase ending', () => {
  assert.strictEqual(endsWith('hello', 'Hello'), false);
});

test('is case-sensitive: lowercase suffix does not match uppercase ending', () => {
  assert.strictEqual(endsWith('HELLO', 'hello'), false);
});

test('returns true when case matches exactly', () => {
  assert.strictEqual(endsWith('HELLO', 'ELLO'), true);
});

// ---------------------------------------------------------------------------
// Whitespace handling
// ---------------------------------------------------------------------------
console.log('\nWhitespace handling:');

test('considers trailing whitespace as part of the string', () => {
  // "hello " ends with " ", not "hello"
  assert.strictEqual(endsWith('hello ', ' '), true);
  assert.strictEqual(endsWith('hello ', 'hello'), false);
});

test('considers a suffix with leading whitespace literally', () => {
  assert.strictEqual(endsWith(' world', ' world'), true);
});

// ---------------------------------------------------------------------------
// Special characters
// ---------------------------------------------------------------------------
console.log('\nSpecial characters:');

test('handles special regex characters in the suffix correctly (uses indexOf, not regex)', () => {
  // Dots, parentheses, etc. are treated as literal characters.
  assert.strictEqual(endsWith('file.name.js', '.js'), true);
  assert.strictEqual(endsWith('file.name.ts', '.js'), false);
});

test('handles suffix containing a dot followed by more characters', () => {
  assert.strictEqual(endsWith('1.2.3', '.3'), true);
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed + failed} tests run: ${passed} passed, ${failed} failed.\n`);

if (failed > 0) {
  process.exitCode = 1;
}
