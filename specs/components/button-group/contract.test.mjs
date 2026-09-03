import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { assertContractShape } from '../../contract.schema.mjs';

const contract = JSON.parse(await readFile(new URL('./contract.json', import.meta.url), 'utf8'));
const buttonContract = JSON.parse(
  await readFile(new URL('../button/contract.json', import.meta.url), 'utf8'),
);
const tokenContract = JSON.parse(
  await readFile(new URL('../../../packages/tokens/src/contract.json', import.meta.url), 'utf8'),
);

test('satisfies the shared contract schema', () => {
  assertContractShape(contract);
});

test('names the identifier a consumer selects the family by', () => {
  assert.equal(contract.family, 'button-group');
  assert.equal(contract.ui, 'button-group');
  assert.equal(contract.schemaVersion, 5);
});

/**
 * One member. The separator is a part rather than a second member because a
 * member owns a root, and there is one root here: the group. Its own component
 * in each binding is how a part gets written, which is the shape
 * `SlButtonStart` already takes in the button family.
 */
test('is one group, and the separator is a part of it', () => {
  assert.deepEqual(Object.keys(contract.members), ['buttonGroup']);
  assert.deepEqual(contract.members.buttonGroup.parts, ['root', 'separator']);
});

test('renders the element that claims nothing but the grouping', () => {
  assert.equal(contract.members.buttonGroup.nativeElement, 'div');
  assert.equal(contract.role, 'group');
});

/**
 * A group of actions is not a composite control. Every button keeps its place
 * in the tab sequence, and the arrow-key model of the APG Toolbar pattern
 * belongs to `toolbar`, which is a separate family in wave 4. Primer draws the
 * same line: its focus zone is enabled only when the role is `toolbar`.
 */
test('manages no focus, and names the family that does', () => {
  assert.equal(contract.rovingFocus, false);
  assert.equal(contract.rovingFocusOwner, 'toolbar');
});

test('carries no state: an arrangement does not move', () => {
  assert.deepEqual(contract.members.buttonGroup.states, ['default']);
  assert.ok(!('stateAttributes' in contract));
  assert.ok(!('stateModel' in contract));
});

test('declares the capabilities the shared vocabulary has words for', () => {
  assert.deepEqual(contract.members.buttonGroup.capabilities, [
    'arrangement',
    'orientation',
    'appearance',
    'fullWidth',
    'decorative',
  ]);
});

test('runs in two directions and defaults to the one a row of actions implies', () => {
  assert.deepEqual(contract.axes.orientation, ['horizontal', 'vertical']);
  assert.equal(contract.members.buttonGroup.defaults.orientation, 'horizontal');
});

/**
 * Separation is a step on the space scale, the same vocabulary `stack`,
 * `inline` and `grid` publish, so a group is retuned by the theme rather than
 * by a length a consumer wrote.
 */
test('separates by a step on the shared space scale', () => {
  assert.deepEqual(contract.axes.gap, [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
  ]);
  assert.equal(contract.members.buttonGroup.defaults.gap, '4');
});

/**
 * `auto` is a value rather than an absent one: the axis a group is laid out on
 * decides what "across the flow" should mean, and a row of controls and a
 * column of them want opposite answers.
 */
test('places the buttons across the flow, and knows what each axis needs', () => {
  assert.deepEqual(contract.axes.align, ['auto', 'start', 'center', 'end', 'stretch']);
  assert.equal(contract.members.buttonGroup.defaults.align, 'auto');
  assert.deepEqual(contract.alignAuto, { horizontal: 'center', vertical: 'stretch' });
});

test('places the buttons along the flow only when it holds the line', () => {
  assert.deepEqual(contract.axes.justify, ['start', 'center', 'end', 'between']);
  assert.ok(!('justify' in contract.members.buttonGroup.defaults));
});

/**
 * Three answers to a container narrower than the row, and the third is the one
 * Spectrum and Carbon both reach a `ResizeObserver` for. A container query
 * decides it in CSS instead, so it is already right on the server.
 */
test('answers a container narrower than the row', () => {
  assert.deepEqual(contract.axes.collapse, ['wrap', 'nowrap', 'stack']);
  assert.equal(contract.members.buttonGroup.defaults.collapse, 'wrap');
  assert.equal(contract.collapseBreakpoint, '360px');
});

test('joins the controls into one shape when it is asked to', () => {
  assert.equal(contract.members.buttonGroup.defaults.attached, false);
  assert.equal(contract.members.buttonGroup.defaults.fullWidth, false);
});

/**
 * The seam exists because `button` paints a solid control's edge with its own
 * fill, so two overlapped solid controls are one uninterrupted rectangle. The
 * group repaints one border side of a joined solid child, and it selects that
 * child by two attributes the button contract declares in public.
 */
test('names the button attributes the joined seam selects on', () => {
  assert.deepEqual(contract.seam, {
    ui: 'button',
    variant: 'solid',
    colorRole: 'solid-active',
    toneAttribute: 'data-tone',
  });
  assert.equal(buttonContract.ui, contract.seam.ui);
  assert.ok(buttonContract.axes.variant.includes(contract.seam.variant));
});

/**
 * The seam is the darkest step of the control's own tone, which is what Primer,
 * Material UI, Ant Design and Bootstrap all reach for. It was `--slotted-surface`
 * first, and the capture refused it: a white line through a filled bar cuts it
 * into separate buttons instead of dividing one bar, and it appeared on the
 * boundary between an outline control and a filled one, where no boundary
 * belonged at all.
 */
test('reads the seam from a role every tone carries', () => {
  const tones = buttonContract.axes.tone;
  const declared = new Set(tokenContract.tokens.map(({ name }) => name));

  for (const tone of tones) {
    const token = `--slotted-tone-${tone}-${contract.seam.colorRole}`;
    assert.ok(declared.has(token), `the foundation declares no ${token}`);
  }
});

/**
 * A joined bar has one edge, and one edge cannot be the sum of several
 * controls' opinions about their own. `button` repaints its whole border when
 * it is pressed or unavailable — correctly, for a control standing on its own —
 * and inside a bar that punched a hole in the frame exactly where that control
 * sat. The group owns the edge; the control keeps its fill.
 */
test('takes the bar edge away from the controls that sit in it', () => {
  assert.equal(contract.frameOwner, 'button-group');
});

/**
 * How a group is laid out and how its buttons are painted are two questions,
 * so they travel through two providers. The paint reuses the button family's
 * own defaults mechanism, which is what keeps an explicit prop on a button
 * winning over the group.
 */
test('provides the button axes it forwards, and no axis of its own twice', () => {
  assert.deepEqual(contract.provides.buttonDefaults, ['tone', 'variant', 'size']);
  for (const axis of contract.provides.buttonDefaults) {
    assert.ok(axis in buttonContract.axes, `button declares no ${axis} axis`);
    assert.ok(!(axis in contract.axes), `${axis} is button's axis and must not be restated`);
  }
  assert.deepEqual(contract.provides.groupDefaults, ['gap', 'attached', 'collapse']);
});

test('announces the separator unless it is asked to be decoration', () => {
  assert.equal(contract.members.buttonGroup.defaults.decorative, false);
});

test('names one reference page, covering the shape, the axes and the reflow', () => {
  assert.deepEqual(Object.keys(contract.scenarios), ['buttonGroup']);
  for (const id of [
    'playground',
    'attachment',
    'orientation',
    'separation',
    'collapse',
    'composition',
    'accessibility',
  ]) {
    assert.ok(contract.scenarios.buttonGroup.includes(id), `no scenario covers ${id}`);
  }
});
