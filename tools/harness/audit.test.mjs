import assert from 'node:assert/strict';
import test from 'node:test';

import {
  annotatesTheLine,
  collapsedElements,
  offAxisMarks,
  overflowingElements,
  turningExcess,
} from './audit.mjs';

/**
 * The audit reports three failures, and for three sessions it reported them
 * where there were none: a `script` counted as a collapsed demonstration (G5),
 * a glyph measured against the box of a title that wrapped instead of against
 * its first line (G7), and the diagonal of a spinning ring counted as content
 * leaving its slot (G10). Every one of those rules lived inside a string
 * evaluated in Chrome, where no case could be put to it.
 *
 * They live here now, and so do the cases. The numbers are measured ones, from
 * the harness pages named beside them.
 */

/* ── An element that collapsed to a sliver ─────────────────────────────── */

const child = (overrides) => ({
  scene: 'states · light · 420px · comfortable · ltr',
  element: 'div[data-ui=checkbox][data-part=root]',
  tag: 'div',
  width: 420,
  stage: 446,
  boxes: 1,
  children: [],
  ...overrides,
});

test('reports a stage child that stands narrower than a demonstration', () => {
  const sliver = child({ width: 18, element: 'div[data-ui=stepper][data-part=root]' });
  assert.deepEqual(collapsedElements([sliver]), [
    {
      scene: sliver.scene,
      element: 'div[data-ui=stepper][data-part=root]',
      width: 18,
      stage: 446,
    },
  ]);
});

test('says nothing about a child that fills the stage it stands in', () => {
  assert.deepEqual(collapsedElements([child()]), []);
});

/**
 * G5. A harness fragment carries its own `script` where a scene needs one — the
 * `states` scene of `checkbox` sets `indeterminate` from JavaScript, because no
 * attribute can — and the element is a child of the stage. Measured as a
 * demonstration it is nought pixels wide inside a 446-pixel stage, which reads
 * exactly like the worst defect this rule exists to catch. Ninety findings
 * across the families were this.
 */
test('does not count an element that draws nothing as a demonstration', () => {
  const script = child({ tag: 'script', element: 'script', width: 0, boxes: 0 });
  const style = child({ tag: 'style', element: 'style', width: 0, boxes: 0 });
  const template = child({ tag: 'template', element: 'template', width: 0, boxes: 0 });
  assert.deepEqual(collapsedElements([script, style, template]), []);
});

/**
 * TG1. The `group` scene of `tag` renders an empty group on purpose — an
 * actions area built from a permission filter renders one often — and
 * `tag.css` hides it with `display: none`, which is the whole point of the
 * scene. The audit measured the hidden element at 0px in all three schemes and
 * called it collapsed, six times, while the capture plainly showed the tags
 * beside it.
 */
test('does not count an element the stylesheet took out of the layout', () => {
  const hidden = child({
    scene: 'group · light · 420px · comfortable · ltr',
    element: 'div[data-ui=tag][data-part=group]',
    width: 0,
    boxes: 0,
    children: [],
  });
  assert.deepEqual(collapsedElements([hidden]), []);
});

/**
 * An element with no box of its own is not a demonstration either — its
 * children are. `display: contents` makes a wrapper the layout does not see, so
 * it measures nought however wide its content is.
 */
test('judges what a box-less wrapper actually drew', () => {
  const wrapper = child({
    element: 'div[data-part=wrapper]',
    width: 0,
    boxes: 0,
    children: [
      child({ width: 400, element: 'div[data-part=wide]' }),
      child({ width: 12, element: 'div[data-part=narrow]' }),
    ],
  });
  assert.deepEqual(
    collapsedElements([wrapper]).map((finding) => finding.element),
    ['div[data-part=narrow]'],
  );
});

test('takes a floor, for a page that has reason to want another one', () => {
  const small = child({ width: 91, element: 'div[data-ui=menu][data-part=root]' });
  assert.equal(collapsedElements([small]).length, 1);
  assert.deepEqual(collapsedElements([small], 90), []);
});

test('rounds the measurement it reports, and keeps the scene', () => {
  const [finding] = collapsedElements([child({ width: 90.6, stage: 446.4 })]);
  assert.equal(finding.width, 91);
  assert.equal(finding.stage, 446);
  assert.equal(finding.scene, 'states · light · 420px · comfortable · ltr');
});

