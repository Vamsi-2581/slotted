import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { WORKBENCH_FONT_CODE, WORKBENCH_FONT_SANS } from './fonts.ts';

const css = await readFile(new URL('./workbench.css', import.meta.url), 'utf8');

/**
 * Prettier writes CSS with single quotes and wraps a long value over several
 * lines; the JavaScript copy is one double-quoted string. The comparison is of
 * the stacks, not of the formatting either side ended up with.
 */
const fontStack = (name) =>
  css
    .match(new RegExp(`--slotted-workbench-${name}:\\s*([^;]+);`))?.[1]
    .replace(/\s+/g, ' ')
    .replaceAll("'", '"')
    .trim();

/**
 * The primitive a family that pins itself to a viewport edge is demonstrated
 * inside. `contain: paint` is what makes the box the containing block for a
 * fixed-position child; without it a page-level bar escapes its scene, draws
 * over the page navigation, and every scene declaring one draws in the same
 * place. Added when `progress-indicator` needed to show `placement="page"`.
 */
test('offers a box a fixed-position demonstration can be pinned inside', () => {
  const rule = /\.slotted-demo-viewport\s*\{([\s\S]*?)\}/.exec(css)?.[1] ?? '';

  assert.match(rule, /contain:\s*paint/);
  assert.match(rule, /position:\s*relative/);
  assert.match(rule, /block-size:/);
});

