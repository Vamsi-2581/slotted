#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { contract } from '../src/contract.mjs';
import { renderThemeCss } from '../src/render-theme.mjs';
import { assertValidTheme } from '../src/validate-theme.mjs';

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('usage: slotted-build-theme <values.json> <output.css>');
  process.exit(2);
}
const theme = JSON.parse(await readFile(resolve(input), 'utf8'));

assertValidTheme(contract, theme);
await mkdir(dirname(resolve(output)), { recursive: true });
await writeFile(resolve(output), renderThemeCss(contract, theme));
