import { GLYPH_VIEW_BOX, GLYPHS } from '@slotted/core/glyph';
import type { GlyphDrawing } from '@slotted/core/glyph';
import { useId } from 'react';

import type { GlyphProps } from './icon.types';

/**
 * Glyph is the library's own artwork, drawn as a real `<svg>`: the Lucide
 * geometry `@slotted/core/glyph` holds, stroked or filled with `currentColor`.
 * It goes inside an `Icon`, which owns the size, the colour, the alignment and
 * the name; the glyph owns only the drawing. Every family draws its own icons
 * — a close button's cross, a pager's chevrons — with this element, and never
 * with a pseudo-element or a mask of its own.
 *
 * `solid` draws a status mark the way a tone's badge reads: the glyph's first
 * shape — the circle of `circle-alert`, the triangle of `triangle-alert` —
 * filled, and the symbol inside it cut out of the fill by an SVG `<mask>`, so
 * whatever lies behind shows through the symbol on any ground.
 */
export function Glyph({ name, solid = false, ...nativeProps }: GlyphProps) {
  const drawing: GlyphDrawing = GLYPHS[name];
  const [dx, dy] = drawing.offset;
  /* An id a `url()` can carry: React's own holds characters it cannot. */
  const maskId = `sl-glyph-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const stroke = {
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: drawing.strokeWidth,
  };
  const paint =
    drawing.paint === 'fill'
      ? { fill: 'currentColor' }
      : { fill: 'none', stroke: 'currentColor', ...stroke };
  const [shape, ...symbol] = drawing.paths;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={GLYPH_VIEW_BOX}
      {...(solid ? {} : paint)}
      {...nativeProps}
      data-glyph={name}
      data-part="glyph"
      data-solid={solid ? '' : undefined}
    >
      {solid ? (
        <defs>
          <mask height="28" id={maskId} maskUnits="userSpaceOnUse" width="28" x="-2" y="-2">
            <rect fill="#fff" height="28" width="28" x="-2" y="-2" />
            <g fill="none" stroke="#000" {...stroke}>
              {symbol.map((d, index) => (
                <path d={d} key={index} />
              ))}
            </g>
          </mask>
        </defs>
      ) : null}
      <g transform={dx === 0 && dy === 0 ? undefined : `translate(${dx} ${dy})`}>
        {solid ? (
          <path
            d={shape}
            fill="currentColor"
            mask={`url(#${maskId})`}
            stroke="currentColor"
            {...stroke}
          />
        ) : (
          drawing.paths.map((d, index) => <path d={d} key={index} />)
        )}
      </g>
    </svg>
  );
}
