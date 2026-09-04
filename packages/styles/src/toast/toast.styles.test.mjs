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

/** The stack reads its depth from the index, so one rule serves any depth. */
test('draws the pile from the index rather than from a rule per message', () => {
  const stacked = rule(`${ui}[data-stacking='stack']>[data-part='list']>[data-part='item']`);
  assert.match(stacked, /scale:calc\(1 - var\(--slotted-toast-index/);
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
 * The defect the reviewer named at the visual gate, and the reason the mark is
 * a pseudo-element at all.
 *
 * A mark one line box tall with its artwork centred in it lands on the centre
 * of the *line box*. Measured on the default theme at `comfortable`: the line
 * is 19.5 pixels, its centre 9.75 from the top, the baseline 14 down, a capital
 * 9 tall and an x 7 — so the mark sat 0.75 of a pixel above the band the
 * lowercase letters occupy, and read high in every capture. The two centres
 * agree at all only because this font's ascent and descent happen to make them
 * agree, so the next theme would move the text and leave the mark behind.
 *
 * The browser is asked for the baseline instead: the artwork is an inline-block
 * on the slot's own line, and `vertical-align` places it against the same
 * baseline the title's first line uses.
 */
test('places the mark against the title baseline rather than in its line box', () => {
  const mark = rule(`${item}>[data-part='icon']::before`);
  assert.match(mark, /display:inline-block/);
  assert.match(mark, /vertical-align:var\(--_mark-offset\)/);

  const offset = rule(item);
  assert.match(offset, /--_mark-offset:calc\(\(var\(--slotted-toast-icon-axis/);
  assert.ok(
    !/\[data-part='icon'\]\{[^}]*mask-image/.test(normalized),
    'the slot masks itself again, which cannot be baseline-aligned',
  );
});

/**
 * The slot carries the colour and the artwork paints `currentcolor`, which is
 * what lets one rule repaint both under forced colours —
 * `packages/styles/src/fallbacks.test.mjs` refuses a system colour inside a
 * `::before`, so the mark could not name one itself.
 */
test('lets one colour reach the mark, so forced colours can replace it', () => {
  assert.match(rule(`${item}>[data-part='icon']`), /color:var\(--_mark\)/);
  assert.match(rule(`${item}>[data-part='icon']::before`), /background-color:currentcolor/);
  assert.match(normalized, /forced-colors[^@]*\[data-part='icon'\]\{color:CanvasText/);
});

/** A mark a page supplies takes the same axis: it is an icon on the same line. */
test('gives a supplied mark the axis the family draws its own on', () => {
  assert.match(rule(`${item}>[data-part='icon']>*`), /vertical-align:var\(--_mark-offset\)/);
});

/** Every tone draws the mark the shared map names, and no other. */
test('takes its marks from the map alert and status-indicator share', () => {
  for (const [tone, glyph] of Object.entries(contract.toneGlyphs)) {
    const painted = rule(`${item}[data-tone='${tone}']`);
    assert.match(painted, new RegExp(`--_glyph:var\\(${glyph}\\)`), `${tone} draws another mark`);
  }
});
