export type LinkUnderline = 'always' | 'hover' | 'none';
export type LinkVariant = 'accent' | 'neutral' | 'inverse';

/**
 * The zero-width character whose only job is to forbid a line break. It keeps
 * the marker with the last word of the link, and unlike a no-break space it
 * carries no width of its own — the distance between word and glyph is the
 * stylesheet's decision, not this string's.
 */
export const WORD_JOINER = '\u2060';

export const LINK_DEFAULT_EXTERNAL_HINT = '(opens in a new tab)';
export const LINK_DEFAULT_UNDERLINE: LinkUnderline = 'always';
export const LINK_DEFAULT_VARIANT: LinkVariant = 'accent';
