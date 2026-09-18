import { readFile } from 'node:fs/promises';

import { contract } from '@slotted/tokens/contract';
import { themeConformance } from '@slotted/tokens/theme-conformance';

const theme = JSON.parse(await readFile(new URL('../src/theme.json', import.meta.url), 'utf8'));

themeConformance({
  contract,
  theme,
  distUrl: new URL('../dist/styles.css', import.meta.url),
});
