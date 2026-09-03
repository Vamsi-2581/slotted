import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/radio-group/contract.json', import.meta.url),
    'utf8',
  ),
);
const checkboxCss = readFileSync(new URL('../checkbox/checkbox.css', import.meta.url), 'utf8');
const css = readFileSync(new URL('./radio-group.css', import.meta.url), 'utf8');
const fragment = readFileSync(new URL('./radio-group.harness.html', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
const normalized = declarations
  .replace(/\s+/g, ' ')
  .replace(/\s*([{};,:>])\s*/g, '$1')
  .replace(/\(\s+/g, '(')
  .replace(/\s+\)/g, ')');

const ui = `[data-ui='${contract.ui}']`;
const root = `${ui}[data-part='root']`;
const member = contract.members.radioGroup;

function rule(selector) {
  return normalized.split(`${selector}{`)[1]?.split('}')[0] ?? '';
}

const part = (name) => `${ui} [data-part='${name}']`;

test('lives in the component layer', () => {
  assert.match(css, /@layer slotted\.components/);
});

test('is selected by the identifier the contract declares', () => {
  assert.ok(normalized.includes(`${root}{`), 'the family has no base rule keyed on data-ui');
});

test('styles every part the contract declares', () => {
  for (const declared of member.parts) {
    if (declared === 'root') continue;
    assert.ok(
      normalized.includes(`[data-part='${declared}']`),
      `no rule reaches the ${declared} part`,
    );
  }
});

test('renders every part the contract declares, in at least one scene', () => {
  for (const declared of member.parts) {
    assert.match(
      fragment,
      new RegExp(`data-part="${declared}"`),
      `${declared} appears in no scene`,
    );
  }
});

/**
 * Every group in the fragment names its radios, because a `name` is what makes
 * the browser treat the set as one group: one tab stop, arrow keys that move
 * focus and selection together, and wrapping at both ends. A scene that forgot
 * it would photograph a set of unrelated radios that happen to look aligned.
 */
test('names every radio in every scene, which is what makes the set a group', () => {
  const radios = [...fragment.matchAll(/<input[^>]*type="radio"[^>]*>/g)].map(([tag]) => tag);
  assert.ok(radios.length > 0, 'the fragment renders no radio');
  for (const tag of radios) {
    assert.match(tag, /\sname="[^"]+"/, `a radio in the fragment has no name: ${tag}`);
  }
});

/** The dot is the control's next sibling, as the check is in `checkbox`. */
test('paints the dot from the control it stands on, through the sibling combinator', () => {
  assert.ok(normalized.includes(`${part('control')}:checked + [data-part='indicator']`));
});

test('draws the dot as a mask from the glyph scale, never as a character', () => {
  assert.match(
    rule(part('indicator')),
    /mask-image:var\(--slotted-radio-group-mark-image,var\(--slotted-icon-dot\)\)/,
  );
  /* An empty `content` materialises a box — the tile's edge, the stretched
     target — and is not a mark. What is refused is a character standing in for
     artwork, so the pattern is a string with something in it. */
  assert.doesNotMatch(declarations, /content:\s*['"][^'"]/);
});

/**
 * The circle is the one visual difference between the two families, and it is
 * one declaration. Everything else — the square it is drawn in, the lift onto
 * the first line, the target on the label — is the same decision, reached
 * through the same foundation tokens rather than through `checkbox`'s
 * selectors.
 */
test('differs from checkbox in the corner and in nothing else structural', () => {
  assert.match(rule(part('control')), /border-radius:var\(--slotted-radius-full,9999px\)/);
  assert.doesNotMatch(declarations, /data-ui=['"]checkbox['"]/);
  assert.match(checkboxCss, /--slotted-control-icon-size-md/);
  assert.match(
    rule(root),
    /--_size:var\(--slotted-radio-group-size,var\(--slotted-control-icon-size-md,16px\)\)/,
  );
});

test('lifts the circle onto the first line of a label that wraps', () => {
  assert.match(
    rule(root),
    /--_lift:calc\(var\(--_label-slack\) \+ \(var\(--_font-size\) \* var\(--_line-height\) - var\(--_size\)\) \/ 2\)/,
  );
  assert.match(rule(part('control')), /margin-block-start:var\(--_lift\)/);
  assert.match(rule(part('indicator')), /margin-block-start:var\(--_lift\)/);
});

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

test('gives the label the target the circle is too small to be', () => {
  assert.match(rule(part('label')), /min-block-size:var\(--slotted-target-min,24px\)/);
});

/**
 * A row of choices that runs past its container is a row whose last option
 * nobody can see, and a set of options is not a scroll region.
 */
test('wraps a horizontal group rather than clipping or scrolling it', () => {
  const horizontal = rule(`${root}[data-orientation='horizontal']`);
  assert.match(horizontal, /flex-wrap:wrap/);
  assert.match(horizontal, /column-gap:calc\(var\(--_gap\) \* 2\)/);
});

test('answers every size the contract declares', () => {
  for (const size of contract.axes.size) {
    assert.ok(normalized.includes(`${root}[data-size='${size}']{`), `no rule answers ${size}`);
  }
});

test('swaps the two columns for the other placement', () => {
  assert.match(
    rule(`${root}[data-label-placement='start'] [data-part='item']`),
    /grid-template-columns:minmax\(0,1fr\) auto/,
  );
  assert.doesNotMatch(declarations, /margin-left|margin-right|padding-left|padding-right/);
});

test('holds hover and press back for disabled and for read-only', () => {
  for (const selector of normalized.split('}').map((block) => block.split('{')[0])) {
    if (selector.includes('@')) continue;
    if (!/:hover|:active/.test(selector)) continue;
    assert.ok(selector.includes(':not(:disabled)'), `${selector} answers a disabled control`);
    assert.ok(selector.includes(':not([data-readonly])'), `${selector} answers a read-only group`);
  }
});

/** The chosen option keeps its accent, because the value is real. */
test('does not paint read-only as if it were disabled', () => {
  const readonly = rule(`${root}[data-readonly] [data-part='control']:not(:checked)`);
  assert.match(readonly, /background-color:var\(--slotted-radio-group-readonly-background/);
  assert.doesNotMatch(readonly, /--slotted-disabled/);
});

test('answers the disabled element as well as the mirrored attribute', () => {
  assert.ok(
    normalized.includes(
      `${root}[data-disabled] [data-part='control'],${part('control')}:disabled{`,
    ),
  );
});

/**
 * One disabled option inside an otherwise live group dims its own label, which
 * a group-level attribute cannot reach: the general sibling combinator is what
 * carries the element's own state across to the text beside it.
 */
test('dims the label of a single disabled option, not only of a disabled group', () => {
  assert.ok(normalized.includes(`${part('control')}:disabled ~ [data-part='label']`));
});

test('restates the pair forced colors would collapse', () => {
  assert.match(declarations, /@media \(forced-colors: active\)/);
  assert.ok(
    normalized.includes(
      `@media (forced-colors:active){${part('control')}{background-color:Field;border-color:FieldText;}`,
    ),
  );
  assert.ok(normalized.includes('background-color:HighlightText'));
});

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
  assert.match(invalid, /border-color:var\(--slotted-radio-group-invalid-border-color/);
});

/**
 * A choice with a description is two rows tall. At one control gap the second
 * row sat as near the next label as its own, so proximity named the wrong
 * owner. The distance doubles exactly where the second row exists, and the
 * public override still wins.
 */
test('separates two described choices by twice the distance it separates bare ones', () => {
  const described = rule(`${root}:has([data-part='description'])`);
  assert.match(described, /row-gap:var\(--slotted-radio-group-gap,calc\(var\(--_gap\) \* 2\)\)/);
  assert.match(rule(root), /gap:var\(--slotted-radio-group-gap,var\(--_gap\)\)/);
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
