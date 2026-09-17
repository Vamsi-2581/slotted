import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('./data-grid.css', import.meta.url), 'utf8');
const fragment = readFileSync(new URL('./data-grid.harness.html', import.meta.url), 'utf8');
const contract = JSON.parse(
  readFileSync(new URL('../../../../specs/components/data-grid/contract.json', import.meta.url)),
);
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
const normalize = (text) =>
  text
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,:])\s*/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')');
const normalized = normalize(declarations);
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rule = (selector) => {
  const match = normalized.match(new RegExp(`${escape(normalize(selector))}\\{([^}]*)\\}`));
  assert.ok(match, `no rule for \`${selector}\``);
  return match[1];
};

test('renders every part the contract declares, on the element and with the role it names', () => {
  for (const part of contract.members['data-grid'].parts) {
    const tag = contract.elements[part];
    const pattern = new RegExp(`<${tag === 'button' ? 'button' : tag}[^>]*data-part="${part}"`);
    assert.match(fragment, pattern, `${part} on a ${tag}`);
  }
  for (const [part, role] of Object.entries(contract.roles)) {
    const pattern = new RegExp(
      `data-part="${part}"[^>]*role="${role}"|role="${role}"[^>]*data-part="${part}"`,
    );
    assert.match(fragment, pattern, `${part} carries role ${role}`);
  }
});

/**
 * The DOM is `div` and every row is a CSS grid over one template the binding
 * writes on the root. A cell places itself explicitly, because with column
 * virtualisation the cells that are absent would otherwise move the ones that
 * are present into the wrong tracks.
 */
test('lays every row out as a grid over the template the binding writes', () => {
  const row = rule("[data-ui='data-grid'] [role='row']");
  assert.match(row, /display:grid;/);
  assert.match(
    row,
    /grid-template-columns:var\(--slotted-data-grid-template,none\) minmax\(0,1fr\);/,
  );
  const cell = rule("[data-ui='data-grid'] [role='row'] > *");
  assert.match(cell, /grid-column:var\(--slotted-data-grid-column,auto\);/);
});

/**
 * The virtual window is padding and height on the body, never a transform: a
 * transformed ancestor would stand between a pinned column's `sticky` and the
 * scroller it must resolve against.
 */
test('windows rows with padding and height, and never with a transform', () => {
  const body = rule("[data-ui='data-grid'] [data-part='body']");
  assert.match(body, /block-size:var\(--slotted-data-grid-window-total,auto\);/);
  assert.match(body, /padding-block-start:var\(--slotted-data-grid-window-start,0\);/);
  assert.doesNotMatch(declarations, /transform\s*:/);
});

/**
 * The cursor at rest is an inset shadow in the theme's ring colour at 60%,
 * and under `:focus-visible` the same trace is an outline in the ring colour
 * whole, drawn inward because a cell has no margin for an outer ring.
 */
test('draws the cursor inward, at rest as a shadow and under focus as the ring', () => {
  const rest = rule(
    "[data-ui='data-grid'] [role='gridcell'][data-current]:not([data-editing]),[data-ui='data-grid'] [role='rowheader'][data-current]:not([data-editing]),[data-ui='data-grid'] [role='columnheader'][data-current]",
  );
  assert.match(rest, /box-shadow:inset 0 0 0 var\(--_ring-width\) var\(--_cursor-rest\);/);
  const focus = rule(
    "[data-ui='data-grid'] [role='gridcell']:focus-visible:not([data-editing]),[data-ui='data-grid'] [role='rowheader']:focus-visible:not([data-editing]),[data-ui='data-grid'] [role='columnheader']:focus-visible",
  );
  assert.match(
    focus,
    /outline:var\(--_ring-width\) solid var\(--slotted-focus-ring-color,Highlight\);/,
  );
  assert.match(focus, /outline-offset:calc\(var\(--_ring-width\) \* -1\);/);
  assert.match(
    normalized,
    /--_cursor-rest:color-mix\(in oklab,var\(--slotted-focus-ring-color,Highlight\) 60%,transparent\);/,
  );
});

