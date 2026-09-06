import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/checkbox/contract.json', import.meta.url),
    'utf8',
  ),
);
const css = readFileSync(new URL('./checkbox.css', import.meta.url), 'utf8');
const fragment = readFileSync(new URL('./checkbox.harness.html', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
const normalized = declarations
  .replace(/\s+/g, ' ')
  .replace(/\s*([{};,:>])\s*/g, '$1')
  .replace(/\(\s+/g, '(')
  .replace(/\s+\)/g, ')');

const ui = `[data-ui='${contract.ui}']`;
const root = `${ui}[data-part='root']`;
const member = contract.members.checkbox;

function rule(selector) {
  return normalized.split(`${selector}{`)[1]?.split('}')[0] ?? '';
}

/** A part reached from anywhere inside the family's own root. */
const part = (name) => `${ui} [data-part='${name}']`;

test('lives in the component layer', () => {
  assert.match(css, /@layer slotted\.components/);
});

test('is selected by the identifier the contract declares', () => {
  assert.ok(normalized.includes(`${root}{`), 'the family has no base rule keyed on data-ui');
});

test('styles every part the contract declares', () => {
  for (const part of member.parts) {
    if (part === 'root') continue;
    assert.ok(normalized.includes(`[data-part='${part}']`), `no rule reaches the ${part} part`);
  }
});

test('renders every part the contract declares, in at least one scene', () => {
  for (const part of member.parts) {
    assert.match(fragment, new RegExp(`data-part="${part}"`), `${part} appears in no scene`);
  }
});

/**
 * The mark is the control's next sibling, and every rule that paints it says
 * so. A descendant selector would keep working while the indicator drifted
 * anywhere inside the root, and the `+` combinator is the whole reason the
 * picture cannot disagree with the element's own `:checked`.
 */
test('paints the mark from the control it stands on, through the sibling combinator', () => {
  assert.ok(
    normalized.includes(`${part('control')}:checked + [data-part='indicator']`),
    'checked does not reach the mark through the control',
  );
  assert.ok(
    normalized.includes(`${part('control')}:indeterminate + [data-part='indicator']`),
    'mixed does not reach the mark through the control',
  );
});

/**
 * Two glyphs, one property. The check and the dash are the same mask pointed at
 * a different token, so the two states cannot drift apart into two mechanisms.
 */
test('draws both marks as a mask from the glyph scale, never as a character', () => {
  const indicator = rule(part('indicator'));
  assert.match(indicator, /mask-image:var\(--_glyph\)/);
  assert.match(
    indicator,
    /--_glyph:var\(--slotted-checkbox-mark-image,var\(--slotted-icon-check\)\)/,
  );
  assert.ok(
    normalized.includes('--_glyph:var(--slotted-checkbox-mixed-image,var(--slotted-icon-minus))'),
  );
  /* An empty `content` materialises a box — the tile's edge, the stretched
     target — and is not a mark. What is refused is a character standing in for
     artwork, so the pattern is a string with something in it. */
  assert.doesNotMatch(declarations, /content:\s*['"][^'"]/);
});

/**
 * The square is the selection scale's, which the theme states once and density
 * does not move: the control glyph scale fell to twelve pixels at `dense`,
 * below the size a mark can be drawn in (CK1, CK3).
 */
test('takes its box from the selection scale, at every density', () => {
  assert.match(
    rule(root),
    /--_size:var\(--slotted-checkbox-size,var\(--slotted-selection-size-md,16px\)\)/,
  );
  for (const [size, px] of [
    ['sm', '14px'],
    ['md', '16px'],
    ['lg', '18px'],
  ]) {
    assert.match(
      rule(`${root}[data-size='${size}']`),
      new RegExp(
        `--_size:var\\(--slotted-checkbox-size,var\\(--slotted-selection-size-${size},${px}\\)\\)`,
      ),
      `data-size="${size}" does not read the selection scale`,
    );
  }
  assert.doesNotMatch(declarations, /--slotted-control-icon-size-/);
});

/**
 * The edge and the corner (CK1): the medium step of the border scale in the
 * strong border colour, and the smallest radius, so the square does not read
 * as the radio's circle's cousin.
 */
test('edges the box at the medium step, in the strong colour, with the smallest corner', () => {
  const control = rule(part('control'));
  assert.match(
    control,
    /border:var\(--slotted-checkbox-border-width,var\(--slotted-border-width-medium,1\.5px\)\) solid var\(--slotted-checkbox-border-color,var\(--slotted-border-strong,ButtonBorder\)\)/,
  );
  assert.match(
    control,
    /border-radius:var\(--slotted-checkbox-radius,var\(--slotted-radius-xs,2px\)\)/,
  );
});

/**
 * The glyph is its own box, the square less a whole-pixel clearance on every
 * side, so the two are concentric at every step and every density — the
 * measurement CK4 asks for and CK6 takes off the picture rather than off the
 * layout (the painted ink against the painted square, centre difference
 * ≤ 0.5px).
 *
 * The clearance is a length and not a fraction of the square. A fraction gives
 * a mark of fractional size at a fractional offset, and the two are snapped to
 * the pixel grid apart from each other: fifteen hundredths of a 16px box put
 * the ink half a pixel to the start side and drew the same `md` control at
 * 8.70 × 6.40px in one density and 10.20 × 7.50px in another (CK6).
 */
test('draws the glyph in a box the square clears by a whole pixel on every side', () => {
  assert.match(rule(root), /--_mark-inset:var\(--slotted-checkbox-mark-inset,2px\)/);
  assert.match(rule(root), /--_mark-size:calc\(var\(--_size\) - 2 \* var\(--_mark-inset\)\)/);
  const indicator = rule(part('indicator'));
  assert.match(indicator, /block-size:var\(--_mark-size\)/);
  assert.match(indicator, /inline-size:var\(--_mark-size\)/);
  assert.match(indicator, /margin-block-start:calc\(var\(--_lift\) \+ var\(--_mark-inset\)\)/);
  assert.match(indicator, /margin-inline-start:var\(--_mark-inset\)/);
  assert.match(indicator, /mask-size:contain/);
  /** A ratio of the box is what CK6 took out; it must not come back. */
  assert.doesNotMatch(declarations, /--_mark-size:\s*calc\(var\(--_size\)\s*\*/);
});

/**
 * The halo (CK1): a circle twice the box, behind it, lit under the pointer. It
 * is the label's pseudo-element because the label toggles the control, and it
 * sits at a negative stack level inside the root's own stacking context. It is
 * the box's own circle with its shadow spread to the halo size — ink, so the
 * thirty-two pixels are scrollable overflow nowhere.
 */
test('draws the halo behind the box as ink on the label, lit by hover alone', () => {
  const halo = rule(`${root}:not([data-variant='tile']) [data-part='label']::after`);
  assert.match(halo, /block-size:var\(--_size\)/);
  assert.match(halo, /inline-size:var\(--_size\)/);
  assert.match(halo, /inset-block-start:var\(--_lift\)/);
  assert.match(halo, /direction:var\(--_direction\)/);
  assert.match(halo, /border-radius:var\(--slotted-radius-full,9999px\)/);
  assert.match(
    halo,
    /box-shadow:0 0 0 calc\(\(var\(--_halo-size\) - var\(--_size\)\) \/ 2\) var\(--slotted-checkbox-halo-color,var\(--slotted-tone-accent-surface\)\)/,
  );
  assert.doesNotMatch(halo, /background-color/);
  assert.match(halo, /opacity:0/);
  assert.match(halo, /z-index:-1/);
  assert.match(rule(root), /--_halo-size:var\(--slotted-selection-halo-size,32px\)/);
  assert.match(rule(root), /isolation:isolate/);
  assert.match(rule(root), /position:relative/);
  assert.ok(
    normalized.includes(
      `${root}:not([data-readonly]) [data-part='control']:hover:not(:disabled) ~ [data-part='label']::after,${root}:not([data-readonly]) [data-part='control']:not(:disabled) ~ [data-part='label']:hover::after{opacity:var(--slotted-selection-halo-opacity,0.4);}`,
    ),
    'hover does not light the halo, or lights it from somewhere else',
  );
  /* Hover moves the edge and the halo, and nothing on the ground. */
  const hover = rule(`${root}:not([data-readonly]) [data-part='control']:hover:not(:disabled)`);
  assert.match(
    hover,
    /border-color:var\(--slotted-checkbox-hover-border-color,var\(--slotted-tone-accent-border\)\)/,
  );
  assert.doesNotMatch(hover, /background-color/);
  /* The other placement puts the halo on the other side. */
  assert.match(
    rule(
      `${root}[data-label-placement='start'] [data-part='label']::before,${root}[data-label-placement='start'] [data-part='label']::after`,
    ),
    /inset-inline-end:0;inset-inline-start:auto/,
  );
});

/**
 * The box sits on the first line box of its label rather than in the middle of
 * the block, which is where `align-items: center` puts it as soon as the label
 * wraps — and a label that wraps is what a real form is full of.
 */
test('lifts the box onto the first line of a label that wraps', () => {
  assert.match(
    rule(root),
    /--_lift:calc\(\(var\(--_font-size\) \* var\(--_line-height\) - var\(--_size\)\) \/ 2\)/,
  );
  assert.match(rule(part('control')), /margin-block-start:var\(--_lift\)/);
  /* The mark rides the same lift, plus its own inset inside the box. */
  assert.match(rule(part('indicator')), /margin-block-start:calc\(var\(--_lift\) \+ /);
});

/**
 * The row is its line (CK3). The label carries no minimum and no slack — with
 * `content-box` the two added up to 28.5px at `md` for one line of text — and
 * the WCAG 2.2 target the box is too small to be is the halo's own box, hit
 * around the box rather than laid out beside it.
 */
test('keeps the row at its line and hits the target around the box', () => {
  const label = rule(part('label'));
  assert.doesNotMatch(label, /min-block-size/);
  assert.doesNotMatch(label, /padding-block/);
  assert.match(label, /cursor:pointer/);
  assert.doesNotMatch(declarations, /--_label-slack/);
  assert.match(rule(root), /--_target:var\(--slotted-target-min,24px\)/);
  const target = rule(`${root}:not([data-variant='tile']) [data-part='label']::before`);
  assert.match(target, /block-size:var\(--_target\)/);
  assert.match(target, /inline-size:var\(--_target\)/);
  assert.match(
    target,
    /inset-block-start:calc\(var\(--_lift\) \+ var\(--_size\) - var\(--_target\)\)/,
  );
  assert.match(target, /inset-inline-start:calc\(\(var\(--_size\) - var\(--_target\)\) \/ 2\)/);
  assert.doesNotMatch(target, /box-shadow|opacity/);
  /* Placed in the root's direction, not the label's: a label in another
     script inside the row would otherwise send both to the far side. */
  assert.match(target, /direction:var\(--_direction\)/);
  assert.ok(normalized.includes(`${root}{--_direction:ltr;}`));
  assert.ok(normalized.includes(`${root}:dir(rtl){--_direction:rtl;}`));
  assert.doesNotMatch(declarations, /overflow-clip-margin/);
});

/** A label that is one unbroken token — an id, a hash, a URL — has to break. */
test('breaks an unbroken label instead of taking the page with it', () => {
  assert.match(rule(part('label')), /overflow-wrap:anywhere/);
  assert.match(rule(part('description')), /overflow-wrap:anywhere/);
});

/** Both arrangements, written in logical properties so both directions work. */
test('swaps the two columns for the other placement', () => {
  assert.ok(normalized.includes(`${root}[data-label-placement='start']{`));
  assert.match(
    rule(`${root}[data-label-placement='start']`),
    /grid-template-columns:minmax\(0,1fr\) auto/,
  );
  assert.doesNotMatch(declarations, /margin-left|margin-right|padding-left|padding-right/);
});

/**
 * Every weaker state held back for the stronger ones it can meet. Read-only is
 * guarded on the root because CSS has no `:read-write` for a checkbox: the
 * element matches `:read-only` whether or not the family says it is.
 */
test('holds hover and press back for disabled and for read-only', () => {
  for (const selector of normalized.split('}').map((block) => block.split('{')[0])) {
    if (selector.includes('@')) continue;
    if (!/:hover|:active/.test(selector)) continue;
    assert.ok(selector.includes(':not(:disabled)'), `${selector} answers a disabled control`);
    assert.ok(
      selector.includes(':not([data-readonly])'),
      `${selector} answers a read-only control`,
    );
  }
});

/** A read-only value is real, so it keeps its ink, its ring and its tab stop. */
test('does not paint read-only as if it were disabled', () => {
  const readonly = rule(
    `${root}[data-readonly] [data-part='control']:not(:checked):not(:indeterminate)`,
  );
  assert.match(readonly, /background-color:var\(--slotted-checkbox-readonly-background/);
  assert.doesNotMatch(readonly, /--slotted-disabled/);
});

/**
 * A disabled `fieldset` disables every control inside it and tells none of
 * them, so the element's own state is painted beside the mirrored attribute
 * rather than instead of it.
 */
test('answers the disabled element as well as the mirrored attribute', () => {
  assert.ok(
    normalized.includes(
      `${root}[data-disabled] [data-part='control'],${part('control')}:disabled{`,
    ),
    'the disabled rule does not answer :disabled',
  );
});

/**
 * The mark and the ground it stands on are both `background-color`, which
 * forced colors overrides, so the check would disappear into the box. This is
 * the one thing the theme cannot reach, and the one rule the family writes.
 */
test('restates the pair forced colors would collapse', () => {
  assert.match(declarations, /@media \(forced-colors: active\)/);
  assert.ok(
    normalized.includes(
      `@media (forced-colors:active){${part('control')}{background-color:Field;border-color:FieldText;}`,
    ),
  );
  assert.ok(normalized.includes('background-color:HighlightText'));
});

/**
 * Every duration comes from the motion scale, so reduced motion collapses it.
 * The ground and the edge take the control step; the mark arrives at the
 * medium step, one above it (CK1).
 *
 * The mark arrives along its own stroke and not out of the middle of the box
 * (CK6): a clip that opens on the inline axis, which moves no edge and changes
 * no size, so no frame of the entrance can put ink outside the square. It was
 * `scale: 0.6` → `1`, which grows the artwork out of the box's geometric
 * centre and carries every subpixel error in the mark's placement across the
 * box while it runs.
 */
test('draws the mark in along its own stroke, at the medium step of the scale', () => {
  const indicator = rule(part('indicator'));
  assert.match(indicator, /clip-path:inset\(0% 100% 0% 0%\)/);
  assert.match(
    indicator,
    /transition:clip-path var\(--slotted-duration-medium\) var\(--slotted-control-transition-easing\),opacity var\(--slotted-duration-medium\) var\(--slotted-control-transition-easing\)/,
  );
  const shown = rule(
    `${part('control')}:checked + [data-part='indicator'],${part('control')}:indeterminate + [data-part='indicator']`,
  );
  assert.match(shown, /clip-path:inset\(0% 0% 0% 0%\)/);
  assert.match(shown, /opacity:1/);
  /** The uniform scale CK1 asked for and CK6 revoked. */
  assert.doesNotMatch(declarations, /(?<![\w-])scale:/);
  assert.match(
    rule(part('control')),
    /transition:background-color var\(--slotted-control-transition-duration\)/,
  );
  assert.doesNotMatch(declarations, /\d+m?s(?![\w-])/);
});

/**
 * Reduced motion keeps the fade and drops the hand (R7). The clip is removed
 * rather than shortened, so the mark is whole in every frame it is painted in.
 */
test('keeps only the fade when the reader asked for stillness', () => {
  const reduced = declarations.slice(
    declarations.indexOf('@media (prefers-reduced-motion: reduce)'),
  );
  assert.ok(
    declarations.includes('@media (prefers-reduced-motion: reduce)'),
    'the sheet never answers prefers-reduced-motion',
  );
  const body = reduced.slice(0, reduced.indexOf('\n  }\n'));
  assert.match(body, /clip-path:\s*none/);
  assert.match(body, /transition:\s*opacity var\(--slotted-duration-medium\)/);
  assert.doesNotMatch(body, /clip-path:\s*inset/);
});

/**
 * The `high-contrast` scheme paints `--slotted-tone-danger-border` the same
 * black as every other border, so an invalid control told apart by colour alone
 * would be identical to a valid one in exactly the scheme that exists for
 * people who need the difference.
 */
test('says invalid with weight as well as with colour', () => {
  const invalid = rule(`${root}[data-invalid] [data-part='control']`);
  assert.match(invalid, /border-width:var\(--slotted-border-width-thick,2px\)/);
  assert.match(invalid, /border-color:var\(--slotted-checkbox-invalid-border-color/);
});

/**
 * One disabled box inside an otherwise live form dims its own label, which a
 * mirrored attribute on the root cannot reach when the browser did the
 * disabling — a disabled `fieldset` disables the control and tells nothing.
 */
test('dims the label of a control the browser disabled, not only of a mirrored one', () => {
  assert.ok(normalized.includes(`${part('control')}:disabled ~ [data-part='label']`));
});

/**
 * The distance from a label to its description is one number in both variants:
 * the step `field` puts between its rows.
 */
test('puts a description one step from its label, and one step nearer inside a tile', () => {
  assert.match(rule(root), /--_description-gap:var\(--slotted-space-3,0\.375rem\)/);
  assert.match(rule(part('description')), /padding-block-start:var\(--_description-gap\)/);
  /* CK2: 4px inside the frame, where the inset already holds the pair apart. */
  assert.match(
    rule(`${root}[data-variant='tile']`),
    /--_description-gap:var\(--slotted-checkbox-tile-description-gap,var\(--slotted-space-2,0\.25rem\)\)/,
  );
});
