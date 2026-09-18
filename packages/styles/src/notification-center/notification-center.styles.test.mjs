import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/notification-center/contract.json', import.meta.url),
    'utf8',
  ),
);
const css = readFileSync(new URL('./notification-center.css', import.meta.url), 'utf8');
const fragment = readFileSync(
  new URL('./notification-center.harness.html', import.meta.url),
  'utf8',
);
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
const normalized = declarations
  .replace(/\s+/g, ' ')
  .replace(/\s*([{};,:>])\s*/g, '$1')
  .replace(/\(\s+/g, '(')
  .replace(/\s+\)/g, ')');

const ui = `[data-ui='${contract.ui}']`;
const member = contract.members.notificationCenter;
const item = `${ui}>[data-part='feed'] [data-part='item']`;

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
  assert.match(fragment, /role="feed"/);
  assert.match(fragment, /<article[^>]*data-part="item"[^>]*tabindex="0"/);
});

/**
 * The item is reached through the feed with a descendant combinator, because
 * it stands either directly in the feed or inside a group; every part inside
 * the item is reached from the item with a child combinator, because the
 * content the consumer projects is other families with parts of the same
 * names — a button has a `label`, a result-state a `title` and a `description`.
 */
test('reaches the parts inside an item with a child combinator', () => {
  for (const part of ['visual', 'content', 'controls']) {
    assert.ok(normalized.includes(`[data-part='item']>[data-part='${part}']`), part);
    assert.ok(
      !normalized.includes(`[data-part='item'] [data-part='${part}']`),
      `descendant ${part}`,
    );
  }
  for (const part of ['title', 'description', 'time', 'actions']) {
    assert.ok(normalized.includes(`>[data-part='content']>[data-part='${part}']`), part);
  }
  for (const part of ['read-toggle', 'dismiss']) {
    assert.ok(normalized.includes(`>[data-part='controls']>[data-part='${part}']`), part);
  }
});

/**
 * Unread says so with a wash mixed from the tone's text at the highlight
 * share and the semibold title; there is no dot and no fill. Read stands on the surface with the regular weight. The
 * tone is the item's, accent by default.
 */
