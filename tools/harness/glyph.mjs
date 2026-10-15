import { readFileSync } from 'node:fs';

import { drawGlyph, GLYPH_PREFIX } from '../../scripts/generate-icon-glyphs.mjs';

/**
 * A family's own icon is the `Glyph` element: a real `<svg>` inside the `icon`
 * box. A fragment writes it the way the bindings mark it and leaves the drawing
 * out — `<svg data-part="glyph" data-glyph="x"></svg>` — and the page is built
 * with the drawing the bindings render, from the same manifest. No fragment
 * carries geometry of its own, so none can drift from `@slotted/core/glyph`.
 */
const manifest = JSON.parse(
  readFileSync(new URL('../../packages/themes/src/default/glyphs.json', import.meta.url), 'utf8'),
);

const EMPTY_GLYPH = /<svg\b([^>]*\bdata-glyph="([a-z0-9-]+)"[^>]*)>\s*<\/svg\s*>/g;

export function glyphSvg(name, attributes = ` data-part="glyph" data-glyph="${name}"`) {
  const entry = manifest[`${GLYPH_PREFIX}${name}`];
  if (entry === undefined) throw new Error(`no glyph named "${name}" in glyphs.json`);
  const { paint, strokeWidth, offset, paths } = drawGlyph(entry);
  const painted =
    paint === 'fill'
      ? ' fill="currentColor"'
      : ` fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"`;
  const [dx, dy] = offset;
  const group = dx === 0 && dy === 0 ? '<g>' : `<g transform="translate(${dx} ${dy})">`;
  return (
    `<svg${attributes} aria-hidden="true" focusable="false" viewBox="0 0 24 24"${painted}>` +
    `${group}${paths.map((d) => `<path d="${d}"/>`).join('')}</g></svg>`
  );
}

let masks = 0;

/**
 * The solid form the bindings draw for `solid`: the first shape filled, the
 * symbol cut out of it by a mask local to the svg.
 */
export function solidGlyphSvg(name, attributes) {
  const entry = manifest[`${GLYPH_PREFIX}${name}`];
  if (entry === undefined) throw new Error(`no glyph named "${name}" in glyphs.json`);
  const { strokeWidth, offset, paths } = drawGlyph(entry);
  const [shape, ...symbol] = paths;
  const id = `sl-glyph-harness-${String((masks += 1))}`;
  const round = `stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"`;
  const [dx, dy] = offset;
  const group = dx === 0 && dy === 0 ? '<g>' : `<g transform="translate(${dx} ${dy})">`;
  return (
    `<svg${attributes} aria-hidden="true" focusable="false" viewBox="0 0 24 24">` +
    `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-2" y="-2" width="28" height="28">` +
    `<rect x="-2" y="-2" width="28" height="28" fill="#fff"/>` +
    `<g fill="none" stroke="#000" ${round}>${symbol.map((d) => `<path d="${d}"/>`).join('')}</g>` +
    `</mask></defs>${group}<path d="${shape}" fill="currentColor" stroke="currentColor" ${round} mask="url(#${id})"/></g></svg>`
  );
}

/** Every empty `<svg data-glyph>` of a fragment, drawn; `data-solid` draws the solid form. */
export function drawGlyphs(fragment) {
  return fragment.replace(EMPTY_GLYPH, (_, attributes, name) =>
    /\bdata-solid\b/.test(attributes)
      ? solidGlyphSvg(name, ` ${attributes.trim()}`)
      : glyphSvg(name, ` ${attributes.trim()}`),
  );
}
