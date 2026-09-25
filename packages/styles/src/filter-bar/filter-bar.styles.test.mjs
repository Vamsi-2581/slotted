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
      "[data-part='frame']{align-items:start;column-gap:var(--_gap);display:grid;",
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
 * The shortcut is drawn as a legend at the end of the search; where the
 * primary input is a touch screen the legend names a key the reader has no
 * way to press, and the palette's footer is hidden under the same query.
 */
test('hides the shortcut legend where the primary input is a touch screen', () => {
  const touch = declarations.slice(declarations.indexOf('(hover: none) and (pointer: coarse)'));
  assert.ok(touch.length > 0, 'a touch-screen media query');
  assert.match(
    touch,
    /\[data-ui='filter-bar'\] \[data-part='search'\] \[data-ui='kbd'\]\s*\{\s*display: none;/,
  );
});

/**
 * Below 30rem the rule stacks: the field, then the operator and the operand
 * across both columns, the remove control in the second. A second track of
 * `auto` took the spanning operand's whole width — a spanning item hands its
 * size to the non-flexible track first — and left the field 34 pixels wide,
 * a chevron with no name. The track is the remove control's own width.
 */
test('stacks a builder rule on a fixed remove track so the spanning operand cannot widen it', () => {
  const narrow = declarations.slice(
    declarations.indexOf('slotted-filter-bar-builder (max-width: 30rem)'),
  );
  const block = narrow.slice(0, narrow.indexOf('}') + 1);
  assert.match(block, /grid-template-columns: minmax\(0, 1fr\) var\(--slotted-target-min, 24px\);/);
  assert.doesNotMatch(block, /minmax\(0, 1fr\) auto/);
});

/**
 * A pill holding a rule is a chosen state, carried as the pair the foundation
 * asks for — the accent border and the accent surface — and its chevron is
 * the `icon` the binding draws, turned here and painted by no mask.
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
    normalized.includes("[data-part='pill']>[data-ui='icon']{--slotted-icon-size:var(--_icon);"),
  );
  assert.ok(
    normalized.includes(
      "[data-part='pill'][aria-expanded='true']>[data-ui='icon']{transform:rotate(180deg);}",
    ),
  );
  assert.doesNotMatch(declarations, /mask-image/);
});

/**
 * The chip is `tag`'s, and its remove control is `tag`'s: this sheet draws a
 * remove of its own only on a rule inside the builder. The first capture of
 * the family showed two crosses on every chip, one per sheet.
 */
test('leaves the chip’s remove control to tag and sizes its own only on a rule', () => {
  assert.doesNotMatch(declarations, /\[data-ui='filter-bar'\]\s+\[data-part='remove'\]/);
  assert.ok(
    normalized.includes(
      "[data-part='rule']>[data-part='remove']>[data-ui='icon']{--slotted-icon-size:var(--_icon);}",
    ),
  );
  assert.doesNotMatch(declarations, /\[data-part='remove'\]::after/);
});

/** A field's name and its sentence are two isolated runs, so a right-to-left name beside an ISO date reorders nothing. */
test('isolates the field name from its sentence', () => {
  assert.ok(
    normalized.includes(
      "[data-part='pill']>span:not([data-ui='icon']){min-inline-size:0;overflow:hidden;text-overflow:ellipsis;unicode-bidi:isolate;}",
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

/**
 * A binding may render the condition inside one element of its own at
 * `display: contents`; the element is not a grid item, so the operator and
 * the operand are the rule's grid items and a child combinator misses both.
 * Under the stacked composition the miss put the operand in the remove
 * control's track, 24 pixels wide, and past the drawer's edge.
 */
test('reaches the operator and the operand through a display-contents wrapper', () => {
  for (const part of ['operator', 'operand']) {
    assert.doesNotMatch(
      normalized,
      new RegExp(`\\[data-part='rule'\\][^{,]*>\\[data-part='${part}'\\]`),
      `rule reaches ${part} as a child`,
    );
  }
  assert.ok(
    normalized.includes(
      "[data-part='rule']:is([data-part='operator'],[data-part='operand']){grid-column:1/-1;}",
    ),
    'the stacked rule spans both parts across the row',
  );
});

/**
 * Below 36rem the consumer's `end` controls take a line of their own. Sharing
 * the summary's line, an `auto` track for them took every pixel a toolbar of
 * three controls asked for and folded the summary to one letter per line
 * (Nexora, 390 pixels); a shrinking track folded their own buttons instead.
 * A bar with no `end` keeps the two-column line.
 */
test("gives a narrow bar's end controls a line of their own", () => {
  const narrow = normalized.slice(normalized.indexOf('(max-width:36rem)'));
  assert.match(narrow, /grid-template-columns:minmax\(0,1fr\)auto;/);
  assert.match(
    narrow,
    /\[data-ui='filter-bar'\]>\[data-part='frame'\]:has\(>\[data-part='end'\]:not\(:empty\)\)\{grid-template-areas:'searchsearch''barbar''endend''countcount';\}/,
  );
});

/**
 * The width alone does not say the toolbar fits beside the search: at 1440
 * pixels (Nexora, /sales/orders) the consumer's three controls left the
 * toolbar 364 pixels, its pills wrapped onto a second line, and the search
 * and the controls stood in the middle of the two. A root the binding marks
 * `data-bar-wrapped` takes the medium composition inside the wide query, the
 * toolbar on a line of its own.
 */
test('gives a wrapping toolbar a line of its own inside the wide composition', () => {
  const wide = normalized.slice(
    normalized.indexOf('@containerslotted-filter-bar(min-width:64rem){'),
    normalized.indexOf("[data-ui='filter-bar'][data-size='sm']"),
  );
  assert.match(
    wide,
    /\[data-ui='filter-bar'\]\[data-bar-wrapped\]>\[data-part='frame'\]\{grid-template-areas:'searchendcount''barbarbar''chipschipschips';grid-template-columns:minmax\(0,1fr\)autoauto;\}/,
  );
});

/**
 * Every member of the frame starts at the top of its line and the count is a
 * control tall with its line in the middle, so the search, the consumer's
 * controls and the count line up with the first line of pills even while
 * those wrap. On a phone the count is a line of its own and keeps its type's
 * height.
 */
test('starts every member at the top of its line and centres the count in a control height', () => {
  const count =
    normalized
      .split("[data-ui='filter-bar']>[data-part='frame']>[data-part='count']{")
      .find((block) => block.startsWith('color:'))
      ?.split('}')[0] ?? '';
  assert.match(count, /padding-block:max\(0px,calc\(\(var\(--_height\)-1lh\)\/2\)\);/);
  /**
   * The count is reached through the frame it belongs to. A descendant
   * selector also reached the count another family draws inside a control
   * placed in this bar — the column manager's trigger chip took this padding
   * and grew to the button's height.
   */
  assert.ok(!/\[data-ui='filter-bar'\]\s+\[data-part='count'\]/.test(declarations));
  assert.ok(!/\[data-loading\]\s+\[data-part='count'\]/.test(declarations));
  const narrow = normalized.slice(normalized.indexOf('(max-width:36rem)'));
  assert.match(
    narrow,
    /\[data-ui='filter-bar'\]>\[data-part='frame'\]>\[data-part='count'\]\{justify-self:start;padding-block:0;\}/,
  );
});

/**
 * The count waits in its own place: before the first answer it holds only the
 * spinner, sixteen pixels tall, and the text that replaces it is a line of the
 * bar's type — twenty. On a phone the count is a row of its own, so the rows
 * under the bar moved four pixels when the answer landed. The part keeps one
 * line of its type whatever it holds.
 */
test('keeps a line of its type for the count while the first answer is on its way', () => {
  const count =
    normalized
      .split("[data-ui='filter-bar']>[data-part='frame']>[data-part='count']{")
      .find((block) => block.startsWith('color:'))
      ?.split('}')[0] ?? '';
  assert.match(count, /min-block-size:1lh/);
});

/**
 * The rule's remove control and the chips' more stood a target minimum on a
 * touch screen, 24 pixels in a row of 44-pixel fields. They reach the
 * comfortable target by a transparent `::before` centred on the box, and the
 * box keeps its 24 pixels: a block padding with a clipped ground left the
 * remove's border box, and its focus ring, 24 wide and 44 tall.
 */
test('makes the rule’s remove and the chips’ more full touch targets on a coarse pointer', () => {
  const at = normalized.indexOf('@media(pointer:coarse){');
  assert.notEqual(at, -1, 'a coarse-pointer block');
  const coarse = normalized.slice(at);
  const selector =
    "[data-ui='filter-bar']:is([data-part='more'],[data-part='rule']>[data-part='remove'])";
  const halo = coarse.split(`${selector}::before{`)[1]?.split('}')[0] ?? '';
  assert.match(
    halo,
    /inset:min\(0px,calc\(\(100%-var\(--slotted-target-comfortable,44px\)\)\/2\)\);/,
  );
  const box = coarse.split(`${selector}{`)[1]?.split('}')[0] ?? '';
  assert.doesNotMatch(box, /background-clip|padding-block|margin-block/);
});
