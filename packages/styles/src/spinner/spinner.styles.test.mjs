import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/**
 * The ring has no contract of its own: it is declared by the family that
 * carries it, as the shared identifier its `indicator` part wears and the
 * glyph that draws it, and a second host declares the same.
 */
const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/button/contract.json', import.meta.url),
    'utf8',
  ),
).spinner;
const css = readFileSync(new URL('./spinner.css', import.meta.url), 'utf8');
const fragment = readFileSync(new URL('./spinner.harness.html', import.meta.url), 'utf8');
const buttonCss = readFileSync(new URL('../button/button.css', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
const normalized = declarations.replace(/\s+/g, ' ').replace(/\s*([{};,:])\s*/g, '$1');
const ui = `[data-ui='${contract.ui}']`;

function rule(selector) {
  return normalized.split(`${selector}{`)[1]?.split('}')[0] ?? '';
}

test('lives in the component layer', () => {
  assert.match(css, /@layer slotted\.components/);
});

test('is selected by the identifier the contract declares', () => {
  assert.ok(normalized.includes(`${ui}{`), 'the family has no base rule keyed on data-ui');
});

/**
 * The ring is drawn here, in gradients over `currentColor`, so it takes the
 * ink its host is writing with and no host draws a circle of its own. Three
 * layers under one mask: a track at a fifth of the ink, an arc from the tail
 * angle to the head angle, and a dot at each end for the round caps a conic
 * gradient cannot draw. The glyph it replaced was one shape turned.
 */
test('draws the ring from gradients over the ink around it', () => {
  const base = rule(ui).replace(/\s+/g, '');
  assert.doesNotMatch(css, /--slotted-icon-|mask-size|border-radius/, 'the ring is still a glyph');
  assert.match(base, /--_track:color-mix\(inoklab,currentColor20%,transparent\)/);
  assert.match(base, /conic-gradient\(var\(--_track\)0100%\)/, 'no track');
  assert.match(
    base,
    /conic-gradient\(fromvar\(--_start\),currentColor0deg,currentColorcalc\(var\(--_head\)-var\(--_tail\)\),transparentcalc\(var\(--_head\)-var\(--_tail\)\)\)/,
    'the arc is not the distance from tail to head',
  );
  assert.equal(
    (
      base.match(
        /radial-gradient\(circleatcalc\(50%\+var\(--_radius\)\*sin\(var\(--_(?:end|start)\)\)\)/g,
      ) ?? []
    ).length,
    2,
    'an end has no cap',
  );
  assert.match(
    base,
    /mask-image:radial-gradient\(circle,transparentcalc\(var\(--_ring\)\/2-var\(--_stroke\)-0\.5px\)/,
  );
  assert.doesNotMatch(declarations, /calc\(100%\s*-/, 'a mask stop is a percentage of the ray');
});

/**
 * The stroke is the icon set's own at this size, two units of twenty-four,
 * and never under the medium hairline; the ring keeps the set's inset inside
 * its box, so the swap with a glyph is between two shapes of one measure.
 */
test('is drawn to the measure of the glyph it stands in for', () => {
  const base = rule(ui).replace(/\s+/g, '');
  assert.match(base, /--_ring:calc\(var\(--_size\)\*5\/6\)/);
  assert.match(
    base,
    /--_stroke:max\(var\(--slotted-border-width-medium,1\.5px\),calc\(var\(--_size\)\/12\)\)/,
  );
  assert.match(base, /padding:calc\(\(var\(--_size\)-var\(--_ring\)\)\/2\)/);
  assert.match(base, /background-origin:content-box/);
});

/**
 * Three angles, none a rotation of the box: a turned box is a bitmap spun,
 * a gradient by angle is repainted. Head and tail each run one turn in
 * halves so the arc opens from the front and closes from behind, and the
 * linear turn under them is a turn and the hundred degrees the two resets
 * leave, so a cycle ends on the angle the next begins on.
 */
test('chases its own tail rather than turning a shape', () => {
  const base = rule(ui).replace(/\s+/g, '');
  assert.doesNotMatch(declarations, /rotate|transform/, 'the box is turned');
  for (const angle of ['turn', 'head', 'tail']) {
    assert.match(
      css,
      new RegExp(`@property --_${angle}\\s*\\{[^}]*syntax: '<angle>'`),
      `${angle} flips`,
    );
    assert.match(
      base,
      new RegExp(`slotted-spinner-${angle}var\\(--slotted-duration-loop-slow\\)linearinfinite`),
    );
  }
  assert.match(css, /@keyframes slotted-spinner-turn\s*\{\s*to\s*\{\s*--_turn: 460deg/);
  assert.match(css, /--_head: 20deg;\s*animation-timing-function: ease-in-out/);
  assert.match(css, /--_tail: 0deg;\s*animation-timing-function: ease-in-out/);
  assert.match(css, /--_head: 280deg/);
  assert.match(css, /--_tail: 260deg/);
});

test('arrives on a fade rather than a cut', () => {
  assert.match(
    css,
    /@starting-style\s*\{\s*\[data-ui='spinner'\]\s*\{\s*opacity: 0;\s*scale: 0\.6/,
  );
  assert.match(rule(ui), /transition:opacity var\(--slotted-control-transition-duration\)/);
});

/**
 * The box is the host's glyph box, read through the family token, so the ring
 * that stands in for a glyph is the size of the glyph it replaces; left alone
 * it is the medium control icon.
 */
test('is the size its host says, and the medium glyph box otherwise', () => {
  const base = rule(ui);
  assert.ok(
    base.includes('--_size:var(--slotted-spinner-size,var(--slotted-control-icon-size-md,16px))'),
  );
  assert.ok(base.includes('block-size:var(--_size)'));
  assert.ok(base.includes('inline-size:var(--_size)'));
  assert.ok(base.includes('flex:none'));
});

test('stands still under reduced motion, as a track with an arc resting on it', () => {
  assert.ok(
    normalized.includes(
      `@media (prefers-reduced-motion:reduce){${ui}{--_head:270deg;animation:none;}}`,
    ),
    'the ring keeps turning under reduced motion',
  );
});

/**
 * One ring, drawn once. The host that drew it first hands the drawing over
 * and keeps only the size and the place.
 */
test('is the only sheet that draws the ring', () => {
  assert.doesNotMatch(buttonCss, /slotted-button-spin|border-inline-end-color:\s*transparent/);
  assert.match(buttonCss, /--slotted-spinner-size:\s*var\(--_icon-size\)/);
  assert.equal(contract.stylesheet, 'spinner/spinner.css');
});

test('exercises the identifier and the size token in the harness fragment', () => {
  assert.match(fragment, /data-ui="spinner"/);
  assert.match(fragment, /--slotted-spinner-size/);
});
