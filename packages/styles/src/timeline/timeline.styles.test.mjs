import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/timeline/contract.json', import.meta.url),
    'utf8',
  ),
);
const css = readFileSync(new URL('./timeline.css', import.meta.url), 'utf8');
const fragment = readFileSync(new URL('./timeline.harness.html', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
const normalized = declarations.replace(/\s+/g, '');

test('lives in the component layer', () => {
  assert.match(css, /@layer slotted\.components/);
});

test('styles every part the contract declares', () => {
  for (const part of contract.members.timeline.parts) {
    const selector = part === 'root' ? "[data-ui='timeline']{" : `[data-part='${part}']`;
    assert.ok(normalized.includes(selector), `Missing part ${part}`);
  }
});

/**
 * The axes that change the paint. `mode`, `order`, `growing`, `timeFormat`
 * and `level` change the element, the arithmetic or the text, and nothing a
 * stylesheet can see; `connector` is read from the item under its own name.
 */
test('answers every value of every painted axis', () => {
  const painted = ['orientation', 'placement', 'variant', 'tone', 'size', 'connector'];
  for (const axis of painted) {
    for (const value of contract.axes[axis]) {
      /* The default paint of each, which no selector names. */
      if (axis === 'connector' && value === 'solid') continue;
      if (axis === 'placement' && value === 'end') continue;
      if (axis === 'size' && value === 'md') continue;
      assert.ok(normalized.includes(`[data-${axis}='${value}']`), `Missing ${axis} ${value}`);
    }
  }
});

/**
 * Each status is a shape as well as a colour: pending is the variant's own
 * mark, complete is a filled disc with the check knocked out of it, current is
 * a filled disc with a ring around it, loading is the shared spinner at a
 * dot's size. `high-contrast` paints every tone in one ink and forced colours
 * paint every ring in one, so the shape is what is left. The ring is a shadow,
 * because an outline in this library is the focus ring; forced colours drop
 * the shadow and get the ring back as an outline in their block.
 */
test('separates the statuses by shape as well as by colour', () => {
  assert.ok(
    normalized.includes(
      "[data-current][data-part='marker']{box-shadow:000var(--slotted-border-width-thick,2px)var(--_surface),000var(--_reach)var(--_tone-mark),",
    ),
    'the current marker is ringed',
  );
  assert.ok(
    normalized.includes(
      "[data-current]:not([data-loading])[data-part='marker']{outline:var(--_edge)solidCanvasText;",
    ),
    'forced colours get the ring back',
  );
  assert.match(
    normalized,
    /\[data-complete\]:not\(\[data-current\]\)\[data-part='marker'\]:empty::after\{[^}]*inset:0;[^}]*mask-image:var\(--slotted-icon-check\);/,
    'a finished dot knocks the check out of the whole disc',
  );
  assert.ok(
    normalized.includes(
      "[data-part='marker']>[data-ui='spinner']{--slotted-spinner-size:var(--_dot);",
    ),
  );
  assert.ok(normalized.includes("[data-complete][data-part='connector']"));
});

/**
 * An empty marker is a dot as large as the glyph a badge holds, and a spinner
 * is the same dot; a marker with a glyph or an avatar is a badge one step of
 * air wider than the glyph on each side. The rail widens to the badge only
 * when the timeline holds one.
 *
 * Every width the line is centred in is the line's own width plus an even
 * number of pixels, so the line stands a whole number of pixels inside it.
 * An eight-pixel dot on a one-pixel line put the line three and a half pixels
 * in, and the browser drew it one device pixel off the dot's centre at 100%,
 * 150% and 200%. The core is laid over the dot at a whole-pixel inset, never
 * centred inside it as a smaller box.
 */
test('keeps every marker width on the line parity', () => {
  assert.ok(
    normalized.includes('--_dot:calc(var(--_rule)+round(up,var(--_glyph)-var(--_rule),2px));'),
  );
  assert.ok(normalized.includes('--_core:calc(var(--_rule)+round(nearest,'));
  assert.ok(normalized.includes('--_badge:calc(var(--_rule)+round(up,'));
  assert.ok(
    normalized.includes(
      "[data-ui='timeline']:has([data-part='marker']>:not([data-ui='spinner'])){--_rail:var(--_badge);}",
    ),
  );
  assert.ok(
    normalized.includes(
      "[data-part='marker']:not(:empty,:has(>[data-ui='spinner'])){--_marker:var(--_badge);",
    ),
  );
  assert.ok(
    normalized.includes(
      "[data-part='marker']:empty::after{background-color:var(--_tone-mark);border-radius:inherit;content:'';inset:calc((var(--_marker)-var(--_core))/2);",
    ),
  );
  assert.ok(!/radial-gradient/.test(declarations), 'no gradient stands in for the dot');
});

/**
 * The line is a hairline border from the middle of this row's first line to
 * the middle of the next row's — the two markers' centres, whatever their
 * size — and the markers stand above it with a halo of the ground. A border
 * keeps its colour under forced colours where a background does not, and
 * `dashed` is then a word rather than a gradient.
 */
test('runs the line from centre to centre as a border', () => {
  assert.match(
    declarations,
    /\[data-part='connector'\] \{[^}]*border-inline-start: var\(--_rule\) solid var\(--_line\)/,
  );
  assert.ok(normalized.includes('inset-block-start:0.5lh'));
  assert.ok(normalized.includes('inset-block-end:calc(-0.5lh-var(--_item-gap))'));
  assert.ok(normalized.includes('box-shadow:000var(--_line-gap)var(--_surface)'));
  assert.ok(
    normalized.includes(
      "[data-connector='dashed'][data-part='connector']{border-block-start-style:dashed;border-inline-start-style:dashed;}",
    ),
  );
  assert.ok(!/linear-gradient/.test(declarations), 'no gradient stands in for a dash');
});

/**
 * The marker centres on the title's first line by the rule `toast` and
 * `alert` draw their marks with: half the difference between one line and the
 * mark, measured in the rail whose type is the title's.
 */
test('centres the marker on the first line of the title', () => {
  assert.ok(normalized.includes('--_lift:calc((1lh-var(--_marker))/2)'));
  assert.ok(normalized.includes('margin-block-start:var(--_lift)'));
});

/**
 * The family answers its own inline size, on the root, and its breakpoints
 * are literals because a container condition cannot read a custom property.
 */
test('reflows by container query with the breakpoints the contract records', () => {
  assert.ok(normalized.includes("[data-ui='timeline']{"));
  assert.match(declarations, /container-name: slotted-timeline;\s*container-type: inline-size;/);
  assert.ok(normalized.includes('@containerslotted-timeline(max-width:30rem)'));
  assert.ok(normalized.includes('@containerslotted-timeline(max-width:20rem)'));
  assert.equal(contract.reflow.breakpoint, '30rem');
  assert.ok(normalized.includes(":not([data-reflow='false'])"));
});

test('lets the opposite column exist only when an item projects it', () => {
  assert.ok(
    normalized.includes(":has([data-part='opposite']){--_opposite-column:var(--_opposite);}"),
  );
});

/**
 * The feed's articles are tab stops and draw the theme's ring; the three
 * controls the family paints hold hover and press back behind `:enabled`.
 */
test('draws focus on the article and guards the controls', () => {
  assert.ok(normalized.includes("[data-part='item'][tabindex]:focus-visible{"));
  for (const control of [
    "[data-part='group-trigger']",
    "[data-part='fresh']",
    "button[data-part='more']",
  ]) {
    assert.ok(normalized.includes(`${control}:enabled:hover`), `${control} hover`);
    assert.ok(normalized.includes(`${control}:enabled:active`), `${control} press`);
    assert.ok(normalized.includes(`${control}:focus-visible`), `${control} focus`);
  }
});

/**
 * The ring is `spinner`'s and the chevron is a mask from the glyph scale: the
 * family draws no arc and no character of its own.
 */
test('borrows the ring and masks the chevron', () => {
  assert.ok(!/animation:/.test(declarations), 'the family animates nothing itself');
  assert.ok(
    normalized.includes("[data-part='group-indicator']{") &&
      normalized.includes('mask-image:var(--slotted-icon-chevron-down)'),
  );
  assert.ok(!/content:\s*['"][^'"]+['"]/.test(declarations), 'no character stands in for a glyph');
});

test('renders every part in the harness fragment', () => {
  for (const part of contract.members.timeline.parts) {
    assert.ok(fragment.includes(`data-part="${part}"`), `harness renders no ${part}`);
  }
  for (const state of ['data-current', 'data-complete', 'data-loading', 'data-open']) {
    assert.ok(fragment.includes(state), `harness exercises no ${state}`);
  }
  assert.ok(fragment.includes('role="feed"'));
  assert.ok(fragment.includes('aria-posinset="1"'));
});
