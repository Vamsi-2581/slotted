import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  assertContractShape,
  CHANGE_REASONS,
  KNOWN_CAPABILITIES,
  MUTABLE_CAPABILITIES,
  STATE_ATTRIBUTES,
  stateModels,
} from '../../contract.schema.mjs';

const contract = JSON.parse(await readFile(new URL('./contract.json', import.meta.url), 'utf8'));
const grid = contract.members['data-grid'];

/** The seven kinds the engine gives a column, and the two this family adds. */
const FILTER_OPERATORS = [
  'contains',
  'notContains',
  'equals',
  'notEquals',
  'startsWith',
  'endsWith',
  'greaterThan',
  'greaterThanOrEqual',
  'lessThan',
  'lessThanOrEqual',
  'between',
  'is',
  'isNot',
  'before',
  'after',
  'anyOf',
  'noneOf',
  'empty',
  'notEmpty',
];

test('satisfies the shared contract schema', () => {
  assertContractShape(contract);
});

test('declares one member, because every part reads one grid', () => {
  assert.equal(contract.family, 'data-grid');
  assert.equal(contract.ui, 'data-grid');
  assert.deepEqual(Object.keys(contract.members), ['data-grid']);
});

/**
 * The root role is the whole decision: table's own contract says "the four
 * capabilities that need it — column resizing, virtualisation, multi-column
 * sort and row activation — are all deferred to the same family", and this is
 * that family. A data-grid whose root were not a grid would be a second
 * table.
 */
test('is the composite widget table declined to be', () => {
  assert.equal(contract.rootRole, 'grid');
  assert.equal(contract.pattern, 'https://www.w3.org/WAI/ARIA/apg/patterns/grid/');
  assert.match(contract.roleReason, /composite widget/);
  assert.match(contract.roleReason, /2026-09-09-table-design\.md/);
});

test('names the thirty-nine parts a grid is made of, and the element and role of each', () => {
  assert.deepEqual(grid.parts, [
    'root',
    'scroll',
    'head',
    'header-row',
    'column-group',
    'column-header',
    'sort',
    'column-actions',
    'column-menu',
    'resizer',
    'drop-indicator',
    'filter-row',
    'filter-cell',
    'filter',
    'filter-panel',
    'filter-condition',
    'filter-operator',
    'filter-operand',
    'filter-join',
    'filter-actions',
    'body',
    'pinned-rows',
    'row',
    'row-header',
    'cell',
    'editor',
    'selection',
    'expander',
    'detail',
    'group-row',
    'group-toggle',
    'tree-toggle',
    'row-handle',
    'summary',
    'summary-cell',
    'empty',
    'loader',
    'footer',
    'actions',
  ]);
  assert.deepEqual(Object.keys(contract.elements), grid.parts);
  for (const part of grid.parts) {
    assert.ok(
      ['div', 'span', 'button'].includes(contract.elements[part]),
      `${part} is drawn on an element the grid role admits`,
    );
  }
  /* Every ARIA role the pattern requires is written by hand, because the DOM
     is div. A part with a role is a part a screen reader names. */
  assert.equal(contract.roles.root, 'grid');
  for (const group of ['head', 'body', 'summary', 'loader']) {
    assert.equal(contract.roles[group], 'rowgroup', group);
  }
  for (const row of ['header-row', 'filter-row', 'row', 'detail', 'group-row']) {
    assert.equal(contract.roles[row], 'row', row);
  }
  assert.equal(contract.roles['column-header'], 'columnheader');
  assert.equal(contract.roles['column-group'], 'columnheader');
  assert.equal(contract.roles['row-header'], 'rowheader');
  for (const cell of ['cell', 'filter-cell', 'selection', 'summary-cell']) {
    assert.equal(contract.roles[cell], 'gridcell', cell);
  }
  for (const part of Object.keys(contract.roles)) {
    assert.ok(grid.parts.includes(part), `${part} carries a role and is a part`);
  }
});

test('holds the four capabilities table deferred here by name, and the ones a grid adds', () => {
  for (const capability of [
    'sort',
    'filter',
    'columns',
    'selection',
    'current',
    'open',
    'virtualization',
  ]) {
    assert.ok(grid.capabilities.includes(capability), capability);
  }
  for (const capability of grid.capabilities) {
    assert.ok(KNOWN_CAPABILITIES.includes(capability), `${capability} is a known word`);
  }
  assert.ok(
    MUTABLE_CAPABILITIES.includes('columns'),
    'columns is mutable in the shared vocabulary',
  );
  assert.ok(contract.columnState.shape.includes('order'));
  assert.ok(contract.columnState.shape.includes('widths'));
  assert.ok(contract.columnState.shape.includes('hidden'));
  assert.ok(contract.columnState.shape.includes('pinned'));
});

