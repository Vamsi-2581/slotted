import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { assertContractShape, MUTABLE_CAPABILITIES } from '../../contract.schema.mjs';

const contract = JSON.parse(await readFile(new URL('./contract.json', import.meta.url), 'utf8'));
const message = JSON.parse(
  await readFile(new URL('../inline-message/contract.json', import.meta.url), 'utf8'),
);
const field = contract.members.field;

test('satisfies the shared contract schema', () => {
  assertContractShape(contract);
});

test('names the identifier a consumer selects the family by', () => {
  assert.equal(contract.family, 'field');
  assert.equal(contract.ui, 'field');
  assert.equal(contract.schemaVersion, 5);
});

/**
 * One member, five parts. A field never appears without its box, so every piece
 * of it is a part of that box rather than a member of its own — the shape
 * `card` and `alert` already have. `counter` is the part Angular Material and
 * Carbon both draw and neither names: Angular Material asks for a
 * `mat-hint align="end"`, which shares a row with the error and pushes it.
 */
test('is one member, and the five parts the family draws', () => {
  assert.deepEqual(Object.keys(contract.members), ['field']);
  assert.deepEqual(field.parts, ['root', 'label', 'mark', 'control', 'counter']);
});

/**
 * A `div`, because the field is a box around a control rather than a control.
 * Every surveyed implementation but Spectrum renders one, and Spectrum has no
 * field family at all: it spends a `label`, a `description` and an
 * `errorMessage` prop on every control instead.
 */
test('renders a div holding a native label and a native control', () => {
  assert.equal(field.nativeElement, 'div');
  assert.ok(field.parts.includes('label'));
  assert.ok(field.parts.includes('control'));
});

/**
 * The description and the error are `inline-message`, which
 * `docs/process/build-order.md` states as the reason that family was built in wave 2.
 * The field draws neither a mark nor a severity word of its own; it points at
 * the family that already does, so a field error and a status light about the
 * same thing speak the same word.
 *
 * The one value the field answers rather than passes is the mark, and the
 * answer is no mark at all (F2): a message under a control is a small box that
 * repeats down a form, and ten of them in error are ten circled exclamations in
 * a column — the limit R5 draws. The tone is said by the ink and by the weight
 * of the sentence, which is what F1 settled. `mark='glyph'` and `mark='dot'`
 * are still there for a page that asks for either.
 */
test('speaks through the message family instead of drawing a message', () => {
  assert.equal(contract.messageFamily, 'inline-message');
  assert.equal(message.ui, contract.messageFamily);
  assert.ok(
    !field.parts.includes('description') && !field.parts.includes('error'),
    'the field claims a part it does not own',
  );
  assert.equal(contract.messagePlacement, 'after');
  assert.equal(contract.messageMark, 'none');
  assert.ok(
    message.axes.mark.includes(contract.messageMark),
    'the field asks for a mark inline-message does not draw',
  );
  assert.equal(contract.messageTones.description, 'secondary');
  assert.equal(contract.messageTones.error, 'danger');
  for (const tone of Object.values(contract.messageTones)) {
    assert.ok(message.axes.tone.includes(tone), `${tone} is not a tone inline-message speaks`);
  }
});

/**
 * Four identifiers derived from one base, rather than registered by the parts.
 * `label[for]` then resolves to the identifier the control will use with no
 * ordering dependency between siblings and nothing to coordinate during
 * hydration, which is the decision
 * `docs/history/designs/2026-08-31-field-primitive-design.md` records.
 */
test('derives every identifier from one base', () => {
  assert.deepEqual(contract.identifiers, ['control', 'label', 'description', 'error']);
});

/**
 * Description first, error second, and the order is fixed rather than read from
 * the DOM. Two known slots have one correct reading order, and deriving it from
 * registration order would make the accessible description depend on when an
 * effect ran.
 */
test('reads the help before the error, whatever order the page wrote them in', () => {
  assert.deepEqual(contract.describedBy, ['description', 'error']);
});

/**
 * `aria-required`, never the native `required`: the native attribute engages
 * browser constraint validation and changes submit behaviour, which the library
 * must not impose as a side effect of describing a field. `disabled` is native,
 * because removing the control from the tab order and from submission is what
 * the word means.
 */
test('describes the control without taking over its submission', () => {
  assert.deepEqual(contract.wiring, {
    id: 'always',
    'aria-describedby': 'merged',
    'aria-invalid': 'invalid',
    'aria-required': 'required',
    disabled: 'disabled',
    readonly: 'readOnly',
  });
  assert.ok(!('required' in contract.wiring));
});

/**
 * Three values for necessity, which is the axis Spectrum spends
 * `necessityIndicator` on, Angular Material `hideRequiredMarker`, and Chakra and
 * Ark a `fallback` prop. `text` is the one that also speaks for a field that is
 * *not* required, which is how a form of mostly optional fields marks the few
 * that are not.
 */
test('says necessity as a mark, as words, or not at all', () => {
  assert.deepEqual(contract.axes.requiredMark, ['mark', 'text', 'none']);
  assert.equal(field.defaults.requiredMark, 'mark');
  assert.deepEqual(Object.keys(contract.necessityWords), ['required', 'optional']);
});

