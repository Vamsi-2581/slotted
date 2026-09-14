import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('./app-shell.css', import.meta.url), 'utf8');
const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/app-shell/contract.json', import.meta.url),
    'utf8',
  ),
);

/** The body of the first rule whose selector matches, comments and all. */
function rule(selector) {
  const at = css.indexOf(selector);
  assert.notEqual(at, -1, `no rule for ${selector}`);
  const open = css.indexOf('{', at);
  const close = css.indexOf('\n  }', open);
  return { body: css.slice(open, close), at };
}

/**
 * The breakpoint is a literal because `@container (inline-size: var(--x))` is
 * invalid CSS, and the same number has to reach script: the stylesheet decides
 * where the navigation is drawn and the script decides whether `Escape`, the
 * focus scope and `inert` are in play. Two literals is how the two drift apart.
 */
test('reads the same breakpoint the contract states, and no other', () => {
  const conditions = [...css.matchAll(/@container\s+slotted-app-shell\s+\(([^)]*)\)/g)].map(
    ([, condition]) => condition.trim(),
  );

  assert.ok(conditions.length > 0, 'the family answers no width at all');
  for (const condition of conditions) {
    assert.match(
      condition,
      new RegExp(`^inline-size (>=|<) ${contract.overlayAt}px$`),
      `${condition} states a width the contract does not`,
    );
  }
});

/**
 * The defect this test exists for, in the reviewer's words: the overlaid
 * navigation showed "just a dark scrim and nothing else".
 *
 * `navMode` is an axis a consumer may state at any width. With the layer's
 * geometry inside the narrow container query, forcing the mode on a wide screen
 * left the region a static column while the script applied the veil, the focus
 * scope and `inert` — a dark screen with nothing on it. The mode owns the
 * geometry; the width only ever decides the mode.
 */
test('draws the layer from the mode, never from the width', () => {
  const layer = rule("[data-nav-mode='overlay'] > [data-part='nav'] {");
  assert.match(layer.body, /position:\s*absolute/);
  assert.match(layer.body, /z-index:/);
  assert.match(layer.body, /translate:\s*-100% 0/);

  /* Every `@container` before it has already closed, so the rule is not inside
     one: a width query would put the mode back under the width's control. */
  const before = css.slice(0, layer.at);
  const opened = (before.match(/@container/g) ?? []).length;
  const closed = (before.match(/\n {2}\}\n/g) ?? []).length;
  assert.ok(opened <= closed, 'the layer is written inside a width query');
});

/**
 * `container-type: inline-size` makes an element a query container for its
 * descendants and not for itself, so the root cannot rewrite its own template
 * from its own query. Every region places itself instead.
 */
test('never rewrites the root template from the root own query', () => {
  const blocks = css.slice(css.indexOf('@container slotted-app-shell'));
  assert.equal(/grid-template/.test(blocks), false);
  assert.match(css, /container-type:\s*inline-size/);
});

/**
 * An absolutely positioned grid child placed into a definite area takes *that
 * area* as its containing block rather than the grid's padding box. The panel
 * therefore stops under the banner without anyone measuring it — and when the
 * area was the body row alone, `max-inline-size: 80%` resolved against a column
 * with nothing in it and clamped a 240-pixel panel to zero.
 */
test('gives the layer the rows it should cover, and the veil the same ones', () => {
  assert.match(
    rule("[data-nav-mode='overlay'] > [data-part='nav'] {").body,
    /grid-area:\s*2 \/ 1 \/ -1 \/ -1/,
  );
  assert.match(rule("> [data-part='scrim'] {").body, /grid-area:\s*2 \/ 1 \/ -1 \/ -1/);
});

/**
 * One grid of measures. Every left edge in the frame is one of two sums of the
 * three, and they are published because the rows inside the regions belong to
 * `side-navigation`, wave 8.
 */
