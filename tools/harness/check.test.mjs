import assert from 'node:assert/strict';
import test from 'node:test';

import { checkFamily } from './check.mjs';

const check = (css) => checkFamily({ family: 'demo', css });

test('accepts a stylesheet that reaches only for tokens', () => {
  assert.deepEqual(
    check(`.slotted-demo { gap: var(--slotted-demo-gap, var(--slotted-space-4)) }`),
    [],
  );
});

test('refuses a literal fallback', () => {
  const errors = check(`.slotted-demo { gap: var(--slotted-demo-gap, 0.625rem) }`);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /--slotted-demo-gap.*0\.625rem/);
});

test('allows the keywords a scale cannot express', () => {
  for (const value of ['0', 'none', 'auto', '100%', 'transparent', 'currentColor', 'inherit']) {
    assert.deepEqual(check(`.slotted-demo { x: var(--slotted-demo-x, ${value}) }`), []);
  }
});

test('refuses a character used as an icon', () => {
  const errors = check(`.slotted-demo::before { content: var(--slotted-demo-separator, '/') }`);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /content/);
});

test('accepts an empty content, which is what a mask needs', () => {
  assert.deepEqual(check(`.slotted-demo::before { content: '' }`), []);
});

test('refuses a duration or easing written by hand', () => {
  assert.equal(check(`.slotted-demo { transition: color 120ms ease }`).length, 1);
  assert.deepEqual(
    check(
      `.slotted-demo { transition: color var(--slotted-duration-short) var(--slotted-easing-standard) }`,
    ),
    [],
  );
});

test('refuses a looping animation with no reduced-motion rule', () => {
  const spinning = `.slotted-demo { animation: spin 1s linear infinite }`;
  assert.equal(check(spinning).length, 1);
  assert.deepEqual(
    check(
      `${spinning} @media (prefers-reduced-motion: reduce) { .slotted-demo { animation: none } }`,
    ),
    [],
  );
});

test('refuses a container query from a stylesheet that declares no container', () => {
  const errors = check(`@container (min-width: 20rem) { .slotted-demo { gap: 0 } }`);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /container-type/);
});

test('accepts a container query when the family declares its own container', () => {
  assert.deepEqual(
    check(
      `.slotted-demo { container-type: inline-size; container-name: slotted-demo }
       @container slotted-demo (min-width: 20rem) { .slotted-demo { gap: 0 } }`,
    ),
    [],
  );
});
