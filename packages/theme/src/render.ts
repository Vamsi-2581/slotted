import { DENSITIES, type FontFaceDefinition, type Theme } from './define';
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
 * the nearest root win when two schemes are nested. `[data-slotted-seeds]`
 * re-derives every colour from the seeds an element carries itself.
 */
function schemeScope(theme: string, scheme: string, body: string): string {
  const t = themeSelector(theme);
  const s = schemeSelector(scheme);
  return (
    `@scope (${t}${s}, ${t} ${s}, ${s} ${t}) to ([data-slotted-scheme], [data-slotted-theme]) {\n` +
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

const propertyRule = (seed: string) =>
  `@property --slotted-seed-${seed} {\n  syntax: '<color>';\n  inherits: true;\n  initial-value: gray;\n}`;

const fontFace = (font: FontFaceDefinition) =>
  `@font-face {\n  font-family: ${JSON.stringify(font.family)};\n  src: ${font.src};\n` +
  `  font-weight: ${font.weight ?? 'normal'};\n  font-style: ${font.style ?? 'normal'};\n` +
  `  font-display: ${font.display ?? 'swap'};\n}`;

export function renderTheme(theme: Theme): string {
  for (const rule of theme.rules ?? []) {
    if (typeof rule !== 'string') {
      throw new Error(
        `${theme.name}: a rule is still a URL (${rule.href}); build the theme with slotted-build-theme`,
      );
    }
  }
  const name = theme.name;
  const seeds = Object.fromEntries(
    SEED_NAMES.map((seed) => [`--slotted-seed-${seed}`, theme.seeds[seed]]),
  );
  const blocks: string[] = [
    block(
      [themeSelector(name)],
      declarations({ ...seeds, ...(theme.base ?? {}), ...(theme.components ?? {}) }),
    ),
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
  return `${parts.join('\n\n')}\n`;
}
