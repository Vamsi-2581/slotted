import type { GLYPHS } from './glyphs';

export { GLYPH_VIEW_BOX } from './glyph';
export type { GlyphDrawing } from './glyph';
export { GLYPHS } from './glyphs';

/** The name of one of the library's own icons: its glyph token without `--slotted-icon-`. */
export type GlyphName = keyof typeof GLYPHS;
