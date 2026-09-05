import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/number-field/contract.json', import.meta.url),
    'utf8',
  ),
);
const css = readFileSync(new URL('./number-field.css', import.meta.url), 'utf8');
const fragment = readFileSync(new URL('./number-field.harness.html', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
const normalized = declarations
  .replace(/\s+/g, ' ')
  .replace(/\s*([{};,:>])\s*/g, '$1')
  .replace(/\(\s+/g, '(')
  .replace(/\s+\)/g, ')');

const ui = `[data-ui='${contract.ui}']`;
const root = `${ui}[data-part='root']`;
const member = contract.members.numberField;

/** The declarations of the first rule whose selector starts with `selector`. */
function rule(selector) {
  return normalized.split(`${selector}{`)[1]?.split('}')[0] ?? '';
}

test('lives in the component layer', () => {
  assert.match(css, /@layer slotted\.components/);
});

test('is selected by the identifier the contract declares', () => {
  assert.ok(normalized.includes(`${root}{`), 'the family has no base rule keyed on data-ui');
});

test('styles every part the contract declares', () => {
  for (const part of member.parts) {
    assert.ok(normalized.includes(`[data-part='${part}']`), `no rule reaches the ${part} part`);
  }
});

test('gives the frame the box and the control the value', () => {
  const frame = rule(root);
  assert.match(frame, /border:var\(--slotted-control-border-width,1px\) solid/);
  assert.match(frame, /display:flex/);
  assert.match(frame, /min-inline-size:0/);

  const input = rule(`${ui}>[data-part='input']`);
  assert.match(input, /border:0/);
  assert.match(input, /background-color:transparent/);
  assert.match(input, /outline:none/);
  assert.match(input, /padding:0/);
  assert.match(input, /min-inline-size:0/);
});

/**
 * A number field whose digits change width as they are typed over is a number
 * field whose value moves under the reader's eye. No axis asks for it, because
 * no number field wants the other setting.
 */
test('sets the value in tabular figures without an axis to ask for it', () => {
  assert.match(rule(`${ui}>[data-part='input']`), /font-variant-numeric:tabular-nums/);
});

/**
 * Every step reads the control scales, which are the only ones the theme
 * restates per density, so a control in a dense table shrinks whole rather than
 * in parts.
 */
test('takes every step from the control scales rather than stating one', () => {
  for (const size of contract.axes.size) {
    const step = rule(`${root}[data-size='${size}']`);
    assert.match(step, new RegExp(`--_height:var\\(--slotted-control-height-${size}`));
    assert.match(step, new RegExp(`--_font-size:var\\(--slotted-control-font-size-${size}`));
    assert.match(
      step,
      new RegExp(`--_padding-inline:var\\(--slotted-control-padding-inline-${size}`),
    );
    assert.match(
      step,
      new RegExp(
        `--_icon-size:max\\(var\\(--_icon-floor\\),var\\(--slotted-control-icon-size-${size}`,
      ),
    );
    assert.match(step, new RegExp(`--_gap:var\\(--slotted-control-gap-${size}`));
  }
});

test('paints each variant the contract declares', () => {
  for (const variant of contract.axes.variant) {
    if (variant === 'outline') continue;
    assert.ok(
      normalized.includes(`${root}[data-variant='${variant}']{`),
      `${variant} paints nothing of its own`,
    );
  }
});

/**
 * A transparent border has no system colour to be remapped to, so the `plain`
 * control would lose its only edge exactly where an edge matters most. It is
 * the one rule the theme cannot write on the family's behalf.
 */
test('gives the borderless variant an edge under forced colours', () => {
  assert.match(css, /@media \(forced-colors: active\)/);
  assert.match(
    normalized,
    new RegExp(
      `${root.replace(/[[\]']/g, '\\$&')}\\[data-variant='plain'\\]\\{border-color:ButtonBorder`,
    ),
  );
});

/**
 * The stepper is bounded below by the WCAG 2.2 minimum in its cross axis and
 * above by the frame's own inner box, so it stays square-ish at every step.
 */
test('floors the stepper at the target minimum and bounds it by the frame', () => {
  const frame = rule(root);
  assert.match(
    frame,
    /--_stepper-size:var\(--slotted-number-field-stepper-size,max\(var\(--slotted-target-min/,
  );
  assert.match(frame, /min\(calc\(var\(--_icon-size\) \+ 2 \* var\(--slotted-space-2/);
});

/**
 * Flush against the frame's edge rather than inset: every pixel the column
 * gives back is a pixel off the smallest target in the library.
 */
test('gives the end of the frame to a stacked stepper', () => {
  assert.match(rule(`${root}[data-stepper='stacked']`), /padding-inline-end:0/);

  const column = rule(`${ui}>[data-part='stepper']`);
  assert.match(column, /align-self:stretch/);
  assert.match(column, /flex-direction:column/);
  assert.match(column, /inline-size:var\(--_stepper-size\)/);
  assert.match(column, /border-inline-start:var\(--slotted-control-border-width/);
});

test('splits the column into two halves with a line between them', () => {
  assert.match(rule(`${ui}>[data-part='stepper']>button`), /block-size:50%/);
  assert.match(
    rule(`${ui}>[data-part='stepper']>[data-part='decrement']`),
    /border-block-start:var\(--slotted-control-border-width/,
  );
});

/**
 * The split arrangement is the only one whose targets clear the minimum in both
 * axes, and the hit area is recovered outside the paint the way
 * `docs/token-foundation.md` leaves to the family rather than to the theme.
 */
test('recovers the split stepper hit area outside its paint', () => {
  for (const part of ['decrement', 'increment']) {
    assert.ok(
      normalized.includes(`${ui}[data-stepper='split']>[data-part='${part}']::after`),
      `the split ${part} button has no recovered hit area`,
    );
  }
  assert.match(
    rule(
      `${ui}[data-stepper='split']>[data-part='decrement']::after,${ui}[data-stepper='split']>[data-part='increment']::after`,
    ),
    /inset:min\(0px,calc\(\(100% - var\(--slotted-target-min,24px\)\) \/ 2\)\)/,
  );
});

/** A quantity between two buttons reads centred; a left-aligned one reads adrift. */
test('centres the value between two split steppers', () => {
  assert.match(rule(`${ui}[data-stepper='split']>[data-part='input']`), /text-align:center/);
});

/**
 * A character is never an icon. The up chevron is the scale's own down chevron
 * turned half a turn, so a theme that replaces one replaces both.
 */
test('draws every stepper mark as a mask from the glyph scale', () => {
  assert.doesNotMatch(declarations, /content:\s*'[^']+'/, 'a rule draws a character as an icon');

  const stackedUp = rule(`${ui}[data-stepper='stacked'] [data-part='increment']::before`);
  assert.match(
    stackedUp,
    /mask-image:var\(--slotted-number-field-increment-icon,var\(--slotted-icon-chevron-down\)\)/,
  );
  assert.match(stackedUp, /rotate:0\.5turn/);

  assert.match(
    rule(`${ui}[data-stepper='stacked'] [data-part='decrement']::before`),
    /mask-image:var\(--slotted-number-field-decrement-icon,var\(--slotted-icon-chevron-down\)\)/,
  );
  assert.match(
    rule(`${ui}[data-stepper='split'] [data-part='decrement']::before`),
    /mask-image:var\(--slotted-number-field-decrement-icon,var\(--slotted-icon-minus\)\)/,
  );
  assert.match(
    rule(`${ui}[data-stepper='split'] [data-part='increment']::before`),
    /mask-image:var\(--slotted-number-field-increment-icon,var\(--slotted-icon-plus\)\)/,
  );
});

/**
 * Pointing one name at the invalid colour on the element moves the frame's
 * outline, the shadow under it and both steppers' rings at once, which is what
 * makes `[data-invalid]` one rule instead of five.
 */
test('retargets the ring rather than repainting every rule that draws it', () => {
  const invalid = rule(`${root}[data-invalid]`);
  assert.match(invalid, /--slotted-focus-ring-color:var\(/);
  assert.match(invalid, /--slotted-focus-ring-color-invalid/);
  assert.match(invalid, /border-color:var\(--slotted-number-field-invalid-border-color/);
});

/**
 * A control can be disabled by something that never told it so: a disabled
 * `fieldset` disables every control inside it, and the control has no way to
 * know. The deleted `input` family shipped that defect once already.
 */
test('paints a control disabled by an ancestor as well as by its own attribute', () => {
  assert.ok(
    normalized.includes(`${root}[data-disabled],${root}:has(>[data-part='input']:disabled){`),
    'the frame answers only its own attribute',
  );
  assert.match(
    rule(`${root}[data-disabled],${root}:has(>[data-part='input']:disabled)`),
    /box-shadow:none/,
  );
});

/** Read-only keeps its ink: the value is real, focusable, copyable and submitted. */
test('separates read-only from disabled by ground rather than by ink', () => {
  const readonly = rule(`${root}[data-readonly]`);
  assert.match(readonly, /background-color:var\(--slotted-number-field-readonly-background/);
  assert.doesNotMatch(readonly, /color:var\(--slotted-disabled-foreground/);
});

test('takes every duration from the motion scale', () => {
  assert.doesNotMatch(declarations, /(?<![\w-])\d+(?:\.\d+)?m?s(?![\w-])/);
  assert.match(rule(root), /var\(--slotted-control-transition-duration\)/);
});

/* ── The fragment is a third place the DOM is written, after React and Angular ── */

test('renders every part the contract declares in at least one scene', () => {
  for (const part of member.parts) {
    assert.match(fragment, new RegExp(`data-part="${part}"`), `no scene renders the ${part} part`);
  }
});

/**
 * `clamp` is a policy over the value and `formatOn` a policy over when the text
 * is rewritten. Neither reaches the DOM, so neither can be photographed.
 */
test('renders every value of every axis the contract declares', () => {
  for (const [axis, values] of Object.entries(contract.axes)) {
    if (axis === 'clamp' || axis === 'formatOn') continue;
    for (const value of values) {
      assert.match(
        fragment,
        new RegExp(`data-${axis}="${value}"`),
        `no scene renders ${axis}="${value}"`,
      );
    }
  }
});

/**
 * The DOM differs by arrangement on purpose. Under `split` the two buttons are
 * direct children of the frame — decrement before the value and increment after
 * it — so the reading order and the painted order are the same one, which
 * `order` on a shared box could not have given.
 */
test('writes the split arrangement in the order it is painted', () => {
  const split = fragment
    .split('data-stepper="split"')
    .slice(1)
    .map((scene) => scene.split('</div>')[0] ?? '');
  assert.ok(split.length > 0, 'no scene renders the split arrangement');
  for (const scene of split) {
    assert.ok(
      scene.indexOf('data-part="decrement"') < scene.indexOf('data-part="input"'),
      'the split arrangement paints decrement first and reads it second',
    );
    assert.ok(
      scene.indexOf('data-part="increment"') > scene.indexOf('data-part="input"'),
      'the split arrangement paints increment last and reads it earlier',
    );
    assert.ok(!scene.includes('data-part="stepper"'), 'a split stepper needs no box to share');
  }
});

/** The APG's role, its whole value set, and the steppers kept out of the tab order. */
test('renders the sourced pattern rather than a picture of it', () => {
  assert.match(fragment, /role="spinbutton"/);
  for (const property of contract.ariaValue) {
    assert.ok(fragment.includes(property), `no scene renders ${property}`);
  }
  for (const button of fragment.match(/<button[\s\S]*?>/g) ?? []) {
    assert.match(button, /tabindex="-1"/, 'a stepper is in the tab order');
    assert.match(button, /aria-label="/, 'a stepper has no accessible name');
    assert.match(button, /type="button"/, 'a stepper would submit the form it sits in');
  }
});

/** Every state the contract declares, in the scene that shows it. */
test('renders every attribute state the contract declares', () => {
  for (const attribute of Object.values(contract.stateAttributes)) {
    assert.ok(fragment.includes(attribute), `no scene renders ${attribute}`);
  }
  assert.match(fragment, /<fieldset disabled/, 'no scene shows a control disabled by an ancestor');
  assert.match(
    fragment,
    /disabled><\/button>|disabled\s*><\/button>/,
    'no scene shows a stepper at its bound',
  );
});
