import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

/**
 * The mark has no contract of its own: it is declared by the family that
 * renders it, as the shared identifier its `match` part wears and the sheet
 * that draws it, the way `spinner` is declared by `button` (R6/CB6).
 */
const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/combobox/contract.json', import.meta.url),
    'utf8',
  ),
).mark;
/** The package's source root, one level up: every family is a sibling. */
const source = new URL('..', import.meta.url).pathname;
const css = readFileSync(new URL('./highlight.css', import.meta.url), 'utf8');
const fragment = readFileSync(new URL('./highlight.harness.html', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
const normalized = declarations
  .replace(/\s+/g, ' ')
  .replace(/\s*([{};,:])\s*/g, '$1')
  .replace(/\(\s+/g, '(')
  .replace(/\s+\)/g, ')');
const ui = `[data-ui='${contract.ui}']`;

function rule(selector) {
  return normalized.split(`${selector}{`)[1]?.split('}')[0] ?? '';
}

test('lives in the component layer', () => {
  assert.match(css, /@layer slotted\.components/);
});

test('is the sheet the contract names, under the identifier it names', () => {
  assert.equal(contract.ui, 'highlight');
  assert.equal(contract.part, 'match');
  assert.equal(contract.stylesheet, 'highlight/highlight.css');
  assert.match(css, new RegExp(`\\[data-ui='${contract.ui}'\\]`));
  assert.match(fragment, new RegExp(`data-ui="${contract.ui}"`));
  assert.match(fragment, new RegExp(`data-part="${contract.part}"`));
});

/**
 * The criterion CB6 states: the width of a label with the mark and without it
 * differ by zero. Everything that could move the metric of a word is either
 * inherited from the line the word is on or set to nothing, so the only thing
 * the mark changes is colour.
 */
test('changes no metric of the word it marks', () => {
  const mark = rule(ui);
  assert.match(mark, /font-weight:inherit/);
  assert.match(mark, /letter-spacing:inherit/);
  assert.match(mark, /padding:0/);
  assert.match(mark, /border-radius:var\(--slotted-radius-none,0px\)/);
  assert.doesNotMatch(mark, /padding-(inline|block)/);
  assert.doesNotMatch(mark, /font-size/);
  assert.doesNotMatch(mark, /(?<![\w-])margin/);
});

test('carries the mark on colour, with a rule of the accent under it', () => {
  const mark = rule(ui);
  assert.match(
    mark,
    /background-color:var\(--slotted-highlight-background,color-mix\(in oklab,var\(--slotted-tone-accent-text\) calc\(var\(--slotted-highlight-tint-opacity,0\.075\) \* 100%\),transparent\)\)/,
  );
  assert.match(mark, /color:var\(--slotted-highlight-color,var\(--slotted-tone-accent-text\)\)/);
  assert.match(mark, /text-decoration-line:underline/);
  assert.match(
    mark,
    /text-decoration-color:var\(--slotted-highlight-rule-color,var\(--slotted-tone-accent-border\)\)/,
  );
  assert.match(mark, /text-decoration-thickness:var\(--slotted-border-width-thin,1px\)/);
  assert.match(mark, /text-underline-offset:var\(--slotted-space-1,0\.125rem\)/);
});

/**
 * The band is mixed from the tone's `text` role, not taken from its `surface`
 * role. A `*-surface` tone is a ground: `accent-surface` measured 1.220 |
 * 1.014 | 1.000:1 against the panel in the three schemes, so the band existed
 * in one of them (CB10). What the mix is worth is measured against the theme
 * in `packages/themes/default/test/default-theme.test.mjs`; what is held here
 * is that the sheet reaches for the tone that every scheme keeps legible.
 */
test('mixes the band from the tone that every scheme keeps legible', () => {
  const mark = rule(ui);
  assert.match(mark, /color-mix\(in oklab,var\(--slotted-tone-accent-text\)/);
  assert.doesNotMatch(mark, /--slotted-tone-accent-surface/);
  assert.doesNotMatch(css, /--slotted-tone-accent-surface/);
});

/** A run that wraps is two boxes, and each of them is marked. */
test('marks both halves of a run that wraps', () => {
  assert.match(rule(ui), /box-decoration-break:clone/);
  assert.match(rule(ui), /-webkit-box-decoration-break:clone/);
  assert.match(fragment, /data-scene="wrapping"/);
});

/** A disabled row keeps the rule and gives up the tone. */
test('steps the mark down inside a row that answers nothing', () => {
  const disabled = rule(`[data-disabled] ${ui}`);
  assert.match(
    disabled,
    /background-color:var\(--slotted-highlight-disabled-background,transparent\)/,
  );
  assert.match(disabled, /color:inherit/);
  assert.doesNotMatch(disabled, /text-decoration/);
});

test('names the system pair forced colours would collapse', () => {
  const forced = declarations.slice(declarations.indexOf('@media (forced-colors: active)'));
  assert.match(forced, /background-color:\s*Mark/);
  assert.match(forced, /color:\s*MarkText/);
  assert.match(forced, /forced-color-adjust:\s*none/);
});

/**
 * The paint lives once. A family that drew the mark itself is a family whose
 * answer can drift from the other three, which is the whole of R6: the extract
 * is only done when no family sheet paints the part any more.
 */
test('leaves no family painting the mark on its own', () => {
  const offenders = [];
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'highlight') continue;
    for (const file of readdirSync(join(source, entry.name))) {
      if (!file.endsWith('.css')) continue;
      const other = readFileSync(join(source, entry.name, file), 'utf8').replace(
        /\/\*[\s\S]*?\*\//g,
        '',
      );
      if (/\[data-part=['"]match['"]\]\s*(?:,[^{]*)?\{/.test(other)) {
        offenders.push(`${entry.name}/${file}`);
      }
    }
  }
  assert.deepEqual(offenders, [], `${offenders.join(', ')} paints the mark instead of reading it`);
});
