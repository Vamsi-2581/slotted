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
 * The square is the control glyph scale's, which the theme restates per
 * density. A component scale for it would restate a scale that already exists,
 * which is the one thing the component layer's bar forbids.
 */
test('takes its box from a scale that already answers density', () => {
  assert.match(
    rule(root),
    /--_size:var\(--slotted-checkbox-size,var\(--slotted-control-icon-size-md,16px\)\)/,
  );
  for (const size of contract.axes.size) {
    assert.ok(
      normalized.includes(`${root}[data-size='${size}']{`),
      `no rule answers data-size="${size}"`,
    );
  }
});

/**
 * The box sits on the first line box of its label rather than in the middle of
 * the block, which is where `align-items: center` puts it as soon as the label
 * wraps — and a label that wraps is what a real form is full of.
 */
test('lifts the box onto the first line of a label that wraps', () => {
  assert.match(
    rule(root),
    /--_lift:calc\(var\(--_label-slack\) \+ \(var\(--_font-size\) \* var\(--_line-height\) - var\(--_size\)\) \/ 2\)/,
  );
  assert.match(rule(part('control')), /margin-block-start:var\(--_lift\)/);
  assert.match(rule(part('indicator')), /margin-block-start:var\(--_lift\)/);
});

/**
 * At `dense`/`sm` the square is twelve pixels, under WCAG 2.2's 24 × 24. The
 * label carries the target instead, which is the correction
 * `docs/token-foundation.md` says belongs to the family and not to the theme.
 */
/**
 * The slack a one-line label is short of the target is split above and below
 * its text rather than sunk below it. Sunk, it pushed the description further
 * from the label it belongs to than from the next choice, and proximity named
 * the wrong owner.
 */
test('splits the target slack around the label text rather than below it', () => {
  assert.match(
    rule(root),
    /--_label-slack:max\(0px,\(var\(--slotted-target-min,24px\) - var\(--_font-size\) \* var\(--_line-height\)\) \/ 2\)/,
  );
  assert.match(rule(part('label')), /padding-block:var\(--_label-slack\)/);
});

test('gives the label the target the box is too small to be', () => {
  assert.match(rule(part('label')), /min-block-size:var\(--slotted-target-min,24px\)/);
  assert.match(rule(part('label')), /cursor:pointer/);
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

/** Every duration comes from the motion scale, so reduced motion collapses it. */
test('transitions the two changes the eye has to follow, from the scale', () => {
  assert.match(
    rule(part('indicator')),
    /transition:opacity var\(--slotted-control-transition-duration\)/,
  );
  assert.doesNotMatch(declarations, /\d+m?s(?![\w-])/);
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
 * The distance from a label to its description is one number in both variants.
 * The label's slack supplies part of it in the plain variant and none of it in
 * a tile, so the padding is the remainder rather than a second decision.
 */
test('puts a description the same distance from its label in both variants', () => {
  assert.match(
    rule(root),
    /--_description-gap:max\(0px,var\(--slotted-space-3,0\.375rem\) - var\(--_label-slack\)\)/,
  );
  assert.match(rule(part('description')), /padding-block-start:var\(--_description-gap\)/);
});
