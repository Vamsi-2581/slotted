import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/inline-message/contract.json', import.meta.url),
    'utf8',
  ),
);
const css = readFileSync(new URL('./inline-message.css', import.meta.url), 'utf8');
const fragment = readFileSync(new URL('./inline-message.harness.html', import.meta.url), 'utf8');
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
const member = contract.members.inlineMessage;

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
  for (const part of member.parts) {
    assert.ok(normalized.includes(`[data-part='${part}']`), `no rule reaches the ${part} part`);
  }
});

/**
 * Both columns are placed by hand. Auto-placement puts the sentence in the
 * first track whenever the message has no mark, and the sentence is then sized
 * by a track that shrinks to its content with an empty `1fr` beside it — the
 * defect a two-column grid has exactly once, on the tone that is the default.
 */
test('places the mark and the sentence rather than letting the grid guess', () => {
  assert.match(rule(root), /grid-template-columns:auto minmax\(0,1fr\)/);
  assert.match(rule(`${ui}>[data-part='icon']`), /grid-column:1/);
  assert.match(rule(`${ui}>[data-part='text']`), /grid-column:2/);
  assert.match(rule(`${ui}>[data-part='text']`), /grid-row:1/);
});

/**
 * The mark is the sentence's own size on its first line (R5), drawn with the
 * rule `alert` draws its own: a square of `1em`, pushed down by half the
 * difference between one line and the mark, so it stays on the first line when
 * the sentence wraps to three. `packages/styles/src/status-mark.test.mjs` holds
 * the same rule for every family that draws one.
 */
test('keeps the mark on the message’s first line however far it runs', () => {
  assert.match(rule(root), /--_mark-size:1em/);
  const icon = rule(`${ui}>[data-part='icon']`);
  assert.match(icon, /align-self:start/);
  assert.match(icon, /block-size:var\(--_mark-size\)/);
  assert.match(icon, /inline-size:var\(--_mark-size\)/);
  assert.match(icon, /margin-block-start:calc\(\(1lh - var\(--_mark-size\)\) \/ 2\)/);
});

/**
 * The severity word is out of flow, which is what keeps it from taking a grid
 * cell or adding a line to a message that is one. It is real text rather than
 * generated content, so a screen reader reads it and a page search finds it.
 */
test('clips the severity word from sight without removing it', () => {
  const prefix = rule(`${ui}>[data-part='prefix']`);
  assert.match(prefix, /position:absolute/);
  assert.match(prefix, /clip-path:inset\(50%\)/);
  assert.match(prefix, /inline-size:1px/);
  assert.match(prefix, /block-size:1px/);
  assert.doesNotMatch(prefix, /display:none/);
  assert.doesNotMatch(prefix, /visibility:hidden/);
});

/**
 * Help draws no mark, so the binding draws no glyph and the rule withdraws the
 * empty box rather than hold a column open for nothing. All three guards on it
 * matter: `:empty` keeps the page's own
 * artwork, `:not([data-loading])` keeps the ring, because a help message can be
 * waiting for something like any other, and `:not([data-mark='dot'])` keeps the
 * bullet, which is a mark the help tone does have.
 */
test('withdraws the mark for the tone that has none', () => {
  assert.equal(contract.toneGlyphs.secondary, null);
  assert.ok(
    normalized.includes(
      `${ui}[data-tone='secondary']:not([data-loading]):not([data-mark='dot'])>[data-part='icon']:empty{display:none;}`,
    ),
    'the help tone would hold an empty column where its mark would be',
  );
});

/**
 * The bullet a form asks for. It is the same shape in every tone, so a
 * description and an error under one field start on one left edge and only the
 * ink changes; the disc is a third of the glyph scale, so it steps with the
 * size and the density rather than with a number.
 *
 * The slot is the disc's own width and the `dot` glyph's box twice that,
 * because the glyph draws a circle half the width of its viewBox: at twice the
 * slot the disc fills the slot exactly, and the bullet starts on the message's
 * own left edge instead of inside a column sized for a circled glyph. Keying
 * on the `dot` glyph leaves a supplied mark the full box it was measured for.
 */
test('draws one neutral bullet for every tone when the mark is a dot', () => {
  assert.deepEqual(contract.axes.mark, ['glyph', 'dot', 'none']);
  const dot = rule(`${root}[data-mark='dot']`);
  assert.match(dot, /--_dot-size:calc\(var\(--_mark-size\) \/ 3\)/);

  const bullet = rule(
    `${ui}[data-mark='dot']>[data-part='icon']:has(>[data-ui='icon']>[data-glyph='dot'])`,
  );
  assert.match(bullet, /inline-size:var\(--_dot-size\)/);
  assert.match(bullet, /--slotted-icon-size:calc\(var\(--_dot-size\) \* 2\)/);
});

/**
 * The third mark, which is no mark: what a field asks for (F2). The box is
 * withdrawn for every tone rather than for help alone, and the two exceptions
 * help's rule keeps are kept — a mark the page supplied stays, and a message
 * that is waiting keeps its ring.
 */
