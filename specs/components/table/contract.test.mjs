import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  assertContractShape,
  CHANGE_REASONS,
  MUTABLE_CAPABILITIES,
  STATE_ATTRIBUTES,
} from '../../contract.schema.mjs';

const contract = JSON.parse(await readFile(new URL('./contract.json', import.meta.url), 'utf8'));
const table = contract.members.table;

test('satisfies the shared contract schema', () => {
  assertContractShape(contract);
});

test('declares one member, because every part reads one table', () => {
  assert.equal(contract.family, 'table');
  assert.equal(contract.ui, 'table');
  assert.deepEqual(Object.keys(contract.members), ['table']);
});

test('names the nineteen parts a table is made of', () => {
  assert.deepEqual(table.parts, [
    'root',
    'scroll',
    'table',
    'caption',
    'head',
    'body',
    'summary',
    'row',
    'column-header',
    'row-header',
    'cell',
    'sort',
    'column-actions',
    'selection',
    'expander',
    'detail',
    'empty',
    'loader',
    'footer',
  ]);
});

/**
 * A listing screen puts a filter or a column menu in the header, which Ant,
 * PatternFly and Carbon all do. The slot is the family's because the control
 * has to sit inside a cell the family lays out — the sort control filled the
 * header and left no room for a second target. What the filter holds is not:
 * a typed rule set is `filter-bar`'s, and a table that owned one would own the
 * query.
 */
test('gives a column a place for its own controls and none of their state', () => {
  assert.ok(table.parts.includes('column-actions'));
  assert.equal(contract.columnControls.part, 'column-actions');
  assert.match(contract.columnControls.state, /^none\b/);
  assert.match(contract.columnControls.layout, /never overlap/);
  assert.match(contract.columnControls.control, /not taken from button/);
  assert.equal(contract.declined.filterState.deferTo, 'filter-bar');
  assert.match(contract.declined.filterState.composition, /column-actions/);
});

/**
 * The APG is explicit and the sentence is quoted rather than summarised: a
 * table "is not an interactive widget. Thus, its cells are not focusable or
 * selectable". Every element of the structure is the platform's own, so the
 * roles, the row and column relationships and the header association arrive
 * without the family writing an ARIA role at all.
 */
test('takes the whole structure from the platform and writes no role', () => {
  assert.equal(table.nativeElement, 'div');
  assert.deepEqual(contract.elements, {
    root: 'div',
    scroll: 'div',
    table: 'table',
    caption: 'caption',
    head: 'thead',
    body: 'tbody',
    summary: 'tfoot',
    footer: 'div',
    row: 'tr',
    'column-header': 'th',
    'row-header': 'th',
    cell: 'td',
    sort: 'button',
    'column-actions': 'span',
    selection: 'th|td',
    expander: 'button',
    detail: 'tr',
    empty: 'td',
    loader: 'tbody',
  });
  assert.equal(contract.rootRole, 'none');
  assert.match(contract.roleReason, /not an interactive widget/);
});

/**
 * The pattern is read from the source rather than recalled, and the claim that
 * it defines no keyboard is the finding rather than an omission: a table is not
 * a composite widget, so every key belongs to the platform.
 */
test('cites the pattern it follows and the practice that holds its properties', () => {
  assert.match(contract.pattern, /w3\.org\/WAI\/ARIA\/apg\/patterns\/table/);
  assert.match(contract.patternStatus, /aria-practices/);
  assert.match(contract.practice, /grid-and-table-properties/);
  assert.match(contract.declined.gridRole.reason, /composite widget/);
});

test('owns no key of its own, and says which one it borrows', () => {
  for (const entry of contract.keyboard) {
    assert.ok(entry.effect.length > 0, `${entry.key} states no effect`);
    assert.ok(entry.focus.length > 0, `${entry.key} names no focus destination`);
    assert.ok(
      entry.source === 'platform' || entry.source === 'departure',
      `${entry.key} is neither the platform's nor a recorded departure`,
    );
  }
  const departures = contract.keyboard.filter((entry) => entry.source === 'departure');
  assert.deepEqual(
    departures.map((entry) => entry.key),
    ['Shift+Space'],
  );
  assert.ok(contract.departures['Shift+Space'].cost.length > 40);
});

/**
 * Three mutable values, three models. The vocabulary gained `sort` for the
 * first of them, in its own commit, because no existing word says "these rows
 * are ordered by that column".
 */
