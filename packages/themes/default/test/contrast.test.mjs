import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const theme = JSON.parse(readFileSync(new URL('../src/theme.json', import.meta.url), 'utf8'));
const variants = ['accent', 'secondary', 'success', 'warning', 'danger'];
const solidStates = ['solid', 'solid-hover', 'solid-active'];

function channel(value) {
  const normalized = value / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  assert.ok(match, `Expected a literal six-digit hex color, received ${hex}`);
  const [, red = '00', green = '00', blue = '00'] = match;
  return (
    0.2126 * channel(Number.parseInt(red, 16)) +
    0.7152 * channel(Number.parseInt(green, 16)) +
    0.0722 * channel(Number.parseInt(blue, 16))
  );
}

function contrast(first, second) {
  const high = Math.max(luminance(first), luminance(second));
  const low = Math.min(luminance(first), luminance(second));
  return (high + 0.05) / (low + 0.05);
}

for (const [scheme, values] of Object.entries(theme.schemes)) {
  test(`${scheme} solid variants meet text contrast`, () => {
    for (const variant of variants) {
      const foreground = values[`--slotted-tone-${variant}-on-solid`];
      for (const state of solidStates) {
        const background = values[`--slotted-tone-${variant}-${state}`];
        assert.ok(
          contrast(background, foreground) >= 4.5,
          `${scheme}.${variant}.${state} has insufficient contrast`,
        );
      }
    }
  });
}

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

test('button radii decrease gently as control size increases', () => {
  assert.deepEqual(
    ['sm', 'md', 'lg'].map((size) => theme.base[`--slotted-button-radius-${size}`]),
    ['7px', '6px', '5px'],
  );
});

/**
 * A scheme named for contrast has to earn the name. `high-contrast` is held to
 * the AAA ratio for body text rather than the AA ratio the other schemes meet,
 * and its borders are held to the non-text ratio, because a border is what
 * separates two surfaces that no longer differ in fill.
 */
const TEXT_RATIO = { light: 4.5, dark: 4.5, 'high-contrast': 7 };
const NON_TEXT_RATIO = 3;

const surfaces = ['--slotted-surface', '--slotted-surface-raised', '--slotted-surface-sunken'];

for (const [scheme, values] of Object.entries(theme.schemes)) {
  const required = TEXT_RATIO[scheme];

  test(`${scheme} text reads on every surface`, () => {
    for (const surface of surfaces) {
      for (const text of ['--slotted-text', '--slotted-text-muted']) {
        assert.ok(
          contrast(values[surface], values[text]) >= required,
          `${scheme} ${text} on ${surface} is below ${required}:1`,
        );
      }
    }
  });

  test(`${scheme} inverts a surface without losing its text`, () => {
    assert.ok(
      contrast(values['--slotted-surface-inverse'], values['--slotted-text-inverse']) >= required,
      `${scheme} inverse text is below ${required}:1`,
    );
  });

  test(`${scheme} separates surfaces with a visible border`, () => {
    assert.ok(
      contrast(values['--slotted-surface'], values['--slotted-border-strong']) >= NON_TEXT_RATIO,
      `${scheme} strong border is below ${NON_TEXT_RATIO}:1`,
    );
    assert.ok(
      contrast(values['--slotted-surface'], values['--slotted-focus-ring-color']) >= NON_TEXT_RATIO,
      `${scheme} focus ring is below ${NON_TEXT_RATIO}:1`,
    );
  });

  test(`${scheme} solid variants meet the ratio the scheme promises`, () => {
    for (const variant of variants) {
      const foreground = values[`--slotted-tone-${variant}-on-solid`];
      for (const state of solidStates) {
        assert.ok(
          contrast(values[`--slotted-tone-${variant}-${state}`], foreground) >= required,
          `${scheme}.${variant}.${state} is below ${required}:1`,
        );
      }
    }
  });

  test(`${scheme} keeps disabled text legible`, () => {
    assert.ok(
      contrast(values['--slotted-disabled-background'], values['--slotted-disabled-foreground']) >=
        NON_TEXT_RATIO,
      `${scheme} disabled text is below ${NON_TEXT_RATIO}:1`,
    );
  });
}
