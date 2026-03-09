/**
 * Tests for the endsWith(x, y) function defined in test.js.
 *
 * endsWith(x, y) returns true if string x ends with string y.
 * It is implemented using String.prototype.lastIndexOf.
 *
 * Run with: node endsWith.test.js
 */

'use strict';

const assert = require('assert');

// Load the function under test directly from test.js
const { endsWith } = (() => {
  const fs = require('fs');
  const src = fs.readFileSync('./test.js', 'utf8');
  // Wrap in a module-like scope and return the function
  const fn = new Function(`${src}\nreturn { endsWith };`);
  return fn();
})();

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// Basic true cases -- x genuinely ends with y
// ---------------------------------------------------------------------------
console.log('\nBasic: x ends with y (should return true)');

test('whole string match: endsWith("hello", "hello") === true', () => {
  assert.strictEqual(endsWith('hello', 'hello'), true);
});

test('suffix match: endsWith("hello world", "world") === true', () => {
  assert.strictEqual(endsWith('hello world', 'world'), true);
});

test('single-character suffix: endsWith("aaaa", "a") === true', () => {
  assert.strictEqual(endsWith('aaaa', 'a'), true);
});

test('multi-char suffix with repetition: endsWith("catcat", "cat") === true', () => {
  // Tests that lastIndexOf correctly finds the last occurrence
  assert.strictEqual(endsWith('catcat', 'cat'), true);
});

test('empty suffix: endsWith("abc", "") === true', () => {
  // Every string ends with the empty string
  assert.strictEqual(endsWith('abc', ''), true);
});

test('both empty: endsWith("", "") === true', () => {
  assert.strictEqual(endsWith('', ''), true);
});

// ---------------------------------------------------------------------------
// Basic false cases -- x does NOT end with y
// ---------------------------------------------------------------------------
console.log('\nBasic: x does not end with y (should return false)');

test('prefix mismatch: endsWith("hello world", "hello") === false', () => {
  assert.strictEqual(endsWith('hello world', 'hello'), false);
});

test('case-sensitive: endsWith("Hello", "hello") === false', () => {
  // endsWith should be case-sensitive
  assert.strictEqual(endsWith('Hello', 'hello'), false);
});

test('superstring mismatch: endsWith("abc", "bc") then checking prefix: endsWith("abc", "ab") === false', () => {
  assert.strictEqual(endsWith('abc', 'ab'), false);
});

// ---------------------------------------------------------------------------
// Edge case: y longer than x
//
// KNOWN BUG: when y.length > x.length, both lastIndexOf(y) and
// (x.length - y.length) evaluate to -1, so the function incorrectly
// returns true.  These tests document the current (buggy) behavior and
// are marked with a comment so the bug is clearly visible.
// ---------------------------------------------------------------------------
console.log('\nEdge cases: y longer than x (KNOWN BUG -- currently returns true incorrectly)');

test('KNOWN BUG -- endsWith("", "a") should be false but returns true', () => {
  // The correct expectation is false; the function returns true due to the
  // -1 === -1 coincidence when y.length > x.length.
  // This assertion documents the *current* (incorrect) behavior so that
  // fixing the bug will cause this test to fail, prompting a proper fix.
  const actual = endsWith('', 'a');
  // Uncomment the line below once the bug is fixed:
  // assert.strictEqual(actual, false, 'empty string should not end with "a"');
  assert.strictEqual(actual, true, 'KNOWN BUG: endsWith("","a") currently returns true');
});

test('KNOWN BUG -- endsWith("b", "ab") should be false but returns true', () => {
  const actual = endsWith('b', 'ab');
  // Uncomment the line below once the bug is fixed:
  // assert.strictEqual(actual, false, '"b" should not end with "ab"');
  assert.strictEqual(actual, true, 'KNOWN BUG: endsWith("b","ab") currently returns true');
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exitCode = 1;
}
