import { readFile, writeFile } from 'node:fs/promises';

import { LAYER_ORDER_STATEMENT } from '@slotted/tokens/layer-order';

/**
 * Vite emits the bundled stylesheet without the order statement, and a React
 * application that imports it alone would leave the order to whatever CSS
 * loaded first. Prepending here keeps every distributed entry self-sufficient.
 */
const stylesheetUrl = new URL('dist/styles.css', import.meta.url);
const css = await readFile(stylesheetUrl, 'utf8');

if (!css.startsWith(LAYER_ORDER_STATEMENT)) {
  await writeFile(stylesheetUrl, `${LAYER_ORDER_STATEMENT}${css}`);
}
