import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { contract } from '@slotted/tokens/contract';

/**
 * What this theme chose, as opposed to what every theme must meet. The rules
 * live in `@slotted/tokens/theme-conformance`; the values below are the
 * default theme's identity, and another theme is free to disagree with all of
 * them.
 */
const theme = JSON.parse(await readFile(new URL('../src/theme.json', import.meta.url), 'utf8'));

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

function pick(values, tokenNames) {
  return Object.fromEntries(tokenNames.map((name) => [name, values[name]]));
}

function names(axis) {
  return contract.tokens.filter((token) => token.axis === axis).map((token) => token.name);
}

test('is the theme the library ships by default', () => {
  assert.equal(theme.name, 'default');
});

test('states the exact reduced-motion collapse it published', () => {
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

test('keeps the corner of a control at the small step', () => {
  assert.equal(theme.base['--slotted-control-radius'], 'var(--slotted-radius-sm)');
});

test('danger remains a strong surface with white text', () => {
  for (const values of Object.values(theme.schemes)) {
    assert.equal(values['--slotted-tone-danger-on-solid'], '#ffffff');
  }
});

test('accent and success remain strong surfaces with white text', () => {
  for (const values of Object.values(theme.schemes)) {
    assert.equal(values['--slotted-tone-accent-on-solid'], '#ffffff');
    assert.equal(values['--slotted-tone-success-on-solid'], '#ffffff');
  }
});

test('secondary remains a neutral surface rather than an inverted foreground', () => {
  assert.deepEqual(
    {
      active: theme.schemes.light['--slotted-tone-secondary-solid-active'],
      default: theme.schemes.light['--slotted-tone-secondary-solid'],
      hover: theme.schemes.light['--slotted-tone-secondary-solid-hover'],
      text: theme.schemes.light['--slotted-tone-secondary-on-solid'],
    },
    { active: '#b8c3d1', default: '#e2e8f0', hover: '#cbd5e1', text: '#172033' },
  );
  assert.deepEqual(
    {
      active: theme.schemes.dark['--slotted-tone-secondary-solid-active'],
      default: theme.schemes.dark['--slotted-tone-secondary-solid'],
      hover: theme.schemes.dark['--slotted-tone-secondary-solid-hover'],
      text: theme.schemes.dark['--slotted-tone-secondary-on-solid'],
    },
    { active: '#18181b', default: '#27272a', hover: '#3f3f46', text: '#fafafa' },
  );
});
