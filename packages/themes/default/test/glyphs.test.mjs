import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const theme = JSON.parse(await readFile(new URL('../src/theme.json', import.meta.url), 'utf8'));

const GLYPHS = [
  '--slotted-icon-check',
  '--slotted-icon-minus',
  '--slotted-icon-dot',
  '--slotted-icon-x',
  '--slotted-icon-chevron-right',
  '--slotted-icon-chevron-down',
];

function payloadFor(name) {
  const value = theme.base[name];
  assert.ok(value !== undefined, `${name} is missing`);

  const match = /^url\("data:image\/svg\+xml,([^"]*)"\)$/.exec(value);
  assert.ok(match, `${name} is not a complete SVG data URI`);
  return match[1];
}

test('every glyph has a fully encoded, complete SVG payload a mask can use', () => {
  for (const name of GLYPHS) {
    const payload = payloadFor(name);
    assert.doesNotMatch(payload, /[<>#]/, `${name} leaves SVG syntax unencoded`);

    const svg = decodeURIComponent(payload);
    assert.match(svg, /^<svg\b[^>]*>[\s\S]*<\/svg>$/, `${name} is not a complete SVG document`);
  }
});

test('every glyph uses black or none only for its mask alpha geometry', () => {
  for (const name of GLYPHS) {
    const svg = decodeURIComponent(payloadFor(name));
    const attributes = [...svg.matchAll(/\b(fill|stroke)=['"]([^'"]+)['"]/g)];
    assert.ok(attributes.length > 0, `${name} has no fill or stroke alpha geometry`);

    for (const [, attribute, value] of attributes) {
      assert.ok(
        value === 'black' || value === 'none',
        `${name} uses ${value} for ${attribute}, not black or none mask alpha geometry`,
      );
    }
  }
});

test('every glyph declares the same viewBox, so one size rule fits all', () => {
  for (const name of GLYPHS) {
    const svg = decodeURIComponent(payloadFor(name));
    assert.ok(svg.includes("viewBox='0 0 24 24'"), `${name} has a foreign viewBox`);
  }
});
