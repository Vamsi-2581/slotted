import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { assertContractShape, CHANGE_REASONS, TONES } from '../../contract.schema.mjs';

const contract = JSON.parse(await readFile(new URL('./contract.json', import.meta.url), 'utf8'));

test('satisfies the shared contract schema', () => {
  assertContractShape(contract);
});

test('names the identifier a consumer selects the family by', () => {
  assert.equal(contract.family, 'alert');
  assert.equal(contract.ui, 'alert');
  assert.equal(contract.schemaVersion, 5);
});

/**
 * One member holding every part, which is the shape `card` and `kbd` both
 * ship. The title, the description and the row of actions are parts a consumer
 * places rather than families of their own: none of the three means anything
 * outside the box, and a `AlertTitle` rendered on its own is a `div`.
 */
test('is one member, and the parts a consumer writes inside it', () => {
  assert.deepEqual(Object.keys(contract.members), ['alert']);
  assert.deepEqual(contract.members.alert.parts, [
    'root',
    'icon',
    'content',
    'title',
    'description',
    'actions',
    'dismiss',
  ]);
});

/**
 * The root is a `section`, so a named alert is a `region` landmark a reader can
 * jump to and an unnamed one costs nothing. Primer's Banner is the one
 * surveyed implementation that reaches the same element; Polaris, MUI and
 * Carbon all use a `div` and then write a live role on it.
 */
test('makes the box a landmark rather than a live region', () => {
  assert.equal(contract.members.alert.nativeElement, 'section');
});

/**
 * The decision the family exists to get right. MDN states that the `alert`
 * role "should only be used for text content, not interactive elements such as
 * links or buttons", and every alert worth shipping has a dismiss button.
 *
 * `content` is therefore a part rather than a wrapper: it holds the title and
 * the description and nothing else, it is what carries `role="status"` or
 * `role="alert"`, and the actions and the dismiss control are its siblings
 * outside the region.
 */
test('reserves a part for the text alone, which is what announces', () => {
  const { parts } = contract.members.alert;
  assert.ok(parts.includes('content'));
  for (const part of ['actions', 'dismiss']) {
    assert.ok(parts.includes(part), `${part} has to exist to be outside the region`);
  }
  assert.deepEqual(contract.axes.live, ['off', 'polite', 'assertive']);
});

/**
 * `off`, because the APG records that "screen readers do not inform users of
 * alerts that are present on the page before page load completes". MUI
 * defaults to `role="alert"` regardless, which ships a promise the platform
 * does not keep and interrupts a reader for a message that was already there.
 */
test('announces nothing until the page says the message just arrived', () => {
  assert.equal(contract.members.alert.defaults.live, 'off');
});

/**
 * The five tones belong to the theme, and `specs/contract.schema.mjs` holds
 * the list because `alert` and `tag` once asserted it by reading `badge`'s
 * contract. The guide's five words — error, warning, success, info, neutral —
 * map one to one onto them, so no sixth vocabulary is invented here.
 */
test('speaks in the library’s five shared tones and invents no sixth word', () => {
  assert.deepEqual(contract.axes.tone, [...TONES]);
  assert.equal(contract.members.alert.defaults.tone, 'accent');
});

/**
 * A glyph per tone, so the five are distinguishable in greyscale, in the
 * `high-contrast` scheme and under forced colours, where every tone ground
 * becomes one system colour and the silhouette is all that is left. WCAG 2.2
 * 1.4.1. Every mark is circled, so all five share one silhouette and one
 * centre and the symbol inside tells them apart: a triangle's visual centre
 * is not its box's centre, and it never sat on the line the way the circles
 * did. Warning and danger therefore differ by `!` against `×`. This departs
 * from `status-indicator`, which still draws the triangle for warning.
 */
test('gives every tone a mark, so colour is never the only signal', () => {
  assert.deepEqual(contract.toneGlyphs, {
    accent: 'circle-info',
    secondary: 'circle',
    success: 'circle-check',
    warning: 'circle-alert',
    danger: 'circle-x',
  });
  for (const tone of contract.axes.tone) {
    assert.ok(tone in contract.toneGlyphs, `${tone} draws no mark`);
  }
  assert.equal(contract.members.alert.defaults.hideIcon, false);
});