test('workbench CSS keeps the reference-sheet layout and accessibility invariants', () => {
  assert.match(css, /@import '@fontsource-variable\/inter';/);
  assert.match(css, /@import '@fontsource-variable\/jetbrains-mono';/);
  assert.match(css, /max-inline-size:\s*1480px/);
  assert.match(css, /\.slotted-matrix-scroll\s*\{[\s\S]*?overflow-x:\s*auto/);
  assert.match(css, /@media \(max-width:\s*760px\)/);
  assert.match(css, /\.slotted-code-drawer summary:focus-visible/);
  assert.match(css, /\[data-slotted-scheme='dark'\]\s*\{/);
  assert.match(css, /\.slotted-visually-hidden\s*\{[\s\S]*?clip-path:\s*inset\(50%\)/);
  assert.match(
    css,
    /\.slotted-matrix-scroll:focus-visible,[\s\S]*?\.slotted-token-scroll:focus-visible\s*\{/,
  );
});

/**
 * A painted ground a story can stand a block-level family on, and the one that
 * states a scheme rather than inverting a surface. Both were added when `alert`
 * needed to show that its quiet variant survives a dark region — which it does
 * only when the region restates the tone roles, and does not when a single
 * surface token is flipped underneath it.
 */
/**
 * `stack` keeps every child at its own width, which a family whose members are
 * blocks cannot use: a component declaring `container-type: inline-size` has an
 * intrinsic width of zero, so a stage that shrink-wraps it collapses it to one
 * character. `block` is the column that fills instead.
 */
/**
 * The page's own prose is muted and 13.5 pixels; a paragraph a family renders
 * inside a canvas is neither. `alert`'s description is a `p`, and on a `solid`
 * alert the page was drawing it in grey on a saturated ground — a contrast the
 * family does not ship, on the one page a reader judges it from.
 *
 * `inherit` is what the reset must not use. It hands the element the
 * workbench's own type and ink rather than the family's: `inline-message` is a
 * `p`, so a field error came out at the page's 16 pixels in the page's ink
 * instead of at 12 pixels in the danger ink. `revert-layer` is the keyword that
 * rolls the property back to `slotted.components`, and the reset is addressed
 * to `[data-ui]` roots and their descendants so a demonstration's own prose is
 * left alone.
 */
test('workbench CSS returns a family’s own type and ink inside the demonstration', () => {
  const reset =
    /\.slotted-workbench-preview :is\(\[data-ui\], \[data-ui\] \*\),\s*\.slotted-reference-page :is\(\[data-ui\], \[data-ui\] \*\)\s*\{([\s\S]*?)\}/;

  const declarations = css.match(reset)?.[1];
  assert.ok(declarations, 'Missing the demonstration reset');
  for (const property of ['color', 'font-family', 'font-size', 'font-weight', 'line-height']) {
    assert.match(declarations, new RegExp(`${property}:\\s*revert-layer`));
  }
  assert.doesNotMatch(declarations, /:\s*inherit/);
  assert.ok(
    css.search(reset) > css.indexOf('.slotted-reference-page p,'),
    'the reset has to come after the rule it stands out of the way of',
  );
});

test('workbench CSS offers a column whose children fill it', () => {
  assert.match(
    css,
    /\.slotted-demo-stage\[data-layout='block'\]\s*\{[\s\S]*?align-items:\s*stretch[\s\S]*?flex-direction:\s*column[\s\S]*?flex-wrap:\s*nowrap/,
  );
});

test('workbench CSS offers a scheme-bearing ground, and a ground that stacks', () => {
  assert.match(
    css,
    /\.slotted-demo-surface\[data-surface='scheme'\]\s*\{[\s\S]*?background:\s*var\(--slotted-surface\)/,
  );
  assert.match(
    css,
    /\.slotted-demo-surface\[data-flow='stack'\]\s*\{[\s\S]*?flex-direction:\s*column/,
  );
});

test('dark workbench uses a neutral carbon surface scale', () => {
  const darkScheme = css.match(/\[data-slotted-scheme='dark'\]\s*\{([\s\S]*?)\}/)?.[1];

  assert.ok(darkScheme, 'Missing dark workbench scheme');
  assert.match(darkScheme, /--slotted-workbench-canvas:\s*#09090b/);
  assert.match(darkScheme, /--slotted-workbench-panel:\s*#111113/);
  assert.match(darkScheme, /--slotted-workbench-panel-subtle:\s*#18181b/);
  assert.match(darkScheme, /--slotted-workbench-panel-strong:\s*#27272a/);
  assert.match(darkScheme, /--slotted-workbench-border:\s*#27272a/);
  assert.match(darkScheme, /--slotted-workbench-text:\s*#fafafa/);
  assert.match(darkScheme, /--slotted-workbench-muted:\s*#a1a1aa/);
});

test('workbench CSS composes demonstrations as a continuous component lab', () => {
  assert.match(
    css,
    /\.slotted-component-lab\s*\{[\s\S]*?border:\s*1px solid var\(--slotted-workbench-border\)/,
  );
  assert.match(
    css,
    /\.slotted-component-lab__section\s*\{[\s\S]*?grid-template-columns:\s*minmax\(150px, 0\.24fr\) minmax\(0, 1fr\)/,
  );
  assert.match(
    css,
    /\.slotted-demo-grid\s*\{[\s\S]*?display:\s*grid[\s\S]*?gap:\s*var\(--slotted-workbench-scene-gap\)/,
  );
  assert.match(css, /\.slotted-demo-row\s*\{[\s\S]*?align-items:\s*center/);
  assert.match(css, /\.slotted-demo-scene__label\s*\{[\s\S]*?font-weight:\s*700/);
});

test('workbench CSS gives matrices stable geometry and centered non-empty cells', () => {
  assert.match(css, /\.slotted-matrix\s*\{[\s\S]*?inline-size:\s*100%/);
  assert.match(css, /\.slotted-matrix__cell\s*\{[\s\S]*?text-align:\s*center/);
  assert.match(css, /\.slotted-matrix__cell\s*>\s*\*\s*\{[\s\S]*?vertical-align:\s*middle/);
});

test('matrix cells never stretch icon-only controls out of their square footprint', () => {
  assert.match(
    css,
    /\.slotted-matrix__cell\s*>\s*\.slotted-button:not\(\[data-part-root='icon'\]\)\s*\{[\s\S]*?min-inline-size:\s*92px/,
  );
  assert.doesNotMatch(css, /\.slotted-matrix__cell\s*>\s*\.slotted-button\s*\{/);
  assert.match(
    css,
    /\.slotted-matrix__cell\s*>\s*\.slotted-demo-row\s*\{[\s\S]*?justify-content:\s*center/,
  );
});

test('workbench does not own icon glyph data', () => {
  assert.doesNotMatch(css, /slotted-demo-icon|mask-image:\s*url\(["']data:image\/svg\+xml/);
});

/**
 * An embedded canvas neither fills the viewport nor starts on its own border.
 * Both were wrong in turn: the story used to be a screen tall with the
 * component in the top quarter, and the correction for that took the margin
 * away with the height.
 */
test('embedded docs canvases are neither viewport-height nor edge to edge', () => {
  assert.match(
    css,
    /\.slotted-workbench-preview--embedded\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?min-block-size:\s*0;[\s\S]*?padding:\s*16px;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.slotted-workbench-preview:not\(\.slotted-workbench-preview--embedded\)\s*\{[\s\S]*?padding:\s*12px;/,
  );
});

/**
 * The stage owns the distance between the things placed on it. Before this,
 * two demonstrations dropped into a stage touched unless the story remembered
 * a row or a stack wrapper, and the ones that forgot were reviewed as if the
 * component had no margin of its own.
 */
test('a demonstration stage cannot place two examples against each other', () => {
  assert.match(
    css,
    /\.slotted-demo-stage\s*\{[\s\S]*?flex-wrap:\s*wrap[\s\S]*?gap:\s*var\(--slotted-demo-gap, 12px\)/,
  );
  assert.match(
    css,
    /\.slotted-demo-stage\[data-layout='stack'\]\s*\{[\s\S]*?flex-direction:\s*column/,
  );
  assert.match(
    css,
    /\.slotted-demo-stage\[data-layout='prose'\] > \* \+ \*\s*\{[\s\S]*?margin-block-start/,
  );
});

/**
 * A story that needs a coloured ground, a raised panel or a dense row reaches
 * for a primitive built from foundation tokens. The alternative is an inline
 * style, which answers no scheme switch and no density.
 */
test('demonstrations paint their context with tokens rather than inline styles', () => {
  /**
   * A surface is a ground, and a ground owns the distance between the examples
   * on it. Four shortcuts placed on an inverse surface touched before this,
   * because the surface was a plain block and JSX siblings produce no
   * whitespace text node.
   */
  assert.match(
    css,
    /\.slotted-demo-surface\s*\{[\s\S]*?flex-wrap:\s*wrap[\s\S]*?gap:\s*var\(--slotted-demo-gap, 12px\)/,
  );
  /**
   * A menu row whose item is unavailable dims its label and the value beside
   * it. A family whose bare form inherits its colour cannot be shown honestly
   * against a label that stays bright.
   */
  assert.match(
    css,
    /\.slotted-demo-rows > \[data-disabled\],[\s\S]*?\+ \*\s*\{[\s\S]*?color:\s*var\(--slotted-disabled-foreground\)/,
  );
  assert.match(
    css,
    /\.slotted-demo-surface\[data-surface='inverse'\]\s*\{[\s\S]*?background:\s*var\(--slotted-surface-inverse\)/,
  );
  assert.match(
    css,
    /\.slotted-demo-surface\[data-surface='raised'\]\s*\{[\s\S]*?background:\s*var\(--slotted-surface-raised\)/,
  );
  assert.match(css, /\.slotted-demo-rows\s*\{[\s\S]*?grid-template-columns:\s*1fr auto/);
});

test('a reference page spaces every demonstration as caption, canvas and source', () => {
  assert.match(css, /\.slotted-reference-scenes\s*\{[\s\S]*?display:\s*grid[\s\S]*?gap:/);
  assert.match(css, /\.slotted-reference-scene__header h3\s*\{/);
  assert.match(
    css,
    /\.slotted-reference-scene \.slotted-code-drawer\s*\{[\s\S]*?margin-block-start/,
  );
  /**
   * The inset has to survive the docs theme's own `dl` reset, and the value
   * column has to be allowed to be narrower than its longest word.
   */
  assert.match(
    css,
    /\.slotted-reference-import__facts\s*\{[\s\S]*?grid-template-columns:\s*auto minmax\(0, 1fr\)[\s\S]*?padding:[^;]*!important/,
  );
});

/**
 * A page that clips its own import statement teaches the wrong import. Both
 * the code block and the tables wrap rather than running under the edge of the
 * page, where a scroll container hid them without saying so.
 */
test('a reference page never clips the code or the tables it exists to show', () => {
  /**
   * Both elements, not just the outer one. The docs theme sets
   * `white-space: pre` on the `code` inside, so a `pre` that wraps alone still
   * clips a long import at the column edge.
   */
  assert.match(
    css,
    /\.slotted-reference-import pre,\s*\.slotted-reference-import pre code\s*\{[\s\S]*?white-space:\s*pre-wrap/,
  );
  assert.match(css, /\.slotted-api-table th,[\s\S]*?\{[\s\S]*?white-space:\s*nowrap/);
  /**
   * Name, type and notes all carry a floor. Without one on the type column a
   * long union is broken a character at a time, which is unreadable in a way
   * a horizontal scrollbar is not.
   */
  assert.match(css, /\.slotted-api-table td:nth-child\(2\)\s*\{[\s\S]*?min-inline-size:\s*20ch/);
  assert.match(css, /\.slotted-api-table td code,[\s\S]*?\{[\s\S]*?overflow-wrap:\s*anywhere/);
});

/**
 * The `<pre>` carries the monospaced family; the `<code>` inside it carries the
 * user-agent's own and every highlighted token span carries the docs theme's
 * sans stack. Both beat inheritance, so without this rule the snippet a reader
 * copies is set in a proportional face.
 */
test('every snippet renders in the monospaced family its block declares', () => {
  assert.match(
    css,
    /\.slotted-code-drawer__source,[\s\S]*?\{[\s\S]*?font:[^;]*var\(--slotted-workbench-font-code\)/,
  );
  assert.match(
    css,
    /\.slotted-code-drawer__source code,\s*\.slotted-code-drawer__source code \*,[\s\S]*?font:\s*inherit/,
  );
});

/**
 * Storybook takes its two stacks as JavaScript and the workbench sets its own
 * in CSS, so the same two strings live on both sides of that boundary. They
 * are written once in `fonts.ts`; this holds the CSS copy to it.
 *
 * `ui-monospace` stays out of the code stack: on Linux Chrome the keyword
 * resolves to the platform's default proportional face instead of falling
 * through, so naming it before a real monospaced font sets code in a
 * proportional one while still reporting a monospaced `font-family`.
 */
test('the workbench sets type in one pair of stacks', () => {
  assert.equal(fontStack('font-sans'), WORKBENCH_FONT_SANS);
  assert.equal(fontStack('font-code'), WORKBENCH_FONT_CODE);
  assert.match(WORKBENCH_FONT_CODE, /^"JetBrains Mono Variable"/);
  assert.doesNotMatch(WORKBENCH_FONT_CODE, /ui-monospace/);
  assert.doesNotMatch(css, /font(-family)?:[^;]*ui-monospace/);
});

test('scenes placed side by side start their stages on the same line', () => {
  assert.match(
    css,
    /\.slotted-demo-grid > \.slotted-demo-scene\s*\{[\s\S]*?grid-template-rows:\s*subgrid/,
  );
  assert.match(css, /\.slotted-demo-grid\s*\{[\s\S]*?grid-auto-rows:\s*auto/);
});

/**
 * `subgrid` outside a grid parent stops the stage at its own `min-block-size`,
 * and everything taller than that is drawn over the scenes below.
 */
test('a scene outside a demonstration grid asks for no subgrid', () => {
  const scene = css.match(/\n\.slotted-demo-scene\s*\{([\s\S]*?)\}/)?.[1];

  assert.ok(scene, 'Missing .slotted-demo-scene rule');
  assert.doesNotMatch(scene, /subgrid/);
  assert.doesNotMatch(scene, /grid-row/);
});

/**
 * The matrix declares a minimum width and scrolls inside its own container.
 * As a flex item with `min-width: auto` that container stopped shrinking and
 * covered the scene beside it, so the stage clamps what it holds.
 */
test('nothing placed on a stage can grow wider than the stage', () => {
  assert.match(
    css,
    /\.slotted-demo-stage > \*\s*\{[\s\S]*?max-inline-size:\s*100%[\s\S]*?min-inline-size:\s*0/,
  );
});

/**
 * A set of choices is a list, and a family whose root can be substituted for a
 * `li` needs somewhere valid to put it. The user agent brings a marker and an
 * inset with a `ul`, and a stray bullet in a demonstration is the kind of
 * defect a reader finds and a test does not.
 */
test('the demonstration list is a list with no marker and no inset', () => {
  const list = css.match(/\n\.slotted-demo-list\s*\{([\s\S]*?)\}/)?.[1];

  assert.ok(list, 'Missing .slotted-demo-list rule');
  assert.match(list, /list-style:\s*none/);
  assert.match(list, /margin:\s*0/);
  assert.match(list, /padding:\s*0/);
  assert.match(list, /min-inline-size:\s*0/);
});
