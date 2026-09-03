import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import { STATE_PRECEDENCE } from '../../../specs/contract.schema.mjs';

const source = new URL('.', import.meta.url).pathname;
const ledger = JSON.parse(
  readFileSync(new URL('../../../specs/legacy-families.json', import.meta.url), 'utf8'),
).families;

/**
 * A weaker state must hold itself back for every stronger one. The library
 * learned this from a defect rather than from a rule: several controls painted
 * a hover fill on a control the browser had already disabled, so the control
 * looked operable and answered nothing. `STATE_PRECEDENCE` names the order, and
 * this test is what makes it binding for a stylesheet.
 */
const GUARDS = [
  ':not([data-disabled])',
  ':not([data-loading])',
  ':not(:disabled)',
  ':enabled',
  ':disabled',
  '[data-disabled]',
];

function currentFamilies() {
  return readdirSync(source, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !ledger.includes(entry.name))
    .map((entry) => ({
      name: entry.name,
      stylesheets: readdirSync(join(source, entry.name))
        .filter((file) => file.endsWith('.css'))
        .map((file) => ({ file, css: readFileSync(join(source, entry.name, file), 'utf8') })),
    }));
}

/**
 * A selector list is separated by top-level commas only. Splitting on every
 * comma tore `:is(:checked, :indeterminate)` in half and handed this test the
 * fragment `:indeterminate)) ):hover`, which carries no guard because it is not
 * a selector — so a correctly guarded rule was reported as an unguarded one.
 * `:is()`, `:not()`, `:where()` and `:has()` all take lists, and all four are
 * how a rule states the precedence this test exists to check.
 */
export function splitSelectorList(list) {
  const parts = [];
  let depth = 0;
  let current = '';

  for (const character of list) {
    if (character === '(') depth += 1;
    if (character === ')') depth -= 1;
    if (character === ',' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += character;
  }
  parts.push(current);

  return parts;
}

/** Every selector list in the sheet, one entry per selector. */
function selectors(css) {
  return [...css.matchAll(/(^|\})([^{}]+)\{/g)]
    .map(([, , selector]) => selector.trim())
    .filter((selector) => selector.length > 0 && !selector.startsWith('@'))
    .flatMap(splitSelectorList)
    .map((selector) => selector.trim());
}

test('holds a weaker state back for the stronger ones it can meet', () => {
  for (const { name, stylesheets } of currentFamilies()) {
    for (const { file, css } of stylesheets) {
      for (const selector of selectors(css)) {
        if (!/:hover|:active(?![-\w])/.test(selector)) continue;
        assert.ok(
          GUARDS.some((guard) => selector.includes(guard)),
          `${name}/${file}: "${selector}" paints a weak state without holding it back for disabled`,
        );
      }
    }
  }
});

test('reads the precedence from the shared vocabulary rather than restating it', () => {
  assert.ok(STATE_PRECEDENCE.indexOf('disabled') < STATE_PRECEDENCE.indexOf('hover'));
  assert.ok(STATE_PRECEDENCE.indexOf('loading') < STATE_PRECEDENCE.indexOf('active'));
});

test('splits a selector list at its own commas and not inside a functional one', () => {
  assert.deepEqual(splitSelectorList('a:is(b, c):hover, d'), ['a:is(b, c):hover', ' d']);
  assert.deepEqual(splitSelectorList('a:has(b:is(c, d)):active'), ['a:has(b:is(c, d)):active']);
  assert.deepEqual(splitSelectorList('a, b'), ['a', ' b']);
});
