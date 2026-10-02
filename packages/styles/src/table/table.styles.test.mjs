import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('./table.css', import.meta.url), 'utf8');
const fragment = readFileSync(new URL('./table.harness.html', import.meta.url), 'utf8');
const shared = readFileSync(new URL('../plain-variant.test.mjs', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
/**
 * Whitespace is collapsed rather than removed: a descendant selector and a
 * multi-word value both lose their meaning when every space goes. Parentheses
 * are collapsed too, because the formatter breaks a long selector across lines
 * and leaves `:is( [data-ui`, which no assertion here spells.
 */
const normalize = (text) =>
  text
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,:])\s*/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')');
/* A selector spelled in an assertion goes through the same collapse, so the
   descendant combinator before `:is` and `:has` is lost on both sides alike. */
const normalized = normalize(declarations);

const cell = ":is([data-part='cell'],[data-part='row-header'])";
const plainRoot = "[data-part='root'][data-variant='plain']";

/**
 * The families that ship the `plain` variant, read from the shared
 * test that holds their values, so the cell rule below cannot name a family
 * the variant does not reach, nor miss one that joins it. Two lists in two
 * files are one list when a test says so.
 */
const plainFamilies = [...shared.matchAll(/\{ family: '([a-z-]+)'/g)].map(([, family]) => family);

/**
 * A cell holding a `plain` control gives its inset to the control, the way the
 * header gives its inset to `sort`: the cell's `padding-inline` goes to zero and
 * the control's own padding tokens take the cell's inset, so the edited value
 * stands where the read value stood. Pending since wave 7, decided with the
 * `plain` variant in `docs/build-briefing.md`, and paid here.
 */
test('a cell holding a plain control gives its inset to the control, and to a control alone', () => {
  assert.ok(
    plainFamilies.length >= 14,
    `plain-variant.test.mjs names ${plainFamilies.length} families`,
  );
  const families = plainFamilies.map((family) => `[data-ui='${family}']`).join(',');
  const selector = normalize(`[data-ui='table'] ${cell}:has(> ${plainRoot}:is(${families}))`);
  const match = normalized.match(new RegExp(`${escape(selector)}\\{([^}]*)\\}`));
  assert.ok(
    match,
    `no rule for \`${selector}\` — the list must be the one plain-variant.test.mjs holds`,
  );
  const body = match[1];
  assert.match(body, /(^|;)padding:0;/);
  for (const step of ['sm', 'md', 'lg']) {
    assert.match(
      body,
      new RegExp(`--slotted-control-padding-inline-${step}:var\\(--_pad-inline\\);`),
    );
    /* The block inset moves into the control's height: a row with a control
       in it is as tall as a row without one, whatever size step was written. */
    assert.match(body, new RegExp(`--slotted-control-height-${step}:var\\(--_row-min-block\\);`));
  }
  assert.doesNotMatch(body, /inline-size/, "the control's width is the control's own");
});

/**
 * `between` on a time is one `time-range-picker`, marked `data-range` on the
 * operand so the grid collapses to one column. The eight-rem floor written for
 * two time pickers on one row now serves a consumer's own `renderOperand` only,
 * and it has to step aside for the mark: it stands after the collapsing rule
 * at the same specificity, and without the guard it won.
 */
test('the two-column floor for a time operand steps aside for a between drawn as one range picker', () => {
  const operand = "[data-ui='table'][data-part='filter-panel'] [data-part='filter-operand']";
  assert.match(normalized, new RegExp(`${escape(`${operand}[data-range],`)}`));
  assert.match(
    normalized,
    new RegExp(
      `${escape(`${operand}[data-kind='time']:not([data-range]){`)}grid-template-columns:repeat\\(auto-fit,minmax\\(8rem,1fr\\)\\);`,
    ),
  );
  const collapse = normalized.indexOf(`${operand}[data-range],`);
  const floor = normalized.indexOf(`${operand}[data-kind='time']:not([data-range])`);
  assert.ok(collapse >= 0 && floor > collapse, 'the collapsing rule stands before the floor');
});

/**
 * The scenes that show the two rules: `between` on a time and on a date-time
 * drawn as one range picker inside `filter-operand[data-range]`, and body cells
 * holding `plain` controls.
 */
test('the harness draws the range pickers inside a data-range operand and the plain controls inside cells', () => {
  for (const [kind, family] of [
    ['time', 'time-range-picker'],
    ['datetime', 'datetime-range-picker'],
  ]) {
    const operand = new RegExp(
      `<div data-part="filter-operand" data-kind="${kind}" data-range>\\s*<div\\s+data-ui="${family}"`,
    );
    assert.match(fragment, operand, `filter-${kind} draws ${family} inside a data-range operand`);
  }
  assert.match(fragment, /data-scene="editing"/);
  const editing = fragment.slice(fragment.indexOf('data-scene="editing"'));
  assert.match(
    editing,
    /<td data-part="cell"[^>]*>\s*<div\s+data-ui="text-field"\s+data-part="root"[^>]*data-variant="plain"/,
  );
});

function escape(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * A column aligned to the end keeps its name over its values.
 *
 * The header's own rule grouped the column header with the selection cell in
 * one `:is()`, and `:is()` takes the specificity of its strongest argument —
 * the two-part selection selector — so the header outranked the alignment rule
 * that comes after it. Every `th` carried `data-align="end"` and every one of
 * them computed `text-align: start`: the digits stood at the right edge of
 * their column and the name that labels them at the left. The two branches are
 * written apart so the header's is no stronger than the axis it has to lose to.
 */
test('leaves a column header weak enough for the alignment axis to reach it', () => {
  assert.ok(
    normalized.includes(
      normalize(
        "[data-ui='table'] [data-part='column-header'],[data-ui='table'] [data-part='head'] [data-part='selection']{",
      ),
    ),
    'the column header and the selection cell are two selectors, not one :is()',
  );
  assert.ok(
    !normalized.includes(
      normalize(
        "[data-ui='table'] :is([data-part='column-header'],[data-part='head'] [data-part='selection'])",
      ),
    ),
    'the :is() that outranked the alignment rule is gone',
  );
  /* The axis itself, which the header now loses to on source order. */
  assert.ok(
    normalized.includes(normalize("[data-ui='table'] [data-align='end']{text-align:end;}")),
  );
});

/**
 * The direction mark and the disclosure chevron are the `Glyph` element the
 * binding draws, so the sheet paints neither: it sizes, fades and turns the
 * `icon` box and leaves the drawing alone.
 */
test('draws the sort mark and the chevron with the Glyph element, never a mask', () => {
  assert.ok(!/mask/.test(normalized), 'the sheet still paints a glyph with a mask');
  assert.ok(
    normalized.includes(
      normalize(
        "[data-ui='table'] [aria-sort='ascending'] > [data-part='sort'] > [data-ui='icon']{rotate:180deg;}",
      ),
    ),
  );
  assert.match(
    fragment,
    /data-part="sort"[^>]*>[^<]+<span data-ui="icon"[^>]*>\s*<svg data-part="glyph" data-glyph="chevron-down">/,
  );
  assert.match(
    fragment,
    /data-part="expander"[^>]*>\s*<span data-ui="icon"[^>]*>\s*<svg data-part="glyph" data-glyph="chevron-right">/,
  );
});

test('stands on the ground its container publishes before the page surface', () => {
  assert.match(
    normalized,
    /--_surface:var\(--slotted-table-surface,var\(--slotted-ground,var\(--slotted-surface,Canvas\)\)\)/,
  );
});