/**
 * The mark is hidden from assistive technology and the words are not. The
 * semantics reach a reader through `aria-required` on the control, once; a
 * reader working a form of twenty required fields does not need to hear
 * "asterisk" twenty times, and `(optional)` is information rather than
 * decoration.
 */
test('hides the mark from a reader and never hides the words', () => {
  assert.equal(contract.markHidden, true);
});

/**
 * The label sits above the control or beside it — the axis Fluent calls
 * `orientation`, Primer `layout` and Spectrum `labelPosition`. It is `placement`
 * in this library's shared capability vocabulary, and `orientation` is left to
 * mean what it means everywhere else here: the direction a family's children
 * flow in.
 */
test('places the label above the control or beside it', () => {
  assert.deepEqual(contract.axes.labelPlacement, ['top', 'side']);
  assert.equal(field.defaults.labelPlacement, 'top');
  assert.ok(field.capabilities.includes('placement'));
  assert.ok(!field.capabilities.includes('orientation'));
});

/**
 * A side label reflows to a top label when the field itself is narrow, which
 * nothing surveyed does — a Spectrum side label squeezes its control instead.
 * The breakpoint is a literal because CSS forbids a custom property in a
 * container condition, which `docs/token-foundation.md` rule 4 records.
 */
test('stacks the side label when the field is too narrow to hold both', () => {
  assert.equal(contract.reflowBreakpoint, '320px');
  assert.equal(contract.containerName, 'slotted-field');
});

/**
 * Three steps, reading the control type scales the theme restates per density,
 * so a field in a dense table shrinks whole rather than in parts. Fluent ships
 * the same three under the same capability.
 */
test('steps with the control it wraps', () => {
  assert.deepEqual(contract.axes.size, ['sm', 'md', 'lg']);
  assert.equal(field.defaults.size, 'md');
});

/**
 * None of the four shared states is in `defaults`, and the absence is the
 * decision. A default of `false` cannot be told from a consumer saying "not
 * disabled", so a field that defaulted to `false` would quietly override a
 * disabled `field-group` — the invariant
 * `docs/history/designs/2026-08-31-field-aware-controls-design.md` states from
 * the control's side.
 */
test('leaves every shared state unset, so the group can answer it', () => {
  for (const capability of ['disabled', 'invalid', 'required', 'readOnly']) {
    assert.ok(field.capabilities.includes(capability), `field cannot be ${capability}`);
    assert.ok(!(capability in field.defaults), `${capability} defaults instead of deferring`);
  }
  assert.deepEqual(Object.keys(field.defaults).sort(), ['labelPlacement', 'requiredMark', 'size']);
});

/**
 * `readonly` sits above `invalid` in `STATE_PRECEDENCE`, and both sit below
 * `disabled`. The field paints all four on its root so the label, the mark and
 * the messages follow from one place rather than each part repeating the state.
 */
test('paints the four states a field can be in, on one element', () => {
  assert.deepEqual(field.states, ['default', 'disabled', 'invalid', 'required', 'readonly']);
  assert.deepEqual(contract.stateAttributes, {
    disabled: 'data-disabled',
    invalid: 'data-invalid',
    required: 'data-required',
    readonly: 'data-readonly',
  });
});

/**
 * The counter carries its own `data-invalid` rather than reading the field's: a
 * count can pass its limit while the form has not yet decided the field is in
 * error, and a counter that only turned red once the error appeared would say
 * nothing at the moment it is being read.
 */
test('lets the counter go over its limit before the field is in error', () => {
  assert.ok(field.parts.includes('counter'));
  assert.ok(field.capabilities.includes('invalid'));
  assert.equal(contract.stateAttributes.invalid, 'data-invalid');
});

/**
 * The field is told its state; it holds none. The value belongs to the control
 * and the validity to `form` in wave 3, which `docs/process/build-order.md` names as
 * the owner of submission and validation. The assertion keeps the absence a
 * decision rather than an oversight.
 */
test('moves nothing, so it declares no state model', () => {
  assert.ok(!('stateModel' in contract));
  for (const member of Object.values(contract.members)) {
    for (const capability of member.capabilities) {
      assert.ok(!MUTABLE_CAPABILITIES.includes(capability), `${capability} holds state`);
    }
  }
});

/**
 * Every literal in the family, with the reason it is not a token. Both are line
 * lengths, and `docs/token-foundation.md` holds no scale of those; the
 * breakpoint is a literal because CSS forbids a custom property in a container
 * condition.
 */
test('records the reason for every value that is not a token', () => {
  assert.deepEqual(Object.keys(contract.literals), [
    '--slotted-field-label-inline-size',
    'reflowBreakpoint',
  ]);
  for (const reason of Object.values(contract.literals)) {
    assert.ok(reason.length > 40, 'a literal is recorded with no reason');
  }
});

/** What an application decides once instead of on every field in a form. */
test('names the decisions an application takes once', () => {
  assert.deepEqual(contract.provides.fieldDefaults, [
    'size',
    'labelPlacement',
    'requiredMark',
    'necessityWords',
  ]);
});

test('names one reference page, covering every axis and every state', () => {
  assert.deepEqual(Object.keys(contract.scenarios), ['field']);
  assert.deepEqual(contract.scenarios.field, [
    'playground',
    'necessity',
    'placement',
    'sizes',
    'states',
    'messages',
    'counter',
    'content',
    'composition',
    'accessibility',
  ]);
});
