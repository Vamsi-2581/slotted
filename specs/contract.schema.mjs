import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * Schema 5 adds the two facts schema 4 left to each family to invent: the
 * public identifier a consumer selects the family by, and the state model —
 * controlled, uncontrolled, and the reason a change carries. A family still on
 * schema 4 is listed in `legacy-families.json` and is awaiting the rebuild
 * ordered in `docs/build-order.md`; that list only shrinks.
 */
export const SCHEMA_VERSION = 5;
export const LEGACY_SCHEMA_VERSION = 4;

export const LEGACY_FAMILIES = JSON.parse(
  readFileSync(new URL('./legacy-families.json', import.meta.url), 'utf8'),
).families;

export const PSEUDO_STATES = ['default', 'hover', 'active', 'focus-visible'];

export const STATE_ATTRIBUTES = {
  disabled: 'data-disabled',
  loading: 'data-loading',
  pressed: 'data-pressed',
  selected: 'data-selected',
  loaded: 'data-loaded',
  indeterminate: 'data-indeterminate',
  current: 'data-current',
  invalid: 'data-invalid',
  required: 'data-required',
  readonly: 'data-readonly',
  dragging: 'data-dragging',
  checked: 'data-checked',
  /**
   * Something that has finished: a step of a flow the reader has walked past,
   * and equally a quantity that has reached the top of its range. It is not
   * `checked` and not `selected` — both of those are the reader's own choice,
   * while completion is a fact about the thing itself.
   *
   * The second reading is here because CSS cannot compare a value to a
   * maximum, so a bar that must read differently at a hundred per cent has no
   * selector to write without it.
   */
  complete: 'data-complete',
  open: 'data-open',
  expanded: 'data-expanded',
  /**
   * A value the component was holding back and is now showing whole. The
   * capability existed from `text-field`, whose reveal is a swap of the input's
   * own `type` and needs no selector; `description-list` clamps a long value in
   * CSS, so the stylesheet has to be able to select the state that releases the
   * clamp.
   *
   * It is not `open` and not `expanded`: both of those are a section of content
   * appearing beside or below a control, while this is one value being shown at
   * its full length in the place it already occupied.
   */
  revealed: 'data-revealed',
  'drop-target': 'data-drop-target',
};

export const ATTRIBUTE_STATES = Object.keys(STATE_ATTRIBUTES);

/**
 * Strongest first. Two states that can be true at once are resolved in this
 * order, and a stylesheet that paints a weaker state has to hold it back for
 * every stronger one: a disabled control does not answer hover, and a loading
 * control does not answer press. Naming the order once is what makes the rule
 * checkable instead of a habit each family relearns after a defect.
 */
export const STATE_PRECEDENCE = [
  'disabled',
  'loading',
  'readonly',
  'invalid',
  'checked',
  'selected',
  'pressed',
  'current',
  'complete',
  'active',
  'hover',
  'focus-visible',
  'default',
];

/**
 * The five semantic colours the library speaks in. They belong to the theme —
 * every one of them carries the same nine roles — so no family owns the list.
 *
 * It is stated here because it was not stated anywhere: `alert` and `tag` each
 * asserted their tones by reading `badge`'s contract, which held only while all
 * three families were on the same schema. Rebuilding one of the three renamed
 * the axis under the other two, and two tests failed for a family neither of
 * them is about.
 */
export const TONES = ['accent', 'secondary', 'success', 'warning', 'danger'];

/** Why a change was requested. A boolean cannot say, so every request does. */
export const CHANGE_REASONS = [
  'pointer',
  'keyboard',
  'clear',
  'remove',
  'select',
  'dismiss',
  'escape',
  'outsidePress',
  'blur',
  'submit',
  'programmatic',
];

export const KNOWN_CAPABILITIES = [
  'appearance',
  /** Arranging children: separation, alignment along the flow and across it. */
  'arrangement',
  'size',
  'shape',
  /**
   * A quantity the consumer states and the family draws: a progress, a level,
   * a share of a whole. It is deliberately not mutable, and the distinction is
   * the one `value` exists for — a control whose value the reader moves holds
   * `value` and a state model, where a measured quantity is read-only by the
   * definition of the role that reports it. `progress-bar` put the word in
   * this vocabulary and schema 5 filed it under the mutable list, where it
   * would have obliged `progress-indicator` to declare a request nothing can
   * emit and a reason no vocabulary holds.
   */
  'measurement',
  'live',
  'current',
  'open',
  'placement',
  'status',
  'content',
  'fullWidth',
  'disabled',
  'loading',
  'pressed',
  'orientation',
  'invalid',
  'required',
  'readOnly',
  'wiring',
  'focusable',
  'decorative',
  'underline',
  'external',
  'activation',
  'selection',
  /**
   * Asking to be taken out of the collection that holds it. It is deliberately
   * not mutable: the family emits a request carrying a reason, and the
   * consumer's own collection decides. A component that removed itself would
   * render nothing while the consumer's array still held the item, which is
   * the desync `docs/state-and-events.md` exists to prevent.
   */
  'removable',
  /**
   * Putting a value the component displays onto the clipboard. It is
   * deliberately not mutable: the clipboard belongs to the platform and the
   * family holds none of it, so there is no controlled value and nothing to
   * cancel — the component writes, then reports what happened with a reason.
   *
   * `description-list` found the vocabulary had no word for it. Section 10 of
   * `docs/component-features.md` asks that a long value be reachable by copying
   * rather than truncated, and `code-block` in wave 7 asks for the same control
   * over a different kind of value.
   */
  'copyable',
  'virtualization',
  'files',
  'checked',
  /**
   * The text a control holds. It is the most common mutable value a component
   * library ships and the vocabulary had no word for it, which is how the
   * deleted `input` family came to declare five capabilities, none of them
   * mutable, and no state model for the one thing the control does.
   */
  'value',
  /** A hidden value shown in the clear, which is a password field's own bit. */
  'revealed',
  /**
   * The errors a form holds, keyed by the name of the control each one is
   * about. It is mutable and a consumer can own it: a server sends the map
   * back, and the family also builds one from `checkValidity()`.
   *
   * `invalid` is the state one control is in; this is the set of reasons a
   * whole form is in it. Calling it `value` would have named it for something
   * it is not, and `form` was the family that found the vocabulary had no word
   * for what it holds.
   */
  'validity',
];

