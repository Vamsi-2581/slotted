import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/toast/contract.json', import.meta.url),
    'utf8',
  ),
);
const css = readFileSync(new URL('./toast.css', import.meta.url), 'utf8');
const fragment = readFileSync(new URL('./toast.harness.html', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
/**
 * Whitespace collapsed rather than removed: a descendant selector and a
 * multi-word value both lose their meaning when every space goes. Parentheses
 * are collapsed too, because the formatter breaks a long value across lines.
 */
const normalized = declarations
  .replace(/\s+/g, ' ')
  .replace(/\s*([{};,:>])\s*/g, '$1')
  .replace(/\(\s+/g, '(')
  .replace(/\s+\)/g, ')');

const ui = `[data-ui='${contract.ui}']`;
const root = `${ui}[data-part='root']`;
const item = `${ui}>[data-part='list']>[data-part='item']`;

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

/**
 * The defect this test was written from. A message holds other families —
 * a `button` in its actions, a `progress-indicator` in its mark — and three of
 * those families name a part `root`, `icon`, `label` or `indicator`. Written as
 * a descendant of the family, `[data-ui='toast'] [data-part='icon']` masked an
 * icon button's own icon and `[data-part='root']` resized a spinner into a
 * fixed region. Every inner part is therefore reached through the element that
 * owns it, and nothing in this sheet is a bare descendant of the family.
 */
test('never reaches a part that belongs to a family nested inside it', () => {
  const bare = [...normalized.matchAll(/\[data-ui='toast'\](?![>[])\s?\[data-part='([a-z-]+)'\]/g)];
  assert.deepEqual(
    bare.map(([, part]) => part),
    [],
    'a part is selected as a loose descendant, so a nested family carries the same name',
  );
});

/**
 * A region pinned over a page's content must not eat a press meant for the
 * page, and the messages inside it must still answer one. Every surveyed
 * implementation does this and none of them states it.
 */
test('lets a press through the region and not through a message', () => {
  assert.match(rule(root), /pointer-events:none/);
  assert.match(rule(`${ui}>[data-part='list']`), /pointer-events:none/);
  assert.match(rule(item), /pointer-events:auto/);
});

/**
 * The countdown and the timer are one number. Reading a duration token here
 * would make the bar as long as the theme says instead of as long as the
 * message was given, and stating a literal would put it outside the query that
 * collapses durations under reduced motion.
 */
test('draws the countdown from the duration the message was given', () => {
  const bar = rule(`${item}>[data-part='progress']`);
  assert.match(bar, /animation-duration:var\(--slotted-toast-duration/);
  assert.match(bar, /animation-play-state:var\(--slotted-toast-play-state/);
  assert.ok(contract.runtimeProperties.includes('--slotted-toast-duration'));
  assert.ok(contract.runtimeProperties.includes('--slotted-toast-play-state'));
});

/**
 * The three pause conditions are hover, focus inside, and a hidden document,
 * and the third is invisible to CSS. Resolving any of them here would let the
 * picture and the timer disagree, which is the whole reason the play state is
 * published as one value.
 */
test('never decides for itself whether the countdown is running', () => {
  assert.ok(!/animation-play-state:running/.test(normalized.replace(/,running\)/g, '')));
  assert.ok(!/:hover[^{]*\{[^}]*animation/.test(normalized));
});

/** Six placements, none of which names a physical edge. */
test('answers every placement the contract declares', () => {
  for (const placement of contract.axes.placement) {
    assert.ok(
      normalized.includes(`[data-placement='${placement}']`) ||
        normalized.includes(`[data-placement^='${placement.split('-')[0]}']`),
      `${placement} is not answered by any rule`,
    );
  }
  assert.ok(!/inset-(?:left|right|top|bottom)/.test(normalized));
});

/**
 * The stack reads its depth from the index, so one rule serves any depth, and
 * it says that depth in ink: a message is a box of words, and R7 keeps a scale
 * off one. The dimming is written on the open message, because the closed
 * style is the `opacity: 0` a message arrives from and leaves into.
 */
test('draws the pile from the index rather than from a rule per message', () => {
  const stacked = rule(`${ui}[data-stacking='stack']>[data-part='list']>[data-part='item']`);
  const open = rule(
    `${ui}[data-stacking='stack']>[data-part='list']>[data-part='item'][data-open]`,
  );
  assert.ok(!/scale/.test(stacked), 'a box of words may not be scaled (R7)');
  assert.match(open, /opacity:calc\(1 - min\(var\(--slotted-toast-index/);
  assert.match(stacked, /z-index:calc\(var\(--slotted-toast-count/);
  assert.ok(
    !/--slotted-toast-index:\s*\d/.test(normalized),
    'the sheet states an index of its own',
  );
});

/** Every part the contract declares is drawn, and every scene can show it. */
test('draws every part the contract declares, and shows it in the harness', () => {
  for (const part of contract.members.toast.parts) {
    assert.ok(normalized.includes(`[data-part='${part}']`), `${part} is never styled`);
    assert.ok(fragment.includes(`data-part="${part}"`), `${part} appears in no scene`);
  }
});

/**
 * The mark is the title's own size on the title's first line (R5), drawn with
 * the rule `alert` draws its own: a square of `1em` — the message's font size
 * is the title's — pushed down by half the difference between one line and the
 * mark. It stays on the first line when the title wraps, which a mark centred
 * on the whole block would not. `packages/styles/src/status-mark.test.mjs`
 * holds the same rule for every family that draws one.
 */
test('places the mark on the title’s first line at the title’s size', () => {
  assert.match(rule(item), /--_mark-size:1em/);
  const mark = rule(`${item}>[data-part='icon']`);
  assert.match(mark, /align-self:start/);
  assert.match(mark, /block-size:var\(--_mark-size\)/);
  assert.match(mark, /inline-size:var\(--_mark-size\)/);
  assert.match(mark, /margin-block-start:calc\(\(1lh - var\(--_mark-size\)\) \/ 2\)/);
  assert.match(mark, /mask-image:var\(--slotted-toast-icon,var\(--_glyph\)\)/);
  assert.ok(!normalized.includes(`[data-part='icon']::before`), 'the mark is a pseudo-element');
});

/**
 * The slot carries the colour and the mask paints `currentcolor`, so one rule
 * repaints the mark on a solid message and one repaints it under forced
 * colours, where the mask's ground has to be a system colour to survive.
 */
test('lets one colour reach the mark, so forced colours can replace it', () => {
  assert.match(rule(`${item}>[data-part='icon']`), /color:var\(--_mark\)/);
  assert.match(rule(`${item}>[data-part='icon']`), /background-color:currentcolor/);
  assert.match(rule(`${item}[data-variant='solid']`), /--_mark:var\(--_on-solid\)/);
  assert.match(normalized, /forced-colors[^@]*\[data-part='icon'\]\{background-color:CanvasText/);
});

/** A mark a page supplies takes the same box: it is an icon on the same line. */
test('gives a supplied mark the box the family draws its own in', () => {
  const supplied = rule(`${item}>[data-part='icon']:not(:empty)`);
  assert.match(supplied, /display:flex/);
  assert.match(supplied, /align-items:center/);
  assert.match(supplied, /mask-image:none/);
});

/** Every tone draws the mark the shared map names, and no other. */
test('takes its marks from the map alert and status-indicator share', () => {
  for (const [tone, glyph] of Object.entries(contract.toneGlyphs)) {
    const painted = rule(`${item}[data-tone='${tone}']`);
    assert.match(painted, new RegExp(`--_glyph:var\\(${glyph}\\)`), `${tone} draws another mark`);
  }
});

/**
 * A word no language can break must not size the words' own track. The
 * 240-pixel capture showed `Zwischenspeicherung` setting the track to 183
 * pixels inside a box of 155: `break-word` wraps only after the track has
 * already grown to fit the word. `anywhere` lowers the min-content size the
 * grid reads, and the clamped track is the other half.
 */
test('breaks an unbreakable title inside the message rather than growing it', () => {
  assert.match(rule(`${item}>[data-part='content']`), /grid-template-columns:minmax\(0,1fr\)/);
  for (const part of ['title', 'description']) {
    const words = rule(`${item}>[data-part='content']>[data-part='${part}']`);
    assert.match(words, /overflow-wrap:anywhere/, `${part} keeps break-word`);
    assert.match(words, /min-inline-size:0/, `${part} does not shrink`);
  }
});
