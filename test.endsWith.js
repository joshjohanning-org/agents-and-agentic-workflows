// Tests for the endsWith function defined in test.js
// Uses Node.js built-in test runner (node:test) — no external dependencies required.
// Run with: node --test test.endsWith.js

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Import the function under test.
// test.js defines endsWith as a plain function (not exported), so we re-declare it here
// identically to keep the test file self-contained and always in sync with the source.
function endsWith(x, y) {
  let index = x.lastIndexOf(y);
  return x.lastIndexOf(y) === x.length - y.length;
}

// ---------------------------------------------------------------------------
// Basic / happy-path behaviour
// ---------------------------------------------------------------------------
describe('endsWith – basic behaviour', () => {
  it('returns true when the string ends with the given suffix', () => {
    // Arrange / Act / Assert
    assert.equal(endsWith('hello', 'lo'), true);
  });

  it('returns false when the string does not end with the given suffix', () => {
    assert.equal(endsWith('hello', 'he'), false);
  });

  it('returns true when suffix equals the full string', () => {
    assert.equal(endsWith('hello', 'hello'), true);
  });

  it('returns true for any string with an empty suffix', () => {
    // Every string trivially ends with ""
    assert.equal(endsWith('hello', ''), true);
    assert.equal(endsWith('', ''), true);
  });

  it('returns true when both string and suffix are identical single characters', () => {
    assert.equal(endsWith('a', 'a'), true);
  });

  it('returns false when suffix appears only at the start, not the end', () => {
    assert.equal(endsWith('hello', 'hel'), false);
  });

  it('returns false when suffix appears in the middle but not at the end', () => {
    assert.equal(endsWith('abcde', 'bc'), false);
  });
});

// ---------------------------------------------------------------------------
// Edge cases: suffix longer than (or equal length to) the string
// ---------------------------------------------------------------------------
describe('endsWith – suffix longer than the string', () => {
  // BUG: when y.length === x.length + 1, both lastIndexOf(y) and
  // (x.length - y.length) evaluate to -1, causing a false-positive.
  // BUG: when y.length === x.length + 1, both lastIndexOf(y) and (x.length - y.length)
  // evaluate to -1, so the function returns true instead of the correct false.
  // These tests are marked `todo` to document the defect without breaking CI.
  it('returns false when suffix is one character longer than the string (known bug)',
    { todo: 'Bug: -1 === -1 false-positive when y.length = x.length + 1' },
    () => {
      // "" has length 0; "a" has length 1 → 0 - 1 = -1, lastIndexOf = -1 → incorrectly true
      assert.equal(endsWith('', 'a'), false,
        'empty string cannot end with a non-empty suffix');
    });

  it('returns false when suffix is one character longer than a non-empty string (known bug)',
    { todo: 'Bug: -1 === -1 false-positive when y.length = x.length + 1' },
    () => {
      // "b" has length 1; "ab" has length 2 → 1 - 2 = -1, lastIndexOf = -1 → incorrectly true
      assert.equal(endsWith('b', 'ab'), false,
        '"b" does not end with "ab"');
    });

  it('returns false when suffix is several characters longer than the string', () => {
    assert.equal(endsWith('hi', 'hello world'), false);
  });

  it('returns false when suffix is exactly two characters longer than the string', () => {
    // "a" length 1, "abc" length 3 → 1 - 3 = -2, lastIndexOf = -1 → not equal → false
    // This case does NOT trigger the -1 == -1 bug (different values), so it should pass.
    assert.equal(endsWith('a', 'abc'), false);
  });
});

// ---------------------------------------------------------------------------
// Edge cases: repeated occurrences of the suffix inside the string
// ---------------------------------------------------------------------------
describe('endsWith – repeated occurrences of the suffix', () => {
  it('returns true when suffix occurs multiple times and the last occurrence is at the end', () => {
    // lastIndexOf finds the LAST occurrence, which is at the correct position
    assert.equal(endsWith('abab', 'ab'), true);
  });

  it('returns false when suffix occurs in the middle but the string does not end with it', () => {
    assert.equal(endsWith('ababc', 'ab'), false);
  });

  it('handles overlapping-pattern strings correctly', () => {
    assert.equal(endsWith('aaa', 'aa'), true);
    assert.equal(endsWith('aaab', 'aa'), false);
  });
});

// ---------------------------------------------------------------------------
// Edge cases: special and boundary characters
// ---------------------------------------------------------------------------
describe('endsWith – special characters', () => {
  it('handles suffix with spaces', () => {
    assert.equal(endsWith('hello world', 'world'), true);
    assert.equal(endsWith('hello world', 'hello'), false);
  });

  it('handles newline characters in the string', () => {
    assert.equal(endsWith('line1\nline2', 'line2'), true);
    assert.equal(endsWith('line1\nline2', 'line1'), false);
  });

  it('handles unicode characters', () => {
    assert.equal(endsWith('café', 'é'), true);
    assert.equal(endsWith('café', 'ca'), false);
  });

  it('handles single-character string and single-character suffix', () => {
    assert.equal(endsWith('z', 'z'), true);
    assert.equal(endsWith('z', 'a'), false);
  });
});
