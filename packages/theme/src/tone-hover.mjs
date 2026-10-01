/**
 * The hover step of a filled tone, derived from its resting fill rather than
 * chosen beside it.
 *
 * A hovered control lightens: the fill moves a fixed share of the way toward
 * white in OKLCH, which is what `color-mix(in oklch, <solid>, white <share>)`
 * computes — a share of the lightness, the same share off the chroma, and the
 * hue untouched, because white has none to contribute. The share is per
 * scheme: a fill on a light page needs a smaller step to read than the same
 * fill on a dark one. Every theme reads the rule from here so that a theme
 * with a different accent gets the same hover for it, and no family retunes
 * the step for itself.
 *
 * A fill that is already white, or a step from it, has no lighter step to
 * take. It moves the same share toward black instead, which is the only
 * direction left: a neutral filled control on the light scheme and the white
 * fill of the high-contrast scheme keep a hover the pointer can see. The
 * threshold is the lightness above which a 6% move toward white is under a
 * just-noticeable difference on a white page.
 */
export const HOVER_SHARE = { light: 0.06, dark: 0.08, 'high-contrast': 0.06 };
export const LIGHTEST_HOVERABLE = 0.9;

function toLinear(channel) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function toGamma(value) {
  const clamped = Math.min(1, Math.max(0, value));
  return clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055;
}

/** sRGB hex to OKLab, by the reference matrices Björn Ottosson published. */
export function toOklab(hex) {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!match) throw new Error(`Expected a literal six-digit hex colour, received ${hex}`);
  const [r, g, b] = match.slice(1).map((pair) => toLinear(Number.parseInt(pair, 16)));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

export function toHex({ L, a, b }) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const channels = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return `#${channels
    .map((channel) =>
      Math.round(toGamma(channel) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/** `color-mix(in oklch, <hex>, white <share>)`, with `share` toward black for a fill with no lighter step. */
function mix(hex, share) {
  const { L, a, b } = toOklab(hex);
  const target = L > LIGHTEST_HOVERABLE ? 0 : 1;
  return toHex({ L: L * (1 - share) + target * share, a: a * (1 - share), b: b * (1 - share) });
}

/**
 * The hover step of a fill: the scheme's share toward white, or as far toward
 * white as the label's ratio allows. A fill whose label is already at the
 * ratio the scheme promises — `dark` puts white on `#2563eb` at 4.7:1 — cannot
 * take the whole step without taking the label below it, so the share is
 * walked back in half-percent steps until the ratio holds again. The theme's
 * contrast test is what decides the ratio, and this is what keeps the hover
 * rule and that test from disagreeing about a colour.
 */
export function hoverOf(hex, scheme, { onSolid, ratio, contrast } = {}) {
  const full = HOVER_SHARE[scheme];
  if (full === undefined) throw new Error(`No hover share is defined for the ${scheme} scheme`);
  if (onSolid === undefined) return mix(hex, full);
  for (let share = full; share > 0; share -= 0.005) {
    const candidate = mix(hex, Number(share.toFixed(3)));
    if (contrast(candidate, onSolid) >= ratio) return candidate;
  }
  return hex;
}

/** The share a hover actually took, for a theme's own tests to state. */
export function shareOf(solid, hover) {
  const { L } = toOklab(solid);
  const target = L > LIGHTEST_HOVERABLE ? 0 : 1;
  return (toOklab(hover).L - L) / (target - L);
}
