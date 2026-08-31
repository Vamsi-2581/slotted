import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * Schema 5 adds the two facts schema 4 left to each family to invent: the
 * public identifier a consumer selects the family by, and the state model —
 * controlled, uncontrolled, and the reason a change carries. A family still on
 * schema 4 is listed in `legacy-families.json` and is awaiting the rebuild
 * ordered in `docs/rebuild-order.md`; that list only shrinks.
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
  open: 'data-open',
  expanded: 'data-expanded',
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
  'active',
  'hover',
  'focus-visible',
  'default',
];

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
  'size',
  'shape',
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
  'virtualization',
  'files',
  'checked',
];

/** Capabilities that hold state a consumer can own, and therefore need a model. */
export const MUTABLE_CAPABILITIES = [
  'open',
  'checked',
  'pressed',
  'selection',
  'activation',
  'measurement',
  'files',
  'current',
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
