import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { assertContractShape } from '../../contract.schema.mjs';

const contract = JSON.parse(await readFile(new URL('./contract.json', import.meta.url), 'utf8'));
const dialog = JSON.parse(
  await readFile(new URL('../dialog/contract.json', import.meta.url), 'utf8'),
);
const member = contract.members.fullscreen;

test('satisfies the shared contract schema', () => {
  assertContractShape(contract);
});

test('names the identifier a consumer selects the family by', () => {
  assert.equal(contract.family, 'fullscreen');
  assert.equal(contract.ui, 'fullscreen');
  assert.equal(contract.engine, '@slotted/core/fullscreen');
});

/**
 * The region and its control carry one identifier. The control may stand
 * outside the region — a toolbar above a chart — so it is selected by its own
 * `data-ui` and `data-part`, never as a descendant of the root.
 */
test('is a region and a control, each carrying the identifier', () => {
  assert.equal(member.nativeElement, 'div');
  assert.deepEqual(member.parts, ['root', 'trigger', 'icon', 'label']);
  assert.match(contract.identity.trigger, /outside the region/);
});

/**
 * One model for one transition, with the names `dialog` already declares for
 * the same capability, plus `escape`: the reader leaves a full screen the
 * application did not close, by the key or by the agent's own interface.
 */
test('shares the fullscreen model with dialog and adds the exit it did not ask for', () => {
  const model = contract.stateModel.fullscreen;
  for (const field of ['controlled', 'uncontrolled', 'request']) {
    assert.equal(model[field], dialog.stateModel.fullscreen[field]);
  }
  assert.deepEqual(model.reasons, ['pointer', 'keyboard', 'escape', 'programmatic']);
  assert.equal(contract.escape.reason, 'escape');
});

/**
 * The scope's hardest line: never block the browser's Escape. Native mode
 * writes no listener at all, and the keyboard entry says the agent leaves.
 */
test('never listens to Escape in native mode', () => {
  assert.match(contract.escape.native, /never listened to/);
  const escape = contract.keyboard.find((entry) => entry.key === 'Escape');
  assert.ok(escape, 'Escape is in the keyboard matrix');
  assert.match(escape.effect, /in native, the agent leaves/);
});

test('answers the API absent or refused with the in-layout fallback', () => {
  assert.deepEqual(contract.axes.mode, ['auto', 'layout']);
  assert.deepEqual(contract.resolution.mode, ['prop', 'defaults', 'auto']);
  assert.deepEqual(Object.keys(contract.errors), ['unsupported', 'refused']);
  assert.match(contract.modes.auto, /state stays true/);
});

/**
 * The Button pattern forbids `aria-pressed` on a toggle whose label changes,
 * and this label does: the family is the one that says "Exit full screen".
 */
test('changes label and icon with the state and never writes aria-pressed', () => {
  assert.match(contract.wiring['aria-pressed'], /^never/);
  assert.deepEqual(contract.messages, ['enter', 'exit', 'entered', 'exited']);
  assert.equal(contract.icon.enter, '--slotted-icon-maximize');
  assert.equal(contract.icon.exit, '--slotted-icon-minimize');
  assert.ok(member.states.includes('fullscreen'));
});

test('restores the context it took', () => {
  assert.deepEqual(contract.restores, ['focus', 'page scroll', 'root scroll']);
});

test('sets its defaults once through one provider', () => {
  assert.deepEqual(contract.provides.fullscreenDefaults, [
    'mode',
    'navigationUI',
    'size',
    'variant',
    'messages',
  ]);
  for (const key of contract.provides.fullscreenDefaults) {
    assert.ok(key in contract.resolution, `${key} resolves`);
  }
});
