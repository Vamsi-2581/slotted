import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('./visually-hidden.css', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
const normalized = declarations.replace(/\s+/g, '');
const tokens = JSON.parse(readFileSync(new URL('./visually-hidden.tokens.json', import.meta.url)));

/** Every selector list in the sheet, one entry per rule that is not an at-rule. */
function rules() {
  return [...declarations.matchAll(/([^{}]*)\{/g)]
    .map(([, selector]) => selector.trim())
    .filter((selector) => selector.length > 0 && !selector.startsWith('@'));
}

test('lives in the component layer', () => {
  assert.match(css, /@layer slotted\.components/);
});

test('hides the element without removing it from the accessibility tree', () => {
  assert.ok(normalized.includes('clip-path:inset(50%)'), 'Missing the clipping rule');
  assert.ok(normalized.includes('position:absolute'), 'Missing the removal from flow');
  assert.ok(
    !/display:\s*none/.test(declarations),
    'display: none would hide it from assistive technology',
  );
  assert.ok(
    !/visibility:\s*hidden/.test(declarations),
    'visibility: hidden would hide it from assistive technology',
  );
});

test('holds the box at one pixel whatever element the consumer brought', () => {
  assert.ok(normalized.includes('block-size:1px'), 'Missing the block size');
  assert.ok(normalized.includes('inline-size:1px'), 'Missing the inline size');
  assert.ok(normalized.includes('border:0'), "A consumer's border would grow the box");
  assert.ok(normalized.includes('padding:0'), "A consumer's padding would grow the box");
  assert.ok(
    normalized.includes('white-space:nowrap'),
    'Text wrapping inside a one-pixel box is read one word to a line',
  );
});

/**
 * The revealed variant is the absence of the hiding rule, not its undo. A
 * second rule restoring each declaration would leave the family holding an
 * opinion about how a revealed skip link looks, and it has none.
 */
test('hides in one rule, and reveals by ceasing to match it', () => {
  assert.deepEqual(rules(), ["[data-ui='visually-hidden']:not([data-focusable]:focus-within)"]);
});

test('is selected by the public identifier rather than by a class', () => {
  assert.ok(!/\.slotted-/.test(declarations), 'A class name is not contract');
});

/**
 * A hiding technique has nothing a theme may retune: the box is one pixel
 * because a screen reader needs a rendered box, not because a scale said so.
 * An empty list is the honest statement, and `tokens.test.mjs` holds it to the
 * stylesheet.
 */
test('declares no token, because the technique exposes no themable value', () => {
  assert.deepEqual(tokens, []);
});