/**
 * One query object, declared twice on purpose: sort and filter are both
 * mutable words and both live in the same value, so both point at the same
 * three props and the scope says why. A reader of the schema would otherwise
 * take the repetition for a copy-paste.
 */
test('models the query once under sort and filter, with the scope that says why', () => {
  const { sort, filter } = contract.stateModel;
  assert.deepEqual(
    [sort.controlled, sort.uncontrolled, sort.request],
    ['query', 'defaultQuery', 'onQueryChange'],
  );
  assert.deepEqual(
    [filter.controlled, filter.uncontrolled, filter.request],
    ['query', 'defaultQuery', 'onQueryChange'],
  );
  assert.match(sort.scope, /one request/);
  assert.match(contract.query.shape, /sort.*filter.*search.*page.*group/);
  assert.match(contract.query.change, /sort \| filter \| search \| page \| group/);
});

test('declares every mutable capability with a model whose reasons are in the vocabulary', () => {
  for (const capability of grid.capabilities) {
    if (!MUTABLE_CAPABILITIES.includes(capability)) continue;
    const entry = contract.stateModel[capability];
    assert.ok(entry, `${capability} has a model`);
    for (const model of stateModels(entry)) {
      for (const reason of model.reasons) {
        assert.ok(CHANGE_REASONS.includes(reason), `${capability}: ${reason}`);
      }
    }
  }
  /* Selection is a set: rows and cells are two values the reader chooses
     separately, and open is a set: a detail and a group open separately. */
  assert.deepEqual(Object.keys(contract.stateModel.selection), ['rows', 'cells']);
  assert.deepEqual(Object.keys(contract.stateModel.open), ['detail', 'groups']);
  assert.equal(contract.stateModel.selection.cells.controlled, 'range');
  assert.equal(contract.stateModel.open.groups.controlled, 'expandedGroups');
  assert.equal(contract.stateModel.current.controlled, 'current');
  assert.equal(contract.stateModel.columns.controlled, 'columnState');
});

test('answers every key of the pattern, and prices every departure', () => {
  const keys = contract.keyboard.map((entry) => entry.key);
  for (const key of [
    'Tab',
    'ArrowRight',
    'ArrowLeft',
    'ArrowDown',
    'ArrowUp',
    'PageDown',
    'PageUp',
    'Home',
    'End',
    'Ctrl+Home',
    'Ctrl+End',
    'Ctrl+Space',
    'Shift+Space',
    'Ctrl+A',
    'Shift+ArrowRight',
    'Shift+ArrowLeft',
    'Shift+ArrowDown',
    'Shift+ArrowUp',
    'Enter',
    'F2',
    'alphanumeric',
    'Escape',
  ]) {
    assert.ok(keys.includes(key), `${key} is answered`);
  }
  for (const entry of contract.keyboard) {
    assert.ok(
      ['pattern', 'pattern-selection', 'pattern-inside', 'platform', 'departure'].includes(
        entry.source,
      ),
      `${entry.key} names its source`,
    );
    assert.ok(entry.focus.length > 0, `${entry.key} says where focus lands`);
  }
  const departures = contract.keyboard.filter((entry) => entry.source === 'departure');
  assert.ok(
    departures.length >= 8,
    'the column operations and the spreadsheet keys are departures',
  );
  for (const [key, departure] of Object.entries(contract.departures)) {
    assert.ok(departure.reason.length > 0, `${key} has a reason`);
    assert.ok(departure.cost.length > 0, `${key} has a cost`);
  }
});

test('writes the row and column counts always, because the DOM never holds the whole set', () => {
  assert.match(contract.wiring['aria-rowcount'], /always/);
  assert.match(contract.wiring['aria-colcount'], /always/);
  assert.match(contract.wiring['aria-colindex'], /always/);
  assert.match(contract.wiring['aria-sort'], /first sort key/);
  assert.match(contract.wiring['aria-multiselectable'], /multiple and range/);
  assert.match(contract.wiring.tabindex, /one|0 on the current cell/);
});

test('states the one tab stop and the two focus combinations of the pattern', () => {
  assert.match(contract.cursor.tabStop, /^one/);
  assert.match(contract.cursor.focusInside, /exactly one focusable element/);
  assert.match(contract.cursor.survives, /never drops focus/);
});

