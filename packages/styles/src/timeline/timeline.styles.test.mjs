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
 * Each status is a shape as well as a colour: a target for the current event,
 * a filled disc with a check for a finished one, the shared ring for one still
 * arriving. `high-contrast` paints every tone in one ink, and the shape is
 * what is left.
 */
test('separates the statuses by shape as well as by colour', () => {
  assert.ok(
    normalized.includes(
      "[data-current][data-part='marker']:empty::after{--_radius:calc(var(--_dot)*0.65);",
    ),
    'the current dot is larger than a pending one',
  );
  assert.ok(
    normalized.includes(
      'mask-image:var(--slotted-timeline-complete-icon,var(--slotted-icon-check))',
    ),
  );
  assert.ok(normalized.includes("[data-part='marker']>[data-ui='spinner']"));
  assert.ok(normalized.includes("[data-complete][data-part='connector']"));
});

/**
 * The line is a border, not a painted background: a border keeps its colour
 * under forced colours where a background does not, and `dashed` is then a
 * word rather than a gradient. The dot is the one painted background, and it
 * keeps its ink through `forced-color-adjust`.
 */
test('draws the dot at the geometric centre and the line as a border', () => {
  /**
   * A gradient on a box that fills the ring, never a smaller box centred in
   * it: a box snaps to device pixels edge by edge and lands off centre at
   * 110% zoom, a gradient is rasterised at the centre whatever the ratio.
   */
  assert.match(
    declarations,
    /\[data-part='marker'\]:empty::after \{[^}]*background-image: radial-gradient\([^}]*inset: 0;[^}]*position: absolute;/,
  );
  assert.ok(
    normalized.includes("[data-part='marker']:empty::after{--_radius:calc(var(--_dot)/2);"),
  );
  assert.ok(
    normalized.includes('mask-size:var(--_icon)'),
    'the check is masked on the same full box',
  );
  assert.match(
    declarations,
    /\[data-part='connector'\] \{[^}]*border-inline-start: var\(--_rule\) solid var\(--_line\)/,
  );
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
