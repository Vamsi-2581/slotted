import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/alert/contract.json', import.meta.url),
    'utf8',
  ),
);
const css = readFileSync(new URL('./alert.css', import.meta.url), 'utf8');
const fragment = readFileSync(new URL('./alert.harness.html', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
/**
 * Whitespace is collapsed rather than removed: a descendant selector and a
 * multi-word value both lose their meaning when every space goes. Parentheses
 * are collapsed too, because the formatter breaks a long value across lines and
 * leaves `var( --token`, which no assertion here spells.
 */
const normalized = declarations
  .replace(/\s+/g, ' ')
  .replace(/\s*([{};,:>])\s*/g, '$1')
  .replace(/\(\s+/g, '(')
  .replace(/\s+\)/g, ')');

const ui = `[data-ui='${contract.ui}']`;
const root = `${ui}[data-part='root']`;

/** The declarations of the first rule whose selector starts with `selector`. */
function rule(selector) {
  return normalized.split(`${selector}{`)[1]?.split('}')[0] ?? '';
}

test('lives in the component layer', () => {
  assert.match(css, /@layer slotted\.components/);
});

test('is selected by the identifier the contract declares', () => {
  assert.ok(normalized.includes(`${root}{`), 'the family has no base rule keyed on data-ui');
});

test('styles every part the contract declares', () => {
  for (const part of contract.members.alert.parts) {
    assert.ok(normalized.includes(`[data-part='${part}']`), `no rule reaches the ${part} part`);
  }
});

/**
 * The layout decision the anatomy rests on. `content` is the live region, so
 * the actions and the dismiss control cannot be inside it — they are placed in
 * the grid as siblings, and a stylesheet that nested them would be describing a
 * different family from the one the contract declares.
 */
test('places the actions and the dismiss control outside the region that announces', () => {
  for (const part of ['icon', 'content', 'actions', 'dismiss']) {
    assert.ok(
      normalized.includes(`${ui}>[data-part='${part}']`),
      `${part} is not placed as a child of the root`,
    );
  }
  assert.match(rule(`${ui}>[data-part='content']`), /grid-column:2/);
  assert.match(rule(`${ui}>[data-part='actions']`), /grid-column:2/);
  assert.match(rule(`${ui}>[data-part='actions']`), /grid-row:2/);
  assert.match(rule(`${ui}>[data-part='dismiss']`), /grid-column:3/);
});

/**
 * A fixed two-row template would leave a row gap under every alert with no
 * actions, which is the defect the first draft of this grid had. The row is
 * implicit, so it exists only when something is placed in it.
 */
test('creates the row of actions only when there are actions', () => {
  assert.match(rule(root), /grid-template-columns:auto minmax\(0,1fr\) auto/);
  assert.ok(!/grid-template-areas/.test(normalized), 'a fixed template reserves an empty row');
});

test('gives every tone the mark the contract maps it to', () => {
  for (const [tone, glyph] of Object.entries(contract.toneGlyphs)) {
    const declarations = rule(`${root}[data-tone='${tone}']`);
    assert.ok(declarations.length > 0, `${tone} has no rule`);
    assert.ok(declarations.includes(`--_glyph:var(${glyph})`), `${tone} draws the wrong mark`);
    assert.ok(
      declarations.includes(`--_text:var(--slotted-tone-${tone}-text)`),
      `${tone} does not take its own text role`,
    );
  }
});

/**
 * The mark is geometry rather than a character, and it is the title's own size
 * on the title's first line (R5): a square of `1em` — the root's font size is
 * the title's — pushed down by half the difference between one line and the
 * mark, so it lands on the message's first line at every reach and every
 * density and stays there when the title wraps. The escape hatch is the outer
 * half of the `var()`, so an application with its own icon set keeps the tone,
 * the size and the alignment. `packages/styles/src/status-mark.test.mjs` holds
 * the same rule for every family that draws one.
 */
test('draws the mark as a mask, the title’s size, on the title’s first line', () => {
  assert.match(rule(root), /--_mark-size:1em/);
  const icon = rule(`${ui}>[data-part='icon']`);
  assert.match(icon, /mask-image:var\(--slotted-alert-icon,var\(--_glyph\)\)/);
  assert.match(icon, /align-self:start/);
  assert.match(icon, /block-size:var\(--_mark-size\)/);
  assert.match(icon, /inline-size:var\(--_mark-size\)/);
  assert.match(icon, /margin-block-start:calc\(\(1lh - var\(--_mark-size\)\) \/ 2\)/);
  assert.match(icon, /background-color:currentcolor/);
  assert.ok(!/content:'[^']/.test(icon), 'the mark is drawn with a character');
});

test('paints one tone three ways, and gives soft an edge of its own', () => {
  for (const variant of contract.axes.variant) {
    assert.ok(rule(`${root}[data-variant='${variant}']`).length > 0, `${variant} has no rule`);
  }
  /* In `high-contrast` the tone surfaces are the page's own white, so a soft
     alert with no edge is coloured text with no box around it. */
  assert.match(rule(`${root}[data-variant='soft']`), /border-color:var\(--_border\)/);
  assert.match(rule(`${root}[data-variant='solid']`), /color:var\(--_on-solid\)/);
});

/**
 * A page banner runs to both edges of what holds it, so it draws no corner and
 * no inline edge and keeps the one edge that separates it from the page below.
 */
test('takes the corners off the reach that runs to the edges', () => {
  const page = rule(`${root}[data-reach='page']`);
  assert.match(page, /--_radius:var\(--slotted-alert-radius,0\)/);
  assert.match(page, /border-inline-width:0/);
  assert.match(page, /border-block-start-width:0/);
});

test('scales its type and its dismiss glyph with density, through the control scales', () => {
  for (const [reach, step] of [
    ['inline', 'sm'],
    ['page', 'lg'],
  ]) {
    const declarations = rule(`${root}[data-reach='${reach}']`);
    assert.ok(
      declarations.includes(`--_font-size:var(--slotted-control-font-size-${step}`),
      `${reach} does not read the control type scale`,
    );
    assert.ok(
      declarations.includes(`--_glyph-size:var(--slotted-control-icon-size-${step}`),
      `${reach} does not read the control glyph scale`,
    );
  }
});

/**
 * R2 and WCAG 2.2 2.5.8. The dismiss control is an inner control, not a
 * button: its box is the glyph plus a step of air on each side, floored at
 * `--slotted-target-min` rather than at a control height — a literal here
 * would be correct today and unhittable on a touch screen.
 */
test('sizes the dismiss control from its glyph, floored at the target minimum', () => {
  assert.match(
    rule(root),
    /--_dismiss-size:var\(--slotted-alert-dismiss-size,max\(var\(--slotted-target-min,24px\),calc\(var\(--_glyph-size\) \+ 2 \* var\(--slotted-space-2,0\.25rem\)\)\)\)/,
  );
  const dismiss = rule(`${ui}>[data-part='dismiss']`);
  assert.match(dismiss, /block-size:var\(--_dismiss-size\)/);
  assert.match(dismiss, /inline-size:var\(--_dismiss-size\)/);
});

/**
 * `states.test.mjs` refuses an unguarded weak state across the whole package;
 * this states the same rule about this family in particular, because the guard
 * that is right here is `:enabled` rather than an attribute — the control the
 * states belong to is a real button.
 */
test('holds hover and press back for a control the browser has refused', () => {
  for (const selector of normalized.matchAll(/(^|\})([^{}@]+)\{/g)) {
    for (const part of (selector[2] ?? '').split(',')) {
      if (!/:hover|:active(?![-\w])/.test(part)) continue;
      assert.ok(part.includes(':enabled'), `"${part.trim()}" paints a weak state unguarded`);
    }
  }
});

/**
 * The ring on the control is inset because the control sits at the corner of
 * the box, and a ring outside it would be drawn over the border or clipped by
 * it. The ring on the box itself is outside, and it exists because the root is
 * a programmatic focus destination.
 */
test('draws a focus ring on the control and on the box, and insets only one', () => {
  assert.match(
    rule(`${ui}>[data-part='dismiss']:focus-visible`),
    /outline-offset:calc\(-1 ?\* ?var\(--slotted-focus-ring-width/,
  );
  assert.match(rule(`${root}:focus-visible`), /outline-offset:var\(--slotted-focus-ring-offset/);
});

/**
 * The box does not own the moment it is inserted, so it animates only its
 * departure. `display` rides along so the box holds its place until the fade is
 * over instead of snapping out from under the content below it.
 */
test('animates the message leaving and never the message arriving', () => {
  assert.match(rule(root), /transition-behavior:allow-discrete/);
  assert.ok(rule(root).includes('display var(--slotted-duration-short)'));
  assert.ok(!/@starting-style/.test(declarations), 'an entry transition fires on first paint');
  const closed = rule(`${root}[hidden]`);
  assert.match(closed, /display:none/);
  assert.match(closed, /opacity:0/);
});

/**
 * Two composition changes that answer the box rather than the window, and a
 * container the family names itself — an alert inside a card inside a page
 * would otherwise resolve against whichever ancestor happened to be a
 * container first.
 */
test('answers its own inline size, in a container it owns', () => {
  assert.match(rule(root), /container-type:inline-size/);
  assert.match(rule(root), /container-name:slotted-alert/);
  /* `contain: inline-size` makes the intrinsic width zero, so a box placed in
     a column that shrink-wraps its children collapses to one character wide
     unless the width is stated. Found in the rendered page, not in a test. */
  assert.match(rule(root), /inline-size:100%/);
  const queries = [...css.matchAll(/@container slotted-alert \(([^)]+)\)/g)].map(
    ([, query]) => query,
  );
  assert.deepEqual(queries, ['max-width: 22rem', 'min-width: 40rem']);
});

/**
 * The theme remaps every colour a family reads, so a family writes a forced
 * colours rule only for something the theme cannot reach. Here that is two
 * things: a border painted in its own transparent fill, which the system does
 * not remap, and a masked glyph, which has no colour of its own at all.
 */
test('keeps an edge and a silhouette when the system takes the palette', () => {
  const block = css.slice(css.indexOf('forced-colors: active'));
  assert.match(block, /border-color:\s*CanvasText/);
  assert.match(block, /background-color:\s*CanvasText/);
});

/* ── The fragment, which is the third place this DOM is written ─────────── */

test('renders every part the contract declares in at least one scene', () => {
  for (const part of contract.members.alert.parts) {
    assert.match(fragment, new RegExp(`data-part="${part}"`), `no scene renders the ${part} part`);
  }
});

test('renders every value of every painted axis', () => {
  for (const axis of ['tone', 'variant', 'reach']) {
    for (const value of contract.axes[axis]) {
      assert.match(
        fragment,
        new RegExp(`data-${axis}="${value}"`),
        `no scene renders ${axis}="${value}"`,
      );
    }
  }
});

/**
 * The rule the family exists for, checked in the markup rather than described
 * in a comment: the live role is written on `content`, and the two interactive
 * parts are that element's siblings.
 */
test('writes the live role on the text and on nothing else', () => {
  for (const [live, role] of Object.entries(contract.liveRoles)) {
    if (role === null) continue;
    assert.match(
      fragment,
      new RegExp(`data-part="content" role="${role}"`),
      `no scene announces with live="${live}"`,
    );
  }
  for (const match of fragment.matchAll(/<[^>]*\brole="(status|alert)"[^>]*>/g)) {
    assert.match(match[0], /data-part="content"/, `${match[0]} announces and is not the text`);
  }
});

/**
 * The box is a landmark rather than a live region, and the title is what names
 * it. A `section` with no accessible name is a plain grouping element, which is
 * why an alert with no title is allowed to carry no `aria-labelledby`.
 */
test('names the landmark with the title the message already has', () => {
  const titled = [...fragment.matchAll(/<section\s+data-ui="alert"[\s\S]*?<\/section>/g)].filter(
    (match) => match[0].includes('data-part="title"'),
  );
  assert.ok(titled.length > 0, 'no scene renders a titled alert');
  for (const [markup] of titled) {
    const labelled = /aria-labelledby="([^"]+)"/.exec(markup);
    if (labelled === null) continue;
    assert.match(
      markup,
      new RegExp(`data-part="title" id="${labelled[1]}"`),
      'the label points at something other than the title',
    );
  }
});

test('makes the box a programmatic focus destination and never a tab stop', () => {
  assert.match(fragment, /tabindex="-1"/);
  assert.ok(!/tabindex="0"/.test(fragment), 'the box is in the tab sequence');
});
