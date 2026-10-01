import { readFile } from 'node:fs/promises';

import { contract } from '@slotted/theme/contract';
import { themeConformance } from '@slotted/theme/theme-conformance';

const theme = JSON.parse(
  await readFile(new URL('../src/default/values.json', import.meta.url), 'utf8'),
);

themeConformance({
  contract,
  theme,
  distUrl: new URL('../dist/default.css', import.meta.url),
});
