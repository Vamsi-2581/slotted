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
 * their own mark inside the element. The one glyph the trail does own is the
 * ellipsis, which is the mark of a control and not the shape of a rule, and it
 * is the Glyph element the binding renders, not a mask.
 */
test('draws the separator as geometry and yields to the consumer content', () => {
  assert.ok(normalized.includes("[data-part='separator']:empty{"));
  assert.ok(normalized.includes('rotate:var(--slotted-breadcrumb-separator-skew,20deg)'));
  assert.ok(!declarations.includes('mask'), 'the stylesheet paints no glyph');
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
 * The mark is the `ellipsis` Glyph element in an icon box at the control glyph
 * size,
 * so nothing about it depends on the metrics of the font the page loaded — the
 * exception to rule 3 of `docs/token-foundation.md` that this control used to
 * take is closed (BC2). The box still keeps the trail's own type, because
 * `1lh` is the trail's line and that is what puts the control on the crumbs'
 * line (BC1). It is the control glyph plus a step of air wide, capped at the
 * inner-control size (R2), and a real target in both axes — the halo around
 * the paint completes the minimum where the line is shorter than it.
 */
test('sets the ellipsis on the crumbs’ line, with a whole target and a glyph', () => {
  const ellipsis = normalized.slice(normalized.indexOf("[data-part='ellipsis']{"));
  assert.ok(ellipsis.includes('block-size:1lh;'));
  assert.ok(
    ellipsis.includes(
      'inline-size:max(var(--slotted-target-min,24px),min(calc(var(--_icon-size)+2*var(--slotted-space-2,0.25rem)),var(--_inner-size)))',
    ),
  );
  assert.ok(ellipsis.includes('font:inherit;'), 'the box keeps the trail’s own line');
  assert.ok(!ellipsis.includes('translate:'), 'nothing lifts the mark off its own centre');
  assert.ok(
    ellipsis.startsWith("[data-part='ellipsis']{--slotted-icon-size:var(--_icon-size);"),
    'the box inside is sized at the glyph scale’s own size',
  );
  assert.ok(!normalized.includes("[data-part='ellipsis']::before"), 'no pseudo-element icon');
  assert.ok(
    normalized.includes(
      "[data-part='ellipsis']::after{content:'';inset:min(0px,calc((100%-var(--slotted-target-min,24px))/2));position:absolute",
    ),
    'the target is completed behind the mark, not by it',
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