test('draws nothing at all when the mark is none', () => {
  assert.ok(
    normalized.includes(
      `${ui}[data-mark='none']:not([data-loading])>[data-part='icon']:empty{display:none;}`,
    ),
    'a message asked for no mark still draws one',
  );
});

/**
 * A ring drawn in a column sized for a 4.67-pixel dot is an ellipse, so the
 * wait restates the width it needs. The text moves by the difference while the
 * message is waiting, which is the cost of a bullet that starts at the
 * message's own left edge rather than in the middle of a glyph's column.
 */
test('gives the wait a round ring even when the mark is a dot', () => {
  assert.match(rule(`${ui}[data-loading]>[data-part='icon']`), /inline-size:var\(--_mark-size\)/);
});

/**
 * The half of `reserve` that makes it usable. The line is held open; a mark and
 * a severity word standing beside an empty sentence would be the layout shift
 * moved rather than removed.
 */
test('draws nothing at all when there is nothing to say', () => {
  assert.match(rule(`${root}[data-reserve]`), /min-block-size:1lh/);
  assert.ok(normalized.includes(`${ui}:has([data-part='text']:empty)>[data-part='icon']`));
  assert.ok(normalized.includes(`${ui}:has([data-part='text']:empty)>[data-part='prefix']`));
});

/**
 * Every tone the contract declares paints an ink. The glyph each tone draws is
 * the binding's, from the contract's map; the sheet paints none of its own.
 */
test('paints an ink for every tone the contract declares, and no glyph', () => {
  for (const tone of contract.axes.tone) {
    const declarations = rule(`${root}[data-tone='${tone}']`);
    assert.match(declarations, /--_text:var\(--slotted-/, `${tone} paints no ink`);
  }
  assert.doesNotMatch(normalized, /mask-image|--_glyph/);
});

/**
 * Both size steps read the control type scale, which is the only one the theme
 * restates per density. A message under a dense field therefore shrinks with
 * the rows around it without the family knowing what a density is — and the
 * mark, sized in `em`, shrinks with the type rather than reading a second
 * scale of its own.
 */
test('takes its type from the scale density restates, and its mark from the type', () => {
  for (const [size, step] of [
    ['sm', 'sm'],
    ['md', 'md'],
  ]) {
    const declarations = rule(`${root}[data-size='${size}']`);
    assert.ok(declarations.includes(`--slotted-control-font-size-${step}`));
  }
  assert.doesNotMatch(normalized, /--slotted-control-icon-size-/);
});

/**
 * The wait is the ring `button` draws, at the same duration token, and it stops
 * under reduced motion rather than slowing — `docs/token-foundation.md` states
 * that an infinite animation must stop, and shortening is insufficient.
 */
test('turns a ring for the wait and stops it when asked for stillness', () => {
  const loading = rule(`${ui}[data-loading]>[data-part='icon']`);
  assert.match(
    loading,
    /animation:slotted-inline-message-spin var\(--slotted-duration-loop-fast\)/,
  );
  assert.match(loading, /infinite/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css.slice(css.indexOf('prefers-reduced-motion')), /animation:\s*none/);
});

/**
 * `STATE_PRECEDENCE` puts `disabled` above `loading`. A control nobody can use
 * is not waiting for anything, so the ring stops for a disabled message as well
 * as for a reader who asked for stillness.
 */
test('lets the stronger state stop the weaker one’s motion', () => {
  assert.match(rule(`${root}[data-disabled]`), /color:var\(--slotted-disabled-foreground\)/);
  assert.match(rule(`${ui}[data-disabled]>[data-part='icon']`), /animation:none/);
});

/**
 * The theme remaps every colour this family reads, so the ink needs no rule of
 * its own. The mark takes a system colour of its own, which its glyph strokes
 * with through `currentcolor`.
 */
test('keeps the mark visible when the system replaces the palette', () => {
  const forced = css.slice(css.indexOf('forced-colors: active'));
  assert.match(forced, /\[data-part='icon'\]\s*\{\s*color: CanvasText/);
  assert.match(forced, /border-inline-end-color: Canvas;/);
});

/**
 * The fragment is the third place this family's DOM is written. Every part
 * appears in it, and so does every value of every painted axis, because a value
 * nothing renders is a value nobody has looked at.
 */
test('renders every part and every painted value in the harness fragment', () => {
  for (const part of member.parts) {
    assert.match(fragment, new RegExp(`data-part="${part}"`), `${part} is in no scene`);
  }
  for (const tone of contract.axes.tone) {
    assert.match(fragment, new RegExp(`data-tone="${tone}"`), `${tone} is in no scene`);
  }
  for (const size of contract.axes.size) {
    assert.match(fragment, new RegExp(`data-size="${size}"`), `${size} is in no scene`);
  }
  for (const state of ['data-loading', 'data-disabled', 'data-reserve']) {
    assert.match(fragment, new RegExp(state), `${state} is in no scene`);
  }
});
