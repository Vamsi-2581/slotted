import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = new URL('.', import.meta.url).pathname;

/**
 * SL4 — several chosen values are the chips they are, and the family draws
 * none of them.
 *
 * The chips are `tag`'s, worn as `data-ui` beside the row this family owns, so
 * the chip a reader removes in a select is the chip they know from everywhere
 * else and its geometry — the pill, the small step, the remove control floored
 * at the target minimum — is stated once. A family that painted a chip of its
 * own would be a second answer, drifting from the first the moment one of them
 * is retuned.
 *
 * `combobox` is not here on purpose: its own contract declines `multiple` and
 * defers a collection of values to `multi-select`, so it has no several to
 * preview (CB4).
 */
const HOSTS = ['select'];

function sheet(family) {
  return readFileSync(`${source}${family}/${family}.css`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
}

function rule(css, selector) {
  const normalized = css
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,:])\s*/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')');
  return normalized.split(`${selector}{`)[1]?.split('}')[0] ?? '';
}

test('lays the chips out and paints none of them', () => {
  for (const family of HOSTS) {
    const css = sheet(family);
    const row = rule(css, `[data-ui='${family}'][data-part='root'] > [data-part='tags']`);
    assert.notEqual(row, '', `${family} lays out no chip row`);
    assert.match(row, /display:flex/);
    assert.match(row, /gap:var\(--slotted-space-2/);
    /* Nothing about a chip: no ground, no edge, no corner, no type. */
    assert.doesNotMatch(
      row,
      /background|border-radius|border:|font-size|font-weight/,
      `${family} paints the chips instead of placing them`,
    );
    assert.doesNotMatch(
      css,
      /\[data-ui='tag'\]/,
      `${family} reaches into the tag sheet instead of standing beside it`,
    );
  }
});

/**
 * SL9. The row is a lane of the control's own row, not a row hanging over the
 * trigger. A row that hangs reserves no space, so the space it may use was an
 * arithmetic inset kept in step with the chevron and the clear button by hand —
 * and six chosen values ran under both of them. A track ends where the next
 * track begins, and no arithmetic can be out of date.
 *
 * The trigger is still a `button`, so the chips are still written beside it and
 * not in it: a remove control inside a button is a control inside a control.
 * It spans every lane, so the gaps between chips still belong to it and the
 * frame still opens the popup everywhere a chip is not.
 */
test('gives the chips a lane of the control and the final controls their own', () => {
  const css = sheet('select');
  const frame = rule(css, "[data-ui='select'][data-part='root']");
  assert.match(frame, /display:grid/);
  assert.match(frame, /grid-template-columns:minmax\(0,1fr\) auto/);
  assert.match(
    rule(css, "[data-ui='select'][data-part='root']:has(> [data-part='clear'])"),
    /grid-template-columns:minmax\(0,1fr\) auto auto/,
    'the clear button has no lane of its own',
  );

  const row = rule(css, "[data-ui='select'][data-part='root'] > [data-part='tags']");
  assert.match(row, /grid-area:1 \/ 1 \/ 2 \/ 2/, 'the chips are not in the content lane');
  assert.doesNotMatch(row, /position:absolute/, 'the row still hangs over the trigger');
  assert.match(row, /pointer-events:none/);
  assert.match(
    rule(css, "[data-ui='select'] > [data-part='trigger']"),
    /grid-area:1 \/ 1 \/ 2 \/ -1/,
    'the trigger is not the ground under every lane',
  );
  for (const part of ['arrow', 'busy']) {
    assert.match(
      rule(css, `[data-ui='select'] > [data-part='${part}']`),
      /grid-area:1 \/ -2 \/ 2 \/ -1/,
      `${part} is not in the last lane`,
    );
  }
  assert.match(
    rule(css, "[data-ui='select'] > [data-part='tags'] > *"),
    /pointer-events:auto/,
    'the chips do not take their own presses back',
  );
});

/**
 * The height of the control does not answer the number of chosen values: one
 * line, and a row no taller than the inner box of a select that chose one
 * thing. The chips that do not fit are taken out by the collapse, which is why
 * `tag` has to honour `hidden` — the rule its own sheet is guarded for.
 */
test('keeps the row on one line and no taller than the control', () => {
  const css = sheet('select');
  const row = rule(css, "[data-ui='select'][data-part='root'] > [data-part='tags']");
  assert.match(row, /display:flex/);
  assert.doesNotMatch(row, /flex-wrap:wrap/, 'the chips wrap onto a second line');
  assert.match(row, /min-inline-size:0/, 'a chip can widen the lane it is in');
  assert.match(row, /overflow:hidden/);
});

/**
 * The sentence a control too narrow for a chip shows instead. It is taken out
 * of sight rather than out of the tree while the chips are shown: it is the
 * trigger's accessible name, and a button that changes what it is called when
 * the window is resized is a button nobody can refer to.
 */
test('keeps the sentence in the tree while the chips are shown', () => {
  const css = sheet('select');
  const hidden = rule(
    css,
    "[data-ui='select'][data-part='root']:not([data-narrow]) [data-part='summary']",
  );
  assert.notEqual(hidden, '', 'the summary is never taken out of sight');
  assert.match(hidden, /clip-path:inset\(50%\)/);
  assert.doesNotMatch(hidden, /display:none/, 'the summary leaves the accessibility tree');
  assert.match(
    rule(css, "[data-ui='select'][data-part='root'][data-narrow] > [data-part='tags']"),
    /display:none/,
    'a control too narrow for a chip still draws one',
  );
});

/**
 * A chip in the control carries a `label` of its own, and the rule that lays
 * out an option's label would have put it in the popup's second column. The
 * rule is scoped to the option wherever a chip can stand beside it (SL4).
 */
test('scopes the option label to the option', () => {
  for (const family of HOSTS) {
    const css = sheet(family);
    assert.doesNotMatch(
      css.replace(/\s+/g, ' '),
      new RegExp(`\\[data-ui='${family}'\\] \\[data-part='label'\\] \\{`),
      `${family} lays out every label in the family, not only an option's`,
    );
    assert.match(
      css.replace(/\s+/g, ' '),
      new RegExp(`\\[data-ui='${family}'\\] \\[data-part='item'\\] > \\[data-part='label'\\] \\{`),
      `${family} lays out no option label at all`,
    );
  }
});
