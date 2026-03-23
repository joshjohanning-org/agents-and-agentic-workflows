'use strict';

/**
 * Tests for the endsWith(x, y) function defined in test.js.
 *
 * endsWith(x, y) returns true when string x ends with string y,
 * using x.lastIndexOf(y) compared to x.length - y.length.
 *
 * Note: the implementation computes lastIndexOf twice (the stored `index`
 * variable is unused), which is a performance quirk but not a correctness bug.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

// Load endsWith from test.js without modifying that file
const src = fs.readFileSync(path.join(__dirname, 'test.js'), 'utf8');
const context = vm.createContext({});
vm.runInContext(src, context);
const endsWith = context.endsWith;

describe('endsWith(x, y)', () => {

  // --- Basic true/false cases ---

  test('returns true when x ends with y', () => {
    assert.equal(endsWith('hello world', 'world'), true);
  });

  test('returns false when x does not end with y', () => {
    assert.equal(endsWith('hello world', 'hello'), false);
  });

  test('returns true when x and y are identical', () => {
    // The entire string is its own suffix
    assert.equal(endsWith('hello', 'hello'), true);
  });

  test('returns true for a single matching character at the end', () => {
    assert.equal(endsWith('hello', 'o'), true);
  });

  test('returns false for a single non-matching character', () => {
    assert.equal(endsWith('hello', 'H'), false);
  });

  // --- Edge cases: empty strings ---

  test('returns true when y is an empty string (empty string is a suffix of everything)', () => {
    // lastIndexOf('') on any string returns string.length, so length - 0 === length
    assert.equal(endsWith('hello', ''), true);
  });

  test('returns true when both x and y are empty strings', () => {
    assert.equal(endsWith('', ''), true);
  });

  /**
   * BUG: endsWith('', 'x') incorrectly returns true.
   * When x is '' and y is any string not found in x, lastIndexOf returns -1
   * and x.length - y.length also equals -1 (0 - 1 = -1), so -1 === -1 is true.
   * The correct answer should be false (nothing ends with a non-empty suffix
   * if the haystack itself is empty).
   */
  test('BUG: returns true (incorrectly) when x is empty but y is non-empty due to -1 === -1 coincidence', () => {
    assert.equal(endsWith('', 'x'), true); // documents the known bug
  });

  // --- Edge cases: needle longer than haystack ---

  test('returns false when y is longer than x', () => {
    // lastIndexOf returns -1 and -(y.length) !== -1
    assert.equal(endsWith('hi', 'hello'), false);
  });

  // --- Multiple occurrences of y inside x ---

  test('returns true when y appears multiple times and the last occurrence is at the end', () => {
    // 'ababab' ends with 'ab'; lastIndexOf('ab') === 4, length - 2 === 4
    assert.equal(endsWith('ababab', 'ab'), true);
  });

  test('returns false when y appears inside x but not at the very end', () => {
    // 'abcabc' has 'ab' at index 3 as well as index 0, but does NOT end with 'ab'
    assert.equal(endsWith('abcabc', 'ab'), false);
  });

  // --- Case sensitivity ---

  test('is case-sensitive: capital letters do not match lowercase', () => {
    assert.equal(endsWith('Hello', 'hello'), false);
    assert.equal(endsWith('WORLD', 'world'), false);
  });

  test('is case-sensitive: matches when case is exactly the same', () => {
    assert.equal(endsWith('Hello', 'Hello'), true);
  });

  // --- Strings with special/whitespace characters ---

  test('returns true for strings ending with whitespace', () => {
    assert.equal(endsWith('hello ', ' '), true);
  });

  /**
   * BUG: endsWith('hello', 'hello ') incorrectly returns true.
   * When y is longer than x by exactly 1 character, lastIndexOf returns -1
   * and x.length - y.length = 5 - 6 = -1, so -1 === -1 is true.
   * This is a false positive that only triggers when y.length = x.length + 1.
   */
  test('BUG: returns true (incorrectly) when y is exactly one char longer than x due to -1 === -1 coincidence', () => {
    assert.equal(endsWith('hello', 'hello '), true); // documents the known bug
  });

  test('handles strings with numbers', () => {
    assert.equal(endsWith('version1.2.3', '1.2.3'), true);
    assert.equal(endsWith('version1.2.3', '2.3'), true);
    assert.equal(endsWith('version1.2.3', '1.2'), false);
  });

});
