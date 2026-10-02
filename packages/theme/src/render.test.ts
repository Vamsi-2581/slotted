import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { defineTheme, type Theme, type ThemeDefinition } from './define';
import { LAYER_ORDER_STATEMENT } from './layer-order';
import { recipes } from './recipes';
import { renderTheme } from './render';

// jsdom's `URL` (the test environment's global) rejects a `file:` base, so this
// resolves the path with `node:path` rather than `new URL(..., import.meta.url)`.
const values = JSON.parse(
  readFileSync(join(import.meta.dirname, '../../themes/src/default/values.json'), 'utf8'),
) as Omit<ThemeDefinition, 'name' | 'seeds' | 'recipe'>;

const theme = defineTheme({
  ...values,
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

  it('keeps a rule whose comment hides a structural character, and still scopes it', () => {
    const commented = defineTheme({
      ...theme,
      name: 'commented',
      rules: [`[data-ui='card'] { color: red; /* ; */ }`],
    });
    const css = renderTheme(commented);
    expect(css).toContain(
      '@layer slotted.theme-rules {\n  @scope ([data-slotted-theme="commented"]) to ([data-slotted-theme]:not([data-slotted-theme="commented"])) {\n    [data-ui=\'card\'] { color: red; /* ; */ }\n  }\n}',
    );
  });
});

/**
 * `renderTheme` takes any object typed `Theme`, and a theme read back from
 * storage or a network response is such an object without ever passing
 * through `defineTheme`. Its name lands in selectors and every value in
 * declarations, so the render refuses what `defineTheme` would refuse.
 */
describe('renderTheme on a theme that did not come from defineTheme', () => {
  const forged = (overrides: Record<string, unknown>) => ({ ...theme, ...overrides }) as Theme;

  it('refuses a name a selector cannot carry', () => {
    expect(() => renderTheme(forged({ name: 'x"], * { color: red } [x="' }))).toThrow(
      /is not \[a-z\]\[a-z0-9-\]\*/,
    );
  });

  it('refuses a value, a seed, a font field and a recipe derivation that could close their rule', () => {
    const [token] = Object.keys(recipes.standard.light);
    for (const overrides of [
      { components: { '--slotted-card-radius': '0; } * { color: red' } },
      { base: { ...theme.base, '--slotted-space-1': '0; } * { color: red' } },
      { seeds: { ...theme.seeds, accent: '#fff; } * { color: red' } },
      { fonts: [{ family: { toString: () => '}' }, src: 'url(a.woff2)' }] },
      {
        recipe: {
          ...recipes.standard,
          light: { ...recipes.standard.light, [token!]: { alias: '--a); } * { color: red' } },
        },
      },
    ]) {
      expect(() => renderTheme(forged(overrides)), JSON.stringify(overrides)).toThrow(
        /^Invalid theme test:/,
      );
    }
  });
});

/**
 * A server renders the theme into an inline `<style>`, whose text the HTML
 * parser ends at the first `</style`, inside a CSS string or not.
 */
describe('renderTheme inlined in an HTML <style>', () => {
  const hostile = defineTheme({
    ...theme,
    name: 'hostile',
    fonts: [{ family: '</style><b>', src: 'url("</style><script>alert(1)</script>.woff2")' }],
    rules: [`[data-ui='card']::before { content: "</style>"; }`],
  });
  const html = renderTheme(hostile);

  it('never writes `</` and keeps every `<` it escapes', () => {
    expect(html).not.toContain('</');
    expect(html).toContain('src: url("\\3c /style><script>alert(1)\\3c /script>.woff2");');
    expect(html).toContain('font-family: "\\3c /style><b>";');
    expect(html).toContain(`content: "\\3c /style>";`);
  });

  it('stays one style element with no element after it', () => {
    const parsed = new DOMParser().parseFromString(
      `<!doctype html><html><head><style>${html}</style></head><body></body></html>`,
      'text/html',
    );
    expect(parsed.querySelectorAll('style')).toHaveLength(1);
    expect(parsed.querySelector('script, b')).toBeNull();
    expect(parsed.querySelector('style')!.textContent).toBe(html);
  });
});
