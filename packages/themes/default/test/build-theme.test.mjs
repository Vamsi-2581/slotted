import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { renderThemeCss } from '../scripts/build-theme.mjs';

const contract = JSON.parse(
  await readFile(new URL('../../../tokens/src/contract.json', import.meta.url), 'utf8'),
);
const theme = JSON.parse(await readFile(new URL('../src/theme.json', import.meta.url), 'utf8'));

const REDUCED_MOTION_TOKENS = [
  '--slotted-duration-instant',
  '--slotted-duration-short',
  '--slotted-duration-medium',
  '--slotted-duration-long',
];
const REDUCED_MOTION_VALUES = {
  '--slotted-duration-instant': '1ms',
  '--slotted-duration-short': '1ms',
  '--slotted-duration-medium': '1ms',
  '--slotted-duration-long': '1ms',
};

function expectedReducedMotionBlock(themeName) {
  const declarations = REDUCED_MOTION_TOKENS.map((name) => `      ${name}: 1ms;`).join('\n');
  return (
    `  @media (prefers-reduced-motion: reduce) {\n` +
    `    [data-slotted-theme="${themeName}"] {\n` +
    `${declarations}\n` +
    `    }\n` +
    `  }`
  );
}

test('renders independent theme, scheme, and density scopes', () => {
  const css = renderThemeCss(
    { base: ['--base'], scheme: ['--scheme'], density: ['--density'], reducedMotion: [] },
    {
      name: 'test',
      base: { '--base': '1px' },
      schemes: { light: { '--scheme': '#fff' } },
      densities: { compact: { '--density': '2rem' } },
      reducedMotion: {},
    },
  );

  assert.match(css, /data-slotted-theme="test"/);
  assert.match(css, /data-slotted-scheme="light"/);
  assert.match(css, /data-slotted-density="compact"/);
  assert.match(css, /--scheme: #fff/);
});

test('defines the exact reduced-motion duration tokens and non-zero collapsed values', () => {
  assert.deepEqual(contract.reducedMotion, REDUCED_MOTION_TOKENS);
  assert.deepEqual(theme.reducedMotion, REDUCED_MOTION_VALUES);
});

test('collapses every duration under the default theme selector', () => {
  const css = renderThemeCss(contract, theme);
  const queryStart = css.indexOf('@media (prefers-reduced-motion: reduce)');

  assert.notEqual(queryStart, -1, 'The theme emits no reduced-motion block');
  assert.equal(
    css.slice(queryStart - 2, queryStart - 2 + expectedReducedMotionBlock(theme.name).length),
    expectedReducedMotionBlock(theme.name),
  );
});

test('emits the reduced-motion block after the block it overrides', () => {
  const css = renderThemeCss(contract, theme);
  assert.ok(
    css.indexOf('@media (prefers-reduced-motion: reduce)') >
      css.indexOf('--slotted-duration-short'),
    'A media query adds no specificity, so source order is what makes the override win',
  );
});

test('emits the reduced-motion block as the final theme content', () => {
  const css = renderThemeCss(contract, theme);
  const queryStart = css.indexOf('@media (prefers-reduced-motion: reduce)');

  assert.notEqual(queryStart, -1, 'The theme emits no reduced-motion block');
  assert.equal(
    css.slice(queryStart),
    `${expectedReducedMotionBlock(theme.name).slice(2)}\n}\n`,
    'No later theme block may override reduced motion',
  );
});
