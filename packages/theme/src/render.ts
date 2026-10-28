import {
  assertTheme,
  CORNERS,
  DENSITIES,
  type Corner,
  type FontFaceDefinition,
  type Theme,
} from './define';
import { contract } from './generated/contract';
import { LAYER_ORDER_STATEMENT } from './layer-order';
import { derivationCss, SCHEMES, SEED_NAMES, type Scheme } from './recipe';
import { processRules } from './rules';

/** `high-contrast` paints black on white, so the light user-agent style matches it. */
const UA_SCHEME: Readonly<Record<Scheme, 'light' | 'dark'>> = {
  light: 'light',
  dark: 'dark',
  'high-contrast': 'light',
};

const indent = (text: string, spaces = 2) =>
  text
    .split('\n')
    .map((line) => (line ? ' '.repeat(spaces) + line : line))
    .join('\n');
const block = (selectors: readonly string[], body: string) =>
  `${selectors.join(',\n')} {\n${indent(body)}\n}`;
const declarations = (values: Readonly<Record<string, string>>) =>
  Object.entries(values)
    .map(([name, value]) => `${name}: ${value};`)
    .join('\n');
const themeSelector = (name: string) => `[data-slotted-theme="${name}"]`;
const schemeSelector = (scheme: string) => `[data-slotted-scheme="${scheme}"]`;

/**
 * One scheme, scoped to the nearest element that names it. The limit stops at
 * any element that names another scheme or theme, and scoping proximity makes
 * the nearest root win when two schemes are nested. A theme element under the
 * scheme roots it only when it names no scheme of its own; without the guard,
 * a light panel in a dark page was a root of both scopes at the same distance,
 * and the one written later won. `[data-slotted-seeds]` re-derives every
 * colour from the seeds an element carries itself.
 */
function schemeScope(theme: string, scheme: string, body: string): string {
  const t = themeSelector(theme);
  const s = schemeSelector(scheme);
  return (
    `@scope (${t}${s}, ${t} ${s}, ${s} ${t}:not([data-slotted-scheme])) to ([data-slotted-scheme], [data-slotted-theme]) {\n` +
    `${indent(block([':scope', '[data-slotted-seeds]'], body))}\n}`
  );
}

function schemeValues(theme: Theme, scheme: Scheme): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [name, rule] of Object.entries(theme.recipe[scheme]))
    values[name] = derivationCss(rule);
  return { ...values, ...(theme.schemes?.[scheme] ?? {}) };
}

function densitySelectors(theme: string, density: string): string[] {
  const t = themeSelector(theme);
  const d = `[data-slotted-density="${density}"]`;
  return [`${t}${d}`, `${t} ${d}`];
}

function cornerSelectors(theme: string, corner: string): string[] {
  const t = themeSelector(theme);
  const c = `[data-slotted-corners="${corner}"]`;
  return [`${t}${c}`, `${t} ${c}`];
}

/**
 * What a corner scope declares: the radius steps it writes, and the theme's own
 * tokens that read the scale through `var()`. A custom property holds the value
 * it had where it was declared, so `--slotted-control-radius` set at the theme
 * root would stay at the root's radius inside the scope unless it is declared
 * again there. `standard` is the base scale unless the theme writes it.
 */
function cornerValues(theme: Theme, corner: Corner): Record<string, string> {
  const own = theme.corners?.[corner];
  if (own === undefined && corner !== 'standard') return {};
  const declared = { ...(theme.base ?? {}), ...(theme.components ?? {}) } as Record<string, string>;
  const values: Record<string, string> = {};
  for (const [name, value] of Object.entries(declared)) {
    if (/^--slotted-radius-(xs|sm|md|lg)$/.test(name) || value.includes('var(--slotted-radius-'))
      values[name] = value;
  }
  return { ...values, ...(own ?? {}) };
}

const propertyRule = (seed: string) =>
  `@property --slotted-seed-${seed} {\n  syntax: '<color>';\n  inherits: true;\n  initial-value: gray;\n}`;

const fontFace = (font: FontFaceDefinition) =>
  `@font-face {\n  font-family: ${JSON.stringify(font.family)};\n  src: ${font.src};\n` +
  `  font-weight: ${font.weight ?? 'normal'};\n  font-style: ${font.style ?? 'normal'};\n` +
  `  font-display: ${font.display ?? 'swap'};\n}`;

/**
 * A stylesheet inlined in an HTML `<style>` ends at the first `</style`,
 * whatever CSS context that sits in. `</` is never CSS outside a string, a
 * comment or an unquoted `url()`, and in each of them the escape `\3c ` reads
 * as the same `<`, so every `<` followed by `/` is written as that escape and
 * the text never carries `</`. A `<` that an odd run of `\` already escapes
 * gives up that last `\`, since `\3c ` is the whole escape.
 */
const escapeEndTags = (css: string) =>
  css.replace(
    /(\\*)<\//g,
    (_match, slashes: string) => `${slashes.length % 2 === 1 ? slashes.slice(1) : slashes}\\3c /`,
  );

/**
 * The stylesheet of one theme. The theme is checked as `defineTheme` checks
 * it, and the text is safe to inline in an HTML `<style>`.
 */
