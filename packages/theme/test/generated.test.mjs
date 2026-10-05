import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { OUTPUTS, writtenAttributes } from '../scripts/generate-sources.mjs';

for (const [path, source] of Object.entries(OUTPUTS)) {
  test(`${path} is current`, () => {
    assert.equal(
      readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'),
      source(),
      `run: pnpm --filter @slotted/theme generate`,
    );
  });
}

test("the hook index lists each family's parts and data attributes", () => {
  const hooks = JSON.parse(
    readFileSync(new URL('../src/generated/hooks.json', import.meta.url), 'utf8'),
  );
  assert.ok(hooks.ui.button.includes('label'), 'button has a label part');
  assert.ok(hooks.attributes.includes('data-variant'));
});

test('every attribute in the hook index is written to the DOM by a family, as the family writes it', () => {
  const hooks = JSON.parse(
    readFileSync(new URL('../src/generated/hooks.json', import.meta.url), 'utf8'),
  );
  const written = writtenAttributes();
  const malformed = hooks.attributes.filter(
    (attribute) => !/^data-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(attribute),
  );
  assert.deepEqual(malformed, [], 'an HTML attribute name a family writes is kebab-case data-*');
  const unwritten = hooks.attributes.filter((attribute) => !written.has(attribute));
  assert.deepEqual(unwritten, [], 'no family binding or core module writes these');
  // `togglePlacement` is an axis of collapsible's contract, written as `data-toggle-placement`;
  // `addOnPaste` is an option of tags-input that no family reflects to the DOM.
  assert.ok(hooks.attributes.includes('data-toggle-placement'));
  assert.ok(!hooks.attributes.includes('data-add-on-paste'));
});
