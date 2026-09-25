import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { contract } from '@slotted/tokens/contract';
import { contrast, TEXT_RATIO } from '@slotted/tokens/theme-conformance';
import { HOVER_SHARE, hoverOf, shareOf } from '@slotted/tokens/tone-hover';

/**
 * What this theme chose, as opposed to what every theme must meet. The rules
 * live in `@slotted/tokens/theme-conformance`; the values below are the
 * default theme's identity, and another theme is free to disagree with all of
 * them.
 */
const theme = JSON.parse(await readFile(new URL('../src/theme.json', import.meta.url), 'utf8'));

/** A colour laid over another at `alpha`, as a browser composites it. */
function over(ink, ground, alpha) {
  const channels = (hex) => [1, 3, 5].map((at) => Number.parseInt(hex.slice(at, at + 2), 16));
  const mixed = channels(ink).map(
    (value, index) => alpha * value + (1 - alpha) * channels(ground)[index],
  );
  return `#${mixed.map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`;
}

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
    '--slotted-shadow-sm': '0 1px 3px rgb(15 23 42 / 0.08), 0 1px 2px -1px rgb(15 23 42 / 0.08)',
    '--slotted-shadow-md':
      '0 4px 6px -1px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.08)',
    '--slotted-shadow-lg':
      '0 10px 15px -3px rgb(15 23 42 / 0.10), 0 4px 6px -4px rgb(15 23 42 / 0.08)',
  },
  dark: {
    '--slotted-shadow-xs': '0 1px 2px rgb(0 0 0 / 0.40)',
    '--slotted-shadow-sm': '0 1px 3px rgb(0 0 0 / 0.45), 0 1px 2px -1px rgb(0 0 0 / 0.40)',
    '--slotted-shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.50), 0 2px 4px -2px rgb(0 0 0 / 0.45)',
    '--slotted-shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.60), 0 4px 6px -4px rgb(0 0 0 / 0.50)',
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
    { active: '#b8c3d1', default: '#e2e8f0', hover: '#d0d6dd', text: '#172033' },
  );
  assert.deepEqual(
    {
      active: theme.schemes.dark['--slotted-tone-secondary-solid-active'],
      default: theme.schemes.dark['--slotted-tone-secondary-solid'],
      hover: theme.schemes.dark['--slotted-tone-secondary-solid-hover'],
      text: theme.schemes.dark['--slotted-tone-secondary-on-solid'],
    },
    { active: '#18181b', default: '#27272a', hover: '#353638', text: '#fafafa' },
  );
});

/**
 * The hover step of every filled tone is derived, not chosen: the fill moves
 * the scheme's share toward white in OKLCH — `color-mix(in oklch, <solid>,
 * white 6%)` on the light schemes, 8% on the dark one — and a fill with no
 * lighter step to take (the neutral in `light`, the white of `high-contrast`)
 * moves the same share toward black. Where the whole step would take the
 * label below the ratio the scheme promises, the step is as far toward white
 * as the ratio allows; `danger` with white on `#dc2626` starts at 4.53:1 and
 * can move 3.4%, which is what the table below states rather than hides.
 *
 * A hover darkened the fill before this rule, and every family that reads
 * the step — button, tag, badge, avatar, switch, checkbox, radio, list-item —
 * changed together when it was recalculated. That is the point: one rule in
 * the theme, not a shade per component.
 */
test('derives every solid hover from its fill by the one rule', () => {
  const reached = [];
  for (const [scheme, values] of Object.entries(theme.schemes)) {
    for (const tone of ['accent', 'secondary', 'success', 'warning', 'danger']) {
      const solid = values[`--slotted-tone-${tone}-solid`];
      const hover = values[`--slotted-tone-${tone}-solid-hover`];
      const onSolid = values[`--slotted-tone-${tone}-on-solid`];
      assert.equal(
        hover,
        hoverOf(solid, scheme, { onSolid, ratio: TEXT_RATIO[scheme], contrast }),
        `${scheme} ${tone} hover is not the fill moved ${HOVER_SHARE[scheme] * 100}% toward white`,
      );
      reached.push(shareOf(solid, hover));
    }
  }
  /* Every tone moves, and none moves past the share the scheme states. */
  for (const share of reached) {
    assert.ok(share > 0.025 && share < 0.09, `a hover moved ${(share * 100).toFixed(1)}%`);
  }
});