/** A pinned cell covers what slides under it with the row's own ground. */
test('pins a column with sticky at the offset the binding writes, on the row’s own ground', () => {
  for (const edge of ['start', 'end']) {
    const pinned = rule(`[data-ui='data-grid'] [data-pinned='${edge}']`);
    assert.match(pinned, /position:sticky;/);
    assert.match(pinned, /background-color:inherit;/);
    assert.match(
      pinned,
      new RegExp(`inset-inline-${edge}:var\\(--slotted-data-grid-pin-offset,0\\);`),
    );
  }
  const corner = rule("[data-ui='data-grid'] [data-part='head'] [data-pinned]");
  assert.match(corner, /z-index:calc\(var\(--slotted-z-index-sticky,100\) \+ 2\);/);
  /* The zone's edge is the hairline the rows are ruled with; while something
     slides under it the line casts a short shadow, never a stronger line: a
     dark rule down the body read as a frame inside the frame. */
  const edge = rule("[data-ui='data-grid'] [data-pinned][data-pin-edge]::after");
  assert.match(edge, /background-color:var\(--_rule\);/);
  assert.match(edge, /inline-size:var\(--_rule-width\);/);
  const hidden = rule(
    "[data-ui='data-grid'] [data-part='scroll'][data-overflowing]:not([data-at-start]) [data-pinned='start'][data-pin-edge]::after",
  );
  assert.match(
    hidden,
    /background-image:linear-gradient\(to right,var\(--_rule\) var\(--_rule-width\),var\(--_edge-shadow\) var\(--_rule-width\),transparent\);/,
  );
  assert.doesNotMatch(normalized, /\[data-pin-edge\]::after\{[^}]*--_rule-strong/);
  /* The cells end where the rule under the row begins: the track is the row
     less the rule, or a pinned cell painted above its row covered the rule. */
  const body = rule(
    "[data-ui='data-grid']:is([data-variant='ruled'],[data-variant='framed']) [data-part='body']",
  );
  assert.match(body, /--_track:calc\(var\(--_row-block\) - var\(--_rule-width\)\);/);
  const fixed = rule(
    "[data-ui='data-grid'][data-rows='fixed'] [data-part='body'] > [data-part='row']",
  );
  assert.match(fixed, /block-size:var\(--_row-block\);grid-auto-rows:var\(--_track\);/);
});

/**
 * A cell in edit hands its inset and the row's height to the plain control,
 * keeps the grid's type, and silences the control's own ring so the cell's
 * trace is the only one.
 */
test('hands the editing cell’s inset, height and type to the plain control', () => {
  const editing = rule("[data-ui='data-grid'] [data-part='cell'][data-editing]");
  assert.match(editing, /(^|;)padding:0;/);
  for (const step of ['sm', 'md', 'lg']) {
    assert.match(
      editing,
      new RegExp(`--slotted-control-padding-inline-${step}:var\\(--_pad-inline\\);`),
    );
    assert.match(editing, new RegExp(`--slotted-control-height-${step}:var\\(--_row-block\\);`));
  }
  assert.match(editing, /--slotted-control-font-size-sm:var\(--_font-size\);/);
  assert.match(editing, /--slotted-focus-ring-width:0px;/);
  const invalid = rule("[data-ui='data-grid'] [data-part='cell'][data-editing][data-invalid]");
  assert.match(invalid, /--slotted-focus-ring-color:var\(--slotted-focus-ring-color-invalid\);/);
});

/**
 * `result-state` inside the empty part has an `actions` part of the same
 * name as the row actions; the reveal rule is scoped to the cell's own child
 * so it never hides that family's buttons. Read on the first capture of the
 * empty scene, where every action button was missing.
 */
