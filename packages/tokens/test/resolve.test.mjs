import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { resolveTokens } from '../src/resolve.mjs';

const theme = JSON.parse(
  await readFile(new URL('../../themes/default/src/theme.json', import.meta.url), 'utf8'),
);

/**
 * What every one of these tokens resolved to before the scales existed.
 * A scale step is only allowed to replace a literal if it holds the same
 * value, so this table is what makes "the foundation changed no pixel"
 * a fact rather than a claim. Entries are added, never edited.
 */
const UNCHANGED = {
  '--slotted-control-font-family': 'ui-sans-serif, system-ui, sans-serif',
  '--slotted-control-font-weight': '600',
  '--slotted-control-line-height': '1',
  '--slotted-control-letter-spacing': '0',
  '--slotted-control-border-width': '1px',
  '--slotted-control-radius': '4px',
  '--slotted-control-shadow': 'none',
  '--slotted-control-transition-duration': '120ms',
  '--slotted-control-transition-easing': 'cubic-bezier(0.2, 0, 0, 1)',
  '--slotted-focus-ring-width': '2px',
  '--slotted-focus-ring-offset': '2px',
  '--slotted-button-gap': '0.5rem',
  '--slotted-button-radius-sm': '7px',
  '--slotted-button-radius-md': '6px',
  '--slotted-button-radius-lg': '5px',
};

test('expands a reference to another token in the same map', () => {
  assert.deepEqual(resolveTokens({ '--a': 'var(--b)', '--b': '4px' }), {
    '--a': '4px',
    '--b': '4px',
  });
});

test('expands repeated references to the same token', () => {
  assert.equal(resolveTokens({ '--a': 'var(--b) var(--b)', '--b': '1px' })['--a'], '1px 1px');
});

test('expands more than one hundred sibling references', () => {
  const count = 101;
  const references = Array(count).fill('var(--b)').join(' ');

  assert.equal(
    resolveTokens({ '--a': references, '--b': 'x' })['--a'],
    Array(count).fill('x').join(' '),
  );
});

test('expands a chain of references', () => {
  assert.equal(resolveTokens({ '--a': 'var(--b)', '--b': 'var(--c)', '--c': '2px' })['--a'], '2px');
});

test('keeps the surrounding text of a reference', () => {
  assert.equal(
    resolveTokens({ '--a': 'calc(-1 * var(--b))', '--b': '1px' })['--a'],
    'calc(-1 * 1px)',
  );
});

test('takes the fallback when the name is absent', () => {
  assert.equal(resolveTokens({ '--a': 'var(--missing, 8px)' })['--a'], '8px');
});

test('refuses a reference that cannot be resolved', () => {
  assert.throws(() => resolveTokens({ '--a': 'var(--missing)' }), /--missing/);
});

test('refuses a cycle rather than looping', () => {
  assert.throws(() => resolveTokens({ '--a': 'var(--b)', '--b': 'var(--a)' }), /cycle/i);
});

test('every token that predates the scales still resolves to its old value', () => {
  const resolved = resolveTokens(theme.base);
  for (const [name, expected] of Object.entries(UNCHANGED)) {
    assert.equal(resolved[name], expected, `${name} changed value`);
  }
});
