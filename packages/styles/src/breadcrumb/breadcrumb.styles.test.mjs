import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/breadcrumb/contract.json', import.meta.url),
    'utf8',
  ),
);
const css = readFileSync(new URL('./breadcrumb.css', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
const normalized = declarations.replace(/\s+/g, '');

test('lives in the component layer', () => {
  assert.match(css, /@layer slotted\.components/);
});

test('styles every part the contract declares', () => {
  for (const part of contract.members.breadcrumb.parts) {
    const selector = part === 'root' ? "[data-ui='breadcrumb']{" : `[data-part='${part}']`;
    assert.ok(normalized.includes(selector), `Missing part ${part}`);
  }
});

test('reacts to every state the contract declares', () => {
  assert.ok(normalized.includes("[data-part='link']:not([data-disabled]):hover"));
  assert.ok(normalized.includes("[data-part='link']:not([data-disabled]):active"));
  assert.ok(normalized.includes("[data-part='link']:focus-visible"));
  assert.ok(normalized.includes("[data-part='item'][hidden]{display:none"));
});

/**
 * The APG example draws the separator in CSS so it never reaches the
 * accessibility tree, and rule 3 of `docs/token-foundation.md` forbids drawing
 * an icon from a character. A rotated rule is neither: it is geometry, it
 * carries no glyph token, and it stops being drawn the moment a consumer puts
 * their own mark inside the element.
 */
test('draws the separator as geometry and yields to the consumer content', () => {
  assert.ok(normalized.includes("[data-part='separator']:empty{"));
  assert.ok(normalized.includes('rotate:var(--slotted-breadcrumb-separator-skew,20deg)'));
  assert.ok(!/mask-image/.test(declarations), 'the trail owns no glyph');
});

test('mirrors the separator with the direction that applies to it', () => {
  assert.ok(normalized.includes("[data-part='separator']:empty:dir(rtl)"));
  assert.ok(
    !/\[dir=/.test(declarations),
    'an ancestor attribute is not the element directionality',
  );
});

/**
 * A crumb loses characters because the trail ran out of room, not because it
 * passed a number the stylesheet invented. The row wraps first, and the string
 * stays in the DOM either way.
 */
test('truncates against the trail rather than against a measure it chose', () => {
  assert.ok(normalized.includes('max-inline-size:var(--slotted-breadcrumb-item-measure,100%)'));
  assert.ok(normalized.includes('text-overflow:ellipsis'));
  assert.ok(normalized.includes('flex-wrap:wrap'));
});

/**
 * The ellipsis is the character U+2026 rendered as text, so the family carries
 * no artwork for it and nothing to repaint when the system takes the palette.
 * The button is a real target in both axes, which three characters never are.
 */
test('gives the ellipsis a whole target and no artwork', () => {
  assert.ok(
    normalized.includes(
      "[data-part='ellipsis']{align-items:center;appearance:none;background:none;block-size:var(--slotted-breadcrumb-ellipsis-size,var(--slotted-target-min,24px))",
    ),
  );
  assert.ok(
    normalized.includes(
      'inline-size:var(--slotted-breadcrumb-ellipsis-size,var(--slotted-target-min,24px))',
    ),
  );
});

/**
 * A crumb is text with no border for the ring to clear, and the ellipsis is a
 * button box. Two distances, and the second is the larger.
 */
test('hugs a crumb closer than it hugs the ellipsis', () => {
  assert.ok(normalized.includes('outline-offset:var(--slotted-breadcrumb-focus-ring-offset,1px)'));
  assert.ok(
    normalized.includes('outline-offset:var(--slotted-breadcrumb-ellipsis-focus-ring-offset,2px)'),
  );
});

test('paints the current page from the platform attribute, without a mirror', () => {
  assert.ok(normalized.includes("[data-part='page']{"));
  assert.ok(!normalized.includes('data-current'), 'the family declares no current mirror');
});

/**
 * The separator is the one thing the family paints, and a painted surface is
 * replaced by the page's own background once the system takes the palette.
 * Everything else here is text, which is never removed.
 */
test('restates only what forced colours would take away', () => {
  assert.ok(normalized.includes('@media(forced-colors:active)'));
  assert.ok(
    /@media\(forced-colors:active\)\{\[data-ui='breadcrumb'\]\[data-part='separator'\]:empty\{background-color:GrayText/.test(
      normalized,
    ),
  );
});

test('never paints text with a fill role', () => {
  assert.ok(!/tone-[a-z]+-solid/.test(declarations), 'a solid fill is not a text colour');
});