test('applies the query itself, and says in which order', () => {
  assert.match(contract.query.applies, /filter, search, sort, group, page/);
  assert.equal(contract.query.filter.engine, '@slotted/core/filter');
  assert.match(contract.query.filter.evaluates, /nested groups included/);
  assert.match(contract.data.mode, /client.*server/);
});

test('gives the filter the compact form the invocation asked for, and the row four sources ship', () => {
  assert.match(contract.filter.form, /One condition is one line/);
  assert.match(contract.filter.form, /size sm/);
  assert.match(contract.filter.formReason, /table and filter-bar/);
  assert.match(contract.filter.row, /role row, one gridcell per column/);
  assert.match(contract.filter.rowReason, /AG Grid, MUI X, Kendo and DevExtreme/);
  assert.match(contract.filter.draft, /nothing reaches the query until Apply/);
  assert.ok(grid.parts.includes('filter-row'));
  assert.ok(grid.parts.includes('filter-cell'));
});

test('names every operator the engine has, in words and in a symbol', () => {
  assert.deepEqual(Object.keys(contract.labels.filterOperators), FILTER_OPERATORS);
  assert.deepEqual(Object.keys(contract.labels.filterSymbols), FILTER_OPERATORS);
  for (const symbol of Object.values(contract.labels.filterSymbols)) {
    assert.ok(symbol.length >= 1 && symbol.length <= 2, `${symbol} is one character`);
  }
  assert.deepEqual(Object.keys(contract.labels.filterJoins), ['and', 'or']);
});

test('keeps the edited value where the reader typed it', () => {
  assert.match(contract.editing.commit, /never discards what the reader typed/);
  assert.match(contract.editing.conflict, /leaves the draft untouched/);
  assert.match(contract.editing.validate, /draft stays in the editor/);
  assert.deepEqual(Object.keys(contract.editing.editors), [
    'text',
    'number',
    'date',
    'time',
    'datetime',
    'boolean',
    'set',
    'custom',
  ]);
  assert.match(contract.editing.readonly, /on nothing when nothing edits/);
});

test('windows both axes without a transform, so a pinned column still sticks', () => {
  assert.match(contract.virtualization.rows, /No transform/);
  assert.match(contract.virtualization.columns, /grid-column explicitly/);
  assert.match(contract.virtualization.auto, /100.*20/);
  assert.match(contract.virtualization.ids, /keeps its selection/);
});

test('draws the states it declares, and every attribute agrees with the vocabulary', () => {
  for (const [state, attribute] of Object.entries(contract.stateAttributes)) {
    assert.equal(attribute, STATE_ATTRIBUTES[state], state);
  }
  for (const state of ['selected', 'current', 'invalid', 'readonly', 'dragging', 'drop-target']) {
    assert.ok(grid.states.includes(state), state);
  }
});

test('resolves every axis, and states the default the reference pages must show', () => {
  for (const axis of Object.keys(contract.axes)) {
    assert.ok(axis in contract.resolution, `${axis} resolves`);
  }
  assert.equal(grid.defaults.stickyHeader, true);
  assert.equal(grid.defaults.text, 'truncate');
  assert.equal(grid.defaults.selectionMode, 'none');
  assert.equal(grid.defaults.editMode, 'cell');
  assert.deepEqual(contract.axes.selectionMode, ['none', 'single', 'multiple', 'range']);
});

test('declines with a family, a composition or a reason, never in silence', () => {
  for (const [name, declined] of Object.entries(contract.declined)) {
    assert.ok(
      'deferTo' in declined || 'composition' in declined,
      `${name} names a family or a composition`,
    );
    assert.ok(declined.reason.length > 0, `${name} has a reason`);
  }
  assert.equal(contract.declined.paste.deferTo, 'spreadsheet');
  assert.equal(contract.declined.filterChips.deferTo, 'filter-bar');
  assert.equal(contract.declined.columnManagerPanel.deferTo, 'column-manager');
});

test('declares one demonstration per capability the inventory adopted', () => {
  const scenarios = contract.scenarios['data-grid'];
  for (const id of [
    'sorting',
    'filter-panel',
    'filter-row',
    'filter-bar',
    'search',
    'selection',
    'range',
    'editing',
    'editing-row',
    'validation',
    'activation',
    'pinning',
    'resize',
    'reorder',
    'column-menu',
    'column-state',
    'grouping',
    'summary',
    'detail',
    'virtualization',
    'server',
    'pagination',
    'load-more',
    'empty-and-loading',
    'keyboard',
    'accessibility',
  ]) {
    assert.ok(scenarios.includes(id), `${id} is demonstrated`);
  }
});
