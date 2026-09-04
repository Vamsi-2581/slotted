import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/description-list/contract.json', import.meta.url),
    'utf8',
  ),
);
const css = readFileSync(new URL('./description-list.css', import.meta.url), 'utf8');
const fragment = readFileSync(new URL('./description-list.harness.html', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
const normalized = declarations.replace(/\s+/g, '');

test('lives in the component layer', () => {
  assert.match(css, /@layer slotted\.components/);
});

test('styles every part the contract declares', () => {
  for (const part of contract.members.descriptionList.parts) {
    const selector = part === 'root' ? "[data-ui='description-list']{" : `[data-part='${part}']`;
    assert.ok(normalized.includes(selector), `Missing part ${part}`);
  }
});

test('renders every part the contract declares in the harness fragment', () => {
  for (const part of contract.members.descriptionList.parts) {
    assert.match(fragment, new RegExp(`data-part="${part}"`), `The fragment never renders ${part}`);
  }
});

test('answers every value of every axis the contract names', () => {
  for (const [axis, values] of Object.entries(contract.axes)) {
    for (const value of values) {
      assert.ok(normalized.includes(`[data-${axis}='${value}']`), `Missing ${axis} ${value}`);
    }
  }
});

/**
 * The root is the query container and the list is the grid, because an element
 * with `container-type: inline-size` is a container for its descendants and not
 * for itself. A stylesheet that put both on one element would answer every
 * width the same way and nothing would say so.
 */
test('keeps the query container out of the grid it resizes', () => {
  const root = normalized.slice(
    normalized.indexOf("[data-ui='description-list']{"),
    normalized.indexOf("[data-ui='description-list'][data-part='list']"),
  );
  assert.ok(root.includes('container-type:inline-size'));
  assert.ok(root.includes('container-name:slotted-description-list'));
  assert.ok(!root.includes('grid-template-columns'));
  assert.ok(normalized.includes("[data-part='list']{"));
});

/**
 * The terms share one track across every pair, which is the differentiator the
 * inventory named: PatternFly needs a stated term width and Ant needs a real
 * table to line two pairs up.
 */
test('borrows the list tracks for every pair', () => {
  assert.ok(normalized.includes('--_item-cols:subgrid'));
  assert.ok(normalized.includes('grid-template-columns:var(--_item-cols)'));
  assert.ok(normalized.includes('fit-content(var(--_term-width))'));
});

/**
 * A gap applies between two tracks whether or not the second has any width, so
 * the action track is declared only where an action is.
 */
test('adds the action track only to a list that holds an action', () => {
  assert.ok(normalized.includes("[data-part='list']:has([data-part='action'])"));
  assert.ok(normalized.includes('--_desc-col:2/-1'));
  assert.ok(normalized.includes('--_desc-col:2/-2'));
});

/**
 * Every reflow threshold answers the component's own inline size, and the
 * count collapses before the arrangement does. The literals are the contract's
 * own, because a container condition cannot read a custom property.
 */
test('reflows on its own inline size, at the widths the contract states', () => {
  for (const size of Object.keys(contract.reflow.breakpoints)) {
    assert.ok(
      normalized.includes(`@containerslotted-description-list(max-width:${size})`),
      `No container query at ${size}`,
    );
  }
  const columns = normalized.indexOf('(max-width:34rem)');
  const stack = normalized.indexOf('(max-width:26rem)');
  assert.ok(columns < stack, 'the arrangement must give way after the column count');
});

/**
 * A span is stated in tracks, so every rule that changes the count changes the
 * spans with it. A pair asking for two columns of a one-column list spans past
 * the last track, and grid invents the tracks it was asked for: the list grew
 * two implicit columns and went on drawing two pairs to a row at every width,
 * in a picture that showed a correct rendering of the wrong grid.
 */
test('collapses a span with the count that produced it', () => {
  const wide = normalized.slice(normalized.indexOf('(max-width:48rem)'));
  const narrow = normalized.slice(normalized.indexOf('(max-width:34rem)'));
  assert.ok(wide.includes('--_span-3:var(--_span-2)'));
  assert.ok(narrow.includes('--_span-2:var(--_span-1)'));
  assert.ok(narrow.includes('--_span-3:var(--_span-1)'));
});

/**
 * A weaker state holds itself back for a stronger one, and a state a reader
 * cannot see in colour is a state that was never painted: the finished copy
 * changes its mark as well as its colour.
 */
test('paints a finished copy by its mark and not only by its colour', () => {
  assert.ok(normalized.includes("[data-part='copy'][data-complete]{color:"));
  assert.ok(
    normalized.includes(
      "[data-part='copy'][data-complete]::after{mask-image:var(--slotted-description-list-copied-icon,var(--slotted-icon-check))",
    ),
  );
  assert.ok(normalized.includes(':enabled:not([data-complete]):hover'));
});

/**
 * Clamping is visual only. The rule that clamps and the rule that releases it
 * both leave the text where it was, which is what keeps a value reachable to a
 * screen reader and to a selection.
 */
test('clamps a long value without taking any of it out of the DOM', () => {
  assert.ok(normalized.includes('-webkit-line-clamp:var(--slotted-description-list-clamp,2)'));
  assert.ok(normalized.includes('[data-clamp][data-revealed]'));
  assert.ok(!/display:none/.test(normalized));
  assert.ok(!/content:['"][^'"]/.test(normalized), 'no text is generated by the stylesheet');
});

/**
 * A component-owned mark is geometry from a glyph token; a character is never
 * an icon. The placeholder is the same rule applied to the absence of a value,
 * and only where the absence has no words of its own — `:empty` is what tells
 * the drawn form from the written one.
 */
test('draws every mark it owns as geometry', () => {
  assert.ok(normalized.includes('mask-image:var(--slotted-description-list-copy-icon'));
  assert.ok(normalized.includes('mask-image:var(--slotted-description-list-toggle-icon'));
  assert.ok(normalized.includes("[data-part='placeholder']:empty{background-color:"));
});

/**
 * The hit area of an icon-only control is the family's job rather than the
 * theme's, and the row's rhythm is not the price of it.
 */
test('gives the copy control the target size the foundation requires', () => {
  assert.ok(normalized.includes('var(--slotted-target-min,24px)'));
  assert.ok(normalized.includes('margin-block:calc(var(--_hit)*-1)'));
  assert.ok(
    !normalized.includes('margin:calc(var(--_hit)*-1)'),
    'an inline negative margin puts the focus ring through the value',
  );
});
