/**
 * Tests for the endsWith(x, y) function defined in test.js.
 *
 * Covers: basic behavior, boundary values, repeated substrings,
 * case sensitivity, empty strings, and invalid input handling.
 *
 * Run with: node test.endsWith.js
 */

'use strict';

const assert = require('assert');
const vm = require('vm');
const fs = require('fs');
const path = require('path');

// Load the production code without requiring an export
vm.runInThisContext(fs.readFileSync(path.join(__dirname, 'test.js'), 'utf8'));

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passed++;
  } catch (err) {
    console.log(`  ✗ ${description}`);
    console.log(`    ${err.message}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// Basic behavior
// ---------------------------------------------------------------------------
console.log('\nendsWith() — basic behavior');

test('returns true when the string ends with the given suffix', () => {
  assert.strictEqual(endsWith('hello world', 'world'), true);
});

test('returns false when the string does not end with the given suffix', () => {
  // 'hello' appears at the start, not the end
  assert.strictEqual(endsWith('hello world', 'hello'), false);
});

test('returns true when the string is equal to the suffix', () => {
  assert.strictEqual(endsWith('hello', 'hello'), true);
});

test('returns false when the suffix differs by one character at the end', () => {
  assert.strictEqual(endsWith('hello', 'hellp'), false);
});

// ---------------------------------------------------------------------------
// Empty strings
// ---------------------------------------------------------------------------
console.log('\nendsWith() — empty strings');

test('returns true when the suffix is an empty string (any string ends with "")', () => {
  assert.strictEqual(endsWith('hello', ''), true);
});

test('returns true when both the string and suffix are empty', () => {
  assert.strictEqual(endsWith('', ''), true);
});

// ---------------------------------------------------------------------------
// Boundary / length edge cases
// ---------------------------------------------------------------------------
console.log('\nendsWith() — boundary values');

test('returns false when the suffix is longer than the string', () => {
  assert.strictEqual(endsWith('hi', 'hello'), false);
});

test('returns true for a single-character string ending with that character', () => {
  assert.strictEqual(endsWith('z', 'z'), true);
});

test('returns false for a single-character string not ending with a given character', () => {
  assert.strictEqual(endsWith('a', 'b'), false);
});

// ---------------------------------------------------------------------------
// Repeated substrings
// ---------------------------------------------------------------------------
console.log('\nendsWith() — repeated substrings');

test('returns true when the suffix appears multiple times and the last occurrence is at the end', () => {
  // 'abc' occurs at index 0 and at index 3; lastIndexOf picks index 3 == 6-3
  assert.strictEqual(endsWith('abcabc', 'abc'), true);
});

test('returns false when the suffix appears in the middle but not at the end', () => {
  // 'lo' is at index 3 in 'hello world'; x.length-y.length is 9
  assert.strictEqual(endsWith('hello world', 'lo'), false);
});

// ---------------------------------------------------------------------------
// Case sensitivity
// ---------------------------------------------------------------------------
console.log('\nendsWith() — case sensitivity');

test('is case-sensitive: "World" !== "world"', () => {
  assert.strictEqual(endsWith('hello World', 'world'), false);
  assert.strictEqual(endsWith('hello World', 'World'), true);
});

// ---------------------------------------------------------------------------
// Invalid input (error conditions)
// ---------------------------------------------------------------------------
console.log('\nendsWith() — invalid input');

test('throws a TypeError when the first argument is null', () => {
  assert.throws(() => endsWith(null, 'x'), TypeError);
});

test('throws a TypeError when the first argument is undefined', () => {
  assert.throws(() => endsWith(undefined, 'x'), TypeError);
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed} passing`);
if (failed > 0) {
  console.log(`${failed} failing`);
  process.exit(1);
}
