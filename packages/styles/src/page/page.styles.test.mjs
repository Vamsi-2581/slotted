import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(
  readFileSync(new URL('../../../../specs/components/page/contract.json', import.meta.url), 'utf8'),
);
const css = readFileSync(new URL('./page.css', import.meta.url), 'utf8');
const fragment = readFileSync(new URL('./page.harness.html', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
const normalized = declarations
  .replace(/\s+/g, ' ')
  .replace(/\s*([{};,:>])\s*/g, '$1')
  .replace(/\(\s+/g, '(')
  .replace(/\s+\)/g, ')');

const ui = `[data-ui='${contract.ui}']`;
const member = contract.members.page;

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
  assert.match(fragment, /data-ui="page-header"/, 'no scene holds the header the page exists for');
});

/** The two answers to who scrolls, and what each does to the footer. */
test('grows under an ancestor scroller and scrolls itself under self', () => {
  assert.match(rule(ui), /min-block-size:100%/);
  const self = rule(`${ui}[data-scroll='self']`);
  assert.match(self, /block-size:100%/);
  const scroller = rule(`${ui}[data-scroll='self']>[data-part='scroll']`);
  assert.match(scroller, /overflow:auto/);
  assert.match(scroller, /min-block-size:0/);
  assert.match(rule(`${ui}>[data-part='footer']`), /position:sticky/);
  assert.match(rule(`${ui}>[data-part='footer']`), /inset-block-end:0/);
  assert.match(rule(`${ui}[data-scroll='self']>[data-part='footer']`), /position:static/);
});

/** The bridge to table, and the ground a sticky section header reads. */
test('bridges its fixed geometry to table and states its ground for sections', () => {
  const root = rule(ui);
  for (const [tableToken, pageProperty] of Object.entries(contract.bridge)) {
    assert.match(
      root,
      new RegExp(`${tableToken}:var\\(${pageProperty},0px\\)`),
      `${tableToken} is not bridged`,
    );
  }
  assert.match(root, /--slotted-page-ground:var\(--_ground\)/);
});

test('fills when asked', () => {
  const body = rule(`${ui}[data-fill]>[data-part='scroll']>[data-part='body']`);
  assert.match(body, /display:flex/);
  assert.match(body, /min-block-size:0/);
  assert.match(rule(`${ui}[data-fill]>[data-part='scroll']>[data-part='body']>*`), /flex:1 1 auto/);
});

test('paints the two grounds the contract names', () => {
  assert.match(rule(ui), /--slotted-page-background-sunken,var\(--slotted-surface-sunken/);
  assert.match(
    rule(`${ui}[data-ground='surface']`),
    /--slotted-page-background-surface,var\(--slotted-surface,/,
  );
});

/** The footer enters from below and leaves the same way, on presence's word. */
test('moves the footer on the presence status', () => {
  const moving = rule(
    `${ui}>[data-part='footer'][data-status='entering'],${ui}>[data-part='footer'][data-status='exiting']`,
  );
  assert.match(moving, /translate:0 100%/);
  assert.match(rule(`${ui}>[data-part='footer']`), /transition:translate var\(--_duration\)/);
});

test('lays the footer actions out as one wrapping row aligned to the end', () => {
  const actions = rule(`${ui}>[data-part='footer']>*>[data-part='actions']`);
  assert.match(actions, /display:flex/);
  assert.match(actions, /justify-content:flex-end/);
  assert.match(actions, /flex-wrap:wrap/);
});

test('has no header part', () => {
  assert.ok(!normalized.includes("[data-part='header']"), 'a header part is styled');
});

/** The header's chrome changes height as it snaps; anchoring would turn that into a scroll. */
test('lets nothing under the scroll part anchor the scroll', () => {
  assert.match(rule(`${ui}>[data-part='scroll']`), /overflow-anchor:none/);
});