/**
 * The halo the selection scale describes — the circle `checkbox` and
 * `radio-group` light under the pointer — is a tone laid over the page at
 * `--slotted-selection-halo-opacity`, so what a reader sees is the mix and the
 * mix is what has to separate from the page. The ink is the accent's text
 * tone, which every scheme keeps legible on the surface, and the same twelfth
 * of it therefore lands in the same place in all three.
 *
 * It was the accent's surface tone at four tenths. A surface tone is a ground,
 * tuned to sit under text rather than to be told apart from the page: the halo
 * measured 1.09:1 in `light`, 1.03:1 in `dark` and 1.00:1 in `high-contrast`,
 * where the token is the page's own white — a gesture one scheme out of three
 * could see (CK7).
 */
/**
 * The band behind a span a query matched, held from both sides. It is mixed
 * from the accent's text tone for the reason the halo is — a `*-surface` tone
 * is a ground and does not separate from the surface it sits on, and in
 * `high-contrast` it is the page's own white (CB10) — and its share is smaller
 * than the halo's because a band is read through. The mark's own text sits on
 * it, so the share the band may take is whatever leaves that text the ratio
 * its scheme promises, on every ground a marked label can land on: the panel,
 * a highlighted row and a chosen row.
 */
test('lights the filter match without dimming the word it marks', () => {
  const alpha = Number(theme.base['--slotted-highlight-tint-opacity']);
  const panels = [];
  for (const [scheme, values] of Object.entries(theme.schemes)) {
    const ink = values['--slotted-tone-accent-text'];
    for (const [role, ground] of [
      ['the panel', values['--slotted-surface-raised']],
      ['a highlighted row', values['--slotted-tone-secondary-subtle-hover']],
      ['a chosen row', values['--slotted-tone-accent-surface']],
    ]) {
      const band = over(ink, ground, alpha);
      const separation = contrast(band, ground);
      assert.ok(
        separation >= 1.1,
        `the match band reads ${separation.toFixed(3)}:1 against ${role} in ${scheme}`,
      );
      const legibility = contrast(ink, band);
      assert.ok(
        legibility >= TEXT_RATIO[scheme],
        `the marked word reads ${legibility.toFixed(3)}:1 on its band over ${role} in ${scheme}`,
      );
      if (role === 'the panel') panels.push(separation);
    }
  }
  /* The same gesture in all three, not three strengths of one. */
  assert.ok(
    Math.max(...panels) - Math.min(...panels) <= 0.1,
    `the match band reads ${panels.map((ratio) => ratio.toFixed(3)).join(', ')} across the schemes`,
  );
});

test('lights the selection halo where every scheme can see it', () => {
  const alpha = Number(theme.base['--slotted-selection-halo-opacity']);
  const reached = [];
  for (const [scheme, values] of Object.entries(theme.schemes)) {
    const surface = values['--slotted-surface'];
    const ratio = contrast(over(values['--slotted-tone-accent-text'], surface, alpha), surface);
    assert.ok(ratio >= 1.2, `the halo reads ${ratio.toFixed(3)}:1 against the page in ${scheme}`);
    reached.push(ratio);
  }
  /* The same gesture in all three, not three strengths of one. */
  assert.ok(
    Math.max(...reached) - Math.min(...reached) <= 0.1,
    `the halo reads ${reached.map((ratio) => ratio.toFixed(3)).join(', ')} across the schemes`,
  );
});

/**
 * The file-kind palette is the second scale in the component layer, and the
 * whole of its argument is that it is a palette the five tones cannot give. A
 * palette a family invented is a palette nobody measured, so both questions the
 * pair raises are measured here: the tile against the page it sits on, and the
 * mark knocked out of it against the tile.
 *
 * Both are non-text elements carrying meaning, so 3:1 is the floor. The scale
 * clears it by a wide margin on purpose — a tile at the floor is a tile a
 * reader has to look for.
 */
test('keeps every file-kind tile legible against the page and against its own mark', () => {
  const kinds = contract.tokens
    .filter((token) => token.name.startsWith('--slotted-upload-kind-'))
    .map((token) => token.name)
    .filter((name) => name !== '--slotted-upload-kind-foreground');

  assert.equal(kinds.length, 9, 'the palette changed size without this test noticing');

  for (const [scheme, values] of Object.entries(theme.schemes)) {
    const foreground = values['--slotted-upload-kind-foreground'];
    for (const kind of kinds) {
      const tile = values[kind];
      assert.ok(tile, `${scheme} ${kind} is missing`);
      assert.ok(
        contrast(tile, values['--slotted-surface']) >= 3,
        `${scheme} ${kind} is ${contrast(tile, values['--slotted-surface']).toFixed(2)}:1 against the surface`,
      );
      assert.ok(
        contrast(tile, foreground) >= 3,
        `${scheme} ${kind} is ${contrast(tile, foreground).toFixed(2)}:1 against its own mark`,
      );
      /*
       * And against a failed row's ground, because the tile keeps its own
       * colour there: a refused archive that turned red would stop answering
       * the question its own message raises.
       */
      assert.ok(
        contrast(tile, values['--slotted-tone-danger-surface']) >= 3,
        `${scheme} ${kind} is ${contrast(tile, values['--slotted-tone-danger-surface']).toFixed(2)}:1 against a failed row`,
      );
    }
  }
});