/* ── Content that ran outside the box that owns it ─────────────────────── */

const slot = (overrides) => ({
  scene: 'states · light · 420px · compact · ltr',
  element: 'span[data-part=start]',
  scrollWidth: 17,
  clientWidth: 14,
  turning: 0,
  ...overrides,
});

test('reports content that ran outside the box that owns it', () => {
  assert.deepEqual(overflowingElements([slot({ scrollWidth: 266, clientWidth: 240 })]), [
    {
      scene: 'states · light · 420px · compact · ltr',
      element: 'span[data-part=start]',
      width: 266,
      stage: 240,
    },
  ]);
});

test('lets a rounding artefact through', () => {
  assert.deepEqual(overflowingElements([slot({ scrollWidth: 241, clientWidth: 240 })]), []);
});

/**
 * A rotation moves no layout and changes no box, but a turned square's
 * *bounding* box is its diagonal, and scrollable overflow is measured from
 * bounding boxes.
 */
test('measures what a turn can add to the inline axis', () => {
  assert.equal(+turningExcess({ width: 14, height: 14 }).toFixed(2), 5.8);
  assert.equal(turningExcess({ width: 10, height: 0 }), 0);
});

/**
 * G10. The `states` scene of `button` at `compact` holds a fourteen-pixel ring
 * that turns once a second, and the audit photographed it mid-spin: 17 pixels
 * of content in a 14-pixel slot, twice — once for the border ring `button`
 * drew before B4 and once for the masked glyph it draws now. Three pixels is
 * inside the 5.8 a fourteen-pixel square gains by turning.
 */
test('withdraws an overflow that fits inside what a turning descendant adds', () => {
  const spinning = slot({
    scrollWidth: 17,
    clientWidth: 14,
    turning: turningExcess({ width: 14, height: 14 }),
  });
  assert.deepEqual(overflowingElements([spinning]), []);
});

/**
 * A slot holding both a spinner and something genuinely too wide keeps its
 * finding: the withdrawal is the size of the turn, not the presence of one.
 */
test('keeps an overflow larger than the turn can account for', () => {
  const both = slot({
    scrollWidth: 40,
    clientWidth: 14,
    turning: turningExcess({ width: 14, height: 14 }),
  });
  assert.deepEqual(
    overflowingElements([both]).map((finding) => finding.width),
    [40],
  );
});

test('takes a tolerance for the overflow it forgives', () => {
  const narrow = slot({ scrollWidth: 243, clientWidth: 240 });
  assert.equal(overflowingElements([narrow]).length, 1);
  assert.deepEqual(overflowingElements([narrow], 4), []);
});

/* ── A mark off the axis of the line it annotates ──────────────────────── */

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

/**
 * G7, the second half. `result-state` puts its glyph on a row of its own above
 * the title, by design, and a glyph on its own row has no axis to miss: it is
 * aligned to a block. Two boxes that share no band of the page share no line.
 */
test('does not ask a glyph on a row of its own to sit on a line it never shared', () => {
  const stacked = {
    scene: 'reach · light · 420px · comfortable · ltr',
    element: 'span[data-part=icon]',
    markTop: 100,
    markBottom: 132,
    lineTop: 148,
    lineBottom: 168,
    markCentre: 116,
    textCentre: 158,
  };
  assert.equal(annotatesTheLine(stacked), false);
  assert.deepEqual(offAxisMarks([stacked]), []);
});

test('measures a glyph that shares the line, however far off it sits', () => {
  const beside = {
    scene: 'content · light · 240px · comfortable · ltr',
    element: 'span[data-part=icon]',
    markTop: 150,
    markBottom: 166,
    lineTop: 148,
    lineBottom: 168,
    markCentre: 158,
    textCentre: 148.25,
  };
  assert.equal(annotatesTheLine(beside), true);
  assert.deepEqual(
    offAxisMarks([beside]).map((finding) => finding.offset),
    [9.75],
  );
});

test('treats a record with no bands as one that shares its line', () => {
  assert.equal(annotatesTheLine({ markCentre: 1, textCentre: 2 }), true);
});
