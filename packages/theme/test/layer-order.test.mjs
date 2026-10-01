import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { LAYER_ORDER_STATEMENT } from '../src/layer-order.mjs';

test('the published order names every layer the library writes into', () => {
  assert.equal(
    LAYER_ORDER_STATEMENT,
    '@layer slotted.reset, slotted.tokens, slotted.theme, slotted.components;\n',
  );
});

test('the statement opens the token stylesheet', async () => {
  const css = await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8');
  assert.ok(css.startsWith(LAYER_ORDER_STATEMENT));
});
