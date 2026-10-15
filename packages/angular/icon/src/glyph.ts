import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { GLYPH_VIEW_BOX, GLYPHS } from '@slotted/core/glyph';
import type { GlyphDrawing, GlyphName } from '@slotted/core/glyph';

let sequence = 0;

/**
 * Glyph is the library's own artwork, drawn as a real `<svg>`: the Lucide
 * geometry `@slotted/core/glyph` holds, stroked or filled with `currentColor`.
 * It goes inside a `slIcon` box, which owns the size, the colour, the
 * alignment and the name; the glyph owns only the drawing. Every family draws
 * its own icons — a close button's cross, a pager's chevrons — with this
 * element, and never with a pseudo-element or a mask of its own.
 *
 * `solid` draws a status mark the way a tone's badge reads: the glyph's first
 * shape filled, and the symbol inside it cut out of the fill by an SVG
 * `<mask>`, so whatever lies behind shows through the symbol on any ground.
 *
 * The children carry the `svg:` namespace because the template is parsed apart
 * from its host: an unprefixed `<path>` would be created as an HTML element.
 */
@Component({
  selector: 'svg[slGlyph]',
  standalone: true,
  template: `@if (solid()) {
      <svg:defs>
        <svg:mask
          [attr.id]="maskId"
          maskUnits="userSpaceOnUse"
          x="-2"
          y="-2"
          width="28"
          height="28"
        >
          <svg:rect x="-2" y="-2" width="28" height="28" fill="#fff" />
          <svg:g
            fill="none"
            stroke="#000"
            stroke-linecap="round"
            stroke-linejoin="round"
            [attr.stroke-width]="drawing().strokeWidth"
          >
            @for (d of symbol(); track $index) {
              <svg:path [attr.d]="d" />
            }
          </svg:g>
        </svg:mask>
      </svg:defs>
    }
    <svg:g [attr.transform]="transform()">
      @if (solid()) {
        <svg:path
          [attr.d]="drawing().paths[0]"
          fill="currentColor"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          [attr.stroke-width]="drawing().strokeWidth"
          [attr.mask]="'url(#' + maskId + ')'"
        />
      } @else {
        @for (d of drawing().paths; track $index) {
          <svg:path [attr.d]="d" />
        }
      }
    </svg:g>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    focusable: 'false',
    'data-part': 'glyph',
    '[attr.data-glyph]': 'name()',
    '[attr.viewBox]': 'viewBox',
    '[attr.data-solid]': "solid() ? '' : null",
    '[attr.fill]': "solid() ? null : stroked() ? 'none' : 'currentColor'",
    '[attr.stroke]': "!solid() && stroked() ? 'currentColor' : null",
    '[attr.stroke-width]': '!solid() && stroked() ? drawing().strokeWidth : null',
    '[attr.stroke-linecap]': "!solid() && stroked() ? 'round' : null",
    '[attr.stroke-linejoin]': "!solid() && stroked() ? 'round' : null",
  },
})
export class SlGlyph {
  /** One of the library's own icons: its glyph token without `--slotted-icon-`. */
  readonly name = input.required<GlyphName>();
  /**
   * The first shape filled and the symbol cut out of it — a tone's status
   * mark. For glyphs whose first shape encloses the rest (`circle-*`,
   * `triangle-alert`).
   */
  readonly solid = input(false, { transform: booleanAttribute });

  protected readonly maskId = `sl-glyph-${String((sequence += 1))}`;

  protected readonly viewBox = GLYPH_VIEW_BOX;
  protected readonly drawing = computed<GlyphDrawing>(() => GLYPHS[this.name()]);
  protected readonly symbol = computed(() => this.drawing().paths.slice(1));
  protected readonly stroked = computed(() => this.drawing().paint === 'stroke');
  protected readonly transform = computed(() => {
    const [dx, dy] = this.drawing().offset;
    return dx === 0 && dy === 0 ? null : `translate(${dx} ${dy})`;
  });
}