/**
 * The guide's three recipes as one axis rather than three components: an alert
 * beside the thing it is about, a callout inside a section, a banner across a
 * page. Fluent has half of it in `shape: square | rounded`; Carbon splits it
 * into three exported components; the other seven have one reach and no way to
 * state another.
 *
 * It is not a size axis. A size would say the same message can be drawn large
 * or small; this says which scope the message applies to, and the geometry
 * follows from that.
 */
test('carries the reach of the message as an axis, not as three components', () => {
  assert.deepEqual(contract.axes.reach, ['inline', 'section', 'page']);
  assert.equal(contract.members.alert.defaults.reach, 'section');
  assert.ok(!('size' in contract.axes));
});

test('paints one tone three ways, in the words the library already uses', () => {
  assert.deepEqual(contract.axes.variant, ['soft', 'outline', 'solid']);
  assert.equal(contract.members.alert.defaults.variant, 'soft');
});

/**
 * The capability none of the ten surveyed implementations ships. All five that
 * dismiss are controlled only: `onDismiss` fires and the consumer removes the
 * element, so a banner nobody has written state for cannot be dismissed at
 * all. Here the pair is decided once, by whether `open` was passed.
 *
 * `escape` is deliberately not a reason. An alert is not a dismissable layer,
 * and one inside a dialog would swallow the dialog's own Escape.
 */
test('holds its own dismissal, in both modes, with a reason on the request', () => {
  assert.deepEqual(contract.members.alert.capabilities, ['appearance', 'live', 'open']);
  assert.deepEqual(contract.stateModel.open, {
    controlled: 'open',
    uncontrolled: 'defaultOpen',
    request: 'onOpenChange',
    reasons: ['dismiss', 'programmatic'],
  });
  for (const reason of contract.stateModel.open.reasons) {
    assert.ok(CHANGE_REASONS.includes(reason));
  }
  assert.ok(!contract.stateModel.open.reasons.includes('escape'));
  assert.equal(contract.members.alert.defaults.defaultOpen, true);
  assert.equal(contract.members.alert.defaults.dismissible, false);
});

/**
 * A closed alert keeps its element and carries `hidden`, so the live region is
 * still in the document when the message comes back and `data-open` is a state
 * a consumer can style. Every controlled-only implementation unmounts instead,
 * and a live region that was not in the document cannot announce.
 */
test('states openness in the DOM rather than by existing', () => {
  assert.equal(contract.stateAttributes.open, 'data-open');
  assert.ok(contract.members.alert.states.includes('open'));
});

/**
 * The dismiss control is a real button with a real name, and the word is
 * replaceable per application. Carbon and MUI both ship the string; neither
 * ships a way to state it once.
 */
test('gives the dismiss control a word, and one place to translate it', () => {
  assert.equal(contract.members.alert.defaults.dismissLabel, 'Dismiss');
});

/**
 * The gap none of the ten fills. The reader tabs to the dismiss control,
 * activates it, the control is destroyed, and focus falls to the document
 * body — so the next Tab starts again at the top of the page.
 */
test('keeps the keyboard when the message goes', () => {
  assert.equal(contract.members.alert.defaults.restoreFocus, true);
});

/**
 * No `disabled`, no `loading` and no `invalid`: the alert reports rather than
 * accepts, and each of those would describe a control it is not. The two weak
 * states it does paint belong to the dismiss button, and `:enabled` is what
 * holds them back.
 */
test('paints only the states a message can actually be in', () => {
  assert.deepEqual(contract.members.alert.states, [
    'default',
    'hover',
    'active',
    'focus-visible',
    'open',
  ]);
  for (const state of ['disabled', 'loading', 'invalid', 'selected']) {
    assert.ok(!contract.members.alert.states.includes(state), `alert claims ${state}`);
  }
});

test('names one reference page, covering every axis and both modes', () => {
  assert.deepEqual(Object.keys(contract.scenarios), ['alert']);
  assert.deepEqual(contract.scenarios.alert, [
    'playground',
    'tones',
    'variants',
    'reach',
    'dismissal',
    'actions',
    'live',
    'content',
    'composition',
    'accessibility',
  ]);
});