test('gives every mutable value a model with reasons the vocabulary holds', () => {
  assert.deepEqual(Object.keys(contract.stateModel).sort(), ['open', 'selection', 'sort']);
  for (const [capability, model] of Object.entries(contract.stateModel)) {
    assert.ok(MUTABLE_CAPABILITIES.includes(capability), `${capability} is not mutable`);
    assert.ok(table.capabilities.includes(capability), `${capability} is modelled and not held`);
    for (const reason of model.reasons) {
      assert.ok(CHANGE_REASONS.includes(reason), `${capability} unknown reason ${reason}`);
    }
  }
  assert.equal(contract.stateModel.sort.controlled, 'sort');
  assert.equal(contract.stateModel.sort.uncontrolled, 'defaultSort');
  assert.equal(contract.stateModel.sort.request, 'onSortChange');
});

/**
 * The rows are the consumer's own children, so reordering them would mean
 * owning the data — which is the line §1 of the design draws between this
 * family and `data-grid`. The family asks; the consumer applies the descriptor
 * to its own array or its own query.
 */
test('holds the sort descriptor and reorders nothing', () => {
  assert.deepEqual(contract.sort.directions, ['ascending', 'descending']);
  assert.deepEqual(contract.sort.cycle, ['ascending', 'descending', null]);
  assert.match(contract.sort.reorders, /consumer/);
  assert.equal(contract.sort.attribute, 'aria-sort');
  assert.match(contract.sort.written, /only/);
});

/**
 * `aria-sort` is a property, and a property that changes silently is a change
 * no reader hears. None of the six surveyed implementations announces it.
 */
test('announces the sort it applies, politely', () => {
  assert.match(contract.sort.announce, /live-announcer/);
  assert.ok(contract.composes.includes('live-announcer'));
  assert.ok(contract.labels.sortedAscending.length > 0);
  assert.ok(contract.labels.sortedDescending.length > 0);
  assert.ok(contract.labels.sortCleared.length > 0);
});

/**
 * ARIA cannot state a sort level — the practice page says applying `aria-sort`
 * to more than one header has "limited value" — so a second sorted column would
 * be either silent or a lie.
 */
test('sorts one column, and names the family that sorts several', () => {
  assert.equal(contract.sort.columns, 1);
  assert.equal(contract.declined.multiSort.deferTo, 'data-grid');
  assert.match(contract.declined.multiSort.reason, /aria-sort/);
});

/**
 * One reducer for every collection in the library. A second definition of what
 * `multiple` means is what `@slotted/core/collection` exists to prevent.
 */
test('selects rows with the reducer every other collection uses', () => {
  assert.equal(contract.selection.module, 'packages/core/src/collection');
  assert.equal(contract.selection.function, 'nextSelection');
  assert.deepEqual(contract.axes.selectionMode, ['none', 'single', 'multiple']);
  assert.match(contract.selection.range, /anchor/);
});

/**
 * A row is not selectable under the `table` role, so the selection is announced
 * by the control that owns it. `list-item` recorded the same rule: a chooser of
 * its own would be a second answer to the question `checkbox` already owns.
 */
test('paints the selection on the row and announces it from the checkbox', () => {
  assert.ok(table.states.includes('selected'));
  assert.equal(contract.stateAttributes.selected, STATE_ATTRIBUTES.selected);
  assert.equal(contract.selection.control, 'checkbox');
  assert.equal(contract.selection.forbidden, 'aria-selected');
  assert.match(contract.selection.forbiddenReason, /role/);
  assert.match(contract.selection.selectAll, /indeterminate/);
  assert.match(contract.selection.selectAll, /count/);
});

/**
 * `open` is what the value is called and `expanded` is what a disclosure
 * paints. The detail is not rendered while it is closed, so nothing is hidden
 * in the DOM that a reader cannot reach.
 */
test('expands a row through the disclosure pattern it borrows', () => {
  assert.ok(table.capabilities.includes('open'));
  assert.ok(table.states.includes('expanded'));
  assert.equal(contract.stateAttributes.expanded, STATE_ATTRIBUTES.expanded);
  assert.match(contract.expansion.pattern, /disclosure/);
  assert.match(contract.expansion.wiring, /aria-expanded/);
  assert.match(contract.expansion.wiring, /aria-controls/);
  assert.match(contract.expansion.closed, /not rendered/);
});

/**
 * The rule `prose` set: a tab stop on a block that fits does nothing, and a
 * wide block with no tab stop is unreachable without a pointer. The measurement
 * is `@slotted/core/overflow`, so the two families cannot disagree about what
 * overflowing means.
 */
