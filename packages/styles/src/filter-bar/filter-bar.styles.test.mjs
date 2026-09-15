import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/filter-bar/contract.json', import.meta.url),
    'utf8',
  ),
);
const css = readFileSync(new URL('./filter-bar.css', import.meta.url), 'utf8');
const fragment = readFileSync(new URL('./filter-bar.harness.html', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
const normalized = declarations.replace(/\s+/g, '');

test('lives in the component layer', () => {
  assert.match(css, /@layer slotted\.components/);
});

/**
 * Every part the contract declares is either drawn by this sheet or is another
 * family's root worn inside a part of this family's. `add`, `clear`, `apply`,
 * `reset`, `summary`, `add-rule`, `add-group`, `remove-group` and
 * `save-preset` are `button`'s and carry this family's part name on the
 * button itself, which `button.css` never selects; `search`, `preset`,
 * `field` and `operator` wrap a `text-field` or a `select`, whose sheets do
 * select their own root.
 */
test('styles or wears every part the contract declares', () => {
  const worn = new Set([
    'add',
    'clear',
    'apply',
    'reset',
    'add-rule',
    'add-group',
    'remove-group',
    'save-preset',
  ]);
  for (const part of contract.members.filterBar.parts) {
    if (worn.has(part)) continue;
    const selector = part === 'root' ? "[data-ui='filter-bar']{" : `[data-part='${part}']`;
    assert.ok(normalized.includes(selector), `Missing part ${part}`);
  }
  for (const wrapped of ['search', 'preset']) {
    assert.ok(
      normalized.includes(`[data-part='${wrapped}']>[data-ui='`),
      `${wrapped} wraps another family's root`,
    );
  }
});

/**
 * The root measures and the frame lays out, because a container query cannot
 * restyle the element it measures. Three compositions, at the two literal
 * breakpoints the contract records.
 */
test('composes by container query with the container on the root and the grid on the frame', () => {
  assert.ok(
    normalized.includes(
      "[data-ui='filter-bar'][data-part='root']{container-name:slotted-filter-bar;container-type:inline-size;display:block;inline-size:100%;",
    ),
  );
  assert.ok(
    normalized.includes(
      "[data-part='frame']{align-items:center;column-gap:var(--_gap);display:grid;",
    ),
  );
  assert.match(declarations, /@container slotted-filter-bar \(min-width: 64rem\)/);
  assert.match(declarations, /@container slotted-filter-bar \(max-width: 36rem\)/);
  assert.match(contract.responsive.wide, /64rem/);
  assert.match(contract.responsive.narrow, /36rem/);
  /* The builder is portaled and measures itself. */
  assert.match(declarations, /@container slotted-filter-bar-builder \(max-width: 30rem\)/);
});

/**
 * The rule a pill opens carries the family's `data-ui` alone in a popover,
 * so the root's container rule must not reach it: a container has no
 * intrinsic inline size, and a shrink-wrapped popover measured it at zero
 * and wrapped every control one word per line. It is a column at a width
 * of its own instead.
 */
test('lays the popover editor out as a column at its own width, outside the root container', () => {
  assert.ok(
    normalized.includes(
      "[data-ui='filter-bar'][data-part='rule']{display:grid;gap:var(--_gap);inline-size:var(--slotted-filter-bar-editor-size,18rem);max-inline-size:100%;",
    ),
  );
  assert.ok(!normalized.includes("[data-ui='filter-bar']:not([data-part='builder'])"));
  assert.ok(
    normalized.includes(
      "[data-ui='filter-bar'][data-part='rule']>[data-part='actions']{align-items:center;display:flex;gap:var(--_gap-sm);justify-content:flex-end;",
    ),
  );
});

/**
 * Below the breakpoint the pills and the chips give way to one control. They
 * leave the focus order as well as the picture: `visibility: hidden` is what
 * `createArrowNavigation` reads to skip a stop nothing can stand on, and
 * `display: none` alone leaves the computed visibility at `visible`.
 */
test('folds the pills and the chips behind the summary, and out of the roving ring', () => {
  const narrow = declarations.slice(declarations.indexOf('(max-width: 36rem)'));
  assert.match(narrow, /\[data-part='chips'\]\s*\{\s*display: none;\s*visibility: hidden;/);
  assert.match(
    narrow,
    /\[data-part='summary'\]\s*\{\s*display: inline-flex;\s*visibility: visible;/,
  );
  assert.ok(normalized.includes("[data-part='summary']{display:none;visibility:hidden;}"));
  assert.ok(
    normalized.includes("[data-part='chip'][data-folded]{display:none;visibility:hidden;}"),
  );
});

/**
 * A pill holding a rule is a chosen state, carried as the pair the foundation
 * asks for — the accent border and the accent surface — and its chevron is
 * the same glyph every control that opens a list draws.
 */
test('fills a pill from the accent pair and turns the chevron it borrows', () => {
  assert.ok(
    normalized.includes(
      "[data-part='pill'][data-filtered]{background-color:var(--_filtered-surface);border-color:var(--_filtered-edge);color:var(--_filtered-ink);}",
    ),
  );
  assert.ok(normalized.includes('--_filtered-edge:var(--slotted-tone-accent-border,Highlight)'));
  assert.ok(normalized.includes('--_filtered-surface:var(--slotted-tone-accent-surface,Canvas)'));
  assert.ok(
    normalized.includes(
      'mask-image:var(--slotted-filter-bar-pill-icon,var(--slotted-icon-chevron-down))',
    ),
  );
  assert.ok(
    normalized.includes(
      "[data-part='pill'][aria-expanded='true']::after{transform:rotate(180deg);}",
    ),
  );
});

/**
 * The chip is `tag`'s, and its remove control is `tag`'s: this sheet draws a
 * remove of its own only on a rule inside the builder. The first capture of
 * the family showed two crosses on every chip, one per sheet.
 */
test('leaves the chip’s remove control to tag and draws its own only on a rule', () => {
  assert.doesNotMatch(declarations, /\[data-ui='filter-bar'\]\s+\[data-part='remove'\]/);
  assert.ok(normalized.includes("[data-part='rule']>[data-part='remove']::after{"));
  assert.ok(
    normalized.includes('mask-image:var(--slotted-filter-bar-remove-icon,var(--slotted-icon-x))'),
  );
});

/** A field's name and its sentence are two isolated runs, so a right-to-left name beside an ISO date reorders nothing. */
test('isolates the field name from its sentence', () => {
  assert.ok(
    normalized.includes(
      "[data-part='pill']>span{min-inline-size:0;overflow:hidden;text-overflow:ellipsis;unicode-bidi:isolate;}",
    ),
  );
  assert.ok(
    normalized.includes("[data-part='chip'][data-part='label']>span{unicode-bidi:isolate;}"),
  );
});

/** The bar sticks under the page chrome and never measures the header itself. */
test('reads the page property for sticky', () => {
  assert.ok(
    normalized.includes(
      "[data-ui='filter-bar'][data-sticky]{background-color:var(--_surface);inset-block-start:var(--slotted-page-sticky-top,0px);",
    ),
  );
  assert.ok(normalized.includes('z-index:var(--slotted-z-index-sticky,100)'));
  assert.doesNotMatch(declarations, /--slotted-filter-bar-above/);
});

test('borrows the ring for every control of its own', () => {
  for (const part of ['pill', 'more']) {
    assert.ok(
      normalized.includes(`[data-part='${part}']`) &&
        normalized.includes(
          ':focus-visible{outline:var(--slotted-focus-ring-width,2px)solidvar(--slotted-focus-ring-color,Highlight);outline-offset:var(--slotted-focus-ring-offset,2px);}',
        ),
      `${part} draws the shared ring`,
    );
  }
});

test('renders every part and every state in the harness fragment', () => {
  for (const part of contract.members.filterBar.parts) {
    assert.ok(fragment.includes(`data-part="${part}"`), `harness renders no ${part}`);
  }
  for (const state of Object.values(contract.stateAttributes)) {
    assert.ok(fragment.includes(state), `harness exercises no ${state}`);
  }
  for (const attribute of [
    'data-filtered',
    'data-dirty',
    'data-folded',
    'data-apply="manual"',
    'data-depth="1"',
    'data-operands="2"',
    'data-operands="0"',
  ]) {
    assert.ok(fragment.includes(attribute), `harness exercises no ${attribute}`);
  }
  assert.ok(fragment.includes('role="search"'));
  assert.ok(fragment.includes('role="toolbar"'));
  assert.ok(fragment.includes('role="grid"'));
});
