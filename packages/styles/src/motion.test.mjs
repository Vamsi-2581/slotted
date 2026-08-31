import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const source = new URL('.', import.meta.url).pathname;
const ledger = JSON.parse(
  readFileSync(new URL('../../../specs/legacy-families.json', import.meta.url), 'utf8'),
).families;

/**
 * Reduced motion is honoured by reaching for a duration token, because the
 * theme collapses those tokens in one query. A literal duration — including
 * one hidden in a `var()` fallback — is outside that query and keeps animating
 * for a reader who asked the operating system for stillness.
 *
 * The rule binds every family the rebuild has reached. A family still on the
 * ledger predates the foundation and is exempt until it is rebuilt, which is
 * the only reason the list exists.
 */
const TIME_LITERAL = /(?<![\w-])\d+(?:\.\d+)?m?s(?![\w-])/g;

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

test('takes every duration from the motion scale', () => {
  for (const { name, stylesheets } of currentFamilies()) {
    for (const { file, css } of stylesheets) {
      const literals = [...css.matchAll(TIME_LITERAL)].map(([literal]) => literal);
      assert.deepEqual(
        literals,
        [],
        `${name}/${file} states ${literals.join(', ')} instead of a duration token`,
      );
    }
  }
});

test('stops an endless animation under reduced motion rather than shortening it', () => {
  for (const { name, stylesheets } of currentFamilies()) {
    for (const { file, css } of stylesheets) {
      if (!/\binfinite\b/.test(css)) continue;
      const query = css.slice(css.indexOf('prefers-reduced-motion'));
      assert.ok(
        css.includes('prefers-reduced-motion') &&
          /animation(-play-state)?\s*:\s*(none|paused)/.test(query),
        `${name}/${file} loops forever and never stops under reduced motion`,
      );
    }
  }
});
