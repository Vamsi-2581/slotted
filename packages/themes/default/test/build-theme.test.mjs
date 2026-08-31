import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { LAYER_ORDER_STATEMENT } from '@slotted/tokens/layer-order';

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
const SHADOW_TOKENS = [
  '--slotted-shadow-xs',
  '--slotted-shadow-sm',
  '--slotted-shadow-md',
  '--slotted-shadow-lg',
];
const SHADOW_VALUES = {
  light: {
    '--slotted-shadow-xs': '0 1px 2px rgb(15 23 42 / 0.06)',
    '--slotted-shadow-sm': '0 1px 3px rgb(15 23 42 / 0.10), 0 1px 2px rgb(15 23 42 / 0.06)',
    '--slotted-shadow-md': '0 4px 12px rgb(15 23 42 / 0.10)',
    '--slotted-shadow-lg': '0 12px 32px rgb(15 23 42 / 0.14)',
  },
  dark: {
    '--slotted-shadow-xs': '0 1px 2px rgb(0 0 0 / 0.40)',
    '--slotted-shadow-sm': '0 1px 3px rgb(0 0 0 / 0.50), 0 1px 2px rgb(0 0 0 / 0.40)',
    '--slotted-shadow-md': '0 4px 12px rgb(0 0 0 / 0.55)',
    '--slotted-shadow-lg': '0 12px 32px rgb(0 0 0 / 0.65)',
  },
};
const Z_INDEX_TOKENS = [
  '--slotted-z-index-sticky',
  '--slotted-z-index-overlay',
  '--slotted-z-index-popover',
  '--slotted-z-index-toast',
];
const Z_INDEX_VALUES = {
  '--slotted-z-index-sticky': '100',
  '--slotted-z-index-overlay': '1000',
  '--slotted-z-index-popover': '1100',
  '--slotted-z-index-toast': '1200',
};

function pick(values, names) {
  return Object.fromEntries(names.map((name) => [name, values[name]]));
}

function names(axis) {
  return contract.tokens.filter((token) => token.axis === axis).map((token) => token.name);
}

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
    {
      layers: ['primitive', 'semantic', 'component'],
      axes: ['base', 'scheme', 'density'],
      tokens: [
        { name: '--base', layer: 'primitive', axis: 'base', type: 'length', root: true },
        {
          name: '--scheme',
          layer: 'semantic',
          axis: 'scheme',
          type: 'color',
          root: true,
          forcedColor: 'Canvas',
        },
        { name: '--density', layer: 'semantic', axis: 'density', type: 'length', root: true },
      ],
    },
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
  assert.deepEqual(
    contract.tokens.filter((token) => token.reducedMotion).map((token) => token.name),
    REDUCED_MOTION_TOKENS,
  );
  assert.deepEqual(theme.reducedMotion, REDUCED_MOTION_VALUES);
});

test('locks the exact shadow and stacking scales', () => {
  assert.deepEqual(
    names('scheme').filter((token) => token.startsWith('--slotted-shadow-')),
    SHADOW_TOKENS,
  );
  assert.deepEqual(
    names('base').filter((token) => token.startsWith('--slotted-z-index-')),
    Z_INDEX_TOKENS,
  );
  assert.deepEqual(pick(theme.schemes.light, SHADOW_TOKENS), SHADOW_VALUES.light);
  assert.deepEqual(pick(theme.schemes.dark, SHADOW_TOKENS), SHADOW_VALUES.dark);
  assert.deepEqual(pick(theme.base, Z_INDEX_TOKENS), Z_INDEX_VALUES);
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

test('grows every control to the comfortable target under a coarse pointer', () => {
  const css = renderThemeCss(contract, theme);
  const query = css.slice(css.indexOf('@media (pointer: coarse)'));

  for (const density of contract.requiredDensities) {
    assert.match(query, new RegExp(`data-slotted-density="${density}"`));
  }
  assert.match(
    query,
    /--slotted-control-height-md: max\([^)]+, var\(--slotted-target-comfortable\)\)/,
  );
  assert.ok(
    css.indexOf('@media (pointer: coarse)') > css.lastIndexOf('--slotted-control-height-md: 2'),
    'The coarse-pointer block must follow the density block it overrides',
  );
});

test('maps every scheme token to a system colour under forced colours', () => {
  const css = renderThemeCss(contract, theme);
  const query = css.slice(
    css.indexOf('@media (forced-colors: active)'),
    css.indexOf('@media (prefers-reduced-motion: reduce)'),
  );

  for (const name of names('scheme')) {
    assert.match(query, new RegExp(`${name}: [A-Za-z]+;`), `${name} is unmapped`);
  }
  for (const scheme of contract.requiredSchemes) {
    assert.match(
      query,
      new RegExp(`\\[data-slotted-scheme="${scheme}"\\]`),
      `forced colours must carry the specificity of the ${scheme} block`,
    );
  }
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

test('opens the stylesheet with the published layer order', () => {
  assert.ok(renderThemeCss(contract, theme).startsWith(LAYER_ORDER_STATEMENT));
});

test('opens the built stylesheet with the published layer order', async () => {
  const css = await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8');
  assert.ok(css.startsWith(LAYER_ORDER_STATEMENT));
});
