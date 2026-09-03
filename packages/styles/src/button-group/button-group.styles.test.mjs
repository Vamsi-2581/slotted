import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/button-group/contract.json', import.meta.url),
    'utf8',
  ),
);
const buttonContract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/button/contract.json', import.meta.url),
    'utf8',
  ),
);
const buttonCss = readFileSync(new URL('../button/button.css', import.meta.url), 'utf8');
const css = readFileSync(new URL('./button-group.css', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
/**
 * The same sheet with every space taken out. A selector's shape survives a
 * formatter reflowing it across three lines; an assertion written against one
 * particular line break does not.
 */
const dense = declarations.replace(/\s+/g, '');
const group = `[data-ui='${contract.ui}'][data-attached]`;

/** Attributes, ids and classes in one selector — the middle of the triple. */
function specificity(selector) {
  const withoutNot = selector.replace(/:not\(([^()]*)\)/g, '$1');
  return (withoutNot.match(/\[[^\]]+\]|:[a-z-]+/g) ?? []).length;
}

/** Every selector in the sheet, one entry per comma-separated selector. */
function selectorsOf(source) {
  return [...source.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(^|\})([^{}]+)\{/g)]
    .map(([, , selector]) => selector.trim())
    .filter((selector) => selector.length > 0 && !selector.startsWith('@'))
    .flatMap((selector) => selector.split(','))
    .map((selector) => selector.replace(/\s+/g, ' ').trim())
    .filter((selector) => selector.length > 0);
}

/**
 * A joined bar has one edge, and one edge cannot be the sum of several
 * controls' opinions about their own. `button` repaints its whole border when
 * it is pressed or unavailable — correctly, for a control standing on its own —
 * and inside a bar that punched a hole in the frame exactly where that control
 * sat: the capture of a vertical segmented control with the middle segment on
 * had a gap in its left edge.
 */
test('takes the bar edge back from a control whose state would repaint it', () => {
  for (const variant of ['outline', 'ghost']) {
    for (const state of ['[data-pressed]', '[data-disabled]', ':disabled']) {
      const selector = `${group}>[data-ui='button'][data-variant='${variant}']${state}`;
      assert.ok(
        dense.includes(selector.replace(/\s+/g, '')),
        `the group leaves the bar edge to a ${state} ${variant} control`,
      );
    }
  }
});

/**
 * Specificity is the mechanism, so it is the thing to hold. Every rule the
 * group writes over a control's own border has to outrank every rule `button`
 * writes for that border, whatever order the two sheets happen to load in.
 */
test('outranks every border rule the button family writes', () => {
  const buttonBorderRules = selectorsOf(buttonCss).filter((selector) => {
    const body = buttonCss.split(`${selector}`)[1] ?? '';
    return /border-color|border-inline|border-block/.test(body.split('}')[0] ?? '');
  });
  const strongest = Math.max(...buttonBorderRules.map(specificity), 0);

  const overrides = selectorsOf(css).filter((selector) =>
    /\[data-variant='(outline|ghost|solid)'\]/.test(selector),
  );
  assert.ok(overrides.length > 0, 'the group writes no border rule at all');

  for (const selector of overrides) {
    assert.ok(
      specificity(selector) > strongest,
      `"${selector}" scores ${specificity(selector)} and has to beat ${strongest}`,
    );
  }
});

/**
 * The overlap puts two borders in the same one-pixel column. They are the same
 * colour and the same width, so on paper they are one line — and they are,
 * until the page is zoomed: the browser snaps each border box to device pixels
 * on its own, so at 110%, 150% and 175% one boundary lands on a single column
 * and the next lands across two. Five of fifteen photographed boundaries came
 * out uneven before this rule existed, which is what a reader sees as one
 * divider twice as thick as its neighbour.
 *
 * Exactly one border is painted there, and it is the leading edge of the
 * control that follows. A rule between two runs stands in that same column,
 * so it changes which colour is painted there and never how many borders are.
 */
