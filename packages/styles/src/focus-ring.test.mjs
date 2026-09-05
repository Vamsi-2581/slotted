import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const source = new URL('.', import.meta.url).pathname;

/**
 * R3: the focus ring is drawn in `--slotted-focus-ring-color` in every scheme,
 * or in `--slotted-focus-ring-color-invalid` on a control that is invalid.
 *
 * A ring in another colour was measured once, on a `Button` in the `dark`
 * scheme: `#d4d4d8` where the theme says `#60a5fa`. That one came from a
 * stylesheet outside this package, and this test is what would have caught the
 * same colour written inside it — a `solid` alert and toast did draw the ring
 * in their own ink, for contrast against the fill, and now keep the theme's
 * ring with a halo inside it instead.
 *
 * A `forced-colors` block is exempt: there the user agent owns every colour,
 * the theme resolves the token to `Highlight`, and an outline standing in for
 * a border (`ButtonBorder` on a track) is not a focus ring.
 */
const RING = /var\(\s*--slotted-focus-ring-color(?:-invalid)?\s*[,)]/;

function stylesheets() {
  return readdirSync(source, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) =>
      readdirSync(join(source, entry.name))
        .filter((name) => name.endsWith('.css'))
        .map((name) => ({
          path: join(entry.name, name),
          css: readFileSync(join(source, entry.name, name), 'utf8'),
        })),
    );
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Removes every `@media (forced-colors: active) { … }` block, matching braces
 * so nested rules go with it.
 */
function withoutForcedColors(css) {
  let out = '';
  let index = 0;
  const marker = /@media\s*\(forced-colors:\s*active\)\s*\{/g;
  for (let match = marker.exec(css); match; match = marker.exec(css)) {
    out += css.slice(index, match.index);
    let depth = 1;
    let end = match.index + match[0].length;
    for (; end < css.length && depth > 0; end += 1) {
      if (css[end] === '{') depth += 1;
      else if (css[end] === '}') depth -= 1;
    }
    index = end;
    marker.lastIndex = end;
  }
  return out + css.slice(index);
}

function outlineColours(css) {
  const declarations = [];
  const pattern = /(?:^|[;{\s])(outline(?:-color)?)\s*:\s*([^;}]+)/g;
  for (let match = pattern.exec(css); match; match = pattern.exec(css)) {
    const [, property, raw] = match;
    const value = raw.replace(/\s+/g, ' ').trim();
    if (property === 'outline' && /^(none|0)$/.test(value)) continue;
    declarations.push(`${property}: ${value}`);
  }
  return declarations;
}

test('every focus ring is drawn in the theme’s ring colour', () => {
  const offenders = [];
  for (const { path, css } of stylesheets()) {
    const body = withoutForcedColors(stripComments(css));
    for (const declaration of outlineColours(body)) {
      if (!RING.test(declaration)) offenders.push(`${path}: ${declaration}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `An outline that is not the theme's ring (R3):\n  ${offenders.join('\n  ')}`,
  );
});

test('finds the rings it guards', () => {
  const rings = stylesheets().flatMap(({ css }) =>
    outlineColours(withoutForcedColors(stripComments(css))),
  );
  assert.ok(rings.length >= 40, `Expected the families' rings, found ${rings.length}`);
});