test('publishes the six measures its rows stand on', () => {
  for (const token of Object.keys(contract.published).filter((key) => key.startsWith('--'))) {
    assert.match(css, new RegExp(`${token}: var\\(--_row-`), `${token} is not published`);
  }
  /* A row is text, not a control: the type composes the type scale. */
  const flat = css.replace(/\s+/g, ' ');
  assert.match(
    flat,
    /--_row-font-size: var\( ?--slotted-app-shell-row-text-size, var\(--slotted-font-size-sm/,
  );
  assert.match(
    flat,
    /--_row-line-height: var\( ?--slotted-app-shell-row-text-line-height, var\(--slotted-line-height-sm/,
  );
  /* And a row is as tall as its mark box, or the mark is off-centre in it. */
  assert.match(css, /--slotted-app-shell-row-height: var\(--_row-mark\)/);
  /* The control in the bar is the mark column, or it does not stand over the
     marks in the column. */
  const toggle = rule("[data-part='aside-toggle'] {");
  assert.match(toggle.body, /inline-size:\s*var\(--_row-mark\)/);
  assert.match(toggle.body, /block-size:\s*var\(--_row-mark\)/);
  /* A rail is one mark column with a row's inset on each side, so it is
     centred in itself rather than being a column with its air on one side. */
  assert.match(css, /--_rail-size:[\s\S]*?var\(--_row-mark\) \+ var\(--_row-inset\) \* 2/);
});

/**
 * The frame is one plane under `inset` and the gutter separates it. A rule
 * *across* it would be the hairline the plane replaced — the banner's own
 * bottom edge included, which outlived the decision by a pass. A closed
 * outline is a different thing: it is the card's own edge, and it goes with
 * the radius and the elevation on the same rule.
 */
test('separates the inset canvas with a gutter and not with a rule', () => {
  for (const [, body] of css.matchAll(/\[data-canvas='inset'\][^{]*\{([^}]*)\}/g)) {
    assert.equal(
      /border-(block|inline)(-start|-end)?:\s*var\(--_rule-width\)/.test(body),
      false,
      'the inset canvas draws a rule between two regions',
    );
    if (/border:\s*var\(--_rule-width\)/.test(body)) {
      assert.match(body, /border-radius:/, 'a closed outline without a radius is a rule');
    }
  }
  /* Every rule the family draws between two regions is under `flush`. The
     whole selector is read, not the fragment from `[data-dividers]` on: a
     selector list spans lines and the canvas is written before the axis. */
  for (const hit of [...css.matchAll(/\[data-dividers\]/g)]) {
    const start = Math.max(css.lastIndexOf('}', hit.index), css.lastIndexOf('{', hit.index)) + 1;
    const selector = css.slice(start, css.indexOf('{', hit.index));
    assert.match(
      selector,
      /data-canvas='flush'/,
      `${selector.trim().replace(/\s+/g, ' ')} draws a rule outside flush`,
    );
  }
  assert.match(css, /border-radius:\s*var\(--_radius\)/);
  assert.match(css, /box-shadow:\s*var\(--_elevation\)/);
  /* The gutter is a margin, so the navigation's own box is the strip a reader
     sees and a rail is centred in itself. */
  const inset = rule("[data-canvas='inset'] > [data-part='nav'] {");
  assert.match(inset.body, /margin-inline-start:\s*var\(--_gutter\)/);
  assert.equal(/padding-inline-start/.test(inset.body), false);
});

/**
 * Every region is repaintable on its own, and the plane only decides the
 * default. A shell whose column is dark over a light frame is one declaration.
 */
test('gives every region a ground and an ink of its own', () => {
  for (const region of ['banner', 'nav', 'main', 'aside', 'footer']) {
    const body = rule(`> [data-part='${region}'] {`).body.replace(/\s+/g, ' ');
    assert.match(
      body,
      new RegExp(`background-color: var\\( ?--slotted-app-shell-${region}-surface,`),
      `${region} cannot be repainted on its own`,
    );
    assert.match(
      body,
      new RegExp(
        `color: var\\( ?--slotted-app-shell-${region}-color, var\\(--slotted-app-shell-color, var\\(--slotted-text`,
      ),
      `${region} has no ink of its own`,
    );
    /* Not a local held on the frame. A `var()` resolves where the declaration
       stands, so a default kept on the root hands a region carrying
       `data-slotted-scheme="dark"` the light scheme's ink over its own dark
       ground — which is what the harness photographed before this. */
    assert.equal(
      /var\(--_(banner|nav|main|aside|footer)-(surface|ink)\)/.test(body),
      false,
      `${region} reads a paint the frame resolved for it`,
    );
    /* And the plane is a second declaration on the region, not a second local. */
    assert.match(
      rule(`[data-canvas='flush'] > [data-part='${region}'] {`).body.replace(/\s+/g, ' '),
      new RegExp(`background-color: var\\( ?--slotted-app-shell-${region}-surface,`),
      `${region} takes no ground of its own under flush`,
    );
  }
  /* And the control is of the region it stands in, whatever that was painted:
     read from a token it kept the light scheme's ink over a dark column. */
  assert.match(
    rule("[data-part='aside-toggle'] {").body,
    /color: color-mix\(in oklab, currentcolor/,
  );
});

/**
 * The closed strip is centred in itself under both planes. It was not: the
 * gutter was `padding-inline-start` on the region, so the fifty-pixel strip
 * carried twelve pixels on one side and none on the other — once under `inset`
 * as `padding`, and once more under `flush` after the first was fixed.
 */
test('adds nothing to one side of the region under either plane', () => {
  const inset = rule("[data-canvas='inset'] > [data-part='nav'] {");
  assert.equal(/padding-inline/.test(inset.body), false, 'inset pads the region on one side');
  const flush = rule("[data-canvas='flush'] > [data-part='nav'] {");
  assert.equal(/padding-inline/.test(flush.body), false, 'flush pads the region on one side');
});

/**
 * The rail is a width and nothing else. What a destination shows at that width
 * belongs to `side-navigation`, which answers the region's own query rather
 * than being told.
 */
test('makes the navigation region a query container of its own', () => {
  assert.match(css, /container-name:\s*slotted-app-shell-nav/);
});

/**
 * And the bar, for the same reason: under `primary='nav'` the bar is the
 * frame's width less the navigation's, so a bar told the frame's width is told
 * a width it does not have. A 428-pixel frame with a 288-pixel column left the
 * bar 140 pixels and four controls that needed 196.
 */
test('makes the bar a query container of its own', () => {
  assert.match(css, /container-name:\s*slotted-app-shell-banner/);
  /* And it may be narrower than what it holds without pushing the frame out. */
  const actions = rule("> [data-part='banner'] > [data-part='actions'] {");
  assert.match(actions.body, /min-inline-size:\s*0/);
});

/** Every part the contract declares is painted, and no rule names another. */
test('paints every part the contract declares and no other', () => {
  const painted = new Set(
    [...css.matchAll(/\[data-part=['"]([a-z-]+)['"]\]/g)].map(([, part]) => part),
  );
  const declared = new Set(contract.members.appShell.parts);

  for (const part of declared) {
    if (part === 'root') continue;
    assert.ok(painted.has(part), `${part} is declared and never painted`);
  }
  for (const part of painted) {
    assert.ok(declared.has(part), `the stylesheet paints ${part}, which is not a declared part`);
  }
});

/**
 * The mark on the disclosure control is geometry from the glyph scale, and it
 * is the pair the contract names: one artwork with the chevron turned, drawing
 * the region the control toggles.
 */
test('draws the disclosure mark from the pair the contract names', () => {
  assert.match(css, new RegExp(`mask-image:\\s*var\\(${contract.mark.open}\\)`));
  assert.match(css, new RegExp(`mask-image:\\s*var\\(${contract.mark.close}\\)`));
  assert.equal(/--slotted-icon-chevrons-right/.test(css), false);
});

/**
 * The pane is a layer by its mode and a column by the width, exactly as the
 * navigation is — the same defect the navigation's test exists for would put
 * the pane's geometry under the width's control.
 */
test('draws the pane layer from the mode, and the pane column from the width', () => {
  const layer = rule("[data-aside-mode='overlay'] > [data-part='aside'] {");
  assert.match(layer.body, /position:\s*absolute/);
  assert.match(layer.body, /grid-area:\s*2 \/ 1 \/ -1 \/ -1/);
  assert.match(layer.body, /translate:\s*100% 0/);
  const before = css.slice(0, layer.at);
  const opened = (before.match(/@container/g) ?? []).length;
  const closed = (before.match(/\n {2}\}\n/g) ?? []).length;
  assert.ok(opened <= closed, 'the pane layer is written inside a width query');

  /* Every width rule for the pane leaves the layer alone. */
  const queries = css.slice(css.indexOf('@container slotted-app-shell ('));
  for (const hit of [...queries.matchAll(/> \[data-part='aside'\]/g)]) {
    const start =
      Math.max(queries.lastIndexOf('}', hit.index), queries.lastIndexOf('{', hit.index)) + 1;
    const selector = queries.slice(start, hit.index).replace(/\s+/g, '');
    assert.match(selector, /:not\(\[data-aside-mode/, `${selector} places the layer by width`);
  }
  /* Closed, the pane leaves the layout: it has no rail. */
  const shut = css.indexOf(
    ":not([data-aside-mode='overlay']) > [data-part='aside']:not([data-open])",
  );
  assert.notEqual(shut, -1, 'a closed pane has no rule');
  assert.match(css.slice(shut, css.indexOf('}', shut)), /display:\s*none/);
});

/** The pane pins its ends and scrolls its middle, as the column does. */
test('gives the pane a pinned head, a scrolling body and a pinned foot', () => {
  assert.match(rule("> [data-part='aside'] > [data-part='aside-body'] {").body, /overflow:\s*auto/);
  assert.match(rule("> [data-part='aside'] > [data-part='aside-body'] {").body, /flex:\s*1 1 auto/);
  const ends = rule("> [data-part='aside'] > [data-part='aside-header'],").body;
  assert.match(ends, /flex:\s*0 0 auto/);
  assert.match(ends, /padding-block:\s*var\(--_row-inset\)/);
  /* And the middle of the bar grows, so a bar is three clusters and no void. */
  const centre = rule("> [data-part='banner'] > [data-part='centre'] {").body;
  assert.match(centre, /flex:\s*1 1 auto/);
  assert.match(centre, /min-inline-size:\s*0/);
});

/**
 * One control, two regions. The pane's control is the navigation's turned,
 * and both read their state — the root's attribute for the navigation, the
 * control's own `aria-expanded` for the pane, because the pane's attribute is
 * on the region and the control may stand outside it.
 */
test('draws the pane control as the navigation control turned', () => {
  assert.match(
    css,
    /\[data-part='nav-toggle'\],\s*\[data-ui='app-shell'\] \[data-part='aside-toggle'\] \{/,
  );
  assert.match(css, /\[data-part='aside-toggle'\]\[aria-expanded='true'\]::before/);
  assert.match(css, /:not\(\[data-nav-side='end'\]\) \[data-part='aside-toggle'\]::before/);
});