test('paints unread with a wash and weight, and read with neither', () => {
  const root = rule(ui);
  assert.match(root, /--_tone-solid:var\(--slotted-tone-accent-solid/);
  assert.match(
    root,
    /--_unread-ground:color-mix\(in oklab,var\(--_tone-text\) calc\(var\(--slotted-highlight-tint-opacity,0\.075\) \* 100%\),transparent\)/,
  );
  assert.match(rule(`${item}:not([data-read])`), /background-color:var\(--_unread-ground\)/);
  assert.match(
    rule(`${item}:not([data-read])>[data-part='content']>[data-part='title']`),
    /font-weight:var\(--slotted-font-weight-semibold/,
  );
  for (const tone of ['secondary', 'success', 'warning', 'danger']) {
    assert.match(rule(`${item}[data-tone='${tone}']`), new RegExp(`--slotted-tone-${tone}-solid`));
  }
  assert.doesNotMatch(normalized, /\[data-part='unread'\]/);
  assert.match(fragment, /data-part="item"[^>]*\bdata-read\b/);
});

/**
 * A toned row without a consumer visual gets the family's: the tone's glyph
 * on the tone's surface, the size the avatar would be, the same read or not.
 * Every glyph is a circle; a triangle is refused in this library.
 */
test('draws the tone glyph as the visual when the consumer gives none', () => {
  const own = rule(`${item}>[data-part='visual'][data-tone]:empty`);
  assert.match(rule(`${item}>[data-part='visual']:empty:not([data-tone])`), /display:none/);
  assert.match(own, /background-color:var\(--_tone-surface\)/);
  assert.match(own, /border:var\(--_rule-size\) solid var\(--_tone-border\)/);
  assert.match(own, /color:var\(--_tone-text\)/);
  assert.match(own, /block-size:var\(--_visual\)/);
  assert.doesNotMatch(normalized, /--_tone-on-solid/);
  assert.doesNotMatch(normalized, /icon-triangle/);
  assert.match(
    rule(`${item}:not(:has(>[data-part='visual']))>[data-part='content']`),
    /grid-column:1 \/ 3/,
  );
  assert.match(
    rule(`${item}>[data-part='visual'][data-tone]:empty::before`),
    /mask-image:var\(--_tone-glyph\)/,
  );
  assert.match(rule(ui), /--_tone-glyph:var\(--slotted-icon-circle-info\)/);
  assert.match(rule(ui), /--_visual:var\(--slotted-avatar-size-sm,28px\)/);
  for (const [tone, glyph] of Object.entries(contract.toneGlyph)) {
    if (tone === 'reason' || tone === 'accent') continue;
    assert.match(rule(`${item}[data-tone='${tone}']`), new RegExp(`--slotted-icon-${glyph}`));
  }
  assert.match(
    rule(`${item}>[data-part='content']`),
    /margin-block-start:max\(0px,calc\(\(var\(--_visual\) - 1lh\) \/ 2\)\)/,
  );
});

/** The two controls the family draws: glyphs from the scale, a box on the inner-control scale, a halo to the target minimum. */
test('draws its two controls from glyph tokens on the inner-control scale', () => {
  const controls = `${item}>[data-part='controls']`;
  assert.match(
    rule(`${controls}>[data-part='read-toggle']::after`),
    /mask-image:var\(--slotted-icon-check\)/,
  );
  assert.match(
    rule(`${item}[data-read]>[data-part='controls']>[data-part='read-toggle']::after`),
    /mask-image:var\(--slotted-icon-dot\)/,
  );
  assert.match(
    rule(`${controls}>[data-part='dismiss']::after`),
    /mask-image:var\(--slotted-icon-x\)/,
  );
  assert.match(
    rule(ui),
    /--_control:min\(calc\(var\(--_glyph\) \+ 2 \* var\(--slotted-space-2,0\.25rem\)\),var\(--slotted-control-inner-size-md,24px\)\)/,
  );
  assert.match(
    rule(`${controls}>button::before`),
    /max\(var\(--_control\),var\(--slotted-target-min,24px\)\)/,
  );
  assert.doesNotMatch(normalized, /content:'[^']/);
});

/** A title that is a link covers the row; the controls stand above it. */
test('lets a linked title take the whole row and keeps the controls above it', () => {
  assert.match(
    rule(`${item}>[data-part='content']>a[data-part='title']::after`),
    /inset:0;position:absolute/,
  );
  assert.match(rule(`${item}>[data-part='controls']`), /z-index:1/);
  assert.match(rule(`${item}>[data-part='content']>[data-part='actions']`), /z-index:1/);
  assert.match(rule(item), /position:relative/);
});

test('clamps the title at two lines and the description at three, keeping the text', () => {
  assert.match(
    rule(`${item}>[data-part='content']>[data-part='title']`),
    /-webkit-line-clamp:var\(--slotted-notification-center-title-clamp,2\)/,
  );
  assert.match(
    rule(`${item}>[data-part='content']>[data-part='description']`),
    /-webkit-line-clamp:var\(--slotted-notification-center-description-clamp,3\)/,
  );
  assert.doesNotMatch(normalized, /text-overflow/);
});

/** The article is in the tab sequence and its ring is drawn inward, because the rows touch. */
test('draws the article ring inward and the controls ring outward', () => {
  assert.match(
    rule(`${item}:focus-visible`),
    /outline-offset:calc\(var\(--slotted-focus-ring-offset,2px\) \* -1\)/,
  );
  assert.match(
    rule(`${item}>[data-part='controls']>button:focus-visible`),
    /outline-offset:var\(--slotted-focus-ring-offset,2px\)/,
  );
});

/** Fresh and more are pills on the control scale, fresh in the accent pair, as timeline draws the same two. */
test('draws fresh in the accent pair and more in the secondary', () => {
  assert.match(
    rule(`${ui}>[data-part='fresh']`),
    /background-color:var\(--slotted-tone-accent-surface/,
  );
  assert.match(
    rule(`${ui}>[data-part='fresh']:enabled:hover`),
    /--slotted-tone-accent-subtle-hover/,
  );
  assert.match(rule(`${ui}>button[data-part='more']:enabled:hover`), /--_hover/);
  assert.match(rule(`${ui}>div[data-part='more']`), /text-align:center/);
});

/** Two sizes: the popover's and the page's. */
test('offers two sizes on the control and type scales', () => {
  assert.match(
    rule(ui),
    /--_title-size:var\(--slotted-notification-center-title-size-md,var\(--slotted-font-size-lg/,
  );
  assert.match(
    rule(`${ui}[data-size='sm']`),
    /--slotted-notification-center-title-size-sm,var\(--slotted-font-size-md/,
  );
  assert.match(rule(`${ui}[data-size='sm']`), /--slotted-control-inner-size-sm/);
});

/** Below 320 pixels the controls drop under the content rather than squeezing it; the one media query is forced colours. */
test('answers its own width and never the viewport', () => {
  assert.match(rule(ui), /container-name:notification-center/);
  assert.match(rule(ui), /container-type:inline-size/);
  assert.match(normalized, /@container notification-center \(max-width:319px\)/);
  assert.doesNotMatch(normalized, /@media \((?:min|max)-width/);
  assert.match(normalized, /@media \(forced-colors:active\)/);
});

/** The count is a chip with an edge, so it stays a chip where the sunken surface is the page's white. */
test('gives the count an edge in the ink and the highlight pair under forced colours', () => {
  assert.match(
    rule(`${ui} [data-part='count']`),
    /border:var\(--slotted-border-width-thin,1px\) solid color-mix\(in oklab,currentcolor 20%,transparent\)/,
  );
  assert.match(
    normalized,
    /\[data-part='count'\]\{background-color:Highlight;border-color:Highlight;color:HighlightText;forced-color-adjust:none;\}/,
  );
});

/** The waiting rows are skeleton's; the family paints none of its own placeholder and no wash under them. */
test('draws no placeholder of its own while loading', () => {
  assert.match(
    rule(`${ui}>[data-part='feed']>[data-part='item'][aria-hidden]`),
    /background-color:transparent/,
  );
  assert.match(fragment, /data-loading[\s\S]*data-ui="skeleton"/);
});