/**
 * Nine hues, and the reader tells them apart at thirty-two pixels. Two kinds
 * painted the same colour would be one kind drawn twice, which is what
 * `document` and `pdf` were before they were split.
 */
test('gives every file kind a colour of its own in every scheme', () => {
  for (const [scheme, values] of Object.entries(theme.schemes)) {
    const painted = contract.tokens
      .filter(
        (token) =>
          token.name.startsWith('--slotted-upload-kind-') &&
          token.name !== '--slotted-upload-kind-foreground',
      )
      .map((token) => values[token.name]);
    assert.equal(new Set(painted).size, painted.length, `${scheme} paints two kinds alike`);
  }
});

/**
 * The code-scope palette is the third scale in the component layer, and it is
 * there for the reason the file-kind palette is: twelve kinds of word, and five
 * tones. Every scope is text — a keyword is read, not glanced at — so the
 * floor is the text ratio each scheme promises, measured against the fence
 * ground `prose` and `code-block` both draw, `--slotted-surface-sunken`.
 */
test('keeps every code scope legible as text against the fence ground', () => {
  const scopes = contract.tokens
    .filter((token) => token.name.startsWith('--slotted-code-'))
    .map((token) => token.name);

  assert.equal(scopes.length, 12, 'the palette changed size without this test noticing');

  for (const [scheme, values] of Object.entries(theme.schemes)) {
    const ground = values['--slotted-surface-sunken'];
    for (const scope of scopes) {
      const ink = values[scope];
      assert.ok(ink, `${scheme} ${scope} is missing`);
      assert.ok(
        contrast(ink, ground) >= TEXT_RATIO[scheme],
        `${scheme} ${scope} is ${contrast(ink, ground).toFixed(2)}:1 against the fence ground`,
      );
    }
  }
});

/**
 * Twelve hues a reader tells apart one character at a time. Two scopes painted
 * alike would be one scope drawn twice.
 */
test('gives every code scope a colour of its own in every scheme', () => {
  for (const [scheme, values] of Object.entries(theme.schemes)) {
    const painted = contract.tokens
      .filter((token) => token.name.startsWith('--slotted-code-'))
      .map((token) => values[token.name]);
    assert.equal(new Set(painted).size, painted.length, `${scheme} paints two scopes alike`);
  }
});

/**
 * The data scale is the first palette in the semantic layer: eight hues in a
 * fixed order, and the order is a measured fact rather than a preference —
 * `docs/history/designs/2026-09-16-stat-card-sparkline-design.md` records
 * the enumeration, and the colour-vision separation it holds is measured by
 * the `dataviz` validator, not here. What is measured here is the one thing
 * the theme promises every mark: a line, a bar or a dot in any slot separates
 * from every surface a chart can be drawn on, at the non-text ratio.
 */
test('keeps every data slot legible against every surface a chart is drawn on', () => {
  const slots = contract.tokens
    .filter((token) => token.name.startsWith('--slotted-data-'))
    .map((token) => token.name);

  assert.deepEqual(
    slots,
    Array.from({ length: 8 }, (_, index) => `--slotted-data-${index + 1}`),
    'the scale changed shape without this test noticing',
  );

  for (const [scheme, values] of Object.entries(theme.schemes)) {
    const floor = scheme === 'high-contrast' ? 4.5 : 3;
    for (const slot of slots) {
      const ink = values[slot];
      assert.ok(ink, `${scheme} ${slot} is missing`);
      for (const surface of [
        '--slotted-surface',
        '--slotted-surface-raised',
        '--slotted-surface-sunken',
      ]) {
        assert.ok(
          contrast(ink, values[surface]) >= floor,
          `${scheme} ${slot} is ${contrast(ink, values[surface]).toFixed(2)}:1 against ${surface}`,
        );
      }
    }
  }
});

/** Eight series a reader tells apart; two slots painted alike are one series drawn twice. */
test('gives every data slot a colour of its own in every scheme', () => {
  for (const [scheme, values] of Object.entries(theme.schemes)) {
    const painted = contract.tokens
      .filter((token) => token.name.startsWith('--slotted-data-'))
      .map((token) => values[token.name]);
    assert.equal(new Set(painted).size, painted.length, `${scheme} paints two slots alike`);
  }
});