export function renderTheme(theme: Theme): string {
  for (const rule of theme.rules ?? []) {
    if (typeof rule !== 'string') {
      throw new Error(
        `${theme.name}: a rule is still a URL (${rule.href}); build the theme with slotted-build-theme`,
      );
    }
  }
  assertTheme(theme);
  const name = theme.name;
  const seeds = Object.fromEntries(
    SEED_NAMES.map((seed) => [`--slotted-seed-${seed}`, theme.seeds[seed]]),
  );
  const blocks: string[] = [
    block(
      [themeSelector(name)],
      /* Text no family draws inherits the body step, not the browser's 16px. */
      `${declarations({ ...seeds, ...(theme.base ?? {}), ...(theme.components ?? {}) })}\n` +
        'font-size: var(--slotted-font-size-md);\nline-height: var(--slotted-line-height-md);',
    ),
    /*
     * Firefox (Stylo, measured 146–155) shares one computed style between
     * siblings that differ only in the root selector of an @scope: the root
     * is not among the selectors its style-sharing cache revalidates, so a
     * dark sibling of a light one took the light values. A rule outside every
     * @scope whose rightmost compound names each scheme puts the attribute
     * among those selectors. An empty rule is dropped by esbuild and
     * lightningcss when they minify; `initial` on a property nothing reads
     * changes nothing.
     */
    block([...SCHEMES, 'system'].map(schemeSelector), '--_slotted-scheme-anchor: initial;'),
  ];

  for (const scheme of SCHEMES) {
    blocks.push(
      schemeScope(
        name,
        scheme,
        `color-scheme: ${UA_SCHEME[scheme]};\n${declarations(schemeValues(theme, scheme))}`,
      ),
    );
  }
  blocks.push(
    schemeScope(
      name,
      'system',
      `color-scheme: light;\n${declarations(schemeValues(theme, 'light'))}`,
    ),
  );
  blocks.push(
    `@media (prefers-color-scheme: dark) {\n${indent(
      schemeScope(
        name,
        'system',
        `color-scheme: dark;\n${declarations(schemeValues(theme, 'dark'))}`,
      ),
    )}\n}`,
  );

  for (const density of DENSITIES) {
    blocks.push(
      block(densitySelectors(name, density), declarations(theme.densities?.[density] ?? {})),
    );
  }

  for (const corner of CORNERS) {
    const values = cornerValues(theme, corner);
    if (Object.keys(values).length > 0)
      blocks.push(block(cornerSelectors(name, corner), declarations(values)));
  }

  /* A coarse pointer cannot hit what a mouse can: controls grow to the comfortable target. */
  const targets = contract.tokens
    .filter(
      (token) =>
        token.axis === 'density' && /^--slotted-control-height-(sm|md|lg)$/.test(token.name),
    )
    .map((token) => token.name);
  blocks.push(
    `@media (pointer: coarse) {\n${indent(
      DENSITIES.map((density) =>
        block(
          densitySelectors(name, density),
          targets
            .map(
              (token) =>
                `${token}: max(${theme.densities?.[density]?.[token as never]}, var(--slotted-target-comfortable));`,
            )
            .join('\n'),
        ),
      ).join('\n\n'),
    )}\n}`,
  );

  /* Reduced transparency makes a material opaque, in the scopes that set it; forced colours, later, win. */
  const opaque = declarations(
    Object.fromEntries(
      contract.tokens
        .filter((token) => token.reducedTransparency !== undefined)
        .map((token) => [token.name, token.reducedTransparency!]),
    ),
  );
  blocks.push(
    `@media (prefers-reduced-transparency: reduce) {\n${indent(
      [
        block([themeSelector(name)], opaque),
        ...[...SCHEMES, 'system'].map((scheme) => schemeScope(name, scheme, opaque)),
      ].join('\n\n'),
    )}\n}`,
  );

  /* Forced colours replace the palette; the same scopes carry the system colours, later in source. */
  const forced = declarations(
    Object.fromEntries(
      contract.tokens
        .filter((token) => token.axis === 'scheme')
        .map((token) => [token.name, token.forcedColor!]),
    ),
  );
  blocks.push(
    `@media (forced-colors: active) {\n${indent(
      [
        block([themeSelector(name)], forced),
        ...[...SCHEMES, 'system'].map((scheme) => schemeScope(name, scheme, forced)),
      ].join('\n\n'),
    )}\n}`,
  );

  /* Last in the layer: a media query adds no specificity, so source order makes it win. */
  blocks.push(
    `@media (prefers-reduced-motion: reduce) {\n${indent(
      block([themeSelector(name)], declarations(theme.reducedMotion ?? {})),
    )}\n}`,
  );

  const { hoisted, body } = processRules(name, (theme.rules ?? []) as readonly string[]);
  const parts = [
    LAYER_ORDER_STATEMENT.trimEnd(),
    ...SEED_NAMES.map(propertyRule),
    ...(theme.fonts ?? []).map(fontFace),
    `@layer slotted.theme {\n${indent(blocks.join('\n\n'))}\n}`,
    ...hoisted,
  ];
  if (body) {
    parts.push(
      `@layer slotted.theme-rules {\n${indent(
        `@scope (${themeSelector(name)}) to ([data-slotted-theme]:not(${themeSelector(name)})) {\n${indent(body)}\n}`,
      )}\n}`,
    );
  }
  return escapeEndTags(`${parts.join('\n\n')}\n`);
}
