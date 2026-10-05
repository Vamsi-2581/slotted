import assert from 'node:assert/strict';
import test from 'node:test';

import { readFileSync } from 'node:fs';

import { validateRules } from '../cli/validate-rules.mjs';
import { defineTheme, recipes } from '../dist/index.js';

const values = JSON.parse(
  readFileSync(new URL('../../themes/src/default/values.json', import.meta.url), 'utf8'),
);
const SEEDS = {
  accent: '#1d4ed8',
  neutral: '#64748b',
  success: '#15803d',
  warning: '#facc15',
  danger: '#dc2626',
};

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

test('attributes a var() after a nested rule to the outer rule that directly contains it, not the nested one', () => {
  const errors = validateRules(
    `[data-ui='card'] {\n  & [data-part='label'] { color: red; }\n  background: var(--_ink);\n}`,
    'order.css',
  );
  assert.equal(errors.length, 1, errors.join('\n'));
  // The declaration sits on line 3, directly inside the outer `[data-ui='card']` rule
  // (lightningcss models the trailing declaration as its own `nested-declarations`
  // block once a sibling rule is nested before it, so the line moves off the outer
  // rule's own opening line, but the selector it reports stays the outer one's).
  assert.match(errors[0], /^order\.css:3 /, errors[0]);
  assert.ok(errors[0].includes("[data-ui='card']"), errors[0]);
  assert.ok(!errors[0].includes("[data-part='label']"), errors[0]);
  assert.ok(errors[0].includes('var(--_ink) reads a private property of a family'), errors[0]);
});

test('names an element type selector, with the file, the line and the selector', () => {
  const errors = validateRules(
    `[data-ui='card'] { gap: 0; }\n[data-ui='text-field'] input { color: red; }`,
    'rules.css',
  );
  assert.deepEqual(errors, [
    "rules.css:2 [data-ui='text-field'] input: input: an element type is not a public selector",
  ]);
});
test('names html and body as element types', () => {
  fails(`html [data-ui='card'] { color: red; }`, 'html: an element type is not a public selector');
  fails(
    `body > [data-ui='card'] { color: red; }`,
    'body: an element type is not a public selector',
  );
});
test('names an id selector', () =>
  fails(`[data-ui='card']#total { color: red; }`, '#total: an id is not a public selector'));
test('names the universal selector', () =>
  fails(
    `[data-ui='card'] > * { margin: 0; }`,
    '*: the universal selector is not a public selector',
  ));
test('names :root and :scope, which select by place in the document', () => {
  fails(`:root { color: red; }`, ':root: a document or scoping root is not a public selector');
  fails(
    `:scope [data-ui='card'] { color: red; }`,
    ':scope: a document or scoping root is not a public selector',
  );
});
test('names an attribute outside data-*', () => {
  fails(
    `[data-ui='text-field'][aria-invalid='true'] { color: red; }`,
    "[aria-invalid='true']: an attribute outside data-* is not a public selector",
  );
  fails(
    `[data-ui='tabs'] [role='tab'] { color: red; }`,
    "[role='tab']: an attribute outside data-* is not a public selector",
  );
});
test('names a compound that carries no public hook', () =>
  fails(
    `[data-ui='card'] :first-child { margin: 0; }`,
    ':first-child: a compound selector without data-ui, data-part or a public attribute matches elements no family owns',
  ));
test('checks the selectors inside :is(), :where(), :not() and :has()', () => {
  fails(`[data-ui='card']:not(.x) { color: red; }`, '.x: a class is not a public selector');
  fails(
    `[data-ui='field']:has(input) { color: red; }`,
    'input: an element type is not a public selector',
  );
  fails(
    `:is([data-ui='card'], div) { color: red; }`,
    'div: an element type is not a public selector',
  );
  fails(`:where([data-ui='nope']) { color: red; }`, "[data-ui='nope'] names no family");
});
test('checks a rule nested in another rule or in a conditional group', () => {
  fails(
    `[data-ui='card'] {\n  & span { color: red; }\n}`,
    'span: an element type is not a public selector',
  );
  fails(
    `@media (width > 40rem) {\n  [data-ui='card'] .x { color: red; }\n}`,
    '.x: a class is not a public selector',
  );
});
test('accepts pseudo-classes, pseudo-elements, nesting, combinators and :is()/:where()/:not()/:has() over public hooks', () => {
  ok(
    `[data-ui='text-field']:has(> [data-part='input']:focus-visible) { outline: 2px solid var(--slotted-focus-ring-color); }`,
  );
  ok(`[data-ui='text-field'][data-invalid] [data-part='input']::placeholder { opacity: 1; }`);
  ok(`:is([data-ui='button'], [data-ui='badge']) > [data-part='label'] { letter-spacing: 0; }`);
  ok(`[data-ui='button']:where(:hover, :focus-visible):not([data-disabled]) { opacity: 1; }`);
  ok(
    `[data-ui='card'] {\n  & + & { margin: 0; }\n  &:hover [data-part='title'] { color: red; }\n}`,
  );
  ok(`@keyframes pulse { from { opacity: 0; } 50% { opacity: 0.5; } to { opacity: 1; } }`);
  ok(`@media (prefers-reduced-motion: reduce) { [data-ui='button'] { transition: none; } }`);
});

/**
 * The build and the runtime hold one policy: every rule the CLI refuses,
 * `defineTheme` refuses with the same messages, and every rule the CLI
 * accepts, `defineTheme` accepts.
 */
test('defineTheme refuses exactly what the build refuses, with the same messages', () => {
  const corpus = [
    `[data-ui='button'][data-variant='solid'] [data-part='label'] { font-weight: var(--slotted-font-weight-semibold); }`,
    `[data-ui='text-field']:has(> [data-part='input']:focus-visible) { outline: 2px solid var(--slotted-tone-accent-solid); }`,
    `[data-ui='text-field'] input { color: red; }`,
    `.card, #x, [data-ui='card'] > * { color: red; }`,
    `:root { --slotted-text: red; }`,
    `[data-ui='tabs'] [role='tab'][aria-selected] { color: red; }`,
    `[data-ui='card'] :first-child { margin: 0; }`,
    `:is([data-ui='card'], div):not(.x):has(span) { color: red; }`,
    `[data-ui='card'] {\n  & [data-part='title'] { color: red; }\n  background: var(--_ink);\n}`,
    `@media (width > 40rem) {\n  [data-ui='nope'] [data-part='x'] { color: var(--slotted-nope); }\n}`,
    `@keyframes pulse { from { opacity: 0; } to { opacity: 1; } }`,
  ];
  for (const css of corpus) {
    const build = validateRules(css, 'rules.css').map((error) => error.replace(/^rules\.css:/, ''));
    let runtime = [];
    try {
      defineTheme({
        ...values,
        name: 'parity',
        seeds: SEEDS,
        recipe: recipes.standard,
        rules: [css],
      });
    } catch (error) {
      runtime = error.message
        .split('\n')
        .slice(1)
        .map((line) => line.replace(/^- rules\[0\]:/, ''));
    }
    assert.deepEqual(runtime, build, css);
  }
});

test('the runtime path imports neither lightningcss nor a Node module', () => {
  const index = readFileSync(new URL('../dist/index.js', import.meta.url), 'utf8');
  const imports = [...index.matchAll(/(?:from|import)\s*['"]([^'"]+)['"]/g)].map(([, s]) => s);
  assert.deepEqual(
    imports.filter((specifier) => specifier === 'lightningcss' || specifier.startsWith('node:')),
    [],
  );
});
