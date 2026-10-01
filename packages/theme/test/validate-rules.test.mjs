import assert from 'node:assert/strict';
import test from 'node:test';

import { validateRules } from '../cli/validate-rules.mjs';

const ok = (css) => assert.deepEqual(validateRules(css, 'rules.css'), []);
const fails = (css, message) => {
  const errors = validateRules(css, 'rules.css');
  assert.equal(errors.length, 1, errors.join('\n'));
  // Every rule-validation error names its file, the line of the enclosing rule
  // and that rule's selector, ahead of the brief's own message text (spec §10.2).
  assert.match(errors[0], /^rules\.css:\d+ /, errors[0]);
  assert.ok(errors[0].includes(message), errors[0]);
};

test('accepts public hooks, theme axes and tokens', () => {
  ok(
    `[data-ui='button'][data-variant='solid'] [data-part='label'] { font-weight: var(--slotted-font-weight-semibold); }`,
  );
  ok(
    `[data-slotted-scheme='dark'] [data-ui='text-field'] { border-radius: var(--slotted-text-field-radius, 0); }`,
  );
  ok(`[data-ui='card']:is(:hover, [data-disabled]) { color: var(--slotted-seed-accent); }`);
});

test('names a syntax error', () => {
  const errors = validateRules(`[data-ui='button' { color: red; }`, 'rules.css');
  assert.equal(errors.length, 1);
  assert.match(errors[0], /^rules\.css:\d+:\d+ /);
});

test('names a data-ui no family sets', () =>
  fails(`[data-ui='nope'] { color: red; }`, "[data-ui='nope'] names no family"));
test('names a part the family does not have', () =>
  fails(
    `[data-ui='button'][data-part='nope'] { color: red; }`,
    "[data-part='nope'] is not a part of button",
  ));
test('names an attribute no family sets', () =>
  fails(`[data-nope] { color: red; }`, '[data-nope] is not an attribute any family sets'));
test('names a private property', () =>
  fails(
    `[data-ui='card'] { color: var(--_ink); }`,
    'var(--_ink) reads a private property of a family',
  ));
test('names a property that is no token', () =>
  fails(`[data-ui='card'] { color: var(--slotted-nope); }`, 'var(--slotted-nope) is not a token'));
test('names a class selector', () =>
  fails(`.card { color: red; }`, '.card: a class is not a public selector'));

test('names the full selector of the enclosing rule, not just the offending component', () => {
  const errors = validateRules(`[data-ui='button'][data-part='nope'] { color: red; }`, 'rules.css');
  assert.equal(errors.length, 1, errors.join('\n'));
  assert.ok(errors[0].includes("[data-ui='button'][data-part='nope']"), errors[0]);
});

test('names the selector of the enclosing rule for a var() error, not only the filename', () => {
  const errors = validateRules(`[data-ui='card'] { color: var(--_ink); }`, 'rules.css');
  assert.equal(errors.length, 1, errors.join('\n'));
  assert.match(errors[0], /^rules\.css:\d+ /, errors[0]);
  assert.ok(errors[0].includes("[data-ui='card']"), errors[0]);
});
