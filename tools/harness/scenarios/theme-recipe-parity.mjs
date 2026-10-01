import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import defaultTheme from '../../../packages/themes/src/default/theme.mjs';
import {
  deltaE,
  evaluateRecipe,
  parseSeed,
  renderTheme,
  SCHEMES,
  SEED_NAMES,
  seedGrid,
} from '../../../packages/theme/dist/index.js';
import { launch } from '../shoot.mjs';

/**
 * The recipe is computed twice: by the browser, from the CSS `renderTheme`
 * writes, and by `evaluateRecipe`, which tests, the calibration and the theme
 * panel rely on. They have to agree, or a contrast the tests prove is not the
 * contrast a reader sees.
 *
 * Every 47th seed of the grid: 47 is coprime with the grid's 16 lightness
 * steps, so the 66 samples cover every lightness, every chroma and every hue,
 * 9 of them achromatic with a hue other than 0 in most. Each sample is put in
 * place of each of the five seeds in turn, in each of the three schemes: 990
 * scopes. Every colour token of the recipe is read through a probe's `color`,
 * whose computed value keeps OKLCH unclipped.
 *
 * Run: node tools/harness/scenarios/theme-recipe-parity.mjs
 * Exits non-zero when an assertion fails.
 */

const TOLERANCE = 0.005;
const samples = seedGrid().filter((_seed, index) => index % 47 === 0);
const spread = {
  lightnesses: new Set(samples.map((seed) => seed.l.toFixed(2))).size,
  chromas: new Set(samples.map((seed) => seed.c)).size,
  hues: new Set(samples.map((seed) => seed.h)).size,
  achromatic: samples.filter((seed) => seed.c === 0).length,
};
assert.deepEqual(
  { ...spread, achromatic: spread.achromatic > 0 },
  { lightnesses: 16, chromas: 8, hues: 24, achromatic: true },
  'the samples cover every lightness, chroma and hue of the grid, achromatic seeds included',
);
const tokens = Object.keys(defaultTheme.recipe.light);
const seeds = Object.fromEntries(
  SEED_NAMES.map((name) => [name, parseSeed(defaultTheme.seeds[name])]),
);
const css = (seed) => `oklch(${seed.l} ${seed.c} ${seed.h})`;

const cases = [];
for (const scheme of SCHEMES) {
  for (const name of SEED_NAMES) {
    for (const sample of samples) cases.push({ scheme, name, sample });
  }
}

const scopes = cases
  .map(
    ({ scheme, name, sample }, index) =>
      `<div data-case="${index}" data-slotted-theme="default" data-slotted-scheme="${scheme}" style="--slotted-seed-${name}: ${css(sample)}"><i></i></div>`,
  )
  .join('\n');
const page = `<!doctype html><html><head><style>${renderTheme(defaultTheme)}</style></head><body>${scopes}</body></html>`;

const out = new URL('../out/theme-recipe-parity.html', import.meta.url);
await mkdir(new URL('.', out), { recursive: true });
await writeFile(out, page);

const READ = `[...document.querySelectorAll('[data-case]')].map((scope) => {
  const probe = scope.querySelector('i');
  return ${JSON.stringify(tokens)}.map((token) => {
    probe.style.color = 'var(' + token + ')';
    return getComputedStyle(probe).color;
  });
})`;

const { devtools, close } = await launch();
let readings;
try {
  await devtools.send('Page.enable');
  await devtools.send('Runtime.enable');
  const loaded = devtools.once('Page.loadEventFired');
  await devtools.send('Page.navigate', { url: pathToFileURL(out.pathname).href });
  await loaded;
  const { result, exceptionDetails } = await devtools.send('Runtime.evaluate', {
    expression: READ,
    returnByValue: true,
  });
  if (exceptionDetails)
    throw new Error(exceptionDetails.exception?.description ?? 'the read failed');
  readings = result.value;
} finally {
  devtools.close();
  await close();
}

function parseComputed(text) {
  const match = /^oklch\(([\d.e-]+|none) ([\d.e-]+|none) ([\d.e-]+|none)/.exec(text);
  assert.ok(match, `the browser wrote ${text}, not oklch()`);
  const number = (value) => (value === 'none' ? 0 : Number(value));
  return { l: number(match[1]), c: number(match[2]), h: number(match[3]) };
}

const failures = [];
cases.forEach(({ scheme, name, sample }, index) => {
  const expected = evaluateRecipe(defaultTheme.recipe, { ...seeds, [name]: sample }, scheme);
  tokens.forEach((token, column) => {
    const distance = deltaE(parseComputed(readings[index][column]), expected[token]);
    if (distance >= TOLERANCE) {
      failures.push(
        `${scheme} ${name}=${css(sample)} ${token}: ${readings[index][column]} is ${distance.toFixed(4)} from the evaluator`,
      );
    }
  });
});

assert.deepEqual(failures.slice(0, 20), [], `${failures.length} tokens disagree`);
console.log(
  `ok — ${cases.length} scopes × ${tokens.length} tokens agree within ${TOLERANCE} ` +
    `(${samples.length} seeds: ${spread.lightnesses} lightnesses, ${spread.chromas} chromas, ` +
    `${spread.hues} hues, ${spread.achromatic} achromatic)`,
);