test('makes the scroller a region only while it overflows', () => {
  assert.ok(table.capabilities.includes('overflow'));
  assert.equal(contract.scroll.part, 'scroll');
  assert.equal(contract.scroll.module, 'packages/core/src/overflow');
  assert.match(contract.scroll.wiring, /role="region"/);
  assert.match(contract.scroll.wiring, /tabindex/);
  assert.match(contract.scroll.condition, /overflow/);
  assert.ok(contract.labels.scroll.length > 0);
});

/**
 * §12 asks for scroll with an affordance. The one the family draws is the
 * pinned column's edge, because it is the only place a fade or a shadow can go
 * without covering the column that must stay crisp — and it appears exactly
 * while something is hidden under it.
 */
test('says where the scroll affordance is drawn, and what it is', () => {
  assert.deepEqual(contract.scroll.attributes, [
    'data-overflowing',
    'data-at-start',
    'data-at-end',
  ]);
  assert.match(contract.scroll.affordance, /pinned column/);
  assert.match(contract.scroll.affordance, /scrollbar/);
});

/**
 * The scroller and the root are one element because the sticky header sticks to
 * the nearest scrolling ancestor: two elements would put the border on one and
 * the stickiness on the other.
 */
/**
 * The root is the frame and the scroller is inside it, because the two boxes
 * answer different questions: the header sticks against the scroller either
 * way, and what the root has to hold is everything that must not scroll
 * sideways with the table — the border, the radius and the footer bar.
 */
test('keeps the frame outside the scroller, and says why', () => {
  assert.equal(table.parts[0], 'root');
  assert.equal(table.parts[1], 'scroll');
  assert.match(contract.rootReason, /scrolling ancestor/);
  assert.match(contract.rootReason, /footer bar/);
  assert.equal(contract.sticky.header, 'head');
  assert.match(contract.sticky.corner, /both/);
});

/**
 * Where the header stops is a second question, and the two answers are right on
 * different screens: a table in a drawer wants its own scroller, a listing that
 * fills a page wants the page. The axis names both, and the cost of the second
 * is written beside it — a box that scrolls one axis scrolls both, so a table
 * cannot scroll sideways and let its header stick to the page at once.
 */
test('says what a sticky header sticks to, and what the second answer costs', () => {
  assert.deepEqual(contract.axes.stickyTo, ['scroll', 'page']);
  assert.equal(contract.resolution.stickyTo[2], 'scroll');
  assert.match(contract.sticky.to.page, /scrolls one axis scrolls both/);
  assert.match(contract.sticky.to.offset, /--slotted-table-sticky-offset/);
  assert.match(contract.scroll.model, /sideways and never up/);
  assert.match(contract.scroll.condition, /never under stickyTo page/);
});

/**
 * The summary is the header of the other end. A listing whose total scrolls out
 * of view makes the reader scroll back for the number they came for, so the
 * family pins the `tfoot` the same way it pins the `thead` — and the axis is
 * separate, because a table with a sticky header and no summary would otherwise
 * pay for a rule it never draws.
 */
test('pins the summary as well as the head, and says which one the axis moves', () => {
  assert.deepEqual(contract.axes.stickyFooter, [true, false]);
  assert.equal(contract.resolution.stickyFooter[2], false);
  assert.match(contract.sticky.footer, /^summary/);
  assert.match(contract.sticky.footer, /not the footer bar/);
  assert.match(contract.sticky.to.offsetEnd, /--slotted-table-sticky-offset-end/);
});

/**
 * A column pinned beside the chooser needs a length, and a shrink-wrapped
 * column has none to give: the identifier pinned to the nearest round number
 * landed six pixels past the checkbox and over the column behind it. The width
 * is stated, and the same name answers the offset.
 */
test('states the width of the selection column, because something is pinned beside it', () => {
  assert.match(contract.selection.columnWidth, /--slotted-table-selection-size/);
  assert.match(contract.selection.columnWidth, /stated rather than shrink-wrapped/);
});

/**
 * A paged listing puts its control under the table and inside its frame. Every
 * surveyed implementation that pages draws it attached; a control floating
 * under a framed box reads as a defect. The family supplies the place, and
 * `pagination` supplies the control and holds the page.
 */
test('gives a paged listing a place for its control, and holds none of the page', () => {
  assert.ok(table.parts.includes('footer'));
  assert.equal(contract.footer.part, 'footer');
  assert.match(contract.footer.scrolls, /^no\b/);
  assert.ok(contract.footer.composes.includes('pagination'));
  /* And one slot rather than two: a bar above stands on its own ground and the
     page places it, while `head` beside `header` is the pair a reader
     mistypes. */
  assert.ok(!table.parts.includes('header'));
  assert.match(contract.declined.headerSlot.reason, /head beside header/);
  assert.equal(contract.declined.pagination.deferTo, 'pagination');
  assert.match(contract.declined.pagination.composition, /footer/);
});

