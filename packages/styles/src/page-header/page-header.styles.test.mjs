import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/page-header/contract.json', import.meta.url),
    'utf8',
  ),
);
const css = readFileSync(new URL('./page-header.css', import.meta.url), 'utf8');
const fragment = readFileSync(new URL('./page-header.harness.html', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
const normalized = declarations
  .replace(/\s+/g, ' ')
  .replace(/\s*([{};,:>~+])\s*/g, '$1')
  .replace(/\(\s+/g, '(')
  .replace(/\s+\)/g, ')');

const ui = `[data-ui='${contract.ui}']`;
const member = contract.members.pageHeader;

function rule(selector) {
  return normalized.split(`${selector}{`)[1]?.split('}')[0] ?? '';
}

test('lives in the component layer', () => {
  assert.match(css, /@layer slotted\.components/);
});

test('is selected by the identifier the contract declares', () => {
  assert.ok(normalized.includes(`${ui}{`), 'the family has no base rule keyed on data-ui');
});

test('styles every part the contract declares', () => {
  for (const declared of member.parts) {
    if (declared === 'root') continue;
    assert.ok(
      normalized.includes(`[data-part='${declared}']`),
      `no rule reaches the ${declared} part`,
    );
  }
});

test('renders every part the contract declares, in at least one scene', () => {
  for (const declared of member.parts) {
    assert.match(
      fragment,
      new RegExp(`data-part="${declared}"`),
      `${declared} appears in no scene`,
    );
  }
});

/**
 * The mechanics of the contract's `sticky`: the root sticks with a negative
 * offset the size of the header area, the title area at 0 inside it, and
 * pinned or revealed the root's offset is 0.
 */
test('sticks the root with a negative offset and the title area at zero', () => {
  const root = rule(ui);
  assert.match(root, /position:sticky/);
  assert.match(root, /inset-block-start:calc\(-1 \* var\(--slotted-page-header-collapse,0px\)\)/);
  assert.match(root, /overflow-anchor:none/);
  const titleArea = rule(`${ui}>*>[data-part='title-area']`);
  assert.match(titleArea, /position:sticky/);
  assert.match(titleArea, /inset-block-start:0/);
  assert.match(titleArea, /z-index:2/);
  /* Revealed, manual, or pinned: the root's offset is zero and the whole header stays. */
  const held = rule(
    `${ui}[data-revealed],${ui}[data-collapse='manual'],${ui}:has([data-part='pin'][data-pressed])`,
  );
  assert.match(held, /inset-block-start:0/);
});

/** The root keeps its box. */
test('keeps a box on the root rather than dissolving it', () => {
  assert.doesNotMatch(normalized, /display:contents/);
  const root = rule(ui);
  assert.match(root, /container-type:inline-size/);
  assert.match(root, /container-name:page-header/);
  assert.match(root, /background-color:var\(--_ground\)/);
});

/**
 * Collapsed by the control the area is a 0fr row, and only then: scrolled
 * out, the offset is what hides it, and a 0fr row would jump the scroll.
 */
test('collapses by the control as a grid track, and never while scrolled out', () => {
  const area = rule(`${ui}>*>[data-part='header-area']`);
  assert.match(area, /grid-template-rows:1fr/);
  assert.match(area, /transition:grid-template-rows var\(--_duration\)/);
  const collapsed = rule(
    `${ui}:not([data-expanded]):not([data-scrolled])>*>[data-part='header-area']`,
  );
  assert.match(collapsed, /grid-template-rows:0fr/);
  assert.ok(
    !normalized.includes(`${ui}:not([data-expanded])>*>[data-part='header-area']{`),
    'a rule collapses the area whenever expanded is false, scrolled or not',
  );
});

/** The shadow enters with a transition and leaves without one. */
test('floats the chrome only while the header area is out of sight', () => {
  assert.match(rule(`${ui}:not([data-expanded])`), /box-shadow:var\(--_shadow\)/);
  assert.match(rule(ui), /box-shadow var\(--slotted-duration-short/);
  assert.doesNotMatch(rule(`${ui}[data-expanded]`), /box-shadow/);
});

/** One attribute where Fiori has seven slots. */
test('shows a child of the title area in one state only through data-when', () => {
  assert.ok(
    normalized.includes(
      `${ui}[data-expanded]>*>[data-part='title-area'] [data-part][data-when='snapped'][data-when],${ui}:not([data-expanded])>*>[data-part='title-area'] [data-part][data-when='expanded'][data-when]{display:none;}`,
    ),
    'data-when is not honoured for both values',
  );
  /* Five attribute selectors, and after the heading's own display rule. */
  assert.ok(
    normalized.indexOf("[data-part][data-when='snapped'][data-when]") >
      normalized.indexOf("[data-part='heading']{-webkit-box-orient"),
    'the data-when rule comes before the heading rule it has to outweigh',
  );
});

/** The marks are drawn from the glyph scale, and the one that points is mirrored. */
test('draws its marks from glyph tokens rather than characters, and mirrors the arrow', () => {
  for (const glyph of Object.values(contract.glyphs)) {
    assert.match(normalized, new RegExp(`mask-image:var\\(${glyph}\\)`), `${glyph} is not drawn`);
  }
  assert.doesNotMatch(normalized, /content:'[^']+'/, 'a mark is drawn with a character');
  const back = rule(
    `${ui}>*>[data-part='title-area']>[data-part='nav']>[data-part='back']:dir(rtl)::before`,
  );
  assert.match(back, /scale:-1 1/);
  const toggle = rule(
    `${ui}[data-expanded]>*>[data-part='controls']>*>[data-part='toggle']::before`,
  );
  assert.match(toggle, /rotate:180deg/);
});

/**
 * The two inner controls are the family's own (R2): a ring in the theme's
 * colour, a reach to the target minimum, and a hover that moves the ground
 * and nothing else, held back for a disabled control.
 */
test('draws the toggle and the pin as inner controls with a ring and a reachable target', () => {
  const controls = rule(
    `${ui}>*>[data-part='controls']>*>[data-part='toggle'],${ui}>*>[data-part='controls']>*>[data-part='pin']`,
  );
  assert.match(controls, /min-block-size:var\(--slotted-target-min,24px\)/);
  assert.match(controls, /min-inline-size:var\(--slotted-target-min,24px\)/);
  const ring = rule(
    `${ui}>*>[data-part='controls']>*>[data-part='toggle']:focus-visible,${ui}>*>[data-part='controls']>*>[data-part='pin']:focus-visible`,
  );
  assert.match(
    ring,
    /outline:var\(--slotted-focus-ring-width,2px\) solid var\(--slotted-focus-ring-color,Highlight\)/,
  );
  const hover = rule(
    `${ui}>*>[data-part='controls']>*>[data-part='toggle']:not(:disabled):hover,${ui}>*>[data-part='controls']>*>[data-part='pin']:not(:disabled):hover`,
  );
  assert.match(hover, /background-color:var\(--slotted-tone-secondary-subtle-hover/);
});

/** The pill straddles the chrome's edge from a zero-height row after the header area. */
test('places the controls on a zero-height row that carries the rule', () => {
  const row = rule(`${ui}>*>[data-part='controls']`);
  assert.match(row, /block-size:0/);
  assert.match(row, /border-block-start:var\(--_rule-size\) solid var\(--_rule\)/);
  assert.match(row, /position:relative/);
  const pill = rule(`${ui}>*>[data-part='controls']>*`);
  assert.match(pill, /position:absolute/);
  assert.match(pill, /translate:0 -50%/);
  assert.match(
    fragment,
    /data-part="header-area"[\s\S]*data-part="controls"[\s\S]*data-part="tabs"/,
  );
});

/** The snapped heading is one line, a step smaller; expanded it clamps at three. */
test('clamps the heading at three lines expanded and one line snapped', () => {
  const heading = rule(
    `${ui}>*>[data-part='title-area']>[data-part='title-row']>[data-part='title']>[data-part='heading']`,
  );
  assert.match(heading, /-webkit-line-clamp:3/);
  assert.match(heading, /font-size:var\(--_heading-size\)/);
  const snapped = rule(
    `${ui}:not([data-expanded])>*>[data-part='title-area']>[data-part='title-row']>[data-part='title']>[data-part='heading']`,
  );
  assert.match(snapped, /white-space:nowrap/);
  assert.match(snapped, /text-overflow:ellipsis/);
  assert.match(snapped, /display:block/);
  assert.match(snapped, /font-size:var\(--_snapped-heading-size\)/);
});

/** The placeholder is skeleton's; this sheet says only how wide it is. */
test('paints no placeholder of its own while loading', () => {
  assert.doesNotMatch(normalized, /animation:/);
  assert.match(
    rule(
      `${ui}[data-loading]>*>[data-part='title-area']>[data-part='title-row']>[data-part='title']>[data-part='heading']`,
    ),
    /--slotted-skeleton-inline-size:12ch/,
  );
  assert.match(fragment, /data-loading[\s\S]*data-ui="skeleton"/);
});

/** The family answers its own width, not the viewport's. */
test('reorders below 640 pixels by container query', () => {
  assert.match(normalized, /@container page-header \(width < 640px\)/);
  assert.doesNotMatch(normalized, /@media \(max-width/);
});

/** Masked glyphs survive forced colours. */
test('keeps its masked glyphs under forced colours', () => {
  assert.match(normalized, /@media \(forced-colors:active\)\{[^}]*forced-color-adjust:none/);
});

/**
 * Nothing the family owns is reached with a descendant combinator from the
 * root, because what the consumer projects is other families with parts of
 * the same names — a description-list has a `description`, a card has
 * `actions`.
 */
test('reaches its own parts with child combinators only', () => {
  for (const part of ['description', 'actions', 'heading', 'content', 'header']) {
    const descendant = new RegExp(`\\[data-ui='page-header'\\][^{]*? \\[data-part='${part}'\\]`);
    assert.ok(!descendant.test(normalized), `a descendant rule reaches ${part}`);
  }
});
