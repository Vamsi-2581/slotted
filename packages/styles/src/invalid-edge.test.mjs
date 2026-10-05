import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const source = new URL('.', import.meta.url).pathname;
const specs = new URL('../../../specs/components/', import.meta.url).pathname;
const EDGE = '--slotted-control-invalid-edge-width';

/**
 * Colour alone does not say a control is wrong (WCAG 1.4.1): in `high-contrast`
 * the control edge, `--slotted-tone-danger-border` and both focus rings are one
 * black. Every family that paints an invalid state therefore adds width as
 * well as colour, and the width is `--slotted-control-invalid-edge-width` —
 * read directly, or through a family token that falls back to it — so one
 * token retunes the cue everywhere.
 *
 * A family listed here states invalid and draws no edge for it, and the value
 * says where the non-colour cue lives instead.
 */
const ELSEWHERE = {
  'checkbox-group': 'each checkbox in the group takes `data-invalid` and draws its own edge',
  'color-picker': 'its text input is a `text-field` frame, which draws the edge',
  'date-picker': 'the frame is the composed `date-field`, which takes `data-invalid`',
  'datetime-picker': 'the frame is the composed `datetime-field`, which takes `data-invalid`',
  field: 'a counter past its limit says so in figures and in weight',
  'field-group': 'it paints no invalid state; its fields paint their own',
  form: 'it paints no invalid state; its fields paint their own',
  message: 'a message that did not go says so in words under its surface',
  stepper: 'a failed step shows a cross in place of its number',
  'time-picker': 'the frame is the composed `time-field`, which takes `data-invalid`',
  wizard:
    'the progress segments are hidden from the tree, the step list draws a failed step’s cross, and the root’s error is a message',
};

/** A selector list split at its own commas, not inside `:is()`, `:not()` or `:has()`. */
function splitSelectorList(list) {
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

const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const squash = (text) =>
  text.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();

/** Every innermost block: a style rule's selector list and its declarations. */
function blocks(css) {
  return [...strip(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
    selectors: splitSelectorList(squash(selector)).map((item) => item.trim()),
    body: squash(body),
  }));
}

function statesInvalid(contract) {
  let found = false;
  (function walk(node) {
    if (node === null || typeof node !== 'object') return;
    for (const [key, value] of Object.entries(node)) {
      if (key === 'stateAttributes' && value && typeof value === 'object') {
        const attributes = Array.isArray(value)
          ? value
          : [...Object.keys(value), ...Object.values(value)];
        if (attributes.some((attribute) => String(attribute).includes('invalid'))) found = true;
      }
      walk(value);
    }
  })(contract);
  return found;
}

function families() {
  return readdirSync(source, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const css = readdirSync(join(source, entry.name))
        .filter((file) => file.endsWith('.css'))
        .map((file) => readFileSync(join(source, entry.name, file), 'utf8'))
        .join('\n');
      const path = join(specs, entry.name, 'contract.json');
      const contract = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
      return { name: entry.name, css, contract };
    })
    .filter(({ css }) => css.length > 0)
    .filter(
      ({ contract, css }) =>
        /\[data-invalid\]|aria-invalid/.test(strip(css)) ||
        (contract !== null && statesInvalid(contract)),
    );
}

const isInvalid = (selector) => /\[data-invalid\]|\[aria-invalid/.test(selector);
const FOCUS = /:focus(-visible|-within)?\b/;

/** The private properties a family defines from the edge token. */
function edgeProperties(list) {
  const names = new Set();
  for (const { body } of list) {
    for (const [, name, value] of body.matchAll(/(--_[a-z0-9-]+):([^;]*)/g)) {
      if (value.includes(EDGE)) names.add(name);
    }
  }
  return [...names];
}

test('finds the families that state invalid', () => {
  const names = families().map(({ name }) => name);
  for (const name of ['text-field', 'select', 'checkbox', 'radio-group', 'switch', 'listbox']) {
    assert.ok(names.includes(name), `${name} is not seen to state invalid`);
  }
});

test('names in the exemptions only families that state invalid', () => {
  const names = new Set(families().map(({ name }) => name));
  for (const name of Object.keys(ELSEWHERE)) {
    assert.ok(names.has(name), `${name} is exempted and does not state invalid`);
  }
});

test('tells invalid by width as well as colour in every family that paints it', () => {
  const missing = [];
  for (const { name, css } of families()) {
    if (name in ELSEWHERE) continue;
    const list = blocks(css);
    const reads = [EDGE, ...edgeProperties(list)].map((property) => `var(${property}`);
    const drawn = list.some(
      ({ selectors, body }) =>
        selectors.some(isInvalid) && reads.some((read) => body.includes(read)),
    );
    if (!drawn) missing.push(name);
  }
  assert.deepEqual(missing, [], `no invalid rule reads ${EDGE} in: ${missing.join(', ')}`);
});

test('reads a family edge token only as a step in front of the shared one', () => {
  for (const { name, css } of families()) {
    for (const [, family] of strip(css).matchAll(
      /var\(\s*(--slotted-[a-z0-9-]+-invalid-edge-width)/g,
    )) {
      if (family === EDGE) continue;
      assert.equal(family, `--slotted-${name}-invalid-edge-width`, `${name} reads ${family}`);
      assert.match(
        squash(strip(css)),
        new RegExp(`var\\(${family},\\s?var\\(${EDGE}`),
        `${family} does not fall back to ${EDGE}`,
      );
    }
  }
});

/**
 * A frame whose focus rule repaints its shadow would lose the edge exactly
 * when the reader is in it, because the focus rule outranks the invalid one.
 * Each such focus rule has an invalid twin — the same selector with
 * `[data-invalid]` written into it — that keeps the edge in the list.
 */
test('keeps the edge under focus wherever focus repaints the frame’s shadow', () => {
  const frame = (selector) =>
    selector
      .replace(/:has\((?:[^()]|\([^()]*\))*\)/g, '')
      .replace(/:not\((?:[^()]|\([^()]*\))*\)/g, '')
      .replace(new RegExp(FOCUS.source, 'g'), '')
      .replace(/\[data-variant='[a-z-]+'\]/g, '')
      .replace(/\[data-part='root'\]/g, '')
      .replace(/\[data-invalid\]/g, '')
      .trim();
  const failures = [];

  for (const { name, css } of families()) {
    if (name in ELSEWHERE) continue;
    const list = blocks(css);
    const edges = list
      .filter(
        ({ selectors, body }) =>
          selectors.some(isInvalid) &&
          !selectors.some((selector) => FOCUS.test(selector)) &&
          /box-shadow:[^;]*var\(--_invalid-edge\)/.test(body),
      )
      .flatMap(({ selectors }) => selectors.filter(isInvalid).map(frame));
    if (edges.length === 0) continue;

    const twins = new Set(
      list
        .filter(({ body }) => /box-shadow:[^;]*var\(--_invalid-edge\)/.test(body))
        .flatMap(({ selectors }) =>
          selectors.filter(isInvalid).map((selector) => selector.replace(/\[data-invalid\]/g, '')),
        ),
    );

    for (const { selectors, body } of list) {
      if (!/(^|;)box-shadow:/.test(body)) continue;
      for (const selector of selectors) {
        if (!FOCUS.test(selector) || /data-invalid/.test(selector)) continue;
        const key = frame(selector);
        const covers = edges.some(
          (edge) => key === edge || (key.startsWith(edge) && key[edge.length] === '['),
        );
        if (covers && !twins.has(selector)) failures.push(`${name}: ${selector}`);
      }
    }
  }

  assert.deepEqual(failures, [], `focus drops the invalid edge:\n${failures.join('\n')}`);
});
