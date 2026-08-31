import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CHANGE_REASONS,
  LEGACY_FAMILIES,
  STATE_ATTRIBUTES,
  STATE_PRECEDENCE,
  assertContractShape,
  strongestState,
} from './contract.schema.mjs';

const valid = {
  schemaVersion: 5,
  family: 'example',
  ui: 'example',
  stateAttributes: { disabled: 'data-disabled' },
  members: {
    example: {
      nativeElement: 'div',
      defaults: {},
      capabilities: ['disabled'],
      states: ['default', 'disabled'],
      parts: ['root'],
    },
  },
  scenarios: { example: ['playground'] },
};

test('accepts a contract without appearance axes', () => {
  assert.doesNotThrow(() => assertContractShape(valid));
});

test('rejects an attribute-driven state with no declared attribute', () => {
  const contract = structuredClone(valid);
  contract.members.example.states.push('invalid');
  assert.throws(() => assertContractShape(contract), /invalid/);
});

test('rejects a pseudo-class state given an attribute', () => {
  const contract = structuredClone(valid);
  contract.stateAttributes.hover = 'data-hover';
  assert.throws(() => assertContractShape(contract), /hover/);
});

test('rejects a state attribute that disagrees with the shared vocabulary', () => {
  const contract = structuredClone(valid);
  contract.stateAttributes.disabled = 'data-off';
  assert.throws(() => assertContractShape(contract), /disabled/);
});

test('rejects a scenario page that names no member', () => {
  const contract = structuredClone(valid);
  contract.scenarios.ghost = ['playground'];
  assert.throws(() => assertContractShape(contract), /ghost/);
});

test('rejects duplicate scenario ids within a page', () => {
  const contract = structuredClone(valid);
  contract.scenarios.example = ['playground', 'playground'];
  assert.throws(() => assertContractShape(contract), /playground/);
});

test('carries the states Field introduces', () => {
  assert.equal(STATE_ATTRIBUTES.invalid, 'data-invalid');
  assert.equal(STATE_ATTRIBUTES.required, 'data-required');
  assert.equal(STATE_ATTRIBUTES.readonly, 'data-readonly');
});

test('carries the disclosure states an overlay introduces', () => {
  assert.equal(STATE_ATTRIBUTES.open, 'data-open');
  assert.equal(STATE_ATTRIBUTES.expanded, 'data-expanded');
});

/* ------------------------------------------------------------- identity - */

test('rejects a family that does not name its public identifier', () => {
  const contract = structuredClone(valid);
  delete contract.ui;
  assert.throws(() => assertContractShape(contract), /data-ui/);
});

test('rejects an identifier that disagrees with the family name', () => {
  const contract = structuredClone(valid);
  contract.ui = 'sample';
  assert.throws(() => assertContractShape(contract), /data-ui/);
});

test('rejects a member without a root part', () => {
  const contract = structuredClone(valid);
  contract.members.example.parts = ['thumb'];
  assert.throws(() => assertContractShape(contract), /root part/);
});

/* ---------------------------------------------------------- state model - */

function withOpenState(model) {
  const contract = structuredClone(valid);
  contract.members.example.capabilities.push('open');
  contract.members.example.states.push('open');
  contract.stateAttributes.open = 'data-open';
  if (model !== undefined) contract.stateModel = { open: model };
  return contract;
}

const openModel = {
  controlled: 'open',
  uncontrolled: 'defaultOpen',
  request: 'onOpenChange',
  reasons: ['pointer', 'keyboard', 'escape', 'outsidePress'],
};

test('accepts a mutable capability that declares its state model', () => {
  assert.doesNotThrow(() => assertContractShape(withOpenState(openModel)));
});

test('rejects a mutable capability with no state model', () => {
  assert.throws(() => assertContractShape(withOpenState()), /open holds state/);
});

test('rejects a state model that omits the uncontrolled entry point', () => {
  const model = structuredClone(openModel);
  delete model.uncontrolled;
  assert.throws(() => assertContractShape(withOpenState(model)), /uncontrolled/);
});

test('rejects a change reason outside the shared vocabulary', () => {
  const model = structuredClone(openModel);
  model.reasons = ['pointer', 'telepathy'];
  assert.throws(() => assertContractShape(withOpenState(model)), /telepathy/);
});

test('rejects a state model for a capability the family does not hold', () => {
  const contract = structuredClone(valid);
  contract.stateModel = { checked: openModel };
  assert.throws(() => assertContractShape(contract), /checked/);
});

test('names every reason a request can carry', () => {
  assert.deepEqual(CHANGE_REASONS.includes('programmatic'), true);
  assert.equal(new Set(CHANGE_REASONS).size, CHANGE_REASONS.length);
});

/* ----------------------------------------------------------- precedence - */

test('resolves simultaneous states in one declared order', () => {
  assert.equal(strongestState(['hover', 'disabled']), 'disabled');
  assert.equal(strongestState(['focus-visible', 'hover']), 'hover');
  assert.equal(strongestState(['default']), 'default');
});

test('orders every state the vocabulary can paint', () => {
  assert.equal(new Set(STATE_PRECEDENCE).size, STATE_PRECEDENCE.length);
  assert.equal(STATE_PRECEDENCE.at(0), 'disabled');
  assert.equal(STATE_PRECEDENCE.at(-1), 'default');
});

/* --------------------------------------------------------------- legacy - */

test('holds a listed family to the schema it was built against', () => {
  const family = LEGACY_FAMILIES.at(0);
  const contract = { ...structuredClone(valid), family, ui: family };
  assert.throws(() => assertContractShape(contract), /legacy/);
});