test('paints one border in each shared column, not two stacked ones', () => {
  for (const [axis, edge] of [
    ["[data-attached]:not([data-orientation='vertical'])", 'border-inline-end-color'],
    ["[data-attached][data-orientation='vertical']", 'border-block-end-color'],
  ]) {
    const selector = `[data-ui='${contract.ui}']${axis}>[data-ui='button']:not(:last-child)`;
    const body = dense.split(selector.replace(/\s+/g, ''))[1]?.split('}')[0] ?? '';
    assert.equal(
      body.replace('{', ''),
      `${edge}:transparent;`,
      `the trailing edge is still painted, so the column can hold two borders`,
    );
  }
});

/**
 * The trailing edge is taken out of the paint, never narrowed. A narrower
 * border box would move the glyph inside an icon-only control by half a pixel,
 * which trades one misalignment for another.
 */
test('takes the trailing edge out of the paint rather than out of the box', () => {
  assert.ok(
    !/border-(inline|block)-end-width/.test(dense),
    'the group narrows a control instead of unpainting its edge',
  );
});

/**
 * The seam is the darkest step of the control's own tone, which is what Primer,
 * Material UI, Ant Design and Bootstrap all reach for. `--slotted-surface` was
 * tried first and the capture refused it: a white line through a filled bar
 * cuts it into separate buttons instead of dividing one bar.
 */
test('reads the seam from the tone the control declares in public', () => {
  for (const edge of ['border-inline-start-color', 'border-block-start-color']) {
    assert.ok(dense.includes(`${edge}:var(--_seam`), `the seam is missing from ${edge}`);
  }
  for (const tone of buttonContract.axes.tone) {
    assert.ok(
      dense.includes(
        `[data-tone='${tone}']{--_seam:var(--slotted-tone-${tone}-${contract.seam.colorRole})`,
      ),
      `the ${tone} tone has no seam of its own`,
    );
  }
});

/**
 * Hover and press are raised by Primer, Polaris and shadcn because in those
 * libraries a touched control repaints its own edge. Here the edge is the
 * group's, so nothing about it changes and there is nothing to lift. Focus is
 * the exception: its ring is an outline drawn outside the border box, and
 * without the lift it is cut by whichever neighbour follows it in the DOM.
 */
test('lifts a joined control for focus and for nothing else', () => {
  const lifting = [...declarations.matchAll(/(^|\})([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, , , body]) => /(^|;|\s)z-index\s*:/.test(body))
    .map(([, , selector]) => selector.replace(/\s+/g, ' ').trim());

  assert.ok(lifting.length > 0, 'nothing is lifted, so the focus ring is cut by its neighbour');
  for (const selector of lifting) {
    assert.ok(
      selector.includes(':focus-visible'),
      `"${selector}" lifts a control for something other than focus`,
    );
  }
});

/**
 * A thick rule inside a bar of hairlines is not a stronger boundary, it is a
 * slab: the capture of a vertical joined bar with a rule before its
 * destructive action showed a grey block cutting the component in half. The
 * boundary a framed bar needs is distance, which a nested group already gives.
 */
test('draws the rule at one border width and no more', () => {
  assert.ok(
    !css.includes('--slotted-border-width-thick'),
    'the separator is thicker than the edges it stands among',
  );
});

/**
 * A joined bar is one shape, and a rule is not licence to cut it. Inside one
 * the rule stops being a box: no width, no height, no margin. What it marks is
 * painted on the leading edge of the control that follows, which is the one
 * edge the overlap already leaves in the shared column.
 *
 * It had a column of its own before this, and the bar paid for it twice. A
 * control with its edge taken out still occupies the column it gave up, so the
 * boundary came out three pixels wide beside seams of one: every capture of a
 * framed bar showed one divider thicker than its neighbours.
 */
test('gives the rule no column of its own inside a joined bar', () => {
  const body = dense.split(`${group}>[data-part='separator']{`)[1]?.split('}')[0] ?? '';
  for (const declaration of ['inline-size:0', 'block-size:0', 'margin:0']) {
    assert.ok(
      body.includes(declaration),
      `the rule keeps its ${declaration.split(':')[0]} inside a joined bar, so the boundary is wider than a seam`,
    );
  }
});
