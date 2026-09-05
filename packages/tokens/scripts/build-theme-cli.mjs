#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import { contract } from '../src/contract.mjs';
import { renderThemeCss } from '../src/render-theme.mjs';
import { assertValidTheme } from '../src/validate-theme.mjs';

/**
 * A theme package owns a `theme.json` and nothing executable. The renderer is
 * one implementation for every theme, so a second theme cannot drift from the
 * first by copying a build script and editing it.
 *
 * The working directory is the theme package, which is where pnpm runs a
 * package script from.
 */
const root = pathToFileURL(`${process.cwd()}/`);
const theme = JSON.parse(await readFile(new URL('src/theme.json', root), 'utf8'));

assertValidTheme(contract, theme);
await mkdir(new URL('dist/', root), { recursive: true });
await writeFile(new URL('dist/styles.css', root), renderThemeCss(contract, theme));
