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
 * The arc is a glyph the theme generates from Lucide (R4), masked over
 * `currentColor`, so the ring takes the ink its host is writing with and no
 * sheet draws a circle by hand. The border-with-one-transparent-side ring it
 * replaces had square ends and a stroke that was a fraction of its diameter.
 */
test('draws the arc from the theme glyph over the ink around it', () => {
  const base = rule(ui);
  assert.ok(base.includes(`mask-image:var(${contract.glyph})`), 'the arc is not the glyph');
  assert.ok(base.includes('mask-size:contain'));
  assert.ok(base.includes('background-color:currentColor'));
  assert.doesNotMatch(declarations, /border-radius|border-inline-end-color/);
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

test('turns once per loop step, linear, and stops under reduced motion', () => {
  assert.ok(
    rule(ui).includes(
      'animation:slotted-spinner-turn var(--slotted-duration-loop) linear infinite',
    ),
  );
  assert.match(css, /@keyframes slotted-spinner-turn/);
  assert.ok(
    normalized.includes(`@media (prefers-reduced-motion:reduce){${ui}{animation:none;}}`),
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
