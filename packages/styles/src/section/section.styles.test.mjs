import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/section/contract.json', import.meta.url),
    'utf8',
  ),
);
const css = readFileSync(new URL('./section.css', import.meta.url), 'utf8');
const fragment = readFileSync(new URL('./section.harness.html', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
const normalized = declarations
  .replace(/\s+/g, ' ')
  .replace(/\s*([{};,:>])\s*/g, '$1')
  .replace(/\(\s+/g, '(')
  .replace(/\s+\)/g, ')');

const ui = `[data-ui='${contract.ui}']`;
const member = contract.members.section;

function rule(selector) {
  return normalized.split(`${selector}{`)[1]?.split('}')[0] ?? '';
}

test('lives in the component layer', () => {
  assert.match(css, /@layer slotted\.components/);
});

test('is selected by the identifier the contract declares', () => {
  assert.ok(normalized.includes(`${ui}{`), 'the family has no base rule keyed on data-ui');
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
  assert.match(
    fragment,
    /data-part="body">[\s\S]*<section\s+data-ui="section"/,
    'no scene nests a section',
  );
});

/**
 * A section holds sections, and the families inside it have a `header`, an
 * `actions` and a `description` of their own, so every rule reaches its part
 * with a child combinator.
 */
test('reaches its own parts with a child combinator, never a descendant one', () => {
  for (const part of member.parts) {
    if (part === 'root') continue;
    const descendant = new RegExp(`\\[data-ui='section'\\][^{]*? \\[data-part='${part}'\\]`);
    assert.ok(!descendant.test(normalized), `a descendant rule reaches ${part}`);
  }
});

/** The hooks anchor navigation needs. */
test('lands a hash link under the page chrome', () => {
  assert.match(rule(ui), /scroll-margin-block-start:var\(--slotted-page-sticky-top,0px\)/);
});

test('sticks its header under the page chrome and paints it', () => {
  const header = rule(`${ui}[data-sticky]>[data-part='header']`);
  assert.match(header, /position:sticky/);
  assert.match(header, /inset-block-start:var\(--slotted-page-sticky-top,0px\)/);
  assert.match(header, /background-color:var\(--_ground\)/);
  assert.match(rule(ui), /--_ground:var\(--slotted-page-ground,var\(--slotted-surface,Canvas\)\)/);
});

/** A surface, not a card. */
test('paints a surface with no shadow and no interaction', () => {
  const surface = rule(`${ui}[data-ground='surface']`);
  assert.match(surface, /background-color:var\(--_ground\)/);
  assert.match(surface, /border-radius:var\(--slotted-section-radius/);
  assert.doesNotMatch(surface, /box-shadow/);
  assert.doesNotMatch(normalized, /:hover/);
});

test('rules under the header when asked', () => {
  const divided = rule(`${ui}[data-divider]>[data-part='header']`);
  assert.match(
    divided,
    /border-block-end:var\(--slotted-border-width-thin,1px\) solid var\(--_rule\)/,
  );
});

test('sizes the heading on the type scale, independent of its rank', () => {
  assert.match(rule(ui), /--slotted-section-heading-size-md,var\(--slotted-font-size-lg/);
  assert.match(
    rule(`${ui}[data-size='sm']`),
    /--slotted-section-heading-size-sm,var\(--slotted-font-size-md/,
  );
  assert.match(
    rule(`${ui}[data-size='lg']`),
    /--slotted-section-heading-size-lg,var\(--slotted-font-size-xl/,
  );
  assert.match(fragment, /<h4 data-part="heading"/, 'no scene shows a deeper rank');
});

/**
 * A sticky header is chrome for what is under it: the body republishes where
 * the chrome ends, page plus header, and re-bridges the table's offset, so a
 * column header inside stops under the section's header and not under the
 * page's. Layers add up.
 */
test('republishes the sticky top for what is under a sticky header', () => {
  assert.match(rule(`${ui}[data-sticky]`), /--_above:var\(--slotted-page-sticky-top,0px\)/);
  const body = rule(`${ui}[data-sticky]>[data-part='body']`);
  assert.match(
    body,
    /--slotted-page-sticky-top:calc\(var\(--_above\) \+ var\(--slotted-section-header-size,0px\)\)/,
  );
  assert.match(body, /--slotted-table-sticky-offset:var\(--slotted-page-sticky-top\)/);
});

/** Stuck, the header keeps air under the chrome; at rest the margin takes it back. */
test('gives a stuck header air under the chrome without moving it at rest', () => {
  const header = rule(`${ui}[data-sticky]>[data-part='header']`);
  assert.match(header, /padding-block-start:var\(--slotted-space-4,0\.5rem\)/);
  assert.match(header, /margin-block-start:calc\(-1 \* var\(--slotted-space-4,0\.5rem\)\)/);
});
