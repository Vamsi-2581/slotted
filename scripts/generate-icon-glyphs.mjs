#!/usr/bin/env node
/**
 * Draws every `--slotted-icon-*` glyph of a theme from the Lucide icon its
 * manifest names, and writes the data URIs into the theme's `theme.json`.
 *
 * A glyph is a `mask-image`, so the artwork is painted black and the black
 * becomes the mask's alpha. The geometry is Lucide's own, read from the
 * `lucide` package at the version `lucide-react` is pinned to, so a mark a
 * family draws from a token and a mark a story draws from `lucide-react` or
 * `@ng-icons/lucide` are the same drawing. Nothing in `theme.json` is authored
 * by hand: an edit to a glyph is an edit to `glyphs.json`, followed by a build.
 *
 * Usage:
 *   node scripts/generate-icon-glyphs.mjs [--theme <package dir>] [--check]
 *
 * `--theme` defaults to `packages/theme-default`. `--check` writes nothing and
 * exits 1 when the theme's glyphs differ from the manifest's.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { icons } from 'lucide';

import { centringOffset } from './glyph-ink.mjs';

export const GLYPH_PREFIX = '--slotted-icon-';
export const DEFAULT_STROKE_WIDTH = 2;

const ROOT = new URL('..', import.meta.url);
const DEFAULT_THEME = 'packages/theme-default';

/** `circle-question-mark` → `CircleQuestionMark`, the key the `lucide` map uses. */
function pascal(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/** The Lucide icon node — `[[tag, attributes], ...]` — for a kebab-case name. */
export function lucideIcon(name) {
  const node = icons[pascal(name)];
  if (!node) {
    throw new Error(`Lucide has no icon named "${name}"`);
  }
  return node;
}

/**
 * The characters a `data:` URI inside `url("…")` cannot carry literally. The
 * rest — spaces, quotes, commas, slashes — stay readable, the way every glyph
 * has been written so far.
 */
function encode(svg) {
  return svg.replace(
    /[<>#"%{}|\\^`]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function element(tag, attributes) {
  const attrs = Object.entries(attributes)
    .map(([key, value]) => `${key}='${value}'`)
    .join(' ');
  return `<${tag} ${attrs}/>`;
}

/**
 * One glyph as the theme states it. `paint` is `stroke` (Lucide's own
 * rendering, the default) or `fill`: the same geometry painted solid, for the
 * marks that stand in for a photograph or a dot rather than annotate a line.
 *
 * The drawing is Lucide's, and where it sits in the box is not. A mask is
 * centred on whatever consumes it, so what has to be centred is the painted
 * ink: Lucide frames each icon for the set, and `check` comes out half a unit
 * above the middle of its own viewBox — 0.208 | 0.250 | 0.292px in a checkbox
 * at the three size steps, which is the whole of what CK6 could not remove
 * from the sheet (CK9). The children are therefore emitted unchanged, inside a
 * group that moves them onto the centre when they are not already on it.
 */
export function renderGlyph({
  icon,
  'stroke-width': strokeWidth = DEFAULT_STROKE_WIDTH,
  paint = 'stroke',
}) {
  if (paint !== 'stroke' && paint !== 'fill') {
    throw new Error(`Unknown paint "${paint}" for "${icon}": expected "stroke" or "fill"`);
  }
  const root =
    paint === 'fill'
      ? { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'black' }
      : {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'black',
          'stroke-width': String(strokeWidth),
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
        };
  const node = lucideIcon(icon);
  const drawing = node.map(([tag, attributes]) => element(tag, attributes)).join('');
  const { dx, dy } = centringOffset(node, { paint, strokeWidth });
  const children =
    dx === 0 && dy === 0 ? drawing : `<g transform='translate(${dx} ${dy})'>${drawing}</g>`;
  const svg = `<svg${Object.entries(root)
    .map(([key, value]) => ` ${key}='${value}'`)
    .join('')}>${children}</svg>`;
  return `url("data:image/svg+xml,${encode(svg)}")`;
}

/** Every glyph of a manifest, keyed by token name, in manifest order. */
export function renderGlyphs(manifest) {
  const glyphs = {};
  for (const [token, entry] of Object.entries(manifest)) {
    if (!token.startsWith(GLYPH_PREFIX)) {
      throw new Error(`"${token}" is not a glyph token: expected the ${GLYPH_PREFIX} prefix`);
    }
    glyphs[token] = renderGlyph(entry);
  }
  return glyphs;
}

export async function readManifest(themeDir) {
  return JSON.parse(await readFile(new URL('src/glyphs.json', themeDir), 'utf8'));
}

/**
 * The theme with its glyphs redrawn, and whether anything changed. Only the
 * tokens the manifest names are written; the theme keeps every other value and
 * its key order.
 */
export async function generate(themeDir, { check = false } = {}) {
  const themeUrl = new URL('src/theme.json', themeDir);
  const before = await readFile(themeUrl, 'utf8');
  const theme = JSON.parse(before);
  const glyphs = renderGlyphs(await readManifest(themeDir));

  const stale = Object.keys(theme.base).filter(
    (token) => token.startsWith(GLYPH_PREFIX) && !(token in glyphs),
  );
  if (stale.length > 0) {
    throw new Error(`glyphs.json names no icon for: ${stale.join(', ')}`);
  }
  for (const [token, value] of Object.entries(glyphs)) {
    theme.base[token] = value;
  }

  const after = `${JSON.stringify(theme, null, 2)}\n`;
  const changed = after !== before;
  if (changed && !check) {
    await writeFile(themeUrl, after);
  }
  return { changed, tokens: Object.keys(glyphs) };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const themeArg = args[args.indexOf('--theme') + 1];
  const themeDir =
    args.includes('--theme') && themeArg
      ? pathToFileURL(`${resolve(themeArg)}/`)
      : new URL(`${DEFAULT_THEME}/`, ROOT);

  const { changed, tokens } = await generate(themeDir, { check });
  if (check && changed) {
    console.error(`theme.json glyphs are out of date; run: node scripts/generate-icon-glyphs.mjs`);
    process.exit(1);
  }
  console.log(
    `${changed ? 'wrote' : 'kept'} ${tokens.length} glyphs in ${themeDir.pathname}src/theme.json`,
  );
}