/** Capabilities that hold state a consumer can own, and therefore need a model. */
export const MUTABLE_CAPABILITIES = [
  'open',
  'checked',
  'pressed',
  'selection',
  'activation',
  'files',
  'current',
  'value',
  'revealed',
  'validity',
];

export function strongestState(states) {
  return STATE_PRECEDENCE.find((state) => states.includes(state));
}

function assertUnique(values, label) {
  const duplicates = [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
  assert.deepEqual(duplicates, [], `${label} repeats ${duplicates.join(', ')}`);
}

function assertStateModel(contract, capabilities) {
  const model = contract.stateModel ?? {};

  for (const capability of MUTABLE_CAPABILITIES) {
    if (!capabilities.has(capability)) continue;
    const entry = model[capability];
    assert.ok(entry, `${capability} holds state and declares no model`);

    for (const field of ['controlled', 'uncontrolled', 'request', 'reasons']) {
      assert.ok(field in entry, `${capability} state model is missing ${field}`);
    }
    assert.ok(Array.isArray(entry.reasons) && entry.reasons.length > 0, `${capability} reasons`);
    assertUnique(entry.reasons, `${capability} reasons`);
    for (const reason of entry.reasons) {
      assert.ok(CHANGE_REASONS.includes(reason), `${capability} unknown reason ${reason}`);
    }
  }

  for (const capability of Object.keys(model)) {
    assert.ok(
      MUTABLE_CAPABILITIES.includes(capability) && capabilities.has(capability),
      `${capability} declares a state model and holds no state`,
    );
  }
}

export function assertContractShape(contract) {
  assert.ok(
    typeof contract.family === 'string' && contract.family.length > 0,
    'family must be a non-empty string',
  );

  const legacy = LEGACY_FAMILIES.includes(contract.family);
  assert.equal(
    contract.schemaVersion,
    legacy ? LEGACY_SCHEMA_VERSION : SCHEMA_VERSION,
    legacy
      ? `${contract.family} is listed as legacy, so it stays on schema ${LEGACY_SCHEMA_VERSION} until it is rebuilt`
      : `${contract.family} is not listed as legacy, so it must satisfy schema ${SCHEMA_VERSION}`,
  );

  const memberNames = Object.keys(contract.members ?? {});
  assert.ok(memberNames.length > 0, 'contract declares no members');

  const declaredStates = new Set();
  const declaredCapabilities = new Set();
  for (const [name, member] of Object.entries(contract.members)) {
    for (const field of ['nativeElement', 'defaults', 'capabilities', 'states', 'parts']) {
      assert.ok(field in member, `${name} is missing ${field}`);
    }
    assertUnique(member.capabilities, `${name} capabilities`);
    assertUnique(member.states, `${name} states`);
    assertUnique(member.parts, `${name} parts`);

    for (const capability of member.capabilities) {
      assert.ok(
        KNOWN_CAPABILITIES.includes(capability),
        `${name} unknown capability ${capability}`,
      );
      declaredCapabilities.add(capability);
    }
    for (const state of member.states) {
      assert.ok(
        PSEUDO_STATES.includes(state) || ATTRIBUTE_STATES.includes(state),
        `${name} unknown state ${state}`,
      );
      declaredStates.add(state);
    }

    if (!legacy) {
      assert.ok(member.parts.includes('root'), `${name} declares no root part`);
    }
  }

  const stateAttributes = contract.stateAttributes ?? {};
  for (const state of declaredStates) {
    if (PSEUDO_STATES.includes(state)) {
      assert.ok(!(state in stateAttributes), `${state} must not declare an attribute`);
      continue;
    }
    assert.ok(state in stateAttributes, `${state} needs a declared attribute`);
  }
  for (const [state, attribute] of Object.entries(stateAttributes)) {
    assert.equal(attribute, STATE_ATTRIBUTES[state], `${state} disagrees with the vocabulary`);
    assert.ok(declaredStates.has(state), `${state} is declared but no member uses it`);
  }

  for (const [page, ids] of Object.entries(contract.scenarios ?? {})) {
    assert.ok(page === 'overview' || memberNames.includes(page), `scenario page ${page}`);
    assertUnique(ids, `scenario page ${page}`);
    assert.ok(ids.length > 0, `scenario page ${page} is empty`);
  }

  if (legacy) return;

  assert.equal(
    contract.ui,
    contract.family,
    'the root part carries data-ui, and its value is the family name',
  );
  assertStateModel(contract, declaredCapabilities);
}
