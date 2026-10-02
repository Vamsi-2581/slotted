import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('./dashboard-grid.css', import.meta.url), 'utf8');
const normalized = css
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([{};,:>])\s*/g, '$1')
  .replace(/\(\s+/g, '(')
  .replace(/\s+\)/g, ')');

/** The declarations of the first rule whose selector starts with `selector`. */
function rule(selector) {
  return normalized.split(`${selector}{`)[1]?.split('}')[0] ?? '';
}

const body = "[data-ui='dashboard-grid'] [data-part='widget']>[data-ui='card']>[data-part='body']";

/**
 * A body taller than its cell scrolls inside it, down to its own end padding.
 * Its content grows into a taller cell but never shrinks under its own height:
 * shrunk, a table of eight rows sat in a box of five, the body scrolled only
 * what overflowed the box, and the last row and the padding under it stayed
 * out of reach.
 */
test('lets the body scroll its content whole: the content grows and never shrinks', () => {
  assert.match(rule(body), /overflow:auto/);
  const content = rule(`${body}>:not([data-part='busy-indicator'])`);
  assert.match(content, /flex:1 0 auto/, 'the body content may still shrink under its own height');
  assert.doesNotMatch(content, /min-block-size:0/);
});