/**
 * The practice requires the pair exactly when the DOM is not the whole set,
 * which is every paged table. Writing it always would make a complete table
 * count itself twice.
 */
test('states the size of a set the DOM does not hold, and only then', () => {
  assert.match(contract.wiring['aria-rowcount'], /only/);
  assert.match(contract.wiring['aria-rowindex'], /aria-rowcount/);
  assert.equal(contract.declined.colcount.deferTo, 'nothing');
});

/**
 * A number is set in tabular figures whichever way it is aligned, and a
 * right-aligned label is not a number. The inference runs one way only, and the
 * consumer's explicit value wins — which is the rule `frameworks.md` states for
 * every axis.
 */
test('holds alignment and numerals apart', () => {
  assert.deepEqual(contract.axes.align, ['start', 'center', 'end']);
  assert.ok('numeric' in contract.axes);
  assert.match(contract.numerals.rule, /tabular/);
  assert.match(contract.numerals.inference, /align/);
});

/**
 * A long value is treated, never removed: the briefing's decision is that
 * truncation leaves the string readable to assistive technology and reachable
 * in full.
 */
test('treats a long value in three ways and takes none of it away', () => {
  assert.deepEqual(contract.axes.text, ['wrap', 'truncate', 'nowrap']);
  assert.match(contract.text.truncate, /DOM/);
  assert.match(contract.text.wrap, /unbroken/);
});

test('answers every axis from the prop, then the provider, then a stated default', () => {
  for (const [axis, values] of Object.entries(contract.axes)) {
    const resolution = contract.resolution[axis];
    assert.deepEqual(resolution.slice(0, 2), ['prop', 'defaults'], axis);
    assert.ok(values.includes(resolution[2]), `${axis} falls back outside its own values`);
  }
});

/**
 * Every decline names the family that owns the capability instead, or the
 * composition that replaces it. "Not needed yet" is not one of the reasons on
 * this list.
 */
test('names an owner for every capability it declines', () => {
  for (const [name, entry] of Object.entries(contract.declined)) {
    assert.ok(entry.deferTo ?? entry.composition, `${name} declines and names no owner`);
    assert.ok(entry.reason.length > 40, `${name} declines without a reason`);
  }
  assert.equal(contract.declined.resize.deferTo, 'data-grid');
  assert.equal(contract.declined.virtualization.deferTo, 'data-grid');
  assert.equal(contract.declined.pagination.deferTo, 'pagination');
  assert.equal(contract.declined.size.deferTo, 'the density axis');
  assert.equal(contract.declined.cardLayout.deferTo, 'data-list');
});

test('states the reason for every literal it writes', () => {
  for (const [token, reason] of Object.entries(contract.literals)) {
    assert.match(token, /^--slotted-table-/);
    assert.ok(reason.length > 40, `${token} states no reason`);
  }
});

/**
 * The words the family says are one input rather than eight defaults. An
 * application translates them once, which is the shape `description-list` and
 * `stepper` both use.
 */
test('holds the words it says apart from the values it defaults', () => {
  assert.deepEqual(Object.keys(contract.labels).sort(), [
    'collapse',
    'expand',
    'scroll',
    'selectAll',
    'selectRow',
    'sortCleared',
    'sortedAscending',
    'sortedDescending',
  ]);
  for (const [key, word] of Object.entries(contract.labels)) {
    assert.ok(word.length > 0, `${key} says nothing`);
    assert.ok(!(key in table.defaults), `${key} is a word, not a default`);
  }
});

test('lets an application set the whole family once', () => {
  for (const key of contract.provides.tableDefaults) {
    assert.ok(
      key in table.defaults || key === 'labels',
      `${key} is provided and is neither a default nor the vocabulary`,
    );
  }
});

/**
 * §12 asks for the empty and the loading state by name, and the two are not one
 * state: a first load has no rows to keep and a refresh has a reader's place to
 * hold.
 */
test('separates a first load from a refresh over rows already shown', () => {
  assert.ok(table.states.includes('loading'));
  assert.equal(contract.stateAttributes.loading, STATE_ATTRIBUTES.loading);
  assert.match(contract.loading.first, /loader/);
  assert.match(contract.loading.refresh, /aria-busy/);
  assert.match(contract.loading.refresh, /width/);
  assert.equal(contract.empty.composes, 'result-state');
});
