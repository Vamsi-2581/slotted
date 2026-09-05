import assert from 'node:assert/strict';
import test from 'node:test';

import { offAxisMarks } from './audit.mjs';

/**
 * The numbers in these cases are measured ones, from
 * `tools/harness/out/menu.html` at 420 pixels in the light scheme, before and
 * after the fix that prompted the guard. A mark is `[data-part='icon']` and the
 * line it annotates is the first line of `[data-part='label']` beside it.
 */
const before = {
  scene: 'anatomy',
  element: 'span[data-part=icon]',
  markCentre: 151.14,
  textCentre: 153.14,
};
const after = {
  scene: 'anatomy',
  element: 'span[data-part=icon]',
  markCentre: 153.39,
  textCentre: 153.14,
};

test('reports a mark that sits above the line it annotates', () => {
  assert.deepEqual(offAxisMarks([before]), [{ ...before, offset: -2 }]);
});

/**
 * A font's ascent and descent are not symmetrical, so a mark centred exactly on
 * its line box still misses the middle of the glyphs by a quarter of a pixel.
 * A guard that reported that would be a guard nobody could satisfy.
 */
test('lets the asymmetry of a typeface through', () => {
  assert.deepEqual(offAxisMarks([after]), []);
});

test('reports a mark that sits below the line as readily as one above it', () => {
  const low = { ...before, markCentre: 156.14 };
  assert.deepEqual(offAxisMarks([low]), [{ ...low, offset: 3 }]);
});

test('keeps the scene and the element, so a finding can be found', () => {
  const [finding] = offAxisMarks([before]);
  assert.equal(finding.scene, 'anatomy');
  assert.equal(finding.element, 'span[data-part=icon]');
});

test('takes a tolerance, for a page that has reason to want a tighter one', () => {
  assert.deepEqual(offAxisMarks([after], 0.1), [{ ...after, offset: 0.25 }]);
  assert.deepEqual(offAxisMarks([before], 4), []);
});

test('says nothing about a page with no marks on it', () => {
  assert.deepEqual(offAxisMarks([]), []);
});
