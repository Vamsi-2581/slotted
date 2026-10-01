import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { OUTPUTS } from '../scripts/generate-sources.mjs';

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
