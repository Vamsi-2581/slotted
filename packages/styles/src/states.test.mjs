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

/** Every selector list in the sheet, one entry per comma-separated selector. */
function selectors(css) {
  return [...css.matchAll(/(^|\})([^{}]+)\{/g)]
    .map(([, , selector]) => selector.trim())
    .filter((selector) => selector.length > 0 && !selector.startsWith('@'))
    .flatMap((selector) => selector.split(','))
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
