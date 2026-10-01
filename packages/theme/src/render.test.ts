import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { defineTheme, type ThemeDefinition } from './define';
import { LAYER_ORDER_STATEMENT } from './layer-order';
import { recipes } from './recipes';
import { renderTheme } from './render';

// jsdom's `URL` (the test environment's global) rejects a `file:` base, so this
// resolves the path with `node:path` rather than `new URL(..., import.meta.url)`.
const values = JSON.parse(
  readFileSync(join(import.meta.dirname, '../../themes/src/default/values.json'), 'utf8'),
) as Omit<ThemeDefinition, 'name' | 'seeds' | 'recipe'>;

/** `values.json` keeps the derived colours as literals until Task 8; the recipe has to own them here. */
const schemes = Object.fromEntries(
  Object.entries(values.schemes ?? {}).map(([scheme, tokens]) => [
    scheme,
    Object.fromEntries(
      Object.entries(tokens ?? {}).filter(
        ([token]) => !(token in recipes.standard[scheme as keyof typeof recipes.standard]),
      ),
    ),
  ]),
) as NonNullable<ThemeDefinition['schemes']>;

const theme = defineTheme({
  ...values,
  schemes,
  name: 'test',
  seeds: {
    accent: '#1d4ed8',
    neutral: '#64748b',
    success: '#15803d',
    warning: '#facc15',
    danger: '#dc2626',
  },
  recipe: recipes.standard,
  components: { '--slotted-card-radius': '0px' },
  fonts: [
    { family: 'Inter Variable', src: "url('/inter.woff2') format('woff2')", weight: '100 900' },
  ],
  rules: [`@keyframes glow { to { opacity: 1; } } [data-ui='card'] { animation: glow 1s; }`],
});
const css = renderTheme(theme);

describe('renderTheme', () => {
  it('opens with the layer order and registers every seed as a colour', () => {
    expect(css.startsWith(LAYER_ORDER_STATEMENT)).toBe(true);
    for (const seed of ['accent', 'neutral', 'success', 'warning', 'danger']) {
      expect(css).toContain(
        `@property --slotted-seed-${seed} {\n  syntax: '<color>';\n  inherits: true;\n  initial-value: gray;\n}`,
      );
    }
  });

  it('declares the seeds and the component tokens on the theme', () => {
    expect(css).toMatch(/\[data-slotted-theme="test"\] \{\n {4}--slotted-seed-accent: #1d4ed8;/);
    expect(css).toContain('    --slotted-card-radius: 0px;');
  });

  it('scopes each scheme to its nearest root and re-derives under data-slotted-seeds', () => {
    expect(css).toContain(
      '@scope ([data-slotted-theme="test"][data-slotted-scheme="dark"], [data-slotted-theme="test"] [data-slotted-scheme="dark"], [data-slotted-scheme="dark"] [data-slotted-theme="test"]) to ([data-slotted-scheme], [data-slotted-theme]) {\n    :scope,\n    [data-slotted-seeds] {\n      color-scheme: dark;',
    );
    expect(css).toContain(
      '--slotted-tone-accent-solid: oklch(from oklch(from var(--slotted-seed-accent)',
    );
  });

  it('follows the operating system under the system scheme', () => {
    const system = css.indexOf('[data-slotted-theme="test"][data-slotted-scheme="system"]');
    const query = css.indexOf('@media (prefers-color-scheme: dark)');
    expect(system).toBeGreaterThan(-1);
    expect(query).toBeGreaterThan(system);
    expect(css.slice(query, query + 600)).toContain('color-scheme: dark;');
  });

  it('emits fonts, hoisted keyframes and scoped rules after the theme layer', () => {
    expect(css).toContain(
      "@font-face {\n  font-family: \"Inter Variable\";\n  src: url('/inter.woff2') format('woff2');\n  font-weight: 100 900;",
    );
    const layerEnd = css.indexOf('@keyframes slotted-test-glow');
    expect(layerEnd).toBeGreaterThan(css.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(css).toContain(
      '@layer slotted.theme-rules {\n  @scope ([data-slotted-theme="test"]) to ([data-slotted-theme]:not([data-slotted-theme="test"])) {\n    [data-ui=\'card\'] { animation: slotted-test-glow 1s; }\n  }\n}',
    );
  });

  it('refuses a rule that is still a URL', () => {
    const unbuilt = defineTheme({ ...theme, name: 'unbuilt', rules: [new URL('file:///x.css')] });
    expect(() => renderTheme(unbuilt)).toThrow('unbuilt: a rule is still a URL (file:///x.css)');
  });

  it('refuses a rule whose unbalanced brace would escape the @scope it is compiled into', () => {
    const malformed = defineTheme({
      ...theme,
      name: 'malformed',
      rules: ['.a { color: red; } } .evil { color: blue; }'],
    });
    expect(() => renderTheme(malformed)).toThrow(/unbalanced `\}`/);
  });
});
