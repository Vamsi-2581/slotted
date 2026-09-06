import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { assertContractShape, MUTABLE_CAPABILITIES } from '../../contract.schema.mjs';

const contract = JSON.parse(await readFile(new URL('./contract.json', import.meta.url), 'utf8'));
const member = contract.members.select;
const keys = contract.keyboard.map((entry) => entry.key);

test('satisfies the shared contract schema', () => {
  assertContractShape(contract);
});

test('names the identifier a consumer selects the family by', () => {
  assert.equal(contract.family, 'select');
  assert.equal(contract.ui, 'select');
  assert.equal(contract.schemaVersion, 5);
});

/**
 * Three pages answer this family, and none of them alone does. The combobox
 * pattern owns the control; the select-only example owns the key table, because
 * a combobox that takes no text is exactly what this family is; the listbox
 * pattern owns the popup and its selection states.
 */
test('cites all three pages of the pattern it answers', () => {
  assert.equal(contract.pattern, 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/');
  assert.equal(
    contract.examplePattern,
    'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/',
  );
  assert.equal(contract.listboxPattern, 'https://www.w3.org/WAI/ARIA/apg/patterns/listbox/');
  assert.deepEqual(contract.roles, {
    trigger: 'combobox',
    content: 'listbox',
    item: 'option',
    group: 'group',
    separator: 'separator',
    status: 'status',
  });
});

/**
 * `docs/component-features.md` §2.8 asks for the native element first. It was
 * considered and refused, and the refusal states its own cost rather than
 * leaving a reader to find it.
 */
test('says which native element it refused, and what refusing it costs', () => {
  assert.equal(contract.nativeElement.considered, 'select');
  assert.equal(contract.nativeElement.refused, true);
  assert.match(contract.nativeElement.reason, /operating system/i);
  assert.match(contract.nativeElement.reason, /hidden native select/i);
});

test('answers every key the pattern lists, and says where focus lands', () => {
  assert.deepEqual(keys, [
    'ArrowDown',
    'ArrowUp',
    'Alt+ArrowDown',
    'Alt+ArrowUp',
    'Enter',
    'Space',
    'Home',
    'End',
    'PageDown',
    'PageUp',
    'Printable character',
    'Escape',
    'Tab',
  ]);
  for (const entry of contract.keyboard) {
    assert.ok(entry.effect.length > 0, `${entry.key} does not say what it does`);
    assert.ok(entry.focus.length > 0, `${entry.key} does not say where focus lands`);
    assert.ok(['platform', 'pattern', 'family'].includes(entry.source), `${entry.key} source`);
  }
});

/**
 * The one key whose behaviour departs from the example it was transcribed from.
 * A departure with no written cost is the failure `patterns.md` names.
 */
test('records the one key that departs from the example, as a departure', () => {
  const up = contract.keyboard.find((entry) => entry.key === 'ArrowUp');
  assert.equal(up.source, 'family');
  assert.match(up.effect, /departure|mirror/i);
});

/** Tab commits here and does not in `combobox`, and the table has to say so. */
test('commits on Tab, which is what separates it from an editable combobox', () => {
  const tab = contract.keyboard.find((entry) => entry.key === 'Tab');
  assert.match(tab.effect, /commits/);
  assert.match(tab.effect, /native select/);
});

test('declares a state model for each of the three values a consumer can own', () => {
  for (const capability of ['selection', 'open', 'current']) {
    assert.ok(member.capabilities.includes(capability), `${capability} is not declared`);
    assert.ok(MUTABLE_CAPABILITIES.includes(capability), `${capability} is not mutable`);
  }
  assert.deepEqual(contract.stateModel.selection, {
    controlled: 'value',
    uncontrolled: 'defaultValue',
    request: 'onValueChange',
    reasons: ['pointer', 'keyboard', 'clear', 'select', 'programmatic'],
  });
  assert.deepEqual(contract.stateModel.current, {
    controlled: 'highlightedValue',
    uncontrolled: 'defaultHighlightedValue',
    request: 'onHighlightedValueChange',
    reasons: ['pointer', 'keyboard', 'programmatic'],
  });
  assert.ok(contract.stateModel.open.reasons.includes('select'));
  assert.ok(contract.stateModel.open.reasons.includes('escape'));
  assert.ok(contract.stateModel.open.reasons.includes('outsidePress'));
});

/**
 * The highlight is where the reader is and the selection is what they chose.
 * The listbox pattern's own note separates the two, and a family that painted
 * one attribute for both would leave a reader unable to tell a value they had
 * committed from a row they had merely arrowed past.
 */
test('keeps the highlight and the selection apart, in both the DOM and ARIA', () => {
  assert.equal(contract.highlight.mechanism, 'aria-activedescendant');
  assert.equal(contract.highlight.attribute, 'data-current');
  assert.equal(contract.stateAttributes.current, 'data-current');
  assert.equal(contract.stateAttributes.selected, 'data-selected');
  assert.match(contract.wiring['aria-selected'], /committed/);
  assert.match(contract.highlight.reason, /select-only|focus/i);
});

test('keeps focus on the trigger, so the layer needs no guard and no restore', () => {
  assert.equal(contract.focus.roving, false);
  assert.equal(contract.focus.contained, false);
  assert.equal(contract.focus.guards, false);
  assert.match(contract.focus.guardsReason, /never enters/i);
  assert.match(contract.focus.disabledItems, /skipped/i);
});

test('composes the core modules and rewrites none of them', () => {
  assert.deepEqual(contract.composes, [
    'positioner',
    'presence',
    'portal',
    'dismissable-layer',
    'typeahead',
    'collection',
  ]);
  assert.equal(contract.layer.modal, false);
  assert.equal(contract.layer.scrollLock, false);
  assert.equal(contract.layer.zIndexToken, '--slotted-z-index-popover');
  assert.ok(contract.layer.branches.length > 0);
});

test('says which shared ground it had to add, and why', () => {
  assert.equal(contract.adds.collection.module, 'packages/core/src/collection');
  assert.match(contract.adds.collection.reason, /aria-activedescendant/);
  assert.match(contract.adds.collection.reason, /locale/i);
  assert.equal(contract.adds.collection.nextConsumer, 'listbox');
});

/**
 * The family is two subtrees and `data-ui` is on both, which is a departure
 * from every family built before it. A consumer selecting on `[data-ui]` gets
 * two elements, so the contract says so where a reader will find it.
 */
test('declares that the identifier is written on two elements, and why', () => {
  assert.deepEqual(contract.portalledIdentity.elements, ['root', 'positioner']);
  assert.match(contract.portalledIdentity.reason, /portalled/);
  assert.ok(member.parts.includes('root'));
  assert.ok(member.parts.includes('positioner'));
});

test('names every part, and no part it does not own', () => {
  assert.deepEqual(member.parts, [
    'root',
    'trigger',
    'value',
    'arrow',
    'busy',
    'clear',
    'positioner',
    'content',
    'group',
    'group-label',
    'item',
    'indicator',
    'icon',
    'label',
    'description',
    'separator',
    'empty',
    'status',
    'placeholder',
  ]);
  assert.deepEqual(member.states, [
    'default',
    'hover',
    'active',
    'focus-visible',
    'open',
    'disabled',
    'readonly',
    'invalid',
    'required',
    'loading',
    'selected',
    'current',
  ]);
});

/**
 * A controlled value the collection does not hold is what an async list shows
 * on its first render. Every surveyed implementation paints the placeholder;
 * this one says the label could not be resolved and shows the value.
 */
test('says what it draws for a value no option matches', () => {
  assert.equal(contract.value.part, 'value');
  assert.equal(contract.value.unmatched, 'data-unmatched');
  assert.match(contract.value.reason, /placeholder/);
});

test('answers a form the way each ecosystem does, and records the asymmetry', () => {
  assert.match(contract.form.react, /hidden native select/);
  assert.match(contract.form.angular, /ControlValueAccessor/);
  assert.match(contract.form.angular, /Validator/);
  assert.match(contract.form.reason, /asymmetry/i);
});

test('bounds the surface by the room the positioner reports, and by the anchor width', () => {
  assert.equal(contract.overflow.part, 'content');
  assert.equal(contract.overflow.property, '--slotted-positioner-available-height');
  assert.equal(contract.measure.property, '--slotted-positioner-anchor-width');
  for (const property of [
    '--slotted-layer-depth',
    '--slotted-positioner-anchor-width',
    '--slotted-positioner-available-height',
    '--slotted-positioner-transform-origin',
  ]) {
    assert.ok(contract.runtimeProperties.includes(property), `${property} is not declared`);
  }
});

/** A list of a hundred options that does not wrap is where the reader keeps their place. */
test('does not loop by default, which is where it parts company with menu', () => {
  assert.equal(member.defaults.loop, false);
});

test('resolves every axis in the same order, and holds a default for each', () => {
  for (const axis of Object.keys(contract.axes)) {
    const resolution = contract.resolution[axis];
    assert.ok(Array.isArray(resolution), `${axis} declares no resolution order`);
    assert.equal(resolution[0], 'prop', `${axis} does not let the consumer's value win`);
    assert.equal(resolution[1], 'defaults', `${axis} cannot be set once for an application`);
    assert.ok(axis in member.defaults, `${axis} has no default`);
    assert.deepEqual(member.defaults[axis], resolution[2], `${axis} default disagrees`);
  }
});

test('lets an application set every axis and every word it speaks once', () => {
  for (const axis of Object.keys(contract.axes)) {
    assert.ok(contract.provides.selectDefaults.includes(axis), `${axis} is not in the provider`);
  }
  for (const word of ['clearLabel', 'emptyLabel', 'loadingLabel']) {
    assert.ok(contract.provides.selectDefaults.includes(word), `${word} is not in the provider`);
    assert.ok(word in member.defaults, `${word} has no default`);
  }
});

/** Each decline names the family that owns the capability instead, or the cost. */
test('declines nothing without naming what owns it instead', () => {
  assert.equal(contract.declined.modal.deferTo, 'dialog');
  assert.equal(contract.declined.backdrop.deferTo, 'dialog');
  assert.equal(contract.declined.arrow.deferTo, 'popover');
  assert.equal(contract.declined.chips.deferTo, 'multi-select');
  assert.equal(contract.declined.freeText.deferTo, 'combobox');
  assert.equal(contract.declined.virtualization.deferTo, 'collection');
  assert.match(contract.declined.itemAligned.reason, /no composition replaces it/i);
  for (const [name, entry] of Object.entries(contract.declined)) {
    assert.ok(entry.reason.length > 0, `${name} declines with no reason`);
  }
});

test('declares a scenario for every capability a reference page has to prove', () => {
  assert.deepEqual(contract.scenarios.select, [
    'playground',
    'selection',
    'placeholder',
    'groups',
    'multiple',
    'clearable',
    'sizes',
    'variants',
    'states',
    'loading-and-empty',
    'long-content',
    'placement',
    'keyboard',
    'form',
    'composition',
  ]);
});