test('scopes the row-actions reveal to the cell’s own child', () => {
  assert.doesNotMatch(normalized, /\[data-ui='data-grid'\] \[data-part='actions'\]\{/);
  const actions = rule("[data-ui='data-grid'] [data-part='cell'] > [data-part='actions']");
  assert.match(actions, /opacity:0;/);
  assert.match(
    normalized,
    /\[data-part='row'\]\[data-current\] \[data-part='cell'\] > \[data-part='actions'\]/,
  );
});

/**
 * The compact filter form the invocation asked for: three columns — the join,
 * the operator at a stated width, the operand taking the rest — and the panel
 * stating its own width rather than taking the operands' natural one.
 */
test('lays the filter panel out as one line per condition', () => {
  const panel = rule("[data-ui='data-grid'][data-part='filter-panel']");
  assert.match(panel, /grid-template-columns:max-content var\(--_operator-size\) minmax\(0,1fr\);/);
  assert.match(panel, /inline-size:var\(--slotted-data-grid-filter-panel-size,24rem\);/);
  /* The popover pads its header and its body, not its surface; the panel
     stands in the surface and takes the `sm` inset itself, and the layer that
     holds it is given the panel's measure. Read live: at the popover's own
     sixteen rem the panel stood out of the surface on both sides. */
  assert.match(
    panel,
    /padding:var\(--slotted-popover-padding-block-sm,var\(--slotted-space-4,0\.5rem\)\) var\(--slotted-popover-padding-inline-sm,var\(--slotted-space-5,0\.75rem\)\);/,
  );
  const layer = rule(
    "[data-ui='popover']:has(> [data-part='content'] > [data-ui='data-grid'][data-part='filter-panel'])",
  );
  assert.match(
    layer,
    /--slotted-popover-measure-sm:calc\(var\(--slotted-data-grid-filter-panel-size,24rem\) \+ 2 \* \(var\(--slotted-popover-gap,0\.5rem\) \+ var\(--slotted-border-width-thin,1px\)\)\);/,
  );
  assert.match(
    normalized,
    /--_operator-size:var\(--slotted-data-grid-filter-operator-size,7rem\);/,
  );
  const join = rule("[data-ui='data-grid'][data-part='filter-panel'] [data-part='filter-join']");
  assert.match(join, /grid-column:1;/);
});

/** The filter row is a row of the grid on the band's lighter step, and its operator is one character. */
test('draws the filter row on the band and its operator on a square inner target', () => {
  const cell = rule("[data-ui='data-grid'] [data-part='filter-row'] > [data-part='filter-cell']");
  assert.match(cell, /background-color:var\(--_band-surface\);/);
  const button = rule(
    "[data-ui='data-grid'] [data-part='filter-cell'] [data-part='filter-operator'] > button",
  );
  assert.match(button, /inline-size:var\(--slotted-control-inner-size-sm,22px\);/);
  assert.match(button, /block-size:var\(--slotted-control-inner-size-sm,22px\);/);
});

/** The sort mark takes no room on an unsorted column; the menu keeps its room and reveals. */
test('reserves room for the column menu and none for an unsorted mark', () => {
  const sort = rule("[data-ui='data-grid'] [data-part='sort']");
  assert.match(sort, /display:none;/);
  const sorted = rule(
    "[data-ui='data-grid'] [data-part='column-header'][data-sorted] > [data-part='sort']",
  );
  assert.match(sorted, /display:inline-flex;/);
  const menu = rule("[data-ui='data-grid'] [data-part='column-menu']");
  assert.match(menu, /opacity:0;/);
  const filter = rule(
    "[data-ui='data-grid'] [data-part='filter']:not([data-filtered],[data-open])",
  );
  assert.match(filter, /display:none;/);
});

/** A value keeps its own direction inside a right-to-left grid. */
test('keeps a cell value’s own writing direction', () => {
  const value = rule(
    "[data-ui='data-grid'] [data-part='cell'] > span:first-child,[data-ui='data-grid'] [data-part='row-header'] > span:first-child,[data-ui='data-grid'] [data-part='summary-cell'] > span:first-child",
  );
  assert.match(value, /unicode-bidi:plaintext;/);
});
